import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth-guard';
import { roleGuard } from './auth/guards/role-guard';

export const routes: Routes = [
  // Root redirect - redirect to dashboard if authenticated, otherwise login
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },

  // Authentication routes (public)
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./auth/login/login').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () => import('./auth/register/register').then((m) => m.RegisterComponent),
      },
      {
        path: 'password-reset',
        loadComponent: () =>
          import('./auth/password-reset/password-reset').then((m) => m.PasswordResetComponent),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },

  // Dashboard routes (protected)
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },

  // Event routes (protected) - placeholder redirects until components are created
  {
    path: 'events',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        // List all events component (future implementation)
        redirectTo: '/dashboard',
        pathMatch: 'full',
      },
      {
        path: 'create',
        // Event creation form (coordinator/admin only) - temporary redirect until Phase 2
        redirectTo: '/dashboard',
      },
      {
        path: 'manage',
        // Event management (coordinator/admin only) - temporary redirect until Phase 2
        redirectTo: '/dashboard',
      },
      {
        path: ':id',
        // Event details view
        redirectTo: '/dashboard',
      },
    ],
  },

  // Profile routes (protected) - placeholder redirect until Phase 3
  {
    path: 'profile',
    redirectTo: '/dashboard',
  },

  // Settings routes (protected) - placeholder redirect until Phase 3
  {
    path: 'settings',
    redirectTo: '/dashboard',
  },

  // Admin routes (admin only) - placeholder redirects until Phase 4
  {
    path: 'admin',
    redirectTo: '/dashboard',
  },

  // Error pages
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/components/unauthorized/unauthorized').then(m => m.UnauthorizedComponent)
  },
  {
    path: 'not-found',
    loadComponent: () => import('./shared/components/not-found/not-found').then(m => m.NotFoundComponent)
  },

  // Wildcard route - must be last
  {
    path: '**',
    redirectTo: '/not-found',
  },
];
