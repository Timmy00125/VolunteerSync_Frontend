import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { provideZonelessChangeDetection } from '@angular/core';

import { LoginComponent } from './login';
import { AuthService } from '../services/auth';
import { ValidationService } from '../../shared/services/validation';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let validationService: jasmine.SpyObj<ValidationService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'login',
      'isAuthenticated',
      'error',
    ]);
    const validationServiceSpy = jasmine.createSpyObj('ValidationService', [
      'getFieldClasses',
      'getErrorMessage',
      'shouldShowError',
      'markFormGroupTouched',
    ]);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, RouterTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ValidationService, useValue: validationServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    validationService = TestBed.inject(ValidationService) as jasmine.SpyObj<ValidationService>;

    authService.isAuthenticated.and.returnValue(false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();
    expect(authService.login).not.toHaveBeenCalled();
    expect(validationService.markFormGroupTouched).toHaveBeenCalledWith(component.loginForm);
  });

  it('should call authService.login on valid submission', () => {
    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password',
      rememberMe: false,
    });
    authService.login.and.returnValue(of({ user: { firstName: 'Test' } } as any));

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
  });

  it('should show error notification on login failure', () => {
    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password',
      rememberMe: false,
    });
    authService.login.and.returnValue(throwError(() => new Error('Login failed')));
    authService.error.and.returnValue('Invalid credentials');

    component.onSubmit();

    expect(component.notification()).toEqual({
      type: 'error',
      title: 'Login Failed',
      message: 'Invalid credentials',
    });
  });
});
