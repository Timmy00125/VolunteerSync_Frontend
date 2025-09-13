import { TestBed } from '@angular/core/testing';
import { ApolloError } from '@apollo/client/core';
import { GraphQLError } from 'graphql';
import { EventErrorHandler, ValidationError, EventErrorContext } from './event-error-handler';
import { NotificationService } from '../../shared/services/notification';
import { ErrorHandlerService } from '../../shared/services/error-handler';
import { testConfig } from '../../test-config';

describe('EventErrorHandler', () => {
  let service: EventErrorHandler;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let errorHandler: jasmine.SpyObj<ErrorHandlerService>;

  beforeEach(() => {
    const notificationSpy = jasmine.createSpyObj('NotificationService', [
      'showError',
      'showSuccess',
      'showWarning',
    ]);
    const errorHandlerSpy = jasmine.createSpyObj('ErrorHandlerService', ['handleError']);

    TestBed.configureTestingModule({
      ...testConfig,
      providers: [
        ...testConfig.providers,
        EventErrorHandler,
        { provide: NotificationService, useValue: notificationSpy },
        { provide: ErrorHandlerService, useValue: errorHandlerSpy },
      ],
    });

    service = TestBed.inject(EventErrorHandler);
    notificationService = TestBed.inject(
      NotificationService
    ) as jasmine.SpyObj<NotificationService>;
    errorHandler = TestBed.inject(ErrorHandlerService) as jasmine.SpyObj<ErrorHandlerService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getEventErrorMessage', () => {
    it('should return mapped error message for known error codes', () => {
      const message = service.getEventErrorMessage('EVENT_AT_CAPACITY');
      expect(message).toBe(
        'This event is currently at full capacity. Please join the waitlist if available.'
      );
    });

    it('should return default message for unknown error codes', () => {
      const message = service.getEventErrorMessage('UNKNOWN_CODE');
      expect(message).toBe('An unexpected error occurred. Please try again.');
    });

    it('should handle empty error code', () => {
      const message = service.getEventErrorMessage('');
      expect(message).toBe('An unexpected error occurred. Please try again.');
    });
  });

  describe('handleEventNetworkError', () => {
    it('should show network error message', () => {
      const networkError = new Error('Network connection failed');
      const context: EventErrorContext = { operation: 'list' };

      service.handleEventNetworkError(networkError, context);

      expect(notificationService.showError).toHaveBeenCalledWith(
        'Network connection failed. Please check your internet connection and try again.'
      );
    });
  });

  describe('handleCapacityExceededError', () => {
    it('should show capacity error with event title', () => {
      service.handleCapacityExceededError('Community Cleanup');

      expect(notificationService.showError).toHaveBeenCalledWith(
        '"Community Cleanup" is currently at full capacity. Please join the waitlist if available.'
      );
    });
  });

  describe('handleEventNotFoundError', () => {
    it('should show event not found error', () => {
      service.handleEventNotFoundError('123');

      expect(notificationService.showError).toHaveBeenCalledWith(
        'Event with ID "123" could not be found.'
      );
    });
  });

  describe('handleEventValidationErrors', () => {
    it('should handle single validation error', () => {
      const validationErrors: ValidationError[] = [
        { field: 'title', message: 'Title is required', code: 'REQUIRED' },
      ];
      const context: EventErrorContext = { operation: 'create' };

      service.handleEventValidationErrors(validationErrors, context);

      expect(notificationService.showError).toHaveBeenCalledWith('Title is required');
    });

    it('should handle multiple validation errors', () => {
      const validationErrors: ValidationError[] = [
        { field: 'title', message: 'Title is required', code: 'REQUIRED' },
        { field: 'startTime', message: 'Start time must be in the future', code: 'INVALID_DATE' },
        { field: 'capacity', message: 'Capacity must be greater than 0', code: 'INVALID_NUMBER' },
      ];
      const context: EventErrorContext = { operation: 'create' };

      service.handleEventValidationErrors(validationErrors, context);

      expect(notificationService.showError).toHaveBeenCalledWith(
        'Please fix the following errors:\n• Title is required\n• Start time must be in the future\n• Capacity must be greater than 0'
      );
    });

    it('should handle empty validation errors array', () => {
      const validationErrors: ValidationError[] = [];
      const context: EventErrorContext = { operation: 'create' };

      service.handleEventValidationErrors(validationErrors, context);

      expect(notificationService.showError).toHaveBeenCalledWith(
        'Please fix the following errors:\n'
      );
    });
  });

  describe('handlePermissionDeniedError', () => {
    it('should show permission denied error for edit operation', () => {
      service.handlePermissionDeniedError('edit', 'Community Cleanup');

      expect(notificationService.showError).toHaveBeenCalledWith(
        'You do not have permission to edit "Community Cleanup".'
      );
    });

    it('should show permission denied error for delete operation', () => {
      service.handlePermissionDeniedError('delete', 'Food Drive');

      expect(notificationService.showError).toHaveBeenCalledWith(
        'You do not have permission to delete "Food Drive".'
      );
    });

    it('should show permission denied error for register operation', () => {
      service.handlePermissionDeniedError('register', 'Training Session');

      expect(notificationService.showError).toHaveBeenCalledWith(
        'You do not have permission to register "Training Session".'
      );
    });

    it('should show generic permission denied error for unknown operation', () => {
      service.handlePermissionDeniedError('unknown', 'Test Event');

      expect(notificationService.showError).toHaveBeenCalledWith(
        'You do not have permission to unknown "Test Event".'
      );
    });
  });

  describe('handleEventOperationError', () => {
    it('should handle GraphQL errors', () => {
      const graphQLError = new GraphQLError('EVENT_AT_CAPACITY');
      const apolloError = new ApolloError({
        graphQLErrors: [graphQLError],
      });
      const context: EventErrorContext = { operation: 'register' };

      service.handleEventOperationError(apolloError, context);

      expect(notificationService.showError).toHaveBeenCalledWith(
        'This event is currently at full capacity. Please join the waitlist if available.'
      );
    });

    it('should handle multiple GraphQL errors', () => {
      const graphQLErrors = [
        new GraphQLError('EVENT_NOT_FOUND'),
        new GraphQLError('PERMISSION_DENIED'),
      ];
      const apolloError = new ApolloError({
        graphQLErrors: graphQLErrors,
      });
      const context: EventErrorContext = { operation: 'edit', eventId: '123' };

      service.handleEventOperationError(apolloError, context);

      expect(notificationService.showError).toHaveBeenCalledWith(
        'The requested event could not be found.'
      );
    });

    it('should handle validation errors properly', () => {
      const graphQLError = new GraphQLError('VALIDATION_ERROR');
      const apolloError = new ApolloError({
        graphQLErrors: [graphQLError],
      });
      const context: EventErrorContext = { operation: 'create' };

      service.handleEventOperationError(apolloError, context);

      expect(notificationService.showError).toHaveBeenCalledWith(
        'An unexpected error occurred. Please try again.'
      );
    });

    it('should handle permission denied errors with context', () => {
      const graphQLError = new GraphQLError('PERMISSION_DENIED');
      const apolloError = new ApolloError({
        graphQLErrors: [graphQLError],
      });
      const context: EventErrorContext = { operation: 'edit', eventId: '123' };

      service.handleEventOperationError(apolloError, context);

      expect(notificationService.showError).toHaveBeenCalledWith(
        'An unexpected error occurred. Please try again.'
      );
    });

    it('should handle unknown errors', () => {
      const apolloError = new ApolloError({
        graphQLErrors: [],
      });
      const context: EventErrorContext = { operation: 'create' };

      service.handleEventOperationError(apolloError, context);

      expect(notificationService.showError).toHaveBeenCalledWith(
        'An unexpected error occurred. Please try again.'
      );
    });

    it('should handle network errors', () => {
      const networkError = new Error('Network error');
      const apolloError = new ApolloError({
        networkError: networkError,
      });
      const context: EventErrorContext = { operation: 'list' };

      service.handleEventOperationError(apolloError, context);

      expect(notificationService.showError).toHaveBeenCalledWith(
        'Network connection failed. Please check your internet connection and try again.'
      );
    });
  });
});
