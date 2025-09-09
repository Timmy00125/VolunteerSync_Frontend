import { gql } from 'apollo-angular';

// User skill fragment for registrations
export const USER_SKILL_FRAGMENT = gql`
  fragment UserSkillFragment on UserSkill {
    id
    name
    proficiency
  }
`;

// Interest fragment for registrations
export const INTEREST_FRAGMENT = gql`
  fragment InterestFragment on Interest {
    id
    name
    category
  }
`;

// User fragment for registration (minimal to avoid circular dependencies)
export const REGISTRATION_USER_FRAGMENT = gql`
  fragment RegistrationUserFragment on User {
    id
    email
    name
    emailVerified
  }
`;

// Event fragment for registration (minimal to avoid circular dependencies)
export const REGISTRATION_EVENT_FRAGMENT = gql`
  fragment RegistrationEventFragment on Event {
    id
    title
    startTime
    endTime
    status
    capacity {
      maximum
      current
    }
  }
`;

// Basic registration fragment
export const REGISTRATION_FRAGMENT = gql`
  ${REGISTRATION_USER_FRAGMENT}
  ${REGISTRATION_EVENT_FRAGMENT}
  ${USER_SKILL_FRAGMENT}
  ${INTEREST_FRAGMENT}
  fragment RegistrationFragment on Registration {
    id
    user {
      ...RegistrationUserFragment
    }
    event {
      ...RegistrationEventFragment
    }
    status
    personalMessage
    skills {
      ...UserSkillFragment
    }
    interests {
      ...InterestFragment
    }
    appliedAt
    confirmedAt
    cancelledAt
    checkedInAt
    completedAt
    waitlistPosition
    approvalNotes
    cancellationReason
    attendanceStatus
    canCancel
    canCheckIn
    createdAt
    updatedAt
  }
`;

// Waitlist entry fragment
export const WAITLIST_ENTRY_FRAGMENT = gql`
  ${REGISTRATION_FRAGMENT}
  fragment WaitlistEntryFragment on WaitlistEntry {
    id
    registration {
      ...RegistrationFragment
    }
    position
    estimatedPromotionTime
    promotionOfferedAt
    promotionExpiresAt
    autoPromote
  }
`;

// Registration conflict fragment
export const REGISTRATION_CONFLICT_FRAGMENT = gql`
  fragment RegistrationConflictFragment on RegistrationConflict {
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
`;

// Attendance record fragment
export const ATTENDANCE_RECORD_FRAGMENT = gql`
  ${REGISTRATION_FRAGMENT}
  ${REGISTRATION_USER_FRAGMENT}
  fragment AttendanceRecordFragment on AttendanceRecord {
    registration {
      ...RegistrationFragment
    }
    checkedInAt
    checkedInBy {
      ...RegistrationUserFragment
    }
    notes
  }
`;

// Registration stats fragment
export const REGISTRATION_STATS_FRAGMENT = gql`
  fragment RegistrationStatsFragment on RegistrationStats {
    totalRegistrations
    confirmedRegistrations
    waitlistCount
    attendanceRate
    noShowRate
    cancellationRate
  }
`;
