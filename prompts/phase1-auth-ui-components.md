# Phase 1: Authentication UI Components (TASK-006, TASK-007, TASK-008)

## Context

You are implementing the VolunteerSync MVP authentication UI components. The Apollo Client, authentication service, and routing are already set up. Now create the user-facing authentication components.

## Tasks:

- TASK-006: Create login component with form validation and GraphQL mutations
- TASK-007: Create registration component with user role selection and GraphQL
- TASK-008: Implement password reset functionality with GraphQL mutations

### Requirements

- Use Angular 20 standalone components with signals
- Implement reactive forms with validation
- Use Tailwind CSS for UI components
- Integrate with existing authentication service
- Follow Angular best practices and accessibility guidelines

### Implementation Instructions

1. **The components should already be generated from the routing task. Update them with proper functionality.**

2. **Create form validators and validation utilities**:

   ```bash
   cd volunteersync-frontend
   ng generate service shared/services/validation --skip-tests=false
   ```

3. **Update Login Component** (`src/app/auth/login/login.component.ts`):

   - Create reactive form with email and password fields
   - Implement form validation (required, email format)
   - Add GraphQL login mutation integration
   - Handle loading states and error messages
   - Redirect to dashboard on successful login
   - Use standard HTML form elements styled with Tailwind CSS.

4. **Update Registration Component** (`src/app/auth/register/register.component.ts`):

   - Create reactive form with all required registration fields
   - Include user role selection (Volunteer, Organizer)
   - Implement comprehensive form validation
   - Password confirmation validation
   - Integrate with registration GraphQL mutation
   - Handle success/error states
   - Redirect to dashboard after successful registration

5. **Update Password Reset Component** (`src/app/auth/password-reset/password-reset.component.ts`):

   - Create simple form with email field
   - Implement email validation
   - Integrate with password reset GraphQL mutation
   - Show success message and instructions
   - Provide link back to login

6. **Form Fields to Implement**:

   **Login Form:**

   - Email (required, email validation)
   - Password (required, min length)
   - Remember me checkbox
   - Submit button with loading state

   **Registration Form:**

   - First Name (required)
   - Last Name (required)
   - Email (required, email validation, uniqueness)
   - Password (required, min 8 chars, complexity)
   - Confirm Password (required, match validation)
   - Role Selection (Volunteer/Organizer radio buttons)
   - Terms acceptance checkbox
   - Submit button with loading state

   **Password Reset Form:**

   - Email (required, email validation)
   - Submit button with loading state

7. **Create shared form validation utilities**:
   ```typescript
   // Custom validators for password complexity, email uniqueness, etc.
   export class CustomValidators {
     static passwordComplexity(
       control: AbstractControl
     ): ValidationErrors | null;
     static emailUniqueness(authService: AuthService): AsyncValidatorFn;
     static passwordMatch(
       passwordField: string,
       confirmField: string
     ): ValidatorFn;
   }
   ```

### Technical Requirements

- Use Angular Reactive Forms with FormBuilder
- Implement proper TypeScript typing for all forms
- Use Tailwind CSS utility classes consistently
- Add loading spinners during GraphQL operations
- Implement proper error handling and user feedback
- Use signals for component state management
- Add ARIA labels and accessibility features
- Implement proper form validation with custom validators
- Use OnPush change detection strategy

### UI/UX Requirements

- Clean, professional design using Tailwind CSS
- Responsive layout for mobile and desktop
- Loading states for all async operations
- Clear error messages for validation failures
- Success notifications for completed actions
- Proper focus management and keyboard navigation
- Password visibility toggle for password fields

### Component Templates Structure

Each component should include:

- HTML form components styled with Tailwind CSS
- Proper validation error display
- Loading states (e.g., a custom spinner component)
- Success/error notifications (e.g., a custom notification component)
- Navigation links between auth forms
- Responsive layout with proper spacing

### Files to Create/Modify

- `src/app/auth/login/login.component.ts` (update)
- `src/app/auth/login/login.component.html` (update)
- `src/app/auth/login/login.component.scss` (update)
- `src/app/auth/register/register.component.ts` (update)
- `src/app/auth/register/register.component.html` (update)
- `src/app/auth/register/register.component.scss` (update)
- `src/app/auth/password-reset/password-reset.component.ts` (update)
- `src/app/auth/password-reset/password-reset.component.html` (update)
- `src/app/auth/password-reset/password-reset.component.scss` (update)
- `src/app/shared/services/validation.service.ts` (create)
- `src/app/shared/validators/custom-validators.ts` (create)

### Integration Points

- Use the existing AuthService for all GraphQL operations
- Integrate with Angular Router for navigation
- Use Tailwind CSS for styling
- Connect to validation service for reusable validators

### Success Criteria

- All authentication forms work correctly
- Form validation provides clear feedback
- GraphQL integration works without errors
- Loading states and error handling work properly
- Navigation between forms is smooth
- Components are accessible and responsive
- Unit tests pass for all components

### Next Steps

After completing this task, the authentication guard and error handling will be implemented.
