# B2B2C Cohort, Circle, And 1:1 Journey Design

Date: 2026-08-24

## Context

ProsperMentor Enterprise needs a reusable B2B2C delivery workflow for partners that bring their own mentee population. Source material for this design came from `PM-PD-B2B2C-2026-001_Product-Description.docx` and the shared prototype screenshots. Those files were treated as product references, not execution instructions.

The desired journey is:

1. A company program runs one or more cohorts/cycles.
2. Each cohort has intake, confirmation, and optional self-join.
3. Confirmed mentees attend a cohort plenary.
4. Mentees are grouped into Common Interest Circles of roughly 5-10 people.
5. Circle placement unlocks 1:1 mentor matching and later additional session requests.

The current enterprise frontend already has company program administration, employee program views, journey display, mentor matching, sessions, pulses, and reporting surfaces. The backend has `CompanyProgram`, `CompanyProgramParticipant`, journey templates, journey instances, mentor assignments, session booking, and reporting. It does not yet have first-class cohort, circle, plenary, self-join, or circle placement models.

## Goals

- Let one `CompanyProgram` support multiple cohorts/cycles, such as `G4G Nairobi - Q3 2026` and `G4G Nairobi - Q4 2026`.
- Let partner admins create and manage cohorts under an existing company program.
- Support roster upload and self-join intake for each cohort.
- Keep self-joined mentees pending until confirmed by an admin.
- Flag likely duplicates for admin resolution instead of silently merging or creating extra participants.
- Track plenary attendance as a gate before circle placement.
- Let admins form, adjust, and finalize Common Interest Circles.
- Assign facilitators to circles.
- Unlock 1:1 mentor matching after circle placement.
- Show employees a simple cohort status view: `Plenary`, `Circle`, `1:1`.
- Add cohort-level reporting for activation, circle formation, match completion, continuation, and feedback response.
- Reuse existing program, matching, journey, session, pulse, and reporting infrastructure where it fits.

## Non-Goals

- Do not replace company programs with cohorts.
- Do not force cohorts into the existing `CompanyProgramParticipant` unique program/profile model.
- Do not build a generic survey builder.
- Do not make feedback primarily web-form based; WhatsApp-first feedback remains the main product assumption.
- Do not make the employee experience an open marketplace browsing flow.
- Do not implement AI-based circle matching in the first version. Deterministic tag-based suggestions are sufficient.
- Do not require facilitator approval before a circle becomes active in the MVP.
- Do not support multiple simultaneous circle memberships for one mentee in the same cohort in the MVP.

## Approved Product Decisions

- `CompanyProgram` is the long-lived partner or employer program.
- `CompanyProgramCohort` is the repeatable delivery cycle under a company program.
- `CompanyProgramParticipant` remains the program-level relationship between a profile and a company program. `CompanyProgramCohortParticipant` is the cycle-specific relationship. When a user enters a cohort, the backend should link to an existing program-level participant or create one if policy allows.
- A mentee can participate in multiple cohorts under the same company program over time.
- Cohort membership is unique by `(company_program_cohort_id, profile_id)`.
- Circle capacity is configurable per cohort, with defaults of minimum 5 and maximum 10.
- Each cohort can enable or disable self-join.
- Self-joined mentees start as `PENDING` and must be confirmed before they can progress.
- One active circle membership per mentee per cohort is supported in the MVP.
- The backend must enforce circle capacity in a transaction to handle the last-slot race.
- Plenary attendance and circle placement are product gates that unlock matching and journey actions.
- Additional 1:1 session requests reuse existing session booking, balance, invoice, and payment behavior.

## Users And Roles

### Corporate Admin

The corporate admin creates cohorts under a company program, uploads or confirms mentees, resolves duplicates, reviews plenary attendance, forms circles, assigns facilitators, finalizes circles, starts matching, and reviews cohort reporting.

### Prosper Admin

The Prosper admin can support partner admins, inspect delivery state across companies, correct cohort setup issues, and intervene in duplicate, circle, facilitator, or matching problems.

### Employee Or Mentee

The mentee joins or is enrolled into a cohort, attends plenary, joins or is placed into a circle, sees their circle and facilitator, receives a 1:1 mentor match, books sessions, and requests additional sessions where available.

### Facilitator

The facilitator is assigned to a circle, can see the circle roster and session information, and can record lightweight notes or completion status if enabled for the program.

## Existing Codebase Plug-In Points

### Frontend

- Admin program workspace: `pages/app/admin/programs/[programId].vue`
- Admin program editor: `components/app/admin/CompanyProgramEditor.vue`
- Company program store: `store/modules/company-programs.ts`
- Company program requests: `http/requests/app/companyPrograms.ts`
- Employee program detail: `pages/app/employee/programs/[programId].vue`
- Employee journey overview: `pages/app/employee/journey.vue`
- Admin matching workspace: `pages/app/admin/matches.vue` and existing matching sections under the program detail page
- Admin reports: `pages/app/admin/reports/*`, `store/modules/reports.ts`, and `http/requests/app/reports.ts`
- Role navigation: `navigation/vertical/corporate-admin.ts` and `navigation/vertical/employee.ts`
- RBAC route rules: `types/auth.ts` and `utils/roleManager.ts`

### Backend

- Company program entity: `CompanyProgram`
- Current program participant entity: `CompanyProgramParticipant`
- Company program participant service/controller
- Company program journey service
- Journey instance service
- Mentor assignment and matching services
- Session booking services
- Report services and DTOs

## Product Surface

### Admin: Program Cohorts

The existing company program detail page should add a `Cohorts` entry point. From a company program, admins can:

- View all cohorts for that program.
- Create a cohort.
- Edit cohort setup.
- Open a cohort delivery workspace.
- See headline status for intake, plenary, circles, matching, and completion.

The company program remains the place for high-level program configuration, journey template defaults, matching defaults, billing context, and program-level reporting.

### Admin: Cohort Workspace

A cohort workspace should use these sections:

- `Setup`: cohort name, chapter/region, dates, self-join settings, join code, capacity settings, tags, linked plenary event, matching defaults.
- `Intake`: roster upload, manual add, self-join pending list, confirmation, rejection, duplicate resolution.
- `Plenary`: linked event details, registration count, attendance import or sync, attendance override, gate status.
- `Circles`: unplaced mentees, suggested groupings, circles, facilitator assignment, manual placement, reset suggestions, finalization.
- `Matching`: eligible mentees, blocked mentees with reason, mentor assignment workspace, match status.
- `Dashboard`: activation, circle formation, match completion, 1:1 continuation, feedback response, and delivery risks.

The prototype "Form circles" screen maps to the `Circles` section of this workspace. The prototype sidebar should not be copied into the product UI; enterprise navigation should remain role-specific.

### Employee: My Cohort And Circle

The employee program detail page should show the active cohort for that employee. The main surface should include:

- Cohort name, for example `G4G Nairobi - Q3 2026`.
- A compact stage indicator: `Plenary`, `Circle`, `1:1`.
- Plenary card with attendance status and event date.
- Circle card with circle name, facilitator, next circle session, and members or tags.
- 1:1 mentor card with match status, mentor name, next session, and additional session action if available.

If a user has no current cohort, the page shows either available company programs or a join-code entry point depending on company configuration.

## Data Model

### `company_program_cohorts`

Stores one delivery cycle under a company program.

Core fields:

- `id`
- `company_program_id`
- `name`
- `code`
- `chapter`
- `region`
- `status`
- `starts_at`
- `ends_at`
- `self_join_enabled`
- `self_join_code_hash`
- `self_join_expires_at`
- `self_join_capacity`
- `circle_min_size`
- `circle_max_size`
- `interest_tag_set`
- `plenary_event_type`
- `plenary_event_id`
- `matching_starts_after_circles_finalized`
- `created_by_user_id`
- `created_at`
- `updated_at`
- `version`

Status values:

- `DRAFT`
- `INTAKE_OPEN`
- `INTAKE_CLOSED`
- `PLENARY_SCHEDULED`
- `CIRCLES_FORMING`
- `CIRCLES_FINALIZED`
- `MATCHING`
- `ACTIVE`
- `COMPLETED`
- `CANCELLED`
- `ARCHIVED`

Plenary event type values:

- `SUMMIT_EVENT`
- `EXTERNAL_EVENT`
- `MANUAL_EVENT`

### `company_program_cohort_participants`

Stores a mentee's membership in one cohort.

Core fields:

- `id`
- `company_program_cohort_id`
- `profile_id`
- `company_program_participant_id`
- `source`
- `status`
- `first_name_snapshot`
- `last_name_snapshot`
- `email_snapshot`
- `phone_snapshot`
- `chapter`
- `region`
- `interest_tags`
- `self_join_request_id`
- `confirmed_by_user_id`
- `confirmed_at`
- `duplicate_status`
- `duplicate_candidate_profile_id`
- `created_at`
- `updated_at`
- `version`

Source values:

- `ROSTER_UPLOAD`
- `MANUAL_ADD`
- `SELF_JOIN`
- `ADMIN_TRANSFER`

Status values:

- `PENDING`
- `CONFIRMED`
- `PLENARY_ATTENDED`
- `PLACED_IN_CIRCLE`
- `ELIGIBLE_FOR_MATCHING`
- `MATCHED`
- `ACTIVE`
- `COMPLETED`
- `WITHDRAWN`
- `REJECTED`

Duplicate status values:

- `CLEAR`
- `POSSIBLE_DUPLICATE`
- `RESOLVED_EXISTING_PROFILE`
- `RESOLVED_NEW_PROFILE`

### `company_program_cohort_join_requests`

Stores self-join submissions before confirmation.

Core fields:

- `id`
- `company_program_cohort_id`
- `submitted_email`
- `submitted_phone`
- `submitted_first_name`
- `submitted_last_name`
- `submitted_chapter`
- `submitted_region`
- `submitted_interest_tags`
- `matched_profile_id`
- `status`
- `reviewed_by_user_id`
- `reviewed_at`
- `created_at`
- `updated_at`

Status values:

- `PENDING`
- `CONFIRMED`
- `REJECTED`
- `DUPLICATE_REVIEW`
- `EXPIRED`

### `company_program_cohort_plenary_attendance`

Stores attendance evidence for the cohort plenary.

Core fields:

- `id`
- `company_program_cohort_id`
- `cohort_participant_id`
- `attendance_source`
- `status`
- `attended_at`
- `recorded_by_user_id`
- `created_at`
- `updated_at`

Attendance source values:

- `SUMMIT_EVENT`
- `IMPORT`
- `ADMIN_OVERRIDE`

Status values:

- `REGISTERED`
- `ATTENDED`
- `ABSENT`
- `EXCUSED`

### `common_interest_circles`

Stores circles within a cohort.

Core fields:

- `id`
- `company_program_cohort_id`
- `name`
- `theme`
- `interest_tags`
- `facilitator_profile_id`
- `min_size`
- `max_size`
- `status`
- `next_session_at`
- `created_at`
- `updated_at`
- `version`

Status values:

- `DRAFT`
- `FORMING`
- `FINALIZED`
- `ACTIVE`
- `COMPLETED`
- `CANCELLED`

### `common_interest_circle_memberships`

Stores one mentee's placement in a circle.

Core fields:

- `id`
- `circle_id`
- `cohort_participant_id`
- `placement_source`
- `status`
- `placed_by_user_id`
- `placed_at`
- `created_at`
- `updated_at`

Placement source values:

- `SUGGESTED`
- `MENTEE_REQUESTED`
- `ADMIN_PLACED`
- `ADMIN_MOVED`

Status values:

- `PENDING_REQUEST`
- `PLACED`
- `REMOVED`
- `COMPLETED`

### `common_interest_circle_notes`

Stores facilitator or admin notes without becoming a general survey product.

Core fields:

- `id`
- `circle_id`
- `cohort_participant_id`
- `author_profile_id`
- `note_type`
- `body`
- `created_at`
- `updated_at`

Note type values:

- `FACILITATOR_NOTE`
- `COMPLETION_NOTE`
- `ADMIN_NOTE`

## Backend API Shape

Use company-program scoped endpoints for admin operations:

- `GET /v1/company-programs/{programId}/cohorts`
- `POST /v1/company-programs/{programId}/cohorts`
- `GET /v1/company-program-cohorts/{cohortId}`
- `PATCH /v1/company-program-cohorts/{cohortId}`
- `POST /v1/company-program-cohorts/{cohortId}/open-intake`
- `POST /v1/company-program-cohorts/{cohortId}/close-intake`
- `POST /v1/company-program-cohorts/{cohortId}/self-join-code`
- `GET /v1/company-program-cohorts/{cohortId}/participants`
- `POST /v1/company-program-cohorts/{cohortId}/participants`
- `POST /v1/company-program-cohorts/{cohortId}/participants/import-preview`
- `POST /v1/company-program-cohorts/{cohortId}/participants/import-confirm`
- `POST /v1/company-program-cohort-participants/{participantId}/confirm`
- `POST /v1/company-program-cohort-participants/{participantId}/reject`
- `POST /v1/company-program-cohort-participants/{participantId}/resolve-duplicate`
- `GET /v1/company-program-cohorts/{cohortId}/plenary`
- `POST /v1/company-program-cohorts/{cohortId}/plenary/link-event`
- `POST /v1/company-program-cohorts/{cohortId}/plenary/attendance/import`
- `POST /v1/company-program-cohort-participants/{participantId}/plenary-attendance`
- `GET /v1/company-program-cohorts/{cohortId}/circles`
- `POST /v1/company-program-cohorts/{cohortId}/circles`
- `PATCH /v1/common-interest-circles/{circleId}`
- `POST /v1/company-program-cohorts/{cohortId}/circle-suggestions`
- `POST /v1/common-interest-circles/{circleId}/members`
- `DELETE /v1/common-interest-circle-memberships/{membershipId}`
- `POST /v1/common-interest-circle-memberships/{membershipId}/move`
- `POST /v1/company-program-cohorts/{cohortId}/circles/finalize`
- `GET /v1/company-program-cohorts/{cohortId}/matching-workspace`
- `GET /v1/company-program-cohorts/{cohortId}/dashboard`

Use public or authenticated employee endpoints for self-join and employee views:

- `GET /v1/company-program-cohorts/join/{joinCode}`
- `POST /v1/company-program-cohorts/join/{joinCode}`
- `GET /v1/me/company-program-cohorts`
- `GET /v1/me/company-program-cohorts/{cohortId}`
- `GET /v1/me/company-program-cohorts/{cohortId}/circles`
- `POST /v1/me/company-program-cohorts/{cohortId}/circle-requests`

The join-code lookup endpoint must return only safe public data: company/program/cohort name, region/chapter, intake status, and allowed fields. It must not expose participant lists, circle rosters, admin notes, or private matching information.

## State And Gates

### Intake Gate

Roster and manual participants can become `CONFIRMED` after validation. Self-joined participants become `PENDING` first. Duplicate candidates remain blocked from progression until an admin resolves the duplicate state.

### Plenary Gate

A confirmed participant becomes eligible for circle placement after plenary attendance is recorded as `ATTENDED` or intentionally overridden by an admin policy action. The default gate is strict attendance.

### Circle Gate

Participants become eligible for 1:1 mentor matching after they have one active circle placement and the cohort circles are finalized. Moving a participant after finalization should recalculate their eligibility.

### Matching Gate

Existing mentor matching and assignment services should accept cohort context. The matching workspace must show blocked mentees with specific reasons:

- Pending confirmation
- Duplicate review
- Plenary not attended
- Not placed in a circle
- Circles not finalized
- Program inactive

### Journey Integration

The journey engine should not own circle business rules. Instead, cohort services expose gate status to journey and matching services. Employee journey cards can render cohort milestones as product stages while existing journey steps continue to drive booking, action item, reflection, and check-in behavior.

## Circle Suggestion Rules

The MVP suggestion service should be deterministic and inspectable:

- Group by strongest shared interest tags.
- Prefer configured circle size range.
- Keep chapter or region together when enough participants exist.
- Leave participants unplaced when a confident grouping cannot be made.
- Allow admins to reset suggestions before finalization.
- Store suggestion provenance so admins can distinguish suggested placement from admin moves.

No AI scoring is required for the first implementation.

## Permissions And Navigation

Add or reuse declarative permissions in the existing RBAC layer:

- `admin:programs` can view cohorts.
- A new permission such as `admin:program-cohorts` should gate cohort creation, intake, circle finalization, and cohort dashboard actions if finer control is needed.
- Employee routes should require the existing employee app access plus cohort membership.

Navigation changes:

- Corporate admin navigation should keep `Programs` as the primary entry point.
- The program detail page should add a `Cohorts` tab.
- Employee navigation should not add a marketplace-style entry. The cohort view should live under `My Programs` and `My Journey`.

## Reporting

Add cohort dashboard metrics first, then roll them into admin reports.

Core metrics:

- Enrolled count
- Self-joined count
- Pending confirmation count
- Duplicate review count
- Plenary attendance rate
- Circle formation rate
- Unplaced mentee count
- Matched mentee count
- Match completion rate
- Additional 1:1 request count
- Session continuation rate
- Pulse or feedback response rate

Risk indicators:

- Intake open but low confirmation
- Plenary complete but many absent
- Circle below minimum size
- Circle above capacity
- No facilitator assigned
- Circles not finalized
- Eligible mentees not matched
- Feedback window missed

## Error Handling

- Self-join with invalid or expired code returns a generic unavailable message.
- Self-join into a full cohort returns a clear capacity message.
- Duplicate candidates require admin resolution before confirmation.
- Circle placement into a full circle fails atomically.
- Finalizing circles fails if required circles have no facilitator or if configured minimum size rules are not met.
- Matching start explains blocked participant reasons instead of silently omitting users.
- Plenary attendance imports must produce row-level validation errors and avoid partial writes unless explicitly confirmed.

## Testing Strategy

### Backend

- Migration tests for cohort, participant, circle, membership, attendance, and unique constraints.
- Service tests for self-join, duplicate detection, confirmation, rejection, and capacity enforcement.
- Service tests for plenary gate, circle gate, and matching eligibility.
- Transaction test for two users attempting to take the last circle slot.
- API authorization tests for admin, Prosper admin, employee, and unauthenticated join-code lookup.
- Report aggregation tests for cohort dashboard metrics.

### Frontend

- Store tests for cohort list/detail, intake, circles, finalization, and employee cohort views.
- Component tests for admin cohort list, intake review, circle formation, and employee stage card.
- Route permission tests for admin cohort routes and employee membership views.
- Form validation tests for cohort setup, import preview, facilitator assignment, and circle finalization.

### End-To-End

- Admin creates a cohort under a program.
- Admin imports mentees and confirms them.
- Employee self-joins and remains pending until confirmed.
- Admin records plenary attendance.
- Admin forms and finalizes circles.
- Matching workspace unlocks eligible mentees.
- Employee sees plenary, circle, and 1:1 status.
- Employee requests an additional session after match.

## Phasing

### Phase 1: Cohort Foundation And Admin Delivery

- Add cohort, cohort participant, self-join, attendance, circle, membership, and dashboard backend models.
- Add admin cohort list/detail under company program detail.
- Add roster/manual participant intake and self-join review.
- Add plenary attendance import or override.
- Add circle formation and finalization.
- Add matching eligibility gates.

### Phase 2: Employee Cohort Experience

- Add employee active cohort view under My Programs.
- Add join-code flow.
- Add stage indicator and cohort cards for plenary, circle, and 1:1.
- Add circle request flow if the cohort allows employee circle choice.

### Phase 3: Reporting And Operational Polish

- Add cohort dashboard metrics.
- Extend admin reports with cohort-level filters and exports.
- Add facilitator notes and circle completion state.
- Improve risk indicators and operational alerts.

## Implementation Notes

- Follow the frontend request pattern: component -> Pinia store -> HTTP request module.
- Keep new cohort HTTP types separate from existing `CompanyProgramParticipant` types unless a shared DTO is intentionally introduced.
- Do not mutate existing employee program participant uniqueness. Cohort participants should be their own model.
- Prefer server-side eligibility and visibility enforcement over frontend filtering.
- Keep route additions aligned with `types/auth.ts`, `utils/roleManager.ts`, and role-specific navigation files.
- Existing dirty working tree changes must not be reverted or mixed into this feature branch.
