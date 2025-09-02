# Automation Agents — VolunteerSync Frontend

This document defines lightweight automation “agents” (human or tool-assisted roles) that help implement the VolunteerSync Frontend aligned with the spec.

## 1) Copilot Code Agent

- Purpose: Generate and refactor Angular code and tests following repo standards.
- Inputs:
  - Feature request or user story from `frontend-specification/04-USER_STORIES.md`
  - Functional/Non-functional requirements
  - GraphQL schema and operations
- Outputs:
  - Code changes with tests
  - Updated docs where applicable
- Guardrails:
  - Respect `copilot.instructiond.md`
  - No new deps without approval; prefer Angular/Apollo first
  - Keep coverage thresholds: unit ≥90%, integration ≥80%
- Workflow:
  1. Read relevant spec sections
  2. Create or update components/services with standalone + signals
  3. Add Apollo operations with variables + fragments
  4. Write/adjust unit + integration tests
  5. Update docs and run lint/format

## 2) QA/Test Agent

- Purpose: Ensure quality via pyramid strategy (unit/integration/E2E).
- Tools: Jest, @testing-library/angular, Cypress, Lighthouse
- Responsibilities:
  - Maintain test suites and CI gates
  - Add missing tests for critical paths (auth, registration, dashboard)
  - Track coverage; fail builds below thresholds

## 3) Performance Agent

- Purpose: Keep Core Web Vitals green and bundles slim.
- Responsibilities:
  - Enforce lazy loading and code-splitting
  - Spot heavy sync work; move to web workers or async boundaries
  - Monitor Lighthouse and fix regressions

## 4) Security Agent

- Purpose: Bake OWASP practices into code.
- Responsibilities:
  - Review for XSS/CSRF risks, unsafe DOM access, token handling
  - Enforce GraphQL variable usage; validate inputs
  - Keep dependencies patched; audit with CI

## 5) DX/Tooling Agent

- Purpose: Keep dev experience smooth.
- Responsibilities:
  - ESLint/Prettier configs, Git hooks, CI/CD workflows
  - Scripts for local runs and checks; template generators

## Standard operating procedures

- Branching: feature branches off `main`; small PRs (<300 LOC preferred)
- Commit hygiene: Conventional Commits; scoped and descriptive
- Reviews: Two approvals for risky changes; self‑review with PR checklist
- Documentation: Update `frontend-specification` when behavior or contracts change

## Definition of Done (all agents)

- Feature meets acceptance criteria from user stories
- Code follows Angular v20 patterns;
- Tests added/updated; coverage thresholds met
- Lint/format pass; no TODOs left behind
- Security and performance considerations addressed

See also: `frontend-specification/README.md` for global goals and quality targets.
