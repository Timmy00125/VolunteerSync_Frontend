import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CapacityTracker } from './capacity-tracker';
import { EventService } from './event';
import { EventErrorHandler } from './event-error-handler';
import { ApolloError } from '@apollo/client/core';
import { provideZonelessChangeDetection } from '@angular/core';

describe('CapacityTracker', () => {
  let service: CapacityTracker;
  let eventService: jasmine.SpyObj<EventService>;
  let errorHandler: jasmine.SpyObj<EventErrorHandler>;

  beforeEach(() => {
    const eventServiceSpy = jasmine.createSpyObj('EventService', ['subscribeToEventUpdates']);
    const errorHandlerSpy = jasmine.createSpyObj('EventErrorHandler', [
      'handleEventOperationError',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        CapacityTracker,
        { provide: EventService, useValue: eventServiceSpy },
        { provide: EventErrorHandler, useValue: errorHandlerSpy },
      ],
    });

    service = TestBed.inject(CapacityTracker);
    eventService = TestBed.inject(EventService) as jasmine.SpyObj<EventService>;
    errorHandler = TestBed.inject(EventErrorHandler) as jasmine.SpyObj<EventErrorHandler>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('trackEventCapacity', () => {
    it('should track capacity for new event', () => {
      const mockEvent = {
        id: 'test-event',
        currentRegistrations: 15,
        maxCapacity: 50,
        title: 'Test Event',
      } as any;

      eventService.subscribeToEventUpdates.and.returnValue(of(mockEvent));

      service.trackEventCapacity('test-event');

      expect(service.getCapacityPercentage(mockEvent)).toBe(30);
      expect(service.isAtCapacity(mockEvent)).toBe(false);
    });

    it('should handle capacity at maximum', () => {
      const mockEvent = {
        id: 'test-event',
        currentRegistrations: 50,
        maxCapacity: 50,
        title: 'Test Event',
      } as any;

      eventService.subscribeToEventUpdates.and.returnValue(of(mockEvent));

      service.trackEventCapacity('test-event');

      expect(service.getCapacityPercentage(mockEvent)).toBe(100);
      expect(service.isAtCapacity(mockEvent)).toBe(true);
    });

    it('should handle subscription errors', () => {
      const error = new ApolloError({ errorMessage: 'Subscription failed' });
      eventService.subscribeToEventUpdates.and.returnValue(throwError(() => error));

      service.trackEventCapacity('test-event');

      expect(errorHandler.handleEventOperationError).toHaveBeenCalledWith(error, {
        operation: 'capacity-tracking',
        eventId: 'test-event',
      });
    });
  });

  describe('stopTracking', () => {
    it('should stop tracking and clean up', () => {
      const mockEvent = {
        id: 'test-event',
        currentRegistrations: 15,
        maxCapacity: 50,
        title: 'Test Event',
      } as any;

      eventService.subscribeToEventUpdates.and.returnValue(of(mockEvent));

      service.trackEventCapacity('test-event');
      service.stopTracking('test-event');

      // After stopping, subscription should be cleaned up
      expect(service.isTracking('test-event')).toBe(false);
    });

    it('should handle stopping tracking for non-existent event', () => {
      // Should not throw error when stopping tracking for non-existent event
      expect(() => service.stopTracking('non-existent')).not.toThrow();
    });
  });

  describe('isAtCapacity', () => {
    it('should return true when at maximum capacity', () => {
      const event = {
        currentRegistrations: 50,
        capacity: { maximum: 50 },
      } as any;

      expect(service.isAtCapacity(event)).toBe(true);
    });

    it('should return false when below maximum capacity', () => {
      const event = {
        currentRegistrations: 25,
        capacity: { maximum: 50 },
      } as any;

      expect(service.isAtCapacity(event)).toBe(false);
    });

    it('should return true when exceeding maximum capacity', () => {
      const event = {
        currentRegistrations: 55,
        capacity: { maximum: 50 },
      } as any;

      expect(service.isAtCapacity(event)).toBe(true);
    });
  });

  describe('getCapacityPercentage', () => {
    it('should calculate correct percentage', () => {
      const event = {
        currentRegistrations: 25,
        capacity: { maximum: 50 },
      } as any;

      expect(service.getCapacityPercentage(event)).toBe(50);
    });

    it('should handle zero maximum capacity', () => {
      const event = {
        currentRegistrations: 0,
        capacity: { maximum: 0 },
      } as any;

      expect(service.getCapacityPercentage(event)).toBe(0);
    });

    it('should handle percentage over 100%', () => {
      const event = {
        currentRegistrations: 60,
        capacity: { maximum: 50 },
      } as any;

      expect(service.getCapacityPercentage(event)).toBe(120);
    });
  });

  describe('getRemainingSpots', () => {
    it('should calculate remaining spots correctly', () => {
      const event = {
        currentRegistrations: 25,
        capacity: { maximum: 50 },
      } as any;

      expect(service.getRemainingSpots(event)).toBe(25);
    });

    it('should return 0 when at capacity', () => {
      const event = {
        currentRegistrations: 50,
        capacity: { maximum: 50 },
      } as any;

      expect(service.getRemainingSpots(event)).toBe(0);
    });

    it('should return 0 when over capacity', () => {
      const event = {
        currentRegistrations: 55,
        capacity: { maximum: 50 },
      } as any;

      expect(service.getRemainingSpots(event)).toBe(0);
    });
  });

  describe('getCapacityUpdate', () => {
    it('should return capacity update for tracked event', () => {
      const mockEvent = {
        id: 'test-event',
        currentRegistrations: 25,
        capacity: { maximum: 50 },
        title: 'Test Event',
      } as any;

      eventService.subscribeToEventUpdates.and.returnValue(of(mockEvent));
      service.trackEventCapacity('test-event');

      const capacityUpdate = service.getCapacityUpdate('test-event');
      expect(capacityUpdate).toBeDefined();
      expect(capacityUpdate?.eventId).toBe('test-event');
    });

    it('should return undefined for non-tracked event', () => {
      const capacityUpdate = service.getCapacityUpdate('non-existent');
      expect(capacityUpdate).toBeUndefined();
    });
  });

  describe('getTrackedEventIds', () => {
    it('should return array of tracked event IDs', () => {
      const mockEvent1 = {
        id: 'event1',
        currentRegistrations: 15,
        capacity: { maximum: 50 },
      } as any;
      const mockEvent2 = {
        id: 'event2',
        currentRegistrations: 25,
        capacity: { maximum: 100 },
      } as any;

      eventService.subscribeToEventUpdates.and.returnValue(of(mockEvent1));
      service.trackEventCapacity('event1');

      eventService.subscribeToEventUpdates.and.returnValue(of(mockEvent2));
      service.trackEventCapacity('event2');

      const trackedIds = service.getTrackedEventIds();
      expect(trackedIds).toContain('event1');
      expect(trackedIds).toContain('event2');
      expect(trackedIds.length).toBe(2);
    });

    it('should return empty array when no events tracked', () => {
      const trackedIds = service.getTrackedEventIds();
      expect(trackedIds).toEqual([]);
    });
  });

  describe('isTracking', () => {
    it('should return true for tracked events', () => {
      const mockEvent = {
        id: 'test-event',
        currentRegistrations: 15,
        maxCapacity: 50,
        title: 'Test Event',
      } as any;

      eventService.subscribeToEventUpdates.and.returnValue(of(mockEvent));

      service.trackEventCapacity('test-event');

      expect(service.isTracking('test-event')).toBe(true);
    });

    it('should return false for non-tracked events', () => {
      expect(service.isTracking('non-existent')).toBe(false);
    });
  });

  describe('getCapacityUpdateObservable', () => {
    it('should return observable for tracked event', () => {
      const mockEvent = {
        id: 'test-event',
        currentRegistrations: 15,
        capacity: { maximum: 50 },
        title: 'Test Event',
      } as any;

      eventService.subscribeToEventUpdates.and.returnValue(of(mockEvent));
      service.trackEventCapacity('test-event');

      const observable = service.getCapacityUpdateObservable('test-event');
      expect(observable).toBeDefined();

      // Test that observable emits capacity updates
      let emittedUpdate: any;
      observable.subscribe((update) => (emittedUpdate = update));

      expect(emittedUpdate).toBeDefined();
      expect(emittedUpdate.eventId).toBe('test-event');
    });
  });

  describe('lifecycle management', () => {
    it('should cleanup all subscriptions on destroy', () => {
      const mockEvent1 = { id: 'event1', currentRegistrations: 15, maxCapacity: 50 } as any;
      const mockEvent2 = { id: 'event2', currentRegistrations: 25, maxCapacity: 100 } as any;

      eventService.subscribeToEventUpdates.and.returnValue(of(mockEvent1));
      service.trackEventCapacity('event1');

      eventService.subscribeToEventUpdates.and.returnValue(of(mockEvent2));
      service.trackEventCapacity('event2');

      expect(service.isTracking('event1')).toBe(true);
      expect(service.isTracking('event2')).toBe(true);

      service.ngOnDestroy();

      expect(service.isTracking('event1')).toBe(false);
      expect(service.isTracking('event2')).toBe(false);
    });
  });
});
