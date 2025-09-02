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
import { InMemoryCache, NormalizedCacheObject } from '@apollo/client/core';

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
    { provide: APOLLO_CACHE, useFactory: () => new InMemoryCache() },
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      const cache = inject(APOLLO_CACHE);

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

      return {
        link: httpLink.create({
          // Default GraphQL endpoint; configure a proxy or replace as needed
          uri: '/graphql',
          // withCredentials: true, // uncomment if your backend uses cookie auth
        }),
        cache,
      };
    }),
  ],
};
