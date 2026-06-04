# ProsperMentor Contributor Onboarding

Last updated: 2026-06-04

This guide is for engineers contributing across the ProsperMentor frontend and backend. It explains the product direction, local setup, codebase layout, request flow, role-based access rules, and the expected workflow for adding features safely.

## 1. Product Context

ProsperMentor is moving from a mentor marketplace and session-booking product into a corporate mentorship platform.

The current product direction is program-centric:

- Corporate admins manage company programs, participants, mentor matching, journey templates, session allocations, billing, trust, and analytics.
- Employees move through assigned company programs, mentor matches, sessions, journey steps, goals, preferences, and feedback.
- Mentors manage assigned mentees, sessions, availability, outcomes, and ratings.

Phase 1 corporate MVP should prioritize:

- company programs
- participants
- mentor matching
- employee journey
- session outcomes
- feedback and pulses
- analytics summaries

Avoid drifting back into generic marketplace language when building corporate flows. Prefer domain terms such as `company program`, `participant`, `mentor match`, `journey`, `pulse`, and `trust and safety`.

## 2. Repositories

Frontend:

```text
/Users/macbookpro/WebstormProjects/myProsperV2
```

Backend:

```text
/Users/macbookpro/IdeaProjects/ProsperMentor
```

If you clone the repos elsewhere, adjust paths in commands accordingly.

## 3. Tech Stack

Frontend:

- Nuxt 3
- Vue 3
- TypeScript
- Pinia
- Tailwind CSS
- shadcn-nuxt and shared UI primitives
- Axios request modules

Backend:

- Java 17
- Spring Boot 3.5
- Gradle
- Spring Web MVC
- Spring Security
- Spring Data JPA
- PostgreSQL through Supabase
- Flyway migrations
- Jakarta Bean Validation
- JUnit and Testcontainers

## 4. Local Setup

### Frontend

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
npm install
npm run dev
```

The Nuxt dev server runs on:

```text
http://localhost:3000
```

The frontend API client defaults to `http://localhost:8080/api` in development. You can also set it explicitly:

```bash
NUXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

Request modules append `/v1/...`, so a frontend request like `/v1/companies/{companyId}/programs` maps to the backend route `/api/v1/companies/{companyId}/programs`.

### Backend

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew bootRun
```

The backend defaults to the `local` Spring profile via `src/main/resources/application.properties`.

The backend listens on:

```text
http://localhost:8080
```

At minimum, local backend work needs approved environment values for:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`

Depending on the feature, you may also need environment values for email, Google Calendar, Zoom, M-Pesa, CyberSource, Wati, Nautix WhatsApp, or review connector integrations.

Do not commit real secrets. Use a shell export, IDE run configuration, local-only env file, or the team secret manager.

## 5. Frontend Code Map

Important files and directories:

```text
AGENTS.md                              Product and contribution rules
docs/tech-stack.md                     Current architecture summary
tasks/                                 Product requirements and task breakdowns
nuxt.config.ts                         Nuxt runtime config and modules
http/axios.ts                          Axios base URL and bearer token handling
http/requests/app/                     Authenticated API request modules
http/requests/public/                  Public API request modules
store/modules/                         Pinia stores
pages/app/admin/                       Corporate admin routes
pages/app/employee/                    Employee routes
pages/app/mentors/                     Marketplace and mentor routes
components/app/admin/                  Admin-oriented feature components
components/ui/                         shadcn-nuxt and shared primitives
navigation/vertical/                   Role-specific sidebar definitions
types/auth.ts                          Permission constants and auth types
utils/roleManager.ts                   Route access and role permission logic
middleware/auth.global.ts              Global auth and public-route handling
tests/                                 Source-level route and behavior checks
```

The preferred frontend request flow is:

```text
component -> Pinia store -> http request module -> backend API
```

Do not add one-off fetch logic directly in complex page components when a store/request module is the established pattern.

## 6. Backend Code Map

Important files and directories:

```text
README.md                              Backend setup overview
build.gradle                           Java, Spring Boot, dependency, Flyway config
src/main/resources/application*.properties
src/main/resources/db/migration/       Flyway schema migrations
src/main/java/com/prosper/prospermentor/controller/
src/main/java/com/prosper/prospermentor/dto/
src/main/java/com/prosper/prospermentor/entity/
src/main/java/com/prosper/prospermentor/repository/
src/main/java/com/prosper/prospermentor/service/
src/main/java/com/prosper/prospermentor/security/
src/main/java/com/prosper/prospermentor/specification/
src/test/java/com/prosper/prospermentor/
```

Useful backend docs:

```text
AUTHENTICATION_SETUP.md
BEARER_TOKEN_GUIDE.md
FEATURE_ACCESS_QUICK_REFERENCE.md
API_QUICK_REFERENCE.md
SESSION_BOOKING_API.md
MENTORS_API_DOCUMENTATION.md
SUBSCRIPTION_MODULE_GUIDE.md
DYNAMIC_SUBSCRIPTION_SYSTEM.md
MENTORSHIP_BOOKING_SYSTEM.md
```

Typical backend request flow:

```text
controller -> DTO validation -> service -> repository/specification -> entity/database
```

Schema changes should go through additive Flyway migrations in `src/main/resources/db/migration/`. Do not rely on Hibernate to mutate the schema in local or production environments.

## 7. Role-Based Routes And Permissions

Role-specific navigation is the primary UI entry point.

Corporate admin routes belong under:

```text
/app/admin/*
```

Employee routes belong under:

```text
/app/employee/*
```

Mentor workflows should stay under mentor-oriented routes unless a dedicated corporate mentor area is introduced.

When adding a frontend route or navigation item, update all relevant layers:

1. Add or confirm permission constants in `types/auth.ts`.
2. Add permission definitions and route access in `utils/roleManager.ts`.
3. Update the correct navigation file:
   - `navigation/vertical/corporate-admin.ts`
   - `navigation/vertical/employee.ts`
   - `navigation/vertical/mentor.ts`
4. Add the route page under the correct role prefix.
5. Add page-level auth metadata when the page enforces permissions directly.
6. Add or update tests for the route, navigation, and permission behavior.

Do not add a navigation item with a permission key that does not exist in the RBAC layer.

## 8. Corporate Feature Workflow

For a new corporate feature, start from the product domain and wire both sides deliberately.

Backend checklist:

1. Confirm the domain model and API contract.
2. Add a Flyway migration if the schema changes.
3. Add or update entity classes.
4. Add repository or specification methods.
5. Add DTO request and response types.
6. Add service logic and transaction boundaries.
7. Add controller endpoints under `/api/v1`.
8. Add validation and authorization checks.
9. Add service/controller tests.
10. Update backend API docs when the API surface changes.

Frontend checklist:

1. Add the page under the correct route prefix.
2. Add or update role navigation.
3. Add or confirm permissions in `types/auth.ts` and `utils/roleManager.ts`.
4. Add TypeScript request/response types in the relevant `http/requests/*` module.
5. Add Pinia state/actions in `store/modules/*`.
6. Build the page and split reusable UI into components when it reduces complexity.
7. Use shared UI primitives before creating custom controls.
8. Handle loading, empty, error, and success states.
9. Add tests for navigation, routing, request wiring, and important UI rules.

## 9. API And Auth Notes

The frontend stores the bearer token in `localStorage` under `token`, and `http/axios.ts` attaches it as:

```text
Authorization: Bearer <token>
```

The backend uses Supabase/JWT security components under:

```text
src/main/java/com/prosper/prospermentor/security/
```

For authenticated endpoints, check both:

- backend authorization rules and ownership checks
- frontend route permissions and navigation visibility

Corporate data should be scoped by company where applicable. Employee endpoints should only expose the current user's allowed program, journey, match, consent, and session information.

## 10. Testing And Verification

Frontend verification:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
npm run build
for test in tests/*.test.mjs; do node "$test"; done
```

Backend verification:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test
./gradlew build
```

For browser E2E checks, use the enterprise login URL and test accounts listed in `AGENTS.md`. Keep test credentials in the existing instruction source instead of duplicating them across docs.

## 11. Common Development Examples

### Adding An Admin Analytics Page

Frontend:

- Add route under `pages/app/admin/analytics.vue` or a child route under `pages/app/admin/reports/`.
- Add navigation in `navigation/vertical/corporate-admin.ts`.
- Confirm permission in `types/auth.ts`.
- Wire route access in `utils/roleManager.ts`.
- Add report request methods in `http/requests/app/reports.ts`.
- Add report state/actions in `store/modules/reports.ts`.

Backend:

- Add or extend `CompanyReportController`.
- Add service logic in `CompanyReportService`.
- Add repository queries/specifications for the reporting data.
- Add tests under `src/test/java/com/prosper/prospermentor/service/`.

### Adding An Employee Journey Feature

Frontend:

- Keep routes under `pages/app/employee/journey.vue` or `/app/employee/programs/*`.
- Use labels such as `My Journey`, `Action Items`, `Mentor Match`, and `Program Progress`.
- Add API requests to `http/requests/app/companyPrograms.ts` or a focused module if the feature grows.
- Keep state in `store/modules/company-programs.ts` or a focused journey store.

Backend:

- Check `JourneyTemplateService`, `JourneyInstanceService`, and `CompanyProgramJourneyService`.
- Preserve company and participant scoping.
- Add tests for step transitions, action item updates, and access control.

### Adding Feedback Or Rating Surfaces

The main feedback product is WhatsApp-first and two-way.

Frontend pages should usually show:

- review status
- completion state
- score summaries
- blind reveal readiness
- re-match prompts
- admin reporting

Avoid building a generic survey builder unless the backend workflow explicitly requires it.

Backend areas to inspect:

```text
ReviewWorkflowService
ReviewSubmissionService
ReviewLifecycleService
ReviewAlertAdminService
ParticipantPulseService
NautixWhatsAppService
WatiService
```

## 12. Code Review Expectations

Before opening or requesting review:

- Keep the change scoped to one feature or bug.
- Include frontend and backend changes together only when the feature requires both.
- Verify local build and tests relevant to the touched area.
- Do not commit generated files, screenshots, logs, or local secrets.
- Confirm new corporate routes are program-centric and role-specific.
- Confirm API errors are handled cleanly in the frontend.
- Confirm backend writes are validated and authorized.
- Add migrations for schema changes.
- Add or update tests for changed behavior.

## 13. First Week Plan For A New Contributor

Day 1:

- Run the frontend and backend locally.
- Read `AGENTS.md`, `docs/tech-stack.md`, and this onboarding guide.
- Log in using the test accounts referenced in `AGENTS.md`.
- Click through corporate admin, employee, mentor, sessions, billing, and feedback surfaces.

Day 2:

- Trace one full feature from page to backend. A good starting point is company programs:
  - `pages/app/admin/programs/index.vue`
  - `store/modules/company-programs.ts`
  - `http/requests/app/companyPrograms.ts`
  - `CompanyProgramController`
  - `CompanyProgramService`
  - `CompanyProgramRepository`

Day 3:

- Pick a small, scoped change such as a label fix, empty state, validation message, or report column.
- Add or update the smallest useful test.
- Run frontend build/tests or backend tests depending on the touched area.

Day 4:

- Pair on a feature that crosses frontend and backend.
- Pay attention to API contract shape, permission checks, loading/error states, and database migration safety.

Day 5:

- Prepare a small PR with a clear summary, test evidence, and notes about any follow-up work.

## 14. Quick Reference

Frontend dev:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
npm run dev
```

Frontend build:

```bash
npm run build
```

Backend dev:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew bootRun
```

Backend tests:

```bash
./gradlew test
```

Local frontend:

```text
http://localhost:3000
```

Local backend:

```text
http://localhost:8080
```

Local API base:

```text
http://localhost:8080/api
```
