import { Component, inject, signal, computed, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil, switchMap } from 'rxjs';

// Services
import { EventService } from '../services/event';
import { EventUiService } from '../services/event-ui';
import { AuthService } from '../../auth/services/auth';
import { RegistrationService } from '../../registration/services/registration';
import { RegistrationUiService } from '../../registration/services/registration-ui';

// Models
import { Event } from '../../shared/models/event.model';
import { User } from '../../shared/models/user.model';
import {
  RegisterForEventInput,
  Registration,
  RegistrationStatus,
} from '../../shared/models/registration.model';

// Components
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-event-registration',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    LoadingSpinnerComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './event-registration.html',
  styleUrl: './event-registration.css',
})
export class EventRegistrationComponent implements OnInit, OnDestroy {
  // Input properties
  @Input() event!: Event;
  @Input() showAsButton = true;
  @Input() showCapacity = true;

  private eventService = inject(EventService);
  public eventUiService = inject(EventUiService);
  private authService = inject(AuthService);
  private registrationService = inject(RegistrationService);
  private registrationUiService = inject(RegistrationUiService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  // State signals
  eventSignal = signal<Event | null>(null);
  currentUser = signal<User | null>(null);
  userRegistration = signal<Registration | null>(null);
  loading = signal(true);
  submitting = signal(false);
  registering = signal(false);

  // Dialog state
  showConfirmDialog = signal(false);
  showCancellationDialog = signal(false);
  confirmDialogData = signal<ConfirmDialogData>({
    title: '',
    message: '',
    type: 'info',
  });

  // Form
  registrationForm: FormGroup;

  // Computed values
  canRegister = computed(() => {
    const event = this.event || this.eventSignal();
    const user = this.currentUser();
    const registration = this.userRegistration();

    return this.registrationUiService.canUserRegisterForEvent(event, user, registration);
  });

  isRegistered = computed(() => {
    const registration = this.userRegistration();
    return (
      registration &&
      (registration.status === RegistrationStatus.CONFIRMED ||
        registration.status === RegistrationStatus.PENDING_APPROVAL)
    );
  });

  registrationStatus = computed(() => {
    return this.userRegistration()?.status || null;
  });

  canCancelRegistration = computed(() => {
    const registration = this.userRegistration();
    const event = this.event || this.eventSignal();

    if (!registration || !event) return false;

    return (
      registration.canCancel &&
      registration.status === RegistrationStatus.CONFIRMED &&
      new Date(event.startTime) > new Date()
    );
  });

  constructor() {
    this.registrationForm = this.createRegistrationForm();
  }

  ngOnInit(): void {
    this.currentUser.set(this.authService.currentUser());

    // If event is provided as input, use it
    if (this.event) {
      this.eventSignal.set(this.event);
      this.loadUserRegistration();
      this.loading.set(false);
    } else {
      // Otherwise load from route parameters
      const eventId = this.route.snapshot.paramMap.get('id');
      if (eventId) {
        this.loadEvent(eventId);
      } else {
        this.router.navigate(['/events']);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createRegistrationForm(): FormGroup {
    return this.fb.group({
      notes: ['', [Validators.maxLength(500)]],
      emergencyContact: this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(100)]],
        phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      }),
      dietaryRestrictions: ['', [Validators.maxLength(200)]],
      accessibilityNeeds: ['', [Validators.maxLength(200)]],
      agreedToTerms: [false, [Validators.requiredTrue]],
      agreedToWaiver: [false, [Validators.requiredTrue]],
    });
  }

  private loadEvent(eventId: string): void {
    this.loading.set(true);

    this.eventService
      .getEventById(eventId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (event) => {
          this.eventSignal.set(event);
          this.loadUserRegistration();
          this.loading.set(false);

          // Check if user can register
          if (!this.canRegister()) {
            this.eventUiService.setError('You cannot register for this event.');
            this.router.navigate(['/events', eventId]);
          }
        },
        error: (error) => {
          console.error('Error loading event:', error);
          this.eventUiService.setError('Failed to load event details.');
          this.router.navigate(['/events']);
        },
      });
  }

  private loadUserRegistration(): void {
    const event = this.event || this.eventSignal();

    if (event) {
      const registration = this.registrationService.getUserRegistrationForEvent(event);
      this.userRegistration.set(registration);
    }
  }

  onSubmit(): void {
    const event = this.event || this.eventSignal();
    if (this.registrationForm.valid && event) {
      this.showRegistrationConfirmation();
    } else {
      this.markFormGroupTouched(this.registrationForm);
      this.eventUiService.setError('Please fill in all required fields.');
    }
  }

  private showRegistrationConfirmation(): void {
    const event = this.event || this.eventSignal();
    if (!event) return;

    this.confirmDialogData.set({
      title: 'Confirm Registration',
      message: `Are you sure you want to register for "${event.title}"? ${
        event.registrationSettings.requiresApproval
          ? 'Your registration will need to be approved by the organizer.'
          : 'You will be registered immediately.'
      }`,
      confirmText: 'Register',
      cancelText: 'Cancel',
      type: 'info',
    });
    this.showConfirmDialog.set(true);
  }

  onConfirmRegistration(): void {
    this.showConfirmDialog.set(false);
    this.submitRegistration();
  }

  onCancelRegistration(): void {
    this.showConfirmDialog.set(false);
  }

  private submitRegistration(): void {
    const event = this.event || this.eventSignal();
    if (!event) return;

    const formValue = this.registrationForm.value;

    const registrationData: RegisterForEventInput = {
      eventId: event.id,
      personalMessage: formValue.notes || undefined,
      emergencyContact: {
        name: formValue.emergencyContact.name,
        phone: formValue.emergencyContact.phone,
      },
      dietaryRestrictions: formValue.dietaryRestrictions || undefined,
      accessibilityNeeds: formValue.accessibilityNeeds || undefined,
    };

    this.submitting.set(true);

    this.registrationService
      .registerForEvent(event.id, registrationData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (registration) => {
          this.userRegistration.set(registration);
          this.eventUiService.setSuccess(
            event.registrationSettings.requiresApproval
              ? 'Registration submitted successfully! You will be notified when it is reviewed.'
              : 'Registration successful! Check your email for confirmation details.'
          );
          // Navigate back to event details
          this.router.navigate(['/events', event.id]);
          this.submitting.set(false);
        },
        error: (error) => {
          console.error('Error registering for event:', error);
          this.eventUiService.setError('Failed to register for event. Please try again.');
          this.submitting.set(false);
        },
      });
  }

  onCancel(): void {
    const event = this.event || this.eventSignal();
    this.router.navigate(['/events', event?.id || '']);
  }

  // Cancellation methods
  private showCancellationConfirmation(): void {
    const registration = this.userRegistration();
    const event = this.event || this.eventSignal();

    if (!registration || !event) return;

    this.confirmDialogData.set({
      title: 'Cancel Registration',
      message: `Are you sure you want to cancel your registration for "${event.title}"? This action cannot be undone.`,
      confirmText: 'Cancel Registration',
      cancelText: 'Keep Registration',
      type: 'warning',
    });
    this.showCancellationDialog.set(true);
  }

  onConfirmCancellation(): void {
    this.showCancellationDialog.set(false);
    this.submitCancellation();
  }

  onCancelCancellation(): void {
    this.showCancellationDialog.set(false);
  }

  private submitCancellation(): void {
    const registration = this.userRegistration();
    if (!registration) return;

    this.submitting.set(true);

    this.registrationService
      .cancelRegistration(registration.id, 'User requested cancellation')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.userRegistration.set(null);
          this.eventUiService.setSuccess('Registration cancelled successfully.');
          this.submitting.set(false);
        },
        error: (error) => {
          console.error('Error cancelling registration:', error);
          this.eventUiService.setError('Failed to cancel registration. Please try again.');
          this.submitting.set(false);
        },
      });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      if (control) {
        control.markAsTouched();
        if (control instanceof FormGroup) {
          this.markFormGroupTouched(control);
        }
      }
    });
  }

  // Template helper methods
  getFieldError(fieldName: string): string | null {
    const field = this.registrationForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return `This field is required`;
      if (field.errors['requiredTrue']) return `You must agree to continue`;
      if (field.errors['maxlength'])
        return `Must be less than ${field.errors['maxlength'].requiredLength} characters`;
      if (field.errors['pattern']) return `Invalid format`;
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registrationForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
