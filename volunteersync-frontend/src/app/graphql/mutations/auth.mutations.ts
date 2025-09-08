import { gql } from 'apollo-angular';
import { FULL_USER_FRAGMENT } from '../fragments/user.fragments';

export const LOGIN_MUTATION = gql`
  ${FULL_USER_FRAGMENT}
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      refreshToken
      user {
        ...FullUserFragment
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  ${FULL_USER_FRAGMENT}
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      refreshToken
      user {
        ...FullUserFragment
      }
    }
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($input: RefreshTokenInput!) {
    refreshToken(input: $input) {
      token
      refreshToken
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export const UPDATE_USER_PROFILE_MUTATION = gql`
  ${FULL_USER_FRAGMENT}
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      ...FullUserFragment
    }
  }
`;
