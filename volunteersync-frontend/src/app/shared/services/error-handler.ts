import { Injectable, inject } from '@angular/core';
import { ApolloError } from '@apollo/client/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from './notification';
import { ServerError } from '@apollo/client/link/utils';

interface ErrorMapping {
  [key: string]: string;
}

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  private notificationService = inject(NotificationService);

  private readonly errorMappings: ErrorMapping = {
    // Authentication errors
    UNAUTHENTICATED: 'Please log in to continue',
    INVALID_CREDENTIALS: 'Invalid email or password',
    TOKEN_EXPIRED: 'Your session has expired. Please log in again',
    ACCOUNT_LOCKED: 'Your account has been locked. Please contact support',

    // Authorization errors
    FORBIDDEN: 'You do not have permission to perform this action',
    INSUFFICIENT_PERMISSIONS: 'You do not have sufficient permissions',

    // Validation errors
    VALIDATION_ERROR: 'Please check your input and try again',
    EMAIL_ALREADY_EXISTS: 'An account with this email already exists',
    WEAK_PASSWORD: 'Password must be at least 8 characters long',

    // Network errors
    NETWORK_ERROR: 'Network connection failed. Please check your internet connection',
    SERVER_ERROR: 'Server error occurred. Please try again later',
    SERVICE_UNAVAILABLE: 'Service is temporarily unavailable. Please try again later',

    // Default fallbacks
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again',
  };

  /**
   * Handle GraphQL errors with user-friendly messaging
   */
  handleGraphQLError(error: ApolloError, context?: string): void {
    console.error('[GraphQL Error]', { error, context });

    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      // Handle first GraphQL error
      const graphQLError = error.graphQLErrors[0];
      const errorCode = graphQLError.extensions?.['code'] as string;
      const message = this.mapErrorToUserMessage(errorCode, graphQLError.message);

      this.notificationService.showError(message);
      this.logError(error, context);
    } else if (error.networkError) {
      this.handleNetworkError(error.networkError);
    } else {
      this.showUserFriendlyMessage(error);
    }
  }

  /**
   * Handle HTTP errors
   */
  handleHttpError(error: HttpErrorResponse, context?: string): void {
    console.error('[HTTP Error]', { error, context });

    let message: string;

    switch (error.status) {
      case 0:
        message = this.errorMappings['NETWORK_ERROR'];
        break;
      case 401:
        message = this.errorMappings['UNAUTHENTICATED'];
        break;
      case 403:
        message = this.errorMappings['FORBIDDEN'];
        break;
      case 404:
        message = 'The requested resource was not found';
        break;
      case 422:
        message = this.errorMappings['VALIDATION_ERROR'];
        break;
      case 500:
        message = this.errorMappings['SERVER_ERROR'];
        break;
      case 503:
        message = this.errorMappings['SERVICE_UNAVAILABLE'];
        break;
      default:
        message = this.errorMappings['UNKNOWN_ERROR'];
    }

    this.notificationService.showError(message);
    this.logError(error, context);
  }

  /**
   * Handle network errors specifically
   */
  private handleNetworkError(networkError: Error | ServerError): void {
    let message: string;
    const status = 'statusCode' in networkError ? networkError.statusCode : undefined;

    if (status === 0 || /Failed to fetch|fetch failed|NetworkError/i.test(networkError.message)) {
      message = 'Unable to connect to the server. Please check your internet connection';
    } else if (status === 401) {
      message = this.errorMappings['UNAUTHENTICATED'];
    } else if (status === 503) {
      message = this.errorMappings['SERVICE_UNAVAILABLE'];
    } else {
      message = this.errorMappings['NETWORK_ERROR'];
    }

    this.notificationService.showError(message);
  }

  /**
   * Show user-friendly error message for any error
   */
  showUserFriendlyMessage(error: unknown): void {
    let message: string;

    if (typeof error === 'string') {
      message = error;
    } else if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('network')) {
        message = this.errorMappings['NETWORK_ERROR'];
      } else if (
        errorMessage.includes('unauthorized') ||
        errorMessage.includes('unauthenticated')
      ) {
        message = this.errorMappings['UNAUTHENTICATED'];
      } else if (errorMessage.includes('forbidden')) {
        message = this.errorMappings['FORBIDDEN'];
      } else {
        message = error.message;
      }
    } else {
      message = this.errorMappings['UNKNOWN_ERROR'];
    }

    this.notificationService.showError(message);
    this.logError(error);
  }

  /**
   * Map error codes to user-friendly messages
   */
  private mapErrorToUserMessage(errorCode: string | undefined, originalMessage: string): string {
    if (errorCode && this.errorMappings[errorCode]) {
      return this.errorMappings[errorCode];
    }

    // Fallback to original message if it's user-friendly
    if (originalMessage && this.isUserFriendlyMessage(originalMessage)) {
      return originalMessage;
    }

    return this.errorMappings['UNKNOWN_ERROR'];
  }

  /**
   * Check if message is user-friendly (doesn't contain technical details)
   */
  private isUserFriendlyMessage(message: string): boolean {
    const technicalTerms = [
      'null',
      'undefined',
      'object',
      'function',
      'stack trace',
      'error at',
      'at line',
      'syntax error',
      'reference error',
      'type error',
      'internal server error',
      'exception',
    ];

    const lowerMessage = message.toLowerCase();
    return !technicalTerms.some((term) => lowerMessage.includes(term)) && message.length < 200; // Reasonable message length
  }

  /**
   * Log error for debugging and monitoring
   */
  logError(error: unknown, context?: string): void {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      context,
      error: this.extractErrorData(error),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
      url: typeof window !== 'undefined' ? window.location.href : 'N/A',
    };

    // In production, this would be sent to a logging service
    console.error('[Error Handler]', errorInfo);

    // TODO: Integrate with logging service (e.g., Sentry, LogRocket)
    // this.loggingService.logError(errorInfo);
  }

  private extractErrorData(error: unknown): Record<string, unknown> {
    if (error instanceof Error) {
      const data: Record<string, unknown> = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
      if (error instanceof ApolloError) {
        data['graphQLErrors'] = error.graphQLErrors;
        data['networkError'] = error.networkError;
      }
      if (error instanceof HttpErrorResponse) {
        data['status'] = error.status;
        data['statusText'] = error.statusText;
        data['url'] = error.url;
      }
      return data;
    }
    return {
      message: 'Unknown error object',
      error,
    };
  }
}
