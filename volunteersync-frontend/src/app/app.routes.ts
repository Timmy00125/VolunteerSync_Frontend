import { Routes } from '@angular/router';

export const routes: Routes = [
  // Root redirect
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full',
  },

  // Authentication routes
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

  // Dashboard routes (placeholder for future implementation)
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then((m) => m.DashboardComponent),
    // canActivate: [authGuard] // To be added when auth guard is implemented
  },

  // Wildcard route - must be last
  {
    path: '**',
    redirectTo: '/auth/login',
  },
];
