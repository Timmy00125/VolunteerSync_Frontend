import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { roleGuard } from './role-guard';
import { AuthService } from '../services/auth';
import { signal } from '@angular/core';
import { User } from '../../shared/models/user.model';

describe('roleGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => roleGuard(...guardParameters));

  let authServiceMock: { currentUser: any; };
  let routerMock: jasmine.SpyObj<Router>;

  const mockUser: User = { id: '1', name: 'Test', email: 'test@test.com', roles: ['VOLUNTEER'], emailVerified: true };

  beforeEach(() => {
    authServiceMock = {
      currentUser: signal(null)
    };
    routerMock = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should redirect to login if user is not authenticated', () => {
    authServiceMock.currentUser.set(null);
    const dummyUrlTree = new UrlTree();
    routerMock.createUrlTree.and.returnValue(dummyUrlTree);

    const canActivate = executeGuard({ data: { roles: ['ADMIN'] } } as any, { url: '/admin' } as any) as UrlTree;

    expect(canActivate).toBe(dummyUrlTree);
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: { returnUrl: '/admin' },
    });
  });

  it('should allow access if user has the required role', () => {
    authServiceMock.currentUser.set(mockUser);
    const canActivate = executeGuard({ data: { roles: ['VOLUNTEER'] } } as any, {} as any) as boolean;
    expect(canActivate).toBe(true);
  });

  it('should deny access and redirect if user does not have the required role', () => {
    authServiceMock.currentUser.set(mockUser);
    const dummyUrlTree = new UrlTree();
    routerMock.createUrlTree.and.returnValue(dummyUrlTree);

    const canActivate = executeGuard({ data: { roles: ['ADMIN'] } } as any, {} as any) as UrlTree;

    expect(canActivate).toBe(dummyUrlTree);
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/dashboard'], {
      queryParams: { error: 'insufficient-permissions' },
    });
  });

  it('should allow access if no roles are required', () => {
    authServiceMock.currentUser.set(mockUser);
    const canActivate = executeGuard({ data: {} } as any, {} as any) as boolean;
    expect(canActivate).toBe(true);
  });
});