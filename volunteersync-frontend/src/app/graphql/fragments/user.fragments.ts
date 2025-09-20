import { gql } from 'apollo-angular';

// Skill fragment
export const SKILL_FRAGMENT = gql`
  fragment SkillFragment on Skill {
    id
    name
    category
    level
    verified
  }
`;

// Availability fragment
export const AVAILABILITY_FRAGMENT = gql`
  fragment AvailabilityFragment on Availability {
    weekdays {
      day
      available
      startTime
      endTime
    }
    timeZone
    maxHoursPerWeek
    unavailableDates
  }
`;

// User preferences fragment
export const PREFERENCES_FRAGMENT = gql`
  fragment PreferencesFragment on UserPreferences {
    eventTypes
    maxTravelDistance
    emailNotifications
    smsNotifications
    reminderPreferences {
      enabled
      hours
      methods
    }
  }
`;

// Contact info fragment
export const CONTACT_INFO_FRAGMENT = gql`
  fragment ContactInfoFragment on ContactInfo {
    phone
    alternateEmail
    address {
      street
      city
      state
      zipCode
      country
    }
  }
`;

// Emergency contact fragment
export const EMERGENCY_CONTACT_FRAGMENT = gql`
  fragment EmergencyContactFragment on EmergencyContact {
    name
    phone
    relationship
  }
`;

// Profile fragment
export const PROFILE_FRAGMENT = gql`
  ${SKILL_FRAGMENT}
  ${AVAILABILITY_FRAGMENT}
  ${PREFERENCES_FRAGMENT}
  ${CONTACT_INFO_FRAGMENT}
  ${EMERGENCY_CONTACT_FRAGMENT}
  fragment ProfileFragment on UserProfile {
    id
    userId
    bio
    skills {
      ...SkillFragment
    }
    availability {
      ...AvailabilityFragment
    }
    preferences {
      ...PreferencesFragment
    }
    contactInfo {
      ...ContactInfoFragment
    }
    emergencyContact {
      ...EmergencyContactFragment
    }
    createdAt
    updatedAt
  }
`;

// Align fragments with backend.graphql schema
// User fields available: id, email, name, emailVerified, roles, createdAt, updatedAt, etc.
export const USER_FRAGMENT = gql`
  fragment UserFragment on User {
    id
    email
    name
    emailVerified
    roles
    createdAt
    updatedAt
  }
`;

export const FULL_USER_FRAGMENT = gql`
  ${USER_FRAGMENT}
  fragment FullUserFragment on User {
    ...UserFragment
    bio
    profilePicture
    isVerified
    joinedAt
    lastActiveAt
  }
`;
