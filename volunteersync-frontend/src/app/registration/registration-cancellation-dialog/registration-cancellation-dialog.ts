import { Component, inject, signal, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Models
import { Registration } from '../../shared/models/registration.model';
import { Event } from '../../shared/models/event.model';

// Services
import { RegistrationService } from '../services/registration';

export interface CancellationDialogData {
  registration: Registration;
  event: Event;
}

export interface CancellationResult {
  cancelled: boolean;
  reason?: string;
}

@Component({
  selector: 'app-registration-cancellation-dialog',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registration-cancellation-dialog.html',
  styleUrl: './registration-cancellation-dialog.css',
})
export class RegistrationCancellationDialogComponent implements OnInit {
  @Input() data!: CancellationDialogData;
  @Input() isOpen = false;
  @Output() result = new EventEmitter<CancellationResult>();
  @Output() closed = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private registrationService = inject(RegistrationService);

  // State
  loading = signal(false);
  error = signal<string | null>(null);

  // Form
  cancellationForm!: FormGroup;

  // Cancellation reasons
  readonly cancellationReasons = [
    'Schedule conflict',
    'Personal emergency',
    'No longer interested',
    'Found another opportunity',
    'Health reasons',
    'Travel conflicts',
    'Other',
  ];

  ngOnInit(): void {
    this.createForm();
  }

  private createForm(): void {
    this.cancellationForm = this.fb.group({
      reason: ['', [Validators.required]],
      customReason: [''],
      confirmCancel: [false, [Validators.requiredTrue]],
    });

    // Watch for "Other" selection to require custom reason
    this.cancellationForm.get('reason')?.valueChanges.subscribe((value) => {
      const customReasonControl = this.cancellationForm.get('customReason');
      if (value === 'Other') {
        customReasonControl?.setValidators([Validators.required, Validators.maxLength(500)]);
      } else {
        customReasonControl?.clearValidators();
      }
      customReasonControl?.updateValueAndValidity();
    });
  }

  onConfirm(): void {
    if (this.cancellationForm.valid) {
      this.submitCancellation();
    } else {
      this.markFormGroupTouched(this.cancellationForm);
      this.error.set('Please fill in all required fields.');
    }
  }

  onCancel(): void {
    this.result.emit({ cancelled: false });
    this.closed.emit();
  }

  private submitCancellation(): void {
    const formValue = this.cancellationForm.value;
    const reason = formValue.reason === 'Other' ? formValue.customReason : formValue.reason;

    this.loading.set(true);
    this.error.set(null);

    this.registrationService.cancelRegistration(this.data.registration.id, reason).subscribe({
      next: () => {
        this.loading.set(false);
        this.result.emit({
          cancelled: true,
          reason,
        });
        this.closed.emit();
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Error cancelling registration:', error);
        this.error.set('Failed to cancel registration. Please try again.');
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
    const field = this.cancellationForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['requiredTrue']) return 'You must confirm cancellation';
      if (field.errors['maxlength'])
        return `Must be less than ${field.errors['maxlength'].requiredLength} characters`;
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.cancellationForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  shouldShowCustomReason(): boolean {
    return this.cancellationForm.get('reason')?.value === 'Other';
  }
}
