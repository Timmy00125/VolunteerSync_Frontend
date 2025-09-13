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

  // Event routes (protected)
  {
    path: 'events',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./events/event-list/event-list').then((m) => m.EventListComponent),
      },
      {
        path: 'create',
        loadComponent: () => import('./events/event-form/event-form').then((m) => m.EventForm),
        canActivate: [roleGuard],
        data: { roles: ['organizer', 'admin'] },
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./events/event-detail/event-detail').then((m) => m.EventDetail),
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./events/event-form/event-form').then((m) => m.EventForm),
        canActivate: [roleGuard],
        data: { roles: ['organizer', 'admin'] },
      },
      {
        path: ':id/register',
        loadComponent: () =>
          import('./events/event-registration/event-registration').then(
            (m) => m.EventRegistrationComponent
          ),
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
    loadComponent: () =>
      import('./shared/components/unauthorized/unauthorized').then((m) => m.UnauthorizedComponent),
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./shared/components/not-found/not-found').then((m) => m.NotFoundComponent),
  },

  // Wildcard route - must be last
  {
    path: '**',
    redirectTo: '/not-found',
  },
];
