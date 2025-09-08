import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../services/auth';
import { ValidationService } from '../../shared/services/validation';
import { CustomValidators } from '../../shared/validators/custom-validators';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';
import {
  AppNotificationComponent,
  NotificationType,
} from '../../shared/components/notification/notification';

@Component({
  selector: 'app-password-reset',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    LoadingSpinnerComponent,
    AppNotificationComponent,
  ],
  templateUrl: './password-reset.html',
  styleUrl: './password-reset.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordResetComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  protected validationService = inject(ValidationService);

  resetForm: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, CustomValidators.emailFormat]],
  });

  // Component state signals
  isSubmitting = signal(false);
  isSuccess = signal(false);
  notification = signal<{ type: NotificationType; message: string; title?: string } | null>(null);

  ngOnInit(): void {
    // Check if user is already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Submit password reset form
   */
  onSubmit(): void {
    if (this.resetForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);
      this.notification.set(null);

      const { email } = this.resetForm.value;

      this.authService.requestPasswordReset(email as string).subscribe({
        next: (success: boolean) => {
          if (success) {
            this.isSuccess.set(true);
          } else {
            this.notification.set({
              type: 'error',
              title: 'Reset Unavailable',
              message: 'Password reset is not available yet. Please contact support.',
            });
          }
        },
        error: (_err: unknown) => {
          this.isSubmitting.set(false);
          this.notification.set({
            type: 'error',
            title: 'Reset Failed',
            message:
              this.authService.error() ||
              'There was an error sending the reset email. Please try again.',
          });
        },
        complete: () => {
          this.isSubmitting.set(false);
        },
      });
    } else {
      this.validationService.markFormGroupTouched(this.resetForm);
    }
  }

  /**
   * Handle back to login navigation
   */
  onBackToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  /**
   * Handle register navigation
   */
  onRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  /**
   * Send another reset email
   */
  onSendAnother(): void {
    this.isSuccess.set(false);
    this.notification.set(null);
    this.resetForm.reset();
  }

  /**
   * Get field error message
   */
  getFieldError(fieldName: string): string {
    const field = this.resetForm.get(fieldName);
    if (field && this.validationService.shouldShowError(field)) {
      return this.validationService.getErrorMessage(fieldName, field.errors);
    }
    return '';
  }

  /**
   * Get field CSS classes
   */
  getFieldClasses(fieldName: string): string {
    const field = this.resetForm.get(fieldName);
    return field ? this.validationService.getFieldClasses(field) : '';
  }

  /**
   * Check if field should show error
   */
  shouldShowFieldError(fieldName: string): boolean {
    const field = this.resetForm.get(fieldName);
    return field ? this.validationService.shouldShowError(field) : false;
  }

  /**
   * Dismiss notification
   */
  onDismissNotification(): void {
    this.notification.set(null);
  }
}
