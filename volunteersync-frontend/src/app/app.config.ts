import {
  ApplicationConfig,
  InjectionToken,
  inject,
  makeStateKey,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  TransferState,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache, NormalizedCacheObject, from } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';
import { ApolloErrorLinkService } from './shared/services/apollo-error-link';

// Apollo cache token so we can re-use the same cache instance across SSR and browser
const APOLLO_CACHE = new InjectionToken<InMemoryCache>('APOLLO_CACHE');
const APOLLO_STATE = makeStateKey<NormalizedCacheObject>('apollo.state');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    {
      provide: APOLLO_CACHE,
      useFactory: () =>
        new InMemoryCache({
          typePolicies: {
            Query: {
              fields: {
                // Configure pagination and caching policies here
              },
            },
            User: {
              keyFields: ['id'],
            },
            Event: {
              keyFields: ['id'],
            },
          },
        }),
    },
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      const cache = inject(APOLLO_CACHE);
      const router = inject(Router);
      const apolloErrorLinkService = inject(ApolloErrorLinkService);

      // SSR rehydration using Angular TransferState
      const transferState = inject(TransferState);
      const isBrowser = transferState.hasKey(APOLLO_STATE);
      if (isBrowser) {
        const state = transferState.get(APOLLO_STATE, {} as NormalizedCacheObject);
        cache.restore(state);
      } else {
        transferState.onSerialize(APOLLO_STATE, () => {
          const result = cache.extract();
          // Reset cache after extraction to avoid sharing between requests
          cache.reset();
          return result;
        });
      }

      // HTTP Link
      const httpLinkHandler = httpLink.create({
        uri: environment.graphqlUri,
        // Use Authorization header; avoid credentials to reduce CORS issues
        withCredentials: false,
      });

      // Authentication link to add JWT token to headers
      const authLink = setContext((_, { headers }) => {
        let token: string | null = null;

        if (typeof localStorage !== 'undefined') {
          token = localStorage.getItem('authToken');
        }

        return {
          headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : '',
          },
        };
      });

      // Enhanced error handling link using the service
      const errorLink = apolloErrorLinkService.createErrorLink();

      // Combine all links with enhanced error handling
      const link = from([errorLink, authLink, httpLinkHandler]);

      return {
        link,
        cache,
        defaultOptions: {
          watchQuery: {
            errorPolicy: 'all',
            notifyOnNetworkStatusChange: true,
          },
          query: {
            errorPolicy: 'all',
          },
          mutate: {
            errorPolicy: 'all',
          },
        },
      };
    }),
  ],
};
