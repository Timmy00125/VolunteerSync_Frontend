import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ErrorHandlerService } from './error-handler';
import { NotificationService } from './notification';
import { ApolloError } from '@apollo/client/core';
import { GraphQLError } from 'graphql';
import { HttpErrorResponse } from '@angular/common/http';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;
  let notificationServiceMock: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    notificationServiceMock = jasmine.createSpyObj('NotificationService', ['showError']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ErrorHandlerService,
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    });
    service = TestBed.inject(ErrorHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should handle GraphQL error with known error code', () => {
    const error = new ApolloError({
      graphQLErrors: [new GraphQLError(
        'Invalid credentials',
        {
          extensions: { code: 'INVALID_CREDENTIALS' }
        }
      )],
    });
    service.handleGraphQLError(error);
    expect(notificationServiceMock.showError).toHaveBeenCalledWith('Invalid email or password');
  });

  it('should handle HTTP 401 error', () => {
    const error = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    service.handleHttpError(error);
    expect(notificationServiceMock.showError).toHaveBeenCalledWith('Please log in to continue');
  });

  it('should handle a simple string message', () => {
    service.showUserFriendlyMessage('A simple error');
    expect(notificationServiceMock.showError).toHaveBeenCalledWith('A simple error');
  });

  it('should handle a generic Error object', () => {
    service.showUserFriendlyMessage(new Error('A generic error'));
    expect(notificationServiceMock.showError).toHaveBeenCalledWith('A generic error');
  });

  it('should handle an unknown error object', () => {
    service.showUserFriendlyMessage({ foo: 'bar' });
    expect(notificationServiceMock.showError).toHaveBeenCalledWith('An unexpected error occurred. Please try again');
  });

  it('should map network error message from generic error', () => {
    service.showUserFriendlyMessage(new Error('Some network error happened'));
    expect(notificationServiceMock.showError).toHaveBeenCalledWith('Network connection failed. Please check your internet connection');
  });
});