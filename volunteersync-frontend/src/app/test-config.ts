import { ApplicationConfig } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

/**
 * Minimal test configuration for zoneless Angular app
 * Provides minimal setup needed for testing without Zone.js
 */
export const testConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter([]), // Empty routes for testing
    provideHttpClient(withFetch()),
    provideHttpClientTesting(),
  ],
};
