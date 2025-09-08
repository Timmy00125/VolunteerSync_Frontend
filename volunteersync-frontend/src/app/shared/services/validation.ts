import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  /**
   * Get user-friendly error message for validation errors
   */
  getErrorMessage(fieldName: string, errors: ValidationErrors | null): string {
    if (!errors) {
      return '';
    }

    // Required field
    if (errors['required']) {
      return `${fieldName} is required`;
    }

    // Email format
    if (errors['email'] || errors['emailFormat']) {
      return 'Please enter a valid email address';
    }

    // Password complexity
    if (errors['passwordComplexity']) {
      const complexityErrors = errors['passwordComplexity'];
      const messages: string[] = [];

      if (complexityErrors['minLength']) {
        messages.push(`at least ${complexityErrors['minLength'].requiredLength} characters`);
      }
      if (complexityErrors['upperCase']) {
        messages.push('one uppercase letter');
      }
      if (complexityErrors['lowerCase']) {
        messages.push('one lowercase letter');
      }
      if (complexityErrors['number']) {
        messages.push('one number');
      }
      if (complexityErrors['specialChar']) {
        messages.push('one special character');
      }

      return `Password must contain ${messages.join(', ')}`;
    }

    // Password mismatch
    if (errors['passwordMismatch']) {
      return 'Passwords do not match';
    }

    // Email uniqueness
    if (errors['emailExists']) {
      return 'This email is already registered';
    }

    // Name format
    if (errors['nameFormat']) {
      return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
    }

    // Phone number
    if (errors['phoneNumber']) {
      return 'Please enter a valid phone number';
    }

    // Whitespace
    if (errors['whitespace']) {
      return `${fieldName} cannot contain spaces`;
    }

    // Min length
    if (errors['minlength']) {
      return `${fieldName} must be at least ${errors['minlength'].requiredLength} characters long`;
    }

    // Max length
    if (errors['maxlength']) {
      return `${fieldName} cannot exceed ${errors['maxlength'].requiredLength} characters`;
    }

    // Pattern
    if (errors['pattern']) {
      return `${fieldName} format is invalid`;
    }

    // Default fallback
    return `${fieldName} is invalid`;
  }

  /**
   * Check if a field has a specific error
   */
  hasError(errors: ValidationErrors | null, errorType: string): boolean {
    return errors ? !!errors[errorType] : false;
  }

  /**
   * Check if field is invalid and has been touched
   */
  shouldShowError(field: AbstractControl): boolean {
    return field.invalid && (field.dirty || field.touched);
  }

  /**
   * Get CSS classes for form fields based on validation state
   */
  getFieldClasses(field: AbstractControl): string {
    const baseClasses =
      'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm';

    if (field.invalid && (field.dirty || field.touched)) {
      return `${baseClasses} border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500`;
    }

    if (field.valid && field.dirty) {
      return `${baseClasses} border-green-300 text-green-900 focus:ring-green-500 focus:border-green-500`;
    }

    return `${baseClasses} border-gray-300`;
  }

  /**
   * Get error message CSS classes
   */
  getErrorClasses(): string {
    return 'mt-1 text-sm text-red-600';
  }

  /**
   * Get label CSS classes
   */
  getLabelClasses(): string {
    return 'block text-sm font-medium text-gray-700 mb-1';
  }

  /**
   * Password strength calculator
   */
  calculatePasswordStrength(password: string): { strength: number; label: string; color: string } {
    if (!password) {
      return { strength: 0, label: 'No password', color: 'gray' };
    }

    let score = 0;

    // Length
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Character types
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/V/.test(password)) score += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;

    // Bonus for variety
    if (password.length >= 8 && score >= 4) score += 1;

    const strengthMap = [
      { min: 0, max: 1, label: 'Very Weak', color: 'red' },
      { min: 2, max: 3, label: 'Weak', color: 'orange' },
      { min: 4, max: 5, label: 'Fair', color: 'yellow' },
      { min: 6, max: 6, label: 'Good', color: 'blue' },
      { min: 7, max: 7, label: 'Strong', color: 'green' },
    ];

    const strength = strengthMap.find((s) => score >= s.min && score <= s.max) || strengthMap[0];

    return {
      strength: Math.min(score, 7),
      label: strength.label,
      color: strength.color,
    };
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
