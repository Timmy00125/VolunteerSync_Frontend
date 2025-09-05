# Phase 3: Registration Data Layer & Profile Management (TASK-023, TASK-024, TASK-025, TASK-028)

## Context

You are implementing Phase 3 of the VolunteerSync MVP focusing on registration management and user profiles. Phase 2 (event management) is complete. Now build the registration data layer and profile management system.

## Tasks:

- TASK-023: Create registration data models and GraphQL type definitions
- TASK-024: Define GraphQL mutations for registration operations
- TASK-025: Implement registration service with Apollo Client integration
- TASK-028: Implement user profile management components with GraphQL queries

### Requirements

- Create comprehensive registration and profile data models
- Define all necessary GraphQL operations for registrations and profiles
- Implement services with full CRUD operations
- Build profile management UI components
- Integrate with existing event system

### Implementation Instructions

1. **Create Registration and Profile Models**:

   ```bash
   cd volunteersync-frontend
   ng generate interface shared/models/registration --type=model
   ng generate interface shared/models/profile --type=model
   ng generate interface shared/models/skill --type=model
   ng generate interface shared/models/availability --type=model
   ```

2. **Create Services**:

   ```bash
   ng generate service registration/services/registration --skip-tests=false
   ng generate service profile/services/profile --skip-tests=false
   ```

3. **Create Profile Components**:

   ```bash
   ng generate component profile/profile-view --standalone
   ng generate component profile/profile-edit --standalone
   ng generate component profile/skill-selector --standalone
   ng generate component profile/availability-editor --standalone
   ```

4. **Create GraphQL operations**:
   ```bash
   touch src/app/graphql/queries/registration.queries.ts
   touch src/app/graphql/mutations/registration.mutations.ts
   touch src/app/graphql/queries/profile.queries.ts
   touch src/app/graphql/mutations/profile.mutations.ts
   touch src/app/graphql/fragments/profile.fragments.ts
   ```

### Registration Data Models (TASK-023)

**Registration Model (`src/app/shared/models/registration.model.ts`):**

```typescript
export interface Registration {
  id: string;
  eventId: string;
  event: Event;
  userId: string;
  user: User;
  status: RegistrationStatus;
  registeredAt: Date;
  cancelledAt?: Date;
  attendedAt?: Date;
  notes?: string;
  organizerNotes?: string;
}

export interface RegistrationFilter {
  userId?: string;
  eventId?: string;
  status?: RegistrationStatus;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface RegistrationSummary {
  totalRegistrations: number;
  activeRegistrations: number;
  cancelledRegistrations: number;
  attendedEvents: number;
  upcomingEvents: number;
}
```

**Profile Models (`src/app/shared/models/profile.model.ts`):**

```typescript
export interface UserProfile {
  id: string;
  userId: string;
  bio?: string;
  skills: Skill[];
  availability: Availability;
  preferences: UserPreferences;
  contactInfo: ContactInfo;
  emergencyContact?: EmergencyContact;
  createdAt: Date;
  updatedAt: Date;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  verified: boolean;
}

export interface Availability {
  weekdays: WeekdayAvailability[];
  timeZone: string;
  maxHoursPerWeek?: number;
  unavailableDates: Date[];
}

export interface WeekdayAvailability {
  day: WeekDay;
  available: boolean;
  startTime?: string;
  endTime?: string;
}

export interface UserPreferences {
  eventTypes: string[];
  maxTravelDistance?: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
  reminderPreferences: ReminderSettings;
}

export interface ContactInfo {
  phone?: string;
  alternateEmail?: string;
  address?: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export enum SkillCategory {
  TECHNICAL = "TECHNICAL",
  COMMUNICATION = "COMMUNICATION",
  LEADERSHIP = "LEADERSHIP",
  PHYSICAL = "PHYSICAL",
  CREATIVE = "CREATIVE",
  ADMINISTRATIVE = "ADMINISTRATIVE",
}

export enum SkillLevel {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
  EXPERT = "EXPERT",
}

export enum WeekDay {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}
```

### GraphQL Operations (TASK-024)

**Registration Mutations (`src/app/graphql/mutations/registration.mutations.ts`):**

```typescript
import { gql } from "@apollo/client";
import { REGISTRATION_FRAGMENT } from "../fragments/registration.fragments";

export const REGISTER_FOR_EVENT = gql`
  mutation RegisterForEvent($eventId: ID!, $notes: String) {
    registerForEvent(eventId: $eventId, notes: $notes) {
      ...RegistrationFragment
    }
  }
  ${REGISTRATION_FRAGMENT}
`;

export const CANCEL_REGISTRATION = gql`
  mutation CancelRegistration($registrationId: ID!, $reason: String) {
    cancelRegistration(registrationId: $registrationId, reason: $reason) {
      success
      message
    }
  }
`;

export const UPDATE_REGISTRATION_STATUS = gql`
  mutation UpdateRegistrationStatus(
    $registrationId: ID!
    $status: RegistrationStatus!
    $notes: String
  ) {
    updateRegistrationStatus(
      registrationId: $registrationId
      status: $status
      notes: $notes
    ) {
      ...RegistrationFragment
    }
  }
  ${REGISTRATION_FRAGMENT}
`;

export const BULK_UPDATE_REGISTRATIONS = gql`
  mutation BulkUpdateRegistrations(
    $registrationIds: [ID!]!
    $status: RegistrationStatus!
  ) {
    bulkUpdateRegistrations(
      registrationIds: $registrationIds
      status: $status
    ) {
      successCount
      failureCount
      results {
        registrationId
        success
        error
      }
    }
  }
`;
```

**Profile Mutations (`src/app/graphql/mutations/profile.mutations.ts`):**

```typescript
export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      ...ProfileFragment
    }
  }
  ${PROFILE_FRAGMENT}
`;

export const UPDATE_SKILLS = gql`
  mutation UpdateSkills($skills: [SkillInput!]!) {
    updateSkills(skills: $skills) {
      ...SkillFragment
    }
  }
  ${SKILL_FRAGMENT}
`;

export const UPDATE_AVAILABILITY = gql`
  mutation UpdateAvailability($availability: AvailabilityInput!) {
    updateAvailability(availability: $availability) {
      ...AvailabilityFragment
    }
  }
  ${AVAILABILITY_FRAGMENT}
`;

export const UPDATE_PREFERENCES = gql`
  mutation UpdatePreferences($preferences: PreferencesInput!) {
    updatePreferences(preferences: $preferences) {
      ...PreferencesFragment
    }
  }
  ${PREFERENCES_FRAGMENT}
`;
```

### Registration Service (TASK-025)

**Registration Service (`src/app/registration/services/registration.service.ts`):**

```typescript
@Injectable({
  providedIn: "root",
})
export class RegistrationService {
  private apollo = inject(Apollo);
  private errorHandler = inject(ErrorHandlerService);
  private authService = inject(AuthService);

  // Registration operations
  registerForEvent(eventId: string, notes?: string): Observable<Registration>;
  cancelRegistration(
    registrationId: string,
    reason?: string
  ): Observable<boolean>;
  updateRegistrationStatus(
    registrationId: string,
    status: RegistrationStatus,
    notes?: string
  ): Observable<Registration>;

  // Query operations
  getUserRegistrations(
    userId?: string,
    filter?: RegistrationFilter
  ): Observable<Registration[]>;
  getEventRegistrations(eventId: string): Observable<Registration[]>;
  getRegistrationById(registrationId: string): Observable<Registration>;
  getRegistrationSummary(userId?: string): Observable<RegistrationSummary>;

  // Bulk operations
  bulkUpdateRegistrations(
    registrationIds: string[],
    status: RegistrationStatus
  ): Observable<BulkUpdateResult>;

  // Utility methods
  canUserRegister(event: Event): boolean;
  isUserRegistered(event: Event): boolean;
  getUserRegistrationForEvent(event: Event): Registration | null;

  private handleRegistrationError(error: any): void;
  private updateCacheAfterRegistration(
    eventId: string,
    registration: Registration
  ): void;
}
```

### Profile Service & Components (TASK-028)

**Profile Service (`src/app/profile/services/profile.service.ts`):**

```typescript
@Injectable({
  providedIn: "root",
})
export class ProfileService {
  private apollo = inject(Apollo);
  private authService = inject(AuthService);

  // Profile operations
  getProfile(userId?: string): Observable<UserProfile>;
  updateProfile(input: UpdateProfileInput): Observable<UserProfile>;

  // Skills management
  updateSkills(skills: Skill[]): Observable<Skill[]>;
  getAvailableSkills(): Observable<Skill[]>;

  // Availability management
  updateAvailability(availability: Availability): Observable<Availability>;

  // Preferences management
  updatePreferences(preferences: UserPreferences): Observable<UserPreferences>;

  // Contact info management
  updateContactInfo(contactInfo: ContactInfo): Observable<ContactInfo>;

  private handleProfileError(error: any): void;
}
```

**Profile View Component (`src/app/profile/profile-view/profile-view.component.ts`):**

```typescript
export class ProfileViewComponent implements OnInit {
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Component state
  profile = signal<UserProfile | null>(null);
  currentUser = signal<User | null>(null);
  loading = signal(true);
  isOwnProfile = signal(false);

  // Computed values
  displayName = computed(() => {
    const user = this.currentUser();
    return user ? `${user.firstName} ${user.lastName}` : "User";
  });

  skillsByCategory = computed(() => {
    const profile = this.profile();
    if (!profile) return {};

    return profile.skills.reduce((acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    }, {} as Record<SkillCategory, Skill[]>);
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void;
  onEditProfile(): void;
  onUpdateAvailability(): void;
  onManageSkills(): void;
}
```

**Profile Edit Component (`src/app/profile/profile-edit/profile-edit.component.ts`):**

```typescript
export class ProfileEditComponent implements OnInit {
  private profileService = inject(ProfileService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // Form groups
  profileForm = this.createProfileForm();
  contactForm = this.createContactForm();
  preferencesForm = this.createPreferencesForm();

  // Component state
  profile = signal<UserProfile | null>(null);
  loading = signal(false);
  activeTab = signal(0);

  private createProfileForm(): FormGroup {
    return this.fb.group({
      bio: ["", Validators.maxLength(500)],
      timeZone: ["", Validators.required],
      maxHoursPerWeek: [null, [Validators.min(1), Validators.max(168)]],
    });
  }

  private createContactForm(): FormGroup;
  private createPreferencesForm(): FormGroup;

  ngOnInit(): void;
  onSubmit(): void;
  onCancel(): void;
  onTabChange(index: number): void;
}
```

### Technical Requirements

- Use Apollo Client for all GraphQL operations
- Implement proper cache management for profiles and registrations
- Use reactive forms with comprehensive validation
- Add optimistic updates for better UX
- Handle errors gracefully with user feedback
- Use signals for reactive state management
- Implement proper TypeScript typing
- Add comprehensive unit tests

### Files to Create/Modify

- `src/app/shared/models/registration.model.ts` (create)
- `src/app/shared/models/profile.model.ts` (create)
- `src/app/shared/models/skill.model.ts` (create)
- `src/app/shared/models/availability.model.ts` (create)
- `src/app/registration/services/registration.service.ts` (create)
- `src/app/profile/services/profile.service.ts` (create)
- `src/app/profile/profile-view/profile-view.component.ts` (update)
- `src/app/profile/profile-edit/profile-edit.component.ts` (update)
- `src/app/profile/skill-selector/skill-selector.component.ts` (create)
- `src/app/profile/availability-editor/availability-editor.component.ts` (create)
- GraphQL operation files (create)

### Success Criteria

- All registration operations work correctly
- Profile management is fully functional
- GraphQL integration works without errors
- User can view and edit their profile
- Registration data is properly managed
- Error handling provides appropriate feedback
- Components are responsive and accessible
- Unit tests achieve good coverage

### Next Steps

After completing this task, implement the registration UI components and volunteer dashboard in the next phase.
