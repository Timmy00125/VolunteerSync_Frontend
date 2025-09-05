# Phase 1: GraphQL Apollo Client Setup (TASK-003, TASK-005)

## Context

You are implementing the VolunteerSync MVP with Angular 20, standalone components, and need to set up Apollo Client for GraphQL integration. The basic project structure and routing are already in place.

## Tasks:

- TASK-003: Install and configure Apollo Client for GraphQL integration
- TASK-005: Implement authentication service with JWT token handling via GraphQL

### Requirements

- Set up Apollo Client with Angular 20 standalone components
- Configure GraphQL endpoint and caching
- Create authentication service with JWT handling
- Implement token management and refresh logic
- Follow Angular best practices for services

### Implementation Instructions

1. **Install Apollo Client dependencies**:

   ```bash
   cd volunteersync-frontend
   npm install @apollo/client apollo-angular graphql
   ```

2. **Create Apollo Client service** using Angular CLI:

   ```bash
   ng generate service shared/services/apollo --skip-tests=false
   ```

3. **Create authentication service** using Angular CLI:

   ```bash
   ng generate service auth/services/auth --skip-tests=false
   ```

4. **Create GraphQL type definitions and operations structure**:

   ```bash
   # Create GraphQL directory structure
   mkdir -p src/app/graphql/{queries,mutations,fragments,subscriptions}

   # Create initial GraphQL files
   touch src/app/graphql/queries/auth.queries.ts
   touch src/app/graphql/mutations/auth.mutations.ts
   touch src/app/graphql/fragments/user.fragments.ts
   ```

5. **Configure Apollo Client** in the service:

   - Set up HttpLink for GraphQL endpoint
   - Configure InMemoryCache with proper cache policies
   - Add authentication headers interceptor
   - Handle JWT token storage and refresh
   - Implement error handling for GraphQL operations

6. **Implement Authentication Service**:

   - Login with email/password via GraphQL mutation
   - Register new user via GraphQL mutation
   - JWT token storage in localStorage/sessionStorage
   - Token refresh logic
   - Logout functionality with cache clearing
   - User state management with signals
   - Password reset request functionality

7. **Create authentication models**:

   ```bash
   ng generate interface shared/models/user --type=model
   ng generate interface shared/models/auth --type=model
   ```

8. **Authentication Service Features to Implement**:
   - `login(email: string, password: string): Observable<AuthResponse>`
   - `register(userData: RegisterData): Observable<AuthResponse>`
   - `logout(): void`
   - `refreshToken(): Observable<string>`
   - `getCurrentUser(): Observable<User | null>`
   - `isAuthenticated(): Observable<boolean>`
   - `requestPasswordReset(email: string): Observable<boolean>`

### Technical Requirements

- Use Apollo Client with proper cache configuration
- Implement signal-based state management for user data
- Use RxJS observables for async operations
- Store JWT tokens securely
- Handle GraphQL errors gracefully
- Follow Angular DI patterns with `inject()` function
- Use TypeScript strict mode
- Implement proper error handling and user feedback

### GraphQL Operations to Define

```typescript
// Login mutation
const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      refreshToken
      user {
        id
        email
        firstName
        lastName
        role
      }
    }
  }
`;

// Register mutation
const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      refreshToken
      user {
        id
        email
        firstName
        lastName
        role
      }
    }
  }
`;

// Current user query
const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      email
      firstName
      lastName
      role
      profile {
        bio
        skills
        availability
      }
    }
  }
`;
```

### Files to Create/Modify

- `src/app/shared/services/apollo.service.ts` (create)
- `src/app/auth/services/auth.service.ts` (create)
- `src/app/shared/models/user.model.ts` (create)
- `src/app/shared/models/auth.model.ts` (create)
- `src/app/graphql/queries/auth.queries.ts` (create)
- `src/app/graphql/mutations/auth.mutations.ts` (create)
- `src/app/graphql/fragments/user.fragments.ts` (create)
- `src/app/app.config.ts` (modify to provide Apollo)

### Configuration in app.config.ts

Update the application config to provide Apollo Client as a provider for the standalone application.

### Success Criteria

- Apollo Client is properly configured and injected
- Authentication service can perform login/register/logout
- JWT tokens are stored and managed correctly
- GraphQL operations work without errors
- Error handling provides user-friendly feedback
- User state is maintained across page refreshes
- Service is properly tested with unit tests

### Next Steps

After completing this task, the authentication guard and UI components will be implemented.
