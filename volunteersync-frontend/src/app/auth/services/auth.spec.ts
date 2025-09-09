import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { of, throwError } from 'rxjs';

import { AuthService } from './auth';
import { User, UserRole } from '../../shared/models/user.model';
import { AuthResponse } from '../../shared/models/auth.model';

describe('AuthService', () => {
  let service: AuthService;
  let apolloSpy: jasmine.SpyObj<Apollo>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    emailVerified: true,
    roles: ['volunteer'],
  };

  const mockAuthResponse: AuthResponse = {
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MzYyMzkwMjJ9.4J-0GvJp_wD4s_3_a-Zc-C_a_b_c_d_e_f_g_h_i_j_k_l_m_n_o_p',
    refreshToken: 'mock-refresh-token',
    user: mockUser,
  };

  beforeEach(() => {
    // Mock localStorage
    let store: { [key: string]: string } = {};
    const mockLocalStorage = {
      getItem: (key: string): string | null => {
        return key in store ? store[key] : null;
      },
      setItem: (key: string, value: string) => {
        store[key] = `${value}`;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };

    spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
    spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);
    spyOn(localStorage, 'removeItem').and.callFake(mockLocalStorage.removeItem);
    spyOn(localStorage, 'clear').and.callFake(mockLocalStorage.clear);

    const apolloSpyObj = jasmine.createSpyObj('Apollo', ['mutate', 'query', 'client']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const apolloClientSpy = jasmine.createSpyObj('ApolloClient', ['clearStore']);
    apolloSpyObj.client = apolloClientSpy;

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        AuthService,
        { provide: Apollo, useValue: apolloSpyObj },
        { provide: Router, useValue: routerSpyObj },
      ],
    });

    service = TestBed.inject(AuthService);
    apolloSpy = TestBed.inject(Apollo) as jasmine.SpyObj<Apollo>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with null user if no valid token is present', () => {
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should track loading state', () => {
    expect(service.isLoading()).toBeFalse();
  });

  describe('login', () => {
    it('should authenticate user and store tokens on successful login', (done) => {
      apolloSpy.mutate.and.returnValue(of({ data: { login: mockAuthResponse } }));

      service.login({ email: 'test@example.com', password: 'password' }).subscribe((response) => {
        expect(response).toEqual(mockAuthResponse);
        expect(service.currentUser()).toEqual(mockUser);
        expect(service.isAuthenticated()).toBeTrue();
        expect(localStorage.getItem('authToken')).toBe(mockAuthResponse.token);
        expect(localStorage.getItem('refreshToken')).toBe('mock-refresh-token');
        done();
      });
    });

    it('should handle error on failed login', (done) => {
      const error = { graphQLErrors: [{ message: 'Invalid credentials' }] };
      apolloSpy.mutate.and.returnValue(throwError(() => error));

      service.login({ email: 'test@example.com', password: 'password' }).subscribe({
        error: (err) => {
          expect(service.currentUser()).toBeNull();
          expect(service.isAuthenticated()).toBeFalse();
          expect(service.error()).toBe('Invalid credentials');
          expect(err).toEqual(error);
          done();
        },
      });
    });
  });

  describe('register', () => {
    it('should register user and store tokens on successful registration', (done) => {
      apolloSpy.mutate.and.returnValue(of({ data: { register: mockAuthResponse } }));

      service
        .register({ email: 'test@example.com', password: 'password', name: 'Test User' })
        .subscribe((response) => {
          expect(response).toEqual(mockAuthResponse);
          expect(service.currentUser()).toEqual(mockUser);
          expect(service.isAuthenticated()).toBeTrue();
          expect(localStorage.getItem('authToken')).toBe(mockAuthResponse.token);
          expect(localStorage.getItem('refreshToken')).toBe('mock-refresh-token');
          done();
        });
    });
  });

  describe('logout', () => {
    it('should clear user state, tokens, and navigate to login', (done) => {
      // First, log in the user
      service['setUser'](mockUser);
      localStorage.setItem('authToken', mockAuthResponse.token);
      localStorage.setItem('refreshToken', 'mock-refresh-token');
      expect(service.isAuthenticated()).toBeTrue();

      apolloSpy.mutate.and.returnValue(of({ data: { logout: { success: true } } }));

      service.logout().subscribe(() => {
        expect(service.currentUser()).toBeNull();
        expect(service.isAuthenticated()).toBeFalse();
        expect(localStorage.getItem('authToken')).toBeNull();
        expect(localStorage.getItem('refreshToken')).toBeNull();
        expect(apolloSpy.client.clearStore).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
        done();
      });
    });
  });
});
