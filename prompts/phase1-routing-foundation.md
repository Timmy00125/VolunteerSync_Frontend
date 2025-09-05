# Phase 1: Routing Foundation and Structure (TASK-004)

## Context

You are implementing the VolunteerSync MVP using Angular 20 with standalone components, Apollo Client for GraphQL, and Angular Material. The project foundation and Angular Material setup are already complete.

## Task: TASK-004 - Create routing structure for main application areas

### Requirements

- Use Angular 20 standalone components architecture
- Create a clean, maintainable routing structure
- Set up lazy loading for main feature areas
- Follow the project's feature-based organization

### Implementation Instructions

1. **Update the main app routes** (`src/app/app.routes.ts`):

   - Create routes for: auth, events, profile, dashboard
   - Implement lazy loading for each feature area
   - Add a default redirect to dashboard
   - Include route guards preparation (implement guards in later tasks)

2. **Create feature routing files** using Angular CLI:

   ```bash
   # Navigate to the Angular project directory first
   cd volunteersync-frontend

   # Create feature modules directories and route files
   ng generate component auth/login --standalone
   ng generate component auth/register --standalone
   ng generate component auth/password-reset --standalone
   ng generate component events/event-list --standalone
   ng generate component events/event-detail --standalone
   ng generate component events/event-form --standalone
   ng generate component profile/profile-view --standalone
   ng generate component profile/profile-edit --standalone
   ng generate component dashboard/volunteer-dashboard --standalone
   ng generate component dashboard/organizer-dashboard --standalone
   ng generate component shared/header --standalone
   ```

3. **Create route files for each feature area**:

   - `src/app/auth/auth.routes.ts`
   - `src/app/events/events.routes.ts`
   - `src/app/profile/profile.routes.ts`
   - `src/app/dashboard/dashboard.routes.ts`

4. **Route Structure to Implement**:

   ```
   / → redirect to /dashboard
   /auth/login
   /auth/register
   /auth/password-reset
   /events → event list
   /events/create → event creation form
   /events/:id → event detail view
   /events/:id/edit → event edit form
   /profile → profile view
   /profile/edit → profile edit
   /dashboard → volunteer dashboard (default)
   /dashboard/organizer → organizer dashboard
   ```

5. **Update app component** to include router outlet and basic navigation structure

### Technical Requirements

- Use `loadChildren` for lazy loading
- Ensure all routes are properly typed
- Follow Angular Material design patterns
- Implement proper route parameters for dynamic routes (event ID, etc.)
- Use Angular 20 standalone components (no modules)

### Files to Create/Modify

- `src/app/app.routes.ts` (modify)
- `src/app/auth/auth.routes.ts` (create)
- `src/app/events/events.routes.ts` (create)
- `src/app/profile/profile.routes.ts` (create)
- `src/app/dashboard/dashboard.routes.ts` (create)
- Various component files (generate with CLI)

### Success Criteria

- All routes are accessible and properly configured
- Lazy loading works for each feature area
- Navigation between routes works smoothly
- Console shows no routing errors
- Route structure follows the planned architecture

### Next Steps

After completing this task, the authentication service and components will be implemented in the next phase.
