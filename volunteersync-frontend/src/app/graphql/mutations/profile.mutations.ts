import { gql } from 'apollo-angular';
import {
  PROFILE_FRAGMENT,
  SKILL_FRAGMENT,
  AVAILABILITY_FRAGMENT,
  PREFERENCES_FRAGMENT,
  CONTACT_INFO_FRAGMENT,
} from '../fragments/user.fragments';

// Update profile
export const UPDATE_PROFILE = gql`
  ${PROFILE_FRAGMENT}
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      ...ProfileFragment
    }
  }
`;

// Update skills
export const UPDATE_SKILLS = gql`
  ${SKILL_FRAGMENT}
  mutation UpdateSkills($skills: [SkillInput!]!) {
    updateSkills(skills: $skills) {
      ...SkillFragment
    }
  }
`;

// Update availability
export const UPDATE_AVAILABILITY = gql`
  ${AVAILABILITY_FRAGMENT}
  mutation UpdateAvailability($availability: AvailabilityInput!) {
    updateAvailability(availability: $availability) {
      ...AvailabilityFragment
    }
  }
`;

// Update preferences
export const UPDATE_PREFERENCES = gql`
  ${PREFERENCES_FRAGMENT}
  mutation UpdatePreferences($preferences: PreferencesInput!) {
    updatePreferences(preferences: $preferences) {
      ...PreferencesFragment
    }
  }
`;

// Update contact info
export const UPDATE_CONTACT_INFO = gql`
  ${CONTACT_INFO_FRAGMENT}
  mutation UpdateContactInfo($contactInfo: ContactInfoInput!) {
    updateContactInfo(contactInfo: $contactInfo) {
      ...ContactInfoFragment
    }
  }
`;

// Delete profile
export const DELETE_PROFILE = gql`
  mutation DeleteProfile {
    deleteProfile {
      success
      message
    }
  }
`;
