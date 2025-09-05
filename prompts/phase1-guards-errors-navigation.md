# Phase 1: Guards, Error Handling & Navigation (TASK-009, TASK-010, TASK-011)

## Context

You are implementing the final pieces of Phase 1: authentication guards, error handling, and shared navigation. The authentication service and UI components are already implemented.

## Tasks:

- TASK-009: Create authentication guard for protected routes
- TASK-010: Implement basic error handling and user feedback for GraphQL operations
- TASK-011: Create shared header/navigation component

### Requirements

- Implement route guards using Angular 20 patterns
- Create comprehensive error handling for GraphQL operations
- Build responsive navigation header with Angular Material
- Use signals and modern Angular features

### Implementation Instructions

1. **Create Authentication Guard** using Angular CLI:

   ```bash
   cd volunteersync-frontend
   ng generate guard auth/guards/auth --implements=CanActivate
   ```

2. **Create Role-based Guard** for organizer-only routes:

   ```bash
   ng generate guard auth/guards/role --implements=CanActivate
   ```

3. **Create Error Handling Service**:

   ```bash
   ng generate service shared/services/error-handler --skip-tests=false
   ng generate service shared/services/notification --skip-tests=false
   ```

4. **Create Apollo Error Link** for global GraphQL error handling:

   ```bash
   ng generate service shared/services/apollo-error-link --skip-tests=false
   ```

5. **Update Shared Header Component** (already generated, now implement):
   - Responsive navigation with Angular Material toolbar
   - User menu with profile and logout options
   - Role-based navigation items
   - Mobile-friendly hamburger menu

### Authentication Guard Implementation

**Features to implement:**

- Check if user is authenticated using AuthService
- Redirect to login page if not authenticated
- Store intended route for post-login redirect
- Handle authentication state changes
- Support route data for additional requirements

```typescript
// Guard should implement:
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree>;
  // Logic: check auth state, redirect if needed, store return URL
}
```

### Role Guard Implementation

**Features to implement:**

- Check user role against route requirements
- Support multiple role checking
- Graceful handling for insufficient permissions
- Integration with authentication guard

```typescript
// Route data example:
{ path: 'organizer', component: OrganizerDashboard, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ORGANIZER'] } }
```

### Error Handling Service

**Features to implement:**

- Centralized error handling for GraphQL operations
- User-friendly error message mapping
- Toast notifications for errors
- Logging integration
- Network error handling
- Validation error processing

```typescript
export class ErrorHandlerService {
  handleGraphQLError(error: ApolloError): void;
  handleHttpError(error: HttpErrorResponse): void;
  showUserFriendlyMessage(error: any): void;
  logError(error: any, context?: string): void;
}
```

### Apollo Error Link

**Features to implement:**

- Global GraphQL error interception
- Automatic token refresh on 401 errors
- Network error handling
- Integration with error handler service
- Retry logic for recoverable errors

### Notification Service

**Features to implement:**

- Toast notifications using Angular Material snackbar
- Different notification types (success, error, warning, info)
- Configurable duration and actions
- Queue management for multiple notifications

```typescript
export class NotificationService {
  showSuccess(message: string, action?: string): void;
  showError(message: string, action?: string): void;
  showWarning(message: string, action?: string): void;
  showInfo(message: string, action?: string): void;
}
```

### Header/Navigation Component

**Features to implement:**

- Responsive Angular Material toolbar
- User avatar and menu (using AuthService)
- Navigation items based on user role
- Mobile hamburger menu with slide-out navigation
- Logout functionality
- Profile link
- Application branding/logo

**Navigation Structure:**

```
- Logo/Brand (link to dashboard)
- Main Navigation:
  - Events (all users)
  - Dashboard (all users)
  - Profile (all users)
  - Create Event (organizers only)
- User Menu:
  - Profile
  - Settings
  - Logout
```

### Technical Requirements

- Use Angular 20 functional guards pattern
- Implement with signals for reactive state
- Use OnPush change detection strategy
- Proper TypeScript typing throughout
- Integration with existing services
- Responsive design with Angular Material
- Accessibility features (ARIA labels, keyboard navigation)
- Unit tests for all services and guards

### Error Handling Patterns

1. **GraphQL Errors:**

   - Map GraphQL error codes to user messages
   - Handle validation errors with field-specific feedback
   - Show generic message for unexpected errors

2. **Network Errors:**

   - Detect offline/online state
   - Provide retry options
   - Cache failed requests for retry

3. **Authentication Errors:**
   - Automatic token refresh
   - Redirect to login on permanent auth failure
   - Preserve user's intended destination

### Files to Create/Modify

- `src/app/auth/guards/auth.guard.ts` (create)
- `src/app/auth/guards/role.guard.ts` (create)
- `src/app/shared/services/error-handler.service.ts` (create)
- `src/app/shared/services/notification.service.ts` (create)
- `src/app/shared/services/apollo-error-link.service.ts` (create)
- `src/app/shared/header/header.component.ts` (update)
- `src/app/shared/header/header.component.html` (update)
- `src/app/shared/header/header.component.scss` (update)
- `src/app/app.routes.ts` (update to use guards)
- `src/app/shared/services/apollo.service.ts` (update to integrate error link)

### Route Protection Setup

Update all routes that require authentication:

```typescript
// Protected routes example
{
  path: 'dashboard',
  loadComponent: () => import('./dashboard/volunteer-dashboard/volunteer-dashboard.component'),
  canActivate: [AuthGuard]
},
{
  path: 'events/create',
  loadComponent: () => import('./events/event-form/event-form.component'),
  canActivate: [AuthGuard, RoleGuard],
  data: { roles: ['ORGANIZER'] }
}
```

### Success Criteria

- Authentication guard properly protects routes
- Unauthenticated users are redirected to login
- Role-based access control works correctly
- GraphQL errors are handled gracefully with user feedback
- Navigation header is responsive and functional
- User can logout and navigate between sections
- Error messages are user-friendly and helpful
- All components are accessible and tested

### Next Steps

After completing Phase 1, proceed to Phase 2 (Event Management) with the foundation solidly in place.
