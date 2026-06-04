# ProsperMentor Enterprise Frontend

ProsperMentor Enterprise is the Nuxt frontend for the corporate mentorship product. It includes the public enterprise signup and pricing experience, corporate admin workspace, employee mentorship journey, mentor marketplace/session booking surfaces, billing flows, feedback visibility, and analytics/reporting pages.

The product direction is program-centric. Corporate features should focus on company programs, participants, mentor matching, journeys, session outcomes, pulses, billing, trust, and analytics rather than generic marketplace browsing.

Backend repository:

```text
/Users/macbookpro/IdeaProjects/ProsperMentor
```

Detailed contributor onboarding:

```text
docs/contributor-onboarding.md
```

## Tech Stack

- Nuxt 3
- Vue 3
- TypeScript
- Pinia
- Tailwind CSS
- shadcn-nuxt / shared UI primitives
- Axios request modules

## Requirements

- Node.js compatible with Nuxt 3
- npm
- Backend API running locally when testing authenticated product flows

## Local Setup

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend runs at:

```text
http://localhost:3000
```

By default, development API requests resolve to:

```text
http://localhost:8080/api
```

You can override the API base URL with:

```bash
NUXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

The backend exposes versioned routes under `/api/v1`, while frontend request modules usually call `/v1/...` through the configured API base.

## Scripts

```bash
npm run dev       # Start Nuxt dev server
npm run build     # Build for production
npm run preview   # Preview production build locally
npm run generate  # Generate static output where supported
```

## Project Structure

```text
AGENTS.md                    Product and contribution rules
docs/                        Architecture and contributor docs
tasks/                       Product requirements and task breakdowns
nuxt.config.ts               Nuxt config, runtime config, modules
http/axios.ts                Axios base URL and bearer token handling
http/requests/app/           Authenticated API request modules
http/requests/public/        Public API request modules
store/modules/               Pinia stores
pages/app/admin/             Corporate admin routes
pages/app/employee/          Employee routes
pages/app/mentors/           Mentor marketplace routes
components/app/admin/        Admin feature components
components/ui/               Shared UI primitives
navigation/vertical/         Role-specific navigation
types/auth.ts                Auth and permission types
utils/roleManager.ts         Route access and permission rules
middleware/auth.global.ts    Global auth middleware
tests/                       Source-level route and behavior checks
```

## Request Flow

Use the existing request pattern:

```text
component -> Pinia store -> http request module -> backend API
```

Avoid placing ad hoc API fetch logic directly in complex page components when a store/request module is a better fit.

## Role Routes

Use role-specific routes and navigation as the primary product entry points.

Corporate admin:

```text
/app/admin/*
navigation/vertical/corporate-admin.ts
```

Employee:

```text
/app/employee/*
navigation/vertical/employee.ts
```

Mentor:

```text
navigation/vertical/mentor.ts
```

Shared routes such as `/app/sessions` and `/app/profile` should only be reused where they still fit the role journey.

## Permissions

When adding a protected route or navigation item, wire all relevant layers:

1. Add or confirm permission constants in `types/auth.ts`.
2. Add permission definitions and route access in `utils/roleManager.ts`.
3. Update the correct role navigation file.
4. Add the route page under the correct role prefix.
5. Add page-level auth metadata if the page enforces permissions directly.
6. Add or update route/navigation tests.

Do not add a navigation item with a permission key that does not exist in the RBAC layer.

## Corporate Product Rules

Prefer corporate mentorship language:

- `Company Programs`
- `Participants`
- `Mentor Matches`
- `My Program`
- `My Journey`
- `Feedback & Pulses`
- `Analytics`
- `Trust and Safety`

Avoid routing employer workflows through marketplace-style pages unless the feature is genuinely about open mentor discovery.

## Backend Setup

The backend lives at:

```text
/Users/macbookpro/IdeaProjects/ProsperMentor
```

Run it locally with:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew bootRun
```

The backend uses Java 17, Spring Boot, Gradle, Supabase PostgreSQL, Spring Security/JWT, and Flyway migrations.

See `docs/contributor-onboarding.md` for the full-stack setup notes and required environment variables.

## Testing

Build the frontend:

```bash
npm run build
```

Run the current source-level checks:

```bash
for test in tests/*.test.mjs; do node "$test"; done
```

For browser E2E checks, use the enterprise login URL and test accounts documented in `AGENTS.md`.

## Useful Docs

```text
AGENTS.md
docs/contributor-onboarding.md
docs/tech-stack.md
tasks/prd-prosper-mentor-enterprise-platform.md
tasks/tasks-prd-prosper-mentor-enterprise-platform.md
```
