/**
 * Global environment configuration for the frontend runtime.
 * Add environment-specific overrides via file replacements if needed.
 */
export const environment = {
  production: false,
  /**
   * Absolute GraphQL endpoint used by Apollo client
   */
  graphqlUri: 'http://localhost:8081/graphql' as const,
} as const;
