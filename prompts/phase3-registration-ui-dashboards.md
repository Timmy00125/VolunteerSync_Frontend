# Phase 3: Registration UI & Volunteer Dashboard (TASK-026, TASK-027, TASK-029, TASK-030)

## Context

You are completing Phase 3 of the VolunteerSync MVP. The registration data layer and profile management are implemented. Now create the registration UI components and dashboards for both volunteers and organizers.

## Tasks:

- TASK-026: Build event registration component with GraphQL mutations
- TASK-027: Create registration cancellation functionality via GraphQL
- TASK-029: Create volunteer dashboard with registration history via GraphQL
- TASK-030: Build registration management for organizers using GraphQL queries

### Requirements

- Create intuitive registration UI components
- Implement volunteer and organizer dashboards
- Use real-time updates for registration status
- Build comprehensive registration management tools
- Follow responsive design principles

### Implementation Instructions

1. **Update existing components and create new ones**:

   ```bash
   cd volunteersync-frontend
   ng generate component events/event-registration --standalone
   ng generate component registration/registration-card --standalone
   ng generate component registration/registration-history --standalone
   ng generate component registration/registration-manager --standalone
   ng generate component dashboard/volunteer-dashboard --standalone
   ng generate component shared/registration-status --standalone
   ```

2. **Create registration-specific services**:
   ```bash
   ng generate service registration/services/registration-ui --skip-tests=false
   ng generate service dashboard/services/dashboard --skip-tests=false
   ```

### Event Registration Component (TASK-026)

**Update `src/app/events/event-registration/event-registration.component.ts`:**

**Features to implement:**

- Registration form with optional notes
- Real-time capacity checking
- Registration confirmation
- Integration with existing registration service
- User feedback and loading states

**Component structure:**

```typescript
export class EventRegistrationComponent implements OnInit {
  private registrationService = inject(RegistrationService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  // Input properties
  @Input() event!: Event;
  @Input() showAsButton = true;
  @Input() showCapacity = true;

  // Component state
  loading = signal(false);
  registering = signal(false);
  currentUser = signal<User | null>(null);
  userRegistration = signal<Registration | null>(null);

  // Registration form
  registrationForm = this.fb.group({
    notes: ["", Validators.maxLength(500)],
  });

  // Computed values
  canRegister = computed(() => {
    const event = this.event;
    const user = this.currentUser();
    const registration = this.userRegistration();

    return (
      user &&
      !registration &&
      event.status === EventStatus.PUBLISHED &&
      event.registeredCount < event.capacity &&
      new Date(event.startDateTime) > new Date()
    );
  });

  isRegistered = computed(() => {
    const registration = this.userRegistration();
    return (
      registration && registration.status === RegistrationStatus.REGISTERED
    );
  });

  registrationStatus = computed(() => {
    return this.userRegistration()?.status || null;
  });

  ngOnInit(): void {
    this.loadUserRegistration();
  }

  async onRegister(): Promise<void>;
  async onCancel(): Promise<void>;
  private loadUserRegistration(): void;
  private showRegistrationSuccess(): void;
  private showCancellationSuccess(): void;
}
```

**Template features:**

- Registration button with loading state
- Capacity indicator
- Registration form with notes field
- Confirmation dialog
- Status indicators (registered, pending, cancelled)

### Registration Cancellation (TASK-027)

**Features to implement in registration components:**

- Cancellation confirmation dialog
- Reason for cancellation (optional)
- Immediate UI feedback
- Integration with event capacity updates

**Cancellation Dialog Component:**

```typescript
export class RegistrationCancellationDialogComponent {
  @Input() registration!: Registration;

  cancellationForm = this.fb.group({
    reason: ["", Validators.maxLength(500)],
    confirmCancel: [false, Validators.requiredTrue],
  });

  onConfirmCancellation(): void;
  onCancel(): void;
}
```

### Volunteer Dashboard (TASK-029)

**Update `src/app/dashboard/volunteer-dashboard/volunteer-dashboard.component.ts`:**

**Features to implement:**

- Overview of volunteer's registrations
- Upcoming events dashboard
- Registration history
- Profile completion status
- Quick actions (browse events, update profile)

**Dashboard sections:**

1. **Welcome & Quick Stats:**

   - Upcoming events count
   - Total volunteered hours
   - Profile completion percentage
   - Recent activity

2. **Upcoming Events:**

   - Next 3-5 registered events
   - Quick access to event details
   - Easy cancellation option

3. **Registration History:**

   - Paginated list of past registrations
   - Filter by status and date
   - Export functionality

4. **Profile Status:**
   - Profile completion checklist
   - Skills and availability updates
   - Preferences management

**Component structure:**

```typescript
export class VolunteerDashboardComponent implements OnInit {
  private registrationService = inject(RegistrationService);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private dashboardService = inject(DashboardService);

  // Dashboard data
  currentUser = signal<User | null>(null);
  upcomingEvents = signal<Registration[]>([]);
  registrationSummary = signal<RegistrationSummary | null>(null);
  profile = signal<UserProfile | null>(null);
  recentActivity = signal<Activity[]>([]);
  loading = signal(true);

  // Computed dashboard metrics
  profileCompletionPercentage = computed(() => {
    const profile = this.profile();
    if (!profile) return 0;

    let completed = 0;
    let total = 5; // bio, skills, availability, contact, preferences

    if (profile.bio) completed++;
    if (profile.skills.length > 0) completed++;
    if (profile.availability) completed++;
    if (profile.contactInfo?.phone) completed++;
    if (profile.preferences) completed++;

    return Math.round((completed / total) * 100);
  });

  upcomingEventsCount = computed(() => this.upcomingEvents().length);

  totalVolunteerHours = computed(() => {
    const summary = this.registrationSummary();
    return summary?.attendedEvents || 0;
  });

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void;
  onBrowseEvents(): void;
  onUpdateProfile(): void;
  onManageRegistration(registration: Registration): void;
  onCompleteProfileItem(item: string): void;
}
```

### Registration Management for Organizers (TASK-030)

**Create Registration Manager Component:**

**Features to implement:**

- List all registrations for organizer's events
- Filter and search registrations
- Bulk status updates
- Export registration data
- Communication tools (future enhancement)

**Component structure:**

```typescript
export class RegistrationManagerComponent implements OnInit {
  private registrationService = inject(RegistrationService);
  private eventService = inject(EventService);
  private authService = inject(AuthService);

  // Component state
  events = signal<Event[]>([]);
  registrations = signal<Registration[]>([]);
  selectedEvent = signal<Event | null>(null);
  selectedRegistrations = signal<Registration[]>([]);
  loading = signal(true);

  // Filters and search
  statusFilter = signal<RegistrationStatus | null>(null);
  searchTerm = signal("");
  dateRange = signal<{ start: Date; end: Date } | null>(null);

  // Computed values
  filteredRegistrations = computed(() => {
    const registrations = this.registrations();
    const status = this.statusFilter();
    const search = this.searchTerm().toLowerCase();

    return registrations.filter((reg) => {
      const matchesStatus = !status || reg.status === status;
      const matchesSearch =
        !search ||
        reg.user.firstName.toLowerCase().includes(search) ||
        reg.user.lastName.toLowerCase().includes(search) ||
        reg.user.email.toLowerCase().includes(search);

      return matchesStatus && matchesSearch;
    });
  });

  registrationStats = computed(() => {
    const registrations = this.filteredRegistrations();
    return {
      total: registrations.length,
      registered: registrations.filter(
        (r) => r.status === RegistrationStatus.REGISTERED
      ).length,
      cancelled: registrations.filter(
        (r) => r.status === RegistrationStatus.CANCELLED
      ).length,
      attended: registrations.filter(
        (r) => r.status === RegistrationStatus.ATTENDED
      ).length,
    };
  });

  ngOnInit(): void {
    this.loadOrganizerData();
  }

  loadOrganizerData(): void;
  onEventSelect(event: Event): void;
  onStatusFilter(status: RegistrationStatus): void;
  onSearch(term: string): void;
  onBulkUpdateStatus(status: RegistrationStatus): void;
  onExportRegistrations(): void;
  onToggleRegistrationSelection(registration: Registration): void;
  onSelectAllRegistrations(): void;
}
```

**Registration management features:**

- Tabular view with sortable columns
- Checkbox selection for bulk operations
- Quick status update buttons
- Individual registration details
- Export to CSV functionality
- Search and filter capabilities

### Supporting Components

**Registration Card Component:**

- Compact registration display
- Status indicators
- Quick actions (view details, update status)
- User information display

**Registration History Component:**

- Paginated list of past registrations
- Filter by date range and status
- Sort by various criteria
- Export functionality

**Registration Status Component:**

- Visual status indicators
- Color-coded badges
- Status transition animations
- Tooltip information

### Dashboard Service

**Create Dashboard Service (`src/app/dashboard/services/dashboard.service.ts`):**

```typescript
@Injectable({
  providedIn: "root",
})
export class DashboardService {
  private apollo = inject(Apollo);
  private registrationService = inject(RegistrationService);
  private eventService = inject(EventService);

  getVolunteerDashboardData(userId: string): Observable<VolunteerDashboardData>;
  getOrganizerDashboardData(userId: string): Observable<OrganizerDashboardData>;
  getRecentActivity(userId: string): Observable<Activity[]>;
  getDashboardStats(userId: string): Observable<DashboardStats>;

  private aggregateDashboardData(
    user: User
  ): VolunteerDashboardData | OrganizerDashboardData;
}
```

### Technical Requirements

- Use tables styled with Tailwind CSS for registration lists
- Implement proper pagination for large datasets
- Use signals for reactive state management
- Add real-time updates via GraphQL subscriptions
- Implement proper error handling and loading states
- Use OnPush change detection strategy
- Add comprehensive unit tests
- Follow accessibility guidelines

### UI/UX Requirements

- Responsive design for mobile and desktop
- Clear visual hierarchy and information architecture
- Consistent use of Tailwind CSS
- Loading states for all async operations
- Success/error feedback for all actions
- Intuitive navigation and user flows

### Files to Create/Modify

- `src/app/events/event-registration/event-registration.component.ts` (update)
- `src/app/events/event-registration/event-registration.component.html` (update)
- `src/app/registration/registration-card/registration-card.component.ts` (create)
- `src/app/registration/registration-history/registration-history.component.ts` (create)
- `src/app/registration/registration-manager/registration-manager.component.ts` (create)
- `src/app/dashboard/volunteer-dashboard/volunteer-dashboard.component.ts` (update)
- `src/app/dashboard/volunteer-dashboard/volunteer-dashboard.component.html` (update)
- `src/app/shared/registration-status/registration-status.component.ts` (create)
- `src/app/registration/services/registration-ui.service.ts` (create)
- `src/app/dashboard/services/dashboard.service.ts` (create)

### Integration Points

- Use RegistrationService for all data operations
- Integrate with EventService for event data
- Use AuthService for user context
- Connect to NotificationService for user feedback
- Use ProfileService for profile data

### Success Criteria

- Registration flow works smoothly from event discovery to confirmation
- Volunteer dashboard provides useful overview and quick actions
- Organizer registration management is comprehensive and efficient
- Real-time updates work correctly
- All components are responsive and accessible
- Error handling provides clear feedback
- Unit tests achieve good coverage

### Next Steps

After completing this task, implement form validation, loading states, and statistics in the final phase.
