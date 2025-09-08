import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { PasswordResetComponent } from './password-reset';
import { AuthService } from '../services/auth';
import { ValidationService } from '../../shared/services/validation';

describe('PasswordResetComponent', () => {
  let component: PasswordResetComponent;
  let fixture: ComponentFixture<PasswordResetComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let validationService: jasmine.SpyObj<ValidationService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'requestPasswordReset',
      'isAuthenticated',
      'error',
    ]);
    const validationServiceSpy = jasmine.createSpyObj('ValidationService', [
      'markFormGroupTouched',
    ]);

    await TestBed.configureTestingModule({
      imports: [PasswordResetComponent, ReactiveFormsModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ValidationService, useValue: validationServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordResetComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    validationService = TestBed.inject(ValidationService) as jasmine.SpyObj<ValidationService>;

    authService.isAuthenticated.and.returnValue(false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set success state on successful password reset request', () => {
    component.resetForm.setValue({ email: 'test@example.com' });
    authService.requestPasswordReset.and.returnValue(of(true));

    component.onSubmit();

    expect(authService.requestPasswordReset).toHaveBeenCalledWith('test@example.com');
    expect(component.isSuccess()).toBe(true);
  });

  it('should show error notification on failed password reset request', () => {
    component.resetForm.setValue({ email: 'test@example.com' });
    authService.requestPasswordReset.and.returnValue(throwError(() => new Error('Failed')));
    authService.error.and.returnValue('Something went wrong');

    component.onSubmit();

    expect(component.notification()).toEqual({
      type: 'error',
      title: 'Reset Failed',
      message: 'Something went wrong',
    });
  });
});
