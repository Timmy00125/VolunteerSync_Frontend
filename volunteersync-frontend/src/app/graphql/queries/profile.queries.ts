import { gql } from 'apollo-angular';
import { PROFILE_FRAGMENT, SKILL_FRAGMENT } from '../fragments/user.fragments';

// Get user profile
export const GET_PROFILE = gql`
  ${PROFILE_FRAGMENT}
  query GetProfile($userId: ID) {
    profile(userId: $userId) {
      ...ProfileFragment
    }
  }
`;

// Get my profile (current user)
export const GET_MY_PROFILE = gql`
  ${PROFILE_FRAGMENT}
  query GetMyProfile {
    myProfile {
      ...ProfileFragment
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
