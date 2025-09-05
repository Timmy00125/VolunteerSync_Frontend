# Phase 4: Testing & Production Readiness (TASK-034, TASK-035, TASK-036, TASK-037)

## Context

You are implementing Phase 4 of the VolunteerSync MVP - the final phase focusing on comprehensive testing, accessibility, and production optimization. All core functionality is complete.

## Tasks:

- TASK-034: Implement unit tests for GraphQL operations and components
- TASK-035: Create integration tests for main user flows with Apollo MockLink
- TASK-036: Add basic accessibility features (ARIA labels, keyboard nav)
- TASK-037: Optimize GraphQL queries and Apollo Client cache configuration

### Requirements

- Achieve comprehensive test coverage for critical functionality
- Implement integration tests for complete user workflows
- Ensure accessibility compliance for all components
- Optimize GraphQL operations and caching for production

### Implementation Instructions

1. **Set up testing infrastructure**:

   ```bash
   cd volunteersync-frontend
   npm install --save-dev @apollo/client/testing
   npm install --save-dev @testing-library/jest-dom
   npm install --save-dev @testing-library/user-event
   ```

2. **Create testing utilities and mocks**:

   ```bash
   ng generate service shared/testing/apollo-mock --skip-tests=true
   ng generate service shared/testing/test-data-factory --skip-tests=true
   ng generate service shared/testing/form-test-helpers --skip-tests=true
   ```

3. **Create accessibility service**:
   ```bash
   ng generate service shared/services/accessibility --skip-tests=false
   ng generate service shared/services/focus-management --skip-tests=false
   ```

### Unit Testing Implementation (TASK-034)

**Apollo Mock Service (`src/app/shared/testing/apollo-mock.service.ts`):**

```typescript
@Injectable()
export class ApolloMockService {
  createMockApollo(mocks: MockedResponse[]): Apollo {
    const mockLink = new MockLink(mocks);
    const cache = new InMemoryCache();

    return new Apollo({
      link: mockLink,
      cache,
    });
  }

  // Authentication mocks
  createAuthMocks(): MockedResponse[] {
    return [
      {
        request: {
          query: LOGIN_MUTATION,
          variables: { email: "test@example.com", password: "password123" },
        },
        result: {
          data: {
            login: {
              token: "mock-jwt-token",
              user: TestDataFactory.createUser(),
            },
          },
        },
      },
      {
        request: {
          query: GET_CURRENT_USER,
        },
        result: {
          data: {
            me: TestDataFactory.createUser(),
          },
        },
      },
    ];
  }

  // Event mocks
  createEventMocks(): MockedResponse[] {
    return [
      {
        request: {
          query: GET_EVENTS,
          variables: { filter: null, pagination: null },
        },
        result: {
          data: {
            events: {
              items: TestDataFactory.createEvents(5),
              totalCount: 5,
              hasNextPage: false,
            },
          },
        },
      },
      {
        request: {
          query: CREATE_EVENT,
          variables: { input: TestDataFactory.createEventInput() },
        },
        result: {
          data: {
            createEvent: TestDataFactory.createEvent(),
          },
        },
      },
    ];
  }

  // Registration mocks
  createRegistrationMocks(): MockedResponse[];

  // Error mocks
  createErrorMocks(): MockedResponse[];
}
```

**Test Data Factory (`src/app/shared/testing/test-data-factory.service.ts`):**

```typescript
@Injectable()
export class TestDataFactory {
  static createUser(overrides?: Partial<User>): User {
    return {
      id: "1",
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
      role: UserRole.VOLUNTEER,
      createdAt: new Date(),
      ...overrides,
    };
  }

  static createEvent(overrides?: Partial<Event>): Event {
    return {
      id: "1",
      title: "Test Event",
      description: "Test event description",
      startDateTime: new Date(Date.now() + 86400000), // Tomorrow
      endDateTime: new Date(Date.now() + 90000000), // Tomorrow + 1 hour
      location: "Test Location",
      capacity: 50,
      registeredCount: 10,
      status: EventStatus.PUBLISHED,
      organizerId: "1",
      organizer: this.createUser({ role: UserRole.ORGANIZER }),
      registrations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createEvents(count: number): Event[] {
    return Array.from({ length: count }, (_, i) =>
      this.createEvent({ id: (i + 1).toString(), title: `Event ${i + 1}` })
    );
  }

  static createRegistration(overrides?: Partial<Registration>): Registration;
  static createProfile(overrides?: Partial<UserProfile>): UserProfile;
  static createEventInput(
    overrides?: Partial<CreateEventInput>
  ): CreateEventInput;
}
```

**Component Unit Tests Examples:**

**Login Component Test:**

```typescript
describe("LoginComponent", () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockApollo: Apollo;
  let authService: AuthService;

  beforeEach(async () => {
    const apolloMockService = new ApolloMockService();
    mockApollo = apolloMockService.createMockApollo([
      ...apolloMockService.createAuthMocks(),
    ]);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        { provide: Apollo, useValue: mockApollo },
        AuthService,
        NotificationService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should validate email field", () => {
    const emailControl = component.loginForm.get("email");

    // Test empty email
    emailControl?.setValue("");
    expect(emailControl?.hasError("required")).toBeTruthy();

    // Test invalid email
    emailControl?.setValue("invalid-email");
    expect(emailControl?.hasError("email")).toBeTruthy();

    // Test valid email
    emailControl?.setValue("test@example.com");
    expect(emailControl?.valid).toBeTruthy();
  });

  it("should call authService.login on form submit", async () => {
    spyOn(authService, "login").and.returnValue(
      of(TestDataFactory.createAuthResponse())
    );

    component.loginForm.patchValue({
      email: "test@example.com",
      password: "password123",
    });

    await component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith(
      "test@example.com",
      "password123"
    );
  });

  it("should display error message on login failure", async () => {
    spyOn(authService, "login").and.returnValue(
      throwError("Invalid credentials")
    );

    component.loginForm.patchValue({
      email: "test@example.com",
      password: "wrongpassword",
    });

    await component.onSubmit();

    expect(component.error()).toBe("Invalid credentials");
  });
});
```

**Service Unit Tests Examples:**

**Event Service Test:**

```typescript
describe("EventService", () => {
  let service: EventService;
  let apollo: Apollo;
  let controller: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [EventService],
    });

    service = TestBed.inject(EventService);
    apollo = TestBed.inject(Apollo);
    controller = TestBed.inject(ApolloTestingController);
  });

  afterEach(() => {
    controller.verify();
  });

  it("should fetch events", (done) => {
    const mockEvents = TestDataFactory.createEvents(3);

    service.getEvents().subscribe((events) => {
      expect(events.length).toBe(3);
      expect(events).toEqual(mockEvents);
      done();
    });

    const op = controller.expectOne(GET_EVENTS);
    expect(op.operation.variables).toEqual({});

    op.flush({
      data: {
        events: {
          items: mockEvents,
          totalCount: 3,
          hasNextPage: false,
        },
      },
    });
  });

  it("should create event", (done) => {
    const eventInput = TestDataFactory.createEventInput();
    const createdEvent = TestDataFactory.createEvent();

    service.createEvent(eventInput).subscribe((event) => {
      expect(event).toEqual(createdEvent);
      done();
    });

    const op = controller.expectOne(CREATE_EVENT);
    expect(op.operation.variables).toEqual({ input: eventInput });

    op.flush({
      data: {
        createEvent: createdEvent,
      },
    });
  });

  it("should handle GraphQL errors", (done) => {
    const eventInput = TestDataFactory.createEventInput();

    service.createEvent(eventInput).subscribe({
      next: () => fail("Should have failed"),
      error: (error) => {
        expect(error.message).toContain("GraphQL error");
        done();
      },
    });

    const op = controller.expectOne(CREATE_EVENT);
    op.graphqlErrors([{ message: "Validation failed" }]);
  });
});
```

### Integration Testing (TASK-035)

**Integration Test Examples:**

**Authentication Flow Test:**

```typescript
describe("Authentication Flow Integration", () => {
  let component: TestBed;
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: "login", component: LoginComponent },
          { path: "dashboard", component: VolunteerDashboardComponent },
          { path: "", redirectTo: "/login", pathMatch: "full" },
        ]),
        ApolloTestingModule,
      ],
      providers: [AuthService, NotificationService],
    }).compileComponents();

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
  });

  it("should complete full authentication flow", fakeAsync(() => {
    // Start at login page
    router.navigate(["/login"]);
    tick();
    expect(location.path()).toBe("/login");

    // Fill out login form
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    component.loginForm.patchValue({
      email: "test@example.com",
      password: "password123",
    });

    // Submit form
    component.onSubmit();
    tick();

    // Should redirect to dashboard
    expect(location.path()).toBe("/dashboard");
  }));
});
```

**Event Registration Flow Test:**

```typescript
describe("Event Registration Flow Integration", () => {
  it("should complete event registration workflow", async () => {
    // Setup authenticated user
    const user = TestDataFactory.createUser();
    authService.setCurrentUser(user);

    // Navigate to events list
    router.navigate(["/events"]);

    // Select an event
    const event = TestDataFactory.createEvent();

    // Register for event
    const registrationResult = await registrationService
      .registerForEvent(event.id)
      .toPromise();

    // Verify registration was successful
    expect(registrationResult).toBeTruthy();
    expect(registrationResult.status).toBe(RegistrationStatus.REGISTERED);

    // Verify event capacity was updated
    const updatedEvent = await eventService.getEventById(event.id).toPromise();
    expect(updatedEvent.registeredCount).toBe(event.registeredCount + 1);
  });
});
```

### Accessibility Implementation (TASK-036)

**Accessibility Service (`src/app/shared/services/accessibility.service.ts`):**

```typescript
@Injectable({
  providedIn: "root",
})
export class AccessibilityService {
  private focusManagement = inject(FocusManagementService);

  // ARIA label management
  setAriaLabel(element: HTMLElement, label: string): void;
  setAriaDescribedBy(element: HTMLElement, describedById: string): void;
  setAriaExpanded(element: HTMLElement, expanded: boolean): void;
  setAriaHidden(element: HTMLElement, hidden: boolean): void;

  // Keyboard navigation
  setupKeyboardNavigation(container: HTMLElement): void;
  handleTabNavigation(event: KeyboardEvent): void;
  handleArrowNavigation(event: KeyboardEvent, items: HTMLElement[]): void;

  // Screen reader announcements
  announceToScreenReader(
    message: string,
    priority: "polite" | "assertive" = "polite"
  ): void;
  announcePageChange(title: string): void;
  announceFormErrors(errors: string[]): void;

  // Focus management
  setFocusToFirstError(formGroup: FormGroup): void;
  trapFocus(container: HTMLElement): void;
  restoreFocus(element: HTMLElement): void;

  // Color and contrast
  checkColorContrast(foreground: string, background: string): boolean;
  getHighContrastMode(): boolean;
}
```

**Focus Management Service:**

```typescript
@Injectable({
  providedIn: "root",
})
export class FocusManagementService {
  private focusStack: HTMLElement[] = [];

  // Focus stack management
  pushFocus(element: HTMLElement): void;
  popFocus(): HTMLElement | null;
  clearFocusStack(): void;

  // Skip links
  setupSkipLinks(): void;
  focusSkipTarget(targetId: string): void;

  // Modal focus management
  trapFocusInModal(modal: HTMLElement): void;
  restoreFocusFromModal(): void;

  // Page navigation focus
  focusMainContent(): void;
  focusPageTitle(): void;
  focusFirstFormField(form: HTMLElement): void;
}
```

**Accessibility Updates for Components:**

1. **Form Components:**

   - ARIA labels for all form fields
   - Error message association with `aria-describedby`
   - Required field indicators
   - Form validation announcements

2. **Navigation Components:**

   - Skip links for main content
   - Proper heading hierarchy
   - ARIA landmarks (navigation, main, complementary)
   - Keyboard navigation support

3. **Interactive Components:**

   - Focus visible indicators
   - ARIA expanded states for dropdowns
   - Role attributes for custom components
   - Keyboard event handlers

4. **Data Tables:**
   - Table headers with proper scope
   - Sortable column indicators
   - Row selection announcements
   - Table summary information

### GraphQL Optimization (TASK-037)

**Apollo Client Cache Optimization:**

```typescript
// Enhanced cache configuration
const cache = new InMemoryCache({
  typePolicies: {
    Event: {
      fields: {
        registrations: {
          merge(existing = [], incoming: any[]) {
            return incoming;
          },
        },
      },
    },
    User: {
      fields: {
        events: {
          merge(existing = [], incoming: any[]) {
            // Custom merge logic for user events
            return mergeUniqueById(existing, incoming);
          },
        },
      },
    },
    Query: {
      fields: {
        events: {
          keyArgs: ["filter"],
          merge(existing, incoming, { args }) {
            if (args?.pagination?.offset === 0) {
              return incoming;
            }
            return {
              ...incoming,
              items: [...(existing?.items || []), ...incoming.items],
            };
          },
        },
      },
    },
  },
});
```

**Query Optimization Strategies:**

1. **Fragment Usage:** Reuse fragments across queries
2. **Pagination:** Implement cursor-based pagination
3. **Caching:** Configure appropriate cache policies
4. **Batching:** Use query batching for multiple requests
5. **Prefetching:** Preload data for anticipated user actions

**Performance Monitoring:**

```typescript
// Apollo Client performance monitoring
const performanceLink = new ApolloLink((operation, forward) => {
  const start = performance.now();

  return forward(operation).map((response) => {
    const duration = performance.now() - start;
    console.log(`Query ${operation.operationName} took ${duration}ms`);
    return response;
  });
});
```

### Technical Requirements

- Achieve 80%+ test coverage for critical paths
- All components must pass accessibility audits
- GraphQL queries optimized for production
- Performance budgets defined and monitored
- Error boundaries implemented
- SEO considerations addressed

### Files to Create/Modify

- `src/app/shared/testing/apollo-mock.service.ts` (create)
- `src/app/shared/testing/test-data-factory.service.ts` (create)
- `src/app/shared/testing/form-test-helpers.service.ts` (create)
- `src/app/shared/services/accessibility.service.ts` (create)
- `src/app/shared/services/focus-management.service.ts` (create)
- Unit test files for all components and services (create)
- Integration test files for user flows (create)
- Update all components with accessibility features
- Update Apollo Client configuration with optimizations

### Success Criteria

- Unit tests achieve target coverage (80%+)
- Integration tests cover all critical user flows
- All components pass accessibility audits
- GraphQL queries are optimized for performance
- Application performs well under load testing
- Error handling is comprehensive
- User experience is smooth and accessible

### Next Steps

After completing Phase 4, the MVP is ready for production deployment with comprehensive testing, accessibility compliance, and performance optimization.
