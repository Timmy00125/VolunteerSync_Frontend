import { Injectable, inject } from '@angular/core';
import { ApolloError } from '@apollo/client/core';
import { GraphQLError } from 'graphql';
import { NotificationService } from '../../shared/services/notification';
import { ErrorHandlerService } from '../../shared/services/error-handler';

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface EventErrorContext {
  operation: string;
  eventId?: string;
  userId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class EventErrorHandler {
  private notificationService = inject(NotificationService);
  private errorHandler = inject(ErrorHandlerService);

  private readonly eventErrorMappings: Record<string, string> = {
    // Capacity errors
    EVENT_AT_CAPACITY:
      'This event is currently at full capacity. Please join the waitlist if available.',
    WAITLIST_NOT_ENABLED: 'This event is at capacity and waitlist is not enabled.',
    REGISTRATION_CLOSED: 'Registration for this event has closed.',
    REGISTRATION_NOT_OPEN: 'Registration for this event has not opened yet.',

    // Permission errors
    NOT_EVENT_ORGANIZER: 'You do not have permission to modify this event.',
    NOT_AUTHORIZED_TO_REGISTER: 'You are not authorized to register for this event.',
    ALREADY_REGISTERED: 'You are already registered for this event.',
    REGISTRATION_REQUIRES_APPROVAL: 'Your registration is pending organizer approval.',

    // Validation errors
    INVALID_DATE_RANGE: 'Event end time must be after start time.',
    CAPACITY_BELOW_CURRENT: 'Event capacity cannot be below current registration count.',
    PAST_EVENT_MODIFICATION: 'Cannot modify events that have already ended.',
    MISSING_REQUIRED_SKILLS: 'You do not meet the required skills for this event.',
    AGE_REQUIREMENT_NOT_MET: 'You do not meet the minimum age requirement for this event.',
    BACKGROUND_CHECK_REQUIRED: 'A background check is required for this event.',

    // Event not found
    EVENT_NOT_FOUND: 'The requested event could not be found.',
    EVENT_DELETED: 'This event has been deleted by the organizer.',
    EVENT_CANCELLED: 'This event has been cancelled.',

    // Network and server errors
    NETWORK_ERROR:
      'Network connection failed. Please check your internet connection and try again.',
    SERVER_ERROR: 'Server error occurred. Please try again later.',
    TIMEOUT_ERROR: 'Request timed out. Please try again.',

    // Default fallback
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  };

  /**
   * Handle GraphQL errors specific to event operations
   */
  handleEventOperationError(error: ApolloError, context: EventErrorContext): void {
    console.error('[Event Operation Error]', { error, context });

    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      // Handle GraphQL errors by processing error messages directly
      const errorMessage = error.graphQLErrors[0].message;
      this.showEventErrorMessage(errorMessage, context);
    } else if (error.networkError) {
      this.handleEventNetworkError(error.networkError, context);
    } else {
      this.showEventErrorMessage('UNKNOWN_ERROR', context);
    }
  }

  /**
   * Handle validation errors from event forms
   */
  handleEventValidationErrors(errors: ValidationError[], context: EventErrorContext): void {
    console.error('[Event Validation Errors]', { errors, context });

    if (errors.length === 1) {
      // Single validation error
      const error = errors[0];
      const message = this.getFieldValidationMessage(error);
      this.notificationService.showError(message);
    } else {
      // Multiple validation errors
      const errorSummary = `Please fix the following errors:\n${errors
        .map((e) => `• ${e.message}`)
        .join('\n')}`;
      this.notificationService.showError(errorSummary);
    }
  }

  /**
   * Handle capacity exceeded error with specific messaging
   */
  handleCapacityExceededError(eventTitle?: string): void {
    const message = eventTitle
      ? `"${eventTitle}" is currently at full capacity. Please join the waitlist if available.`
      : this.eventErrorMappings['EVENT_AT_CAPACITY'];

    this.notificationService.showError(message);
  }

  /**
   * Handle event not found error
   */
  handleEventNotFoundError(eventId?: string): void {
    const message = eventId
      ? `Event with ID "${eventId}" could not be found.`
      : this.eventErrorMappings['EVENT_NOT_FOUND'];

    this.notificationService.showError(message);
  }

  /**
   * Handle permission denied error
   */
  handlePermissionDeniedError(operation: string, eventTitle?: string): void {
    const baseMessage = this.eventErrorMappings['NOT_EVENT_ORGANIZER'];
    const message = eventTitle
      ? `You do not have permission to ${operation} "${eventTitle}".`
      : baseMessage;

    this.notificationService.showError(message);
  }

  /**
   * Handle network errors with retry option
   */
  handleEventNetworkError(networkError: any, context: EventErrorContext): void {
    console.error('[Event Network Error]', { networkError, context });

    const message = this.eventErrorMappings['NETWORK_ERROR'];
    this.notificationService.showError(message);
  }

  /**
   * Get user-friendly error message for event operations
   */
  getEventErrorMessage(errorCode: string, fallbackMessage?: string): string {
    return (
      this.eventErrorMappings[errorCode] ||
      fallbackMessage ||
      this.eventErrorMappings['UNKNOWN_ERROR']
    );
  }

  /**
   * Handle rollback of optimistic updates
   */
  handleOptimisticUpdateRollback(operation: string, error: ApolloError): void {
    console.warn('[Optimistic Update Rollback]', { operation, error });

    const message = `Failed to ${operation}. Your changes have been reverted.`;
    this.notificationService.showWarning(message);
  }

  private handleGraphQLErrors(
    graphQLErrors: readonly GraphQLError[],
    context: EventErrorContext
  ): void {
    const primaryError = graphQLErrors[0];
    const errorCode = primaryError.extensions?.['code'] as string;

    if (this.isValidationError(errorCode)) {
      this.handleValidationGraphQLError(primaryError, context);
    } else {
      this.showEventErrorMessage(errorCode, context, primaryError.message);
    }
  }

  private handleValidationGraphQLError(error: GraphQLError, context: EventErrorContext): void {
    const validationErrors = error.extensions?.['validationErrors'] as
      | ValidationError[]
      | undefined;

    if (validationErrors && validationErrors.length > 0) {
      this.handleEventValidationErrors(validationErrors, context);
    } else {
      this.showEventErrorMessage('VALIDATION_ERROR', context, error.message);
    }
  }

  private isValidationError(errorCode: string): boolean {
    return errorCode === 'VALIDATION_ERROR' || errorCode === 'BAD_REQUEST';
  }

  private getFieldValidationMessage(error: ValidationError): string {
    // Return specific field validation message or fallback to generic message
    return error.message || `Invalid value for ${error.field}`;
  }

  private showEventErrorMessage(
    errorCode: string,
    context: EventErrorContext,
    fallbackMessage?: string
  ): void {
    const message = this.getEventErrorMessage(errorCode, fallbackMessage);
    this.notificationService.showError(message);
  }

  private retryEventOperation(context: EventErrorContext): void {
    // This would typically trigger a retry of the failed operation
    // For now, we'll just show a message
    this.notificationService.showInfo('Please try your operation again.');
  }
}
