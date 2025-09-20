import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { onError } from '@apollo/client/link/error';
import { ErrorHandlerService } from './error-handler';
import { ApolloError } from '@apollo/client/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApolloErrorLinkService {
  private router = inject(Router);
  private errorHandler = inject(ErrorHandlerService);

  /**
   * Create Apollo error link for global GraphQL error handling
   */
  createErrorLink() {
    return onError(({ graphQLErrors, networkError, operation, forward }) => {
      // Skip error handling for logout operations since auth service handles them gracefully
      const operationName = operation.operationName;
      const isLogoutOperation = operationName === 'Logout';

      // Handle GraphQL errors
      if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path, extensions }) => {
          console.error(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          );

          const errorCode = extensions?.['code'] as string;

          // Handle authentication errors
          if (errorCode === 'UNAUTHENTICATED' || errorCode === 'TOKEN_EXPIRED') {
            this.handleUnauthenticated();
          }

          // Handle authorization errors
          if (errorCode === 'FORBIDDEN' || errorCode === 'INSUFFICIENT_PERMISSIONS') {
            this.handleAuthorizationError();
          }

          // Log error for monitoring
          this.errorHandler.logError(
            { message, extensions, locations, path },
            `GraphQL Operation: ${operation.operationName}`
          );
        });

        // Don't show error notifications for logout operations
        if (!isLogoutOperation) {
          this.errorHandler.handleGraphQLError(new ApolloError({ graphQLErrors, networkError }));
        }
      }

      // Handle network errors
      if (networkError) {
        console.error(`[Network error]: ${networkError}`);

        // Handle network authentication errors
        if ('statusCode' in networkError && networkError.statusCode === 401) {
          this.handleUnauthenticated();
        }

        // Don't show error notifications for logout operations
        if (!isLogoutOperation) {
          this.errorHandler.handleHttpError(
            new HttpErrorResponse({
              error: networkError,
              status: ('statusCode' in networkError && networkError.statusCode) || 0,
              statusText: networkError.message,
            }),
            `GraphQL Operation: ${operation.operationName}`
          );
        }
      }
    });
  }

  /**
   * Handle unauthenticated errors
   */
  private handleUnauthenticated(): void {
    // Clear stored tokens
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    }

    // Store current URL for redirect after login
    const currentUrl = this.router.url;
    if (currentUrl !== '/auth/login') {
      localStorage.setItem('returnUrl', currentUrl);
    }

    // Redirect to login page
    this.router.navigate(['/auth/login']);
  }

  /**
   * Handle authorization errors (insufficient permissions)
   */
  private handleAuthorizationError(): void {
    // Redirect to dashboard with error message
    this.router.navigate(['/dashboard'], {
      queryParams: { error: 'insufficient-permissions' },
    });
  }
}
