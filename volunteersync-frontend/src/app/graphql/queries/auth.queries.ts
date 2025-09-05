import { gql } from 'apollo-angular';
import { FULL_USER_FRAGMENT } from '../fragments/user.fragments';

export const GET_CURRENT_USER = gql`
  ${FULL_USER_FRAGMENT}
  query GetCurrentUser {
    me {
      ...FullUserFragment
    }
  }
`;

export const GET_USER_BY_ID = gql`
  ${FULL_USER_FRAGMENT}
  query GetUserById($id: ID!) {
    user(id: $id) {
      ...FullUserFragment
    }
  }
`;

export const SEARCH_USERS = gql`
  ${FULL_USER_FRAGMENT}
  query SearchUsers($input: SearchUsersInput!) {
    searchUsers(input: $input) {
      users {
        ...FullUserFragment
      }
      totalCount
      hasNextPage
    }
  }
`;
