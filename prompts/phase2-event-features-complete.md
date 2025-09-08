# Phase 2: Event Error Handling & Real-time Features (TASK-019, TASK-020, TASK-021, TASK-022)

## Context

You are completing Phase 2 of the VolunteerSync MVP. The event components and data layer are implemented. Now add error handling, real-time capacity tracking, organizer dashboard, and responsive design.

## Tasks:

- TASK-019: Add GraphQL error handling and validation for event operations
- TASK-020: Implement capacity tracking with real-time GraphQL subscriptions
- TASK-021: Create organizer event management dashboard with GraphQL queries
- TASK-022: Add basic responsive design for mobile viewing

### Requirements

- Comprehensive error handling for all event operations
- Real-time capacity updates using GraphQL subscriptions
- Organizer-specific dashboard with management features
- Mobile-responsive design across all components

### Implementation Instructions

1. **Create additional services and components**:

   ```bash
   cd volunteersync-frontend
   ng generate service events/services/event-error-handler --skip-tests=false
   ng generate service events/services/capacity-tracker --skip-tests=false
   ng generate component dashboard/organizer-dashboard --standalone
   ng generate component events/capacity-indicator --standalone
   ng generate component events/event-stats --standalone
   ```

2. **Create responsive design utilities**:
   ```bash
   ng generate service shared/services/breakpoint --skip-tests=false
   ```

### Event Error Handling (TASK-019)

**Create Event Error Handler Service:**

**Features to implement:**

- Event-specific error message mapping
- Validation error handling for forms
- Network error recovery
- User-friendly error messages
- Integration with global error handler

```typescript
export class EventErrorHandlerService {
  private notificationService = inject(NotificationService);
  private errorHandler = inject(ErrorHandlerService);

  handleEventValidationErrors(errors: ValidationError[]): void;
  handleCapacityExceededError(): void;
  handleEventNotFoundError(): void;
  handlePermissionDeniedError(): void;
  handleNetworkError(): void;
  getEventErrorMessage(errorCode: string): string;
}
```

**Error handling features:**

- Form validation errors with field-specific messages
- Business logic errors (capacity exceeded, permission denied)
- Network connectivity issues
- Server errors with retry options
- Optimistic update rollback on failures

**Update Event Service with error handling:**

- Wrap all GraphQL operations with try-catch
- Provide meaningful error messages
- Implement retry logic for recoverable errors
- Rollback optimistic updates on failure

### Capacity Tracking Service (TASK-020)

**Create Capacity Tracker Service:**

**Features to implement:**

- Real-time capacity monitoring via GraphQL subscriptions
- Capacity threshold alerts
- Registration queue management (future enhancement)
- Capacity analytics and reporting

```typescript
export class CapacityTrackerService implements OnDestroy {
  private eventService = inject(EventService);
  private subscriptions = new Map<string, Subscription>();

  // Track capacity for specific event
  trackEventCapacity(eventId: string): Observable<CapacityUpdate>;

  // Stop tracking
  stopTracking(eventId: string): void;

  // Check if event is at capacity
  isAtCapacity(event: Event): boolean;

  // Get capacity percentage
  getCapacityPercentage(event: Event): number;

  // Get remaining spots
  getRemainingSpots(event: Event): number;
}
```

**Capacity Indicator Component:**

- Visual capacity indicator (progress bar)
- Real-time updates via subscription
- Color-coded status (green, yellow, red)
- Waiting list status (future)

**Integration with existing components:**

- Update EventListComponent to show capacity indicators
- Update EventDetailComponent with real-time capacity
- Update EventFormComponent with capacity validation

### Organizer Dashboard (TASK-021)

**Update `src/app/dashboard/organizer-dashboard/organizer-dashboard.component.ts`:**

**Features to implement:**

- Overview of organizer's events
- Event statistics and analytics
- Quick actions (create event, manage registrations)
- Registration management tools
- Event performance metrics

**Dashboard sections:**

1. **Overview Cards:**

   - Total events created
   - Total registrations
   - Upcoming events
   - Events needing attention

2. **Recent Events List:**

   - Events with action items
   - Registration status
   - Quick management actions

3. **Statistics Charts:**

   - Registration trends (simple charts)
   - Event popularity
   - Capacity utilization

4. **Quick Actions:**
   - Create new event
   - View all events
   - Manage registrations
   - Export data

**Component structure:**

```typescript
export class OrganizerDashboardComponent implements OnInit {
  private eventService = inject(EventService);
  private authService = inject(AuthService);

  // Dashboard data signals
  organizerEvents = signal<Event[]>([]);
  eventStats = signal<EventStatistics | null>(null);
  recentRegistrations = signal<EventRegistration[]>([]);
  loading = signal(true);

  // Computed dashboard metrics
  totalEvents = computed(() => this.organizerEvents().length);
  totalRegistrations = computed(() => /* calculate total */);
  upcomingEvents = computed(() => /* filter upcoming */);
  eventsNeedingAttention = computed(() => /* filter by criteria */);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void
  onCreateEvent(): void
  onManageEvent(event: Event): void
  onExportData(): void
}
```

**Event Stats Component:**

- Display key metrics for events
- Registration conversion rates
- Capacity utilization
- Time-based analytics

### Responsive Design (TASK-022)

**Create Breakpoint Service:**

For responsive design, we will rely on Tailwind CSS's built-in responsive utilities. You can apply classes conditionally based on breakpoints (e.g., `md:text-lg`, `lg:flex`).

If you need to programmatically check for breakpoints in your component's logic, you can create a simple service that listens to `window.resize` events and checks the `window.innerWidth` against Tailwind's default breakpoints. However, it is recommended to handle responsiveness primarily through CSS classes.


**Responsive design updates:**

1. **Event List Component:**

   - Grid layout on desktop (3-4 columns)
   - 2 columns on tablet
   - Single column on mobile
   - Condensed card design for mobile

2. **Event Detail Component:**

   - Two-column layout on desktop
   - Single column on mobile
   - Collapsible sections on mobile
   - Sticky action buttons on mobile

3. **Event Form Component:**

   - Full-width form on mobile
   - Responsive date/time pickers
   - Mobile-optimized inputs
   - Floating action button for save

4. **Navigation and Header:**
   - Hamburger menu on mobile
   - Collapsible navigation
   - Mobile-optimized user menu

**CSS/SCSS improvements:**

- Tailwind CSS responsive breakpoints
- Flexbox and Grid layouts
- Mobile-first CSS approach
- Touch-friendly button sizes
- Improved spacing for mobile

### Technical Requirements

- Use Tailwind CSS classes for breakpoint-specific styles
- Implement proper error boundaries
- Use GraphQL subscriptions efficiently
- Optimize for mobile performance
- Maintain accessibility standards
- Add comprehensive unit tests

### Error Handling Patterns

**Event Operation Errors:**

```typescript
// Example error handling in event service
async createEvent(input: CreateEventInput): Promise<Event> {
  try {
    const result = await this.apollo.mutate({
      mutation: CREATE_EVENT,
      variables: { input },
      optimisticResponse: {
        createEvent: {
          ...optimisticEvent
        }
      }
    }).toPromise();

    return result.data.createEvent;
  } catch (error) {
    this.eventErrorHandler.handleEventValidationErrors(error);
    throw error; // Re-throw for component handling
  }
}
```

### Real-time Subscription Management

**Capacity tracking implementation:**

```typescript
// In CapacityTrackerService
trackEventCapacity(eventId: string): Observable<CapacityUpdate> {
  return this.apollo.subscribe({
    query: EVENT_REGISTRATION_UPDATED,
    variables: { eventId }
  }).pipe(
    map(result => result.data.eventRegistrationUpdated),
    catchError(error => {
      this.errorHandler.handleSubscriptionError(error);
      return EMPTY;
    })
  );
}
```

### Files to Create/Modify

- `src/app/events/services/event-error-handler.service.ts` (create)
- `src/app/events/services/capacity-tracker.service.ts` (create)
- `src/app/shared/services/breakpoint.service.ts` (create)
- `src/app/dashboard/organizer-dashboard/organizer-dashboard.component.ts` (update)
- `src/app/dashboard/organizer-dashboard/organizer-dashboard.component.html` (update)
- `src/app/dashboard/organizer-dashboard/organizer-dashboard.component.scss` (update)
- `src/app/events/capacity-indicator/capacity-indicator.component.ts` (create)
- `src/app/events/event-stats/event-stats.component.ts` (create)
- Update all existing event components with error handling
- Update all existing components with responsive design
- `src/styles.scss` (update with responsive utilities)

### Testing Requirements

- Test error handling scenarios
- Test responsive design at different breakpoints
- Test real-time subscription updates
- Test organizer dashboard functionality
- Mock GraphQL subscriptions for testing

### Success Criteria

- All event operations have proper error handling
- Real-time capacity updates work correctly
- Organizer dashboard displays relevant information
- All components are responsive across devices
- Error messages are user-friendly and actionable
- Subscriptions manage resources properly
- Mobile experience is smooth and functional
- Unit tests achieve good coverage

### Next Steps

After completing Phase 2, proceed to Phase 3 (Registration & Profiles) with a solid event management foundation.
