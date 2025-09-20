import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RefreshTokenResponse,
  JwtPayload,
} from '../../shared/models/auth.model';
import { User } from '../../shared/models/user.model';

import {
  LOGIN_MUTATION,
  REGISTER_MUTATION,
  REFRESH_TOKEN_MUTATION,
  LOGOUT_MUTATION,
} from '../../graphql/mutations/auth.mutations';
import { GET_CURRENT_USER } from '../../graphql/queries/auth.queries';
import { gql } from 'apollo-angular';

// Lightweight health query for diagnostics
const HEALTH_QUERY = gql`
  query HealthCheck {
    health {
      status
      time
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apollo = inject(Apollo);
  private router = inject(Router);

  // Signal-based state management
  private userSignal = signal<User | null>(null);
  private isLoadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Computed signals
  readonly currentUser = computed(() => this.userSignal());
  readonly isAuthenticated = computed(() => !!this.userSignal());
  readonly isLoading = computed(() => this.isLoadingSignal());
  readonly error = computed(() => this.errorSignal());

  constructor() {
    this.initializeAuth();
  }

  /**
   * Initialize authentication state from stored tokens
   */
  private initializeAuth(): void {
    const token = this.getStoredToken();
    if (token && this.isTokenValid(token)) {
      this.loadCurrentUser().subscribe({
        next: (user) => {
          this.setUser(user);
        },
        error: (error) => {
          console.error('Failed to load user:', error);
          this.clearTokens();
        },
      });
    }
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.setLoading(true);
    this.setError(null);

    return this.apollo
      .mutate<{ login: AuthResponse }>({
        mutation: LOGIN_MUTATION,
        variables: { input: credentials },
      })
      .pipe(
        tap((result) => {
          // Debug logging to inspect raw mutation result
          // eslint-disable-next-line no-console
          console.debug('[AuthService] login result', result);
        }),
        map((result) => {
          if (result.data?.login) {
            return result.data.login;
          }
          if (result.errors && result.errors.length) {
            throw new Error(result.errors[0].message);
          }
          throw new Error('Login failed: No data received');
        }),
        tap((response) => {
          this.handleAuthResponse(response);
        }),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          this.setLoading(false);
          return throwError(() => error);
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Register new user
   */
  register(userData: RegisterRequest): Observable<AuthResponse> {
    this.setLoading(true);
    this.setError(null);

    return this.apollo
      .mutate<{ register: AuthResponse }>({
        mutation: REGISTER_MUTATION,
        variables: { input: userData },
      })
      .pipe(
        tap((result) => {
          // eslint-disable-next-line no-console
          console.debug('[AuthService] register result', result);
        }),
        map((result) => {
          if (result.data?.register) {
            return result.data.register;
          }
          if (result.errors && result.errors.length) {
            throw new Error(result.errors[0].message);
          }
          throw new Error('Registration failed: No data received');
        }),
        tap((response) => {
          this.handleAuthResponse(response);
        }),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          this.setLoading(false);
          return throwError(() => error);
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Check backend health (for diagnostics UI)
   */
  checkHealth(): Observable<string> {
    return this.apollo
      .query<{ health: { status: string } }>({ query: HEALTH_QUERY, fetchPolicy: 'no-cache' })
      .pipe(
        map((r) => r.data?.health?.status || 'UNKNOWN'),
        catchError((err) => {
          return of(this.extractErrorMessage(err));
        })
      );
  }

  /**
   * Logout user
   */
  logout(): Observable<boolean> {
    this.setLoading(true);

    // Clear local state immediately for better UX
    this.clearAuthState();

    return this.apollo
      .mutate({
        mutation: LOGOUT_MUTATION,
      })
      .pipe(
        tap(() => {
          // Server logout succeeded
          console.debug('Server logout completed successfully');
        }),
        map(() => true),
        catchError((error) => {
          // Server logout failed, but local state is already cleared
          console.warn('Server logout failed, but local state cleared:', error);
          // Don't show error to user for logout failures - local state is already cleared
          return of(true);
        }),
        tap(() => {
          this.setLoading(false);
          // Always navigate to login after logout attempt
          this.router.navigate(['/auth/login']);
        })
      );
  }

  /**
   * Refresh JWT token
   */
  refreshToken(): Observable<string> {
    const refreshToken = this.getStoredRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.apollo
      .mutate<{ refreshToken: RefreshTokenResponse }>({
        mutation: REFRESH_TOKEN_MUTATION,
        variables: { input: { refreshToken } },
      })
      .pipe(
        map((result) => {
          if (result.data?.refreshToken) {
            const { token, refreshToken: newRefreshToken } = result.data.refreshToken;
            this.storeTokens(token, newRefreshToken);
            return token;
          }
          throw new Error('Token refresh failed: No data received');
        }),
        catchError((error) => {
          console.error('Token refresh failed:', error);
          this.clearAuthState();
          this.router.navigate(['/auth/login']);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get current user from server
   */
  getCurrentUser(): Observable<User | null> {
    return this.apollo
      .query<{ me: User }>({
        query: GET_CURRENT_USER,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => result.data?.me || null),
        catchError((error) => {
          console.error('Failed to get current user:', error);
          return of(null);
        })
      );
  }

  /**
   * Request password reset
   */
  // Password reset mutations are not available in the current backend schema.
  // Implement later when backend supports it.
  requestPasswordReset(_email: string): Observable<boolean> {
    // Temporary stub: backend does not implement this yet.
    return of(false);
  }

  /**
   * Get stored auth token
   */
  getStoredToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  /**
   * Get stored refresh token
   */
  private getStoredRefreshToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  /**
   * Store authentication tokens
   */
  private storeTokens(token: string, refreshToken: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('authToken', token);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  /**
   * Clear stored tokens
   */
  private clearTokens(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    }
  }

  /**
   * Handle successful authentication response
   */
  private handleAuthResponse(response: AuthResponse): void {
    this.storeTokens(response.token, response.refreshToken);
    this.setUser(response.user);
  }

  /**
   * Clear authentication state
   */
  private clearAuthState(): void {
    this.clearTokens();
    this.setUser(null);
    // Clear Apollo cache
    this.apollo.client.clearStore();
  }

  /**
   * Load current user from server
   */
  private loadCurrentUser(): Observable<User> {
    return this.getCurrentUser().pipe(
      switchMap((user) => {
        if (user) {
          return of(user);
        }
        return throwError(() => new Error('User not found'));
      })
    );
  }

  /**
   * Check if JWT token is valid (not expired)
   */
  private isTokenValid(token: string): boolean {
    try {
      const payload = this.decodeJwtPayload(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  /**
   * Decode JWT payload
   */
  private decodeJwtPayload(token: string): JwtPayload {
    return jwtDecode<JwtPayload>(token);
  }

  /**
   * Extract error message from GraphQL error
   */
  private extractErrorMessage(error: any): string {
    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      return error.graphQLErrors[0].message;
    }
    if (error.networkError) {
      // Apollo networkError may contain statusCode, result, or a fetch error
      const ne: any = error.networkError;
      if (ne.status === 0 || /Failed to fetch|fetch failed|NetworkError/i.test(ne.message || '')) {
        return 'Auth service unreachable. Check server is running.';
      }
      if (ne.status === 404) return 'Auth service endpoint not found (404).';
      if (ne.status === 500) return 'Auth service internal error (500).';
      return 'Network error communicating with auth service.';
    }
    return error.message || 'An unexpected error occurred.';
  }

  /**
   * Update user signal
   */
  private setUser(user: User | null): void {
    this.userSignal.set(user);
  }

  /**
   * Update loading signal
   */
  private setLoading(loading: boolean): void {
    this.isLoadingSignal.set(loading);
  }

  /**
   * Update error signal
   */
  private setError(error: string | null): void {
    this.errorSignal.set(error);
  }
}
