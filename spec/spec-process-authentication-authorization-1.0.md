---
title: Authentication and Authorization Process Specification
version: 1.0, 2025-09-04
date_created: 2025-09-04
last_updated: 2025-09-04
owner: Security and Frontend Teams
tags:
  [
    authentication,
    authorization,
    security,
    oauth,
    jwt,
    sessions,
    access-control,
  ]
---

# Authentication and Authorization Process Specification

## 1. Purpose & Scope

### 1.1 Purpose

This specification defines the complete authentication and authorization processes for the VolunteerSync frontend application, including user registration, login workflows, session management, access control, and security requirements to ensure secure user access and data protection.

### 1.2 Scope

- **In Scope**: User registration and verification, login/logout processes, OAuth integration, JWT token management, session handling, role-based access control, password management, security headers and policies
- **Out of Scope**: Backend authentication implementation, database user storage, server-side session management (covered in backend specifications)

### 1.3 Target Audience

- Frontend developers implementing authentication features
- Security engineers reviewing access control mechanisms
- Product managers understanding user onboarding flows
- QA engineers testing authentication scenarios

## 2. Definitions

### 2.1 Authentication Terms

- **Authentication**: Process of verifying user identity through credentials
- **Authorization**: Process of determining user permissions and access rights
- **JWT (JSON Web Token)**: Stateless token format for secure information transmission
- **OAuth 2.0**: Industry-standard authorization framework for third-party access
- **OIDC (OpenID Connect)**: Identity layer built on top of OAuth 2.0
- **Session**: Period of user activity between login and logout
- **Refresh Token**: Long-lived token used to obtain new access tokens

### 2.2 Authorization Concepts

- **Role-Based Access Control (RBAC)**: Access control based on user roles
- **Permission**: Specific action a user can perform on a resource
- **Resource**: Protected entity requiring authorization to access
- **Principal**: Authenticated user or service requesting access
- **Access Token**: Short-lived token containing user permissions

### 2.3 Security Terms

- **CSRF (Cross-Site Request Forgery)**: Attack exploiting user's authenticated session
- **XSS (Cross-Site Scripting)**: Injection of malicious scripts into web pages
- **PKCE (Proof Key for Code Exchange)**: OAuth security extension for public clients
- **Content Security Policy (CSP)**: Security mechanism preventing code injection attacks

## 3. Requirements, Constraints & Guidelines

### 3.1 Authentication Requirements

#### AR-001: Multi-Method Registration Support

- **Requirement**: Users MUST be able to register using email/password OR Google OAuth
- **Rationale**: Flexibility in user onboarding, reduced friction for social media users
- **Implementation**: Unified registration flow with method selection, account linking capability
- **Validation**: Both registration methods create equivalent user accounts

#### AR-002: Email Verification Mandatory

- **Requirement**: All email-based registrations MUST require email verification before account activation
- **Rationale**: Prevents fake accounts, ensures valid contact information
- **Implementation**: Email verification link with 24-hour expiration, resend capability
- **Validation**: Unverified accounts cannot access protected features

#### AR-003: Secure Password Requirements

- **Requirement**: Passwords MUST meet strength requirements: minimum 8 characters, uppercase, lowercase, number
- **Rationale**: Reduces risk of credential-based attacks, improves account security
- **Implementation**: Real-time password strength validation, clear feedback messaging
- **Validation**: Weak passwords rejected with specific improvement guidance

#### AR-004: OAuth 2.0 + OIDC Integration

- **Requirement**: Google OAuth integration MUST use OIDC for identity information
- **Rationale**: Standardized identity claims, improved user experience, reduced development complexity
- **Implementation**: Google Identity Services, PKCE flow for security, profile data import
- **Validation**: OAuth flow completes successfully with user profile population

### 3.2 Session Management Requirements

#### SM-001: JWT-Based Authentication

- **Requirement**: Authentication MUST use JWT tokens for stateless session management
- **Rationale**: Scalability, reduced server state, mobile app compatibility
- **Implementation**: Access tokens (15 minutes), refresh tokens (7 days), automatic refresh
- **Validation**: Tokens contain required claims, expire appropriately, refresh seamlessly

#### SM-002: Secure Token Storage

- **Requirement**: Authentication tokens MUST be stored securely in the browser
- **Rationale**: Prevents token theft, reduces XSS attack surface
- **Implementation**: httpOnly cookies for refresh tokens, memory storage for access tokens
- **Validation**: Tokens not accessible via JavaScript, cleared on logout

#### SM-003: Session Timeout and Renewal

- **Requirement**: User sessions MUST timeout after inactivity and renew automatically during active use
- **Rationale**: Security best practice, improved user experience
- **Implementation**: 15-minute access token expiration, activity-based refresh, logout warning
- **Validation**: Inactive sessions expire, active sessions continue seamlessly

#### SM-004: Secure Logout Process

- **Requirement**: Logout MUST invalidate all tokens and clear authentication state
- **Rationale**: Prevents unauthorized access after logout, security best practice
- **Implementation**: Token revocation, local storage clearing, redirect to login
- **Validation**: Post-logout requests fail authentication, no residual auth data

### 3.3 Authorization Requirements

#### AZ-001: Role-Based Access Control

- **Requirement**: User permissions MUST be managed through role-based access control system
- **Rationale**: Scalable permission management, clear security model
- **Implementation**: User roles (volunteer, organizer, admin), permission inheritance
- **Validation**: Users only access permitted features, role changes reflected immediately

#### AZ-002: Route Protection

- **Requirement**: Protected routes MUST require authentication and appropriate permissions
- **Rationale**: Prevents unauthorized access to sensitive features
- **Implementation**: Angular route guards, role-based route access, redirect to login
- **Validation**: Unauthenticated users redirected, unauthorized users see 403 error

#### AZ-003: Component-Level Authorization

- **Requirement**: UI components MUST conditionally render based on user permissions
- **Rationale**: Prevents confusion, improves user experience, defense in depth
- **Implementation**: Permission directives, component guards, conditional rendering
- **Validation**: Unauthorized features hidden from UI, graceful degradation

### 3.4 Security Constraints

#### SC-001: HTTPS-Only Communication

- **Constraint**: All authentication-related communication MUST use HTTPS
- **Rationale**: Prevents credential interception, industry security standard
- **Impact**: SSL/TLS certificates required, HTTP requests redirected
- **Validation**: No authentication data transmitted over HTTP

#### SC-002: Content Security Policy

- **Constraint**: Application MUST implement strict Content Security Policy headers
- **Rationale**: Prevents XSS attacks, reduces code injection risks
- **Impact**: Inline scripts prohibited, external resource restrictions
- **Validation**: CSP violations logged and blocked, no security exceptions

#### SC-003: CSRF Protection

- **Constraint**: State-changing requests MUST include CSRF protection
- **Rationale**: Prevents cross-site request forgery attacks
- **Impact**: CSRF tokens required for mutations, additional request overhead
- **Validation**: Requests without valid CSRF tokens rejected

## 4. Interfaces & Data Contracts

### 4.1 Authentication Service Interface

#### User Registration Contract

```typescript
interface UserRegistrationRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
  marketingConsent?: boolean;
}

interface UserRegistrationResponse {
  success: boolean;
  userId: string;
  verificationEmailSent: boolean;
  errors?: ValidationError[];
}

interface ValidationError {
  field: string;
  code: string;
  message: string;
}
```

#### Authentication Contract

```typescript
interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface OAuthLoginRequest {
  provider: "google";
  authorizationCode: string;
  codeVerifier: string;
}

interface AuthenticationResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserProfile;
  permissions: Permission[];
}

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  roles: Role[];
  emailVerified: boolean;
  lastLoginAt: Date;
}
```

#### Session Management Contract

```typescript
interface SessionState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  permissions: Set<string>;
  accessToken: string | null;
  tokenExpiresAt: Date | null;
  lastActivity: Date;
}

interface RefreshTokenRequest {
  refreshToken: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
  refreshToken?: string; // Optional token rotation
}
```

### 4.2 Authorization Service Interface

#### Permission and Role Contracts

```typescript
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isDefault: boolean;
}

interface Permission {
  id: string;
  resource: string;
  action: string;
  scope?: string;
  description: string;
}

interface AuthorizationCheck {
  resource: string;
  action: string;
  context?: Record<string, any>;
}

interface AuthorizationResult {
  allowed: boolean;
  reason?: string;
  requiredPermissions?: Permission[];
}
```

### 4.3 Security Configuration Contracts

#### JWT Configuration

```typescript
interface JWTConfig {
  accessTokenExpiry: number; // 15 minutes
  refreshTokenExpiry: number; // 7 days
  issuer: string;
  audience: string;
  algorithm: "RS256" | "HS256";
  publicKeyUrl?: string;
}

interface OAuthConfig {
  google: {
    clientId: string;
    redirectUri: string;
    scopes: string[];
    pkce: boolean;
  };
}
```

## 5. Acceptance Criteria

### 5.1 Registration and Login Criteria

#### AC-001: Email Registration Flow

- **Criterion**: Users can complete email registration in under 2 minutes
- **Validation**: E2E test measures registration completion time
- **Test**: Registration form validation prevents submission with invalid data

#### AC-002: OAuth Integration

- **Criterion**: Google OAuth login completes successfully with profile data import
- **Validation**: OAuth flow test verifies Google integration
- **Test**: User profile populated with Google account information

#### AC-003: Email Verification

- **Criterion**: Email verification links work correctly and expire appropriately
- **Validation**: Verification email received within 30 seconds
- **Test**: Expired verification links show appropriate error message

#### AC-004: Password Security

- **Criterion**: Password strength requirements enforced with helpful feedback
- **Validation**: Weak passwords rejected with specific guidance
- **Test**: Password strength indicator updates in real-time

### 5.2 Session Management Criteria

#### SC-001: Token Lifecycle Management

- **Criterion**: JWT tokens expire and refresh automatically without user intervention
- **Validation**: Access tokens expire after 15 minutes, refresh seamlessly
- **Test**: Active users don't experience authentication interruptions

#### SC-002: Secure Storage Validation

- **Criterion**: Authentication tokens not accessible via JavaScript or browser tools
- **Validation**: Refresh tokens stored in httpOnly cookies
- **Test**: Access tokens cleared from memory on tab close

#### SC-003: Logout Completeness

- **Criterion**: Logout completely clears authentication state and invalidates tokens
- **Validation**: Post-logout API requests return 401 Unauthorized
- **Test**: Browser storage contains no authentication artifacts after logout

### 5.3 Authorization Criteria

#### AZ-001: Role-Based Access Validation

- **Criterion**: Users only access features permitted by their roles
- **Validation**: Role-restricted routes return 403 for unauthorized users
- **Test**: UI elements conditionally render based on user permissions

#### AZ-002: Real-Time Permission Updates

- **Criterion**: Permission changes reflect immediately without requiring re-login
- **Validation**: Permission updates broadcast to active sessions
- **Test**: Role changes update UI without page refresh

## 6. Test Automation Strategy

### 6.1 Authentication Testing Approach

#### Unit Tests for Authentication Services

```typescript
describe("AuthenticationService", () => {
  describe("login", () => {
    it("should authenticate user with valid credentials", async () => {
      const credentials = {
        email: "user@example.com",
        password: "ValidPassword123",
      };

      const result = await authService.login(credentials);

      expect(result.success).toBe(true);
      expect(result.accessToken).toBeDefined();
      expect(result.user.email).toBe(credentials.email);
    });

    it("should reject authentication with invalid credentials", async () => {
      const credentials = {
        email: "user@example.com",
        password: "WrongPassword",
      };

      await expect(authService.login(credentials)).rejects.toThrow(
        "Invalid credentials"
      );
    });
  });

  describe("token refresh", () => {
    it("should refresh tokens automatically before expiration", () => {
      jest.useFakeTimers();

      // Setup token that expires in 1 minute
      authService.setTokens(accessToken, refreshToken);

      // Advance time to trigger refresh
      jest.advanceTimersByTime(14 * 60 * 1000); // 14 minutes

      expect(authService.refreshToken).toHaveBeenCalled();
    });
  });
});
```

#### Integration Tests for OAuth Flow

```typescript
describe("OAuth Integration", () => {
  it("should complete Google OAuth flow successfully", () => {
    cy.visit("/login");
    cy.get('[data-testid="google-login"]').click();

    // Mock Google OAuth response
    cy.intercept("POST", "/auth/oauth/google", {
      statusCode: 200,
      body: {
        success: true,
        accessToken: "mock-access-token",
        user: { email: "user@example.com", firstName: "John", lastName: "Doe" },
      },
    });

    // Verify redirect to dashboard
    cy.url().should("include", "/dashboard");
    cy.get('[data-testid="user-profile"]').should("contain", "John Doe");
  });
});
```

### 6.2 Authorization Testing Strategy

#### Route Guard Testing

```typescript
describe("Route Guards", () => {
  describe("AuthGuard", () => {
    it("should allow access to authenticated users", () => {
      authService.setAuthenticated(true);

      const canActivate = guard.canActivate();

      expect(canActivate).toBe(true);
    });

    it("should redirect unauthenticated users to login", () => {
      authService.setAuthenticated(false);

      const canActivate = guard.canActivate();

      expect(canActivate).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(["/login"]);
    });
  });

  describe("RoleGuard", () => {
    it("should allow access to users with required role", () => {
      authService.setUserRoles(["organizer"]);

      const canActivate = roleGuard.canActivate(
        createMockActivatedRouteSnapshot({ requiredRole: "organizer" })
      );

      expect(canActivate).toBe(true);
    });
  });
});
```

### 6.3 Security Testing Automation

#### Security Vulnerability Tests

```typescript
describe("Security Tests", () => {
  describe("CSRF Protection", () => {
    it("should reject requests without CSRF token", () => {
      cy.request({
        method: "POST",
        url: "/api/events",
        body: { title: "Test Event" },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(403);
      });
    });
  });

  describe("XSS Prevention", () => {
    it("should sanitize user input in forms", () => {
      const maliciousInput = '<script>alert("xss")</script>';

      cy.get('[data-testid="event-title"]').type(maliciousInput);
      cy.get('[data-testid="submit-event"]').click();

      // Verify script not executed
      cy.window().then((win) => {
        expect(win.alert).not.to.have.been.called;
      });
    });
  });
});
```

## 7. Rationale & Context

### 7.1 Authentication Architecture Decisions

#### ADR-001: JWT Token Strategy

- **Decision**: Use JWT access tokens with refresh token rotation
- **Context**: Need for stateless authentication with security best practices
- **Alternatives Considered**: Session-based auth, OAuth-only approach
- **Reasons for Selection**:
  - **Stateless**: No server-side session storage required
  - **Scalable**: Works across multiple services and mobile apps
  - **Secure**: Short-lived access tokens with secure refresh mechanism
  - **Standard**: Industry-standard approach with library support
- **Consequences**: Token management complexity, refresh flow implementation required

#### ADR-002: OAuth + Email Registration Hybrid

- **Decision**: Support both OAuth and traditional email/password registration
- **Context**: User preference diversity and accessibility requirements
- **Alternatives Considered**: OAuth-only, email-only authentication
- **Reasons for Selection**:
  - **User Choice**: Accommodates different user preferences
  - **Accessibility**: Not all users have Google accounts
  - **Control**: Maintains direct user relationship for email users
  - **Fallback**: Provides backup authentication method
- **Consequences**: Increased complexity, account linking requirements

#### ADR-003: Role-Based Authorization Model

- **Decision**: Implement RBAC with hierarchical permissions
- **Context**: Need for flexible permission management across user types
- **Alternatives Considered**: Attribute-based access control, simple user types
- **Reasons for Selection**:
  - **Scalability**: Easy to add new roles and permissions
  - **Clarity**: Clear permission model for developers and users
  - **Maintenance**: Centralized permission management
  - **Flexibility**: Supports complex authorization scenarios
- **Consequences**: Initial setup complexity, permission modeling requirements

### 7.2 Security Implementation Strategy

#### Defense in Depth Approach

- **Strategy**: Multiple layers of security controls for comprehensive protection
- **Layers**: Network security, authentication, authorization, input validation, output encoding
- **Implementation**: HTTPS, JWT validation, RBAC, CSP headers, input sanitization
- **Monitoring**: Security logging, anomaly detection, vulnerability scanning

#### Zero-Trust Security Model

- **Principle**: Never trust, always verify user identity and permissions
- **Implementation**: Every request validates authentication and authorization
- **Benefits**: Reduced attack surface, improved security posture
- **Challenges**: Performance overhead, increased complexity

## 8. Dependencies & External Integrations

### 8.1 External Authentication Providers

#### Google Identity Services

- **Purpose**: OAuth 2.0 and OpenID Connect authentication
- **Integration**: Google Identity Services JavaScript library
- **Configuration**: Client ID, redirect URIs, authorized domains
- **Security**: PKCE flow, nonce validation, scope limitations

#### JWT Verification Dependencies

- **Library**: jose or similar JWT library for token validation
- **Purpose**: Access token signature verification and claims extraction
- **Configuration**: Public key fetching, issuer validation, audience checks
- **Performance**: Token validation caching, public key rotation handling

### 8.2 Security Infrastructure Dependencies

#### Content Security Policy Configuration

```html
<meta
  http-equiv="Content-Security-Policy"
  content="
  default-src 'self';
  script-src 'self' https://accounts.google.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://api.volunteersync.com;
  frame-src https://accounts.google.com;
"
/>
```

#### HTTPS and Security Headers

```typescript
// Security headers configuration
const securityHeaders = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};
```

### 8.3 Browser Storage and Cookie Configuration

#### Cookie Security Configuration

```typescript
interface CookieConfig {
  httpOnly: boolean; // true for refresh tokens
  secure: boolean; // true in production (HTTPS)
  sameSite: "strict"; // CSRF protection
  maxAge: number; // 7 days for refresh tokens
  domain?: string; // Optional domain specification
  path: string; // '/' for application-wide
}
```

## 9. Examples & Edge Cases

### 9.1 Authentication Flow Examples

#### Complete Registration Flow

```typescript
@Component({
  selector: "app-register",
  template: `
    <form [formGroup]="registrationForm" (ngSubmit)="onRegister()">
      <mat-form-field>
        <mat-label>Email</mat-label>
        <input matInput formControlName="email" type="email" />
        <mat-error *ngIf="registrationForm.get('email')?.hasError('email')">
          Please enter a valid email address
        </mat-error>
      </mat-form-field>

      <mat-form-field>
        <mat-label>Password</mat-label>
        <input matInput formControlName="password" type="password" />
        <mat-hint>
          <app-password-strength
            [password]="registrationForm.get('password')?.value"
          >
          </app-password-strength>
        </mat-hint>
      </mat-form-field>

      <div class="oauth-section">
        <button type="button" (click)="signInWithGoogle()">
          <img src="google-logo.svg" alt="Google" /> Sign up with Google
        </button>
      </div>

      <button
        mat-raised-button
        color="primary"
        type="submit"
        [disabled]="registrationForm.invalid"
      >
        Create Account
      </button>
    </form>
  `,
})
export class RegisterComponent {
  registrationForm = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required, this.passwordValidator]],
    firstName: ["", Validators.required],
    lastName: ["", Validators.required],
    acceptTerms: [false, Validators.requiredTrue],
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  async onRegister() {
    if (this.registrationForm.valid) {
      try {
        const result = await this.authService.register(
          this.registrationForm.value
        );
        if (result.success) {
          this.router.navigate(["/verify-email"]);
        }
      } catch (error) {
        this.handleRegistrationError(error);
      }
    }
  }

  async signInWithGoogle() {
    try {
      const result = await this.authService.signInWithGoogle();
      if (result.success) {
        this.router.navigate(["/dashboard"]);
      }
    } catch (error) {
      this.handleOAuthError(error);
    }
  }

  private passwordValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const isLongEnough = password.length >= 8;

    if (hasUpper && hasLower && hasNumber && isLongEnough) {
      return null;
    }

    return {
      passwordStrength: {
        hasUpper,
        hasLower,
        hasNumber,
        isLongEnough,
      },
    };
  }
}
```

#### JWT Token Management Service

```typescript
@Injectable({
  providedIn: "root",
})
export class TokenService {
  private readonly ACCESS_TOKEN_KEY = "access_token";
  private refreshTimer?: number;

  constructor(private http: HttpClient) {
    this.setupTokenRefresh();
  }

  setTokens(accessToken: string, refreshToken: string): void {
    // Store access token in memory
    sessionStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);

    // Store refresh token in httpOnly cookie (handled by server)
    this.scheduleTokenRefresh(accessToken);
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  private scheduleTokenRefresh(token: string): void {
    const payload = this.parseJWTPayload(token);
    const expiresAt = payload.exp * 1000; // Convert to milliseconds
    const refreshAt = expiresAt - 5 * 60 * 1000; // Refresh 5 minutes before expiry
    const delay = refreshAt - Date.now();

    if (delay > 0) {
      this.refreshTimer = window.setTimeout(() => {
        this.refreshAccessToken();
      }, delay);
    }
  }

  private async refreshAccessToken(): Promise<void> {
    try {
      const response = await this.http
        .post<RefreshTokenResponse>(
          "/api/auth/refresh",
          {}, // Refresh token sent automatically in httpOnly cookie
          { withCredentials: true }
        )
        .toPromise();

      if (response?.accessToken) {
        this.setTokens(response.accessToken, ""); // Refresh token handled by server
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      this.logout();
    }
  }

  logout(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);

    // Clear refresh token cookie (handled by server)
    this.http
      .post("/api/auth/logout", {}, { withCredentials: true })
      .subscribe();
  }

  private parseJWTPayload(token: string): any {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  }
}
```

### 9.2 Authorization Implementation Examples

#### Route Guard with Role-Based Access

```typescript
@Injectable({
  providedIn: "root",
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data["roles"] as string[];
    const userRoles = this.authService.getUserRoles();

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(["/login"]);
      return false;
    }

    if (requiredRoles && !this.hasRequiredRole(userRoles, requiredRoles)) {
      this.router.navigate(["/unauthorized"]);
      return false;
    }

    return true;
  }

  private hasRequiredRole(
    userRoles: string[],
    requiredRoles: string[]
  ): boolean {
    return requiredRoles.some((role) => userRoles.includes(role));
  }
}

// Route configuration with role-based protection
const routes: Routes = [
  {
    path: "admin",
    component: AdminComponent,
    canActivate: [RoleGuard],
    data: { roles: ["admin", "super-admin"] },
  },
  {
    path: "organizer",
    component: OrganizerDashboardComponent,
    canActivate: [RoleGuard],
    data: { roles: ["organizer", "admin"] },
  },
];
```

#### Permission-Based Component Directive

```typescript
@Directive({
  selector: "[appHasPermission]",
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  @Input("appHasPermission") permission!: string;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.permissions$.subscribe((permissions) => {
      this.updateView(permissions);
    });
  }

  private updateView(permissions: Set<string>): void {
    if (permissions.has(this.permission)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}

// Usage in templates
// <button *appHasPermission="'events:create'" mat-raised-button>
//   Create Event
// </button>
```

### 9.3 Edge Cases and Error Scenarios

#### Token Expiry During Request

```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.tokenService.getAccessToken();

    if (token) {
      request = this.addTokenToRequest(request, token);
    }

    return next.handle(request).pipe(
      catchError((error) => {
        if (error.status === 401 && token) {
          return this.handle401Error(request, next);
        }
        return throwError(error);
      })
    );
  }

  private handle401Error(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return this.tokenService.refreshAccessToken().pipe(
      switchMap(() => {
        const newToken = this.tokenService.getAccessToken();
        if (newToken) {
          const newRequest = this.addTokenToRequest(request, newToken);
          return next.handle(newRequest);
        }
        this.authService.logout();
        return throwError("Authentication failed");
      }),
      catchError((error) => {
        this.authService.logout();
        return throwError(error);
      })
    );
  }
}
```

#### OAuth Error Handling

```typescript
// Google OAuth error scenarios
export class OAuthErrorHandler {
  handleOAuthError(error: any): void {
    switch (error.error) {
      case "popup_closed_by_user":
        this.notificationService.showWarning("Sign-in was cancelled");
        break;

      case "popup_blocked":
        this.notificationService.showError(
          "Pop-up blocked. Please allow pop-ups and try again."
        );
        break;

      case "network_error":
        this.notificationService.showError(
          "Network error. Please check your connection and try again."
        );
        break;

      default:
        this.notificationService.showError(
          "Sign-in failed. Please try again or use email registration."
        );
        break;
    }
  }
}
```

## 10. Validation Criteria

### 10.1 Authentication Flow Validation

#### Registration Process Validation

```typescript
describe("Registration Validation", () => {
  it("should validate email format in real-time", () => {
    cy.visit("/register");
    cy.get('[data-testid="email-input"]').type("invalid-email");
    cy.get('[data-testid="email-error"]').should("contain", "valid email");
  });

  it("should enforce password strength requirements", () => {
    cy.get('[data-testid="password-input"]').type("weak");
    cy.get('[data-testid="password-strength"]').should("contain", "Weak");

    cy.get('[data-testid="password-input"]').clear().type("StrongPass123");
    cy.get('[data-testid="password-strength"]').should("contain", "Strong");
  });

  it("should send verification email within 30 seconds", () => {
    cy.fillRegistrationForm(validUserData);
    cy.get('[data-testid="register-button"]').click();

    cy.wait("@sendVerificationEmail").then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });
  });
});
```

#### Token Management Validation

```typescript
describe("JWT Token Management", () => {
  it("should refresh tokens automatically before expiration", () => {
    cy.login("user@example.com", "password");

    // Mock token that expires in 1 minute
    cy.intercept("GET", "/api/user/profile", { fixture: "user-profile.json" });

    // Advance time to trigger refresh
    cy.tick(14 * 60 * 1000); // 14 minutes

    // Verify API call still works (token was refreshed)
    cy.request("/api/user/profile").then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});
```

### 10.2 Authorization Validation

#### Permission Enforcement Tests

```typescript
describe("Authorization Enforcement", () => {
  it("should hide admin features from regular users", () => {
    cy.loginAs("volunteer");
    cy.visit("/dashboard");

    cy.get('[data-testid="admin-panel"]').should("not.exist");
    cy.get('[data-testid="user-management"]').should("not.exist");
  });

  it("should show appropriate features for organizers", () => {
    cy.loginAs("organizer");
    cy.visit("/dashboard");

    cy.get('[data-testid="create-event"]').should("be.visible");
    cy.get('[data-testid="manage-events"]').should("be.visible");
    cy.get('[data-testid="admin-panel"]').should("not.exist");
  });
});
```

### 10.3 Security Validation

#### Security Header Validation

```typescript
describe("Security Headers", () => {
  it("should include all required security headers", () => {
    cy.visit("/");
    cy.getAllCookies().then((cookies) => {
      const refreshTokenCookie = cookies.find(
        (c) => c.name === "refresh_token"
      );
      expect(refreshTokenCookie?.httpOnly).to.be.true;
      expect(refreshTokenCookie?.secure).to.be.true;
      expect(refreshTokenCookie?.sameSite).to.eq("strict");
    });
  });

  it("should prevent XSS attacks", () => {
    const maliciousScript = "<script>window.xssTest = true;</script>";

    cy.visit("/profile");
    cy.get('[data-testid="bio-input"]').type(maliciousScript);
    cy.get('[data-testid="save-profile"]').click();

    cy.window().should("not.have.property", "xssTest");
  });
});
```

## 11. Related Specifications / Further Reading

### 11.1 Related VolunteerSync Specifications

- **Frontend Core Architecture**: `spec-architecture-frontend-core-1.0.md`
- **Technology Stack Specification**: `spec-technology-stack-frontend-1.0.md`
- **Security Compliance Specification**: `spec-process-security-compliance-1.0.md`
- **GraphQL Integration Specification**: `spec-data-graphql-integration-1.0.md`
- **User Interface Components**: `spec-design-user-interface-components-1.0.md`

### 11.2 Security Standards and Guidelines

- **OWASP Authentication Cheat Sheet**: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- **OAuth 2.0 Security Best Practices**: https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics
- **JWT Security Best Practices**: https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/
- **PKCE RFC**: https://datatracker.ietf.org/doc/html/rfc7636

### 11.3 Implementation References

- **Angular Authentication Patterns**: https://angular.io/guide/security
- **Google Identity Services**: https://developers.google.com/identity/gsi/web
- **JWT Library Documentation**: https://github.com/panva/jose
- **Angular Route Guards**: https://angular.io/guide/router#preventing-unauthorized-access

### 11.4 Testing and Validation Resources

- **Angular Testing Guide**: https://angular.io/guide/testing
- **Cypress Authentication Testing**: https://docs.cypress.io/guides/end-to-end-testing/testing-strategies
- **Security Testing OWASP Guide**: https://owasp.org/www-project-web-security-testing-guide/

---

**Specification Status**: ✅ Complete - Ready for Implementation  
**Review Status**: Pending Security Review  
**Implementation Dependencies**: Backend authentication API, Google OAuth setup  
**Next Actions**: Implement authentication service, setup OAuth integration, create route guards
