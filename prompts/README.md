# VolunteerSync MVP Implementation Prompts

This directory contains detailed implementation prompts for the VolunteerSync MVP, organized by development phases. Each prompt provides specific instructions for implementing tasks from the [MVP Implementation Plan](../plan/feature-mvp-implementation-1.0.md).

## 📋 Implementation Phases Overview

### Phase 1: Foundation & Authentication (Week 1)

**Goal:** Establish project foundation and authentication system

- **[Phase 1 - Routing Foundation](./phase1-routing-foundation.md)** (TASK-004)

  - Create routing structure for main application areas
  - Set up lazy loading for feature modules
  - Generate base components with Angular CLI

- **[Phase 1 - Apollo & Auth Setup](./phase1-apollo-auth-setup.md)** (TASK-003, TASK-005)

  - Install and configure Apollo Client for GraphQL integration
  - Implement authentication service with JWT token handling
  - Set up GraphQL operations structure

- **[Phase 1 - Auth UI Components](./phase1-auth-ui-components.md)** (TASK-006, TASK-007, TASK-008)

  - Create login component with form validation and GraphQL
  - Create registration component with user role selection
  - Implement password reset functionality

- **[Phase 1 - Guards, Errors & Navigation](./phase1-guards-errors-navigation.md)** (TASK-009, TASK-010, TASK-011)
  - Create authentication guard for protected routes
  - Implement error handling and user feedback
  - Create shared header/navigation component

### Phase 2: Event Management (Week 2)

**Goal:** Build core event management functionality

- **[Phase 2 - Event Data Layer](./phase2-event-data-layer.md)** (TASK-012, TASK-013, TASK-014)

  - Create event data models and GraphQL type definitions
  - Define GraphQL queries and mutations for event operations
  - Implement event service with Apollo Client integration

- **[Phase 2 - Event UI Components](./phase2-event-ui-components.md)** (TASK-015, TASK-016, TASK-017, TASK-018)

  - Create event list component with GraphQL queries
  - Build event detail view with GraphQL subscriptions
  - Implement event creation and edit forms
  - Add event delete functionality

- **[Phase 2 - Event Features Complete](./phase2-event-features-complete.md)** (TASK-019, TASK-020, TASK-021, TASK-022)
  - Add GraphQL error handling and validation
  - Implement capacity tracking with real-time subscriptions
  - Create organizer event management dashboard
  - Add responsive design for mobile viewing

### Phase 3: Registration & Profiles (Week 3)

**Goal:** Complete registration system and user profiles

- **[Phase 3 - Registration & Profile Data](./phase3-registration-profile-data.md)** (TASK-023, TASK-024, TASK-025, TASK-028)

  - Create registration data models and GraphQL definitions
  - Define GraphQL mutations for registration operations
  - Implement registration service with Apollo Client
  - Implement user profile management components

- **[Phase 3 - Registration UI & Dashboards](./phase3-registration-ui-dashboards.md)** (TASK-026, TASK-027, TASK-029, TASK-030)

  - Build event registration component with GraphQL
  - Create registration cancellation functionality
  - Create volunteer dashboard with registration history
  - Build registration management for organizers

- **[Phase 3 - Final Polish](./phase3-final-polish.md)** (TASK-031, TASK-032, TASK-033)
  - Implement statistics and counts with GraphQL aggregations
  - Add comprehensive form validation across components
  - Create loading states and user feedback for operations

### Phase 4: Polish & Testing (Ongoing/Final Days)

**Goal:** Finalize MVP with testing and polish

- **[Phase 4 - Testing & Accessibility](./phase4-testing-accessibility.md)** (TASK-034, TASK-035, TASK-036, TASK-037)

  - Implement unit tests for GraphQL operations and components
  - Create integration tests for main user flows
  - Add accessibility features (ARIA labels, keyboard nav)
  - Optimize GraphQL queries and Apollo Client cache

- **[Phase 4 - Production Readiness](./phase4-production-readiness.md)** (TASK-038, TASK-039, TASK-040, TASK-041, TASK-042, TASK-043)
  - Create production build configuration
  - Implement Apollo Client error boundaries and fallbacks
  - Add documentation for GraphQL schema and operations
  - Test cross-browser compatibility and conduct UAT
  - Prepare for production deployment

## 🚀 Getting Started

**Prerequisites:** Angular CLI, Node.js, Angular Material, and TailwindCSS are already installed.

1. **Start with Phase 1:** Begin with routing foundation and work through each prompt sequentially
2. **Use Angular CLI:** Each prompt specifies when to use `ng generate` commands
3. **Follow Best Practices:** All prompts include Angular 20 standalone components, signals, and modern patterns
4. **Test As You Go:** Implement tests alongside features for better quality

## 📝 Prompt Structure

Each prompt includes:

- **Context:** Background and current state
- **Tasks:** Specific implementation tasks
- **Requirements:** Technical and functional requirements
- **Implementation Instructions:** Step-by-step guidance
- **Technical Requirements:** Coding standards and patterns
- **Files to Create/Modify:** Specific file operations
- **Success Criteria:** How to validate completion

## 🛠️ Technology Stack

- **Framework:** Angular 20 with standalone components
- **State Management:** Signals and RxJS
- **Data Layer:** Apollo Client with GraphQL
- **UI Library:** Angular Material
- **Styling:** Custom theme with TailwindCSS utilities
- **Testing:** Jest for unit tests, Cypress for E2E
- **Type Safety:** TypeScript 5+ with strict mode

## 📁 Project Structure

```
src/app/
├── auth/              # Authentication components and services
├── events/            # Event management features
├── profile/           # User profile management
├── dashboard/         # User dashboards (volunteer/organizer)
├── registration/      # Event registration features
├── shared/           # Shared components, services, models
└── graphql/          # GraphQL operations and fragments
```

## 🔄 Development Workflow

1. **Read the prompt thoroughly**
2. **Set up the required services/components using Angular CLI**
3. **Implement the functionality following the specifications**
4. **Test the implementation**
5. **Move to the next prompt in sequence**

## 🎯 Success Metrics

- All authentication flows work correctly
- Event management is fully functional
- Registration system handles all use cases
- User profiles are comprehensive
- Real-time updates work via GraphQL subscriptions
- Application is responsive and accessible
- Test coverage meets requirements (80%+)
- Performance targets are achieved

## 📚 Additional Resources

- [MVP Implementation Plan](../plan/feature-mvp-implementation-1.0.md)
- [Frontend Specification](../frontend-specification/README.md)
- [Architecture Specifications](../spec/)
- [Angular 20 Documentation](https://angular.io/docs)
- [Apollo Angular Documentation](https://apollo-angular.com/docs/)
- [Angular Material Documentation](https://material.angular.io/)

---

**Note:** These prompts are designed to be used with AI coding assistants that support file creation and Angular CLI command execution. Each prompt builds upon the previous ones, so they should be completed in order for best results.
