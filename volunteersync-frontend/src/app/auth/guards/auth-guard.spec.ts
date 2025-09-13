import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { authGuard } from './auth-guard';
import { AuthService } from '../services/auth';
import { testConfig } from '../../test-config';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    routerMock = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        ...testConfig.providers,
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
    localStorage.clear();
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow activation when user is authenticated', () => {
    (authServiceMock.isAuthenticated as jasmine.Spy).and.returnValue(true);

    const canActivate = executeGuard({} as any, {} as any) as boolean;

    expect(canActivate).toBe(true);
    expect(authServiceMock.isAuthenticated).toHaveBeenCalled();
  });

  it('should redirect to login when user is not authenticated', () => {
    (authServiceMock.isAuthenticated as jasmine.Spy).and.returnValue(false);
    const dummyUrlTree = new UrlTree();
    routerMock.createUrlTree.and.returnValue(dummyUrlTree);

    const canActivate = executeGuard({} as any, { url: '/dashboard' } as any) as UrlTree;

    expect(canActivate).toBe(dummyUrlTree);
    expect(authServiceMock.isAuthenticated).toHaveBeenCalled();
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: { returnUrl: '/dashboard' },
    });
    expect(localStorage.getItem('returnUrl')).toBe('/dashboard');
  });
});