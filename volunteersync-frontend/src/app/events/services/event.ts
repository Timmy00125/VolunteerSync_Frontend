import { Injectable, computed, inject, signal } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { ApolloError } from '@apollo/client/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';

// Models
import {
  Event,
  EventConnection,
  CreateEventInput,
  UpdateEventInput,
  EventSearchFilter,
  EventSortInput,
  EventStatus,
  Coordinates,
} from '../../shared/models/event.model';
import {
  Registration,
  RegisterForEventInput,
  BulkRegistrationInput,
  RegistrationFilterInput,
  RegistrationStats,
  AttendanceInput,
  AttendanceRecord,
  WaitlistEntry,
  RegistrationConflict,
  ApprovalDecisionInput,
  EventRegistrationUpdate,
} from '../../shared/models/registration.model';

// GraphQL Operations
import {
  GET_EVENTS,
  SEARCH_EVENTS,
  GET_EVENT_BY_ID,
  GET_EVENT_BY_SLUG,
  GET_MY_EVENTS,
  GET_NEARBY_EVENTS,
  GET_EVENT_UPDATES,
  GET_MY_REGISTRATIONS,
  GET_REGISTRATION,
  GET_EVENT_REGISTRATIONS,
  GET_WAITLIST_ENTRIES,
  GET_REGISTRATION_CONFLICTS,
  GET_ATTENDANCE_RECORDS,
  GET_REGISTRATION_STATS,
} from '../../graphql/queries/event.queries';

import {
  CREATE_EVENT,
  UPDATE_EVENT,
  PUBLISH_EVENT,
  CANCEL_EVENT,
  DELETE_EVENT,
  ADD_EVENT_IMAGE,
  UPDATE_EVENT_IMAGE,
  DELETE_EVENT_IMAGE,
  CREATE_EVENT_ANNOUNCEMENT,
  UPDATE_EVENT_ANNOUNCEMENT,
  DELETE_EVENT_ANNOUNCEMENT,
  REGISTER_FOR_EVENT,
  BULK_REGISTER,
  CANCEL_REGISTRATION,
  APPROVE_REGISTRATION,
  CHECK_IN_VOLUNTEER,
  MARK_ATTENDANCE,
  PROMOTE_FROM_WAITLIST,
  TRANSFER_REGISTRATION,
  UPDATE_REGISTRATION,
} from '../../graphql/mutations/event.mutations';

import {
  EVENT_UPDATED,
  EVENT_REGISTRATION_UPDATED,
} from '../../graphql/subscriptions/event.subscriptions';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private apollo = inject(Apollo);

  // Signal-based state management
  private isLoadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private selectedEventSignal = signal<Event | null>(null);
  private eventsSignal = signal<Event[]>([]);
  private myRegistrationsSignal = signal<Registration[]>([]);

  // Computed signals
  readonly isLoading = computed(() => this.isLoadingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly selectedEvent = computed(() => this.selectedEventSignal());
  readonly events = computed(() => this.eventsSignal());
  readonly myRegistrations = computed(() => this.myRegistrationsSignal());

  // Cache management
  private eventsCache = new Map<string, Event>();
  private registrationsCache = new Map<string, Registration>();

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
   * Set selected event
   */
  private setSelectedEvent(event: Event | null): void {
    this.selectedEventSignal.set(event);
    if (event) {
      this.eventsCache.set(event.id, event);
    }
  }

  /**
   * Update events list
   */
  private setEvents(events: Event[]): void {
    this.eventsSignal.set(events);
    // Update cache
    events.forEach((event) => this.eventsCache.set(event.id, event));
  }

  /**
   * Update registrations list
   */
  private setMyRegistrations(registrations: Registration[]): void {
    this.myRegistrationsSignal.set(registrations);
    // Update cache
    registrations.forEach((reg) => this.registrationsCache.set(reg.id, reg));
  }

  /**
   * Extract error message from GraphQL error
   */
  private extractErrorMessage(error: ApolloError): string {
    if (error?.graphQLErrors?.length > 0) {
      return error.graphQLErrors[0].message;
    }
    if (error?.networkError?.message) {
      return error.networkError.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }

  /**
   * Get paginated events with filtering and sorting
   */
  getEvents(
    filter?: EventSearchFilter,
    sort?: EventSortInput,
    first: number = 20,
    after?: string
  ): Observable<EventConnection> {
    this.setLoading(true);
    this.setError(null);

    return this.apollo
      .watchQuery<{ events: EventConnection }>({
        query: GET_EVENTS,
        variables: { filter, sort, first, after },
        fetchPolicy: 'cache-first',
      })
      .valueChanges.pipe(
        map((result) => {
          if (result.data?.events) {
            const events = result.data.events.edges.map((edge) => edge.node);
            this.setEvents(events);
            return result.data.events;
          }
          throw new Error('No events data received');
        }),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          return throwError(() => error);
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Search events with text query
   */
  searchEvents(
    query: string,
    filter?: EventSearchFilter,
    sort?: EventSortInput,
    first: number = 20,
    after?: string
  ): Observable<EventConnection> {
    this.setLoading(true);
    this.setError(null);

    return this.apollo
      .watchQuery<{ searchEvents: EventConnection }>({
        query: SEARCH_EVENTS,
        variables: { query, filter, sort, first, after },
        fetchPolicy: 'cache-first',
      })
      .valueChanges.pipe(
        map((result) => {
          if (result.data?.searchEvents) {
            const events = result.data.searchEvents.edges.map((edge) => edge.node);
            this.setEvents(events);
            return result.data.searchEvents;
          }
          throw new Error('No search results received');
        }),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          return throwError(() => error);
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Get event by ID
   */
  getEventById(id: string): Observable<Event> {
    // Check cache first
    const cached = this.eventsCache.get(id);
    if (cached) {
      this.setSelectedEvent(cached);
      return new BehaviorSubject(cached).asObservable();
    }

    this.setLoading(true);
    this.setError(null);

    return this.apollo
      .watchQuery<{ event: Event }>({
        query: GET_EVENT_BY_ID,
        variables: { id },
        fetchPolicy: 'cache-first',
      })
      .valueChanges.pipe(
        map((result) => {
          if (result.data?.event) {
            this.setSelectedEvent(result.data.event);
            return result.data.event;
          }
          throw new Error('Event not found');
        }),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          return throwError(() => error);
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Get event by slug
   */
  getEventBySlug(slug: string): Observable<Event> {
    this.setLoading(true);
    this.setError(null);

    return this.apollo
      .watchQuery<{ eventBySlug: Event }>({
        query: GET_EVENT_BY_SLUG,
        variables: { slug },
        fetchPolicy: 'cache-first',
      })
      .valueChanges.pipe(
        map((result) => {
          if (result.data?.eventBySlug) {
            this.setSelectedEvent(result.data.eventBySlug);
            return result.data.eventBySlug;
          }
          throw new Error('Event not found');
        }),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          return throwError(() => error);
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Get current user's events
   */
  getMyEvents(
    status?: EventStatus[],
    first: number = 20,
    after?: string
  ): Observable<EventConnection> {
    this.setLoading(true);
    this.setError(null);

    return this.apollo
      .watchQuery<{ myEvents: EventConnection }>({
        query: GET_MY_EVENTS,
        variables: { status, first, after },
        fetchPolicy: 'cache-first',
      })
      .valueChanges.pipe(
        map((result) => {
          if (result.data?.myEvents) {
            const events = result.data.myEvents.edges.map((edge) => edge.node);
            this.setEvents(events);
            return result.data.myEvents;
          }
          throw new Error('No events data received');
        }),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          return throwError(() => error);
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Get nearby events
   */
  getNearbyEvents(
    coordinates: Coordinates,
    radius: number,
    filter?: EventSearchFilter,
    first: number = 20,
    after?: string
  ): Observable<EventConnection> {
    this.setLoading(true);
    this.setError(null);

    return this.apollo
      .watchQuery<{ nearbyEvents: EventConnection }>({
        query: GET_NEARBY_EVENTS,
        variables: { coordinates, radius, filter, first, after },
        fetchPolicy: 'cache-first',
      })
      .valueChanges.pipe(
        map((result) => {
          if (result.data?.nearbyEvents) {
            const events = result.data.nearbyEvents.edges.map((edge) => edge.node);
            this.setEvents(events);
            return result.data.nearbyEvents;
          }
          throw new Error('No nearby events found');
        }),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          return throwError(() => error);
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Create new event
   */
  createEvent(input: CreateEventInput): Observable<Event> {
    this.setLoading(true);
    this.setError(null);

    return this.apollo
      .mutate<{ createEvent: Event }>({
        mutation: CREATE_EVENT,
        variables: { input },
        update: (cache, { data }) => {
          if (data?.createEvent) {
            // Update cache with new event
            cache.modify({
              fields: {
                myEvents(existing = { edges: [], pageInfo: {}, totalCount: 0 }) {
                  const newEventRef = cache.writeFragment({
                    data: data.createEvent,
                    fragment: gql`
                      fragment NewEvent on Event {
                        id
                      }
                    `,
                  });
                  return {
                    ...existing,
                    edges: [{ node: newEventRef, cursor: '' }, ...existing.edges],
                    totalCount: existing.totalCount + 1,
                  };
                },
              },
            });
          }
        },
      })
      .pipe(
        map((result) => {
          if (result.data?.createEvent) {
            this.setSelectedEvent(result.data.createEvent);
            return result.data.createEvent;
          }
          throw new Error('Failed to create event');
        }),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          return throwError(() => error);
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Update event
   */
  updateEvent(id: string, input: UpdateEventInput): Observable<Event> {
    this.setLoading(true);
    this.setError(null);

    return this.apollo
      .mutate<{ updateEvent: Event }>({
        mutation: UPDATE_EVENT,
        variables: { id, input },
        optimisticResponse: {
          updateEvent: {
            ...this.eventsCache.get(id),
            ...input,
          } as Event,
        },
      })
      .pipe(
        map((result) => {
          if (result.data?.updateEvent) {
            this.setSelectedEvent(result.data.updateEvent);
            return result.data.updateEvent;
          }
          throw new Error('Failed to update event');
        }),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          return throwError(() => error);
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Publish event
   */
  publishEvent(id: string): Observable<Event> {
    this.setLoading(true);
    this.setError(null);

    return this.apollo
      .mutate<{ publishEvent: Event }>({
        mutation: PUBLISH_EVENT,
        variables: { id },
        optimisticResponse: {
          publishEvent: {
            ...this.eventsCache.get(id),
            status: EventStatus.PUBLISHED,
          } as Event,
        },
      })
      .pipe(
        map((result) => {
          if (result.data?.publishEvent) {
            this.setSelectedEvent(result.data.publishEvent);
            return result.data.publishEvent;
          }
          throw new Error('Failed to publish event');
        }),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          return throwError(() => error);
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Cancel event
   */
  cancelEvent(id: string, reason?: string): Observable<Event> {
    this.setLoading(true);
    this.setError(null);

    return this.apollo
      .mutate<{ cancelEvent: Event }>({
        mutation: CANCEL_EVENT,
        variables: { id, reason },
        optimisticResponse: {
          cancelEvent: {
            ...this.eventsCache.get(id),
            status: EventStatus.CANCELLED,
          } as Event,
        },
      })
      .pipe(
        map((result) => {
          if (result.data?.cancelEvent) {
            this.setSelectedEvent(result.data.cancelEvent);
            return result.data.cancelEvent;
          }
          throw new Error('Failed to cancel event');
        }),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          return throwError(() => error);
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Delete event
   */
  deleteEvent(id: string): Observable<boolean> {
    this.setLoading(true);
    this.setError(null);

    return this.apollo
      .mutate<{ deleteEvent: boolean }>({
        mutation: DELETE_EVENT,
        variables: { id },
        update: (cache) => {
          // Remove from cache
          cache.evict({ id: `Event:${id}` });
          cache.gc();
        },
      })
      .pipe(
        map((result) => {
          if (result.data?.deleteEvent) {
            // Remove from local cache
            this.eventsCache.delete(id);
            if (this.selectedEvent()?.id === id) {
              this.setSelectedEvent(null);
            }
            return result.data.deleteEvent;
          }
          throw new Error('Failed to delete event');
        }),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          return throwError(() => error);
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Register for event
   */
  registerForEvent(input: RegisterForEventInput): Observable<Registration> {
    this.setLoading(true);
    this.setError(null);

    return this.apollo
      .mutate<{ registerForEvent: Registration }>({
        mutation: REGISTER_FOR_EVENT,
        variables: { input },
        update: (cache, { data }) => {
          if (data?.registerForEvent) {
            // Update event's registration count in cache
            const eventId = input.eventId;
            cache.modify({
              id: `Event:${eventId}`,
              fields: {
                currentRegistrations(existing) {
                  return existing + 1;
                },
                availableSpots(existing) {
                  return Math.max(0, existing - 1);
                },
              },
            });
          }
        },
      })
      .pipe(
        map((result) => {
          if (result.data?.registerForEvent) {
            return result.data.registerForEvent;
          }
          throw new Error('Failed to register for event');
        }),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          return throwError(() => error);
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Cancel registration
   */
  cancelRegistration(registrationId: string, reason?: string): Observable<Registration> {
    this.setLoading(true);
    this.setError(null);

    return this.apollo
      .mutate<{ cancelRegistration: Registration }>({
        mutation: CANCEL_REGISTRATION,
        variables: { registrationId, reason },
      })
      .pipe(
        map((result) => {
          if (result.data?.cancelRegistration) {
            return result.data.cancelRegistration;
          }
          throw new Error('Failed to cancel registration');
        }),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          return throwError(() => error);
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Get current user's registrations
   */
  getMyRegistrations(filter?: RegistrationFilterInput): Observable<Registration[]> {
    this.setLoading(true);
    this.setError(null);

    return this.apollo
      .watchQuery<{ myRegistrations: Registration[] }>({
        query: GET_MY_REGISTRATIONS,
        variables: { filter },
        fetchPolicy: 'cache-first',
      })
      .valueChanges.pipe(
        map((result) => {
          if (result.data?.myRegistrations) {
            this.setMyRegistrations(result.data.myRegistrations);
            return result.data.myRegistrations;
          }
          throw new Error('No registrations data received');
        }),
        catchError((error) => {
          this.setError(this.extractErrorMessage(error));
          return throwError(() => error);
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * Subscribe to event updates
   */
  subscribeToEventUpdates(eventId: string): Observable<Event> {
    return this.apollo
      .subscribe<{ eventUpdated: Event }>({
        query: EVENT_UPDATED,
        variables: { eventId },
      })
      .pipe(
        map((result) => {
          if (result.data?.eventUpdated) {
            this.setSelectedEvent(result.data.eventUpdated);
            return result.data.eventUpdated;
          }
          throw new Error('No event update received');
        }),
        catchError((error) => {
          console.error('Event subscription error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Subscribe to registration updates
   */
  subscribeToRegistrationUpdates(eventId: string): Observable<EventRegistrationUpdate> {
    return this.apollo
      .subscribe<{ eventRegistrationUpdated: EventRegistrationUpdate }>({
        query: EVENT_REGISTRATION_UPDATED,
        variables: { eventId },
      })
      .pipe(
        map((result) => {
          if (result.data?.eventRegistrationUpdated) {
            return result.data.eventRegistrationUpdated;
          }
          throw new Error('No registration update received');
        }),
        catchError((error: ApolloError) => {
          console.error('Registration subscription error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Clear current error
   */
  clearError(): void {
    this.setError(null);
  }

  /**
   * Clear selected event
   */
  clearSelectedEvent(): void {
    this.setSelectedEvent(null);
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.eventsCache.clear();
    this.registrationsCache.clear();
    this.setEvents([]);
    this.setMyRegistrations([]);
    this.setSelectedEvent(null);
  }
}
