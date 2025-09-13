import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator that checks if end date is after start date
 */
export function dateRangeValidator(startDateField: string, endDateField: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const startDate = control.get(startDateField)?.value;
    const endDate = control.get(endDateField)?.value;

    if (!startDate || !endDate) {
      return null; // Don't validate if either date is missing
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return { dateRange: { message: 'End date must be after start date' } };
    }

    return null;
  };
}

/**
 * Validator that checks if a date is in the future
 */
export function futureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const inputDate = new Date(control.value);
    const now = new Date();

    if (inputDate <= now) {
      return { futureDate: { message: 'Date must be in the future' } };
    }

    return null;
  };
}

/**
 * Validator that checks if a date is within a reasonable range (not too far in the future)
 */
export function reasonableDateValidator(maxYearsInFuture: number = 2): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const inputDate = new Date(control.value);
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + maxYearsInFuture);

    if (inputDate > maxDate) {
      return {
        reasonableDate: {
          message: `Date cannot be more than ${maxYearsInFuture} years in the future`,
        },
      };
    }

    return null;
  };
}
