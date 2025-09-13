import { Injectable, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

// Models
import {
  Event,
  EventStatus,
  CreateEventInput,
  UpdateEventInput,
} from '../../shared/models/event.model';
import { User, UserRole } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class EventUiService {
  private fb = new FormBuilder();
  private datePipe = new DatePipe('en-US');

  // UI State signals
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  // Form state
  eventForm = signal<FormGroup | null>(null);

  constructor() {}

  /**
   * Creates a new event form with validation
   */
  createEventForm(): FormGroup {
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
        }),
        capacity: this.fb.group({
          minimum: [1, [Validators.required, Validators.min(1)]],
          maximum: [null, [Validators.required, Validators.min(1), Validators.max(10000)]],
          waitlistEnabled: [true],
        }),
        category: ['user', Validators.required],
        timeCommitment: ['ONE_TIME', Validators.required],
        tags: [[]],
        registrationSettings: this.fb.group({
          opensAt: [''],
          closesAt: [''],
          requiresApproval: [false],
          allowWaitlist: [true],
          confirmationRequired: [true],
          cancellationDeadline: [''],
        }),
      },
      {
        validators: this.dateRangeValidator,
      }
    );
  }

  /**
   * Populates form with existing event data for editing
   */
  populateEventForm(form: FormGroup, event: Event): void {
    form.patchValue({
      title: event.title,
      description: event.description,
      shortDescription: event.shortDescription || '',
      startTime: this.formatDateForInput(event.startTime),
      endTime: this.formatDateForInput(event.endTime),
      location: {
        name: event.location.name,
        address: event.location.address,
        city: event.location.city,
        state: event.location.state || '',
        country: event.location.country,
        zipCode: event.location.zipCode || '',
        isRemote: event.location.isRemote,
      },
      capacity: {
        minimum: event.capacity.minimum,
        maximum: event.capacity.maximum,
        waitlistEnabled: event.capacity.waitlistEnabled,
      },
      category: event.category,
      timeCommitment: event.timeCommitment,
      tags: event.tags,
      registrationSettings: {
        opensAt: event.registrationSettings.opensAt
          ? this.formatDateForInput(event.registrationSettings.opensAt)
          : '',
        closesAt: this.formatDateForInput(event.registrationSettings.closesAt),
        requiresApproval: event.registrationSettings.requiresApproval,
        allowWaitlist: event.registrationSettings.allowWaitlist,
        confirmationRequired: event.registrationSettings.confirmationRequired,
        cancellationDeadline: event.registrationSettings.cancellationDeadline
          ? this.formatDateForInput(event.registrationSettings.cancellationDeadline)
          : '',
      },
    });
  }

  /**
   * Converts form data to CreateEventInput
   */
  formToCreateInput(form: FormGroup): CreateEventInput {
    const value = form.value;
    return {
      title: value.title,
      description: value.description,
      shortDescription: value.shortDescription || undefined,
      startTime: new Date(value.startTime),
      endTime: new Date(value.endTime),
      location: {
        name: value.location.name,
        address: value.location.address,
        city: value.location.city,
        state: value.location.state || undefined,
        country: value.location.country,
        zipCode: value.location.zipCode || undefined,
        isRemote: value.location.isRemote,
      },
      capacity: {
        minimum: value.capacity.minimum,
        maximum: value.capacity.maximum,
        waitlistEnabled: value.capacity.waitlistEnabled,
      },
      category: value.category,
      timeCommitment: value.timeCommitment,
      tags: value.tags || [],
      registrationSettings: {
        opensAt: value.registrationSettings.opensAt
          ? new Date(value.registrationSettings.opensAt)
          : undefined,
        closesAt: new Date(value.registrationSettings.closesAt),
        requiresApproval: value.registrationSettings.requiresApproval,
        allowWaitlist: value.registrationSettings.allowWaitlist,
        confirmationRequired: value.registrationSettings.confirmationRequired,
        cancellationDeadline: value.registrationSettings.cancellationDeadline
          ? new Date(value.registrationSettings.cancellationDeadline)
          : undefined,
      },
    };
  }

  /**
   * Converts form data to UpdateEventInput
   */
  formToUpdateInput(form: FormGroup): UpdateEventInput {
    const value = form.value;
    return {
      title: value.title,
      description: value.description,
      shortDescription: value.shortDescription || undefined,
      location: {
        name: value.location.name,
        address: value.location.address,
        city: value.location.city,
        state: value.location.state || undefined,
        country: value.location.country,
        zipCode: value.location.zipCode || undefined,
        isRemote: value.location.isRemote,
      },
      category: value.category,
      tags: value.tags || [],
    };
  }

  /**
   * Custom validator for date range (end after start)
   */
  private dateRangeValidator(form: FormGroup): { [key: string]: any } | null {
    const start = form.get('startTime')?.value;
    const end = form.get('endTime')?.value;

    if (start && end && new Date(start) >= new Date(end)) {
      return { dateRangeInvalid: true };
    }
    return null;
  }

  /**
   * Formats date for datetime-local input
   */
  private formatDateForInput(date: Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-ddTHH:mm') || '';
  }

  /**
   * UI helper methods
   */
  getEventStatusColor(status: EventStatus): string {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getEventStatusText(status: EventStatus): string {
    switch (status) {
      case 'DRAFT':
        return 'Draft';
      case 'PUBLISHED':
        return 'Published';
      case 'CANCELLED':
        return 'Cancelled';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status;
    }
  }

  formatEventDate(startTime: Date, endTime: Date): string {
    const start = this.datePipe.transform(startTime, 'MMM d, y');
    const end = this.datePipe.transform(endTime, 'MMM d, y');

    if (start === end) {
      return `${start} ${this.datePipe.transform(startTime, 'h:mm a')} - ${this.datePipe.transform(
        endTime,
        'h:mm a'
      )}`;
    } else {
      return `${start} - ${end}`;
    }
  }

  canUserEditEvent(event: Event, currentUser: User | null): boolean {
    if (!currentUser) return false;
    return (
      event.organizerId === currentUser.id ||
      currentUser.roles.includes(UserRole.ADMIN) ||
      currentUser.roles.includes(UserRole.COORDINATOR)
    );
  }

  canUserRegister(event: Event, currentUser: User | null): boolean {
    if (!currentUser) return false;
    if (event.status !== 'PUBLISHED') return false;
    if (event.isAtCapacity && !event.capacity.waitlistEnabled) return false;
    return true;
  }

  /**
   * Clear all UI state
   */
  clearState(): void {
    this.loading.set(false);
    this.error.set(null);
    this.success.set(null);
  }

  /**
   * Set loading state
   */
  setLoading(loading: boolean): void {
    this.loading.set(loading);
    if (loading) {
      this.error.set(null);
      this.success.set(null);
    }
  }

  /**
   * Set error message
   */
  setError(error: string | null): void {
    this.error.set(error);
    if (error) {
      this.success.set(null);
    }
  }

  /**
   * Set success message
   */
  setSuccess(success: string | null): void {
    this.success.set(success);
    if (success) {
      this.error.set(null);
    }
  }
}
