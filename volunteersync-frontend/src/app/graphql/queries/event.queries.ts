import { gql } from 'apollo-angular';
import {
  EVENT_FRAGMENT,
  EVENT_DETAIL_FRAGMENT,
  EVENT_CONNECTION_FRAGMENT,
  EVENT_UPDATE_FRAGMENT,
} from '../fragments/event.fragments';
import {
  REGISTRATION_FRAGMENT,
  WAITLIST_ENTRY_FRAGMENT,
  REGISTRATION_CONFLICT_FRAGMENT,
  ATTENDANCE_RECORD_FRAGMENT,
  REGISTRATION_STATS_FRAGMENT,
} from '../fragments/registration.fragments';

// Get paginated events with filtering and sorting
export const GET_EVENTS = gql`
  ${EVENT_CONNECTION_FRAGMENT}
  query GetEvents($filter: EventSearchFilter, $sort: EventSortInput, $first: Int, $after: String) {
    events(filter: $filter, sort: $sort, first: $first, after: $after) {
      ...EventConnectionFragment
    }
  }
`;

// Search events with text query
export const SEARCH_EVENTS = gql`
  ${EVENT_CONNECTION_FRAGMENT}
  query SearchEvents(
    $query: String!
    $filter: EventSearchFilter
    $sort: EventSortInput
    $first: Int
    $after: String
  ) {
    searchEvents(query: $query, filter: $filter, sort: $sort, first: $first, after: $after) {
      ...EventConnectionFragment
    }
  }
`;

// Get a single event by ID
export const GET_EVENT_BY_ID = gql`
  ${EVENT_DETAIL_FRAGMENT}
  query GetEventById($id: ID!) {
    event(id: $id) {
      ...EventDetailFragment
    }
  }
`;

// Get a single event by slug
export const GET_EVENT_BY_SLUG = gql`
  ${EVENT_DETAIL_FRAGMENT}
  query GetEventBySlug($slug: String!) {
    eventBySlug(slug: $slug) {
      ...EventDetailFragment
    }
  }
`;

// Get current user's events (organized events)
export const GET_MY_EVENTS = gql`
  ${EVENT_CONNECTION_FRAGMENT}
  query GetMyEvents($status: [EventStatus!], $first: Int, $after: String) {
    myEvents(status: $status, first: $first, after: $after) {
      ...EventConnectionFragment
    }
  }
`;

// Get nearby events based on coordinates
export const GET_NEARBY_EVENTS = gql`
  ${EVENT_CONNECTION_FRAGMENT}
  query GetNearbyEvents(
    $coordinates: CoordinatesInput!
    $radius: Float!
    $filter: EventSearchFilter
    $first: Int
    $after: String
  ) {
    nearbyEvents(
      coordinates: $coordinates
      radius: $radius
      filter: $filter
      first: $first
      after: $after
    ) {
      ...EventConnectionFragment
    }
  }
`;

// Get event updates/changelog
export const GET_EVENT_UPDATES = gql`
  ${EVENT_UPDATE_FRAGMENT}
  query GetEventUpdates($eventId: ID!, $first: Int, $after: String) {
    eventUpdates(eventId: $eventId, first: $first, after: $after) {
      ...EventUpdateFragment
    }
  }
`;

// Registration-related queries
// Get current user's registrations
export const GET_MY_REGISTRATIONS = gql`
  ${REGISTRATION_FRAGMENT}
  query GetMyRegistrations($filter: RegistrationFilterInput) {
    myRegistrations(filter: $filter) {
      ...RegistrationFragment
    }
  }
`;

// Get a single registration by ID
export const GET_REGISTRATION = gql`
  ${REGISTRATION_FRAGMENT}
  query GetRegistration($id: ID!) {
    registration(id: $id) {
      ...RegistrationFragment
    }
  }
`;

// Get registrations for a specific event
export const GET_EVENT_REGISTRATIONS = gql`
  ${REGISTRATION_FRAGMENT}
  query GetEventRegistrations($eventId: ID!, $filter: RegistrationFilterInput) {
    eventRegistrations(eventId: $eventId, filter: $filter) {
      ...RegistrationFragment
    }
  }
`;

// Get waitlist entries for an event
export const GET_WAITLIST_ENTRIES = gql`
  ${WAITLIST_ENTRY_FRAGMENT}
  query GetWaitlistEntries($eventId: ID!) {
    waitlistEntries(eventId: $eventId) {
      ...WaitlistEntryFragment
    }
  }
`;

// Get registration conflicts for an event
export const GET_REGISTRATION_CONFLICTS = gql`
  ${REGISTRATION_CONFLICT_FRAGMENT}
  query GetRegistrationConflicts($eventId: ID!) {
    registrationConflicts(eventId: $eventId) {
      ...RegistrationConflictFragment
    }
  }
`;

// Get attendance records for an event
export const GET_ATTENDANCE_RECORDS = gql`
  ${ATTENDANCE_RECORD_FRAGMENT}
  query GetAttendanceRecords($eventId: ID!) {
    attendanceRecords(eventId: $eventId) {
      ...AttendanceRecordFragment
    }
  }
`;

// Get registration statistics for an event
export const GET_REGISTRATION_STATS = gql`
  ${REGISTRATION_STATS_FRAGMENT}
  query GetRegistrationStats($eventId: ID!) {
    registrationStats(eventId: $eventId) {
      ...RegistrationStatsFragment
    }
  }
`;
