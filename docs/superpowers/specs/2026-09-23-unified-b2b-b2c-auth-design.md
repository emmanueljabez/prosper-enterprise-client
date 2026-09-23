# Unified B2B and B2C Auth Design

## Summary

ProsperMentor should use one backend-owned identity contract for both the public network product and the enterprise product. A user should have one account and one credential set, while product-specific access is represented as memberships, roles, entitlements, and onboarding state.

The implementation should not merge the two product experiences into one UI. B2C and B2B should keep separate routes, onboarding journeys, navigation, and permission gates, but both frontends should authenticate through the same backend auth endpoints and consume the same session shape.

## Goals

- Let one person sign in with the same email/password or SSO identity on `prospermentor.com` and `enterprise.prospermentor.com`.
- Keep B2C mentee, mentor, employee, and corporate admin journeys distinct after authentication.
- Move frontend auth decisions toward a backend source of truth.
- Preserve existing free-trial, pricing, company signup intent, employee invitation, mentor signup, payment return, and session booking contracts.
- Migrate incrementally so both frontends continue working during rollout.

## Non-Goals

- Combining B2C and enterprise into one frontend application.
- Replacing all Supabase usage in B2C in a single release.
- Changing Supabase as the underlying identity provider.
- Removing current product-specific signup flows.
- Allowing the frontend to bypass backend-owned profile, entitlement, and company membership rules.

## Current State

### Enterprise Frontend

- Repository: `/Users/macbookpro/WebstormProjects/myProsperV2`.
- Nuxt auth code is centered in `store/modules/auth.ts`.
- Login and signup pages call backend auth endpoints through `http/requests/auth/jwt/index.ts`.
- The app already routes after login by backend profile role:
  - mentee/employee-like users into app dashboard or mentor browsing
  - company/corporate admins into `/app/admin`
- Global auth middleware reads locally stored tokens and enforces admin onboarding gates.

### B2C Frontend

- Repository: `/Users/macbookpro/WebstormProjects/prosper-link-africa`.
- Auth code is still Supabase-client heavy:
  - `src/components/auth/AuthForm.tsx`
  - `src/hooks/useAuth.tsx`
  - direct `supabase.auth.signUp`, `signInWithPassword`, `signInWithOAuth`, `getSession`, `refreshSession`, and `signOut`
- Some B2C flows already call enterprise backend APIs through `/api`, including free-trial login and payment-related flows.
- The B2C signup surface contains specialized mentee and mentor acquisition flows that should remain product-specific.

### Backend

- Repository: `/Users/macbookpro/IdeaProjects/ProsperMentor`.
- Auth endpoints live mainly in `AuthController`.
- Supabase Auth integration lives in `SupabaseAuthService`.
- Existing backend auth endpoints include:
  - `POST /api/auth/login`
  - `POST /api/auth/signup`
  - `POST /api/auth/refresh`
  - `POST /api/auth/logout`
  - `POST /api/auth/complete-invitation-signup`
  - `POST /api/auth/complete-company-registration`
- Public email confirmation lives in `PublicAuthController`.
- Company signup intents, employee invitation flows, and free-trial activation already exist and should be reused.

## Product Model

Authentication answers "who is this person?"

Product access answers "what can this person do here?"

A single identity may have any combination of:

- `mentee`: public network learner account.
- `mentor`: mentor account and mentor profile.
- `employee`: participant in a company program.
- `corporate_admin`: company admin or HR owner.

The backend should expose those access relationships as memberships and entitlements instead of forcing the frontend to infer them from one loose profile role.

## Unified Session Contract

All login-like endpoints should return a stable session object:

```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token",
  "user": {
    "id": "uuid",
    "email": "person@example.com",
    "firstName": "Amina",
    "lastName": "Hassan",
    "displayName": "Amina Hassan",
    "avatarUrl": null,
    "emailVerified": true,
    "provider": "local"
  },
  "profile": {
    "id": "uuid",
    "role": "mentee",
    "phoneNumber": "+254712345678",
    "companyId": null
  },
  "memberships": [
    {
      "type": "b2c",
      "role": "mentee",
      "status": "active",
      "companyId": null
    },
    {
      "type": "company",
      "role": "employee",
      "status": "active",
      "companyId": "company-uuid"
    }
  ],
  "entitlements": [
    {
      "type": "free_trial",
      "status": "available",
      "remainingSessions": 1
    }
  ],
  "nextAction": null,
  "defaultDestination": {
    "product": "b2c",
    "url": "https://prospermentor.com/dashboard"
  }
}
```

For compatibility, backend responses may temporarily include existing snake_case fields such as `access_token` and `refresh_token`, but frontends should move to the camelCase contract.

## Signup Intent Contract

Signup should include intent, not hardcode product rules inside frontend forms.

```json
{
  "email": "person@example.com",
  "password": "secret",
  "firstName": "Amina",
  "lastName": "Hassan",
  "phoneNumber": "+254712345678",
  "audience": "b2c",
  "roleIntent": "mentee",
  "product": "FREE_TRIAL",
  "companySignupIntentToken": null,
  "companyInviteToken": null,
  "returnTo": "https://prospermentor.com/mentors"
}
```

Accepted audiences:

- `b2c`
- `enterprise`

Accepted role intents:

- `mentee`
- `mentor`
- `employee`
- `corporate_admin`

Specialized flows should map to this common request:

- B2C mentee signup sends `audience=b2c`, `roleIntent=mentee`.
- Free trial signup adds `product=FREE_TRIAL`.
- Mentor signup sends `audience=b2c`, `roleIntent=mentor`.
- Company signup intent completion sends `audience=enterprise`, `roleIntent=corporate_admin`, and `companySignupIntentToken`.
- Employee invitation completion sends `audience=enterprise`, `roleIntent=employee`, and `companyInviteToken`.

## Routing Rules

The backend should return a `defaultDestination` and optional `nextAction`. The frontend may override only when the current flow has a validated return intent.

Default destinations:

- B2C mentee: `https://prospermentor.com/dashboard`
- B2C free trial: `https://prospermentor.com/mentors`
- Mentor: `https://prospermentor.com/dashboard` or the current mentor destination used by B2C
- Employee: `https://enterprise.prospermentor.com/app/employee`
- Corporate admin: `https://enterprise.prospermentor.com/app/admin`
- Corporate admin requiring activation: `https://enterprise.prospermentor.com/app/admin/activate`
- Corporate admin requiring onboarding: `https://enterprise.prospermentor.com/app/admin/onboarding`

Return URL rules:

- Allow same-site ProsperMentor destinations only.
- Preserve B2C-origin payment and booking returns.
- Preserve free-trial mentor browsing returns.
- Reject arbitrary third-party redirects.

## Cookie And Token Strategy

Preferred production strategy:

- Issue secure, HTTP-only cookies on `.prospermentor.com`.
- Use `SameSite=Lax`, `Secure`, and narrow path/domain configuration.
- Keep refresh tokens out of JavaScript-accessible storage.
- Keep access-token compatibility for existing API calls during migration.

Transitional strategy:

- Continue accepting bearer tokens from both frontends.
- Frontends store the normalized session through a shared local helper.
- B2C keeps Supabase session reads only where a flow has not yet migrated.

## Migration Plan

### Phase 1: Backend Session Normalization

Add a backend mapper that turns Supabase auth responses plus profile/company/free-trial state into the unified session contract. Use it from:

- `POST /api/auth/login`
- `POST /api/auth/signup`
- `POST /api/auth/refresh`
- `POST /api/auth/complete-invitation-signup`
- `POST /api/auth/complete-company-registration`

Existing fields should remain in the response until both frontends are migrated.

### Phase 2: Enterprise Frontend Adoption

Update `myProsperV2` auth store to read the normalized session fields first, falling back to existing fields. Preserve current role-based routing and onboarding checks.

### Phase 3: B2C Backend Login

Add a B2C auth API client that calls backend `/api/auth/login`, `/api/auth/refresh`, and `/api/auth/logout`. Update `AuthForm.tsx` signin first because it is the lowest-risk entry point.

### Phase 4: B2C Signup Migration

Move B2C mentee signup to backend `/api/auth/signup` with intent fields. Keep mentor signup on its current flow until the backend accepts all mentor profile metadata required by the current four-step flow.

### Phase 5: SSO And Cookie Unification

Move Google/Microsoft/Apple flows behind backend-controlled OAuth initiation/callback endpoints, then enable shared-domain HTTP-only cookies.

## Testing Strategy

Backend:

- Unit-test the unified session mapper.
- Controller-test login response shape and compatibility fields.
- Controller-test signup intent handling for free trial, company registration, and invitation completion.
- Regression-test `/api/auth/refresh` and `/api/auth/logout`.

Enterprise frontend:

- Test auth store normalization from camelCase and existing snake_case backend responses.
- Test corporate admin, employee/mentee, and free-trial routing.
- Test global middleware still gates admin onboarding.

B2C frontend:

- Test backend login client maps unified sessions into existing auth context.
- Test `/auth?mode=signin` routes free-trial and pricing intent users correctly.
- Test sign-out clears both backend session state and legacy Supabase/local storage.

Manual E2E:

- Sign up B2C mentee and sign in on B2C.
- Sign in with same user on enterprise and verify unauthorized enterprise routes stay gated.
- Complete company admin signup and verify enterprise destination.
- Accept employee invitation with an existing B2C email and verify one user identity with employee membership.
- Start free trial from B2C and verify mentor browsing resumes after login.

## Rollout And Risk Controls

- Use additive backend response fields first.
- Keep legacy Supabase B2C auth paths until each flow has a backend replacement.
- Log normalized session decisions server-side without logging tokens.
- Add metrics for login source, selected destination, missing profile, missing membership, and invalid return URL.
- Roll out B2C signin migration before B2C signup migration.

## Open Decisions

- Whether production will use HTTP-only shared-domain cookies immediately or after bearer-token migration.
- Whether mentor dashboard should remain in B2C only or become available in enterprise for corporate mentor workflows.
- Whether users with multiple active memberships should always see a product switcher after login or only when they land in the less likely product.
