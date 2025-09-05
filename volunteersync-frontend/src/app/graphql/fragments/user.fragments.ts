import { gql } from 'apollo-angular';

export const USER_FRAGMENT = gql`
  fragment UserFragment on User {
    id
    email
    firstName
    lastName
    role
    createdAt
    updatedAt
  }
`;

export const USER_PROFILE_FRAGMENT = gql`
  fragment UserProfileFragment on UserProfile {
    bio
    skills
    availability
    phone
    location
    emergencyContact {
      name
      phone
      relationship
    }
  }
`;

export const FULL_USER_FRAGMENT = gql`
  ${USER_FRAGMENT}
  ${USER_PROFILE_FRAGMENT}
  fragment FullUserFragment on User {
    ...UserFragment
    profile {
      ...UserProfileFragment
    }
  }
`;
