import { AbstractControl, ValidationErrors, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../../auth/services/auth';

export class CustomValidators {
  /**
   * Password complexity validator
   * Requires at least 8 characters with uppercase, lowercase, number, and special character
   */
  static passwordComplexity(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value) {
      return null; // Let required validator handle empty values
    }

    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

    const errors: ValidationErrors = {};

    if (value.length < minLength) {
      errors['minLength'] = { actualLength: value.length, requiredLength: minLength };
    }

    if (!hasUpperCase) {
      errors['upperCase'] = true;
    }

    if (!hasLowerCase) {
      errors['lowerCase'] = true;
    }

    if (!hasNumber) {
      errors['number'] = true;
    }

    if (!hasSpecialChar) {
      errors['specialChar'] = true;
    }

    return Object.keys(errors).length > 0 ? { passwordComplexity: errors } : null;
  }

  /**
   * Password match validator for password confirmation
   */
  static passwordMatch(passwordField: string, confirmField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get(passwordField);
      const confirmPassword = control.get(confirmField);

      if (!password || !confirmPassword) {
        return null;
      }

      if (password.value !== confirmPassword.value) {
        // Set error on the confirm password field
        confirmPassword.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      } else {
        // Clear the error if passwords match
        const errors = confirmPassword.errors;
        if (errors) {
          delete errors['passwordMismatch'];
          confirmPassword.setErrors(Object.keys(errors).length > 0 ? errors : null);
        }
        return null;
      }
    };
  }

  /**
   * Email uniqueness async validator
   * Checks if email is already registered (would need backend support)
   */
  static emailUniqueness(authService: AuthService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      // Debounce the validation to avoid too many API calls
      return timer(500).pipe(
        switchMap(() => {
          // In a real implementation, this would call a backend endpoint to check email uniqueness
          // For now, we'll return a mock validation that always passes
          // TODO: Implement actual email uniqueness check when backend endpoint is available
          return of(null);
        }),
        catchError(() => of(null)) // Return null on error to prevent form blocking
      );
    };
  }

  /**
   * Email format validator (enhanced)
   */
  static emailFormat(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(control.value)) {
      return { emailFormat: { actualValue: control.value } };
    }

    return null;
  }

  /**
   * No whitespace validator
   */
  static noWhitespace(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const hasWhitespace = /\s/.test(control.value);

    if (hasWhitespace) {
      return { whitespace: true };
    }

    return null;
  }

  /**
   * Phone number validator
   */
  static phoneNumber(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    // Basic phone number validation (adjust pattern as needed)
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;

    if (!phoneRegex.test(control.value) || control.value.length < 10) {
      return { phoneNumber: { actualValue: control.value } };
    }

    return null;
  }

  /**
   * Name validator (no numbers or special characters)
   */
  static nameFormat(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const nameRegex = /^[a-zA-Z\s'-]+$/;

    if (!nameRegex.test(control.value)) {
      return { nameFormat: { actualValue: control.value } };
    }

    return null;
  }
}
