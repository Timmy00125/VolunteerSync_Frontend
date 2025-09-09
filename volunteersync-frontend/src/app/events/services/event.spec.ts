import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import { EventService } from './event';
import {
  GET_EVENTS,
  GET_EVENT_BY_ID,
  SEARCH_EVENTS,
  GET_MY_REGISTRATIONS,
} from '../../graphql/queries/event.queries';
import {
  CREATE_EVENT,
  UPDATE_EVENT,
  PUBLISH_EVENT,
  CANCEL_EVENT,
  DELETE_EVENT,
  REGISTER_FOR_EVENT,
  CANCEL_REGISTRATION,
} from '../../graphql/mutations/event.mutations';
import {
  EVENT_UPDATED,
  EVENT_REGISTRATION_UPDATED,
} from '../../graphql/subscriptions/event.subscriptions';
import { Event, EventConnection, EventStatus } from '../../shared/models/event.model';
import { Registration, RegistrationStatus } from '../../shared/models/registration.model';
import { GraphQLError } from 'graphql';

describe('EventService', () => {
  let service: EventService;
  let controller: ApolloTestingController;

  const mockEvent: Event = {
    id: '1',
    title: 'Test Event',
    description: 'Test Description',
    organizer: { id: '1', name: 'Test User', email: '', emailVerified: true, roles: [] },
    organizerId: '1',
    status: EventStatus.PUBLISHED,
    startTime: new Date(),
    endTime: new Date(),
    location: {
      name: 'Test Location',
      address: 'Test Address',
      city: 'Test City',
      country: 'Test Country',
      isRemote: false,
    },
    capacity: { minimum: 10, maximum: 100, current: 50, waitlistEnabled: true },
    requirements: { backgroundCheck: false, skills: [], training: [], interests: [] },
    category: 'COMMUNITY_SERVICE' as any,
    timeCommitment: 'ONE_TIME' as any,
    tags: [],
    registrationSettings: {
      closesAt: new Date(),
      requiresApproval: false,
      allowWaitlist: true,
      confirmationRequired: false,
    },
    images: [],
    announcements: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    currentRegistrations: 50,
    availableSpots: 50,
    isAtCapacity: false,
    canRegister: true,
  };

  const mockRegistration: Registration = {
    id: 'reg1',
    user: { id: 'user1', name: 'Test User', email: '', roles: [], emailVerified: true },
    event: mockEvent,
    status: RegistrationStatus.CONFIRMED,
    appliedAt: new Date(),
    canCancel: true,
    canCheckIn: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    attendanceStatus: 'REGISTERED' as any,
    skills: [],
    interests: [],
  };

  const mockEventConnection: EventConnection = {
    edges: [{ node: mockEvent, cursor: 'cursor-1' }],
    pageInfo: {
      hasNextPage: true,
      hasPreviousPage: false,
      startCursor: 'cursor-1',
      endCursor: 'cursor-1',
    },
    totalCount: 1,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [provideZonelessChangeDetection(), EventService],
    });
    service = TestBed.inject(EventService);
    controller = TestBed.inject(ApolloTestingController);
  });

  afterEach(() => {
    controller.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getEvents', () => {
    it('should fetch events and update signals', (done) => {
      service.getEvents().subscribe((result) => {
        expect(result).toEqual(mockEventConnection);
        expect(service.events()).toEqual([mockEvent]);
        expect(service.isLoading()).toBe(false);
        expect(service.error()).toBe(null);
        done();
      });

      const op = controller.expectOne(GET_EVENTS);
      expect(op.operation.variables['first']).toBe(20);
      op.flush({ data: { events: mockEventConnection } });
    });

    it('should handle errors when fetching events', (done) => {
      const errorMessage = 'Network error';
      service.getEvents().subscribe({
        error: (err) => {
          expect(service.error()).toBe(errorMessage);
          expect(service.isLoading()).toBe(false);
          done();
        },
      });

      const op = controller.expectOne(GET_EVENTS);
      op.graphqlErrors([new GraphQLError(errorMessage)]);
    });
  });

  describe('getEventById', () => {
    it('should fetch an event by ID and update signals', (done) => {
      service.getEventById('1').subscribe((result) => {
        expect(result).toEqual(mockEvent);
        expect(service.selectedEvent()).toEqual(mockEvent);
        expect(service.isLoading()).toBe(false);
        expect(service.error()).toBe(null);
        done();
      });

      const op = controller.expectOne(GET_EVENT_BY_ID);
      expect(op.operation.variables['id']).toBe('1');
      op.flush({ data: { event: mockEvent } });
    });

    it('should return a cached event by ID', (done) => {
      (service as any).eventsCache.set('1', mockEvent);
      service.getEventById('1').subscribe((result) => {
        expect(result).toEqual(mockEvent);
        expect(service.selectedEvent()).toEqual(mockEvent);
        done();
      });
      controller.expectNone(GET_EVENT_BY_ID);
    });
  });

  describe('searchEvents', () => {
    it('should fetch events and update signals', (done) => {
      service.searchEvents('Test').subscribe((result) => {
        expect(result).toEqual(mockEventConnection);
        expect(service.events()).toEqual([mockEvent]);
        expect(service.isLoading()).toBe(false);
        expect(service.error()).toBe(null);
        done();
      });

      const op = controller.expectOne(SEARCH_EVENTS);
      expect(op.operation.variables['query']).toBe('Test');
      op.flush({ data: { searchEvents: mockEventConnection } });
    });
  });

  describe('createEvent', () => {
    it('should create an event and update signals', (done) => {
      const createInput = { title: 'New Event' } as any;
      const newEvent = { ...mockEvent, id: '2', title: 'New Event' };

      service.createEvent(createInput).subscribe((result) => {
        expect(result).toEqual(newEvent);
        expect(service.selectedEvent()).toEqual(newEvent);
        expect(service.isLoading()).toBe(false);
        expect(service.error()).toBe(null);
        done();
      });

      const op = controller.expectOne(CREATE_EVENT);
      expect(op.operation.variables['input']).toEqual(createInput);
      op.flush({ data: { createEvent: newEvent } });
    });
  });

  describe('updateEvent', () => {
    it('should update an event with optimistic response', (done) => {
      const updateInput = { title: 'Updated Event' } as any;
      const updatedEvent = { ...mockEvent, title: 'Updated Event' };
      (service as any).eventsCache.set('1', mockEvent);

      service.updateEvent('1', updateInput).subscribe((result) => {
        expect(result).toEqual(updatedEvent);
        expect(service.selectedEvent()).toEqual(updatedEvent);
        done();
      });

      const op = controller.expectOne(UPDATE_EVENT);
      expect(op.operation.variables['id']).toBe('1');
      expect(op.operation.variables['input']).toEqual(updateInput);
      const optimisticResponse = op.operation.getContext()['optimisticResponse'];
      expect(optimisticResponse.updateEvent.title).toBe(updateInput.title);
      op.flush({ data: { updateEvent: updatedEvent } });
    });
  });

  describe('publishEvent', () => {
    it('should publish an event with optimistic response', (done) => {
      const draftEvent = { ...mockEvent, status: EventStatus.DRAFT };
      const publishedEvent = { ...mockEvent, status: EventStatus.PUBLISHED };
      (service as any).eventsCache.set('1', draftEvent);

      service.publishEvent('1').subscribe((result) => {
        expect(result.status).toBe(EventStatus.PUBLISHED);
        expect(service.selectedEvent()?.status).toBe(EventStatus.PUBLISHED);
        done();
      });

      const op = controller.expectOne(PUBLISH_EVENT);
      const optimisticResponse = op.operation.getContext()['optimisticResponse'];
      expect(optimisticResponse.publishEvent.status).toBe(EventStatus.PUBLISHED);
      op.flush({ data: { publishEvent: publishedEvent } });
    });
  });

  describe('cancelEvent', () => {
    it('should cancel an event with optimistic response', (done) => {
      const publishedEvent = { ...mockEvent, status: EventStatus.PUBLISHED };
      const cancelledEvent = { ...mockEvent, status: EventStatus.CANCELLED };
      (service as any).eventsCache.set('1', publishedEvent);

      service.cancelEvent('1', 'reason').subscribe((result) => {
        expect(result.status).toBe(EventStatus.CANCELLED);
        expect(service.selectedEvent()?.status).toBe(EventStatus.CANCELLED);
        done();
      });

      const op = controller.expectOne(CANCEL_EVENT);
      const optimisticResponse = op.operation.getContext()['optimisticResponse'];
      expect(optimisticResponse.cancelEvent.status).toBe(EventStatus.CANCELLED);
      op.flush({ data: { cancelEvent: cancelledEvent } });
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event and evict it from the cache', (done) => {
      service['setSelectedEvent'](mockEvent);
      service.deleteEvent('1').subscribe((result) => {
        expect(result).toBe(true);
        expect(service.selectedEvent()).toBe(null);
        expect((service as any).eventsCache.has('1')).toBe(false);
        done();
      });

      const op = controller.expectOne(DELETE_EVENT);
      expect(op.operation.variables['id']).toBe('1');
      op.flush({ data: { deleteEvent: true } });
    });
  });

  describe('registerForEvent', () => {
    it('should register a user for an event', (done) => {
      const input = { eventId: '1' };
      service.registerForEvent(input).subscribe((result) => {
        expect(result).toEqual(mockRegistration);
        done();
      });

      const op = controller.expectOne(REGISTER_FOR_EVENT);
      expect(op.operation.variables['input']).toEqual(input);
      op.flush({ data: { registerForEvent: mockRegistration } });
    });
  });

  describe('cancelRegistration', () => {
    it('should cancel a registration', (done) => {
      const cancelledRegistration = { ...mockRegistration, status: RegistrationStatus.CANCELLED };
      service.cancelRegistration('reg1', 'reason').subscribe((result) => {
        expect(result).toEqual(cancelledRegistration);
        done();
      });

      const op = controller.expectOne(CANCEL_REGISTRATION);
      expect(op.operation.variables['registrationId']).toBe('reg1');
      op.flush({ data: { cancelRegistration: cancelledRegistration } });
    });
  });

  describe('getMyRegistrations', () => {
    it('should fetch user registrations', (done) => {
      service.getMyRegistrations().subscribe((result) => {
        expect(result).toEqual([mockRegistration]);
        expect(service.myRegistrations()).toEqual([mockRegistration]);
        done();
      });

      const op = controller.expectOne(GET_MY_REGISTRATIONS);
      op.flush({ data: { myRegistrations: [mockRegistration] } });
    });
  });

  describe('Subscriptions', () => {
    it('should subscribe to event updates', (done) => {
      const updatedEvent = { ...mockEvent, title: 'Subscribed Update' };
      service.subscribeToEventUpdates('1').subscribe((result) => {
        expect(result).toEqual(updatedEvent);
        expect(service.selectedEvent()).toEqual(updatedEvent);
        done();
      });

      const op = controller.expectOne(EVENT_UPDATED);
      op.flush({ data: { eventUpdated: updatedEvent } });
    });

    it('should subscribe to registration updates', (done) => {
      const regUpdate = { eventId: '1', registeredCount: 51, registration: mockRegistration };
      service.subscribeToRegistrationUpdates('1').subscribe((result) => {
        expect(result).toEqual(regUpdate);
        done();
      });

      const op = controller.expectOne(EVENT_REGISTRATION_UPDATED);
      op.flush({ data: { eventRegistrationUpdated: regUpdate } });
    });
  });

  describe('State clear methods', () => {
    it('should clear the error signal', () => {
      service['setError']('An error');
      service.clearError();
      expect(service.error()).toBe(null);
    });

    it('should clear the selected event', () => {
      service['setSelectedEvent'](mockEvent);
      service.clearSelectedEvent();
      expect(service.selectedEvent()).toBe(null);
    });

    it('should clear all caches and signals', () => {
      service['setEvents']([mockEvent]);
      service['setMyRegistrations']([mockRegistration]);
      service['setSelectedEvent'](mockEvent);
      (service as any).eventsCache.set('1', mockEvent);
      (service as any).registrationsCache.set('reg1', mockRegistration);

      service.clearCache();

      expect(service.events()).toEqual([]);
      expect(service.myRegistrations()).toEqual([]);
      expect(service.selectedEvent()).toBe(null);
      expect((service as any).eventsCache.size).toBe(0);
      expect((service as any).registrationsCache.size).toBe(0);
    });
  });
});
