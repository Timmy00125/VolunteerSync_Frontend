import {
  Component,
  input,
  signal,
  computed,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { Event } from '../../shared/models/event.model';
import { EventService } from '../services/event';

export interface EventStatistics {
  totalRegistrations: number;
  approvedRegistrations: number;
  pendingRegistrations: number;
  waitlistCount: number;
  capacityUtilization: number;
  registrationRate: number;
  averageRating?: number;
  completionRate?: number;
  attendanceRate?: number;
  noShowRate?: number;
}

export interface StatCard {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: 'primary' | 'accent' | 'warn' | 'success' | 'info';
  trend?: {
    direction: 'up' | 'down' | 'stable';
    value: number;
    label: string;
  };
}

@Component({
  selector: 'app-event-stats',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatButtonModule,
  ],
  templateUrl: './event-stats.html',
  styleUrl: './event-stats.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventStats implements OnInit {
  private eventService = inject(EventService);

  // Inputs
  event = input.required<Event>();
  showDetailedStats = input<boolean>(true);
  layout = input<'grid' | 'horizontal' | 'vertical'>('grid');

  // Internal state
  private statisticsSignal = signal<EventStatistics | null>(null);
  private loadingSignal = signal<boolean>(false);

  // Computed properties
  readonly statistics = computed(() => this.statisticsSignal());
  readonly loading = computed(() => this.loadingSignal());

  readonly primaryStats = computed(() => {
    const stats = this.statistics();
    const event = this.event();

    if (!stats) return [];

    const statCards: StatCard[] = [
      {
        title: 'Total Registrations',
        value: stats.totalRegistrations,
        subtitle: `of ${event.capacity.maximum} capacity`,
        icon: 'people',
        color: 'primary',
      },
      {
        title: 'Capacity Used',
        value: `${Math.round(stats.capacityUtilization)}%`,
        subtitle: `${event.capacity.maximum - stats.totalRegistrations} spots left`,
        icon: 'analytics',
        color: stats.capacityUtilization > 80 ? 'warn' : 'success',
      },
      {
        title: 'Registration Rate',
        value: `${Math.round(stats.registrationRate)}%`,
        subtitle: 'conversion rate',
        icon: 'trending_up',
        color: 'accent',
      },
    ];

    if (event.capacity.waitlistEnabled && stats.waitlistCount > 0) {
      statCards.push({
        title: 'Waitlist',
        value: stats.waitlistCount,
        subtitle: 'people waiting',
        icon: 'queue',
        color: 'info',
      });
    }

    return statCards;
  });

  readonly detailedStats = computed(() => {
    const stats = this.statistics();

    if (!stats || !this.showDetailedStats()) return [];

    const detailedCards: StatCard[] = [];

    if (stats.approvedRegistrations !== stats.totalRegistrations) {
      detailedCards.push({
        title: 'Approved',
        value: stats.approvedRegistrations,
        subtitle: 'registrations',
        icon: 'check_circle',
        color: 'success',
      });
    }

    if (stats.pendingRegistrations > 0) {
      detailedCards.push({
        title: 'Pending Approval',
        value: stats.pendingRegistrations,
        subtitle: 'awaiting review',
        icon: 'pending',
        color: 'warn',
      });
    }

    if (stats.averageRating) {
      detailedCards.push({
        title: 'Average Rating',
        value: stats.averageRating.toFixed(1),
        subtitle: 'out of 5.0',
        icon: 'star',
        color: 'accent',
      });
    }

    if (stats.attendanceRate !== undefined) {
      detailedCards.push({
        title: 'Attendance Rate',
        value: `${Math.round(stats.attendanceRate)}%`,
        subtitle: 'showed up',
        icon: 'event_available',
        color: stats.attendanceRate > 80 ? 'success' : 'warn',
      });
    }

    if (stats.completionRate !== undefined) {
      detailedCards.push({
        title: 'Completion Rate',
        value: `${Math.round(stats.completionRate)}%`,
        subtitle: 'completed event',
        icon: 'task_alt',
        color: stats.completionRate > 85 ? 'success' : 'accent',
      });
    }

    return detailedCards;
  });

  readonly hasDetailedStats = computed(() => this.detailedStats().length > 0);

  ngOnInit(): void {
    this.loadEventStatistics();
  }

  private async loadEventStatistics(): Promise<void> {
    this.loadingSignal.set(true);

    try {
      const event = this.event();

      // For now, we'll calculate basic stats from the event data
      // In a real implementation, this would fetch detailed statistics from the API
      const stats = this.calculateBasicStatistics(event);

      this.statisticsSignal.set(stats);
    } catch (error) {
      console.error('[EventStats] Error loading statistics:', error);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  private calculateBasicStatistics(event: Event): EventStatistics {
    const totalRegistrations = event.capacity.current;
    const maxCapacity = event.capacity.maximum;

    // Basic calculations from available data
    const capacityUtilization = maxCapacity > 0 ? (totalRegistrations / maxCapacity) * 100 : 0;

    // Simulate some statistics (in a real app, these would come from API)
    const approvedRegistrations = totalRegistrations;
    const pendingRegistrations = 0;
    const waitlistCount = 0; // Would be fetched from API
    const registrationRate = Math.min(100, capacityUtilization + Math.random() * 10);

    return {
      totalRegistrations,
      approvedRegistrations,
      pendingRegistrations,
      waitlistCount,
      capacityUtilization,
      registrationRate,
      // Optional advanced stats would be undefined initially
      averageRating: undefined,
      completionRate: undefined,
      attendanceRate: undefined,
      noShowRate: undefined,
    };
  }

  getStatColor(color: StatCard['color']): string {
    const colorMap = {
      primary: 'primary',
      accent: 'accent',
      warn: 'warn',
      success: 'primary', // Angular Material doesn't have 'success'
      info: 'accent',
    };

    return colorMap[color] || 'primary';
  }

  getStatIconColor(color: StatCard['color']): string {
    switch (color) {
      case 'success':
        return 'text-green-600';
      case 'warn':
        return 'text-orange-600';
      case 'info':
        return 'text-blue-600';
      case 'accent':
        return 'text-purple-600';
      default:
        return 'text-blue-600';
    }
  }
}
