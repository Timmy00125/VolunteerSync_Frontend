import { gql } from 'apollo-angular';
import { REGISTRATION_FRAGMENT } from '../fragments/registration.fragments';

// Register for event
export const REGISTER_FOR_EVENT = gql`
  ${REGISTRATION_FRAGMENT}
  mutation RegisterForEvent($eventId: ID!, $input: RegisterForEventInput) {
    registerForEvent(eventId: $eventId, input: $input) {
      ...RegistrationFragment
    }
  }
`;

// Cancel registration
export const CANCEL_REGISTRATION = gql`
  mutation CancelRegistration($registrationId: ID!, $reason: String) {
    cancelRegistration(registrationId: $registrationId, reason: $reason) {
      success
      message
    }
  }
`;

// Update registration status
export const UPDATE_REGISTRATION_STATUS = gql`
  ${REGISTRATION_FRAGMENT}
  mutation UpdateRegistrationStatus(
    $registrationId: ID!
    $status: RegistrationStatus!
    $notes: String
  ) {
    updateRegistrationStatus(registrationId: $registrationId, status: $status, notes: $notes) {
      ...RegistrationFragment
    }
  }
`;

// Bulk update registrations
export const BULK_UPDATE_REGISTRATIONS = gql`
  mutation BulkUpdateRegistrations($registrationIds: [ID!]!, $status: RegistrationStatus!) {
    bulkUpdateRegistrations(registrationIds: $registrationIds, status: $status) {
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

// Approve registration
export const APPROVE_REGISTRATION = gql`
  ${REGISTRATION_FRAGMENT}
  mutation ApproveRegistration($input: ApprovalDecisionInput!) {
    approveRegistration(input: $input) {
      ...RegistrationFragment
    }
  }
`;

// Update attendance
export const UPDATE_ATTENDANCE = gql`
  mutation UpdateAttendance($input: AttendanceInput!) {
    updateAttendance(input: $input) {
      success
      message
      attendance {
        registration {
          id
          attendanceStatus
        }
        checkedInAt
        notes
      }
    }
  }
`;
