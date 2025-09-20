import { gql } from 'apollo-angular';
import {
  REGISTRATION_FRAGMENT,
  REGISTRATION_STATS_FRAGMENT,
} from '../fragments/registration.fragments';

// Get user registrations
export const GET_USER_REGISTRATIONS = gql`
  ${REGISTRATION_FRAGMENT}
  query GetUserRegistrations($userId: ID, $filter: RegistrationFilterInput) {
    userRegistrations(userId: $userId, filter: $filter) {
      ...RegistrationFragment
    }
  }
`;

// Get event registrations
export const GET_EVENT_REGISTRATIONS = gql`
  ${REGISTRATION_FRAGMENT}
  query GetEventRegistrations($eventId: ID!) {
    eventRegistrations(eventId: $eventId) {
      ...RegistrationFragment
    }
  }
`;

// Get registration by ID
export const GET_REGISTRATION = gql`
  ${REGISTRATION_FRAGMENT}
  query GetRegistration($registrationId: ID!) {
    registration(id: $registrationId) {
      ...RegistrationFragment
    }
  }
`;

// Get registration summary
export const GET_REGISTRATION_SUMMARY = gql`
  query GetRegistrationSummary($userId: ID) {
    registrationSummary(userId: $userId) {
      totalRegistrations
      activeRegistrations
      cancelledRegistrations
      attendedEvents
      upcomingEvents
    }
  }
`;

// Get registration stats
export const GET_REGISTRATION_STATS = gql`
  ${REGISTRATION_STATS_FRAGMENT}
  query GetRegistrationStats($eventId: ID) {
    registrationStats(eventId: $eventId) {
      ...RegistrationStatsFragment
    }
  }
`;

// Check registration conflicts
export const CHECK_REGISTRATION_CONFLICTS = gql`
  query CheckRegistrationConflicts($eventId: ID!, $userId: ID) {
    registrationConflicts(eventId: $eventId, userId: $userId) {
      conflictingEvent {
        id
        title
        startTime
        endTime
      }
      conflictType
      severity
      suggestions {
        id
        title
        startTime
        endTime
      }
    }
  }
`;
