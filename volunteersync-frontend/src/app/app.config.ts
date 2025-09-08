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
import { provideHttpClient } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache, NormalizedCacheObject, from } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';

// Apollo cache token so we can re-use the same cache instance across SSR and browser
const APOLLO_CACHE = new InjectionToken<InMemoryCache>('APOLLO_CACHE');
const APOLLO_STATE = makeStateKey<NormalizedCacheObject>('apollo.state');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(),
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
          },
        }),
    },
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      const cache = inject(APOLLO_CACHE);
      const router = inject(Router);

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
        withCredentials: true, // Include cookies for authentication
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

      // Error handling link
      const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
        if (graphQLErrors) {
          graphQLErrors.forEach(({ message, locations, path, extensions }) => {
            console.error(
              `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
            );

            // Handle authentication errors
            if (extensions?.['code'] === 'UNAUTHENTICATED') {
              handleUnauthenticated(router);
            }
          });
        }

        if (networkError) {
          console.error(`[Network error]: ${networkError}`);

          // Handle network authentication errors
          if ('status' in networkError && networkError.status === 401) {
            handleUnauthenticated(router);
          }
        }
      });

      // Combine all links
      const link = from([errorLink, authLink, httpLinkHandler]);

      return {
        link,
        cache,
        defaultOptions: {
          watchQuery: {
            errorPolicy: 'all',
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

/**
 * Handle unauthenticated errors
 */
function handleUnauthenticated(router: Router): void {
  // Clear stored tokens
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }

  // Redirect to login page
  router.navigate(['/auth/login']);
}
