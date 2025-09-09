import { gql } from 'apollo-angular';

// Basic coordinates fragment
export const COORDINATES_FRAGMENT = gql`
  fragment CoordinatesFragment on Coordinates {
    lat
    lng
  }
`;

// Event location fragment
export const EVENT_LOCATION_FRAGMENT = gql`
  ${COORDINATES_FRAGMENT}
  fragment EventLocationFragment on EventLocation {
    name
    address
    city
    state
    country
    zipCode
    coordinates {
      ...CoordinatesFragment
    }
    instructions
    isRemote
  }
`;

// Event capacity fragment
export const EVENT_CAPACITY_FRAGMENT = gql`
  fragment EventCapacityFragment on EventCapacity {
    minimum
    maximum
    current
    waitlistEnabled
  }
`;

// Skill requirement fragment
export const SKILL_REQUIREMENT_FRAGMENT = gql`
  fragment SkillRequirementFragment on SkillRequirement {
    id
    skill
    proficiency
    required
  }
`;

// Training requirement fragment
export const TRAINING_REQUIREMENT_FRAGMENT = gql`
  fragment TrainingRequirementFragment on TrainingRequirement {
    id
    name
    description
    required
    providedByOrganizer
  }
`;

// Event requirements fragment
export const EVENT_REQUIREMENTS_FRAGMENT = gql`
  ${SKILL_REQUIREMENT_FRAGMENT}
  ${TRAINING_REQUIREMENT_FRAGMENT}
  fragment EventRequirementsFragment on EventRequirements {
    minimumAge
    backgroundCheck
    physicalRequirements
    skills {
      ...SkillRequirementFragment
    }
    training {
      ...TrainingRequirementFragment
    }
    interests
  }
`;

// Recurrence rule fragment
export const RECURRENCE_RULE_FRAGMENT = gql`
  fragment RecurrenceRuleFragment on RecurrenceRule {
    frequency
    interval
    daysOfWeek
    dayOfMonth
    endDate
    occurrenceCount
  }
`;

// Registration settings fragment
export const REGISTRATION_SETTINGS_FRAGMENT = gql`
  fragment RegistrationSettingsFragment on RegistrationSettings {
    opensAt
    closesAt
    requiresApproval
    allowWaitlist
    confirmationRequired
    cancellationDeadline
  }
`;

// Event image fragment
export const EVENT_IMAGE_FRAGMENT = gql`
  fragment EventImageFragment on EventImage {
    id
    url
    altText
    isPrimary
    displayOrder
  }
`;

// Event announcement fragment
export const EVENT_ANNOUNCEMENT_FRAGMENT = gql`
  fragment EventAnnouncementFragment on EventAnnouncement {
    id
    title
    content
    isUrgent
    createdAt
  }
`;

// User fragment for organizer (minimal to avoid circular dependencies)
export const ORGANIZER_FRAGMENT = gql`
  fragment OrganizerFragment on User {
    id
    email
    name
    emailVerified
  }
`;

// Basic event fragment for lists
export const EVENT_FRAGMENT = gql`
  ${ORGANIZER_FRAGMENT}
  ${EVENT_LOCATION_FRAGMENT}
  ${EVENT_CAPACITY_FRAGMENT}
  ${EVENT_REQUIREMENTS_FRAGMENT}
  ${REGISTRATION_SETTINGS_FRAGMENT}
  fragment EventFragment on Event {
    id
    title
    description
    shortDescription
    organizer {
      ...OrganizerFragment
    }
    organizerId
    status
    startTime
    endTime
    location {
      ...EventLocationFragment
    }
    capacity {
      ...EventCapacityFragment
    }
    requirements {
      ...EventRequirementsFragment
    }
    category
    timeCommitment
    tags
    slug
    shareURL
    registrationSettings {
      ...RegistrationSettingsFragment
    }
    createdAt
    updatedAt
    currentRegistrations
    availableSpots
    isAtCapacity
    canRegister
  }
`;

// Detailed event fragment for single event views
export const EVENT_DETAIL_FRAGMENT = gql`
  ${EVENT_FRAGMENT}
  ${RECURRENCE_RULE_FRAGMENT}
  ${EVENT_IMAGE_FRAGMENT}
  ${EVENT_ANNOUNCEMENT_FRAGMENT}
  fragment EventDetailFragment on Event {
    ...EventFragment
    recurrenceRule {
      ...RecurrenceRuleFragment
    }
    images {
      ...EventImageFragment
    }
    announcements {
      ...EventAnnouncementFragment
    }
  }
`;

// Event update fragment
export const EVENT_UPDATE_FRAGMENT = gql`
  ${ORGANIZER_FRAGMENT}
  fragment EventUpdateFragment on EventUpdate {
    id
    updatedBy {
      ...OrganizerFragment
    }
    fieldName
    oldValue
    newValue
    updateType
    createdAt
  }
`;

// Page info fragment for pagination
export const PAGE_INFO_FRAGMENT = gql`
  fragment PageInfoFragment on PageInfo {
    hasNextPage
    hasPreviousPage
    startCursor
    endCursor
  }
`;

// Event edge fragment for connections
export const EVENT_EDGE_FRAGMENT = gql`
  ${EVENT_FRAGMENT}
  fragment EventEdgeFragment on EventEdge {
    node {
      ...EventFragment
    }
    cursor
  }
`;

// Event connection fragment for paginated results
export const EVENT_CONNECTION_FRAGMENT = gql`
  ${EVENT_EDGE_FRAGMENT}
  ${PAGE_INFO_FRAGMENT}
  fragment EventConnectionFragment on EventConnection {
    edges {
      ...EventEdgeFragment
    }
    pageInfo {
      ...PageInfoFragment
    }
    totalCount
  }
`;
