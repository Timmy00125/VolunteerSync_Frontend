import { Injectable, computed, inject, signal } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { ApolloError } from '@apollo/client/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

// Models
import {
  Registration,
  RegistrationStatus,
  RegistrationFilter,
  RegistrationSummary,
  RegisterForEventInput,
  BulkRegistrationInput,
  AttendanceInput,
  ApprovalDecisionInput,
  RegistrationStats,
  AttendanceRecord,
  RegistrationConflict,
} from '../../shared/models/registration.model';
import { Event } from '../../shared/models/event.model';
import { User } from '../../shared/models/user.model';

// GraphQL Operations
import {
  GET_USER_REGISTRATIONS,
  GET_EVENT_REGISTRATIONS,
  GET_REGISTRATION,
  GET_REGISTRATION_SUMMARY,
  GET_REGISTRATION_STATS,
  CHECK_REGISTRATION_CONFLICTS,
} from '../../graphql/queries/registration.queries';

import {
  REGISTER_FOR_EVENT,
  CANCEL_REGISTRATION,
  UPDATE_REGISTRATION_STATUS,
  BULK_UPDATE_REGISTRATIONS,
  APPROVE_REGISTRATION,
  UPDATE_ATTENDANCE,
} from '../../graphql/mutations/registration.mutations';

// Services
import { AuthService } from '../../auth/services/auth';

export interface BulkUpdateResult {
  successCount: number;
  failureCount: number;
  results: Array<{
    registrationId: string;
    success: boolean;
    error?: string;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  private apollo = inject(Apollo);
  private authService = inject(AuthService);

  // Signal-based state management
  private isLoadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private userRegistrationsSignal = signal<Registration[]>([]);
  private registrationSummarySignal = signal<RegistrationSummary | null>(null);

  // Computed signals
  readonly isLoading = computed(() => this.isLoadingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly userRegistrations = computed(() => this.userRegistrationsSignal());
  readonly registrationSummary = computed(() => this.registrationSummarySignal());

  // Cache management
  private registrationsCache = new Map<string, Registration>();
  private eventRegistrationsCache = new Map<string, Registration[]>();

  /**
   * Set loading state
   */
  private setLoading(loading: boolean): void {
    this.isLoadingSignal.set(loading);
  }

  /**
   * Set error state
   */
  private setError(error: string | null): void {
    this.errorSignal.set(error);
  }

  /**
   * Update user registrations
   */
  private setUserRegistrations(registrations: Registration[]): void {
    this.userRegistrationsSignal.set(registrations);
    // Update cache
    registrations.forEach((reg) => this.registrationsCache.set(reg.id, reg));
  }

  /**
   * Extract error message from GraphQL error
   */
  private extractErrorMessage(error: ApolloError): string {
    if (error?.graphQLErrors?.length > 0) {
      return error.graphQLErrors[0].message;
    }
    if (error?.networkError?.message) {
      return error.networkError.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }

  /**
   * Register for an event
   */
  registerForEvent(eventId: string, input?: RegisterForEventInput): Observable<Registration> {
    this.setLoading(true);
    this.setError(null);

    return this.apollo
      .mutate<{ registerForEvent: Registration }>({
        mutation: REGISTER_FOR_EVENT,
        variables: { eventId, input },
        update: (cache, { data }) => {
          if (data?.registerForEvent) {
            this.updateCacheAfterRegistration(eventId, data.registerForEvent);
          }
        },
      })
      .pipe(
        map((result) => {
          if (result.data?.registerForEvent) {
            this.registrationsCache.set(
              result.data.registerForEvent.id,
              result.data.registerForEvent
            );
            return result.data.registerForEvent;
          }
          throw new Error('Registration failed');
        }),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          return throwError(() => error);
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Cancel registration
   */
  cancelRegistration(registrationId: string, reason?: string): Observable<boolean> {
    this.setLoading(true);
    this.setError(null);

    return this.apollo
      .mutate<{ cancelRegistration: { success: boolean; message: string } }>({
        mutation: CANCEL_REGISTRATION,
        variables: { registrationId, reason },
      })
      .pipe(
        map((result) => {
          if (result.data?.cancelRegistration) {
            // Remove from cache
            this.registrationsCache.delete(registrationId);
            // Refresh user registrations
            this.refreshUserRegistrations();
            return result.data.cancelRegistration.success;
          }
          throw new Error('Cancellation failed');
        }),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          return throwError(() => error);
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Update registration status
   */
  updateRegistrationStatus(
    registrationId: string,
    status: RegistrationStatus,
    notes?: string
  ): Observable<Registration> {
    this.setLoading(true);
    this.setError(null);

    return this.apollo
      .mutate<{ updateRegistrationStatus: Registration }>({
        mutation: UPDATE_REGISTRATION_STATUS,
        variables: { registrationId, status, notes },
      })
      .pipe(
        map((result) => {
          if (result.data?.updateRegistrationStatus) {
            this.registrationsCache.set(
              result.data.updateRegistrationStatus.id,
              result.data.updateRegistrationStatus
            );
            return result.data.updateRegistrationStatus;
          }
          throw new Error('Status update failed');
        }),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          return throwError(() => error);
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Get user registrations
   */
  getUserRegistrations(userId?: string, filter?: RegistrationFilter): Observable<Registration[]> {
    this.setLoading(true);
    this.setError(null);

    return this.apollo
      .watchQuery<{ userRegistrations: Registration[] }>({
        query: GET_USER_REGISTRATIONS,
        variables: { userId, filter },
        fetchPolicy: 'cache-first',
      })
      .valueChanges.pipe(
        map((result) => {
          if (result.data?.userRegistrations) {
            this.setUserRegistrations(result.data.userRegistrations);
            return result.data.userRegistrations;
          }
          return [];
        }),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          return throwError(() => error);
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Get event registrations
   */
  getEventRegistrations(eventId: string): Observable<Registration[]> {
    return this.apollo
      .watchQuery<{ eventRegistrations: Registration[] }>({
        query: GET_EVENT_REGISTRATIONS,
        variables: { eventId },
        fetchPolicy: 'cache-first',
      })
      .valueChanges.pipe(
        map((result) => {
          if (result.data?.eventRegistrations) {
            this.eventRegistrationsCache.set(eventId, result.data.eventRegistrations);
            return result.data.eventRegistrations;
          }
          return [];
        }),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          return throwError(() => error);
        })
      );
  }

  /**
   * Get registration by ID
   */
  getRegistrationById(registrationId: string): Observable<Registration> {
    // Check cache first
    const cached = this.registrationsCache.get(registrationId);
    if (cached) {
      return new Observable((observer) => {
        observer.next(cached);
        observer.complete();
      });
    }

    return this.apollo
      .watchQuery<{ registration: Registration }>({
        query: GET_REGISTRATION,
        variables: { registrationId },
      })
      .valueChanges.pipe(
        map((result) => {
          if (result.data?.registration) {
            this.registrationsCache.set(result.data.registration.id, result.data.registration);
            return result.data.registration;
          }
          throw new Error('Registration not found');
        }),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          return throwError(() => error);
        })
      );
  }

  /**
   * Get registration summary
   */
  getRegistrationSummary(userId?: string): Observable<RegistrationSummary> {
    return this.apollo
      .watchQuery<{ registrationSummary: RegistrationSummary }>({
        query: GET_REGISTRATION_SUMMARY,
        variables: { userId },
        fetchPolicy: 'cache-first',
      })
      .valueChanges.pipe(
        map((result) => {
          if (result.data?.registrationSummary) {
            this.registrationSummarySignal.set(result.data.registrationSummary);
            return result.data.registrationSummary;
          }
          throw new Error('Could not load registration summary');
        }),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          return throwError(() => error);
        })
      );
  }

  /**
   * Bulk update registrations
   */
  bulkUpdateRegistrations(
    registrationIds: string[],
    status: RegistrationStatus
  ): Observable<BulkUpdateResult> {
    this.setLoading(true);
    this.setError(null);

    return this.apollo
      .mutate<{ bulkUpdateRegistrations: BulkUpdateResult }>({
        mutation: BULK_UPDATE_REGISTRATIONS,
        variables: { registrationIds, status },
      })
      .pipe(
        map((result) => {
          if (result.data?.bulkUpdateRegistrations) {
            // Refresh cache
            this.refreshUserRegistrations();
            return result.data.bulkUpdateRegistrations;
          }
          throw new Error('Bulk update failed');
        }),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          return throwError(() => error);
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Check if user can register for event
   */
  canUserRegister(event: Event): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return false;

    // Check if event is active and accepting registrations
    if (!event || event.status !== 'PUBLISHED') return false;

    // Check if registration deadline has passed
    if (
      event.registrationSettings.closesAt &&
      new Date(event.registrationSettings.closesAt) < new Date()
    ) {
      return false;
    }

    // Check if user is already registered
    return !this.isUserRegistered(event);
  }

  /**
   * Check if user is registered for event
   */
  isUserRegistered(event: Event): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return false;

    const userRegs = this.userRegistrations();
    return userRegs.some(
      (reg) => reg.event.id === event.id && reg.status !== RegistrationStatus.CANCELLED
    );
  }

  /**
   * Get user's registration for specific event
   */
  getUserRegistrationForEvent(event: Event): Registration | null {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return null;

    const userRegs = this.userRegistrations();
    return (
      userRegs.find(
        (reg) => reg.event.id === event.id && reg.status !== RegistrationStatus.CANCELLED
      ) || null
    );
  }

  /**
   * Refresh user registrations
   */
  private refreshUserRegistrations(): void {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.getUserRegistrations(currentUser.id).subscribe();
    }
  }

  /**
   * Update cache after registration
   */
  private updateCacheAfterRegistration(eventId: string, registration: Registration): void {
    // Add to user registrations
    const currentRegs = this.userRegistrations();
    this.setUserRegistrations([...currentRegs, registration]);

    // Update event registrations cache if it exists
    const eventRegs = this.eventRegistrationsCache.get(eventId);
    if (eventRegs) {
      this.eventRegistrationsCache.set(eventId, [...eventRegs, registration]);
    }
  }

  /**
   * Handle registration errors
   */
  private handleRegistrationError(error: any): void {
    console.error('Registration Service Error:', error);
    this.setError(this.extractErrorMessage(error));
  }
}
