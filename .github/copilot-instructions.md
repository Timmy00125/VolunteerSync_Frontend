# GitHub Copilot Instructions — VolunteerSync Frontend

Purpose: Guide Copilot (Chat and Agents) to generate high‑quality Angular code aligned with this repo’s specification and standards.

## Project context

- Framework: Angular v20 (standalone components, signals, new control flow)
- UI: Angular Material with custom theming
- Data: Apollo Client (GraphQL), RxJS
- Tooling: Angular CLI, TypeScript 5+, ESLint, Prettier, Jest, Cypress, Testing Library
- Spec docs: see `frontend-specification/`

## Golden rules

1. Follow the spec before inventing patterns. When unsure, align with `frontend-specification/README.md` and linked docs.
2. Prefer small, focused, testable components and services. Keep public APIs stable.
3. Be explicit with types. Avoid `any`; prefer `unknown` + narrowing.
4. Optimize for Core Web Vitals: lazy-load, defer heavy work, minimize bundle size.
5. Security first: sanitize inputs, avoid DOM injection, use safe GraphQL handling and auth headers.

## GraphQL (Apollo Angular)

- Co-locate queries/mutations/fragments with features.
- Use fragments for reuse and cache consistency.
- Define cache type policies for pagination and IDs; prefer `keyFields` and merge functions.
- Handle errors via Apollo links and user-friendly toasts; no unhandled promise rejections.
- Prefer optimistic updates for snappy UX; reconcile with server results.
- Never interpolate user input directly into GraphQL strings; use variables.

## File structure and naming

- Feature-first organization: `features/<domain>/...`
- Component names: `kebab-case` files, `PascalCase` classes, suffix with role: `*.component.ts`, `*.service.ts`.
- Keep one public component/service per file.
- Export barrels only when they reduce import noise without circular deps.

## TypeScript and code quality

- `strict` enabled; leverage inference; use readonly where possible.
- Prefer discriminated unions and `as const` for literals.
- Avoid side effects in module scope (except DI providers and constants).
- Lint + format: follow ESLint and Prettier; no tslint rules.

## Testing

- Unit: Jest + Testing Library Angular; aim 90%+ coverage.
- Integration: Apollo interactions, guards, resolvers; aim 80%+.
- E2E: Cypress for critical flows (auth, search, register).
- Write tests with user-centric assertions (roles, labels). Avoid brittle DOM selectors.

## Performance and accessibility

- Lazy load routes and heavy deps; prefer code-splitting and signals over change detection hacks.
- Use trackBy in `@for` and memoize expensive computations with `computed()`.
- A11y: proper ARIA, focus management, color contrast, keyboard nav.

## Security basics

- JWT handling consistent with backend contract; never store sensitive tokens insecurely.
- Sanitize HTML; use Angular’s DomSanitizer only with clear justification.
- Apply CSP-friendly patterns (no inline scripts/styles where avoidable).

## Pull request checklist (for Copilot-generated changes)

- [ ] Follows Angular v20 standalone + signals patterns.
- [ ] Types are explicit; no `any` introduced.
- [ ] GraphQL ops use variables, fragments, and proper cache policies.
- [ ] Routes/components are lazy where applicable; OnPush set.
- [ ] Tests updated/added (unit + integration where needed); coverage maintained.
- [ ] ESLint and Prettier pass; no dead code or unused exports.
- [ ] Security: input validated, no unsafe HTML/innerHTML.
- [ ] Docs: update `frontend-specification` or README snippets if behavior changes.

## Do / Don’t

- Do: compose small, pure functions; document public APIs with JSDoc.
- Do: prefer Angular Material primitives; extend via styles, not forks.
- Don’t: add state libs (NgRx, Akita, etc.) without explicit request.
- Don’t: mutate Apollo cache outside prescribed helpers.
- Don’t: introduce breaking API changes without migration notes.

## Useful references

- Project Spec Hub: `frontend-specification/README.md`
- Functional Requirements: `frontend-specification/02-FUNCTIONAL_REQUIREMENTS.md`
- Non-Functional: `frontend-specification/03-NON_FUNCTIONAL_REQUIREMENTS.md`
- User Stories: `frontend-specification/04-USER_STORIES.md`
- Testing: `frontend-specification/05-TESTING_RECOMMENDATIONS.md`
- GraphQL Schema: `frontend-specification/06-GRAPHQL_SCHEMA.md`

Keep outputs concise, production-ready, and aligned with the above. If a trade-off is required, prefer maintainability and testability.
