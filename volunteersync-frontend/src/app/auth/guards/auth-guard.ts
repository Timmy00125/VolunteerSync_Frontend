import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth';

/**
 * Authentication guard to protect routes
 * Checks if user is authenticated and redirects to login if not
 */
export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();

  if (isAuthenticated) {
    return true;
  } else {
    // Store the intended URL for redirecting after login
    const returnUrl = state.url;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('returnUrl', returnUrl);
    }

    // Redirect to login page
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl },
    });
  }
};
