# Phase 2: Event Data Layer & GraphQL (TASK-012, TASK-013, TASK-014)

## Context

You are implementing Phase 2 of the VolunteerSync MVP focusing on event management. Phase 1 (authentication, routing, guards) is complete. Now build the event data layer with GraphQL integration.

## Tasks:

- TASK-012: Create event data models and GraphQL type definitions
- TASK-013: Define GraphQL queries and mutations for event operations
- TASK-014: Implement event service with Apollo Client GraphQL integration

### Requirements

- Create comprehensive event data models
- Define all necessary GraphQL operations for events
- Implement event service with full CRUD operations
- Use TypeScript for type safety
- Follow established patterns from authentication implementation

### Implementation Instructions

1. **Create Event Models** using Angular CLI:

   ```bash
   cd volunteersync-frontend
   ng generate interface shared/models/event --type=model
   ng generate interface shared/models/event-registration --type=model
   ng generate enum shared/models/event-status --type=enum
   ng generate enum shared/models/registration-status --type=enum
   ```

2. **Create Event Service**:

   ```bash
   ng generate service events/services/event --skip-tests=false
   ```

3. **Create GraphQL operations directory structure**:
   ```bash
   # Create event-specific GraphQL files
   touch src/app/graphql/queries/event.queries.ts
   touch src/app/graphql/mutations/event.mutations.ts
   touch src/app/graphql/subscriptions/event.subscriptions.ts
   touch src/app/graphql/fragments/event.fragments.ts
   touch src/app/graphql/fragments/registration.fragments.ts
   ```

### Event Data Models

**Event Model (`src/app/shared/models/event.model.ts`):**

```typescript
export interface Event {
  id: string;
  title: string;
  description: string;
  startDateTime: Date;
  endDateTime: Date;
  location: string;
  capacity: number;
  registeredCount: number;
  status: EventStatus;
  organizerId: string;
  organizer: User;
  registrations: EventRegistration[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventInput {
  title: string;
  description: string;
  startDateTime: Date;
  endDateTime: Date;
  location: string;
  capacity: number;
}

export interface UpdateEventInput {
  id: string;
  title?: string;
  description?: string;
  startDateTime?: Date;
  endDateTime?: Date;
  location?: string;
  capacity?: number;
  status?: EventStatus;
}
```

**Event Registration Model:**

```typescript
export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  user: User;
  status: RegistrationStatus;
  registeredAt: Date;
  notes?: string;
}

export interface CreateRegistrationInput {
  eventId: string;
  notes?: string;
}
```

**Enums:**

```typescript
export enum EventStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export enum RegistrationStatus {
  REGISTERED = "REGISTERED",
  CANCELLED = "CANCELLED",
  ATTENDED = "ATTENDED",
  NO_SHOW = "NO_SHOW",
}
```

### GraphQL Operations

**Event Queries (`src/app/graphql/queries/event.queries.ts`):**

```typescript
import { gql } from "@apollo/client";
import {
  EVENT_FRAGMENT,
  EVENT_DETAIL_FRAGMENT,
} from "../fragments/event.fragments";

export const GET_EVENTS = gql`
  query GetEvents($filter: EventFilter, $pagination: PaginationInput) {
    events(filter: $filter, pagination: $pagination) {
      items {
        ...EventFragment
      }
      totalCount
      hasNextPage
    }
  }
  ${EVENT_FRAGMENT}
`;

export const GET_EVENT_BY_ID = gql`
  query GetEventById($id: ID!) {
    event(id: $id) {
      ...EventDetailFragment
    }
  }
  ${EVENT_DETAIL_FRAGMENT}
`;

export const GET_USER_EVENTS = gql`
  query GetUserEvents($userId: ID!, $pagination: PaginationInput) {
    userEvents(userId: $userId, pagination: $pagination) {
      items {
        ...EventFragment
      }
      totalCount
    }
  }
  ${EVENT_FRAGMENT}
`;
```

**Event Mutations (`src/app/graphql/mutations/event.mutations.ts`):**

```typescript
export const CREATE_EVENT = gql`
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
      ...EventDetailFragment
    }
  }
  ${EVENT_DETAIL_FRAGMENT}
`;

export const UPDATE_EVENT = gql`
  mutation UpdateEvent($input: UpdateEventInput!) {
    updateEvent(input: $input) {
      ...EventDetailFragment
    }
  }
  ${EVENT_DETAIL_FRAGMENT}
`;

export const DELETE_EVENT = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id) {
      success
      message
    }
  }
`;

export const REGISTER_FOR_EVENT = gql`
  mutation RegisterForEvent($input: CreateRegistrationInput!) {
    registerForEvent(input: $input) {
      ...RegistrationFragment
    }
  }
  ${REGISTRATION_FRAGMENT}
`;

export const CANCEL_REGISTRATION = gql`
  mutation CancelRegistration($registrationId: ID!) {
    cancelRegistration(registrationId: $registrationId) {
      success
      message
    }
  }
`;
```

**Event Fragments (`src/app/graphql/fragments/event.fragments.ts`):**

```typescript
export const EVENT_FRAGMENT = gql`
  fragment EventFragment on Event {
    id
    title
    description
    startDateTime
    endDateTime
    location
    capacity
    registeredCount
    status
    createdAt
    organizer {
      id
      firstName
      lastName
      email
    }
  }
`;

export const EVENT_DETAIL_FRAGMENT = gql`
  fragment EventDetailFragment on Event {
    ...EventFragment
    updatedAt
    registrations {
      ...RegistrationFragment
    }
  }
  ${EVENT_FRAGMENT}
  ${REGISTRATION_FRAGMENT}
`;
```

**Event Subscriptions (`src/app/graphql/subscriptions/event.subscriptions.ts`):**

```typescript
export const EVENT_UPDATED = gql`
  subscription EventUpdated($eventId: ID!) {
    eventUpdated(eventId: $eventId) {
      ...EventDetailFragment
    }
  }
  ${EVENT_DETAIL_FRAGMENT}
`;

export const EVENT_REGISTRATION_UPDATED = gql`
  subscription EventRegistrationUpdated($eventId: ID!) {
    eventRegistrationUpdated(eventId: $eventId) {
      eventId
      registeredCount
      registration {
        ...RegistrationFragment
      }
    }
  }
  ${REGISTRATION_FRAGMENT}
`;
```

### Event Service Implementation

**Event Service (`src/app/events/services/event.service.ts`):**

The service should include:

- `getEvents(filter?, pagination?): Observable<EventsResponse>`
- `getEventById(id: string): Observable<Event>`
- `getUserEvents(userId: string): Observable<Event[]>`
- `createEvent(input: CreateEventInput): Observable<Event>`
- `updateEvent(input: UpdateEventInput): Observable<Event>`
- `deleteEvent(id: string): Observable<boolean>`
- `registerForEvent(input: CreateRegistrationInput): Observable<EventRegistration>`
- `cancelRegistration(registrationId: string): Observable<boolean>`
- `subscribeToEventUpdates(eventId: string): Observable<Event>`
- `subscribeToRegistrationUpdates(eventId: string): Observable<RegistrationUpdate>`

**Key Features:**

- Apollo Client integration for all operations
- Proper error handling with the error handler service
- Loading state management with signals
- Cache updates after mutations
- Optimistic UI updates for registrations
- Real-time subscriptions for live updates

### Technical Requirements

- Use Apollo Client `watchQuery`, `mutate`, and `subscribe` methods
- Implement proper cache updates after mutations
- Use optimistic responses for better UX
- Handle GraphQL errors with user-friendly messages
- Implement proper TypeScript typing for all operations
- Use signals for reactive state management
- Follow established error handling patterns
- Add comprehensive unit tests

### Cache Management

- Configure cache policies for event queries
- Update cache after create/update/delete operations
- Handle subscription updates in cache
- Implement proper cache normalization

### Files to Create/Modify

- `src/app/shared/models/event.model.ts` (create)
- `src/app/shared/models/event-registration.model.ts` (create)
- `src/app/shared/models/event-status.enum.ts` (create)
- `src/app/shared/models/registration-status.enum.ts` (create)
- `src/app/events/services/event.service.ts` (create)
- `src/app/graphql/queries/event.queries.ts` (create)
- `src/app/graphql/mutations/event.mutations.ts` (create)
- `src/app/graphql/subscriptions/event.subscriptions.ts` (create)
- `src/app/graphql/fragments/event.fragments.ts` (create)
- `src/app/graphql/fragments/registration.fragments.ts` (create)

### Testing Requirements

- Unit tests for event service methods
- Test GraphQL operations with Apollo testing utilities
- Mock GraphQL responses for different scenarios
- Test error handling and loading states
- Test cache updates and optimistic responses

### Success Criteria

- All event CRUD operations work correctly
- GraphQL queries and mutations execute without errors
- Event service integrates properly with Apollo Client
- Cache management works correctly
- Error handling provides appropriate user feedback
- Real-time subscriptions update UI correctly
- Unit tests achieve good coverage
- TypeScript typing is complete and accurate

### Next Steps

After completing this task, implement the event UI components (list, detail, form) in the next phase.
