import { Injectable, computed, inject, signal } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, combineLatest, map, shareReplay } from 'rxjs';

// Services
import { RegistrationService } from '../../registration/services/registration';
import { EventService } from '../../events/services/event';
import { AuthService } from '../../auth/services/auth';

// Models
import { User, UserProfile } from '../../shared/models/user.model';
import { Event } from '../../shared/models/event.model';
import {
  Registration,
  RegistrationStatus,
  RegistrationSummary,
} from '../../shared/models/registration.model';

export interface VolunteerDashboardData {
  user: User;
  upcomingEvents: Registration[];
  registrationSummary: RegistrationSummary;
  profile: UserProfile;
  recentActivity: Activity[];
  profileCompletionPercentage: number;
}

export interface OrganizerDashboardData {
  user: User;
  organizedEvents: Event[];
  registrationStats: RegistrationStats;
  recentRegistrations: Registration[];
  upcomingEvents: Event[];
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  eventId?: string;
  registrationId?: string;
}

export interface DashboardStats {
  totalVolunteerHours: number;
  eventsAttended: number;
  upcomingEvents: number;
  profileCompletionPercentage: number;
}

export interface RegistrationStats {
  totalRegistrations: number;
  confirmedRegistrations: number;
  waitlistCount: number;
  attendanceRate: number;
  noShowRate: number;
  cancellationRate: number;
}

export enum ActivityType {
  REGISTRATION = 'REGISTRATION',
  CANCELLATION = 'CANCELLATION',
  EVENT_ATTENDED = 'EVENT_ATTENDED',
  PROFILE_UPDATED = 'PROFILE_UPDATED',
  EVENT_CREATED = 'EVENT_CREATED',
  EVENT_UPDATED = 'EVENT_UPDATED',
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apollo = inject(Apollo);
  private registrationService = inject(RegistrationService);
  private eventService = inject(EventService);
  private authService = inject(AuthService);

  // State signals
  private isLoadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private dashboardDataSignal = signal<VolunteerDashboardData | OrganizerDashboardData | null>(
    null
  );

  // Computed signals
  readonly isLoading = computed(() => this.isLoadingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly dashboardData = computed(() => this.dashboardDataSignal());

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
   * Get volunteer dashboard data
   */
  getVolunteerDashboardData(userId: string): Observable<VolunteerDashboardData> {
    this.setLoading(true);
    this.setError(null);

    return combineLatest([
      this.authService.getCurrentUser(),
      this.registrationService.getUserRegistrations(userId),
      this.registrationService.getRegistrationSummary(userId),
      this.getRecentActivity(userId),
    ]).pipe(
      map(([user, registrations, registrationSummary, recentActivity]) => {
        if (!user) {
          throw new Error('User not found');
        }

        // Filter upcoming events
        const now = new Date();
        const upcomingEvents = registrations
          .filter(
            (reg) =>
              reg.status === RegistrationStatus.CONFIRMED && new Date(reg.event.startTime) > now
          )
          .slice(0, 5); // Limit to 5 upcoming events

        // Create profile data from user profile (or defaults if not available)
        const profile = user.profile || {
          id: '',
          userId: user.id,
          bio: undefined,
          skills: [],
          availability: { days: [], timeSlots: [] } as any,
          preferences: {} as any,
          contactInfo: { phone: undefined, alternateEmail: undefined, address: undefined },
          emergencyContact: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Calculate profile completion percentage
        const profileCompletionPercentage = this.calculateProfileCompletion(profile);

        const dashboardData: VolunteerDashboardData = {
          user,
          upcomingEvents,
          registrationSummary: registrationSummary || {
            totalRegistrations: registrations.length,
            activeRegistrations: registrations.filter(
              (r) => r.status === RegistrationStatus.CONFIRMED
            ).length,
            cancelledRegistrations: registrations.filter(
              (r) => r.status === RegistrationStatus.CANCELLED
            ).length,
            attendedEvents: registrations.filter((r) => r.status === RegistrationStatus.COMPLETED)
              .length,
            upcomingEvents: upcomingEvents.length,
          },
          profile,
          recentActivity,
          profileCompletionPercentage,
        };

        this.dashboardDataSignal.set(dashboardData);
        this.setLoading(false);
        return dashboardData;
      }),
      shareReplay(1)
    );
  }

  /**
   * Get organizer dashboard data
   */
  getOrganizerDashboardData(userId: string): Observable<OrganizerDashboardData> {
    this.setLoading(true);
    this.setError(null);

    return combineLatest([
      this.authService.getCurrentUser(),
      this.eventService.getOrganizerEvents(userId),
      this.getOrganizerRegistrationStats(userId),
      this.getRecentRegistrations(userId),
    ]).pipe(
      map(([user, events, registrationStats, recentRegistrations]) => {
        if (!user) {
          throw new Error('User not found');
        }

        // Filter upcoming events
        const now = new Date();
        const upcomingEvents = events
          .filter((event) => new Date(event.startTime) > now)
          .slice(0, 5);

        const dashboardData: OrganizerDashboardData = {
          user,
          organizedEvents: events,
          registrationStats,
          recentRegistrations: recentRegistrations.slice(0, 10), // Limit to 10 recent registrations
          upcomingEvents,
        };

        this.dashboardDataSignal.set(dashboardData);
        this.setLoading(false);
        return dashboardData;
      }),
      shareReplay(1)
    );
  }

  /**
   * Get recent activity for user
   */
  getRecentActivity(userId: string): Observable<Activity[]> {
    // This would typically be fetched from a GraphQL query
    // For now, we'll create mock data based on registrations
    return this.registrationService.getUserRegistrations(userId).pipe(
      map((registrations) => {
        const activities: Activity[] = [];

        registrations.slice(0, 5).forEach((registration) => {
          // Add registration activity
          activities.push({
            id: `reg-${registration.id}`,
            type: ActivityType.REGISTRATION,
            title: `Registered for ${registration.event.title}`,
            description: `You registered for this event on ${new Date(
              registration.appliedAt
            ).toLocaleDateString()}`,
            timestamp: registration.appliedAt,
            eventId: registration.event.id,
            registrationId: registration.id,
          });

          // Add completion activity if completed
          if (registration.status === RegistrationStatus.COMPLETED && registration.completedAt) {
            activities.push({
              id: `complete-${registration.id}`,
              type: ActivityType.EVENT_ATTENDED,
              title: `Completed ${registration.event.title}`,
              description: `You completed this volunteering event`,
              timestamp: registration.completedAt,
              eventId: registration.event.id,
              registrationId: registration.id,
            });
          }

          // Add cancellation activity if cancelled
          if (registration.status === RegistrationStatus.CANCELLED && registration.cancelledAt) {
            activities.push({
              id: `cancel-${registration.id}`,
              type: ActivityType.CANCELLATION,
              title: `Cancelled registration for ${registration.event.title}`,
              description: registration.cancellationReason || 'Registration was cancelled',
              timestamp: registration.cancelledAt,
              eventId: registration.event.id,
              registrationId: registration.id,
            });
          }
        });

        // Sort by timestamp descending
        return activities.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      })
    );
  }

  /**
   * Get dashboard stats for user
   */
  getDashboardStats(userId: string): Observable<DashboardStats> {
    return combineLatest([
      this.registrationService.getUserRegistrations(userId),
      this.authService.getCurrentUser(),
    ]).pipe(
      map(([registrations, user]) => {
        const completedRegistrations = registrations.filter(
          (r) => r.status === RegistrationStatus.COMPLETED
        );
        const upcomingRegistrations = registrations.filter(
          (r) =>
            r.status === RegistrationStatus.CONFIRMED && new Date(r.event.startTime) > new Date()
        );

        // Calculate total volunteer hours (would need duration from events)
        const totalVolunteerHours = completedRegistrations.reduce((total, reg) => {
          const duration =
            new Date(reg.event.endTime).getTime() - new Date(reg.event.startTime).getTime();
          return total + duration / (1000 * 60 * 60); // Convert to hours
        }, 0);

        // Calculate profile completion
        const profileCompletionPercentage = user?.profile
          ? this.calculateProfileCompletion(user.profile)
          : 0;

        return {
          totalVolunteerHours: Math.round(totalVolunteerHours),
          eventsAttended: completedRegistrations.length,
          upcomingEvents: upcomingRegistrations.length,
          profileCompletionPercentage,
        };
      })
    );
  }

  /**
   * Get recent registrations for organizer
   */
  private getRecentRegistrations(organizerId: string): Observable<Registration[]> {
    // This would fetch registrations for events organized by this user
    return this.eventService.getOrganizerEvents(organizerId).pipe(
      map((events) => {
        // Mock recent registrations - in real implementation, this would be a separate GraphQL query
        return [];
      })
    );
  }

  /**
   * Get registration stats for organizer
   */
  private getOrganizerRegistrationStats(organizerId: string): Observable<RegistrationStats> {
    return this.eventService.getOrganizerEvents(organizerId).pipe(
      map((events) => {
        // Mock stats - in real implementation, this would aggregate data from GraphQL
        return {
          totalRegistrations: 0,
          confirmedRegistrations: 0,
          waitlistCount: 0,
          attendanceRate: 0,
          noShowRate: 0,
          cancellationRate: 0,
        };
      })
    );
  }

  /**
   * Calculate profile completion percentage
   */
  private calculateProfileCompletion(profile: any): number {
    let completed = 0;
    let total = 5; // bio, skills, availability, contact, preferences

    if (profile?.bio) completed++;
    if (profile?.skills?.length > 0) completed++;
    if (profile?.availability) completed++;
    if (profile?.contactInfo?.phone) completed++;
    if (profile?.preferences) completed++;

    return Math.round((completed / total) * 100);
  }

  /**
   * Refresh dashboard data
   */
  refreshDashboardData(
    userId: string,
    userRole: 'volunteer' | 'organizer' = 'volunteer'
  ): Observable<VolunteerDashboardData | OrganizerDashboardData> {
    if (userRole === 'organizer') {
      return this.getOrganizerDashboardData(userId);
    } else {
      return this.getVolunteerDashboardData(userId);
    }
  }
}
