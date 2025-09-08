import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { RegisterComponent } from './register';
import { AuthService } from '../services/auth';
import { ValidationService } from '../../shared/services/validation';
import { UserRole } from '../../shared/models/user.model';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let validationService: jasmine.SpyObj<ValidationService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'register',
      'isAuthenticated',
      'error',
    ]);
    const validationServiceSpy = jasmine.createSpyObj('ValidationService', [
      'calculatePasswordStrength',
      'markFormGroupTouched',
    ]);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ValidationService, useValue: validationServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    validationService = TestBed.inject(ValidationService) as jasmine.SpyObj<ValidationService>;

    authService.isAuthenticated.and.returnValue(false);
    validationService.calculatePasswordStrength.and.returnValue({
      strength: 0,
      label: 'No password',
      color: 'gray',
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call authService.register on valid submission', () => {
    component.registerForm.setValue({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      role: UserRole.VOLUNTEER,
      acceptTerms: true,
    });
    authService.register.and.returnValue(of({ user: { firstName: 'Test' } } as any));

    component.onSubmit();

    expect(authService.register).toHaveBeenCalled();
  });

  it('should show error notification on registration failure', () => {
    component.registerForm.setValue({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      role: UserRole.VOLUNTEER,
      acceptTerms: true,
    });
    authService.register.and.returnValue(throwError(() => new Error('Failed')));
    authService.error.and.returnValue('Registration failed');

    component.onSubmit();

    expect(component.notification()).toEqual({
      type: 'error',
      title: 'Registration Failed',
      message: 'Registration failed',
    });
  });
});
