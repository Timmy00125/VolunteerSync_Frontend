import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ApolloErrorLinkService } from './apollo-error-link';
import { Router } from '@angular/router';
import { ErrorHandlerService } from './error-handler';
import { ApolloLink, execute, Observable } from '@apollo/client/core';
import { GraphQLError } from 'graphql';
import { gql } from 'apollo-angular';

describe('ApolloErrorLinkService', () => {
  let service: ApolloErrorLinkService;
  let errorHandlerMock: jasmine.SpyObj<ErrorHandlerService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(() => {
    errorHandlerMock = jasmine.createSpyObj('ErrorHandlerService', ['handleGraphQLError', 'handleHttpError', 'logError', 'showUserFriendlyMessage']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ApolloErrorLinkService,
        { provide: ErrorHandlerService, useValue: errorHandlerMock },
        { provide: Router, useValue: routerMock },
      ],
    });
    service = TestBed.inject(ApolloErrorLinkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should handle GraphQL error and call error handler', (done) => {
    const query = gql`query { test }`;
    const mockLink = new ApolloLink(() => {
      return new Observable(observer => {
        observer.next({
          errors: [new GraphQLError('Test GraphQL error', { extensions: { code: 'TEST_ERROR' } } as any)]
        });
        observer.complete();
      });
    });

    const link = service.createErrorLink().concat(mockLink);

    execute(link, { query }).subscribe(result => {
      expect(errorHandlerMock.handleGraphQLError).toHaveBeenCalled();
      expect(errorHandlerMock.logError).toHaveBeenCalled();
      done();
    });
  });

  it('should handle UNAUTHENTICATED GraphQL error and redirect', (done) => {
    const query = gql`query { test }`;
    const mockLink = new ApolloLink(() => {
      return new Observable(observer => {
        observer.next({
          errors: [new GraphQLError('Unauthenticated', { extensions: { code: 'UNAUTHENTICATED' } } as any)]
        });
        observer.complete();
      });
    });

    const link = service.createErrorLink().concat(mockLink);

    execute(link, { query }).subscribe(result => {
      expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login']);
      done();
    });
  });

  it('should handle network error and call error handler', (done) => {
    const query = gql`query { test }`;
    const networkError = { statusCode: 500, message: 'Server Error' };
    const mockLink = new ApolloLink(() => {
      return new Observable(observer => {
        observer.error(networkError);
      });
    });

    const link = service.createErrorLink().concat(mockLink);

    execute(link, { query }).subscribe({
      error: (err) => {
        expect(errorHandlerMock.handleHttpError).toHaveBeenCalled();
        done();
      }
    });
  });
});