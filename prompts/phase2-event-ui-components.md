# Phase 2: Event UI Components (TASK-015, TASK-016, TASK-017, TASK-018)

## Context

You are implementing Phase 2 event UI components. The event data layer, GraphQL operations, and event service are already implemented. Now create the user-facing event management components.

## Tasks:

- TASK-015: Create event list component with GraphQL queries
- TASK-016: Build event detail view component with GraphQL subscription
- TASK-017: Implement event creation form with GraphQL mutations
- TASK-018: Create event edit/delete functionality using GraphQL mutations

### Requirements

- Use Angular 20 standalone components with signals
- Implement with Angular Material for consistent UI
- Integrate with existing event service
- Add real-time updates with GraphQL subscriptions
- Follow responsive design principles

### Implementation Instructions

1. **The event components should already be generated from Phase 1. Update them with full functionality.**

2. **Create additional supporting components**:

   ```bash
   cd volunteersync-frontend
   ng generate component events/event-card --standalone
   ng generate component events/event-registration --standalone
   ng generate component shared/loading-spinner --standalone
   ng generate component shared/confirm-dialog --standalone
   ```

3. **Create event-specific services for UI logic**:
   ```bash
   ng generate service events/services/event-ui --skip-tests=false
   ```

### Event List Component (TASK-015)

**Update `src/app/events/event-list/event-list.component.ts`:**

**Features to implement:**

- Display paginated list of events using Angular Material cards
- Filter events by status, date, location
- Search functionality by title/description
- Sort options (date, title, registration count)
- Integration with event service for data fetching
- Loading states and error handling
- Responsive grid layout
- Infinite scroll or pagination
- Quick registration buttons for volunteers

**Component structure:**

```typescript
export class EventListComponent {
  private eventService = inject(EventService);
  private router = inject(Router);

  // Signals for reactive state
  events = signal<Event[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  totalCount = signal(0);
  currentPage = signal(1);

  // Filter and search signals
  searchTerm = signal("");
  statusFilter = signal<EventStatus | null>(null);
  sortBy = signal<"date" | "title" | "registrations">("date");

  // Computed values
  filteredEvents = computed(() => {
    // Filter and sort logic
  });

  // Methods
  loadEvents(): void;
  onSearch(term: string): void;
  onFilterChange(status: EventStatus): void;
  onSortChange(sortBy: string): void;
  onEventClick(event: Event): void;
  onRegisterClick(event: Event): void;
}
```

**Template features:**

- Angular Material data table or card grid
- Search bar with mat-form-field
- Filter chips for event status
- Sort dropdown
- Pagination with mat-paginator
- Loading spinner
- Empty state messaging

### Event Detail Component (TASK-016)

**Update `src/app/events/event-detail/event-detail.component.ts`:**

**Features to implement:**

- Display complete event information
- Real-time updates via GraphQL subscriptions
- Registration management (register/cancel)
- Attendee list for organizers
- Event status updates
- Share functionality
- Print/export options
- Mobile-responsive layout

**Component structure:**

```typescript
export class EventDetailComponent implements OnInit, OnDestroy {
  private eventService = inject(EventService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  // Signals
  event = signal<Event | null>(null);
  loading = signal(true);
  currentUser = signal<User | null>(null);
  userRegistration = signal<EventRegistration | null>(null);

  // Computed values
  canEdit = computed(() => /* organizer check */);
  canRegister = computed(() => /* registration logic */);
  isRegistered = computed(() => /* registration status */);

  // Subscription for real-time updates
  private eventSubscription?: Subscription;

  ngOnInit(): void {
    // Load event and subscribe to updates
  }

  onRegister(): void
  onCancelRegistration(): void
  onEdit(): void
  onDelete(): void
  onShare(): void
}
```

**Template features:**

- Event hero section with image placeholder
- Event details grid (date, time, location, capacity)
- Description with proper formatting
- Registration button/status
- Organizer information
- Attendee list (conditional)
- Action buttons (edit, delete, share)
- Responsive layout

### Event Form Component (TASK-017, TASK-018)

**Update `src/app/events/event-form/event-form.component.ts`:**

**Features to implement:**

- Create new events (TASK-017)
- Edit existing events (TASK-018)
- Comprehensive form validation
- Date/time pickers with validation
- Location input with suggestions (future enhancement)
- Capacity management
- Draft save functionality
- Form state persistence

**Component structure:**

```typescript
export class EventFormComponent implements OnInit {
  private eventService = inject(EventService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Form and state
  eventForm: FormGroup;
  isEditMode = signal(false);
  loading = signal(false);
  eventId = signal<string | null>(null);

  // Form configuration
  eventForm = this.fb.group({
    title: ["", [Validators.required, Validators.maxLength(100)]],
    description: ["", [Validators.required, Validators.maxLength(1000)]],
    startDateTime: ["", Validators.required],
    endDateTime: ["", Validators.required],
    location: ["", [Validators.required, Validators.maxLength(200)]],
    capacity: [
      null,
      [Validators.required, Validators.min(1), Validators.max(1000)],
    ],
  });

  ngOnInit(): void {
    // Determine if create or edit mode
    // Load existing event if editing
  }

  onSubmit(): void;
  onSaveDraft(): void;
  onCancel(): void;
  onDelete(): void; // For edit mode
}
```

**Form validation features:**

- Required field validation
- Date range validation (end after start)
- Capacity limits
- Character limits for text fields
- Real-time validation feedback
- Custom validators for date/time logic

**Template features:**

- Angular Material form fields
- Date/time pickers (mat-datepicker)
- Rich text editor for description (future)
- Capacity input with validation
- Form actions (save, cancel, delete)
- Confirmation dialogs for destructive actions

### Event Registration Component

**Update `src/app/events/event-registration/event-registration.component.ts`:**

**Features to implement:**

- Quick registration from event list
- Registration form with optional notes
- Confirmation dialog
- Registration status feedback
- Cancellation functionality

### Supporting Components

**Event Card Component:**

- Reusable card for displaying event summary
- Registration status indicators
- Quick action buttons
- Responsive design

**Confirm Dialog Component:**

- Reusable confirmation dialog
- Configurable title, message, and actions
- Angular Material dialog implementation

**Loading Spinner Component:**

- Consistent loading indicator
- Different sizes and types
- Integration with async operations

### Technical Requirements

- Use Angular Reactive Forms with proper validation
- Implement OnPush change detection strategy
- Use Angular Material components consistently
- Add proper ARIA labels and accessibility features
- Handle all async operations with loading states
- Implement proper error handling and user feedback
- Use signals for reactive state management
- Add comprehensive unit tests

### UI/UX Requirements

- Responsive design for mobile and desktop
- Consistent spacing and typography
- Loading states for all async operations
- Clear success/error messaging
- Intuitive navigation and actions
- Proper focus management
- Form validation with clear feedback

### Files to Create/Modify

- `src/app/events/event-list/event-list.component.ts` (update)
- `src/app/events/event-list/event-list.component.html` (update)
- `src/app/events/event-list/event-list.component.scss` (update)
- `src/app/events/event-detail/event-detail.component.ts` (update)
- `src/app/events/event-detail/event-detail.component.html` (update)
- `src/app/events/event-detail/event-detail.component.scss` (update)
- `src/app/events/event-form/event-form.component.ts` (update)
- `src/app/events/event-form/event-form.component.html` (update)
- `src/app/events/event-form/event-form.component.scss` (update)
- `src/app/events/event-registration/event-registration.component.ts` (update)
- `src/app/events/event-card/event-card.component.ts` (create)
- `src/app/shared/loading-spinner/loading-spinner.component.ts` (create)
- `src/app/shared/confirm-dialog/confirm-dialog.component.ts` (create)
- `src/app/events/services/event-ui.service.ts` (create)

### Integration Points

- Use EventService for all data operations
- Integrate with AuthService for user context
- Use NotificationService for user feedback
- Connect to routing for navigation
- Use shared validators and error handling

### Success Criteria

- All event components render correctly
- CRUD operations work through the UI
- Real-time updates display properly
- Form validation provides clear feedback
- Loading states and error handling work
- Components are responsive and accessible
- Navigation between components is smooth
- Unit tests achieve good coverage

### Next Steps

After completing this task, implement event error handling, capacity tracking, and responsive design features.
