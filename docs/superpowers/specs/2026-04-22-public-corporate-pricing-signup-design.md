# Public Corporate Pricing, Signup, and Activation Design

## Summary

Prosper should expose a public corporate acquisition flow that starts from a public pricing page, supports standalone company signup, and ends in a mandatory activation step where the company admin buys sessions before the corporate workspace is fully usable.

This flow must not create a second onboarding stack. It should reuse the existing company registration and company-admin account completion logic, while adding a cleaner public contract around pricing-driven signup and post-signup purchase activation.

## Goals

- Expose a public pricing page for corporate offers.
- Use the existing corporate pricing source of truth from the subscription plans API.
- Support a company-only public signup page at `/auth/signup`.
- Allow two entry paths into the same signup flow:
  - standalone company signup
  - pricing-driven signup with a selected corporate offer and session count
- Require newly created company admins to buy sessions before the admin workspace is fully activated.
- Preserve the existing secured company-subscription purchase flow for actual invoice creation.

## Non-Goals

- Supporting individual signup from `/auth/signup`.
- Allowing anonymous invoice creation before company/admin identity is established.
- Replacing the current company registration completion flow.
- Building a second pricing model outside the existing subscription plans API.

## Product Decisions Locked

- `/auth/signup` is company-only.
- Public pricing starts the corporate purchase process.
- Standalone company signup still works independently.
- Standalone signup lands in a mandatory activation step.
- Pricing-driven signup resumes the selected purchase during activation.
- The signup page must use the same visual shell and layout pattern as the current login page.

## User Journeys

### 1. Public Pricing -> Signup -> Activation -> Payment

1. Visitor opens `/pricing`.
2. The page loads corporate plans from `GET /api/v1/subscriptions/plans?audience=CORPORATE`.
3. Visitor selects a session count and clicks `Buy Sessions`.
4. If not authenticated, Prosper stores a purchase intent and routes to `/auth/signup`.
5. Visitor completes company-admin signup.
6. Prosper signs the user in and routes to `/app/admin/activate`.
7. Activation page loads the saved plan and session count.
8. User confirms or edits session count.
9. Prosper creates the secured company-subscription invoice and redirects to payment.
10. After payment, Prosper routes the user to `/app/admin`.

### 2. Standalone Company Signup -> Activation -> Payment

1. Visitor opens `/auth/signup`.
2. Visitor creates company and company-admin account without a purchase intent.
3. Prosper signs the user in and routes to `/app/admin/activate`.
4. Activation page shows the single corporate offer and requires session selection.
5. User buys sessions.
6. After payment, Prosper routes the user to `/app/admin`.

### 3. Returning Company Admin with Pending Purchase

1. Returning admin logs in through `/auth/login`.
2. If there is a pending purchase intent or open activation state, Prosper routes the user to `/app/admin/activate`.
3. If not, Prosper uses the normal admin destination.

## Frontend Routes

### `/pricing`

Public route for corporate pricing.

Responsibilities:

- Load and display corporate plans from the existing subscription plans API.
- Show only the corporate offer surface, not individual plans.
- Present session-based pricing, not seat-based pricing.
- Allow the visitor to select session quantity before signup.
- Start the acquisition flow with a stored purchase intent.

Page behavior:

- If the user is not authenticated, `Buy Sessions` routes to `/auth/signup`.
- If the user is already authenticated as a company admin with a company context, `Buy Sessions` may route directly to `/app/admin/activate` with the purchase intent preloaded.
- If the user is authenticated but not a company admin, the page should require a company-admin signup/login path rather than trying to reuse that account for corporate purchase.

### `/auth/signup`

Public company-only signup page.

Responsibilities:

- Collect company details and first admin details.
- Reuse the existing login-page shell and layout style.
- Accept optional purchase-intent context from pricing.
- Complete company-admin account setup.
- Route the user into activation after successful signup.

Required UI direction:

- Same two-column composition pattern as `/pages/auth/login.vue`.
- Same restrained auth look and spacing.
- No landing-page marketing hero styling on this page.
- The page can expand the form fields, but it should still feel like the login family, not a separate acquisition microsite.

### `/app/admin/activate`

Private route for mandatory corporate activation.

Responsibilities:

- Gate access to the admin workspace until sessions are purchased.
- Load any pending purchase intent.
- Show current corporate offer, session count, price per session, total amount, and invoice state.
- Support:
  - new purchase
  - continue existing open invoice
  - retry after cancelled payment

Post-payment behavior:

- If payment succeeds and the company wallet becomes active, route to `/app/admin`.

## Activation Gate

Company admins without an active purchased corporate session wallet should not have normal access to the admin workspace yet.

Allowed before activation:

- `/app/admin/activate`
- `/app/profile`
- auth and account-recovery routes

Blocked before activation:

- general admin workspace routes such as:
  - `/app/admin`
  - `/app/admin/programs`
  - `/app/admin/participants`
  - `/app/admin/settings`
  - `/app/admin/reports`

Redirect rule:

- If a company admin has no active company wallet or only a pending company subscription invoice state, redirect those admin routes to `/app/admin/activate`.

## Pricing Data Source

The public pricing page should reuse the existing subscription plans API:

- `GET /api/v1/subscriptions/plans?audience=CORPORATE`

This is the single source of truth for:

- corporate offer name
- description
- currency
- price per session
- plan audience
- feature list when applicable

The public pricing page should not hardcode corporate pricing values.

## Public API Contract

The current backend company registration and company-subscription purchase endpoints should remain the authoritative implementation path, but public onboarding should use a dedicated public contract.

### `POST /api/v1/public/company-signup-intents`

Purpose:

- Create or reuse a pending company signup intent.

Payload:

- company fields:
  - companyName
  - workEmail
  - phoneNumber
  - website
  - country
- admin fields:
  - firstName
  - lastName
- optional pricing fields:
  - planId
  - sessionCount

Response:

- intent token
- whether the intent is pricing-driven or standalone
- prefilled company/admin fields
- expiration state

### `GET /api/v1/public/company-signup-intents/{token}`

Purpose:

- Load the pending signup context for `/auth/signup`.

Response:

- company details
- admin email
- pricing selection if present
- token validity

### `POST /api/v1/public/company-signup-intents/{token}/complete`

Purpose:

- Complete the same company registration and company-admin account creation path that currently exists.

Implementation rule:

- This endpoint must reuse the current company registration completion logic rather than duplicating user and profile orchestration.

Response:

- authenticated company admin session data
- company profile data
- activation state

### `POST /api/v1/public/company-signup-intents/{token}/resume-purchase`

Purpose:

- Resume a pricing-driven purchase after signup/login and create the real secured company-subscription invoice.

Implementation rule:

- This should call into the existing secured company-subscription invoice creation flow after the user and company context are established.

Response:

- company subscription summary
- invoice id
- payment URL
- current session count

## Existing Backend Reuse

The design should build on the current implementation instead of replacing it.

Reuse:

- company creation and registration-token mechanics in `CompanyService`
- company registration token verification
- `POST /auth/complete-company-registration`
- company-admin profile linking during registration completion
- secured company-subscription invoice creation in `CompanySubscriptionService`

Do not expose the raw generic company-creation endpoint as the public product contract.

## Data Model Requirements

Public onboarding needs a first-class signup-intent record or equivalent persisted state.

Minimum fields:

- id
- token
- companyName
- companyEmail
- companyPhone
- adminFirstName
- adminLastName
- adminEmail
- targetPlanId nullable
- targetSessionCount nullable
- status
- expiresAt
- createdAt
- completedAt nullable
- linkedCompanyId nullable
- linkedProfileId nullable
- linkedUserId nullable

Status examples:

- `PENDING`
- `COMPLETED`
- `EXPIRED`
- `CANCELLED`

This must be queryable and explicit, not stored as an opaque JSON blob.

## Purchase and Invoice Behavior

### New purchase

- Activation page creates a company-subscription invoice when there is no active open invoice for the same intent.

### Existing open invoice

- If a matching open invoice already exists, activation must show `Continue Payment` instead of creating a duplicate invoice.

### Cancelled payment

- If payment is cancelled, the user returns to `/app/admin/activate` and the purchase intent remains resumable.

### Completed payment

- After successful payment, activation should reload company subscription state and route to `/app/admin`.

### Plan or price drift

- If the selected corporate plan becomes inactive or otherwise invalid before activation completes, the activation page must reload pricing and require the user to confirm the current offer before a new invoice is created.

## Auth and Redirect Rules

### Signup

- `/auth/signup` is public.
- It should accept query parameters or resolved state for a pricing intent, but the canonical persisted source is the signup-intent token.

### Login

- On successful login as a company admin:
  - if there is a pending activation or purchase-intent state, route to `/app/admin/activate`
  - otherwise route normally

### Admin navigation

- Admin route middleware should check activation state before granting general admin access.

## Error Handling

The UX must explicitly handle:

- invalid or expired signup token
- duplicate company email
- duplicate company name
- existing user with incorrect password during company-registration completion
- inactive or deleted corporate plan
- open invoice already exists
- failed invoice creation
- cancelled payment
- payment completed but wallet refresh delayed

Each case should resolve to a concrete next step, not a generic failure message.

## Testing Requirements

### Backend

- create signup intent
- load signup intent
- complete signup intent through company registration completion flow
- resume purchase from signup intent
- avoid duplicate open invoices
- enforce secured company-subscription creation after company/admin identity exists

### Frontend

- pricing page loads corporate plan data from API
- pricing page stores purchase intent and routes to `/auth/signup`
- company signup works without pricing selection
- company signup works with pricing selection
- login resumes pending activation state
- activation page handles new purchase, open invoice, cancelled payment, and successful payment
- admin guard redirects inactive company admins to activation

### End-to-end

- public pricing -> signup -> activate -> payment redirect
- standalone signup -> activate -> payment redirect
- returning admin login with pending activation -> activation page

## Risks and Constraints

- The current company-subscription creation endpoint is secured and requires a company admin plus `companyId`. That is correct and should remain so.
- Public pricing should never create invoices anonymously.
- Public signup must not become a second company/account model.
- Activation gating must be precise enough not to block account recovery or profile access.

## Recommendation

Implement the public acquisition flow as:

- public `/pricing`
- company-only `/auth/signup`
- mandatory `/app/admin/activate`
- dedicated public signup-intent APIs
- reuse of the existing company registration completion and secured company-subscription purchase pipeline

This keeps the onboarding model coherent, preserves tenant safety, supports public acquisition, and aligns the product with the current session-based corporate offer.
