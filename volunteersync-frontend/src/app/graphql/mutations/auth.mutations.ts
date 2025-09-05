import { gql } from 'apollo-angular';
import { FULL_USER_FRAGMENT } from '../fragments/user.fragments';

export const LOGIN_MUTATION = gql`
  ${FULL_USER_FRAGMENT}
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
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
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      token
      refreshToken
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
    }
  }
`;

export const REQUEST_PASSWORD_RESET_MUTATION = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email) {
      success
      message
    }
  }
`;

export const CONFIRM_PASSWORD_RESET_MUTATION = gql`
  mutation ConfirmPasswordReset($token: String!, $newPassword: String!) {
    confirmPasswordReset(token: $token, newPassword: $newPassword) {
      success
      message
    }
  }
`;

export const UPDATE_USER_PROFILE_MUTATION = gql`
  ${FULL_USER_FRAGMENT}
  mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
    updateUserProfile(input: $input) {
      ...FullUserFragment
    }
  }
`;
