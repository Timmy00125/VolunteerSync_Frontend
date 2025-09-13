import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { EventService } from '../../events/services/event';
import { AuthService } from '../../auth/services/auth';
import { Event, EventStatus } from '../../shared/models/event.model';
import { Registration } from '../../shared/models/registration.model';
import { EventStats } from '../../events/event-stats/event-stats';
import { CapacityIndicator } from '../../events/capacity-indicator/capacity-indicator';

export interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  totalRegistrations: number;
  averageCapacityUtilization: number;
  eventsNeedingAttention: number;
}

export interface EventSummary extends Event {
  registrationCount: number;
  pendingApprovals: number;
  waitlistCount: number;
  needsAttention: boolean;
  attentionReason?: string;
}

@Component({
  selector: 'app-organizer-dashboard',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatTabsModule,
    EventStats,
    CapacityIndicator,
  ],
  templateUrl: './organizer-dashboard.html',
  styleUrl: './organizer-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizerDashboard implements OnInit {
  private eventService = inject(EventService);
  private authService = inject(AuthService);

  // Signal-based state management
  private organizerEventsSignal = signal<Event[]>([]);
  private recentRegistrationsSignal = signal<Registration[]>([]);
  private loadingSignal = signal<boolean>(false);
  private selectedTabIndexSignal = signal<number>(0);

  // Computed dashboard metrics
  readonly organizerEvents = computed(() => this.organizerEventsSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly selectedTabIndex = computed(() => this.selectedTabIndexSignal());

  readonly dashboardStats = computed((): DashboardStats => {
    const events = this.organizerEvents();
    const now = new Date();

    const activeEvents = events.filter(
      (e) => e.status === EventStatus.PUBLISHED && new Date(e.endTime) > now
    );

    const upcomingEvents = events.filter((e) => new Date(e.startTime) > now);

    const pastEvents = events.filter((e) => new Date(e.endTime) < now);

    const totalRegistrations = events.reduce((sum, e) => sum + e.capacity.current, 0);

    const averageCapacityUtilization =
      events.length > 0
        ? events.reduce((sum, e) => sum + (e.capacity.current / e.capacity.maximum) * 100, 0) /
          events.length
        : 0;

    const eventsNeedingAttention = this.eventSummaries().filter((e) => e.needsAttention).length;

    return {
      totalEvents: events.length,
      activeEvents: activeEvents.length,
      upcomingEvents: upcomingEvents.length,
      pastEvents: pastEvents.length,
      totalRegistrations,
      averageCapacityUtilization,
      eventsNeedingAttention,
    };
  });

  readonly eventSummaries = computed((): EventSummary[] => {
    return this.organizerEvents().map((event) => {
      const registrationCount = event.capacity.current;
      const pendingApprovals = 0; // Would be fetched from API
      const waitlistCount = 0; // Would be fetched from API

      // Determine if event needs attention
      const needsAttention = this.checkIfEventNeedsAttention(event, pendingApprovals);
      const attentionReason = this.getAttentionReason(event, pendingApprovals);

      return {
        ...event,
        registrationCount,
        pendingApprovals,
        waitlistCount,
        needsAttention,
        attentionReason,
      };
    });
  });

  readonly recentEvents = computed(() => {
    return this.eventSummaries()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  });

  readonly upcomingEvents = computed(() => {
    const now = new Date();
    return this.eventSummaries()
      .filter((event) => new Date(event.startTime) > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 5);
  });

  readonly eventsNeedingAttention = computed(() => {
    return this.eventSummaries()
      .filter((event) => event.needsAttention)
      .slice(0, 5);
  });

  // Table columns for event management
  readonly eventTableColumns = ['title', 'startTime', 'capacity', 'status', 'actions'];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  async loadDashboardData(): Promise<void> {
    this.loadingSignal.set(true);

    try {
      // Load organizer's events
      const user = this.authService.currentUser();
      if (user) {
        // In a real implementation, this would filter by organizer ID
        const eventsResult = await this.eventService.getEvents().toPromise();
        const events = eventsResult?.edges.map((edge) => edge.node) || [];
        this.organizerEventsSignal.set(events);
      }

      // Load recent registrations (would be implemented)
      // const registrations = await this.eventService.getRecentRegistrations();
      // this.recentRegistrationsSignal.set(registrations);
    } catch (error) {
      console.error('[OrganizerDashboard] Error loading dashboard data:', error);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  onCreateEvent(): void {
    // Navigate to event creation form
    // this.router.navigate(['/events/create']);
    console.log('Navigate to create event');
  }

  onManageEvent(event: Event): void {
    // Navigate to event management page
    // this.router.navigate(['/events', event.id, 'manage']);
    console.log('Navigate to manage event:', event.title);
  }

  onViewEvent(event: Event): void {
    // Navigate to event detail page
    // this.router.navigate(['/events', event.id]);
    console.log('Navigate to view event:', event.title);
  }

  onEditEvent(event: Event): void {
    // Navigate to event edit form
    // this.router.navigate(['/events', event.id, 'edit']);
    console.log('Navigate to edit event:', event.title);
  }

  onExportData(): void {
    // Export dashboard data
    console.log('Export dashboard data');
  }

  onRefreshData(): void {
    this.loadDashboardData();
  }

  onTabChanged(index: number): void {
    this.selectedTabIndexSignal.set(index);
  }

  getStatusColor(status: EventStatus): string {
    switch (status) {
      case EventStatus.DRAFT:
        return 'default';
      case EventStatus.PUBLISHED:
        return 'primary';
      case EventStatus.CANCELLED:
        return 'warn';
      case EventStatus.COMPLETED:
        return 'accent';
      default:
        return 'default';
    }
  }

  getStatusText(status: EventStatus): string {
    switch (status) {
      case EventStatus.DRAFT:
        return 'Draft';
      case EventStatus.PUBLISHED:
        return 'Published';
      case EventStatus.CANCELLED:
        return 'Cancelled';
      case EventStatus.COMPLETED:
        return 'Completed';
      default:
        return 'Unknown';
    }
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private checkIfEventNeedsAttention(event: Event, pendingApprovals: number): boolean {
    const now = new Date();
    const eventStart = new Date(event.startTime);
    const registrationClose = new Date(event.registrationSettings.closesAt);

    // Event needs attention if:
    // 1. Has pending approvals
    // 2. Registration closes soon and low capacity
    // 3. Event starts soon and below minimum capacity
    // 4. Event is in draft status and start time is approaching

    if (pendingApprovals > 0) return true;

    if (
      event.status === EventStatus.DRAFT &&
      eventStart.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000
    ) {
      return true; // Draft event starting in less than 7 days
    }

    if (
      event.capacity.current < event.capacity.minimum &&
      eventStart.getTime() - now.getTime() < 3 * 24 * 60 * 60 * 1000
    ) {
      return true; // Below minimum capacity and starting in less than 3 days
    }

    const capacityPercent = (event.capacity.current / event.capacity.maximum) * 100;
    if (capacityPercent < 50 && registrationClose.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return true; // Low capacity and registration closes in less than 24 hours
    }

    return false;
  }

  private getAttentionReason(event: Event, pendingApprovals: number): string | undefined {
    if (pendingApprovals > 0) {
      return `${pendingApprovals} pending approval${pendingApprovals > 1 ? 's' : ''}`;
    }

    const now = new Date();
    const eventStart = new Date(event.startTime);

    if (
      event.status === EventStatus.DRAFT &&
      eventStart.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000
    ) {
      return 'Draft event starting soon';
    }

    if (event.capacity.current < event.capacity.minimum) {
      return 'Below minimum capacity';
    }

    const capacityPercent = (event.capacity.current / event.capacity.maximum) * 100;
    if (capacityPercent < 50) {
      return 'Low registration rate';
    }

    return undefined;
  }
}
