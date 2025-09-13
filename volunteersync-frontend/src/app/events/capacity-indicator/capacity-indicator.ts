import {
  Component,
  input,
  signal,
  computed,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CapacityTracker, CapacityUpdate } from '../services/capacity-tracker';
import { Event } from '../../shared/models/event.model';
import { Subscription } from 'rxjs';

export interface CapacityIndicatorConfig {
  showPercentage?: boolean;
  showSpots?: boolean;
  showIcon?: boolean;
  compact?: boolean;
  warningThreshold?: number;
  criticalThreshold?: number;
}

@Component({
  selector: 'app-capacity-indicator',
  imports: [CommonModule, MatProgressBarModule, MatIconModule, MatTooltipModule],
  templateUrl: './capacity-indicator.html',
  styleUrl: './capacity-indicator.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CapacityIndicator implements OnInit, OnDestroy {
  private capacityTracker = inject(CapacityTracker);

  // Inputs
  event = input.required<Event>();
  config = input<CapacityIndicatorConfig>({});
  enableRealtime = input<boolean>(true);

  // Internal state
  private subscription: Subscription | null = null;
  private capacityUpdateSignal = signal<CapacityUpdate | null>(null);

  // Computed properties
  readonly capacityPercentage = computed(() => {
    const update = this.capacityUpdateSignal();
    if (update) {
      return update.capacityPercentage;
    }

    const event = this.event();
    return this.capacityTracker.getCapacityPercentage(event);
  });

  readonly remainingSpots = computed(() => {
    const update = this.capacityUpdateSignal();
    if (update) {
      return update.availableSpots;
    }

    const event = this.event();
    return this.capacityTracker.getRemainingSpots(event);
  });

  readonly isAtCapacity = computed(() => {
    const update = this.capacityUpdateSignal();
    if (update) {
      return update.isAtCapacity;
    }

    const event = this.event();
    return this.capacityTracker.isAtCapacity(event);
  });

  readonly isNearCapacity = computed(() => {
    const update = this.capacityUpdateSignal();
    if (update) {
      return update.isNearCapacity;
    }

    const event = this.event();
    const threshold = this.config().warningThreshold ?? 80;
    return this.capacityPercentage() >= threshold;
  });

  readonly capacityStatus = computed(() => {
    const percentage = this.capacityPercentage();
    const config = this.config();
    const warningThreshold = config.warningThreshold ?? 80;
    const criticalThreshold = config.criticalThreshold ?? 95;

    if (percentage >= criticalThreshold) {
      return 'critical';
    } else if (percentage >= warningThreshold) {
      return 'warning';
    } else {
      return 'normal';
    }
  });

  readonly progressBarColor = computed(() => {
    const status = this.capacityStatus();
    switch (status) {
      case 'critical':
        return 'warn';
      case 'warning':
        return 'accent';
      default:
        return 'primary';
    }
  });

  readonly statusIcon = computed(() => {
    const status = this.capacityStatus();
    switch (status) {
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'check_circle';
    }
  });

  readonly statusText = computed(() => {
    const event = this.event();
    const remaining = this.remainingSpots();
    const percentage = Math.round(this.capacityPercentage());

    if (this.isAtCapacity()) {
      return event.capacity.waitlistEnabled ? 'Full - Join waitlist' : 'Full';
    } else if (this.isNearCapacity()) {
      return `${remaining} spots left (${percentage}% full)`;
    } else {
      return `${remaining} spots available`;
    }
  });

  readonly tooltipText = computed(() => {
    const event = this.event();
    const current = event.capacity.current;
    const maximum = event.capacity.maximum;
    const percentage = Math.round(this.capacityPercentage());

    return `${current} of ${maximum} spots filled (${percentage}%)`;
  });

  ngOnInit(): void {
    if (this.enableRealtime()) {
      this.startRealtimeTracking();
    }
  }

  ngOnDestroy(): void {
    this.stopRealtimeTracking();
  }

  private startRealtimeTracking(): void {
    const event = this.event();

    // Start tracking capacity updates
    this.capacityTracker.trackEventCapacity(event.id, {
      warning: this.config().warningThreshold ?? 80,
      critical: this.config().criticalThreshold ?? 95,
    });

    // Subscribe to capacity updates
    this.subscription = this.capacityTracker.getCapacityUpdateObservable(event.id).subscribe({
      next: (update: any) => {
        this.capacityUpdateSignal.set(update);
      },
      error: (error: any) => {
        console.error('[CapacityIndicator] Realtime tracking error:', error);
        // Continue with static data if realtime fails
      },
    });
  }

  private stopRealtimeTracking(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    const event = this.event();
    this.capacityTracker.stopTracking(event.id);
  }
}
