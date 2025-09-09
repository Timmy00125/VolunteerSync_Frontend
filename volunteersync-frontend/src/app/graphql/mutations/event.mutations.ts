import { gql } from 'apollo-angular';
import {
  EVENT_DETAIL_FRAGMENT,
  EVENT_IMAGE_FRAGMENT,
  EVENT_ANNOUNCEMENT_FRAGMENT,
} from '../fragments/event.fragments';
import {
  REGISTRATION_FRAGMENT,
  ATTENDANCE_RECORD_FRAGMENT,
} from '../fragments/registration.fragments';

// Event management mutations
export const CREATE_EVENT = gql`
  ${EVENT_DETAIL_FRAGMENT}
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
      ...EventDetailFragment
    }
  }
`;

export const UPDATE_EVENT = gql`
  ${EVENT_DETAIL_FRAGMENT}
  mutation UpdateEvent($id: ID!, $input: UpdateEventInput!) {
    updateEvent(id: $id, input: $input) {
      ...EventDetailFragment
    }
  }
`;

export const PUBLISH_EVENT = gql`
  ${EVENT_DETAIL_FRAGMENT}
  mutation PublishEvent($id: ID!) {
    publishEvent(id: $id) {
      ...EventDetailFragment
    }
  }
`;

export const CANCEL_EVENT = gql`
  ${EVENT_DETAIL_FRAGMENT}
  mutation CancelEvent($id: ID!, $reason: String) {
    cancelEvent(id: $id, reason: $reason) {
      ...EventDetailFragment
    }
  }
`;

export const DELETE_EVENT = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`;

// Event image mutations
export const ADD_EVENT_IMAGE = gql`
  ${EVENT_IMAGE_FRAGMENT}
  mutation AddEventImage($eventId: ID!, $file: Upload!, $altText: String, $isPrimary: Boolean) {
    addEventImage(eventId: $eventId, file: $file, altText: $altText, isPrimary: $isPrimary) {
      ...EventImageFragment
    }
  }
`;

export const UPDATE_EVENT_IMAGE = gql`
  ${EVENT_IMAGE_FRAGMENT}
  mutation UpdateEventImage($id: ID!, $altText: String, $isPrimary: Boolean, $displayOrder: Int) {
    updateEventImage(
      id: $id
      altText: $altText
      isPrimary: $isPrimary
      displayOrder: $displayOrder
    ) {
      ...EventImageFragment
    }
  }
`;

export const DELETE_EVENT_IMAGE = gql`
  mutation DeleteEventImage($id: ID!) {
    deleteEventImage(id: $id)
  }
`;

// Event announcement mutations
export const CREATE_EVENT_ANNOUNCEMENT = gql`
  ${EVENT_ANNOUNCEMENT_FRAGMENT}
  mutation CreateEventAnnouncement(
    $eventId: ID!
    $title: String!
    $content: String!
    $isUrgent: Boolean
  ) {
    createEventAnnouncement(
      eventId: $eventId
      title: $title
      content: $content
      isUrgent: $isUrgent
    ) {
      ...EventAnnouncementFragment
    }
  }
`;

export const UPDATE_EVENT_ANNOUNCEMENT = gql`
  ${EVENT_ANNOUNCEMENT_FRAGMENT}
  mutation UpdateEventAnnouncement($id: ID!, $title: String, $content: String, $isUrgent: Boolean) {
    updateEventAnnouncement(id: $id, title: $title, content: $content, isUrgent: $isUrgent) {
      ...EventAnnouncementFragment
    }
  }
`;

export const DELETE_EVENT_ANNOUNCEMENT = gql`
  mutation DeleteEventAnnouncement($id: ID!) {
    deleteEventAnnouncement(id: $id)
  }
`;

// Registration mutations
export const REGISTER_FOR_EVENT = gql`
  ${REGISTRATION_FRAGMENT}
  mutation RegisterForEvent($input: RegisterForEventInput!) {
    registerForEvent(input: $input) {
      ...RegistrationFragment
    }
  }
`;

export const BULK_REGISTER = gql`
  ${REGISTRATION_FRAGMENT}
  mutation BulkRegister($input: BulkRegistrationInput!) {
    bulkRegister(input: $input) {
      ...RegistrationFragment
    }
  }
`;

export const CANCEL_REGISTRATION = gql`
  ${REGISTRATION_FRAGMENT}
  mutation CancelRegistration($registrationId: ID!, $reason: String) {
    cancelRegistration(registrationId: $registrationId, reason: $reason) {
      ...RegistrationFragment
    }
  }
`;

export const APPROVE_REGISTRATION = gql`
  ${REGISTRATION_FRAGMENT}
  mutation ApproveRegistration($input: ApprovalDecisionInput!) {
    approveRegistration(input: $input) {
      ...RegistrationFragment
    }
  }
`;

export const CHECK_IN_VOLUNTEER = gql`
  ${ATTENDANCE_RECORD_FRAGMENT}
  mutation CheckInVolunteer($input: AttendanceInput!) {
    checkInVolunteer(input: $input) {
      ...AttendanceRecordFragment
    }
  }
`;

export const MARK_ATTENDANCE = gql`
  ${ATTENDANCE_RECORD_FRAGMENT}
  mutation MarkAttendance($input: AttendanceInput!) {
    markAttendance(input: $input) {
      ...AttendanceRecordFragment
    }
  }
`;

export const PROMOTE_FROM_WAITLIST = gql`
  ${REGISTRATION_FRAGMENT}
  mutation PromoteFromWaitlist($registrationId: ID!) {
    promoteFromWaitlist(registrationId: $registrationId) {
      ...RegistrationFragment
    }
  }
`;

export const TRANSFER_REGISTRATION = gql`
  ${REGISTRATION_FRAGMENT}
  mutation TransferRegistration($registrationId: ID!, $newEventId: ID!) {
    transferRegistration(registrationId: $registrationId, newEventId: $newEventId) {
      ...RegistrationFragment
    }
  }
`;

export const UPDATE_REGISTRATION = gql`
  ${REGISTRATION_FRAGMENT}
  mutation UpdateRegistration($registrationId: ID!, $personalMessage: String) {
    updateRegistration(registrationId: $registrationId, personalMessage: $personalMessage) {
      ...RegistrationFragment
    }
  }
`;
