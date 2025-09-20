import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Services
import { DashboardService, VolunteerDashboardData } from '../services/dashboard';
import { AuthService } from '../../auth/services/auth';
import { RegistrationService } from '../../registration/services/registration';
import { RegistrationUiService } from '../../registration/services/registration-ui';

// Models
import { User } from '../../shared/models/user.model';
import { Registration, RegistrationStatus } from '../../shared/models/registration.model';
import { Event } from '../../shared/models/event.model';

// Components
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-volunteer-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './volunteer-dashboard.html',
  styleUrl: './volunteer-dashboard.css',
})
export class VolunteerDashboardComponent implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private authService = inject(AuthService);
  private registrationService = inject(RegistrationService);
  private registrationUiService = inject(RegistrationUiService);
  private destroy$ = new Subject<void>();

  // State signals
  currentUser = signal<User | null>(null);
  dashboardData = signal<VolunteerDashboardData | null>(null);
  upcomingEvents = signal<Registration[]>([]);
  registrationHistory = signal<Registration[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Computed dashboard metrics
  profileCompletionPercentage = computed(() => {
    const data = this.dashboardData();
    return data?.profileCompletionPercentage || 0;
  });

  upcomingEventsCount = computed(() => {
    return this.upcomingEvents().length;
  });

  totalVolunteerHours = computed(() => {
    const data = this.dashboardData();
    const summary = data?.registrationSummary;
    if (!summary) return 0;

    // Calculate based on attended events (would be more accurate with actual duration)
    return summary.attendedEvents * 4; // Assuming 4 hours average per event
  });

  profileCompletionItems = computed(() => {
    const data = this.dashboardData();
    const profile = data?.profile;

    return [
      {
        name: 'Bio',
        completed: !!profile?.bio,
        description: 'Add a personal bio to help organizers understand your background',
      },
      {
        name: 'Skills',
        completed: !!(profile?.skills?.length && profile.skills.length > 0),
        description: 'List your skills to get matched with relevant opportunities',
      },
      {
        name: 'Availability',
        completed: !!profile?.availability,
        description: 'Set your availability preferences',
      },
      {
        name: 'Contact Info',
        completed: !!profile?.contactInfo?.phone,
        description: 'Add contact information for event coordinators',
      },
      {
        name: 'Preferences',
        completed: !!profile?.preferences,
        description: 'Set your volunteering preferences and interests',
      },
    ];
  });

  recentActivity = computed(() => {
    const data = this.dashboardData();
    return data?.recentActivity?.slice(0, 5) || [];
  });

  registrationSummary = computed(() => {
    const data = this.dashboardData();
    return data?.registrationSummary;
  });

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.loading.set(true);
    this.error.set(null);

    const user = this.authService.currentUser();
    if (!user) {
      this.error.set('User not authenticated');
      this.loading.set(false);
      return;
    }

    this.currentUser.set(user);

    this.dashboardService
      .getVolunteerDashboardData(user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.dashboardData.set(data);
          this.upcomingEvents.set(data.upcomingEvents);
          this.loadRegistrationHistory(user.id);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          this.error.set('Failed to load dashboard data. Please try again.');
          this.loading.set(false);
        },
      });
  }

  private loadRegistrationHistory(userId: string): void {
    this.registrationUiService
      .getRegistrationHistory(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (history) => {
          this.registrationHistory.set(history.slice(0, 5)); // Show last 5
        },
        error: (error) => {
          console.error('Error loading registration history:', error);
        },
      });
  }

  onBrowseEvents(): void {
    // Navigate to events page - this would be implemented with router
    window.location.href = '/events';
  }

  onUpdateProfile(): void {
    // Navigate to profile page - this would be implemented with router
    window.location.href = '/profile';
  }

  onViewAllRegistrations(): void {
    // Navigate to full registration history
    window.location.href = '/profile/registrations';
  }

  onViewAllActivity(): void {
    // Navigate to full activity history
    window.location.href = '/profile/activity';
  }

  onManageRegistration(registration: Registration): void {
    // Open registration management dialog or navigate to event details
    window.location.href = `/events/${registration.event.id}`;
  }

  onCompleteProfileItem(item: string): void {
    // Navigate to profile section for the specific item
    window.location.href = `/profile?section=${item.toLowerCase()}`;
  }

  onRefreshDashboard(): void {
    this.loadDashboardData();
  }

  // Helper methods for template
  getRegistrationStatusDisplay(status: RegistrationStatus) {
    return this.registrationUiService.getRegistrationStatusDisplay(status);
  }

  formatDate(date: Date): string {
    return this.registrationUiService.formatRegistrationDate(date);
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'REGISTRATION':
        return 'user-plus';
      case 'CANCELLATION':
        return 'user-minus';
      case 'EVENT_ATTENDED':
        return 'check-circle';
      case 'PROFILE_UPDATED':
        return 'user-circle';
      default:
        return 'bell';
    }
  }

  getActivityColor(type: string): string {
    switch (type) {
      case 'REGISTRATION':
        return 'text-green-600';
      case 'CANCELLATION':
        return 'text-red-600';
      case 'EVENT_ATTENDED':
        return 'text-blue-600';
      case 'PROFILE_UPDATED':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  }
}
