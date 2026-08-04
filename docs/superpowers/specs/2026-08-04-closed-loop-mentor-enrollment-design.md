# Closed-Loop Mentor Enrollment Product Requirements

Date: 2026-08-04

## Context

ProsperMentor Enterprise needs closed-loop mentor enrollment for B2B customers that bring their own mentor bench. This applies most directly to the enterprise-owned mentor scenarios in the enterprise scenario grid:

- S1: Fully Closed Loop
- S2: Closed Loop + PM Programs
- S5: CSR / Impact Outbound
- S6: CSR + PM Curriculum

The enterprise admin should be able to invite one mentor or import a list. Mentors should receive email and WhatsApp invites, complete their mentor profile through the normal B2C mentor signup experience, and become available only according to the company's visibility configuration.

The existing employee import flow is useful as a UX reference, but it should not be reused as the data model. The employee whitelist is email-only and mentee-specific. Closed-loop mentors need phone, WhatsApp delivery, company-pool membership, visibility rules, availability gates, public approval state, and existing-account linking.

## Goals

- Let enterprise admins invite and bulk import company-owned mentors from the enterprise platform.
- Send mentor invitations over email and WhatsApp.
- Keep the normal B2C mentor signup/profile flow as the canonical mentor completion path.
- Support both new invited mentors and existing Prosper Mentor accounts.
- Let companies control whether each mentor is company-private, program-restricted, or requested for public marketplace visibility.
- Make company-private mentors bookable for that company after profile and availability are complete.
- Require Prosper approval before a company-invited mentor appears in public Prosper Mentor discovery.
- Prevent company-private mentors from leaking through public discovery or booking APIs.

## Non-Goals

- Do not build a separate enterprise-hosted mentor profile form.
- Do not clone the employee whitelist table for mentor behavior.
- Do not let frontend-only filtering enforce mentor privacy.
- Do not delete or mutate a mentor's public B2C account when removing them from a company pool.
- Do not change the standard public Prosper Mentor signup path for mentors who are not company-invited.

## Approved Product Decisions

- Enterprise mentor enrollment uses the recommended architecture: enterprise owns invitation and pool configuration; B2C owns mentor profile completion.
- Prosper/public network mentors continue to use `https://www.prospermentor.com/auth?mode=signup&flow=mentor`.
- Company-invited mentors are routed into the same B2C mentor flow with invite context.
- Company-private mentors become company-bookable after profile completion and availability setup.
- Public marketplace visibility requires Prosper approval.
- Visibility can be set per mentor, with company/program defaults applied during invite/import.
- Invite/import requires `email` and `phone`.
- Optional invite/import fields are `first_name`, `last_name`, `title`, `department`, `tags`, `visibility`, and `program_or_cohort`.
- Existing Prosper Mentor accounts can be attached to a company pool after accepting the company invite.
- Company-private mentors are company-wide by default, with optional program/cohort restrictions.
- Bulk import validation is strict: if any row has an error, no records are saved.

## User Roles

### Corporate Admin

The corporate admin invites mentors, imports mentor lists, tracks invitation and activation status, resends invites, edits visibility, applies program/cohort restrictions, and removes mentors from the company pool.

### Invited Mentor

The invited mentor receives email and WhatsApp, follows the invite link, completes or continues the normal B2C mentor signup/profile flow, sets availability, and becomes bookable based on company visibility policy.

### Existing Prosper Mentor

An existing Prosper Mentor accepts the company invite after signing in. Their existing mentor profile remains canonical. The system links their profile to the company pool and applies company visibility rules.

### Prosper Admin or Mentor Pool Manager

Prosper approves public marketplace visibility requests and can inspect invitation/activation status when supporting enterprise customers.

## Enterprise Product Surface

The existing enterprise `/app/admin/mentors` route should become the closed-loop mentor workspace.

### Tabs

#### Prosper Mentors

Shows public Prosper Mentor network mentors available for company program matching. This list must be backed by server-side visibility filtering.

#### Company Mentors

Shows mentors attached to the company pool, including pending invites, accepted mentors, company-bookable mentors, program-restricted mentors, and mentors with public visibility requested.

### Actions

#### Invite Mentor

A single-invite dialog collects:

- Required: email, phone.
- Optional: first name, last name, title, department, tags, default visibility, program/cohort restriction.

After submission, the backend creates an invitation and sends email plus WhatsApp.

#### Import Mentors

A bulk-import page or modal follows the existing employee import pattern but uses mentor-specific fields and strict validation.

Required columns:

- `email`
- `phone`

Optional columns:

- `first_name`
- `last_name`
- `title`
- `department`
- `tags`
- `visibility`
- `program_or_cohort`

The preview must show row-level validation errors. The import cannot be confirmed until all rows pass.

#### Resend Invite

Regenerates the invitation token, expires the previous token, and sends both email and WhatsApp again.

#### Edit Visibility

Allows corporate admins to update company-scoped visibility:

- Company-private
- Program/cohort restricted
- Public requested

Corporate admins can request public visibility, but cannot approve it.

#### Remove From Company Pool

Deactivates the company mentor pool membership. This must not delete the mentor's profile, mentor verification history, B2C account, public marketplace presence, or company memberships for other companies.

### Status Columns

The Company Mentors tab should expose:

- Mentor name and email.
- Phone.
- Invite status.
- Email delivery status.
- WhatsApp delivery status.
- Accepted status.
- Profile completion status.
- Availability status.
- Company-bookable status.
- Visibility mode.
- Program/cohort scope.
- Public approval status.
- Last invite sent time.

## B2C Mentor Completion Surface

The B2C app remains the canonical mentor signup and profile-completion surface.

Invite links should route to:

`https://www.prospermentor.com/auth?mode=signup&flow=mentor&from=invite&token=<token>`

Expected behavior:

- New mentors complete the normal B2C mentor signup/profile flow.
- Existing mentors are asked to sign in, then accept the company invite.
- Known invite fields should prefill the B2C flow where possible.
- On acceptance, the backend links the mentor profile to the company pool.
- The mentor is guided to complete profile requirements and set availability.
- The mentor does not become company-bookable until profile and availability gates pass.

## Data Model

Use a mentor-specific enrollment model separate from employee whitelist.

### `company_mentor_invitations`

Stores invite lifecycle and delivery state.

Core fields:

- `id`
- `company_id`
- `email`
- `phone`
- `first_name`
- `last_name`
- `title`
- `department`
- `tags`
- `default_visibility`
- `program_or_cohort_reference`
- `invitation_token_hash`
- `invitation_token_expires_at`
- `status`
- `email_delivery_status`
- `whatsapp_delivery_status`
- `accepted_profile_id`
- `accepted_at`
- `invited_by_user_id`
- `last_sent_at`
- `created_at`
- `updated_at`

Status values:

- `DRAFT`
- `SENT`
- `ACCEPTED`
- `EXPIRED`
- `CANCELLED`
- `FAILED_DELIVERY`

### `company_mentor_pool_memberships`

Links a mentor profile to a company and stores company-specific access policy.

Core fields:

- `id`
- `company_id`
- `mentor_profile_id`
- `source_invitation_id`
- `visibility_mode`
- `membership_status`
- `profile_complete`
- `availability_complete`
- `company_bookable`
- `public_approval_status`
- `public_requested_at`
- `public_approved_at`
- `public_approved_by_user_id`
- `created_at`
- `updated_at`

Visibility modes:

- `COMPANY_PRIVATE`
- `PROGRAM_RESTRICTED`
- `PUBLIC_REQUESTED`
- `PUBLIC_APPROVED`

Membership statuses:

- `PENDING_INVITE`
- `ACTIVE`
- `REMOVED`
- `SUSPENDED`

Public approval statuses:

- `NOT_REQUESTED`
- `REQUESTED`
- `APPROVED`
- `REJECTED`

### `company_mentor_program_scopes`

Stores optional program/cohort restrictions.

Core fields:

- `id`
- `company_mentor_pool_membership_id`
- `company_program_id`
- `cohort_id`
- `created_at`
- `updated_at`

When no scope exists, a company-private mentor is available company-wide. When scope records exist, the mentor is available only for those programs/cohorts.

## Backend Contracts

### Enterprise APIs

Suggested endpoints:

- `GET /v1/companies/{companyId}/mentor-pool`
- `POST /v1/companies/{companyId}/mentor-invitations`
- `POST /v1/companies/{companyId}/mentor-invitations/validate-import`
- `POST /v1/companies/{companyId}/mentor-invitations/import`
- `POST /v1/companies/{companyId}/mentor-invitations/{invitationId}/resend`
- `PATCH /v1/companies/{companyId}/mentor-pool/{membershipId}/visibility`
- `PATCH /v1/companies/{companyId}/mentor-pool/{membershipId}/program-scopes`
- `DELETE /v1/companies/{companyId}/mentor-pool/{membershipId}`

### Public/Invite APIs

Suggested endpoints:

- `GET /v1/company-mentor-invitations/verify?token=<token>`
- `POST /v1/company-mentor-invitations/accept`

Acceptance should support both:

- Newly created mentor profile.
- Existing authenticated Prosper Mentor account.

### Discovery And Booking Enforcement

The backend must enforce visibility in:

- Public mentor list and detail APIs.
- Company program mentor-candidate APIs.
- Employee mentor selection APIs.
- Booking/session creation APIs.

Rules:

- Public mentor discovery must return only normal public mentors and company-invited mentors with `PUBLIC_APPROVED`.
- Company program mentor candidates may include company-private mentors only for the owning company.
- Program-restricted mentors may appear only for allowed programs/cohorts.
- A mentor is company-bookable only when membership is active, profile is complete, and availability exists.

## Notification Requirements

Every invite send or resend should attempt both email and WhatsApp.

Email and WhatsApp delivery must be tracked separately:

- `NOT_ATTEMPTED`
- `SENT`
- `FAILED`
- `DELIVERED` when provider data supports it

Invite copy should clearly state:

- The company inviting the mentor.
- That profile completion happens on Prosper Mentor.
- The invite expiry date.
- The support path for expired or invalid links.

WhatsApp should use the existing Nautix template pattern. Add a mentor-specific template rather than reusing the employee invitation copy.

## Validation Rules

Bulk import validation is strict. If any row fails, no invitation or membership records are saved.

Row-level errors must include:

- Row number.
- Field.
- Entered value.
- Specific reason.

Validation must catch:

- Missing email.
- Invalid email.
- Missing phone.
- Invalid phone.
- Duplicate email in the file.
- Duplicate phone in the file.
- Existing open invite for the company.
- Existing active company pool membership.
- Invalid visibility value.
- Invalid program/cohort reference.

Existing Prosper Mentor accounts are not errors. They are marked as existing-account attach candidates and can accept the invite after sign-in.

## Error Handling

- Expired tokens show a recovery path: ask the company admin to resend or contact support.
- Used tokens show that the invite has already been accepted.
- Cancelled invites cannot be accepted.
- Removed memberships cannot be booked.
- If email delivery fails but WhatsApp succeeds, the invite remains visible with partial delivery status.
- If WhatsApp delivery fails but email succeeds, the invite remains visible with partial delivery status.
- If both delivery channels fail, the invite is saved with failed delivery status and can be resent.

## Permissions And Navigation

Use existing corporate admin mentor permission:

- `admin:mentors`

The existing corporate admin navigation already links Mentors to `/app/admin/mentors`. This feature should extend that route instead of adding a separate top-level admin route.

If internal Prosper approval screens are added later, they should use an internal admin permission rather than granting corporate admins public approval rights.

## State And Bookability

Company-bookable state is derived from:

- Membership status is `ACTIVE`.
- Visibility mode allows the current company/program context.
- Mentor profile is complete.
- Mentor availability exists.

Public visibility state is derived from:

- Mentor satisfies normal public mentor requirements.
- Public approval status is `APPROVED`.
- Visibility mode is `PUBLIC_APPROVED`.

Company bookability and public visibility must be independent. A mentor can be company-bookable while still absent from public discovery.

## Reporting And Status Metrics

The Company Mentors workspace should support simple operational metrics:

- Total company mentors.
- Pending invites.
- Accepted but incomplete profile.
- Profile complete but no availability.
- Company-bookable mentors.
- Public visibility requested.
- Public-approved mentors.
- Failed email deliveries.
- Failed WhatsApp deliveries.

These metrics should be derived from the same backend list endpoint used by the table to avoid mismatched counts.

## Testing Requirements

### Backend Unit Tests

- Import parsing and validation.
- Duplicate detection.
- Token lifecycle.
- Existing-account matching.
- Visibility policy.
- Program/cohort scope policy.
- Company-bookable calculation.

### Backend Integration Tests

- Single invite creates invitation and sends email/WhatsApp attempts.
- Strict bulk import saves nothing when one row fails.
- Strict bulk import saves all rows when all rows pass.
- Resend expires the old token and sends both channels again.
- New mentor accepts invite and creates company membership.
- Existing mentor accepts invite and creates company membership.
- Company-private mentors are visible in owning company mentor candidates.
- Company-private mentors are absent from public mentor discovery.
- Program-restricted mentors appear only for scoped programs/cohorts.
- Removed memberships are not bookable.

### Enterprise Frontend Tests

- Company Mentors tab renders pending and active mentor states.
- Invite modal validates required email and phone.
- Import preview shows row-level validation errors.
- Strict import confirm is disabled while errors exist.
- Resend action updates delivery status.
- Visibility edit action updates the row state.
- Empty state invites admins to invite or import mentors.

### B2C Frontend Tests

- Invite token pre-fills known mentor fields.
- Existing account sign-in can accept a company invite.
- Normal mentor signup remains unaffected when no invite token exists.
- Profile completion and availability gates are surfaced after invite acceptance.

### Privacy Regression Test

Company-private mentors must not appear in public `/profiles/mentors` or public mentor detail APIs unless public approval has been granted.

## Rollout

Recommended rollout order:

1. Backend data model, invite lifecycle, validation, and visibility enforcement.
2. Enterprise Company Mentors invite/import/status workspace.
3. B2C invite-token acceptance and existing-account attach.
4. Public visibility approval workflow for Prosper admins.
5. Metrics and reporting polish.

This order prioritizes privacy and data correctness before expanding visible UI controls.

## Acceptance Criteria

- Corporate admins can invite a single mentor with email and phone.
- Corporate admins can import a mentor list with strict validation.
- Invalid import rows block the entire import and show row-level errors.
- Invited mentors receive email and WhatsApp attempts.
- Invited mentors land in the normal B2C mentor signup flow.
- Existing Prosper Mentor accounts can accept company invites after signing in.
- Accepted mentors appear in the company mentor pool.
- Company-private mentors become bookable for the company after profile and availability completion.
- Program/cohort restrictions are enforced in mentor candidate and booking flows.
- Company-private mentors are not visible in public discovery.
- Public discovery requires Prosper approval.
- Removing a mentor from the company pool does not delete their B2C account or public profile.
