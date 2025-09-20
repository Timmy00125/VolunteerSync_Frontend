import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

// Services
import { RegistrationService } from './registration';
import { AuthService } from '../../auth/services/auth';

// Models
import { Registration, RegistrationStatus } from '../../shared/models/registration.model';
import { Event } from '../../shared/models/event.model';
import { User } from '../../shared/models/user.model';

export interface RegistrationDialogData {
  registration: Registration;
  canCancel: boolean;
  event: Event;
}

export interface CancellationDialogData {
  registration: Registration;
  event: Event;
}

export interface RegistrationFormData {
  notes: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  dietaryRestrictions?: string;
  accessibilityNeeds?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RegistrationUiService {
  private registrationService = inject(RegistrationService);
  private authService = inject(AuthService);

  // UI state signals
  private showRegistrationDialogSignal = signal<boolean>(false);
  private showCancellationDialogSignal = signal<boolean>(false);
  private selectedRegistrationSignal = signal<Registration | null>(null);
  private registrationFormDataSignal = signal<RegistrationFormData | null>(null);

  // Computed signals for UI state
  readonly showRegistrationDialog = computed(() => this.showRegistrationDialogSignal());
  readonly showCancellationDialog = computed(() => this.showCancellationDialogSignal());
  readonly selectedRegistration = computed(() => this.selectedRegistrationSignal());
  readonly registrationFormData = computed(() => this.registrationFormDataSignal());

  // Private subjects for dialog state management
  private registrationDialogDataSubject = new BehaviorSubject<RegistrationDialogData | null>(null);
  private cancellationDialogDataSubject = new BehaviorSubject<CancellationDialogData | null>(null);

  /**
   * Get registration dialog data observable
   */
  getRegistrationDialogData(): Observable<RegistrationDialogData | null> {
    return this.registrationDialogDataSubject.asObservable();
  }

  /**
   * Get cancellation dialog data observable
   */
  getCancellationDialogData(): Observable<CancellationDialogData | null> {
    return this.cancellationDialogDataSubject.asObservable();
  }

  /**
   * Open registration dialog
   */
  openRegistrationDialog(registration: Registration, event: Event): void {
    const dialogData: RegistrationDialogData = {
      registration,
      canCancel: registration.canCancel,
      event,
    };

    this.selectedRegistrationSignal.set(registration);
    this.showRegistrationDialogSignal.set(true);
    this.registrationDialogDataSubject.next(dialogData);
  }

  /**
   * Close registration dialog
   */
  closeRegistrationDialog(): void {
    this.showRegistrationDialogSignal.set(false);
    this.selectedRegistrationSignal.set(null);
    this.registrationDialogDataSubject.next(null);
  }

  /**
   * Open cancellation dialog
   */
  openCancellationDialog(registration: Registration, event: Event): void {
    const dialogData: CancellationDialogData = {
      registration,
      event,
    };

    this.selectedRegistrationSignal.set(registration);
    this.showCancellationDialogSignal.set(true);
    this.cancellationDialogDataSubject.next(dialogData);
  }

  /**
   * Close cancellation dialog
   */
  closeCancellationDialog(): void {
    this.showCancellationDialogSignal.set(false);
    this.selectedRegistrationSignal.set(null);
    this.cancellationDialogDataSubject.next(null);
  }

  /**
   * Set registration form data
   */
  setRegistrationFormData(data: RegistrationFormData): void {
    this.registrationFormDataSignal.set(data);
  }

  /**
   * Clear registration form data
   */
  clearRegistrationFormData(): void {
    this.registrationFormDataSignal.set(null);
  }

  /**
   * Check if user can register for event
   */
  canUserRegisterForEvent(
    event: Event,
    currentUser: User | null,
    userRegistration: Registration | null
  ): boolean {
    if (!currentUser || userRegistration) {
      return false;
    }

    const now = new Date();
    const eventStart = new Date(event.startTime);

    return (
      event.status === 'PUBLISHED' &&
      event.currentRegistrations < event.capacity.maximum &&
      eventStart > now
    );
  }

  /**
   * Get registration status display data
   */
  getRegistrationStatusDisplay(status: RegistrationStatus): {
    label: string;
    color: string;
    icon: string;
  } {
    switch (status) {
      case RegistrationStatus.CONFIRMED:
        return {
          label: 'Confirmed',
          color: 'text-green-600 bg-green-100',
          icon: 'check-circle',
        };
      case RegistrationStatus.CANCELLED:
        return {
          label: 'Cancelled',
          color: 'text-red-600 bg-red-100',
          icon: 'x-circle',
        };
      case RegistrationStatus.COMPLETED:
        return {
          label: 'Completed',
          color: 'text-blue-600 bg-blue-100',
          icon: 'check-badge',
        };
      case RegistrationStatus.NO_SHOW:
        return {
          label: 'No Show',
          color: 'text-yellow-600 bg-yellow-100',
          icon: 'exclamation-triangle',
        };
      case RegistrationStatus.WAITLISTED:
        return {
          label: 'Waitlisted',
          color: 'text-purple-600 bg-purple-100',
          icon: 'clock',
        };
      case RegistrationStatus.PENDING_APPROVAL:
        return {
          label: 'Pending Approval',
          color: 'text-orange-600 bg-orange-100',
          icon: 'clock',
        };
      case RegistrationStatus.DECLINED:
        return {
          label: 'Declined',
          color: 'text-red-600 bg-red-100',
          icon: 'x-circle',
        };
      default:
        return {
          label: 'Unknown',
          color: 'text-gray-600 bg-gray-100',
          icon: 'question-mark-circle',
        };
    }
  }

  /**
   * Format registration date for display
   */
  formatRegistrationDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  }

  /**
   * Get upcoming registrations for user
   */
  getUpcomingRegistrations(userId: string): Observable<Registration[]> {
    return this.registrationService.getUserRegistrations(userId).pipe(
      map((registrations) => {
        const now = new Date();
        return registrations.filter(
          (reg) =>
            reg.status === RegistrationStatus.CONFIRMED && new Date(reg.event.startTime) > now
        );
      })
    );
  }

  /**
   * Get registration history for user
   */
  getRegistrationHistory(userId: string): Observable<Registration[]> {
    return this.registrationService.getUserRegistrations(userId).pipe(
      map((registrations) => {
        const now = new Date();
        return registrations
          .filter((reg) => new Date(reg.event.startTime) <= now)
          .sort(
            (a, b) => new Date(b.event.startTime).getTime() - new Date(a.event.startTime).getTime()
          );
      })
    );
  }
}
