import { Injectable, computed, inject, signal } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { ApolloError } from '@apollo/client/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

// Models
import {
  UserProfile,
  Skill,
  Availability,
  UserPreferences,
  ContactInfo,
  UpdateProfileInput,
  SkillInput,
  AvailabilityInput,
  PreferencesInput,
  ContactInfoInput,
  SkillCategory,
} from '../../shared/models/user.model';

// GraphQL Operations
import {
  GET_PROFILE,
  GET_MY_PROFILE,
  GET_AVAILABLE_SKILLS,
  SEARCH_SKILLS,
} from '../../graphql/queries/profile.queries';

import {
  UPDATE_PROFILE,
  UPDATE_SKILLS,
  UPDATE_AVAILABILITY,
  UPDATE_PREFERENCES,
  UPDATE_CONTACT_INFO,
  DELETE_PROFILE,
} from '../../graphql/mutations/profile.mutations';

// Services
import { AuthService } from '../../auth/services/auth';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private apollo = inject(Apollo);
  private authService = inject(AuthService);

  // Signal-based state management
  private isLoadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private profileSignal = signal<UserProfile | null>(null);
  private availableSkillsSignal = signal<Skill[]>([]);

  // Computed signals
  readonly isLoading = computed(() => this.isLoadingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly profile = computed(() => this.profileSignal());
  readonly availableSkills = computed(() => this.availableSkillsSignal());

  // Cache management
  private profilesCache = new Map<string, UserProfile>();
  private skillsCache = new Map<string, Skill[]>();

  /**
   * Set loading state
   */
  private setLoading(loading: boolean): void {
    this.isLoadingSignal.set(loading);
  }

  /**
   * Set error state
   */
  private setError(error: string | null): void {
    this.errorSignal.set(error);
  }

  /**
   * Set profile
   */
  private setProfile(profile: UserProfile | null): void {
    this.profileSignal.set(profile);
    if (profile) {
      this.profilesCache.set(profile.userId, profile);
    }
  }

  /**
   * Extract error message from GraphQL error
   */
  private extractErrorMessage(error: ApolloError): string {
    // Handle network errors specifically
    if (error?.networkError) {
      if ('status' in error.networkError && error.networkError.status === 0) {
        return 'Network connection failed. Please check your internet connection and ensure the server is running.';
      }
      if ('statusCode' in error.networkError && error.networkError.statusCode === 401) {
        return 'Authentication failed. Please log in again.';
      }
      if (error.networkError.message) {
        return `Network error: ${error.networkError.message}`;
      }
      return 'Network connection failed. Please check your internet connection.';
    }

    // Handle GraphQL errors
    if (error?.graphQLErrors?.length > 0) {
      const graphqlError = error.graphQLErrors[0];
      if (graphqlError.extensions?.['code'] === 'UNAUTHENTICATED') {
        return 'Authentication required. Please log in again.';
      }
      return graphqlError.message;
    }

    if (error?.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }

  /**
   * Get user profile
   */
  getProfile(userId?: string): Observable<UserProfile> {
    // Check cache first if userId is provided
    if (userId) {
      const cached = this.profilesCache.get(userId);
      if (cached) {
        return new Observable((observer) => {
          observer.next(cached);
          observer.complete();
        });
      }
    }

    this.setLoading(true);
    this.setError(null);

    const query = userId ? GET_PROFILE : GET_MY_PROFILE;
    const variables = userId ? { id: userId } : {};

    return this.apollo
      .watchQuery<{ user?: any; me?: any }>({
        query,
        variables,
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
      })
      .valueChanges.pipe(
        map((result) => {
          // Check for errors first
          if (result.errors?.length) {
            throw new Error(result.errors[0].message);
          }

          const userData = result.data?.user || result.data?.me;
          if (userData) {
            // Transform the User data to UserProfile format
            const profile: UserProfile = {
              id: userData.id,
              userId: userData.id,
              bio: userData.bio || '',
              skills: userData.skills || [],
              availability: undefined, // User type doesn't have availability field in current schema
              preferences: undefined, // User type doesn't have preferences field in current schema
              contactInfo: undefined, // User type doesn't have contactInfo field in current schema
              emergencyContact: undefined, // User type doesn't have emergencyContact field in current schema
              createdAt: new Date(userData.createdAt || userData.joinedAt),
              updatedAt: new Date(userData.updatedAt || userData.lastActiveAt),
            };
            this.setProfile(profile);
            return profile;
          }
          throw new Error('Profile not found');
        }),
        catchError((error) => {
          const errorMessage = this.extractErrorMessage(error);
          this.setError(errorMessage);
          console.error('Profile loading error:', error);
          return throwError(() => error);
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Update profile
   */
  updateProfile(input: UpdateProfileInput): Observable<UserProfile> {
    this.setLoading(true);
    this.setError(null);

    return this.apollo
      .mutate<{ updateProfile: UserProfile }>({
        mutation: UPDATE_PROFILE,
        variables: { input },
        update: (cache, { data }) => {
          if (data?.updateProfile) {
            this.setProfile(data.updateProfile);
          }
        },
      })
      .pipe(
        map((result) => {
          if (result.data?.updateProfile) {
            return result.data.updateProfile;
          }
          throw new Error('Profile update failed');
        }),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          return throwError(() => error);
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Update skills
   */
  updateSkills(skills: SkillInput[]): Observable<Skill[]> {
    this.setLoading(true);
    this.setError(null);

    return this.apollo
      .mutate<{ updateSkills: Skill[] }>({
        mutation: UPDATE_SKILLS,
        variables: { skills },
      })
      .pipe(
        map((result) => {
          if (result.data?.updateSkills) {
            // Update the profile's skills in cache
            const currentProfile = this.profile();
            if (currentProfile) {
              const updatedProfile = {
                ...currentProfile,
                skills: result.data.updateSkills,
              };
              this.setProfile(updatedProfile);
            }
            return result.data.updateSkills;
          }
          throw new Error('Skills update failed');
        }),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          return throwError(() => error);
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Update availability
   */
  updateAvailability(availability: AvailabilityInput): Observable<Availability> {
    this.setLoading(true);
    this.setError(null);

    return this.apollo
      .mutate<{ updateAvailability: Availability }>({
        mutation: UPDATE_AVAILABILITY,
        variables: { availability },
      })
      .pipe(
        map((result) => {
          if (result.data?.updateAvailability) {
            // Update the profile's availability in cache
            const currentProfile = this.profile();
            if (currentProfile) {
              const updatedProfile = {
                ...currentProfile,
                availability: result.data.updateAvailability,
              };
              this.setProfile(updatedProfile);
            }
            return result.data.updateAvailability;
          }
          throw new Error('Availability update failed');
        }),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          return throwError(() => error);
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Update preferences
   */
  updatePreferences(preferences: PreferencesInput): Observable<UserPreferences> {
    this.setLoading(true);
    this.setError(null);

    return this.apollo
      .mutate<{ updatePreferences: UserPreferences }>({
        mutation: UPDATE_PREFERENCES,
        variables: { preferences },
      })
      .pipe(
        map((result) => {
          if (result.data?.updatePreferences) {
            // Update the profile's preferences in cache
            const currentProfile = this.profile();
            if (currentProfile) {
              const updatedProfile = {
                ...currentProfile,
                preferences: result.data.updatePreferences,
              };
              this.setProfile(updatedProfile);
            }
            return result.data.updatePreferences;
          }
          throw new Error('Preferences update failed');
        }),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          return throwError(() => error);
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Update contact info
   */
  updateContactInfo(contactInfo: ContactInfoInput): Observable<ContactInfo> {
    this.setLoading(true);
    this.setError(null);

    return this.apollo
      .mutate<{ updateContactInfo: ContactInfo }>({
        mutation: UPDATE_CONTACT_INFO,
        variables: { contactInfo },
      })
      .pipe(
        map((result) => {
          if (result.data?.updateContactInfo) {
            // Update the profile's contact info in cache
            const currentProfile = this.profile();
            if (currentProfile) {
              const updatedProfile = {
                ...currentProfile,
                contactInfo: result.data.updateContactInfo,
              };
              this.setProfile(updatedProfile);
            }
            return result.data.updateContactInfo;
          }
          throw new Error('Contact info update failed');
        }),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          return throwError(() => error);
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Get available skills
   */
  getAvailableSkills(category?: SkillCategory): Observable<Skill[]> {
    // Check cache first
    const cacheKey = category || 'all';
    const cached = this.skillsCache.get(cacheKey);
    if (cached) {
      return new Observable((observer) => {
        observer.next(cached);
        observer.complete();
      });
    }

    return this.apollo
      .watchQuery<{ availableSkills: Skill[] }>({
        query: GET_AVAILABLE_SKILLS,
        variables: { category },
        fetchPolicy: 'cache-first',
      })
      .valueChanges.pipe(
        map((result) => {
          if (result.data?.availableSkills) {
            this.skillsCache.set(cacheKey, result.data.availableSkills);
            if (!category) {
              this.availableSkillsSignal.set(result.data.availableSkills);
            }
            return result.data.availableSkills;
          }
          return [];
        }),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          return throwError(() => error);
        })
      );
  }

  /**
   * Search skills
   */
  searchSkills(query: string, category?: SkillCategory, limit: number = 10): Observable<Skill[]> {
    return this.apollo
      .watchQuery<{ searchSkills: Skill[] }>({
        query: SEARCH_SKILLS,
        variables: { query, category, limit },
      })
      .valueChanges.pipe(
        map((result) => {
          if (result.data?.searchSkills) {
            return result.data.searchSkills;
          }
          return [];
        }),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          return throwError(() => error);
        })
      );
  }

  /**
   * Delete profile
   */
  deleteProfile(): Observable<boolean> {
    this.setLoading(true);
    this.setError(null);

    return this.apollo
      .mutate<{ deleteProfile: { success: boolean; message: string } }>({
        mutation: DELETE_PROFILE,
      })
      .pipe(
        map((result) => {
          if (result.data?.deleteProfile) {
            // Clear profile from cache
            this.setProfile(null);
            const currentUser = this.authService.currentUser();
            if (currentUser) {
              this.profilesCache.delete(currentUser.id);
            }
            return result.data.deleteProfile.success;
          }
          throw new Error('Profile deletion failed');
        }),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          return throwError(() => error);
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Clear profile cache
   */
  clearCache(): void {
    this.profilesCache.clear();
    this.skillsCache.clear();
    this.setProfile(null);
    this.availableSkillsSignal.set([]);
  }

  /**
   * Handle profile errors
   */
  private handleProfileError(error: any): void {
    console.error('Profile Service Error:', error);
    this.setError(this.extractErrorMessage(error));
  }
}
