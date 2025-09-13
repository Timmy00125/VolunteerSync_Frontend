import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Services
import { EventService } from '../services/event';
import { EventUiService } from '../services/event-ui';
import { AuthService } from '../../auth/services/auth';
import { EventErrorHandler } from '../services/event-error-handler';
import { Breakpoint } from '../../shared/services/breakpoint';

// Models
import {
  Event,
  EventStatus,
  CreateEventInput,
  UpdateEventInput,
  TimeCommitmentType,
  EventCategory,
} from '../../shared/models/event.model';
import { User } from '../../shared/models/user.model';

// Simple date range validator
function dateRangeValidator(startDateField: string, endDateField: string) {
  return (control: any) => {
    const startDate = control.get(startDateField)?.value;
    const endDate = control.get(endDateField)?.value;

    if (!startDate || !endDate) {
      return null;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return { dateRange: { message: 'End date must be after start date' } };
    }

    return null;
  };
}

@Component({
  selector: 'app-event-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './event-form.html',
  styleUrl: './event-form.css',
})
export class EventForm implements OnInit, OnDestroy {
  private eventService = inject(EventService);
  public eventUiService = inject(EventUiService);
  private authService = inject(AuthService);
  private eventErrorHandler = inject(EventErrorHandler);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private breakpointService = inject(Breakpoint);
  private destroy$ = new Subject<void>();

  // Form and state
  eventForm: FormGroup;
  isEditMode = signal(false);
  loading = signal(false);
  eventId = signal<string | null>(null);
  currentUser = signal<User | null>(null);

  // Available options
  categories = signal<EventCategory[]>(Object.values(EventCategory));
  timeCommitments = signal<TimeCommitmentType[]>(Object.values(TimeCommitmentType));

  // Responsive design computed properties
  isMobile = computed(() => this.breakpointService.isMobile());
  isTablet = computed(() => this.breakpointService.isTablet());
  isDesktop = computed(() => this.breakpointService.isDesktop());

  formColumns = computed(() => {
    return this.breakpointService.getResponsiveColumns({
      xs: 1,
      sm: 1,
      md: 2,
      lg: 2,
      xl: 2,
      '2xl': 2,
    });
  });

  constructor() {
    this.eventForm = this.createEventForm();
  }

  ngOnInit(): void {
    this.currentUser.set(this.authService.currentUser());

    // Check if we're in edit mode
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.eventId.set(eventId);
      this.isEditMode.set(true);
      this.loadEventForEdit(eventId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createEventForm(): FormGroup {
    return this.fb.group(
      {
        title: ['', [Validators.required, Validators.maxLength(100)]],
        description: ['', [Validators.required, Validators.maxLength(1000)]],
        shortDescription: ['', [Validators.maxLength(200)]],
        startTime: ['', Validators.required],
        endTime: ['', Validators.required],
        location: this.fb.group({
          name: ['', [Validators.required, Validators.maxLength(200)]],
          address: ['', [Validators.required, Validators.maxLength(300)]],
          city: ['', [Validators.required, Validators.maxLength(100)]],
          state: ['', Validators.maxLength(100)],
          country: ['USA', [Validators.required, Validators.maxLength(100)]],
          zipCode: ['', [Validators.pattern(/^\d{5}(-\d{4})?$/)]],
          isRemote: [false],
          instructions: ['', Validators.maxLength(500)],
        }),
        capacity: this.fb.group({
          minimum: [1, [Validators.required, Validators.min(1)]],
          maximum: [50, [Validators.required, Validators.min(1), Validators.max(1000)]],
          waitlistEnabled: [true],
        }),
        category: [EventCategory.COMMUNITY_SERVICE, Validators.required],
        timeCommitment: [TimeCommitmentType.ONE_TIME, Validators.required],
        requirements: this.fb.group({
          minimumAge: [null, [Validators.min(13), Validators.max(100)]],
          skills: [[]],
          interests: [[]],
          backgroundCheck: [false],
          physicalRequirements: ['', Validators.maxLength(500)],
        }),
        tags: [[]],
        registrationSettings: this.fb.group({
          requiresApproval: [false],
          allowWaitlist: [true],
          closesAt: ['', Validators.required],
          cancellationDeadline: [''],
          confirmationRequired: [true],
        }),
      },
      {
        validators: [dateRangeValidator('startTime', 'endTime')],
      }
    );
  }

  private loadEventForEdit(eventId: string): void {
    this.loading.set(true);

    this.eventService
      .getEventById(eventId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (event) => {
          this.populateForm(event);
          this.loading.set(false);
        },
        error: (error) => {
          this.eventErrorHandler.handleEventOperationError(error, {
            operation: 'edit',
            eventId,
          });
          this.loading.set(false);
        },
      });
  }

  private populateForm(event: Event): void {
    // Convert dates to ISO string format for datetime-local inputs
    const formatDateForInput = (date: Date) => {
      return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };

    this.eventForm.patchValue({
      title: event.title,
      description: event.description,
      shortDescription: event.shortDescription || '',
      startTime: formatDateForInput(event.startTime),
      endTime: formatDateForInput(event.endTime),
      location: {
        name: event.location.name,
        address: event.location.address,
        city: event.location.city,
        state: event.location.state || '',
        country: event.location.country,
        zipCode: event.location.zipCode || '',
        isRemote: event.location.isRemote,
        instructions: event.location.instructions || '',
      },
      capacity: {
        minimum: event.capacity.minimum,
        maximum: event.capacity.maximum,
        waitlistEnabled: event.capacity.waitlistEnabled,
      },
      category: event.category,
      timeCommitment: event.timeCommitment,
      requirements: {
        minimumAge: event.requirements.minimumAge,
        skills: event.requirements.skills || [],
        interests: event.requirements.interests || [],
        backgroundCheck: event.requirements.backgroundCheck,
        physicalRequirements: event.requirements.physicalRequirements || '',
      },
      tags: event.tags || [],
      registrationSettings: {
        requiresApproval: event.registrationSettings.requiresApproval,
        allowWaitlist: event.registrationSettings.allowWaitlist,
        closesAt: event.registrationSettings.closesAt
          ? formatDateForInput(new Date(event.registrationSettings.closesAt))
          : '',
        cancellationDeadline: event.registrationSettings.cancellationDeadline
          ? formatDateForInput(new Date(event.registrationSettings.cancellationDeadline))
          : '',
        confirmationRequired: event.registrationSettings.confirmationRequired,
      },
    });
  }

  onSubmit(): void {
    if (this.eventForm.valid) {
      this.loading.set(true);

      const formValue = this.eventForm.value;
      const eventData = this.prepareEventData(formValue);

      const operation = this.isEditMode()
        ? this.eventService.updateEvent(this.eventId()!, eventData as UpdateEventInput)
        : this.eventService.createEvent(eventData as CreateEventInput);

      operation.pipe(takeUntil(this.destroy$)).subscribe({
        next: (event) => {
          this.eventUiService.setSuccess(
            this.isEditMode() ? 'Event updated successfully!' : 'Event created successfully!'
          );
          this.router.navigate(['/events', event.id]);
        },
        error: (error) => {
          this.eventErrorHandler.handleEventOperationError(error, {
            operation: this.isEditMode() ? 'update' : 'create',
            eventId: this.eventId() || undefined,
          });
          this.loading.set(false);
        },
      });
    } else {
      this.markFormGroupTouched(this.eventForm);
      this.eventUiService.setError('Please fix the errors in the form before submitting.');
    }
  }

  private prepareEventData(formValue: any): CreateEventInput | UpdateEventInput {
    return {
      title: formValue.title,
      description: formValue.description,
      shortDescription: formValue.shortDescription || undefined,
      startTime: new Date(formValue.startTime),
      endTime: new Date(formValue.endTime),
      location: {
        name: formValue.location.name,
        address: formValue.location.address,
        city: formValue.location.city,
        state: formValue.location.state || undefined,
        country: formValue.location.country,
        zipCode: formValue.location.zipCode || undefined,
        isRemote: formValue.location.isRemote,
        instructions: formValue.location.instructions || undefined,
      },
      capacity: {
        minimum: formValue.capacity.minimum,
        maximum: formValue.capacity.maximum,
        waitlistEnabled: formValue.capacity.waitlistEnabled,
      },
      category: formValue.category,
      timeCommitment: formValue.timeCommitment,
      requirements: {
        minimumAge: formValue.requirements.minimumAge || undefined,
        skills: formValue.requirements.skills || [],
        interests: formValue.requirements.interests || [],
        backgroundCheck: formValue.requirements.backgroundCheck,
        physicalRequirements: formValue.requirements.physicalRequirements || undefined,
      },
      tags: formValue.tags || [],
      registrationSettings: {
        requiresApproval: formValue.registrationSettings.requiresApproval,
        allowWaitlist: formValue.registrationSettings.allowWaitlist,
        closesAt: new Date(formValue.registrationSettings.closesAt),
        cancellationDeadline: formValue.registrationSettings.cancellationDeadline
          ? new Date(formValue.registrationSettings.cancellationDeadline)
          : undefined,
        confirmationRequired: formValue.registrationSettings.confirmationRequired,
      },
    };
  }

  onSaveDraft(): void {
    if (this.eventForm.valid) {
      this.loading.set(true);

      const formValue = this.eventForm.value;
      const eventData = {
        ...this.prepareEventData(formValue),
        status: EventStatus.DRAFT,
      };

      const operation = this.isEditMode()
        ? this.eventService.updateEvent(this.eventId()!, eventData as UpdateEventInput)
        : this.eventService.createEvent(eventData as CreateEventInput);

      operation.pipe(takeUntil(this.destroy$)).subscribe({
        next: (event) => {
          this.eventUiService.setSuccess('Draft saved successfully!');
          this.router.navigate(['/events', event.id]);
        },
        error: (error) => {
          console.error('Error saving draft:', error);
          this.eventUiService.setError('Failed to save draft. Please try again.');
          this.loading.set(false);
        },
      });
    }
  }

  onCancel(): void {
    if (this.eventForm.dirty) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        this.navigateBack();
      }
    } else {
      this.navigateBack();
    }
  }

  onDelete(): void {
    if (!this.isEditMode() || !this.eventId()) return;

    if (
      confirm(
        'Are you sure you want to delete this event? This action cannot be undone and will affect all registered volunteers.'
      )
    ) {
      this.loading.set(true);

      this.eventService
        .deleteEvent(this.eventId()!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.eventUiService.setSuccess('Event deleted successfully!');
            this.router.navigate(['/events']);
          },
          error: (error) => {
            console.error('Error deleting event:', error);
            this.eventUiService.setError('Failed to delete event. Please try again.');
            this.loading.set(false);
          },
        });
    }
  }

  private navigateBack(): void {
    if (this.isEditMode()) {
      this.router.navigate(['/events', this.eventId()]);
    } else {
      this.router.navigate(['/events']);
    }
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
    const field = this.eventForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['maxlength'])
        return `${fieldName} must be less than ${field.errors['maxlength'].requiredLength} characters`;
      if (field.errors['min']) return `${fieldName} must be at least ${field.errors['min'].min}`;
      if (field.errors['max'])
        return `${fieldName} must be no more than ${field.errors['max'].max}`;
      if (field.errors['pattern']) return `${fieldName} format is invalid`;
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.eventForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
