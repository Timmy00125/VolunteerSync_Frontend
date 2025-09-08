import { TestBed } from '@angular/core/testing';
import { ValidationService } from './validation';
import { ValidationErrors } from '@angular/forms';

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getErrorMessage', () => {
    it('should return required field message', () => {
      const errors: ValidationErrors = { required: true };
      const message = service.getErrorMessage('Email', errors);
      expect(message).toBe('Email is required');
    });

    it('should return email format message', () => {
      const errors: ValidationErrors = { emailFormat: true };
      const message = service.getErrorMessage('Email', errors);
      expect(message).toBe('Please enter a valid email address');
    });

    it('should return password complexity message', () => {
      const errors: ValidationErrors = {
        passwordComplexity: {
          minLength: { requiredLength: 8 },
          upperCase: true,
        },
      };
      const message = service.getErrorMessage('Password', errors);
      expect(message).toContain('at least 8 characters');
      expect(message).toContain('one uppercase letter');
    });

    it('should return password mismatch message', () => {
      const errors: ValidationErrors = { passwordMismatch: true };
      const message = service.getErrorMessage('Confirm Password', errors);
      expect(message).toBe('Passwords do not match');
    });

    it('should return empty string for no errors', () => {
      const message = service.getErrorMessage('Email', null);
      expect(message).toBe('');
    });
  });

  describe('hasError', () => {
    it('should return true if error exists', () => {
      const errors: ValidationErrors = { required: true };
      expect(service.hasError(errors, 'required')).toBe(true);
    });

    it('should return false if error does not exist', () => {
      const errors: ValidationErrors = { required: true };
      expect(service.hasError(errors, 'email')).toBe(false);
    });

    it('should return false for null errors', () => {
      expect(service.hasError(null, 'required')).toBe(false);
    });
  });

  describe('shouldShowError', () => {
    it('should return true for invalid and touched field', () => {
      const field = { invalid: true, dirty: false, touched: true };
      expect(service.shouldShowError(field)).toBe(true);
    });

    it('should return true for invalid and dirty field', () => {
      const field = { invalid: true, dirty: true, touched: false };
      expect(service.shouldShowError(field)).toBe(true);
    });

    it('should return false for valid field', () => {
      const field = { invalid: false, dirty: true, touched: true };
      expect(service.shouldShowError(field)).toBe(false);
    });

    it('should return false for invalid but untouched and clean field', () => {
      const field = { invalid: true, dirty: false, touched: false };
      expect(service.shouldShowError(field)).toBe(false);
    });
  });

  describe('getFieldClasses', () => {
    it('should return error classes for invalid touched field', () => {
      const field = { invalid: true, dirty: false, touched: true, valid: false };
      const classes = service.getFieldClasses(field);
      expect(classes).toContain('border-red-300');
      expect(classes).toContain('text-red-900');
    });

    it('should return success classes for valid dirty field', () => {
      const field = { invalid: false, dirty: true, touched: true, valid: true };
      const classes = service.getFieldClasses(field);
      expect(classes).toContain('border-green-300');
      expect(classes).toContain('text-green-900');
    });

    it('should return base classes for untouched field', () => {
      const field = { invalid: false, dirty: false, touched: false, valid: false };
      const classes = service.getFieldClasses(field);
      expect(classes).toContain('border-gray-300');
      expect(classes).not.toContain('border-red-300');
      expect(classes).not.toContain('border-green-300');
    });
  });

  describe('calculatePasswordStrength', () => {
    it('should return no password for empty string', () => {
      const result = service.calculatePasswordStrength('');
      expect(result.label).toBe('No password');
      expect(result.strength).toBe(0);
    });

    it('should return very weak for simple password', () => {
      const result = service.calculatePasswordStrength('abc');
      expect(result.label).toBe('Very Weak');
      expect(result.color).toBe('red');
    });

    it('should return strong for complex password', () => {
      const result = service.calculatePasswordStrength('MySecure123!');
      expect(result.label).toBe('Strong');
      expect(result.color).toBe('green');
      expect(result.strength).toBeGreaterThan(5);
    });

    it('should return good for moderately complex password', () => {
      const result = service.calculatePasswordStrength('MyPass123');
      expect(result.label).toBe('Good');
      expect(result.color).toBe('blue');
    });
  });
});
