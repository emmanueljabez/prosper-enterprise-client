# Enterprise Employee QR Join Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reusable, revocable Enterprise company QR join link that adds mentees to the company after signup email verification, and expose it from `/app/admin/employees` with PDF download.

**Architecture:** Backend owns company join-token creation, regeneration, verification, and profile linking. The enterprise frontend calls the company join-link API through the existing `component -> store -> http request` path, generates QR/PDF client-side, and carries `companyJoinToken` through signup and confirm-email. To support repeatable QR downloads while avoiding raw token storage, backend tokens use `linkId.nonce.signature`, storing nonce/hash/status and reconstructing signed URLs server-side.

**Tech Stack:** Java 17, Spring Boot, JPA/Hibernate, PostgreSQL, Flyway, JUnit 5, Mockito, Nuxt 3, Vue 3, Pinia, Axios, Tailwind, shadcn-nuxt, `qrcode`, `jspdf`.

---

## Worktrees

- Backend: `/Users/macbookpro/IdeaProjects/ProsperMentor/.worktrees/enterprise-employee-qr-join-backend`
- Enterprise frontend: `/Users/macbookpro/WebstormProjects/myProsperV2/.worktrees/enterprise-employee-qr-join`

## Files

Backend create:

- `src/main/resources/db/migration/V89__Create_company_join_links.sql`
- `src/main/java/com/prosper/prospermentor/entity/CompanyJoinLink.java`
- `src/main/java/com/prosper/prospermentor/repository/CompanyJoinLinkRepository.java`
- `src/main/java/com/prosper/prospermentor/dto/CompanyJoinLinkDto.java`
- `src/main/java/com/prosper/prospermentor/service/CompanyJoinLinkService.java`
- `src/test/java/com/prosper/prospermentor/service/CompanyJoinLinkMigrationTest.java`
- `src/test/java/com/prosper/prospermentor/service/CompanyJoinLinkServiceTest.java`
- `src/test/java/com/prosper/prospermentor/controller/CompanyControllerJoinLinkTest.java`

Backend modify:

- `src/main/java/com/prosper/prospermentor/controller/CompanyController.java`
- `src/main/java/com/prosper/prospermentor/controller/PublicAuthController.java`
- `src/main/java/com/prosper/prospermentor/controller/AuthController.java`
- `src/main/java/com/prosper/prospermentor/dto/ConfirmEmailRequest.java`
- `src/main/java/com/prosper/prospermentor/service/AuthSignupService.java`
- `src/test/java/com/prosper/prospermentor/controller/PublicAuthControllerTest.java`
- `src/test/java/com/prosper/prospermentor/service/AuthSignupServiceTest.java`

Frontend create:

- `utils/companyJoinQrPdf.ts`
- `tests/enterprise-employee-qr-join.test.mjs`

Frontend modify:

- `package.json`
- `package-lock.json`
- `http/requests/app/company.ts`
- `store/modules/company.ts`
- `pages/app/admin/employees.vue`
- `pages/auth/signup.vue`
- `pages/auth/confirm-email.vue`

---

### Task 1: Backend Schema

**Files:**
- Create: `src/test/java/com/prosper/prospermentor/service/CompanyJoinLinkMigrationTest.java`
- Create: `src/main/resources/db/migration/V89__Create_company_join_links.sql`

- [ ] **Step 1: Write failing migration source test**

Create `src/test/java/com/prosper/prospermentor/service/CompanyJoinLinkMigrationTest.java`:

```java
package com.prosper.prospermentor.service;

import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class CompanyJoinLinkMigrationTest {

    @Test
    void migration_shouldCreateCompanyJoinLinksTableAndIndexes() throws Exception {
        Path migration = Path.of("src/main/resources/db/migration/V89__Create_company_join_links.sql");
        assertThat(migration).exists();

        String sql = Files.readString(migration);

        assertThat(sql).contains("CREATE TABLE company_join_links");
        assertThat(sql).contains("company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE");
        assertThat(sql).contains("token_nonce varchar(96) NOT NULL");
        assertThat(sql).contains("token_hash varchar(128) NOT NULL");
        assertThat(sql).contains("status varchar(40) NOT NULL DEFAULT 'ACTIVE'");
        assertThat(sql).contains("last_used_at timestamp");
        assertThat(sql).contains("chk_company_join_links_status");
        assertThat(sql).contains("uniq_company_join_links_active_company");
        assertThat(sql).contains("idx_company_join_links_token_hash");
    }
}
```

- [ ] **Step 2: Verify red**

Run:

```bash
JAVA_HOME=/Users/macbookpro/Library/Java/JavaVirtualMachines/corretto-17.0.10/Contents/Home ./gradlew test --tests CompanyJoinLinkMigrationTest
```

Expected: FAIL because `V89__Create_company_join_links.sql` does not exist.

- [ ] **Step 3: Add migration**

Create `src/main/resources/db/migration/V89__Create_company_join_links.sql`:

```sql
CREATE TABLE company_join_links (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    token_nonce varchar(96) NOT NULL,
    token_hash varchar(128) NOT NULL,
    status varchar(40) NOT NULL DEFAULT 'ACTIVE',
    created_by_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    revoked_by_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now(),
    revoked_at timestamp,
    last_used_at timestamp,
    CONSTRAINT chk_company_join_links_status CHECK (status IN ('ACTIVE', 'REVOKED'))
);

CREATE UNIQUE INDEX uniq_company_join_links_active_company
    ON company_join_links(company_id)
    WHERE status = 'ACTIVE';

CREATE INDEX idx_company_join_links_company_status
    ON company_join_links(company_id, status);

CREATE INDEX idx_company_join_links_token_hash
    ON company_join_links(token_hash);
```

- [ ] **Step 4: Verify green**

Run:

```bash
JAVA_HOME=/Users/macbookpro/Library/Java/JavaVirtualMachines/corretto-17.0.10/Contents/Home ./gradlew test --tests CompanyJoinLinkMigrationTest --tests FlywayMigrationVersionTest
```

Expected: PASS.

### Task 2: Backend Join-Link Domain And Service

**Files:**
- Create: `src/main/java/com/prosper/prospermentor/entity/CompanyJoinLink.java`
- Create: `src/main/java/com/prosper/prospermentor/repository/CompanyJoinLinkRepository.java`
- Create: `src/main/java/com/prosper/prospermentor/dto/CompanyJoinLinkDto.java`
- Create: `src/main/java/com/prosper/prospermentor/service/CompanyJoinLinkService.java`
- Create: `src/test/java/com/prosper/prospermentor/service/CompanyJoinLinkServiceTest.java`

- [ ] **Step 1: Write failing service tests**

Create `CompanyJoinLinkServiceTest` covering:

```java
@Test
void getOrCreateJoinLink_shouldCreateSignedReusableJoinUrl()
```

Assert returned `joinUrl` starts with `https://enterprise.prospermentor.com/auth/signup?audience=mentee&companyJoinToken=`, company name is present, status is `ACTIVE`, and saved entity stores `tokenHash` but not a raw token field.

Add:

```java
@Test
void regenerateJoinLink_shouldRevokeActiveLinkAndCreateReplacement()
```

Assert old link becomes `REVOKED`, new link is `ACTIVE`, and tokens differ.

Add:

```java
@Test
void completeJoinAfterVerification_shouldLinkProfileToCompanyAndRecordLastUsed()
```

Create a token with `getOrCreateJoinLink`, then call `completeJoinAfterVerification(token, profileId, email)`. Assert `profileRepository.updateCompanyId(profileId, companyId, any())` is called and returned DTO has the company id.

Add:

```java
@Test
void completeJoinAfterVerification_shouldRejectInvalidToken()
```

Assert invalid token throws `IllegalArgumentException("INVALID_COMPANY_JOIN_TOKEN")`.

- [ ] **Step 2: Verify red**

Run:

```bash
JAVA_HOME=/Users/macbookpro/Library/Java/JavaVirtualMachines/corretto-17.0.10/Contents/Home ./gradlew test --tests CompanyJoinLinkServiceTest
```

Expected: FAIL because service/domain classes do not exist.

- [ ] **Step 3: Implement domain and service**

Implement `CompanyJoinLink` with fields from the migration, a `Status` enum (`ACTIVE`, `REVOKED`), and `@PrePersist/@PreUpdate` timestamps.

Implement `CompanyJoinLinkRepository` with:

```java
Optional<CompanyJoinLink> findFirstByCompanyIdAndStatus(UUID companyId, CompanyJoinLink.Status status);
Optional<CompanyJoinLink> findByIdAndStatus(UUID id, CompanyJoinLink.Status status);
Optional<CompanyJoinLink> findByTokenHashAndStatus(String tokenHash, CompanyJoinLink.Status status);
```

Implement `CompanyJoinLinkService` with:

- `CompanyJoinLinkDto getOrCreateJoinLink(UUID companyId, UUID adminProfileId)`
- `CompanyJoinLinkDto regenerateJoinLink(UUID companyId, UUID adminProfileId)`
- `CompanyJoinLinkDto completeJoinAfterVerification(String rawToken, UUID profileId, String email)`

Token rules:

- Generate nonce with `SecureRandom`.
- Token format is `linkId.nonce.signature`.
- Signature is `HmacSHA256(signingSecret, linkId + "." + nonce)`.
- Store `SHA-256(rawToken)` as `tokenHash`.
- Reconstruct the raw token for existing active links from id + nonce + signing secret.
- Build join URL as `/auth/signup?audience=mentee&companyJoinToken=<encoded token>`.

- [ ] **Step 4: Verify green**

Run:

```bash
JAVA_HOME=/Users/macbookpro/Library/Java/JavaVirtualMachines/corretto-17.0.10/Contents/Home ./gradlew test --tests CompanyJoinLinkServiceTest
```

Expected: PASS.

### Task 3: Backend Company Admin API

**Files:**
- Modify: `src/main/java/com/prosper/prospermentor/controller/CompanyController.java`
- Create: `src/test/java/com/prosper/prospermentor/controller/CompanyControllerJoinLinkTest.java`

- [ ] **Step 1: Write failing controller tests**

Create tests for:

```java
@Test
void getJoinLink_shouldRequireCompanyAdminAndReturnLink()
```

Call `GET /{companyId}/join-link` method directly with a `COMPANY_ADMIN` auth principal, mock `profileService.getProfileWithCompany`, and assert service receives `companyId` and admin profile id.

Add:

```java
@Test
void regenerateJoinLink_shouldRejectAdminFromAnotherCompany()
```

Mock profile company id different from the requested company and assert `FORBIDDEN`.

- [ ] **Step 2: Verify red**

Run:

```bash
JAVA_HOME=/Users/macbookpro/Library/Java/JavaVirtualMachines/corretto-17.0.10/Contents/Home ./gradlew test --tests CompanyControllerJoinLinkTest
```

Expected: FAIL because endpoints/service dependency are missing.

- [ ] **Step 3: Add endpoints**

Inject `CompanyJoinLinkService` into `CompanyController`.

Add:

```java
@GetMapping("/{companyId}/join-link")
public ResponseEntity<ApiResponse<CompanyJoinLinkDto>> getCompanyJoinLink(@PathVariable UUID companyId, Authentication authentication)
```

Add:

```java
@PostMapping("/{companyId}/join-link/regenerate")
public ResponseEntity<ApiResponse<CompanyJoinLinkDto>> regenerateCompanyJoinLink(@PathVariable UUID companyId, Authentication authentication)
```

Both endpoints call `authorizeCompanyAccess(authentication, companyId, true)` and use `SupabaseUserDetails#getUserIdAsUuid()` as the admin profile id.

- [ ] **Step 4: Verify green**

Run:

```bash
JAVA_HOME=/Users/macbookpro/Library/Java/JavaVirtualMachines/corretto-17.0.10/Contents/Home ./gradlew test --tests CompanyControllerJoinLinkTest --tests CompanyControllerBrandingTest
```

Expected: PASS.

### Task 4: Backend Signup And Email Confirmation Join Completion

**Files:**
- Modify: `src/main/java/com/prosper/prospermentor/controller/AuthController.java`
- Modify: `src/main/java/com/prosper/prospermentor/service/AuthSignupService.java`
- Modify: `src/main/java/com/prosper/prospermentor/dto/ConfirmEmailRequest.java`
- Modify: `src/main/java/com/prosper/prospermentor/controller/PublicAuthController.java`
- Modify: `src/test/java/com/prosper/prospermentor/service/AuthSignupServiceTest.java`
- Modify: `src/test/java/com/prosper/prospermentor/controller/PublicAuthControllerTest.java`

- [ ] **Step 1: Write failing signup propagation test**

In `AuthSignupServiceTest`, add a test where `SignupRequest.companyJoinToken = "join.token.value"`. Assert:

- `generateSignupConfirmationLink` redirect URL includes `companyJoinToken=join.token.value`.
- verification email URL includes `companyJoinToken=join.token.value`.
- default destination includes `companyJoinToken=join.token.value`.

- [ ] **Step 2: Write failing confirm-email completion test**

In `PublicAuthControllerTest`, add:

```java
@Test
void confirmEmail_shouldCompleteCompanyJoinAfterVerification()
```

Mock Supabase verify result with `user.id` and `user.email`, set request `companyJoinToken`, mock `companyJoinLinkService.completeJoinAfterVerification`, and assert response data contains `companyJoin.linked = true`.

- [ ] **Step 3: Verify red**

Run:

```bash
JAVA_HOME=/Users/macbookpro/Library/Java/JavaVirtualMachines/corretto-17.0.10/Contents/Home ./gradlew test --tests AuthSignupServiceTest --tests PublicAuthControllerTest
```

Expected: FAIL because `companyJoinToken` is not supported.

- [ ] **Step 4: Implement signup propagation**

Add `companyJoinToken` to `AuthController.SignupRequest` and `ConfirmEmailRequest`.

Update `AuthSignupService` URL builders to append `companyJoinToken` to:

- Supabase redirect URL.
- frontend confirmation URL.
- email verification destination.

Do not link the company during signup.

- [ ] **Step 5: Implement confirm-email join completion**

Inject `CompanyJoinLinkService` into `PublicAuthController`. After `supabaseAuthService.verifyEmailTokenHash` succeeds:

- Build data with `emailVerified = true`.
- If `request.companyJoinToken` is present, resolve `user.id` and `user.email` from the Supabase response.
- Call `companyJoinLinkService.completeJoinAfterVerification(token, profileId, email)`.
- Add `companyJoin` to response data with `linked`, `companyId`, and `companyName`.

- [ ] **Step 6: Verify green**

Run:

```bash
JAVA_HOME=/Users/macbookpro/Library/Java/JavaVirtualMachines/corretto-17.0.10/Contents/Home ./gradlew test --tests AuthSignupServiceTest --tests PublicAuthControllerTest
```

Expected: PASS.

### Task 5: Frontend Data Layer And Signup Token Carrying

**Files:**
- Create: `tests/enterprise-employee-qr-join.test.mjs`
- Modify: `http/requests/app/company.ts`
- Modify: `store/modules/company.ts`
- Modify: `pages/auth/signup.vue`
- Modify: `pages/auth/confirm-email.vue`

- [ ] **Step 1: Write failing frontend source test**

Create `tests/enterprise-employee-qr-join.test.mjs` that asserts:

- `http/requests/app/company.ts` contains `getCompanyJoinLink` and `/join-link`.
- `http/requests/app/company.ts` contains `regenerateCompanyJoinLink` and `/join-link/regenerate`.
- `store/modules/company.ts` contains `companyJoinLink`, `loadCompanyJoinLink`, and `regenerateCompanyJoinLink`.
- `pages/auth/signup.vue` reads `companyJoinToken`, treats it as mentee signup, sends it in `authStore.register`, and includes it in `/auth/email-verification` query.
- `pages/auth/confirm-email.vue` sends `companyJoinToken` to `/v1/public/auth/confirm-email`.

- [ ] **Step 2: Verify red**

Run:

```bash
node tests/enterprise-employee-qr-join.test.mjs
```

Expected: FAIL.

- [ ] **Step 3: Add company join-link API/store**

In `http/requests/app/company.ts`, add `CompanyJoinLink` and `CompanyJoinLinkResponse` interfaces and methods:

```ts
getCompanyJoinLink(companyId: string)
regenerateCompanyJoinLink(companyId: string)
```

In `store/modules/company.ts`, add state:

```ts
companyJoinLink: CompanyJoinLink | null
companyJoinLinkLoading: boolean
```

Add actions:

```ts
loadCompanyJoinLink(companyId: string)
regenerateCompanyJoinLink(companyId: string)
```

- [ ] **Step 4: Carry `companyJoinToken` through signup/confirmation**

In `pages/auth/signup.vue`:

- Add `companyJoinToken` computed from route query.
- Update `isMenteeSignup` to true when token exists.
- Pass `companyJoinToken` in `authStore.register`.
- Include `companyJoinToken` in email verification query.

In `pages/auth/confirm-email.vue`:

- Add `companyJoinToken` computed from direct query or wrapped `verify_url`.
- Include `companyJoinToken` in confirm-email POST body.

- [ ] **Step 5: Verify green**

Run:

```bash
node tests/enterprise-employee-qr-join.test.mjs
```

Expected: PASS.

### Task 6: Frontend QR Dialog, PDF Utility, And Employees Actions

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `utils/companyJoinQrPdf.ts`
- Modify: `pages/app/admin/employees.vue`
- Modify: `tests/enterprise-employee-qr-join.test.mjs`

- [ ] **Step 1: Extend failing frontend source test**

Update `enterprise-employee-qr-join.test.mjs` to assert:

- `package.json` includes `qrcode` and `jspdf`.
- employees page contains `Generate QR Code`, `Download PDF`, and `QrCode`.
- employees page does not contain the top `Buy Sessions` action.
- employees page imports and uses `downloadCompanyJoinQrPdf`.
- employees page has one top `Actions` dropdown containing Invite, Import, Generate QR Code, Export CSV, and Refresh.

- [ ] **Step 2: Verify red**

Run:

```bash
node tests/enterprise-employee-qr-join.test.mjs
```

Expected: FAIL.

- [ ] **Step 3: Install dependencies**

Run:

```bash
npm install qrcode jspdf @types/qrcode
```

- [ ] **Step 4: Add PDF/QR helper**

Create `utils/companyJoinQrPdf.ts` with:

- `companyJoinQrPdfFileName(companyName: string): string`
- `buildCompanyJoinQrDataUrl(joinUrl: string): Promise<string>`
- `downloadCompanyJoinQrPdf(input: { companyName: string; joinUrl: string; qrDataUrl: string }): Promise<void>`

Use dynamic imports for `qrcode` and `jspdf` so SSR does not load browser-only code.

- [ ] **Step 5: Update employees page**

Replace the top individual action buttons with an `Actions` dropdown. Items:

- Invite Employee
- Import Employees
- Generate QR Code
- Export CSV
- Refresh

Remove the `Buy Sessions` action button. Keep the session wallet alerts unchanged.

Add a QR dialog with:

- QR preview image.
- join URL display.
- Copy link.
- Download PDF.
- Regenerate QR link.

- [ ] **Step 6: Verify frontend source test**

Run:

```bash
node tests/enterprise-employee-qr-join.test.mjs
```

Expected: PASS.

### Task 7: Verification

**Files:**
- All modified files.

- [ ] **Step 1: Run targeted backend tests**

Run:

```bash
JAVA_HOME=/Users/macbookpro/Library/Java/JavaVirtualMachines/corretto-17.0.10/Contents/Home ./gradlew test --tests CompanyJoinLinkMigrationTest --tests CompanyJoinLinkServiceTest --tests CompanyControllerJoinLinkTest --tests AuthSignupServiceTest --tests PublicAuthControllerTest --tests FlywayMigrationVersionTest
```

Expected: PASS.

- [ ] **Step 2: Run frontend tests**

Run:

```bash
node tests/enterprise-employee-qr-join.test.mjs
node tests/auth-signup-page.test.mjs
npm run build
```

Expected: PASS. Build may keep the existing Nuxt warnings about missing UI barrel `index` files and vee-validate adapters, but it must exit 0.

- [ ] **Step 3: Record baseline caveat**

The backend full `./gradlew test` baseline failed before feature work due to Docker/Testcontainers initialization and unrelated `SessionWhatsAppE2ETest` context failures. Do not claim a full backend suite pass unless those pre-existing failures are resolved.

- [ ] **Step 4: Commit implementation**

Backend:

```bash
git add src/main/resources/db/migration/V89__Create_company_join_links.sql src/main/java/com/prosper/prospermentor/entity/CompanyJoinLink.java src/main/java/com/prosper/prospermentor/repository/CompanyJoinLinkRepository.java src/main/java/com/prosper/prospermentor/dto/CompanyJoinLinkDto.java src/main/java/com/prosper/prospermentor/service/CompanyJoinLinkService.java src/main/java/com/prosper/prospermentor/controller/CompanyController.java src/main/java/com/prosper/prospermentor/controller/PublicAuthController.java src/main/java/com/prosper/prospermentor/controller/AuthController.java src/main/java/com/prosper/prospermentor/dto/ConfirmEmailRequest.java src/main/java/com/prosper/prospermentor/service/AuthSignupService.java src/test/java/com/prosper/prospermentor/service/CompanyJoinLinkMigrationTest.java src/test/java/com/prosper/prospermentor/service/CompanyJoinLinkServiceTest.java src/test/java/com/prosper/prospermentor/controller/CompanyControllerJoinLinkTest.java src/test/java/com/prosper/prospermentor/controller/PublicAuthControllerTest.java src/test/java/com/prosper/prospermentor/service/AuthSignupServiceTest.java
git commit -m "feat: add enterprise company join links"
```

Frontend:

```bash
git add docs/superpowers/plans/2026-09-23-enterprise-employee-qr-join-implementation-plan.md package.json package-lock.json http/requests/app/company.ts store/modules/company.ts pages/app/admin/employees.vue pages/auth/signup.vue pages/auth/confirm-email.vue utils/companyJoinQrPdf.ts tests/enterprise-employee-qr-join.test.mjs
git commit -m "feat: add employee qr join workflow"
```

