import { gql } from 'apollo-angular';
import { PROFILE_FRAGMENT, SKILL_FRAGMENT } from '../fragments/user.fragments';

// Get user profile (public profile for specific user)
export const GET_PROFILE = gql`
  query GetProfile($id: ID!) {
    user(id: $id) {
      id
      name
      email
      bio
      profilePicture
      isVerified
      joinedAt
      lastActiveAt
      location {
        city
        state
        country
      }
      interests {
        id
        name
        category
      }
      skills {
        id
        name
        category
        level
        verified
      }
    }
  }
`;

// Get my profile (current user with full details)
export const GET_MY_PROFILE = gql`
  query GetMyProfile {
    me {
      id
      email
      name
      emailVerified
      bio
      profilePicture
      isVerified
      joinedAt
      lastActiveAt
      location {
        city
        state
        country
      }
      interests {
        id
        name
        category
      }
      skills {
        id
        name
        category
        level
        verified
      }
      roles
    }
  }
`;

// Get available skills
export const GET_AVAILABLE_SKILLS = gql`
  ${SKILL_FRAGMENT}
  query GetAvailableSkills($category: SkillCategory) {
    availableSkills(category: $category) {
      ...SkillFragment
    }
  }
`;

// Search skills
export const SEARCH_SKILLS = gql`
  query SearchSkills($query: String!, $category: SkillCategory, $limit: Int) {
    searchSkills(query: $query, category: $category, limit: $limit) {
      id
      name
      category
    }
  }
`;
