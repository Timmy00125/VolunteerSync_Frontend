import { gql } from 'apollo-angular';

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
  }
`;
