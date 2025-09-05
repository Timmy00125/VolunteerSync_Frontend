# VolunteerSync Authentication System Implementation

You are an expert Angular developer tasked with implementing a complete authentication and authorization system for VolunteerSync, a volunteer management platform. You MUST follow the detailed implementation plan and integrate seamlessly with the existing Angular v20 project structure.

## CRITICAL Requirements

You WILL implement the authentication system following these core principles:

- You MUST use Angular v20 with standalone components and signals
- You MUST integrate with Apollo Client for GraphQL operations
- You MUST follow the exact file structure and naming conventions specified
- You MUST implement comprehensive security measures and OWASP guidelines
- You WILL create production-ready, testable, and maintainable code
- You MUST include proper error handling and user experience considerations

## Project Context

### Technology Stack

- **Framework**: Angular v20 (standalone components, signals, new control flow)
- **GraphQL**: Apollo Angular v11.0.0 with @apollo/client v3.0.0
- **UI**: Angular Material with custom theming (to be added)
- **Styling**: TailwindCSS v4.1
- **State Management**: Angular signals + Apollo Client cache
- **Testing**: Jest for unit tests, Cypress for E2E
- **Build Tool**: Angular CLI v20.2.1

### Current Project Structure

```
volunteersync-frontend/
├── src/
│   ├── app/
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   └── app.ts (main app component)
│   ├── main.ts
│   └── index.html
├── package.json
└── angular.json
```

## Implementation Phases

### Phase 1: Foundation and Core Services (CRITICAL - Start Here)

You MUST implement these core authentication services first:

#### TASK-001: Authentication Module Setup

You WILL create `src/app/auth/auth.module.ts` with:

- Proper Angular v20 standalone component configuration
- Dependency injection setup for all authentication services
- Route configuration for authentication pages
- Import statements for required Angular modules

#### TASK-002: JWT Token Service

You WILL create `src/app/auth/services/token.service.ts` with:

- Secure token storage using hybrid approach (HTTP-only cookies for refresh tokens, memory for access tokens)
- Automatic token refresh mechanism with proper error handling
- Token validation and expiration checking
- Methods: `storeTokens()`, `getAccessToken()`, `getRefreshToken()`, `clearTokens()`, `isTokenValid()`, `refreshAccessToken()`

#### TASK-003: Authentication State Service

You WILL create `src/app/auth/services/auth.service.ts` using Angular signals:

- User authentication state management with `signal()` and `computed()`
- Login/logout functionality with GraphQL mutations
- User profile data management
- Session persistence across browser sessions
- Methods: `login()`, `logout()`, `register()`, `currentUser()`, `isAuthenticated()`, `getUserProfile()`

#### TASK-004: HTTP Interceptor

You WILL create `src/app/auth/interceptors/auth.interceptor.ts` with:

- Automatic JWT token attachment to GraphQL requests
- Token refresh logic for expired tokens
- Error handling for authentication failures
- Proper Apollo Client integration

#### TASK-005: Secure Storage Service

You WILL create `src/app/auth/services/security.service.ts` with:

- Encrypted storage utilities using crypto-js
- Secure session management
- CSRF protection mechanisms
- Input sanitization helpers

#### TASK-006: Authentication Guards

You WILL create route guards in `src/app/auth/guards/`:

- `auth.guard.ts`: Protect authenticated routes
- `role.guard.ts`: Role-based route protection
- `permission.guard.ts`: Fine-grained permission checking
- Integration with Angular v20 functional guards

#### TASK-007: Role-Based Access Control Service

You WILL create `src/app/auth/services/permission.service.ts` with:

- Permission checking logic for Volunteer, Organizer, Admin roles
- Dynamic permission resolution from backend
- Caching mechanism for performance
- Methods: `hasPermission()`, `hasRole()`, `canAccess()`, `getUserPermissions()`

### Phase 2: Registration and Login Components

#### TASK-008: Registration Component

You WILL create `src/app/auth/components/register/` with:

- Standalone Angular component using reactive forms
- Form validation for email, password strength, terms acceptance
- Integration with registration GraphQL mutation
- Proper error handling and user feedback
- Password strength indicator and validation rules

#### TASK-009: Login Component

You WILL create `src/app/auth/components/login/` with:

- Standalone component with email/password form
- Remember me functionality
- Integration with login GraphQL mutation
- Proper loading states and error messages
- Redirect handling after successful login

#### TASK-010: Password Reset Request Component

You WILL create `src/app/auth/components/password-reset/` with:

- Email input form for password reset requests
- Integration with password reset GraphQL mutation
- Success/error messaging
- Rate limiting protection

#### TASK-011: Password Reset Confirmation Component

You WILL create `src/app/auth/components/password-reset-confirm/` with:

- Token validation and new password form
- Password confirmation matching
- Integration with password reset confirmation mutation
- Security validations

#### TASK-012: Password Change Component

You WILL create `src/app/auth/components/password-change/` for authenticated users:

- Current password verification
- New password validation and confirmation
- Integration with password change mutation
- Success feedback and session handling

#### TASK-013: Email Verification Component

You WILL create `src/app/auth/components/email-verification/` with:

- Email verification token handling
- Resend verification email functionality
- Success/failure state management
- User guidance messaging

#### TASK-014: Account Activation Component

You WILL create `src/app/auth/components/account-activation/` with:

- Account activation token processing
- Final account setup steps
- Integration with activation GraphQL mutation
- Welcome messaging and next steps

### Phase 3: OAuth Integration

#### TASK-015: Google OAuth Configuration

You WILL create OAuth configuration in `src/environments/`:

- Environment-specific Google OAuth client IDs
- Redirect URI configuration
- Scope definitions for profile and email access
- Security configurations

#### TASK-016: OAuth Service Implementation

You WILL create `src/app/auth/services/oauth.service.ts` with:

- Google OAuth integration using angular-oauth2-oidc
- OAuth flow initiation and callback handling
- Token exchange with backend
- Account linking functionality for existing users

#### TASK-017: OAuth Callback Handler

You WILL create `src/app/auth/components/oauth-callback/` with:

- OAuth authorization code processing
- Error handling for OAuth failures
- User feedback during processing
- Redirect to appropriate post-login destination

#### TASK-018: Social Login Buttons

You WILL create reusable social login components:

- Google login button with proper branding
- Consistent styling with TailwindCSS
- Loading states during OAuth flow
- Error handling and retry mechanisms

#### TASK-019: OAuth Account Linking

You WILL implement account linking functionality:

- Link OAuth accounts to existing email accounts
- Conflict resolution for duplicate accounts
- User confirmation workflows
- Security validations

#### TASK-020: OAuth Account Management

You WILL create account disconnection features:

- Remove OAuth provider connections
- Ensure alternative login methods exist
- Security confirmations
- Profile update integration

#### TASK-021: Extensible OAuth Interface

You WILL create `src/app/auth/interfaces/oauth-provider.interface.ts`:

- Generic OAuth provider interface
- Support for future providers (Facebook, Microsoft, etc.)
- Consistent API patterns
- Configuration management

### Phase 4: Role-Based Access Control

#### TASK-022: Role and Permission Models

You WILL create `src/app/auth/models/` with TypeScript interfaces:

- `User` interface with role and permission properties
- `Role` interface (Volunteer, Organizer, Admin)
- `Permission` interface for fine-grained access
- GraphQL type integration

#### TASK-023: Permission Checking Service

You WILL enhance the permission service with:

- Real-time permission checking against backend
- Caching strategy for performance
- Permission inheritance and hierarchical roles
- Methods: `checkPermission()`, `bulkCheckPermissions()`, `refreshPermissions()`

#### TASK-024: Role-Based Directives

You WILL create Angular directives in `src/app/auth/directives/`:

- `*hasPermission` structural directive for conditional rendering
- `*hasRole` structural directive for role-based visibility
- `[requiresAuth]` attribute directive for authentication checks
- Performance optimizations with OnPush change detection

#### TASK-025: Permission-Based Route Guards

You WILL enhance route guards with:

- Dynamic permission checking from route configuration
- Nested route permission inheritance
- Fallback routes for insufficient permissions
- Loading states during permission resolution

#### TASK-026: Dynamic Navigation

You WILL implement role-based navigation:

- Menu items filtered by user permissions
- Dynamic route availability
- Role-based feature toggling
- Consistent user experience across roles

#### TASK-027: Admin Role Management Interface

You WILL create admin components for role management:

- User role assignment interface
- Permission matrix management
- Bulk role operations
- Audit trail for role changes

#### TASK-028: Audit Logging

You WILL implement authentication audit logging:

- Login/logout event tracking
- Permission changes logging
- Role assignment audit trail
- Security event monitoring

### Phase 5: Security and Session Management

#### TASK-029: Session Timeout Management

You WILL implement automatic session timeout:

- Configurable timeout duration
- Warning notifications before timeout
- Graceful session extension
- Secure logout on timeout

#### TASK-030: Concurrent Session Management

You WILL create session limit enforcement:

- Maximum concurrent session limits
- Session conflict resolution
- Device/browser session tracking
- User notification for session limits

#### TASK-031: Session Activity Tracking

You WILL implement activity monitoring:

- User activity detection and tracking
- Idle session management
- Activity-based session extension
- Security monitoring integration

#### TASK-032: Secure Logout Implementation

You WILL create comprehensive logout functionality:

- Token invalidation on backend
- Complete session cleanup
- Secure redirect handling
- Cache clearing and state reset

#### TASK-033: Brute Force Protection

You Will implement login attempt protection:

- Rate limiting for login attempts
- Progressive delay for failed attempts
- Account lockout mechanisms
- CAPTCHA integration for suspicious activity

#### TASK-034: Security Event Logging

You WILL create security monitoring:

- Failed login attempt logging
- Suspicious activity detection
- Security violation reporting
- Integration with monitoring systems

#### TASK-035: Account Lockout Management

You WILL implement account security measures:

- Automatic account lockout for security violations
- Manual lockout capabilities for admins
- Account unlock procedures
- User notification systems

### Phase 6: Error Handling and User Experience

#### TASK-036: Comprehensive Error Handling

You WILL create robust error management:

- GraphQL error parsing and user-friendly messages
- Network error handling with retry mechanisms
- Validation error display with specific guidance
- Fallback error handling for unexpected scenarios

#### TASK-037: User-Friendly Error Messages

You WILL implement clear error communication:

- Context-specific error messages
- Recovery action suggestions
- Progressive error disclosure
- Accessibility-compliant error presentation

#### TASK-038: Loading States and Progress

You WILL create smooth user experience:

- Loading spinners for authentication operations
- Progress indicators for multi-step processes
- Skeleton loading for content
- Optimistic UI updates where appropriate

#### TASK-039: Offline Authentication Handling

You WILL implement offline capabilities:

- Cached authentication state persistence
- Offline-first authentication checking
- Queue authentication operations when offline
- Graceful degradation for offline scenarios

#### TASK-040: Cross-Session Persistence

You WILL ensure state persistence:

- Authentication state across browser sessions
- User preferences and settings persistence
- Secure storage of non-sensitive user data
- Session recovery mechanisms

#### TASK-041: Authentication Analytics

You WILL implement user journey tracking:

- Authentication funnel analytics
- User registration completion rates
- Login method preferences tracking
- A/B testing support for authentication flows

#### TASK-042: Accessibility Features

You WILL ensure inclusive design:

- Screen reader compatibility for all auth components
- Keyboard navigation support
- High contrast mode support
- ARIA labels and semantic markup

### Phase 7: Testing and Validation

#### TASK-043: Unit Testing Suite

You WILL create comprehensive unit tests using Jest:

- Service testing with mocked dependencies
- Component testing with Angular Testing Library
- Guard testing with mock route scenarios
- Interceptor testing with mock HTTP requests

#### TASK-044: Integration Testing

You WILL create integration tests:

- OAuth flow testing with mock providers
- Token refresh integration testing
- GraphQL integration testing
- Error handling integration testing

#### TASK-045: End-to-End Testing

You WILL create E2E tests using Cypress:

- Complete registration and login flows
- Password reset workflows
- OAuth authentication journeys
- Role-based access testing

#### TASK-046: Security Testing

You WILL implement security validation:

- XSS protection testing
- CSRF protection validation
- JWT token security testing
- Input sanitization verification

#### TASK-047: Performance Testing

You WILL create performance validations:

- Authentication operation performance testing
- Token refresh performance optimization
- Memory leak detection
- Bundle size optimization

#### TASK-048: Monitoring and Alerting

You WILL implement production monitoring:

- Authentication failure rate monitoring
- Performance metric tracking
- Error rate alerting
- Security event notifications

#### TASK-049: Security Audit

You WILL conduct comprehensive security review:

- Authentication flow security analysis
- Token handling security validation
- Permission system security review
- OWASP compliance verification

## File Structure Requirements

You MUST create the following exact file structure:

```
src/app/auth/
├── auth.module.ts                    # Authentication module configuration
├── services/
│   ├── auth.service.ts              # Core authentication service
│   ├── token.service.ts             # JWT token management
│   ├── oauth.service.ts             # OAuth provider integration
│   ├── permission.service.ts        # Role-based access control
│   ├── session.service.ts           # Session management
│   └── security.service.ts          # Security utilities and validation
├── guards/
│   ├── auth.guard.ts                # Authentication route guard
│   ├── role.guard.ts                # Role-based route guard
│   └── permission.guard.ts          # Permission-based route guard
├── interceptors/
│   ├── auth.interceptor.ts          # HTTP token interceptor
│   ├── error.interceptor.ts         # Authentication error handling
│   └── refresh.interceptor.ts       # Token refresh interceptor
├── components/
│   ├── login/
│   │   ├── login.component.ts       # Login form component
│   │   ├── login.component.html     # Login template
│   │   └── login.component.scss     # Login styles
│   ├── register/
│   │   ├── register.component.ts    # Registration form
│   │   ├── register.component.html  # Registration template
│   │   └── register.component.scss  # Registration styles
│   ├── password-reset/
│   │   ├── password-reset.component.ts
│   │   ├── password-reset.component.html
│   │   └── password-reset.component.scss
│   ├── password-reset-confirm/
│   │   ├── password-reset-confirm.component.ts
│   │   ├── password-reset-confirm.component.html
│   │   └── password-reset-confirm.component.scss
│   ├── password-change/
│   │   ├── password-change.component.ts
│   │   ├── password-change.component.html
│   │   └── password-change.component.scss
│   ├── email-verification/
│   │   ├── email-verification.component.ts
│   │   ├── email-verification.component.html
│   │   └── email-verification.component.scss
│   ├── account-activation/
│   │   ├── account-activation.component.ts
│   │   ├── account-activation.component.html
│   │   └── account-activation.component.scss
│   ├── oauth-callback/
│   │   ├── oauth-callback.component.ts
│   │   ├── oauth-callback.component.html
│   │   └── oauth-callback.component.scss
│   └── social-login/
│       ├── social-login.component.ts
│       ├── social-login.component.html
│       └── social-login.component.scss
├── directives/
│   ├── has-permission.directive.ts  # Permission-based visibility
│   ├── has-role.directive.ts        # Role-based visibility
│   └── requires-auth.directive.ts   # Authentication requirement
├── models/
│   ├── auth.models.ts               # Authentication interfaces
│   ├── user.models.ts               # User and role interfaces
│   ├── security.models.ts           # Security-related interfaces
│   └── oauth.models.ts              # OAuth provider interfaces
├── validators/
│   ├── password.validator.ts        # Password strength validation
│   ├── email.validator.ts           # Email format validation
│   └── security.validator.ts        # Security constraint validation
└── interfaces/
    ├── oauth-provider.interface.ts  # OAuth provider interface
    └── permission.interface.ts      # Permission system interface
```

## GraphQL Integration Requirements

You MUST create GraphQL operations in:

```
src/app/graphql/auth/
├── auth.queries.ts                  # Authentication GraphQL queries
├── auth.mutations.ts                # Authentication GraphQL mutations
├── auth.fragments.ts                # Reusable GraphQL fragments
└── auth.types.ts                    # Generated TypeScript types
```

### Required GraphQL Operations

#### Mutations You MUST Implement:

```graphql
mutation Login($email: String!, $password: String!) {
  login(input: { email: $email, password: $password }) {
    user {
      id
      email
      name
      roles
    }
    accessToken
    refreshToken
  }
}

mutation Register($input: RegisterInput!) {
  register(input: $input) {
    user {
      id
      email
      name
    }
    accessToken
    refreshToken
  }
}

mutation RefreshToken($refreshToken: String!) {
  refreshToken(refreshToken: $refreshToken) {
    accessToken
    refreshToken
  }
}

mutation RequestPasswordReset($email: String!) {
  requestPasswordReset(email: $email) {
    success
    message
  }
}

mutation ResetPassword($token: String!, $newPassword: String!) {
  resetPassword(token: $token, newPassword: $newPassword) {
    success
    message
  }
}

mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
  changePassword(currentPassword: $currentPassword, newPassword: $newPassword) {
    success
    message
  }
}

mutation VerifyEmail($token: String!) {
  verifyEmail(token: $token) {
    success
    message
  }
}

mutation Logout {
  logout {
    success
  }
}
```

#### Queries You MUST Implement:

```graphql
query CurrentUser {
  currentUser {
    id
    email
    name
    roles
    permissions
    emailVerified
    lastLogin
    profilePicture
  }
}

query UserPermissions {
  userPermissions {
    resource
    actions
  }
}
```

## Dependencies You MUST Install

You WILL install these exact dependencies:

```bash
npm install @angular/material angular-oauth2-oidc crypto-js jsonwebtoken
npm install --save-dev @types/crypto-js @types/jsonwebtoken
```

## Security Requirements

You MUST implement these security measures:

### Token Security

- Store refresh tokens in HTTP-only cookies with secure and SameSite flags
- Store access tokens in memory only (not localStorage)
- Implement automatic token refresh before expiration
- Clear all tokens on logout and security events

### Input Validation

- Sanitize all user inputs before processing
- Implement server-side validation mirroring
- Use Angular's built-in XSS protection
- Validate all data before GraphQL operations

### Session Security

- Implement session timeout with configurable duration
- Track and limit concurrent sessions
- Monitor for suspicious activity patterns
- Implement progressive authentication delays

### Password Security

- Enforce strong password requirements (8+ chars, uppercase, lowercase, number, special)
- Implement secure password reset with time-limited tokens
- Hash passwords on frontend before transmission (additional security layer)
- Prevent password reuse for a configurable number of previous passwords

## Testing Requirements

You MUST create comprehensive tests:

### Unit Tests (Jest)

- Achieve 90%+ code coverage for authentication services
- Test all error scenarios and edge cases
- Mock all external dependencies and HTTP calls
- Test component behavior with various authentication states

### Integration Tests

- Test complete authentication flows
- Test OAuth integration with mock providers
- Test token refresh scenarios
- Test role-based access control integration

### E2E Tests (Cypress)

- Test complete user registration journey
- Test login/logout workflows
- Test password reset functionality
- Test role-based navigation and access

## Error Handling Requirements

You MUST implement robust error handling:

### Network Errors

- Implement retry mechanisms for transient failures
- Show appropriate user messages for network issues
- Handle offline scenarios gracefully
- Provide recovery actions for users

### Authentication Errors

- Display specific, actionable error messages
- Handle expired tokens automatically
- Manage authentication state consistently
- Provide clear guidance for resolution

### Validation Errors

- Show field-specific validation messages
- Implement real-time validation feedback
- Provide clear formatting requirements
- Support internationalization for error messages

## Performance Requirements

You MUST meet these performance targets:

### Load Times

- Initial authentication check: < 100ms
- Login operation: < 2 seconds
- Token refresh: < 500ms
- Component loading: < 200ms

### Bundle Size

- Authentication module: < 50KB gzipped
- Tree-shake unused authentication features
- Lazy load authentication components
- Optimize dependency imports

### Memory Usage

- Efficient token storage and cleanup
- Proper subscription management
- Avoid memory leaks in long-running sessions
- Optimize permission checking performance

## Accessibility Requirements

You MUST ensure accessibility compliance:

### Screen Reader Support

- Proper ARIA labels for all form elements
- Descriptive error announcements
- Logical tab order for all components
- Semantic HTML structure

### Keyboard Navigation

- Full keyboard navigation support
- Visible focus indicators
- Logical tab sequences
- Escape key handling for modals

### Visual Accessibility

- High contrast color support
- Scalable text and UI elements
- Clear visual hierarchy
- Color-blind friendly design

## Implementation Order

You MUST implement in this exact order:

1. **Phase 1 (Foundation)**: Start with core services and infrastructure
2. **Phase 2 (Components)**: Build user-facing authentication components
3. **Phase 3 (OAuth)**: Integrate Google OAuth and social login
4. **Phase 4 (RBAC)**: Implement role-based access control
5. **Phase 5 (Security)**: Add advanced security features
6. **Phase 6 (UX)**: Enhance error handling and user experience
7. **Phase 7 (Testing)**: Create comprehensive test suite

## Validation Criteria

Before considering any phase complete, you MUST ensure:

### Code Quality

- All TypeScript code follows strict typing (no `any` types)
- Consistent code formatting with Prettier
- ESLint compliance with zero warnings
- Proper documentation with JSDoc comments

### Functionality

- All authentication flows work end-to-end
- Error scenarios are handled gracefully
- Performance targets are met
- Accessibility requirements are satisfied

### Security

- All security requirements are implemented
- Token handling follows best practices
- Input validation is comprehensive
- Security testing passes all checks

### Testing

- Unit test coverage exceeds 90%
- Integration tests cover critical paths
- E2E tests validate user journeys
- Performance tests validate targets

## Final Deliverables

You MUST provide:

1. **Complete Authentication System**: All 49 tasks implemented according to specifications
2. **Comprehensive Test Suite**: Unit, integration, and E2E tests with high coverage
3. **Documentation**: Implementation guide and API documentation
4. **Performance Report**: Benchmarks and optimization recommendations
5. **Security Audit**: Security analysis and compliance verification

## Success Criteria

The implementation is complete when:

- [ ] All 49 implementation tasks are completed
- [ ] All authentication flows work seamlessly
- [ ] Security requirements are fully implemented
- [ ] Performance targets are met or exceeded
- [ ] Test coverage exceeds 90% for critical paths
- [ ] Accessibility requirements are satisfied
- [ ] Code quality standards are met
- [ ] Production deployment is successful

---

**CRITICAL**: You MUST start with Phase 1 (Foundation) and work sequentially through all phases. Each phase builds upon the previous one, and skipping steps will result in integration failures and security vulnerabilities. The authentication system is the foundation for the entire application, so it MUST be implemented correctly and securely.
