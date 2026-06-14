# B2C Session Pricing, Bundles, and Checkout Design

## Summary

ProsperMentor needs a configurable session commerce layer for B2C users and corporate employees who want to self-pay. The existing booking logic is entitlement-first: it checks subscriptions or company allocations before creating a session, derives pricing from mentor hourly rates, and marks payment separately after the session request exists. The new pricing strategy requires a product-catalog-first flow where Prosper owns the offer, price, duration, credit quantity, invoice snapshot, payment fulfillment, and session confirmation lifecycle.

The selected design is a configurable product catalog backed by the existing invoice/payment flow. The frontend reads active products from the backend, the backend creates invoices from server-side product configuration, and payment callbacks fulfill either a held single session or bundle credits. Corporate allocation remains available, but corporate employees can explicitly choose self-pay or personal bundle credits even when employer-funded allocation is available.

## Source Inputs

- Pricing specification PDF: `/Users/macbookpro/Downloads/Prosper_Mentor_Pricing Specifications (1).pdf`
- Pricing visual guide: `/Users/macbookpro/Pictures/Screenshots/Screenshot 2026-06-14 at 19.12.16.png`
- Backend repository: `/Users/macbookpro/IdeaProjects/ProsperMentor`
- Frontend repository: `/Users/macbookpro/WebstormProjects/myProsperV2`

## Goals

- Support B2C free trial, single-session payment, and paid session bundles.
- Reuse the existing invoice/payment flow for M-Pesa and card payments.
- Make prices, session duration, package size, labels, card badges, and visibility admin-configurable.
- Snapshot product terms on each invoice so historical purchases are stable after admin changes.
- Let corporate employees choose employer allocation, personal credits, or self-pay.
- Keep self-pay and bundle credits personal, not employer-billed.
- Show employee self-pay and bundle activity in company analytics where appropriate, without reducing company allocation or wallet balance.
- Preserve corporate/enterprise billing as a separate model.
- Keep frontend request flow aligned with the repo convention: component -> store -> http request.

## Non-Goals

- Replacing enterprise pricing, company wallets, or employer-funded allocation.
- Building a generic commerce platform with arbitrary tax, coupons, refunds, or promotion engines.
- Refunding paid sessions. The no-refund policy remains part of the checkout contract.
- Making the frontend the source of truth for price, duration, or credit quantity.

## Product Decisions Locked

- The new pricing model applies to B2C users and to corporate employees who self-pay.
- Corporate employees may choose self-pay even when employer-funded allocation is available.
- Bundles are part of this rollout, not only a coming-soon teaser.
- Existing invoice/payment infrastructure should be reused.
- Admin users must be able to update pricing, package size, duration, product labels, badges, feature lists, visibility, and active state.
- Admin changes apply to new checkouts only. Existing invoices, held sessions, and purchased credits keep the product snapshot captured at checkout time.
- Free trial remains no-payment and auto-assigned to an available mentor pool.

## Product Catalog

The backend should own a configurable product catalog. Initial seed values should follow the latest visual guide unless changed by admin before launch:

- `FREE_TRIAL`: 30-minute trial session, no payment.
- `SINGLE_SESSION`: KES 4,000, one configured-duration 1:1 session.
- `BUNDLE_SHORT`: KES 11,000, 3 session credits.
- `BUNDLE_MID`: KES 17,500, 5 session credits.
- `BUNDLE_LONG`: KES 33,000, 10 session credits.

All of these values are editable. The code should not assume that the mid-tier bundle is always 5 sessions or that the single paid session is always 45 or 60 minutes.

Recommended product fields:

- `sku`
- `product_type`: `FREE_TRIAL`, `SINGLE_SESSION`, `SESSION_BUNDLE`
- `audience`: `MENTEE`, `CORPORATE_EMPLOYEE`, `MENTOR`, `ENTERPRISE`
- `name`
- `subtitle`
- `currency`
- `price_amount`
- `credit_quantity`
- `session_duration_minutes`
- `trial_window_days`
- `slot_hold_minutes`
- `display_order`
- `badge_label`
- `badge_tone`
- `savings_label`
- `feature_items`
- `is_active`
- `is_visible`
- `no_refund_policy_version`
- `created_at`
- `updated_at`

## Invoice Snapshot

Every paid checkout must create an invoice using backend product configuration. The invoice or invoice line item should store a product snapshot:

- `product_sku`
- `product_type`
- `product_name`
- `currency`
- `price_amount`
- `credit_quantity`
- `session_duration_minutes`
- `slot_hold_minutes`
- `no_refund_policy_version`
- `funding_source`
- optional `session_id`

Payment callbacks must fulfill from the invoice snapshot, not from the current product catalog. This prevents admin edits from changing unpaid quoted invoices or already purchased bundle credits.

## Funding Sources

Booking should use an explicit funding source:

- `TRIAL`
- `EMPLOYER_ALLOCATION`
- `SELF_PAY`
- `BUNDLE_CREDIT`
- `ADMIN_CREDIT`

Corporate employees should see all valid choices. Employer allocation may be the default when available, but it should not be forced. A self-paid or bundle-credit session by a corporate employee remains personal commerce activity:

- it does not reduce employer allocation
- it is not billed to the employer
- it can appear in company analytics as employee participation
- it should be distinguishable from employer-funded sessions in reports

## Paid Single-Session Flow

1. User selects mentor, date, and time.
2. Frontend requests available funding sources for that slot.
3. User chooses `SELF_PAY`.
4. Backend validates the mentor slot and active `SINGLE_SESSION` product.
5. Backend creates a held session using the product snapshot duration.
6. Backend creates an invoice through the existing invoice/payment flow.
7. User pays through M-Pesa first or card second.
8. Payment callback marks the held session paid.
9. User completes the required pre-session questionnaire.
10. Backend confirms the session, creates calendar/meeting details, and sends notifications.
11. If payment is not completed before the hold expires, the session hold is cancelled and the slot is released.

The no-refund acceptance must be captured before invoice payment starts.

## Bundle Purchase Flow

1. User selects a bundle card.
2. Backend loads the active product by SKU.
3. Backend creates an invoice with the product snapshot.
4. User pays through M-Pesa or card.
5. Payment callback creates personal session credit transactions based on the invoice snapshot.
6. The user can book future sessions using `BUNDLE_CREDIT`.

Bundle credits must store or reference the purchased snapshot so duration and entitlement count are stable after later pricing edits.

## Bundle-Credit Booking Flow

1. User selects mentor, date, and time.
2. Frontend requests available funding sources.
3. User chooses `BUNDLE_CREDIT`.
4. Backend validates at least one available personal credit.
5. Backend consumes one credit atomically and creates the session using the credit snapshot duration.
6. User completes the pre-session questionnaire.
7. Backend confirms the session, creates calendar/meeting details, and sends notifications.

If confirmation fails after credit consumption, the backend must either roll back in the same transaction or write a compensating credit transaction.

## Free Trial Flow

1. New eligible mentee receives a trial entitlement at signup.
2. Existing eligible users can receive trial entitlement through admin bulk activation.
3. Trial entitlement tracks activation, expiration, booking, completion, cancellation, and usage state.
4. User starts trial from pricing page or dashboard banner.
5. Backend auto-assigns a mentor from the configured available trial mentor pool.
6. Backend creates a no-payment trial session using configured trial duration.
7. Trial cannot be repeated by deleting and recreating an account.

Recommended trial state fields:

- `trial_activated_at`
- `trial_expires_at`
- `trial_session_id`
- `trial_status`
- `trial_used`
- `has_been_offered_trial`
- identity history keyed by stable user identity and normalized email

## Cancellation And Credit Rules

- Mentee cancellation inside the allowed window does not create refund or credit.
- Mentee no-show does not create refund or credit.
- Mentor cancellation creates one personal session credit from the paid session snapshot.
- Mentor no-show creates one personal session credit from the paid session snapshot.
- Admin override can create or adjust personal credits.
- Credit creation must be idempotent per source session and reason.

The existing personal credit model can be extended, but the long-term model should be a credit ledger with transactions for purchases, consumption, mentor-cancelled credits, no-show credits, and admin adjustments.

## Summit Content And Upsells

Summit content access should be tied to trial and paid activity:

- active trial users can access summit content during the trial window
- paid users can access eligible content until `summit_date + configured_expiry_days`
- expired content should show an expired-state page instead of a 404

Upsell prompts should be configured by admin and logged:

- trial day 7 prompt
- trial day 20 prompt
- trial day 25 urgency prompt
- trial-completed prompt
- summit-access prompt
- expiry-screen prompt

Only one upsell prompt should be shown per login session. Impressions, clicks, and dismissals must be logged.

## Admin Surfaces

Backend admin APIs should support:

- list products
- create product
- update product
- toggle active/visible state
- preview pricing-page payload
- list invoice/product snapshots
- inspect credit balances and transactions
- adjust credits with audit reason
- manage upsell triggers

Frontend admin pages should use existing role/navigation conventions. Product management belongs under the admin settings/pricing area, not under marketplace mentor browsing.

## Frontend Surfaces

### Public Pricing

`/pricing` should show the tabbed structure from the visual guide:

- `Mentee`
- `Mentor`
- `Enterprise`

The mentee tab should be driven by backend product payloads:

- free trial CTA
- single-session card
- bundle cards
- labels, badges, savings text, features, price, and duration from config

### Booking

The mentor booking flow should add:

- funding-source selector
- employer allocation option when available
- bundle/personal credit option when available
- self-pay option using configured single-session price
- no-refund checkbox for paid checkout
- payment state and hold countdown
- questionnaire step before final confirmation

### Dashboard

The mentee dashboard should show:

- trial banner with countdown
- available personal credit balance
- incomplete questionnaire prompt for paid sessions
- upsell prompt when eligible

## Backend Integration Points

Current logic to change or extend:

- `SessionBookingService` should stop treating subscription eligibility as the only booking gate.
- `SubscriptionService` remains responsible for corporate/subscription entitlements.
- `InvoiceService` should create product-backed invoices for single sessions and bundles.
- `MpesaService` and card callback handling should delegate product fulfillment to a checkout/fulfillment service.
- `PersonalSessionCreditService` should support bundle credits, cancellation/no-show credits, and ledger-style transactions.
- `ScheduledTaskService` should release expired paid-session holds and expire trial entitlements.

## API Shape

Representative endpoints:

- `GET /api/v1/pricing/products?audience=MENTEE`
- `GET /api/v1/admin/pricing/products`
- `POST /api/v1/admin/pricing/products`
- `PATCH /api/v1/admin/pricing/products/{id}`
- `POST /api/v1/checkouts/session`
- `POST /api/v1/checkouts/bundle`
- `GET /api/v1/checkouts/{invoiceId}`
- `GET /api/v1/sessions/funding-options?mentorId=...&startTime=...`
- `POST /api/v1/sessions/{sessionId}/questionnaire`
- `POST /api/v1/trials/start`
- `GET /api/v1/session-credits/balance`
- `GET /api/v1/session-credits/transactions`

The exact route names can follow backend conventions during implementation, but the contract should remain product-backed and invoice-backed.

## Testing Strategy

Backend tests:

- product catalog CRUD and visibility rules
- invoice snapshot creation
- single-session payment success/failure/expiry
- bundle payment fulfillment
- credit consumption and idempotency
- corporate employee choosing self-pay despite employer allocation
- corporate employee using bundle credit
- no-refund acceptance required
- questionnaire required before confirmation
- mentor cancellation/no-show credit issuance
- trial activation, expiry, and no-repeat enforcement
- upsell trigger display and event logging

Frontend tests:

- pricing cards render from backend product config
- bundle labels/counts/durations are not hardcoded
- funding-source selector renders valid options
- self-pay path creates checkout
- bundle-credit path consumes credit flow
- no-refund checkbox gates paid checkout
- questionnaire gates final confirmation
- trial banner and pricing CTA route correctly

## Rollout Order

1. Add backend product catalog, invoice snapshot fields, and seeds.
2. Add checkout fulfillment service using the existing invoice/payment flow.
3. Add single-session self-pay hold and payment lifecycle.
4. Add session credit ledger and bundle purchase fulfillment.
5. Add bundle-credit booking.
6. Add trial entitlement lifecycle.
7. Update public pricing and booking frontend flows.
8. Add admin pricing and credit management screens.
9. Add summit content expiry and upsell prompts.
10. Run full backend and frontend regression tests.

## Risks

- Existing backend worktree has significant in-progress changes, so implementation must avoid overwriting unrelated work.
- The current booking flow consumes entitlements too early for paid checkout; this needs a careful lifecycle split.
- Slot concurrency must treat unexpired paid holds as unavailable.
- Payment callback idempotency is critical because M-Pesa/card callbacks may retry.
- Admin-configurable duration affects availability calculations, not just display.

## Acceptance Criteria

- Admin can update paid session price, duration, bundle credit count, bundle price, labels, badges, visibility, and active state.
- Pricing page reflects active backend configuration.
- Frontend never sends authoritative price, duration, or credit quantity.
- Single-session checkout creates an invoice from backend config and snapshots the terms.
- Payment success for single session does not confirm the booking until questionnaire completion.
- Expired unpaid holds release the mentor slot.
- Bundle purchase creates personal credits from the invoice snapshot.
- Bundle-credit booking consumes one personal credit and does not charge the user.
- Corporate employees can choose self-pay even when employer allocation is available.
- Corporate employee self-pay and bundle-credit sessions do not reduce employer allocation.
- Mentor cancellation/no-show creates one personal credit idempotently.
- Existing invoices and purchased credits are not mutated by later admin pricing edits.
