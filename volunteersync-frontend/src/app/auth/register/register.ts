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
import { UserRole } from '../../shared/models/user.model';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    LoadingSpinnerComponent,
    AppNotificationComponent,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  protected validationService = inject(ValidationService);

  registerForm: FormGroup = this.formBuilder.group(
    {
      firstName: ['', [Validators.required, Validators.minLength(2), CustomValidators.nameFormat]],
      lastName: ['', [Validators.required, Validators.minLength(2), CustomValidators.nameFormat]],
      email: ['', [Validators.required, CustomValidators.emailFormat]],
      password: ['', [Validators.required, CustomValidators.passwordComplexity]],
      confirmPassword: ['', [Validators.required]],
      role: [UserRole.VOLUNTEER, [Validators.required]], // Default to volunteer
      acceptTerms: [false, [Validators.requiredTrue]],
    },
    {
      validators: [CustomValidators.passwordMatch('password', 'confirmPassword')],
    }
  );

  // Component state signals
  isSubmitting = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  notification = signal<{ type: NotificationType; message: string; title?: string } | null>(null);
  passwordStrength = signal<{ strength: number; label: string; color: string }>({
    strength: 0,
    label: 'No password',
    color: 'gray',
  });

  // Expose UserRole enum to template
  protected UserRole = UserRole;

  // Role options for the UI
  roleOptions = [
    {
      value: UserRole.VOLUNTEER,
      label: 'Volunteer',
      description: 'I want to help with events and volunteer opportunities',
    },
    {
      value: UserRole.COORDINATOR,
      label: 'Event Organizer',
      description: 'I want to create and manage volunteer events',
    },
  ];

  ngOnInit(): void {
    // Check if user is already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }

    // Watch password changes for strength indicator
    this.registerForm.get('password')?.valueChanges.subscribe((password) => {
      this.passwordStrength.set(this.validationService.calculatePasswordStrength(password || ''));
    });
  }

  /**
   * Submit registration form
   */
  onSubmit(): void {
    if (this.registerForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);
      this.notification.set(null);

      const { firstName, lastName, email, password, role } = this.registerForm.value;

      this.authService
        .register({
          name: `${firstName} ${lastName}`.trim(),
          email,
          password,
          role,
        })
        .subscribe({
          next: () => {
            this.router.navigate(['/dashboard']);
          },
          error: () => {
            this.isSubmitting.set(false);
            this.notification.set({
              type: 'error',
              title: 'Registration Failed',
              message:
                this.authService.error() ||
                'There was an error creating your account. Please try again.',
            });
          },
          complete: () => {
            this.isSubmitting.set(false);
          },
        });
    } else {
      this.validationService.markFormGroupTouched(this.registerForm);
    }
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  /**
   * Toggle confirm password visibility
   */
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  /**
   * Handle login navigation
   */
  onLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  /**
   * Get field error message
   */
  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field && this.validationService.shouldShowError(field)) {
      return this.validationService.getErrorMessage(fieldName, field.errors);
    }
    return '';
  }

  /**
   * Get field CSS classes
   */
  getFieldClasses(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    return field ? this.validationService.getFieldClasses(field) : '';
  }

  /**
   * Check if field should show error
   */
  shouldShowFieldError(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return field ? this.validationService.shouldShowError(field) : false;
  }

  /**
   * Get password strength color classes
   */
  getPasswordStrengthClasses(): string {
    const colorMap = {
      red: 'bg-red-500',
      orange: 'bg-orange-500',
      yellow: 'bg-yellow-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      gray: 'bg-gray-300',
    };
    return colorMap[this.passwordStrength().color as keyof typeof colorMap] || 'bg-gray-300';
  }

  /**
   * Get password strength width percentage
   */
  getPasswordStrengthWidth(): string {
    const strength = this.passwordStrength().strength;
    return `${(strength / 7) * 100}%`;
  }

  /**
   * Dismiss notification
   */
  onDismissNotification(): void {
    this.notification.set(null);
  }
}
