import { gql } from 'apollo-angular';
import { EVENT_DETAIL_FRAGMENT } from '../fragments/event.fragments';
import { REGISTRATION_FRAGMENT } from '../fragments/registration.fragments';

// Real-time event updates subscription
export const EVENT_UPDATED = gql`
  ${EVENT_DETAIL_FRAGMENT}
  subscription EventUpdated($eventId: ID!) {
    eventUpdated(eventId: $eventId) {
      ...EventDetailFragment
    }
  }
`;

// Real-time registration updates for an event
export const EVENT_REGISTRATION_UPDATED = gql`
  ${REGISTRATION_FRAGMENT}
  subscription EventRegistrationUpdated($eventId: ID!) {
    eventRegistrationUpdated(eventId: $eventId) {
      eventId
      registeredCount
      registration {
        ...RegistrationFragment
      }
    }
  }
`;
