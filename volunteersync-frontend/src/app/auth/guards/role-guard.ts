import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth';

/**
 * Role-based guard to protect routes based on user roles
 * Checks if user has required roles specified in route data
 */
export const roleGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.currentUser();

  // If no user is authenticated, redirect to login
  if (!currentUser) {
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  // Get required roles from route data
  const requiredRoles = route.data?.['roles'] as string[] | undefined;

  // If no roles are specified, allow access
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // Check if user has any of the required roles
  const userRoles = currentUser.roles || [];
  const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));

  if (hasRequiredRole) {
    return true;
  } else {
    // Redirect to dashboard or access denied page
    // For now, redirect to dashboard with insufficient permissions
    return router.createUrlTree(['/dashboard'], {
      queryParams: { error: 'insufficient-permissions' },
    });
  }
};
