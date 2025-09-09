import { ApplicationConfig, inject } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';

/**
 * Test configuration for zoneless Angular app
 * Provides minimal setup needed for testing without Zone.js
 */
export const testConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter([]), // Empty routes for testing
    provideHttpClient(withFetch()),
    provideApollo(() => {
      const httpLink = inject(HttpLink);

      // Simple Apollo setup for testing
      const link = httpLink.create({
        uri: 'http://localhost:4000/graphql', // Mock URI for tests
      });

      return {
        link,
        cache: new InMemoryCache(),
        defaultOptions: {
          watchQuery: {
            errorPolicy: 'all',
          },
          query: {
            errorPolicy: 'all',
          },
        },
      };
    }),
  ],
};
