import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'auth/login',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'auth/register',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'auth/password-reset',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'events',
    renderMode: RenderMode.Server, // Protected route - use server rendering
  },
  {
    path: 'events/create',
    renderMode: RenderMode.Server, // Protected route - use server rendering
  },
  {
    path: 'events/:id',
    renderMode: RenderMode.Server, // Dynamic route - use server rendering
  },
  {
    path: 'events/:id/edit',
    renderMode: RenderMode.Server, // Dynamic route - use server rendering
  },
  {
    path: 'events/:id/register',
    renderMode: RenderMode.Server, // Dynamic route - use server rendering
  },
  {
    path: 'dashboard',
    renderMode: RenderMode.Server, // Protected route - use server rendering
  },
  {
    path: 'unauthorized',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'not-found',
    renderMode: RenderMode.Prerender,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
