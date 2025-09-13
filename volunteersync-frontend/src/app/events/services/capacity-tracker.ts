import { Injectable, inject, OnDestroy, signal, computed } from '@angular/core';
import { Apollo } from 'apollo-angular';
import {
  Observable,
  Subscription,
  EMPTY,
  BehaviorSubject,
  map,
  catchError,
  tap,
  takeUntil,
  Subject,
} from 'rxjs';
import { EventService } from './event';
import { EventErrorHandler } from './event-error-handler';
import { Event } from '../../shared/models/event.model';
import { Registration } from '../../shared/models/registration.model';
import { EVENT_REGISTRATION_UPDATED } from '../../graphql/subscriptions/event.subscriptions';

export interface CapacityUpdate {
  eventId: string;
  registeredCount: number;
  capacity: number;
  availableSpots: number;
  isAtCapacity: boolean;
  isNearCapacity: boolean;
  capacityPercentage: number;
  registration?: Registration;
}

export interface CapacityThresholds {
  warning: number; // Percentage when to show warning (e.g., 80)
  critical: number; // Percentage when to show critical alert (e.g., 95)
}

@Injectable({
  providedIn: 'root',
})
export class CapacityTracker implements OnDestroy {
  private apollo = inject(Apollo);
  private eventService = inject(EventService);
  private eventErrorHandler = inject(EventErrorHandler);
  private destroy$ = new Subject<void>();

  // Active subscriptions map
  private subscriptions = new Map<string, Subscription>();

  // Capacity data signals
  private capacityUpdatesSignal = signal<Map<string, CapacityUpdate>>(new Map());

  // Configuration
  private readonly DEFAULT_THRESHOLDS: CapacityThresholds = {
    warning: 80,
    critical: 95,
  };

  // Computed signals
  readonly capacityUpdates = computed(() => this.capacityUpdatesSignal());

  /**
   * Track capacity for a specific event with real-time updates
   */
  trackEventCapacity(
    eventId: string,
    thresholds: CapacityThresholds = this.DEFAULT_THRESHOLDS
  ): void {
    // Avoid duplicate tracking
    if (this.subscriptions.has(eventId)) {
      return;
    }

    // For now, use the event update subscription since capacity-specific subscription
    // may not be implemented yet in the GraphQL schema
    const subscription = this.eventService
      .subscribeToEventUpdates(eventId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (event) => {
          // Create capacity update from event data
          const update: CapacityUpdate = {
            eventId: event.id,
            registeredCount: event.capacity.current,
            capacity: event.capacity.maximum,
            availableSpots: Math.max(0, event.capacity.maximum - event.capacity.current),
            isAtCapacity: event.capacity.current >= event.capacity.maximum,
            isNearCapacity: this.isNearCapacity(event, thresholds),
            capacityPercentage: this.getCapacityPercentage(event),
          };

          this.updateCapacitySignal(event.id, update);
        },
        error: (error) => {
          this.eventErrorHandler.handleEventOperationError(error, {
            operation: 'capacity-tracking',
            eventId,
          });
        },
      });

    this.subscriptions.set(eventId, subscription);
  }

  /**
   * Stop tracking capacity for a specific event
   */
  stopTracking(eventId: string): void {
    const subscription = this.subscriptions.get(eventId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(eventId);

      // Remove from signal
      const updates = new Map(this.capacityUpdatesSignal());
      updates.delete(eventId);
      this.capacityUpdatesSignal.set(updates);

      console.log(`[CapacityTracker] Stopped capacity tracking for event: ${eventId}`);
    }
  }

  /**
   * Stop tracking all events
   */
  stopAllTracking(): void {
    this.subscriptions.forEach((subscription, eventId) => {
      subscription.unsubscribe();
      console.log(`[CapacityTracker] Stopped tracking event: ${eventId}`);
    });

    this.subscriptions.clear();
    this.capacityUpdatesSignal.set(new Map());
  }

  /**
   * Check if an event is currently at capacity
   */
  isAtCapacity(event: Event): boolean {
    return event.capacity.current >= event.capacity.maximum;
  }

  /**
   * Check if an event is near capacity based on thresholds
   */
  isNearCapacity(event: Event, thresholds?: CapacityThresholds): boolean {
    const threshold = thresholds?.warning ?? this.DEFAULT_THRESHOLDS.warning;
    const percentage = this.getCapacityPercentage(event);
    return percentage >= threshold;
  }

  /**
   * Get capacity percentage for an event
   */
  getCapacityPercentage(event: Event): number {
    if (event.capacity.maximum <= 0) return 0;
    return (event.capacity.current / event.capacity.maximum) * 100;
  }

  /**
   * Get remaining spots for an event
   */
  getRemainingSpots(event: Event): number {
    return Math.max(0, event.capacity.maximum - event.capacity.current);
  }

  /**
   * Get current capacity update for a specific event
   */
  getCapacityUpdate(eventId: string): CapacityUpdate | undefined {
    return this.capacityUpdatesSignal().get(eventId);
  }

  /**
   * Check if we're currently tracking an event
   */
  isTracking(eventId: string): boolean {
    return this.subscriptions.has(eventId);
  }

  /**
   * Get all currently tracked event IDs
   */
  getTrackedEventIds(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  ngOnDestroy(): void {
    this.stopAllTracking();
  }

  private transformSubscriptionData(
    subscriptionData: any,
    thresholds?: CapacityThresholds
  ): CapacityUpdate {
    const { eventId, registeredCount, registration } = subscriptionData;

    // We need to get the event data to calculate capacity info
    // For now, we'll use the data from the subscription
    const capacity = subscriptionData.capacity || { maximum: 100 }; // Fallback

    const availableSpots = Math.max(0, capacity.maximum - registeredCount);
    const isAtCapacity = registeredCount >= capacity.maximum;
    const capacityPercentage =
      capacity.maximum > 0 ? (registeredCount / capacity.maximum) * 100 : 0;

    const threshold = thresholds?.warning ?? this.DEFAULT_THRESHOLDS.warning;
    const isNearCapacity = capacityPercentage >= threshold;

    return {
      eventId,
      registeredCount,
      capacity: capacity.maximum,
      availableSpots,
      isAtCapacity,
      isNearCapacity,
      capacityPercentage,
      registration,
    };
  }

  private updateCapacitySignal(eventId: string, capacityUpdate: CapacityUpdate): void {
    const updates = new Map(this.capacityUpdatesSignal());
    updates.set(eventId, capacityUpdate);
    this.capacityUpdatesSignal.set(updates);
  }

  getCapacityUpdateObservable(eventId: string): Observable<CapacityUpdate> {
    return new Observable((subscriber) => {
      // Initial value if available
      const currentUpdate = this.getCapacityUpdate(eventId);
      if (currentUpdate) {
        subscriber.next(currentUpdate);
      }

      // Subscribe to future updates
      const interval = setInterval(() => {
        const update = this.getCapacityUpdate(eventId);
        if (update) {
          subscriber.next(update);
        }
      }, 100); // Check every 100ms for updates

      return () => {
        clearInterval(interval);
      };
    });
  }
}
