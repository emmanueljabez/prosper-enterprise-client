# B2C Session Pricing Checkout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship configurable B2C session pricing, single-session checkout, bundle checkout, free trials, and corporate employee self-pay using the existing invoice/payment flow.

**Architecture:** Add a backend session-commerce product catalog as the source of truth for public pricing, admin pricing edits, invoice creation, and fulfillment. Paid checkouts create invoices with immutable product snapshots; payment callbacks fulfill either a held session or personal bundle credits; session confirmation waits for the questionnaire. Frontend pages and stores consume backend product/funding APIs through the existing component -> store -> http request pattern.

**Tech Stack:** Spring Boot 3.5, Java 17, JPA/Hibernate, Flyway, PostgreSQL, JUnit 5, Mockito, Nuxt 3, Vue 3, TypeScript, Pinia, Tailwind, shadcn-nuxt, existing M-Pesa/card invoice payment pages.

---

## Scope Check

This feature spans several subsystems. Implement it in the order below so each slice is testable before the next one starts:

1. Backend product catalog and invoice snapshots.
2. Backend paid session checkout and payment fulfillment.
3. Backend bundle credits and credit-funded booking.
4. Backend trial, summit, and upsell support.
5. Frontend public pricing, booking checkout, dashboard prompts, and admin pricing screens.

The backend repository currently has substantial uncommitted work on `codex/public-corporate-pricing-signup`, including the invoice/payment flow this plan depends on. Do not reset, checkout, or overwrite those files. Either implement on top of that branch with narrow staged commits, or ask the owner to first commit/integrate the existing backend WIP.

## File Structure

### Backend: `/Users/macbookpro/IdeaProjects/ProsperMentor`

- Create: `src/main/resources/db/migration/V65__Create_session_commerce_products.sql`
  - Product catalog table and default B2C pricing seeds.
- Create: `src/main/resources/db/migration/V66__Add_session_checkout_fields.sql`
  - Session funding, hold, product snapshot, questionnaire, and policy fields.
- Create: `src/main/resources/db/migration/V67__Extend_personal_session_credits_for_bundles.sql`
  - Bundle/admin/cancellation credit reasons, snapshot fields, and credit transaction ledger.
- Create: `src/main/resources/db/migration/V68__Create_mentee_trial_entitlements.sql`
  - Trial identity, status, activation, expiry, and session linkage.
- Create: `src/main/resources/db/migration/V69__Create_upsell_and_summit_tables.sql`
  - Upsell triggers/events and summit content expiry tables.
- Create: `src/main/java/com/prosper/prospermentor/entity/SessionCommerceProduct.java`
  - Configurable product catalog entity.
- Create: `src/main/java/com/prosper/prospermentor/entity/SessionCreditTransaction.java`
  - Credit ledger entity for purchase, consumption, cancellation/no-show, and admin adjustments.
- Create: `src/main/java/com/prosper/prospermentor/entity/MenteeTrialEntitlement.java`
  - Trial entitlement entity.
- Create: `src/main/java/com/prosper/prospermentor/entity/UpsellTrigger.java`
  - Admin-configurable upsell trigger entity.
- Create: `src/main/java/com/prosper/prospermentor/entity/UpsellPromptEvent.java`
  - Impression/click/dismissal log.
- Create: `src/main/java/com/prosper/prospermentor/entity/SummitContent.java`
  - Summit content expiry model.
- Create repositories for each new entity under `src/main/java/com/prosper/prospermentor/repository/`.
- Create: `src/main/java/com/prosper/prospermentor/dto/SessionCommerceDtos.java`
  - Product, funding, checkout, questionnaire, credit, trial, upsell, and summit DTOs.
- Create: `src/main/java/com/prosper/prospermentor/service/SessionCommerceProductService.java`
  - Product catalog reads/admin updates and pricing-page payload.
- Create: `src/main/java/com/prosper/prospermentor/service/SessionCheckoutService.java`
  - Single-session checkout, bundle checkout, invoice snapshot creation, hold release, and questionnaire confirmation.
- Create: `src/main/java/com/prosper/prospermentor/service/SessionCommerceFulfillmentService.java`
  - Invoice callback fulfillment for single sessions and bundles.
- Create: `src/main/java/com/prosper/prospermentor/service/TrialEntitlementService.java`
  - Trial activation, no-repeat enforcement, mentor assignment, expiry, and trial booking.
- Create: `src/main/java/com/prosper/prospermentor/service/UpsellPromptService.java`
  - Trigger resolution and event logging.
- Create: `src/main/java/com/prosper/prospermentor/service/SummitContentService.java`
  - Content access and expiry payloads.
- Create: `src/main/java/com/prosper/prospermentor/controller/PricingProductController.java`
  - Public active pricing products.
- Create: `src/main/java/com/prosper/prospermentor/controller/AdminPricingProductController.java`
  - Admin product management APIs.
- Create: `src/main/java/com/prosper/prospermentor/controller/SessionCheckoutController.java`
  - Self-pay, bundle, funding, questionnaire, and credit endpoints.
- Create: `src/main/java/com/prosper/prospermentor/controller/TrialController.java`
  - Trial status/start endpoints.
- Create: `src/main/java/com/prosper/prospermentor/controller/UpsellPromptController.java`
  - Prompt resolution and event logging.
- Create: `src/main/java/com/prosper/prospermentor/controller/SummitContentController.java`
  - Eligible content list and expired-state payload.
- Modify: `src/main/java/com/prosper/prospermentor/entity/Session.java`
  - Add funding source, invoice linkage, hold, product snapshot, no-refund, and questionnaire fields.
- Modify: `src/main/java/com/prosper/prospermentor/entity/PersonalSessionCredit.java`
  - Add bundle/cancellation/admin reasons and purchased snapshot fields.
- Modify: `src/main/java/com/prosper/prospermentor/entity/Invoice.java`
  - Keep product snapshot in `metadata`; no table column is required unless implementation reveals a query bottleneck.
- Modify: `src/main/java/com/prosper/prospermentor/service/InvoiceService.java`
  - Preserve metadata in public payload and expose invoice status for checkout polling.
- Modify: `src/main/java/com/prosper/prospermentor/service/MpesaService.java`
  - Delegate invoice contexts `SESSION_SINGLE_CHECKOUT` and `SESSION_BUNDLE_PURCHASE` to fulfillment service.
- Modify: `src/main/java/com/prosper/prospermentor/service/PersonalSessionCreditService.java`
  - Issue bundle/admin/mentor-cancelled/no-show credits and consume credit snapshots atomically.
- Modify: `src/main/java/com/prosper/prospermentor/service/SessionBookingService.java`
  - Support explicit funding sources and stop using subscription eligibility as the only gate.
- Modify: `src/main/java/com/prosper/prospermentor/service/ScheduledTaskService.java`
  - Release expired holds, expire trials, and run upsell evaluation.
- Modify: `src/main/java/com/prosper/prospermentor/config/SecurityConfig.java`
  - Permit public pricing/trial reads and keep admin pricing endpoints protected.

### Frontend: `/Users/macbookpro/WebstormProjects/myProsperV2`

- Create: `types/session-commerce.ts`
  - Shared product, checkout, funding, credit, trial, upsell, and summit types.
- Create: `http/requests/app/sessionCommerce.ts`
  - Pricing, checkout, funding, credit, trial, upsell, and summit API requests.
- Create: `store/modules/session-commerce.ts`
  - Pinia store for pricing products, checkout state, funding options, credits, trial, upsells, and admin product updates.
- Create: `components/pricing/MenteePricingCards.vue`
  - Product-driven pricing cards matching the supplied visual guide.
- Create: `components/ui/mentors/FundingSourceSelector.vue`
  - Employer allocation, personal credit, and self-pay selector.
- Create: `components/ui/mentors/CheckoutHoldPanel.vue`
  - Hold countdown and invoice payment CTA/status.
- Create: `components/ui/mentors/SessionQuestionnaireDialog.vue`
  - Required questionnaire before confirmation.
- Create: `components/app/admin/settings/SessionPricingSettings.vue`
  - Admin product editor.
- Create: `components/app/admin/settings/UpsellTriggerSettings.vue`
  - Admin upsell trigger editor.
- Modify: `pages/pricing.vue`
  - Replace corporate-only plan display with tabbed Mentee/Mentor/Enterprise pricing driven by product payload.
- Modify: `pages/app/mentors/[id].vue`
  - Replace subscription-required retry flow with explicit funding-source and checkout flows.
- Modify: `components/ui/mentors/MentorAvailabilityCalendar.vue`
  - Emit funding-aware booking details and render payment-aware labels.
- Modify: `store/modules/sessions/sessions.ts`
  - Add questionnaire submit and funding-aware booking calls.
- Modify: `http/requests/app/sessions/sessions.ts`
  - Add funding options, credit booking, and questionnaire endpoints.
- Modify: `pages/payment/invoice/[token].vue`
  - Preserve support for existing invoices and add session/bundle return handling.
- Modify: `pages/app/dashboard/index.vue`
  - Add trial banner, credit balance, questionnaire prompt, and upsell prompt.
- Modify: `pages/app/admin/settings/index.vue`
  - Add pricing and upsell tabs.
- Modify: `types/auth.ts` and `utils/roleManager.ts`
  - Add or confirm `admin:settings` access for pricing management.
- Modify: `navigation/vertical/corporate-admin.ts`
  - Keep admin pricing under Settings, not marketplace mentor navigation.

---

### Task 0: Baseline And Worktree Safety

**Files:**
- Inspect only: backend and frontend git state.

- [ ] **Step 1: Confirm current frontend state**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
git status --short --branch
```

Expected: frontend may be ahead with the approved spec commit; no unrelated modified files should be staged for implementation.

- [ ] **Step 2: Confirm current backend state**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
git status --short --branch
```

Expected: backend shows existing WIP on `codex/public-corporate-pricing-signup`. Continue only after deciding to work on top of this branch or after the owner commits/integrates that WIP.

- [ ] **Step 3: Record the backend dependency on existing invoice work**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
test -f src/main/java/com/prosper/prospermentor/service/InvoiceService.java
test -f src/main/java/com/prosper/prospermentor/controller/InvoiceController.java
test -f src/main/java/com/prosper/prospermentor/entity/Invoice.java
```

Expected: all commands exit `0`. If any file is missing, pause implementation and restore the invoice/payment work first.

---

### Task 1: Backend Product Catalog

**Files:**
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/resources/db/migration/V65__Create_session_commerce_products.sql`
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/entity/SessionCommerceProduct.java`
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/repository/SessionCommerceProductRepository.java`
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/SessionCommerceDtos.java`
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/SessionCommerceProductService.java`
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/controller/PricingProductController.java`
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/controller/AdminPricingProductController.java`
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/config/SecurityConfig.java`
- Test: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/SessionCommerceProductServiceTest.java`

- [ ] **Step 1: Write product catalog tests**

Create tests covering:

```java
@Test
void listPublicProducts_shouldReturnVisibleActiveMenteeProductsInDisplayOrder()

@Test
void updateProduct_shouldPersistConfigurablePriceDurationCreditsAndBadges()

@Test
void getRequiredActiveProduct_shouldRejectHiddenInactiveOrMissingProduct()
```

Expected assertions:

```java
assertThat(products).extracting(SessionCommerceProduct::getSku)
    .containsExactly("FREE_TRIAL", "SINGLE_SESSION", "BUNDLE_SHORT", "BUNDLE_MID", "BUNDLE_LONG");
assertThat(updated.getPriceAmount()).isEqualByComparingTo("17500.00");
assertThat(updated.getCreditQuantity()).isEqualTo(5);
assertThat(updated.getSessionDurationMinutes()).isEqualTo(45);
```

- [ ] **Step 2: Run the failing product catalog tests**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests com.prosper.prospermentor.service.SessionCommerceProductServiceTest
```

Expected: FAIL because the product entity/service do not exist.

- [ ] **Step 3: Add the product catalog migration**

Create `session_commerce_products` with:

```sql
CREATE TABLE IF NOT EXISTS session_commerce_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(80) NOT NULL UNIQUE,
    product_type VARCHAR(40) NOT NULL,
    audience VARCHAR(40) NOT NULL,
    name VARCHAR(160) NOT NULL,
    subtitle VARCHAR(255),
    currency VARCHAR(3) NOT NULL DEFAULT 'KES',
    price_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    credit_quantity INTEGER NOT NULL DEFAULT 0,
    session_duration_minutes INTEGER,
    trial_window_days INTEGER,
    slot_hold_minutes INTEGER NOT NULL DEFAULT 15,
    display_order INTEGER NOT NULL DEFAULT 0,
    badge_label VARCHAR(80),
    badge_tone VARCHAR(40),
    savings_label VARCHAR(80),
    feature_items TEXT,
    no_refund_policy_version VARCHAR(80),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_session_commerce_product_type CHECK (product_type IN ('FREE_TRIAL', 'SINGLE_SESSION', 'SESSION_BUNDLE')),
    CONSTRAINT chk_session_commerce_product_audience CHECK (audience IN ('MENTEE', 'CORPORATE_EMPLOYEE', 'MENTOR', 'ENTERPRISE')),
    CONSTRAINT chk_session_commerce_product_amount CHECK (price_amount >= 0),
    CONSTRAINT chk_session_commerce_product_credit_quantity CHECK (credit_quantity >= 0)
);
```

Seed the initial values:

```sql
INSERT INTO session_commerce_products (
    sku, product_type, audience, name, subtitle, currency, price_amount,
    credit_quantity, session_duration_minutes, trial_window_days, slot_hold_minutes,
    display_order, badge_label, savings_label, feature_items, no_refund_policy_version
) VALUES
('FREE_TRIAL', 'FREE_TRIAL', 'MENTEE', 'Try Prosper 30 Minutes', '30 Min 1:1 Session With An Available Mentor', 'KES', 0, 1, 30, 30, 15, 0, NULL, NULL, '[]', 'trial-v1'),
('SINGLE_SESSION', 'SINGLE_SESSION', 'MENTEE', 'Single Session', '1 one-on-one session', 'KES', 4000, 1, 45, NULL, 15, 1, 'JUMPSTART', NULL, '["45-minute focused call","Immediate session notes","Direct chat (24h)"]', 'no-refund-v1'),
('BUNDLE_SHORT', 'SESSION_BUNDLE', 'MENTEE', '3-Session Pack', 'Structured guidance', 'KES', 11000, 3, 45, NULL, 15, 2, 'MOST POPULAR', 'SAVE KES 1,000', '["Milestone planning","Document reviews","Priority booking"]', 'no-refund-v1'),
('BUNDLE_MID', 'SESSION_BUNDLE', 'MENTEE', '5-Session Pack', 'Consistent growth path', 'KES', 17500, 5, 45, NULL, 15, 3, 'ACCOUNTABILITY', 'SAVE KES 2,500', '["Monthly career audits","Long-term goal setting","Priority scheduling"]', 'no-refund-v1'),
('BUNDLE_LONG', 'SESSION_BUNDLE', 'MENTEE', '10-Session Pack', 'Maximized commitment', 'KES', 33000, 10, 45, NULL, 15, 4, 'BEST VALUE', 'SAVE KES 7,000', '["Unlimited chat support","Personalized roadmap","Intro to network"]', 'no-refund-v1')
ON CONFLICT (sku) DO NOTHING;
```

- [ ] **Step 4: Implement entity, repository, service, and controllers**

Required service methods:

```java
List<SessionCommerceProduct> listPublicProducts(SessionCommerceProduct.Audience audience);
SessionCommerceProduct getRequiredActiveProduct(String sku);
SessionCommerceProduct updateProduct(UUID productId, UpdateProductRequest request);
Map<String, Object> buildPricingPagePayload(SessionCommerceProduct.Audience audience);
```

Required public endpoint:

```text
GET /api/v1/pricing/products?audience=MENTEE
```

Required admin endpoints:

```text
GET /api/v1/admin/pricing/products
PATCH /api/v1/admin/pricing/products/{id}
```

- [ ] **Step 5: Run product tests**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests com.prosper.prospermentor.service.SessionCommerceProductServiceTest
```

Expected: PASS.

- [ ] **Step 6: Commit product catalog slice**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
git add src/main/resources/db/migration/V65__Create_session_commerce_products.sql \
  src/main/java/com/prosper/prospermentor/entity/SessionCommerceProduct.java \
  src/main/java/com/prosper/prospermentor/repository/SessionCommerceProductRepository.java \
  src/main/java/com/prosper/prospermentor/dto/SessionCommerceDtos.java \
  src/main/java/com/prosper/prospermentor/service/SessionCommerceProductService.java \
  src/main/java/com/prosper/prospermentor/controller/PricingProductController.java \
  src/main/java/com/prosper/prospermentor/controller/AdminPricingProductController.java \
  src/main/java/com/prosper/prospermentor/config/SecurityConfig.java \
  src/test/java/com/prosper/prospermentor/service/SessionCommerceProductServiceTest.java
git commit -m "feat: add configurable session product catalog"
```

Expected: only product-catalog files are staged.

---

### Task 2: Backend Invoice Snapshots And Fulfillment Hook

**Files:**
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/SessionCommerceFulfillmentService.java`
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/InvoiceService.java`
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/MpesaService.java`
- Test: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/SessionCommerceFulfillmentServiceTest.java`
- Test: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/MpesaServiceSessionCommerceInvoiceTest.java`

- [ ] **Step 1: Write invoice snapshot tests**

Create tests covering:

```java
@Test
void buildProductSnapshot_shouldFreezeCatalogValuesForInvoiceMetadata()

@Test
void fulfillPaidInvoice_shouldCallSingleSessionFulfillmentForSingleSessionContext()

@Test
void fulfillPaidInvoice_shouldCallBundleFulfillmentForBundleContext()

@Test
void fulfillPaidInvoice_shouldBeIdempotentWhenInvoiceAlreadyFulfilled()
```

Required invoice metadata shape:

```json
{
  "invoiceContext": "SESSION_SINGLE_CHECKOUT",
  "productSnapshot": {
    "sku": "SINGLE_SESSION",
    "productType": "SINGLE_SESSION",
    "name": "Single Session",
    "currency": "KES",
    "priceAmount": 4000,
    "creditQuantity": 1,
    "sessionDurationMinutes": 45,
    "slotHoldMinutes": 15,
    "noRefundPolicyVersion": "no-refund-v1"
  },
  "sessionId": "00000000-0000-0000-0000-000000000000",
  "fundingSource": "SELF_PAY",
  "fulfilled": false
}
```

- [ ] **Step 2: Run failing fulfillment tests**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests com.prosper.prospermentor.service.SessionCommerceFulfillmentServiceTest \
  --tests com.prosper.prospermentor.service.MpesaServiceSessionCommerceInvoiceTest
```

Expected: FAIL because fulfillment service and contexts are missing.

- [ ] **Step 3: Implement fulfillment service contract**

Required methods:

```java
void fulfillPaidInvoice(Invoice invoice, Payment payment);
ProductSnapshot readSnapshot(Invoice invoice);
Map<String, Object> buildSingleSessionInvoiceMetadata(Session session, SessionCommerceProduct product);
Map<String, Object> buildBundleInvoiceMetadata(UUID userId, SessionCommerceProduct product);
```

Required context behavior:

```text
SESSION_SINGLE_CHECKOUT -> mark held session paid and awaiting questionnaire
SESSION_BUNDLE_PURCHASE -> create available personal credits from product snapshot
```

Store fulfillment markers inside invoice metadata:

```json
{
  "fulfilled": true,
  "fulfilledAt": "2026-06-14T19:30:00",
  "fulfillmentPaymentId": "..."
}
```

- [ ] **Step 4: Wire M-Pesa invoice callback**

In `MpesaService.applyInvoiceBusinessActions`, add contexts:

```java
if ("SESSION_SINGLE_CHECKOUT".equals(normalizedContext)
        || "SESSION_BUNDLE_PURCHASE".equals(normalizedContext)) {
    sessionCommerceFulfillmentService.fulfillPaidInvoice(invoice, payment);
    return;
}
```

Preserve existing plan, add-on, renewal, and company subscription fulfillment paths.

- [ ] **Step 5: Run invoice/fulfillment tests**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests com.prosper.prospermentor.service.SessionCommerceFulfillmentServiceTest \
  --tests com.prosper.prospermentor.service.MpesaServiceSessionCommerceInvoiceTest \
  --tests com.prosper.prospermentor.service.InvoiceServiceRedirectNormalizationTest
```

Expected: PASS.

- [ ] **Step 6: Commit invoice fulfillment slice**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
git add src/main/java/com/prosper/prospermentor/service/SessionCommerceFulfillmentService.java \
  src/main/java/com/prosper/prospermentor/service/InvoiceService.java \
  src/main/java/com/prosper/prospermentor/service/MpesaService.java \
  src/test/java/com/prosper/prospermentor/service/SessionCommerceFulfillmentServiceTest.java \
  src/test/java/com/prosper/prospermentor/service/MpesaServiceSessionCommerceInvoiceTest.java
git commit -m "feat: fulfill session commerce invoices"
```

---

### Task 3: Backend Paid Session Checkout

**Files:**
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/resources/db/migration/V66__Add_session_checkout_fields.sql`
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/SessionCheckoutService.java`
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/controller/SessionCheckoutController.java`
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/entity/Session.java`
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/repository/SessionRepository.java`
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/ScheduledTaskService.java`
- Test: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/SessionCheckoutServiceTest.java`

- [ ] **Step 1: Write checkout lifecycle tests**

Create tests covering:

```java
@Test
void createSingleSessionCheckout_shouldCreateHeldSessionAndInvoiceFromProductSnapshot()

@Test
void createSingleSessionCheckout_shouldRejectWhenNoRefundAcceptanceIsMissing()

@Test
void createSingleSessionCheckout_shouldRejectWhenSlotIsBlockedByActiveHold()

@Test
void markSingleSessionPaid_shouldRequireQuestionnaireBeforeConfirmation()

@Test
void submitQuestionnaire_shouldConfirmPaidSessionAndSendNotifications()

@Test
void releaseExpiredHolds_shouldCancelUnpaidHeldSessions()
```

Required assertions:

```java
assertThat(session.getFundingSource()).isEqualTo(Session.FundingSource.SELF_PAY);
assertThat(session.getPaymentStatus()).isEqualTo(Session.PaymentStatus.PENDING);
assertThat(session.getQuestionnaireStatus()).isEqualTo(Session.QuestionnaireStatus.REQUIRED);
assertThat(session.getHoldExpiresAt()).isAfter(LocalDateTime.now());
assertThat(invoice.getAmount()).isEqualByComparingTo("4000.00");
```

- [ ] **Step 2: Run failing checkout tests**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests com.prosper.prospermentor.service.SessionCheckoutServiceTest
```

Expected: FAIL because checkout fields and service are missing.

- [ ] **Step 3: Add session checkout migration**

Add fields to `sessions`:

```sql
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS funding_source VARCHAR(40);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS checkout_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS product_sku VARCHAR(80);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS product_snapshot TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS hold_expires_at TIMESTAMP;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS no_refund_accepted_at TIMESTAMP;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS no_refund_policy_version VARCHAR(80);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS questionnaire_status VARCHAR(40);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS questionnaire_submitted_at TIMESTAMP;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS questionnaire_payload TEXT;

CREATE INDEX IF NOT EXISTS idx_sessions_checkout_invoice_id ON sessions(checkout_invoice_id);
CREATE INDEX IF NOT EXISTS idx_sessions_hold_expiry ON sessions(status, payment_status, hold_expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_funding_source ON sessions(funding_source);
```

Allowed `funding_source` values:

```text
TRIAL
EMPLOYER_ALLOCATION
SELF_PAY
BUNDLE_CREDIT
ADMIN_CREDIT
```

Allowed `questionnaire_status` values:

```text
NOT_REQUIRED
REQUIRED
SUBMITTED
```

- [ ] **Step 4: Implement session checkout service**

Required methods:

```java
CheckoutResponse createSingleSessionCheckout(CreateSingleSessionCheckoutRequest request);
Session markSingleSessionPaid(UUID sessionId, UUID invoiceId, UUID paymentId);
Session submitQuestionnaire(UUID sessionId, SubmitQuestionnaireRequest request);
int releaseExpiredHolds(LocalDateTime now);
```

`createSingleSessionCheckout` must:

```text
read active SINGLE_SESSION product
validate noRefundAccepted == true
compute scheduled end from product.sessionDurationMinutes
validate mentor slot using duration
create PENDING session with SELF_PAY funding source
set hold_expires_at = now + product.slotHoldMinutes
create invoice with SESSION_SINGLE_CHECKOUT metadata snapshot
set session.checkout_invoice_id after invoice creation
return sessionId, invoicePublicToken, paymentUrl, holdExpiresAt
```

`submitQuestionnaire` must:

```text
require paymentStatus == PAID
require fundingSource in SELF_PAY, BUNDLE_CREDIT, ADMIN_CREDIT, TRIAL, EMPLOYER_ALLOCATION
save questionnaire payload
set questionnaireStatus = SUBMITTED
confirm session and send calendar/meeting/notifications through existing confirmation path
```

- [ ] **Step 5: Add checkout endpoints**

Required endpoints:

```text
POST /api/v1/checkouts/session
GET /api/v1/checkouts/{invoiceId}
POST /api/v1/sessions/{sessionId}/questionnaire
```

The self-pay request must accept:

```json
{
  "mentorId": "...",
  "menteeId": "...",
  "skillId": "...",
  "scheduledStart": "2026-06-14T20:00:00+03:00",
  "meetingPlatform": "GOOGLE_MEET",
  "menteeMessage": "I want help planning my next career move.",
  "noRefundAccepted": true,
  "redirectSuccessUrl": "https://enterprise.prospermentor.com/app/mentors/{mentorId}?invoice_paid=1",
  "redirectCancelUrl": "https://enterprise.prospermentor.com/app/mentors/{mentorId}?invoice_cancelled=1"
}
```

- [ ] **Step 6: Run checkout tests**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests com.prosper.prospermentor.service.SessionCheckoutServiceTest \
  --tests com.prosper.prospermentor.service.SessionCommerceFulfillmentServiceTest
```

Expected: PASS.

- [ ] **Step 7: Commit checkout slice**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
git add src/main/resources/db/migration/V66__Add_session_checkout_fields.sql \
  src/main/java/com/prosper/prospermentor/entity/Session.java \
  src/main/java/com/prosper/prospermentor/repository/SessionRepository.java \
  src/main/java/com/prosper/prospermentor/service/SessionCheckoutService.java \
  src/main/java/com/prosper/prospermentor/service/ScheduledTaskService.java \
  src/main/java/com/prosper/prospermentor/controller/SessionCheckoutController.java \
  src/test/java/com/prosper/prospermentor/service/SessionCheckoutServiceTest.java
git commit -m "feat: add paid session checkout lifecycle"
```

---

### Task 4: Backend Bundle Credits And Credit Booking

**Files:**
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/resources/db/migration/V67__Extend_personal_session_credits_for_bundles.sql`
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/entity/SessionCreditTransaction.java`
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/repository/SessionCreditTransactionRepository.java`
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/entity/PersonalSessionCredit.java`
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/repository/PersonalSessionCreditRepository.java`
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/PersonalSessionCreditService.java`
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/SessionCheckoutService.java`
- Test: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/PersonalSessionCreditServiceBundleTest.java`

- [ ] **Step 1: Write bundle and credit tests**

Create tests covering:

```java
@Test
void fulfillBundleInvoice_shouldCreateOneAvailableCreditPerPurchasedCreditQuantity()

@Test
void fulfillBundleInvoice_shouldBeIdempotentForSameInvoiceAndPayment()

@Test
void createCreditFundedBooking_shouldConsumeOldestAvailableCreditAndUseCreditDuration()

@Test
void corporateEmployeeCreditBooking_shouldNotConsumeEmployerAllocation()

@Test
void mentorCancellation_shouldIssueOneIdempotentCreditFromOriginalSessionSnapshot()
```

Required assertions:

```java
assertThat(credits).hasSize(5);
assertThat(credits).allMatch(credit -> credit.getDurationMinutes() == 45);
assertThat(session.getFundingSource()).isEqualTo(Session.FundingSource.BUNDLE_CREDIT);
assertThat(session.getPaymentStatus()).isEqualTo(Session.PaymentStatus.PAID);
assertThat(session.getCorporateAllocationId()).isNull();
```

- [ ] **Step 2: Run failing credit tests**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests com.prosper.prospermentor.service.PersonalSessionCreditServiceBundleTest
```

Expected: FAIL because bundle credit reasons and snapshot fields are missing.

- [ ] **Step 3: Add credit migration**

Extend `personal_session_credits`:

```sql
ALTER TABLE personal_session_credits ADD COLUMN IF NOT EXISTS source_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL;
ALTER TABLE personal_session_credits ADD COLUMN IF NOT EXISTS source_product_sku VARCHAR(80);
ALTER TABLE personal_session_credits ADD COLUMN IF NOT EXISTS source_product_snapshot TEXT;
ALTER TABLE personal_session_credits ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
ALTER TABLE personal_session_credits ADD COLUMN IF NOT EXISTS credit_sequence INTEGER;

ALTER TABLE personal_session_credits DROP CONSTRAINT IF EXISTS chk_personal_session_credits_reason;
ALTER TABLE personal_session_credits ADD CONSTRAINT chk_personal_session_credits_reason CHECK (
    credit_reason IN (
        'MENTOR_DECLINED_PAID_BOOKING',
        'BUNDLE_PURCHASE',
        'MENTOR_CANCELLED',
        'MENTOR_NO_SHOW',
        'ADMIN_ADJUSTMENT'
    )
);
```

Create ledger:

```sql
CREATE TABLE IF NOT EXISTS session_credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    credit_id UUID REFERENCES personal_session_credits(id) ON DELETE SET NULL,
    source_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    source_session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    consumed_session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    transaction_type VARCHAR(40) NOT NULL,
    quantity_delta INTEGER NOT NULL,
    reason VARCHAR(80) NOT NULL,
    product_snapshot TEXT,
    notes VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_session_credit_transaction_type CHECK (
        transaction_type IN ('GRANT', 'CONSUME', 'RETURN', 'ADJUST')
    )
);
```

- [ ] **Step 4: Implement bundle purchase and credit booking**

Required methods:

```java
List<PersonalSessionCredit> issueBundleCredits(UUID profileId, Invoice invoice, Payment payment, ProductSnapshot snapshot);
PersonalSessionCredit consumeNextAvailableCredit(UUID profileId, UUID consumedSessionId);
CheckoutResponse createBundleCheckout(CreateBundleCheckoutRequest request);
Session createCreditFundedBooking(CreateCreditBookingRequest request);
```

`createBundleCheckout` must create an invoice with:

```text
invoiceContext = SESSION_BUNDLE_PURCHASE
productSnapshot.creditQuantity = configured package size
productSnapshot.sessionDurationMinutes = configured duration
```

`createCreditFundedBooking` must:

```text
consume one personal credit atomically
create session with BUNDLE_CREDIT or ADMIN_CREDIT funding source
set paid = true and paymentStatus = PAID
set questionnaireStatus = REQUIRED
not consume corporate allocation
```

- [ ] **Step 5: Run credit tests**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests com.prosper.prospermentor.service.PersonalSessionCreditServiceBundleTest \
  --tests com.prosper.prospermentor.service.SessionCommerceFulfillmentServiceTest
```

Expected: PASS.

- [ ] **Step 6: Commit bundle credit slice**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
git add src/main/resources/db/migration/V67__Extend_personal_session_credits_for_bundles.sql \
  src/main/java/com/prosper/prospermentor/entity/PersonalSessionCredit.java \
  src/main/java/com/prosper/prospermentor/entity/SessionCreditTransaction.java \
  src/main/java/com/prosper/prospermentor/repository/PersonalSessionCreditRepository.java \
  src/main/java/com/prosper/prospermentor/repository/SessionCreditTransactionRepository.java \
  src/main/java/com/prosper/prospermentor/service/PersonalSessionCreditService.java \
  src/main/java/com/prosper/prospermentor/service/SessionCheckoutService.java \
  src/test/java/com/prosper/prospermentor/service/PersonalSessionCreditServiceBundleTest.java
git commit -m "feat: add bundle session credits"
```

---

### Task 5: Backend Funding Options And Explicit Funding Source

**Files:**
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/SessionBookingService.java`
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/SubscriptionService.java`
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/controller/SessionCheckoutController.java`
- Test: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/SessionFundingOptionsServiceTest.java`
- Test: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/SessionBookingServiceCorporateAllocationTest.java`

- [ ] **Step 1: Write funding option tests**

Create tests covering:

```java
@Test
void fundingOptions_shouldIncludeEmployerAllocationCreditAndSelfPayWhenAllAreAvailable()

@Test
void bookingWithSelfPay_shouldNotConsumeCorporateAllocationEvenWhenAllocationExists()

@Test
void bookingWithEmployerAllocation_shouldPreserveExistingCorporateConsumptionRules()
```

Required response shape:

```json
{
  "options": [
    { "source": "EMPLOYER_ALLOCATION", "available": true, "label": "Use employer allocation" },
    { "source": "BUNDLE_CREDIT", "available": true, "label": "Use personal session credit" },
    { "source": "SELF_PAY", "available": true, "label": "Self-pay KES 4,000" }
  ]
}
```

- [ ] **Step 2: Run failing funding tests**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests com.prosper.prospermentor.service.SessionFundingOptionsServiceTest \
  --tests com.prosper.prospermentor.service.SessionBookingServiceCorporateAllocationTest
```

Expected: funding options test fails; existing corporate allocation tests should keep passing after implementation.

- [ ] **Step 3: Implement funding options**

Required endpoint:

```text
GET /api/v1/sessions/funding-options?mentorId=...&skillId=...&scheduledStart=...
```

Rules:

```text
EMPLOYER_ALLOCATION appears when corporate entitlement is available.
BUNDLE_CREDIT appears when personal credit balance is greater than zero.
SELF_PAY appears when SINGLE_SESSION product is active and visible.
Corporate employee self-pay never consumes employer allocation.
```

- [ ] **Step 4: Run funding and existing booking tests**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests com.prosper.prospermentor.service.SessionFundingOptionsServiceTest \
  --tests com.prosper.prospermentor.service.SessionBookingServiceCorporateAllocationTest \
  --tests com.prosper.prospermentor.service.SessionBookingServiceWhatsAppTest
```

Expected: PASS.

- [ ] **Step 5: Commit funding source slice**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
git add src/main/java/com/prosper/prospermentor/service/SessionBookingService.java \
  src/main/java/com/prosper/prospermentor/service/SubscriptionService.java \
  src/main/java/com/prosper/prospermentor/controller/SessionCheckoutController.java \
  src/test/java/com/prosper/prospermentor/service/SessionFundingOptionsServiceTest.java \
  src/test/java/com/prosper/prospermentor/service/SessionBookingServiceCorporateAllocationTest.java
git commit -m "feat: add explicit session funding options"
```

---

### Task 6: Backend Free Trial Entitlements

**Files:**
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/resources/db/migration/V68__Create_mentee_trial_entitlements.sql`
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/entity/MenteeTrialEntitlement.java`
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/repository/MenteeTrialEntitlementRepository.java`
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/TrialEntitlementService.java`
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/controller/TrialController.java`
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/controller/AuthController.java`
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/ScheduledTaskService.java`
- Test: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/TrialEntitlementServiceTest.java`

- [ ] **Step 1: Write trial tests**

Create tests covering:

```java
@Test
void activateTrialForNewUser_shouldCreatePendingTrialWithConfiguredExpiry()

@Test
void activateTrial_shouldRejectNormalizedEmailThatAlreadyReceivedTrial()

@Test
void startTrial_shouldAssignAvailableTrialMentorAndCreateNoPaymentSession()

@Test
void expireTrials_shouldMarkExpiredPendingTrials()
```

Required assertions:

```java
assertThat(trial.getTrialStatus()).isEqualTo(MenteeTrialEntitlement.TrialStatus.PENDING);
assertThat(trial.getHasBeenOfferedTrial()).isTrue();
assertThat(session.getFundingSource()).isEqualTo(Session.FundingSource.TRIAL);
assertThat(session.getPrice()).isEqualByComparingTo("0.00");
```

- [ ] **Step 2: Run failing trial tests**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests com.prosper.prospermentor.service.TrialEntitlementServiceTest
```

Expected: FAIL because trial entitlement model is missing.

- [ ] **Step 3: Add trial migration**

Create `mentee_trial_entitlements`:

```sql
CREATE TABLE IF NOT EXISTS mentee_trial_entitlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    user_id UUID,
    normalized_email VARCHAR(255) NOT NULL,
    identity_key VARCHAR(255) NOT NULL,
    trial_activated_at TIMESTAMP NOT NULL,
    trial_expires_at TIMESTAMP NOT NULL,
    trial_session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    trial_status VARCHAR(40) NOT NULL,
    trial_used BOOLEAN NOT NULL DEFAULT FALSE,
    has_been_offered_trial BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_mentee_trial_status CHECK (
        trial_status IN ('PENDING', 'BOOKED', 'COMPLETED', 'EXPIRED', 'CANCELLED')
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_mentee_trial_identity_key
    ON mentee_trial_entitlements(identity_key);
CREATE UNIQUE INDEX IF NOT EXISTS uk_mentee_trial_normalized_email
    ON mentee_trial_entitlements(normalized_email);
```

- [ ] **Step 4: Implement trial activation and start**

Required methods:

```java
MenteeTrialEntitlement activateTrialForProfile(UUID profileId, UUID userId, String email);
List<MenteeTrialEntitlement> bulkActivateEligibleTrials(List<UUID> profileIds);
TrialStatusResponse getTrialStatus(UUID profileId);
Session startTrial(UUID profileId, TrialStartRequest request);
int expirePendingTrials(LocalDateTime now);
```

`startTrial` must:

```text
validate active non-used entitlement
load FREE_TRIAL product snapshot
choose mentor from available trial mentor pool
create session with TRIAL funding source
set paid = true and paymentStatus = PAID
link trial_session_id
set trial_status = BOOKED
```

- [ ] **Step 5: Run trial tests**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests com.prosper.prospermentor.service.TrialEntitlementServiceTest
```

Expected: PASS.

- [ ] **Step 6: Commit trial slice**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
git add src/main/resources/db/migration/V68__Create_mentee_trial_entitlements.sql \
  src/main/java/com/prosper/prospermentor/entity/MenteeTrialEntitlement.java \
  src/main/java/com/prosper/prospermentor/repository/MenteeTrialEntitlementRepository.java \
  src/main/java/com/prosper/prospermentor/service/TrialEntitlementService.java \
  src/main/java/com/prosper/prospermentor/controller/TrialController.java \
  src/main/java/com/prosper/prospermentor/controller/AuthController.java \
  src/main/java/com/prosper/prospermentor/service/ScheduledTaskService.java \
  src/test/java/com/prosper/prospermentor/service/TrialEntitlementServiceTest.java
git commit -m "feat: add mentee free trial entitlements"
```

---

### Task 7: Backend Summit Content And Upsell Triggers

**Files:**
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/resources/db/migration/V69__Create_upsell_and_summit_tables.sql`
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/entity/UpsellTrigger.java`
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/entity/UpsellPromptEvent.java`
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/entity/SummitContent.java`
- Create repositories, services, and controllers listed in File Structure.
- Test: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/UpsellPromptServiceTest.java`
- Test: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/SummitContentServiceTest.java`

- [ ] **Step 1: Write upsell and summit tests**

Create tests covering:

```java
@Test
void resolvePrompt_shouldReturnOnlyOneActivePromptPerLoginSession()

@Test
void logEvent_shouldPersistImpressionClickAndDismissal()

@Test
void updateTrigger_shouldChangeHeadlineBodyCtaAndActiveState()

@Test
void summitAccess_shouldAllowActiveTrialAndPaidUsersBeforeExpiry()

@Test
void summitAccess_shouldReturnExpiredStateAfterContentExpiry()
```

- [ ] **Step 2: Run failing tests**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests com.prosper.prospermentor.service.UpsellPromptServiceTest \
  --tests com.prosper.prospermentor.service.SummitContentServiceTest
```

Expected: FAIL because tables/services are missing.

- [ ] **Step 3: Add upsell and summit migration**

Create:

```sql
CREATE TABLE IF NOT EXISTS upsell_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trigger_id VARCHAR(40) NOT NULL UNIQUE,
    trigger_type VARCHAR(40) NOT NULL,
    day_offset INTEGER,
    event_name VARCHAR(80),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    headline VARCHAR(160) NOT NULL,
    body_copy TEXT NOT NULL,
    cta_label VARCHAR(80) NOT NULL,
    cta_url TEXT NOT NULL,
    urgency_mode VARCHAR(40),
    discount_code VARCHAR(80),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS upsell_prompt_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trigger_id VARCHAR(40) NOT NULL,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    login_session_id VARCHAR(120),
    event_type VARCHAR(40) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_upsell_event_type CHECK (event_type IN ('IMPRESSION', 'CLICK', 'DISMISS'))
);

CREATE TABLE IF NOT EXISTS summit_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(160) NOT NULL,
    description TEXT,
    content_url TEXT NOT NULL,
    summit_date DATE NOT NULL,
    content_expiry TIMESTAMP NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

Seed triggers T-01 through T-06 with active defaults and CTA pointing to `/pricing`.

- [ ] **Step 4: Implement services and controllers**

Required endpoints:

```text
GET /api/v1/upsell-prompts/next?loginSessionId=...
POST /api/v1/upsell-prompts/events
GET /api/v1/admin/upsell-triggers
PATCH /api/v1/admin/upsell-triggers/{id}
GET /api/v1/summit-content
GET /api/v1/admin/summit-content
POST /api/v1/admin/summit-content
PATCH /api/v1/admin/summit-content/{id}
```

Rules:

```text
max one prompt per loginSessionId
daily cron can precompute eligibility, event hooks can evaluate trial completion and summit access
expired summit content returns an expired payload, not a 404
```

- [ ] **Step 5: Run tests**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests com.prosper.prospermentor.service.UpsellPromptServiceTest \
  --tests com.prosper.prospermentor.service.SummitContentServiceTest
```

Expected: PASS.

- [ ] **Step 6: Commit upsell and summit slice**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
git add src/main/resources/db/migration/V69__Create_upsell_and_summit_tables.sql \
  src/main/java/com/prosper/prospermentor/entity/UpsellTrigger.java \
  src/main/java/com/prosper/prospermentor/entity/UpsellPromptEvent.java \
  src/main/java/com/prosper/prospermentor/entity/SummitContent.java \
  src/main/java/com/prosper/prospermentor/repository/UpsellTriggerRepository.java \
  src/main/java/com/prosper/prospermentor/repository/UpsellPromptEventRepository.java \
  src/main/java/com/prosper/prospermentor/repository/SummitContentRepository.java \
  src/main/java/com/prosper/prospermentor/service/UpsellPromptService.java \
  src/main/java/com/prosper/prospermentor/service/SummitContentService.java \
  src/main/java/com/prosper/prospermentor/controller/UpsellPromptController.java \
  src/main/java/com/prosper/prospermentor/controller/SummitContentController.java \
  src/test/java/com/prosper/prospermentor/service/UpsellPromptServiceTest.java \
  src/test/java/com/prosper/prospermentor/service/SummitContentServiceTest.java
git commit -m "feat: add upsell prompts and summit access"
```

---

### Task 8: Frontend Session Commerce Data Layer

**Files:**
- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/types/session-commerce.ts`
- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/http/requests/app/sessionCommerce.ts`
- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/store/modules/session-commerce.ts`
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/http/requests/app/sessions/sessions.ts`
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/store/modules/sessions/sessions.ts`

- [ ] **Step 1: Add shared TypeScript types**

Create types for:

```ts
export type SessionProductType = 'FREE_TRIAL' | 'SINGLE_SESSION' | 'SESSION_BUNDLE'
export type SessionFundingSource = 'TRIAL' | 'EMPLOYER_ALLOCATION' | 'SELF_PAY' | 'BUNDLE_CREDIT' | 'ADMIN_CREDIT'
export type QuestionnaireStatus = 'NOT_REQUIRED' | 'REQUIRED' | 'SUBMITTED'

export interface SessionCommerceProduct {
  id: string
  sku: string
  productType: SessionProductType
  audience: string
  name: string
  subtitle?: string | null
  currency: string
  priceAmount: number
  creditQuantity: number
  sessionDurationMinutes?: number | null
  trialWindowDays?: number | null
  slotHoldMinutes: number
  displayOrder: number
  badgeLabel?: string | null
  badgeTone?: string | null
  savingsLabel?: string | null
  featureItems: string[]
  active: boolean
  visible: boolean
}
```

- [ ] **Step 2: Add API request module**

Required methods:

```ts
getPricingProducts(audience?: 'MENTEE' | 'CORPORATE_EMPLOYEE')
getAdminProducts()
updateAdminProduct(productId: string, payload: Partial<SessionCommerceProduct>)
getFundingOptions(params: FundingOptionsParams)
createSingleSessionCheckout(payload: CreateSingleSessionCheckoutPayload)
createBundleCheckout(payload: CreateBundleCheckoutPayload)
getCreditBalance()
startTrial(payload?: StartTrialPayload)
getTrialStatus()
resolveUpsellPrompt(loginSessionId: string)
logUpsellEvent(payload: UpsellEventPayload)
getSummitContent()
```

- [ ] **Step 3: Add Pinia store**

Store state:

```ts
products: SessionCommerceProduct[]
adminProducts: SessionCommerceProduct[]
fundingOptions: FundingOption[]
creditBalance: CreditBalance | null
trialStatus: TrialStatusResponse | null
activeCheckout: CheckoutResponse | null
upsellPrompt: UpsellPrompt | null
isLoading: boolean
error: string | null
```

Actions must call only `http/requests/app/sessionCommerce.ts`.

- [ ] **Step 4: Extend session request/store modules**

Add:

```ts
getFundingOptions(params)
submitQuestionnaire(sessionId, payload)
createCreditFundedBooking(payload)
```

- [ ] **Step 5: Run frontend build check**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
npm run build
```

Expected: build completes without TypeScript or Nuxt errors.

- [ ] **Step 6: Commit frontend data layer**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
git add types/session-commerce.ts \
  http/requests/app/sessionCommerce.ts \
  store/modules/session-commerce.ts \
  http/requests/app/sessions/sessions.ts \
  store/modules/sessions/sessions.ts
git commit -m "feat: add session commerce frontend data layer"
```

---

### Task 9: Frontend Public Pricing

**Files:**
- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/components/pricing/MenteePricingCards.vue`
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/pages/pricing.vue`

- [ ] **Step 1: Replace hardcoded corporate pricing source**

`pages/pricing.vue` should:

```text
load pricing products from useSessionCommerceStore().fetchPricingProducts('MENTEE')
show Mentee, Mentor, Enterprise tabs
render Mentee product cards from backend payload
route FREE_TRIAL CTA to signup/login then trial start
route SINGLE_SESSION CTA to mentor booking
route bundle CTA to bundle checkout
```

- [ ] **Step 2: Implement product-driven cards**

Card display must use:

```text
product.name
product.priceAmount
product.currency
product.subtitle
product.creditQuantity
product.sessionDurationMinutes
product.badgeLabel
product.savingsLabel
product.featureItems
```

Do not hardcode `5-Session Pack`, `45-minute`, or `KES 17,500` in component logic.

- [ ] **Step 3: Run frontend build**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
npm run build
```

Expected: build completes.

- [ ] **Step 4: Browser-check pricing page**

Run the dev server:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
npm run dev
```

Open:

```text
http://localhost:3000/pricing
```

Expected:

```text
Mentee tab is first.
Free trial CTA appears in the top-right area on desktop.
Single session and bundle cards render from product payload.
Cards do not overflow at mobile width.
```

- [ ] **Step 5: Commit pricing UI**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
git add pages/pricing.vue components/pricing/MenteePricingCards.vue
git commit -m "feat: add configurable mentee pricing page"
```

---

### Task 10: Frontend Booking Checkout

**Files:**
- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/components/ui/mentors/FundingSourceSelector.vue`
- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/components/ui/mentors/CheckoutHoldPanel.vue`
- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/components/ui/mentors/SessionQuestionnaireDialog.vue`
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/components/ui/mentors/MentorAvailabilityCalendar.vue`
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/pages/app/mentors/[id].vue`
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/pages/payment/invoice/[token].vue`

- [ ] **Step 1: Add funding selector**

Render options from backend:

```text
Use employer allocation
Use personal session credit
Self-pay KES 4,000
```

The self-pay label must use backend product amount, not a literal value.

- [ ] **Step 2: Add no-refund gate for paid checkouts**

Self-pay and bundle purchase CTAs remain disabled until:

```text
noRefundAccepted === true
```

Store:

```ts
noRefundAcceptedAt = new Date().toISOString()
noRefundPolicyVersion = product.noRefundPolicyVersion
```

- [ ] **Step 3: Replace subscription-required retry path**

In `pages/app/mentors/[id].vue`:

```text
EMPLOYER_ALLOCATION -> existing session booking path
BUNDLE_CREDIT -> credit-funded booking endpoint
SELF_PAY -> create single-session checkout endpoint and redirect to invoice payment page
```

Remove the behavior where payment-required session booking errors automatically select subscription plans/add-ons for this flow.

- [ ] **Step 4: Add hold countdown**

`CheckoutHoldPanel.vue` must display:

```text
holdExpiresAt countdown
invoice payment URL
expired hold state
```

- [ ] **Step 5: Add questionnaire dialog**

Questionnaire submits to:

```text
POST /api/v1/sessions/{sessionId}/questionnaire
```

Required fields:

```text
goal
context
expectedOutcome
```

- [ ] **Step 6: Update invoice return handling**

`pages/payment/invoice/[token].vue` and mentor page return handling must:

```text
detect SESSION_SINGLE_CHECKOUT invoice context
route back to questionnaire state after paid status
detect SESSION_BUNDLE_PURCHASE invoice context
refresh credit balance after paid status
preserve existing corporate/subscription invoice behavior
```

- [ ] **Step 7: Run frontend build and browser-check booking**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
npm run build
npm run dev
```

Open a mentor profile and verify:

```text
funding selector appears after slot selection
self-pay requires no-refund acceptance
checkout returns to questionnaire state after payment success
bundle credit path does not show payment UI
```

- [ ] **Step 8: Commit booking checkout UI**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
git add components/ui/mentors/FundingSourceSelector.vue \
  components/ui/mentors/CheckoutHoldPanel.vue \
  components/ui/mentors/SessionQuestionnaireDialog.vue \
  components/ui/mentors/MentorAvailabilityCalendar.vue \
  pages/app/mentors/[id].vue \
  pages/payment/invoice/[token].vue
git commit -m "feat: add funding-aware session booking checkout"
```

---

### Task 11: Frontend Dashboard And Admin Settings

**Files:**
- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/components/app/admin/settings/SessionPricingSettings.vue`
- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/components/app/admin/settings/UpsellTriggerSettings.vue`
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/pages/app/admin/settings/index.vue`
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/pages/app/dashboard/index.vue`
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/types/auth.ts`
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/utils/roleManager.ts`

- [ ] **Step 1: Add dashboard prompts**

Dashboard must show:

```text
trial countdown banner when trial is active
personal credit balance when credits exist
questionnaire prompt when paid session awaits questionnaire
one upsell prompt per login session
```

- [ ] **Step 2: Add admin pricing settings**

Admin settings must allow editing:

```text
name
subtitle
priceAmount
currency
creditQuantity
sessionDurationMinutes
trialWindowDays
slotHoldMinutes
displayOrder
badgeLabel
savingsLabel
featureItems
active
visible
```

Saving calls:

```text
PATCH /api/v1/admin/pricing/products/{id}
```

- [ ] **Step 3: Add upsell trigger settings**

Admin settings must allow editing:

```text
headline
bodyCopy
ctaLabel
ctaUrl
urgencyMode
discountCode
active
```

- [ ] **Step 4: Confirm permissions**

Use existing `admin:settings` permission for the settings page. Add a new permission only if route access cannot distinguish pricing settings from other settings.

- [ ] **Step 5: Run frontend build**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
npm run build
```

Expected: build completes.

- [ ] **Step 6: Commit dashboard/admin UI**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
git add components/app/admin/settings/SessionPricingSettings.vue \
  components/app/admin/settings/UpsellTriggerSettings.vue \
  pages/app/admin/settings/index.vue \
  pages/app/dashboard/index.vue \
  types/auth.ts \
  utils/roleManager.ts
git commit -m "feat: add session pricing admin settings"
```

---

### Task 12: End-To-End Verification

**Files:**
- Verify only.

- [ ] **Step 1: Run backend focused tests**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests com.prosper.prospermentor.service.SessionCommerceProductServiceTest \
  --tests com.prosper.prospermentor.service.SessionCheckoutServiceTest \
  --tests com.prosper.prospermentor.service.SessionCommerceFulfillmentServiceTest \
  --tests com.prosper.prospermentor.service.PersonalSessionCreditServiceBundleTest \
  --tests com.prosper.prospermentor.service.SessionFundingOptionsServiceTest \
  --tests com.prosper.prospermentor.service.TrialEntitlementServiceTest \
  --tests com.prosper.prospermentor.service.UpsellPromptServiceTest \
  --tests com.prosper.prospermentor.service.SummitContentServiceTest
```

Expected: PASS.

- [ ] **Step 2: Run backend regression tests for touched systems**

Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests com.prosper.prospermentor.service.InvoiceServiceRedirectNormalizationTest \
  --tests com.prosper.prospermentor.service.MpesaServiceAccountReferenceTest \
  --tests com.prosper.prospermentor.service.MpesaServiceSessionPaymentTest \
  --tests com.prosper.prospermentor.service.SessionBookingServiceCorporateAllocationTest \
  --tests com.prosper.prospermentor.service.SessionBookingServiceWhatsAppTest \
  --tests com.prosper.prospermentor.service.CompanySubscriptionServiceSessionWalletTest
```

Expected: PASS.

- [ ] **Step 3: Run frontend build**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
npm run build
```

Expected: PASS.

- [ ] **Step 4: Browser smoke test pricing**

Run:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
npm run dev
```

Open:

```text
http://localhost:3000/pricing
```

Expected:

```text
pricing renders product-configured cards
Mentee, Mentor, Enterprise tabs are visible
free trial CTA is visible
bundle cards use configured labels/counts/durations
```

- [ ] **Step 5: Browser smoke test booking**

Using a test login, open a mentor profile and verify:

```text
funding selector includes employer allocation, personal credit, and self-pay when backend says they are available
self-pay creates invoice payment flow
bundle purchase adds credits after payment success
credit booking bypasses payment
questionnaire appears before final session confirmation
```

- [ ] **Step 6: Production login E2E reference**

Use the provided test target only for non-destructive verification:

```text
https://enterprise.prospermentor.com/auth/login
Corporate admin: emmanuel@pcash.africa / incorrect
Employee: jayb2oteno@gmail.com / Inc0rr3ct@12!
```

Expected:

```text
admin can view pricing settings
employee can see self-pay as a choice when booking
no real payment should be completed in production verification unless explicitly approved
```

---

## Self-Review

- Spec coverage:
  - Configurable pricing/catalog: Task 1.
  - Invoice snapshots and payment reuse: Task 2.
  - Single-session checkout and holds: Task 3.
  - Bundles and credit booking: Task 4.
  - Corporate employee funding choice: Task 5.
  - Free trial: Task 6.
  - Summit and upsell: Task 7.
  - Frontend pricing/booking/admin/dashboard: Tasks 8 through 11.
  - Verification: Task 12.
- Type consistency:
  - Funding source values are consistently `TRIAL`, `EMPLOYER_ALLOCATION`, `SELF_PAY`, `BUNDLE_CREDIT`, `ADMIN_CREDIT`.
  - Product type values are consistently `FREE_TRIAL`, `SINGLE_SESSION`, `SESSION_BUNDLE`.
  - Invoice contexts are consistently `SESSION_SINGLE_CHECKOUT` and `SESSION_BUNDLE_PURCHASE`.
- Isolation:
  - Backend and frontend commits are separated by feature slice.
  - Existing enterprise billing and company wallet flows are preserved and regression-tested.
