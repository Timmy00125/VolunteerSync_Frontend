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
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    LoadingSpinnerComponent,
    AppNotificationComponent,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  protected validationService = inject(ValidationService);

  loginForm: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, CustomValidators.emailFormat]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  // Component state signals
  isSubmitting = signal(false);
  showPassword = signal(false);
  healthStatus = signal<string>('');
  notification = signal<{ type: NotificationType; message: string; title?: string } | null>(null);

  ngOnInit(): void {
    // Check if user is already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Submit login form
   */
  onSubmit(): void {
    if (this.loginForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);
      this.notification.set(null);

      const { email, password } = this.loginForm.value;

      this.authService.login({ email, password }).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.isSubmitting.set(false);
          this.notification.set({
            type: 'error',
            title: 'Login Failed',
            message: this.authService.error() || 'Invalid email or password. Please try again.',
          });
        },
        complete: () => {
          this.isSubmitting.set(false);
        },
      });
    } else {
      this.validationService.markFormGroupTouched(this.loginForm);
    }
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  /**
   * Handle forgot password navigation
   */
  onForgotPassword(): void {
    this.router.navigate(['/auth/password-reset']);
  }

  /**
   * Handle register navigation
   */
  onRegister(): void {
    this.router.navigate(['/auth/register']);
  }



  /**
   * Dismiss notification
   */
  onDismissNotification(): void {
    this.notification.set(null);
  }

  /**
   * Get field error message
   */
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field && this.validationService.shouldShowError(field)) {
      return this.validationService.getErrorMessage(fieldName, field.errors);
    }
    return '';
  }

  /**
   * Get field CSS classes
   */
  getFieldClasses(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    return field ? this.validationService.getFieldClasses(field) : '';
  }

  /**
   * Check if field should show error
   */
  shouldShowFieldError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return field ? this.validationService.shouldShowError(field) : false;
  }
}
