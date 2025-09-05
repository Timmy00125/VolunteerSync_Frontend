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
  REQUEST_PASSWORD_RESET_MUTATION,
} from '../../graphql/mutations/auth.mutations';
import { GET_CURRENT_USER } from '../../graphql/queries/auth.queries';

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
        variables: credentials,
      })
      .pipe(
        map((result) => {
          if (result.data?.login) {
            return result.data.login;
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
        map((result) => {
          if (result.data?.register) {
            return result.data.register;
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
   * Logout user
   */
  logout(): Observable<boolean> {
    this.setLoading(true);

    return this.apollo
      .mutate({
        mutation: LOGOUT_MUTATION,
      })
      .pipe(
        tap(() => {
          this.clearAuthState();
          this.router.navigate(['/auth/login']);
        }),
        map(() => true),
        catchError((error) => {
          console.error('Logout error:', error);
          // Clear local state even if server logout fails
          this.clearAuthState();
          this.router.navigate(['/auth/login']);
          return of(true);
        }),
        tap(() => this.setLoading(false))
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
        variables: { refreshToken },
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
  requestPasswordReset(email: string): Observable<boolean> {
    this.setLoading(true);
    this.setError(null);

    return this.apollo
      .mutate<{ requestPasswordReset: { success: boolean } }>({
        mutation: REQUEST_PASSWORD_RESET_MUTATION,
        variables: { email },
      })
      .pipe(
        map((result) => result.data?.requestPasswordReset?.success || false),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          this.setLoading(false);
          return throwError(() => error);
        }),
        tap(() => this.setLoading(false))
      );
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
      return 'Network error occurred. Please try again.';
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
