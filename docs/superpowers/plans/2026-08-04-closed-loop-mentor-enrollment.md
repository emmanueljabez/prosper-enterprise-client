# Closed-Loop Mentor Enrollment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement enterprise closed-loop mentor enrollment: company admins invite or bulk import mentors, mentors complete the normal B2C mentor signup flow at `https://www.prospermentor.com/auth?mode=signup&flow=mentor`, accepted mentors become available to the inviting company according to visibility and program-scope configuration, and private company mentors do not leak into public discovery or booking.

**Architecture:** Backend owns invitation state, delivery tracking, pool membership, visibility, strict import validation, and booking/discovery enforcement. Enterprise frontend owns admin invite/import/status controls through Pinia stores and HTTP request modules. B2C frontend keeps mentor profile completion canonical and adds invite-token verification/acceptance around the existing mentor signup flow.

**Tech Stack:** Spring Boot 3.5, Java 17, Gradle, Flyway, PostgreSQL, JPA, JUnit/Mockito, Nuxt 3, Vue 3, TypeScript, Pinia, Tailwind, React/Vite, Supabase auth, Nautix WhatsApp templates.

---

## Source Requirements

- Approved requirements: `/Users/macbookpro/WebstormProjects/myProsperV2/docs/superpowers/specs/2026-08-04-closed-loop-mentor-enrollment-design.md`
- Enterprise workbook: `/Users/macbookpro/Downloads/Prosper_Mentor_Enterprise_Scenario_Grid_with_Onboarding updated (1).xlsx`
- Existing employee import reference:
  - `/Users/macbookpro/WebstormProjects/myProsperV2/pages/app/admin/users/import.vue`
  - `/Users/macbookpro/WebstormProjects/myProsperV2/pages/app/admin/employees.vue`
  - `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/CompanyService.java`
- Existing B2C mentor signup:
  - `/Users/macbookpro/WebstormProjects/prosper-link-africa/src/pages/MentorSignupFlow.tsx`
  - `/Users/macbookpro/WebstormProjects/prosper-link-africa/src/utils/inviteFlow.ts`

## File Structure Map

### Backend: `/Users/macbookpro/IdeaProjects/ProsperMentor`

Create:

- `src/main/resources/db/migration/V77__Create_company_mentor_enrollment_tables.sql`
- `src/main/java/com/prosper/prospermentor/entity/CompanyMentorInvitation.java`
- `src/main/java/com/prosper/prospermentor/entity/CompanyMentorPoolMembership.java`
- `src/main/java/com/prosper/prospermentor/entity/CompanyMentorProgramScope.java`
- `src/main/java/com/prosper/prospermentor/repository/CompanyMentorInvitationRepository.java`
- `src/main/java/com/prosper/prospermentor/repository/CompanyMentorPoolMembershipRepository.java`
- `src/main/java/com/prosper/prospermentor/repository/CompanyMentorProgramScopeRepository.java`
- `src/main/java/com/prosper/prospermentor/dto/CompanyMentorDtos.java`
- `src/main/java/com/prosper/prospermentor/service/CompanyMentorEnrollmentService.java`
- `src/main/java/com/prosper/prospermentor/service/notification/CompanyMentorNotificationService.java`
- `src/main/java/com/prosper/prospermentor/controller/CompanyMentorEnrollmentController.java`
- `src/main/java/com/prosper/prospermentor/controller/AdminCompanyMentorApprovalController.java`
- `src/main/resources/templates/email/company-mentor-invitation.html`
- `src/main/resources/templates/whatsapp/company-mentor-invitation.md`
- `src/test/java/com/prosper/prospermentor/service/CompanyMentorEnrollmentMigrationTest.java`
- `src/test/java/com/prosper/prospermentor/service/CompanyMentorEnrollmentServiceTest.java`
- `src/test/java/com/prosper/prospermentor/controller/CompanyMentorEnrollmentControllerTest.java`
- `src/test/java/com/prosper/prospermentor/service/ProfileServiceCompanyMentorVisibilityTest.java`
- `src/test/java/com/prosper/prospermentor/service/CompanyProgramMentorAssignmentServiceCompanyPoolTest.java`
- `src/test/java/com/prosper/prospermentor/service/SessionBookingServiceCompanyMentorVisibilityTest.java`

Modify:

- `src/main/java/com/prosper/prospermentor/config/SecurityConfig.java`
- `src/main/java/com/prosper/prospermentor/repository/ProfileRepository.java`
- `src/main/java/com/prosper/prospermentor/service/ProfileService.java`
- `src/main/java/com/prosper/prospermentor/controller/ProfileController.java`
- `src/main/java/com/prosper/prospermentor/service/CompanyProgramMentorAssignmentService.java`
- `src/main/java/com/prosper/prospermentor/dto/CompanyProgramMentorCandidateDto.java`
- `src/main/java/com/prosper/prospermentor/service/SessionBookingService.java`

### Enterprise Frontend: `/Users/macbookpro/WebstormProjects/myProsperV2`

Create:

- `types/company-mentors.ts`
- `http/requests/app/companyMentors.ts`
- `store/modules/companyMentors.ts`
- `components/app/admin/mentors/InviteCompanyMentorDialog.vue`
- `components/app/admin/mentors/ImportCompanyMentorsDialog.vue`
- `components/app/admin/mentors/EditCompanyMentorVisibilityDialog.vue`
- `components/app/admin/mentors/CompanyMentorStatusBadge.vue`
- `tests/company-mentor-enrollment-store.test.mjs`
- `tests/company-mentor-enrollment-ui.test.mjs`

Modify:

- `pages/app/admin/mentors.vue`
- `tests/corporate-admin-mentors-route.test.mjs`

### B2C Frontend: `/Users/macbookpro/WebstormProjects/prosper-link-africa`

Create:

- `src/services/companyMentorInviteService.ts`
- `src/tests/company-mentor-invite-flow.test.mjs`

Modify:

- `src/utils/inviteFlow.ts`
- `src/pages/MentorSignupFlow.tsx`
- `src/pages/AuthConfirm.tsx`

## Implementation Notes

- Use `COMPANY_PRIVATE` as the default invite visibility.
- Store only a SHA-256 hash of invite tokens. Email/WhatsApp links carry the raw token.
- The invite link must be `https://www.prospermentor.com/auth?mode=signup&flow=mentor&from=invite&token=<rawToken>` in production. In local or preview environments, support a configurable B2C base URL.
- Do not reuse `company_employee_whitelist` for mentors.
- Do not put privacy rules in frontend-only filtering.
- Preserve existing public Prosper Mentor accounts. A company membership controls company-specific availability; it must not remove a mentor who was already publicly discoverable before accepting a company invite.
- The backend should derive `companyBookable` from membership status, profile completion, mentor profile existence, availability, and program scope. Frontend displays the derived value.
- Enterprise frontend request flow must stay `component -> store -> http request`.
- Bulk import is strict: every save path must re-run validation server-side and save zero rows if any row fails.

---

## Task 0: Preflight

- [ ] Check dirty files before editing each repository:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2 && git status --short
cd /Users/macbookpro/IdeaProjects/ProsperMentor && git status --short
cd /Users/macbookpro/WebstormProjects/prosper-link-africa && git status --short
```

Expected result: unrelated modified files may exist. Do not revert them. Only stage files touched by this plan.

- [ ] Confirm Flyway latest version before creating the backend migration:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
find src/main/resources/db/migration -maxdepth 1 -type f -name 'V*.sql' | sed 's#.*/##' | sort -V | tail -5
```

Expected result at plan creation: `V76__Create_password_reset_tokens.sql` is latest, so use `V77__Create_company_mentor_enrollment_tables.sql`.

---

## Task 1: Backend Schema, Entities, And Repositories

### Tests First

- [ ] Create `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/CompanyMentorEnrollmentMigrationTest.java`:

```java
package com.prosper.prospermentor.service;

import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class CompanyMentorEnrollmentMigrationTest {

    @Test
    void migration_shouldCreateMentorEnrollmentTablesAndIndexes() throws Exception {
        Path migration = Path.of("src/main/resources/db/migration/V77__Create_company_mentor_enrollment_tables.sql");
        assertThat(migration).exists();

        String sql = Files.readString(migration);

        assertThat(sql).contains("CREATE TABLE company_mentor_invitations");
        assertThat(sql).contains("CREATE TABLE company_mentor_pool_memberships");
        assertThat(sql).contains("CREATE TABLE company_mentor_program_scopes");
        assertThat(sql).contains("invitation_token_hash");
        assertThat(sql).contains("email_delivery_status");
        assertThat(sql).contains("whatsapp_delivery_status");
        assertThat(sql).contains("public_listing_preexisting");
        assertThat(sql).contains("uniq_company_mentor_open_invitation_email");
        assertThat(sql).contains("uniq_company_mentor_active_membership");
        assertThat(sql).contains("idx_company_mentor_memberships_visibility");
    }
}
```

- [ ] Run the failing migration test:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests CompanyMentorEnrollmentMigrationTest
```

Expected result: test fails because the migration does not exist yet.

### Implementation

- [ ] Create `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/resources/db/migration/V77__Create_company_mentor_enrollment_tables.sql`:

```sql
CREATE TABLE company_mentor_invitations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email varchar(255) NOT NULL,
    phone varchar(32) NOT NULL,
    first_name varchar(120),
    last_name varchar(120),
    title varchar(180),
    department varchar(180),
    tags text[],
    default_visibility varchar(40) NOT NULL DEFAULT 'COMPANY_PRIVATE',
    program_or_cohort_reference varchar(255),
    invitation_token_hash varchar(128),
    invitation_token_expires_at timestamp,
    status varchar(40) NOT NULL DEFAULT 'DRAFT',
    email_delivery_status varchar(40) NOT NULL DEFAULT 'NOT_ATTEMPTED',
    whatsapp_delivery_status varchar(40) NOT NULL DEFAULT 'NOT_ATTEMPTED',
    accepted_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    accepted_at timestamp,
    invited_by_user_id uuid,
    last_sent_at timestamp,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now(),
    CONSTRAINT chk_company_mentor_invitation_visibility CHECK (default_visibility IN ('COMPANY_PRIVATE', 'PROGRAM_RESTRICTED', 'PUBLIC_REQUESTED', 'PUBLIC_APPROVED')),
    CONSTRAINT chk_company_mentor_invitation_status CHECK (status IN ('DRAFT', 'SENT', 'ACCEPTED', 'EXPIRED', 'CANCELLED', 'FAILED_DELIVERY')),
    CONSTRAINT chk_company_mentor_invitation_email_delivery CHECK (email_delivery_status IN ('NOT_ATTEMPTED', 'SENT', 'FAILED', 'DELIVERED')),
    CONSTRAINT chk_company_mentor_invitation_whatsapp_delivery CHECK (whatsapp_delivery_status IN ('NOT_ATTEMPTED', 'SENT', 'FAILED', 'DELIVERED'))
);

CREATE UNIQUE INDEX uniq_company_mentor_open_invitation_email
    ON company_mentor_invitations(company_id, lower(email))
    WHERE status IN ('DRAFT', 'SENT', 'FAILED_DELIVERY');

CREATE UNIQUE INDEX uniq_company_mentor_open_invitation_phone
    ON company_mentor_invitations(company_id, phone)
    WHERE status IN ('DRAFT', 'SENT', 'FAILED_DELIVERY');

CREATE INDEX idx_company_mentor_invitations_company_status
    ON company_mentor_invitations(company_id, status);

CREATE INDEX idx_company_mentor_invitations_token_hash
    ON company_mentor_invitations(invitation_token_hash)
    WHERE invitation_token_hash IS NOT NULL;

CREATE TABLE company_mentor_pool_memberships (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    mentor_profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    source_invitation_id uuid REFERENCES company_mentor_invitations(id) ON DELETE SET NULL,
    visibility_mode varchar(40) NOT NULL DEFAULT 'COMPANY_PRIVATE',
    membership_status varchar(40) NOT NULL DEFAULT 'ACTIVE',
    profile_complete boolean NOT NULL DEFAULT false,
    availability_complete boolean NOT NULL DEFAULT false,
    company_bookable boolean NOT NULL DEFAULT false,
    public_approval_status varchar(40) NOT NULL DEFAULT 'NOT_REQUESTED',
    public_requested_at timestamp,
    public_approved_at timestamp,
    public_approved_by_user_id uuid,
    public_listing_preexisting boolean NOT NULL DEFAULT false,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now(),
    CONSTRAINT chk_company_mentor_membership_visibility CHECK (visibility_mode IN ('COMPANY_PRIVATE', 'PROGRAM_RESTRICTED', 'PUBLIC_REQUESTED', 'PUBLIC_APPROVED')),
    CONSTRAINT chk_company_mentor_membership_status CHECK (membership_status IN ('PENDING_INVITE', 'ACTIVE', 'REMOVED', 'SUSPENDED')),
    CONSTRAINT chk_company_mentor_public_approval CHECK (public_approval_status IN ('NOT_REQUESTED', 'REQUESTED', 'APPROVED', 'REJECTED'))
);

CREATE UNIQUE INDEX uniq_company_mentor_active_membership
    ON company_mentor_pool_memberships(company_id, mentor_profile_id)
    WHERE membership_status IN ('PENDING_INVITE', 'ACTIVE', 'SUSPENDED');

CREATE INDEX idx_company_mentor_memberships_company
    ON company_mentor_pool_memberships(company_id, membership_status);

CREATE INDEX idx_company_mentor_memberships_mentor
    ON company_mentor_pool_memberships(mentor_profile_id);

CREATE INDEX idx_company_mentor_memberships_visibility
    ON company_mentor_pool_memberships(visibility_mode, public_approval_status, company_bookable);

CREATE TABLE company_mentor_program_scopes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_mentor_pool_membership_id uuid NOT NULL REFERENCES company_mentor_pool_memberships(id) ON DELETE CASCADE,
    company_program_id uuid REFERENCES company_programs(id) ON DELETE CASCADE,
    cohort_id uuid,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now(),
    CONSTRAINT chk_company_mentor_scope_target CHECK (company_program_id IS NOT NULL OR cohort_id IS NOT NULL)
);

CREATE UNIQUE INDEX uniq_company_mentor_program_scope
    ON company_mentor_program_scopes(company_mentor_pool_membership_id, company_program_id)
    WHERE company_program_id IS NOT NULL;

CREATE UNIQUE INDEX uniq_company_mentor_cohort_scope
    ON company_mentor_program_scopes(company_mentor_pool_membership_id, cohort_id)
    WHERE cohort_id IS NOT NULL;

CREATE INDEX idx_company_mentor_scopes_program
    ON company_mentor_program_scopes(company_program_id);
```

- [ ] Create entity classes using Lombok and JPA enums. Use these enum names exactly:

```java
public enum VisibilityMode {
    COMPANY_PRIVATE,
    PROGRAM_RESTRICTED,
    PUBLIC_REQUESTED,
    PUBLIC_APPROVED
}

public enum InvitationStatus {
    DRAFT,
    SENT,
    ACCEPTED,
    EXPIRED,
    CANCELLED,
    FAILED_DELIVERY
}

public enum DeliveryStatus {
    NOT_ATTEMPTED,
    SENT,
    FAILED,
    DELIVERED
}

public enum MembershipStatus {
    PENDING_INVITE,
    ACTIVE,
    REMOVED,
    SUSPENDED
}

public enum PublicApprovalStatus {
    NOT_REQUESTED,
    REQUESTED,
    APPROVED,
    REJECTED
}
```

- [ ] In `CompanyMentorInvitation`, map `company` as `@ManyToOne(fetch = FetchType.EAGER)`, `acceptedProfile` as `@ManyToOne(fetch = FetchType.LAZY)`, `tags` as `@Column(name = "tags", columnDefinition = "text[]") private List<String> tags;`, and `@PrePersist/@PreUpdate` timestamps matching `CompanyEmployeeWhitelist`.

- [ ] In `CompanyMentorPoolMembership`, map `company`, `mentorProfile` as a `Profile`, `sourceInvitation`, and scopes as:

```java
@OneToMany(mappedBy = "membership", cascade = CascadeType.ALL, orphanRemoval = true)
private List<CompanyMentorProgramScope> programScopes = new ArrayList<>();
```

- [ ] In `CompanyMentorProgramScope`, map `membership` and `companyProgram`. Keep `cohortId` as `UUID` because the current enterprise program model does not expose a dedicated cohort entity.

- [ ] Create repositories with these method signatures:

```java
Optional<CompanyMentorInvitation> findByInvitationTokenHash(String invitationTokenHash);
Optional<CompanyMentorInvitation> findByCompany_IdAndEmailIgnoreCaseAndStatusIn(UUID companyId, String email, Collection<CompanyMentorInvitation.InvitationStatus> statuses);
boolean existsByCompany_IdAndEmailIgnoreCaseAndStatusIn(UUID companyId, String email, Collection<CompanyMentorInvitation.InvitationStatus> statuses);
boolean existsByCompany_IdAndPhoneAndStatusIn(UUID companyId, String phone, Collection<CompanyMentorInvitation.InvitationStatus> statuses);
Page<CompanyMentorInvitation> findByCompany_Id(UUID companyId, Pageable pageable);
```

```java
List<CompanyMentorPoolMembership> findByCompany_IdAndMembershipStatusIn(UUID companyId, Collection<CompanyMentorPoolMembership.MembershipStatus> statuses);
Optional<CompanyMentorPoolMembership> findByCompany_IdAndMentorProfile_IdAndMembershipStatusIn(UUID companyId, UUID mentorProfileId, Collection<CompanyMentorPoolMembership.MembershipStatus> statuses);
List<CompanyMentorPoolMembership> findByMentorProfile_IdAndMembershipStatusIn(UUID mentorProfileId, Collection<CompanyMentorPoolMembership.MembershipStatus> statuses);
boolean existsByCompany_IdAndMentorProfile_IdAndMembershipStatusIn(UUID companyId, UUID mentorProfileId, Collection<CompanyMentorPoolMembership.MembershipStatus> statuses);
```

```java
List<CompanyMentorProgramScope> findByMembership_Id(UUID membershipId);
List<CompanyMentorProgramScope> findByCompanyProgram_Id(UUID companyProgramId);
```

- [ ] Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests CompanyMentorEnrollmentMigrationTest
```

Expected result: migration test passes.

- [ ] Commit backend schema work:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
git status --short
git add src/main/resources/db/migration/V77__Create_company_mentor_enrollment_tables.sql \
  src/main/java/com/prosper/prospermentor/entity/CompanyMentorInvitation.java \
  src/main/java/com/prosper/prospermentor/entity/CompanyMentorPoolMembership.java \
  src/main/java/com/prosper/prospermentor/entity/CompanyMentorProgramScope.java \
  src/main/java/com/prosper/prospermentor/repository/CompanyMentorInvitationRepository.java \
  src/main/java/com/prosper/prospermentor/repository/CompanyMentorPoolMembershipRepository.java \
  src/main/java/com/prosper/prospermentor/repository/CompanyMentorProgramScopeRepository.java \
  src/test/java/com/prosper/prospermentor/service/CompanyMentorEnrollmentMigrationTest.java
git commit -m "Add company mentor enrollment schema"
```

---

## Task 2: Backend DTOs, Invite Lifecycle, Strict Import, And Notifications

### Tests First

- [ ] Create `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/CompanyMentorEnrollmentServiceTest.java` with these test methods:

```java
@Test
void inviteMentor_shouldRequireEmailAndPhoneAndSendBothChannels()

@Test
void validateImport_shouldReturnRowErrorsAndSaveNothingForInvalidRows()

@Test
void importMentors_shouldSaveNothingWhenOneRowFailsValidation()

@Test
void importMentors_shouldCreateAllInvitationsWhenRowsAreValid()

@Test
void acceptInvitation_shouldAttachExistingMentorAccountToCompanyPool()

@Test
void acceptInvitation_shouldCreateMembershipForNewMentorAfterSignup()

@Test
void resendInvitation_shouldReplaceTokenAndAttemptBothChannels()

@Test
void companyBookable_shouldBeFalseUntilProfileAndAvailabilityAreComplete()
```

- [ ] In the test setup, mock `CompanyRepository`, `ProfileRepository`, `MentorProfileRepository`, `CompanyMentorInvitationRepository`, `CompanyMentorPoolMembershipRepository`, `CompanyProgramRepository`, and `CompanyMentorNotificationService`. Use `when(repository.save(any(...))).thenAnswer(invocation -> invocation.getArgument(0));` so assertions can inspect saved entities.

- [ ] Run the failing service tests:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests CompanyMentorEnrollmentServiceTest
```

Expected result: tests fail because service and DTO files do not exist yet.

### Implementation

- [ ] Create `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/CompanyMentorDtos.java` with nested static DTO classes so the new contract stays grouped:

```java
package com.prosper.prospermentor.dto;

import com.prosper.prospermentor.entity.CompanyMentorInvitation;
import com.prosper.prospermentor.entity.CompanyMentorPoolMembership;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public final class CompanyMentorDtos {
    private CompanyMentorDtos() {}

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InviteRequest {
        @Email
        @NotBlank
        private String email;
        @NotBlank
        private String phone;
        private String firstName;
        private String lastName;
        private String title;
        private String department;
        private List<String> tags;
        private CompanyMentorPoolMembership.VisibilityMode defaultVisibility;
        private List<UUID> companyProgramIds;
        private String cohortReference;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImportValidationResponse {
        private boolean valid;
        private int totalRows;
        private int validRows;
        private int errorRows;
        private List<ImportRowResult> rows;
        private List<ImportRowError> errors;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImportRowResult {
        private int rowNumber;
        private String email;
        private String phone;
        private String firstName;
        private String lastName;
        private String title;
        private String department;
        private List<String> tags;
        private CompanyMentorPoolMembership.VisibilityMode visibility;
        private String programOrCohortReference;
        private boolean existingProsperMentor;
        private List<ImportRowError> errors;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImportRowError {
        private int rowNumber;
        private String field;
        private String value;
        private String reason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InvitationDto {
        private UUID id;
        private UUID companyId;
        private String companyName;
        private String email;
        private String phone;
        private String firstName;
        private String lastName;
        private String title;
        private String department;
        private List<String> tags;
        private CompanyMentorPoolMembership.VisibilityMode defaultVisibility;
        private String programOrCohortReference;
        private CompanyMentorInvitation.InvitationStatus status;
        private CompanyMentorInvitation.DeliveryStatus emailDeliveryStatus;
        private CompanyMentorInvitation.DeliveryStatus whatsappDeliveryStatus;
        private UUID acceptedProfileId;
        private LocalDateTime acceptedAt;
        private LocalDateTime lastSentAt;
        private LocalDateTime invitationTokenExpiresAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PoolMemberDto {
        private UUID id;
        private UUID companyId;
        private UUID mentorProfileId;
        private UUID sourceInvitationId;
        private String mentorName;
        private String mentorEmail;
        private String phone;
        private String title;
        private String department;
        private List<String> tags;
        private CompanyMentorPoolMembership.VisibilityMode visibilityMode;
        private CompanyMentorPoolMembership.MembershipStatus membershipStatus;
        private boolean profileComplete;
        private boolean availabilityComplete;
        private boolean companyBookable;
        private CompanyMentorPoolMembership.PublicApprovalStatus publicApprovalStatus;
        private boolean publicListingPreexisting;
        private List<ProgramScopeDto> programScopes;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProgramScopeDto {
        private UUID id;
        private UUID companyProgramId;
        private String companyProgramName;
        private UUID cohortId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MentorPoolResponse {
        private List<InvitationDto> invitations;
        private List<PoolMemberDto> members;
        private MentorPoolMetrics metrics;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MentorPoolMetrics {
        private long totalCompanyMentors;
        private long pendingInvites;
        private long acceptedIncompleteProfile;
        private long profileCompleteNoAvailability;
        private long companyBookable;
        private long publicRequested;
        private long publicApproved;
        private long failedEmailDeliveries;
        private long failedWhatsappDeliveries;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VerifyInviteResponse {
        private String email;
        private String phone;
        private String firstName;
        private String lastName;
        private String title;
        private String department;
        private List<String> tags;
        private UUID companyId;
        private String companyName;
        private CompanyMentorPoolMembership.VisibilityMode defaultVisibility;
        private boolean existingProsperMentor;
        private LocalDateTime expiresAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AcceptInviteRequest {
        @NotBlank
        private String token;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VisibilityUpdateRequest {
        private CompanyMentorPoolMembership.VisibilityMode visibilityMode;
        private List<UUID> companyProgramIds;
        private List<UUID> cohortIds;
    }
}
```

- [ ] Create `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/notification/CompanyMentorNotificationService.java`:

```java
package com.prosper.prospermentor.service.notification;

import com.prosper.prospermentor.EmailInterface;
import com.prosper.prospermentor.entity.Company;
import com.prosper.prospermentor.service.NautixWhatsAppService;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompanyMentorNotificationService {

    private final EmailInterface emailInterface;
    private final SpringTemplateEngine templateEngine;
    private final NautixWhatsAppService nautixWhatsAppService;

    @Value("${app.name:ProsperMentor}")
    private String appName;

    @Value("${prosper.b2c.base-url:https://www.prospermentor.com}")
    private String b2cBaseUrl;

    @Value("${nautix.whatsapp.company-mentor-invitation-template:company_mentor_invitation}")
    private String whatsappTemplateName;

    public String buildInvitationUrl(String rawToken) {
        return b2cBaseUrl + "/auth?mode=signup&flow=mentor&from=invite&token=" + rawToken;
    }

    public DeliveryAttemptResult sendMentorInvitation(Company company,
                                                      String email,
                                                      String phone,
                                                      String rawToken,
                                                      LocalDateTime expiresAt) {
        String invitationUrl = buildInvitationUrl(rawToken);
        boolean emailSent = sendEmail(company, email, invitationUrl, expiresAt);
        boolean whatsappSent = sendWhatsapp(company, phone, invitationUrl, expiresAt);
        return DeliveryAttemptResult.builder()
                .emailSent(emailSent)
                .whatsappSent(whatsappSent)
                .build();
    }

    private boolean sendEmail(Company company, String email, String invitationUrl, LocalDateTime expiresAt) {
        try {
            Context context = new Context();
            context.setVariable("company", company);
            context.setVariable("email", email);
            context.setVariable("invitationUrl", invitationUrl);
            context.setVariable("expiresAt", expiresAt);
            context.setVariable("appName", appName);
            String html = templateEngine.process("email/company-mentor-invitation", context);
            emailInterface.sendEmail(email, "You're invited to mentor for " + company.getName() + " on " + appName, html, List.of());
            return true;
        } catch (Exception e) {
            log.error("Failed to send company mentor invitation email to {}: {}", email, e.getMessage(), e);
            return false;
        }
    }

    private boolean sendWhatsapp(Company company, String phone, String invitationUrl, LocalDateTime expiresAt) {
        try {
            nautixWhatsAppService.sendTemplateMessage(
                    whatsappTemplateName,
                    phone,
                    List.of(company.getName(), invitationUrl, expiresAt.toString())
            );
            return true;
        } catch (Exception e) {
            log.error("Failed to send company mentor invitation WhatsApp to {}: {}", phone, e.getMessage(), e);
            return false;
        }
    }

    @Builder
    public record DeliveryAttemptResult(boolean emailSent, boolean whatsappSent) {}
}
```

- [ ] Create `company-mentor-invitation.html` and `company-mentor-invitation.md`. The email template must include company name, invite URL, expiry time, and ProsperMentor support copy. The WhatsApp markdown must name the Nautix template and the same button-link parameter order used by existing `employee-invitation.md`.

- [ ] Create `CompanyMentorEnrollmentService` with these public methods:

```java
public CompanyMentorDtos.InvitationDto inviteMentor(UUID companyId, CompanyMentorDtos.InviteRequest request, UUID invitedByUserId)
public CompanyMentorDtos.ImportValidationResponse validateImport(UUID companyId, MultipartFile file)
public CompanyMentorDtos.ImportValidationResponse importMentors(UUID companyId, MultipartFile file, UUID invitedByUserId)
public CompanyMentorDtos.InvitationDto resendInvitation(UUID companyId, UUID invitationId)
public CompanyMentorDtos.VerifyInviteResponse verifyInvitation(String rawToken)
public CompanyMentorDtos.PoolMemberDto acceptInvitation(String rawToken, UUID mentorProfileId)
public CompanyMentorDtos.MentorPoolResponse getMentorPool(UUID companyId, int page, int size, String search)
public CompanyMentorDtos.PoolMemberDto updateVisibility(UUID companyId, UUID membershipId, CompanyMentorDtos.VisibilityUpdateRequest request)
public CompanyMentorDtos.PoolMemberDto approvePublicVisibility(UUID membershipId, UUID approvedByUserId)
public CompanyMentorDtos.PoolMemberDto rejectPublicVisibility(UUID membershipId, UUID rejectedByUserId)
public void removeMembership(UUID companyId, UUID membershipId)
public boolean isMentorPubliclyDiscoverable(UUID mentorProfileId)
public boolean canCompanyBookMentor(UUID companyId, UUID companyProgramId, UUID mentorProfileId)
public Set<UUID> eligibleCompanyMentorIds(UUID companyId, UUID companyProgramId)
```

- [ ] Implement token hashing inside the service:

```java
private String generateRawToken() {
    return UUID.randomUUID() + "-" + UUID.randomUUID();
}

private String hashToken(String rawToken) {
    try {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(hash);
    } catch (NoSuchAlgorithmException e) {
        throw new IllegalStateException("SHA-256 is not available", e);
    }
}
```

- [ ] Normalize phones through `PhoneNumberUtil.normalizeToE164`. Reject missing or invalid phone values during single invite and import validation.

- [ ] Implement strict import parsing with Apache POI. Required headers are `email` and `phone`; supported optional headers are `first_name`, `last_name`, `title`, `department`, `tags`, `visibility`, and `program_or_cohort`. Treat duplicate email or phone in the same file as row errors. Treat existing active membership and existing open invitation for the same company as row errors. Treat existing Prosper Mentor accounts as `existingProsperMentor=true`, not as errors.

- [ ] When sending or resending an invite, update delivery state with these exact rules:
  - email success, WhatsApp success: status `SENT`, both delivery statuses `SENT`
  - email success, WhatsApp failure: status `SENT`, email `SENT`, WhatsApp `FAILED`
  - email failure, WhatsApp success: status `SENT`, email `FAILED`, WhatsApp `SENT`
  - both failure: status `FAILED_DELIVERY`, both delivery statuses `FAILED`

- [ ] When accepting an invite:
  - verify token hash exists
  - reject expired, accepted, or cancelled invitations
  - require profile role `mentor`
  - create or reactivate the membership for the invitation company and mentor profile
  - set `publicListingPreexisting=true` if the mentor already has role `mentor` and a mentor profile row before acceptance
  - copy invitation visibility into membership
  - set `publicApprovalStatus=REQUESTED` when visibility is `PUBLIC_REQUESTED`
  - mark invitation `ACCEPTED`, clear token hash, set `acceptedProfile` and `acceptedAt`
  - derive `profileComplete`, `availabilityComplete`, and `companyBookable`

- [ ] Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests CompanyMentorEnrollmentServiceTest
```

Expected result: all service tests pass.

- [ ] Commit service work:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
git status --short
git add src/main/java/com/prosper/prospermentor/dto/CompanyMentorDtos.java \
  src/main/java/com/prosper/prospermentor/service/CompanyMentorEnrollmentService.java \
  src/main/java/com/prosper/prospermentor/service/notification/CompanyMentorNotificationService.java \
  src/main/resources/templates/email/company-mentor-invitation.html \
  src/main/resources/templates/whatsapp/company-mentor-invitation.md \
  src/test/java/com/prosper/prospermentor/service/CompanyMentorEnrollmentServiceTest.java
git commit -m "Implement company mentor invitation lifecycle"
```

---

## Task 3: Backend Controllers, Security, And Public Invite APIs

### Tests First

- [ ] Create `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/controller/CompanyMentorEnrollmentControllerTest.java` with tests for:
  - `GET /verify` returns invite context without authentication.
  - `POST /accept` requires authenticated mentor profile id from `SupabaseUserDetails`.
  - company admin invite endpoint rejects non-company admins.
  - import endpoint accepts only `.xlsx`.
  - resend endpoint returns bad request for accepted invites.

- [ ] Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests CompanyMentorEnrollmentControllerTest
```

Expected result: tests fail because controllers are not created yet.

### Implementation

- [ ] Create `CompanyMentorEnrollmentController` under `/api/v1` with these routes:

```java
@GetMapping("/company-mentor-invitations/verify")
public ResponseEntity<ApiResponse<CompanyMentorDtos.VerifyInviteResponse>> verify(@RequestParam String token)

@PostMapping("/company-mentor-invitations/accept")
public ResponseEntity<ApiResponse<CompanyMentorDtos.PoolMemberDto>> accept(@Valid @RequestBody CompanyMentorDtos.AcceptInviteRequest request, Authentication authentication)

@GetMapping("/companies/{companyId}/mentor-pool")
public ResponseEntity<ApiResponse<CompanyMentorDtos.MentorPoolResponse>> getMentorPool(...)

@PostMapping("/companies/{companyId}/mentor-invitations")
public ResponseEntity<ApiResponse<CompanyMentorDtos.InvitationDto>> invite(...)

@PostMapping(value = "/companies/{companyId}/mentor-invitations/validate-import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<ApiResponse<CompanyMentorDtos.ImportValidationResponse>> validateImport(...)

@PostMapping(value = "/companies/{companyId}/mentor-invitations/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<ApiResponse<CompanyMentorDtos.ImportValidationResponse>> importMentors(...)

@PostMapping("/companies/{companyId}/mentor-invitations/{invitationId}/resend")
public ResponseEntity<ApiResponse<CompanyMentorDtos.InvitationDto>> resend(...)

@PatchMapping("/companies/{companyId}/mentor-pool/{membershipId}/visibility")
public ResponseEntity<ApiResponse<CompanyMentorDtos.PoolMemberDto>> updateVisibility(...)

@DeleteMapping("/companies/{companyId}/mentor-pool/{membershipId}")
public ResponseEntity<ApiResponse<Void>> remove(...)
```

- [ ] Put company admin authorization in this controller, not in the frontend. Reuse the current `CompanyController` logic as a private helper:

```java
private SupabaseUserDetails requireCompanyAdmin(Authentication authentication, UUID companyId) {
    if (authentication == null || !(authentication.getPrincipal() instanceof SupabaseUserDetails userDetails)) {
        throw new SecurityException("Authentication is required");
    }
    if (!userDetails.isCompanyAdmin()) {
        throw new SecurityException("Company admin access is required");
    }
    UUID userId = userDetails.getUserIdAsUuid();
    UUID profileCompanyId = profileService.getProfileWithCompany(userId)
            .map(profile -> profile.getCompany() != null ? profile.getCompany().getId() : null)
            .orElse(null);
    if (profileCompanyId == null || !profileCompanyId.equals(companyId)) {
        throw new SecurityException("Not authorized to access this company");
    }
    return userDetails;
}
```

- [ ] Create `AdminCompanyMentorApprovalController` for Prosper-admin public approval:

```java
@RestController
@RequestMapping("/api/v1/admin/company-mentor-approvals")
@RequiredArgsConstructor
public class AdminCompanyMentorApprovalController {
    private final CompanyMentorEnrollmentService companyMentorEnrollmentService;

    @PostMapping("/{membershipId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CompanyMentorDtos.PoolMemberDto>> approve(@PathVariable UUID membershipId, Authentication authentication) {
        UUID approvedBy = ((SupabaseUserDetails) authentication.getPrincipal()).getUserIdAsUuid();
        return ResponseEntity.ok(ApiResponse.success("Public visibility approved", companyMentorEnrollmentService.approvePublicVisibility(membershipId, approvedBy)));
    }

    @PostMapping("/{membershipId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CompanyMentorDtos.PoolMemberDto>> reject(@PathVariable UUID membershipId, Authentication authentication) {
        UUID rejectedBy = ((SupabaseUserDetails) authentication.getPrincipal()).getUserIdAsUuid();
        return ResponseEntity.ok(ApiResponse.success("Public visibility rejected", companyMentorEnrollmentService.rejectPublicVisibility(membershipId, rejectedBy)));
    }
}
```

- [ ] Modify `SecurityConfig.java`:

```java
.requestMatchers(HttpMethod.GET, "/api/v1/company-mentor-invitations/verify").permitAll()
```

Do not permit `POST /api/v1/company-mentor-invitations/accept`; it must derive the mentor profile id from the authenticated Supabase JWT.

- [ ] Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests CompanyMentorEnrollmentControllerTest
```

Expected result: controller tests pass.

- [ ] Commit controller/security work:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
git status --short
git add src/main/java/com/prosper/prospermentor/controller/CompanyMentorEnrollmentController.java \
  src/main/java/com/prosper/prospermentor/controller/AdminCompanyMentorApprovalController.java \
  src/main/java/com/prosper/prospermentor/config/SecurityConfig.java \
  src/test/java/com/prosper/prospermentor/controller/CompanyMentorEnrollmentControllerTest.java
git commit -m "Add company mentor enrollment APIs"
```

---

## Task 4: Backend Discovery, Matching, And Booking Privacy Enforcement

### Tests First

- [ ] Create `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/ProfileServiceCompanyMentorVisibilityTest.java` with tests for:
  - company-private invited mentors are absent from public mentor list.
  - public-approved company mentors are included in public mentor list.
  - existing public mentors remain visible after accepting a company-private membership.
  - public mentor detail returns 404 for company-private invited mentors without public approval.

- [ ] Create `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/CompanyProgramMentorAssignmentServiceCompanyPoolTest.java` with tests for:
  - owning company candidate list includes company-bookable private mentors.
  - program-restricted mentors appear only for scoped company programs.
  - other companies cannot see company-private mentors in candidate lists.

- [ ] Create `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/SessionBookingServiceCompanyMentorVisibilityTest.java` with tests for:
  - company program booking succeeds with assigned company-bookable mentor.
  - booking fails when mentor membership is removed.
  - booking fails when mentor is private to another company.
  - B2C booking fails for a company-private invited mentor without public approval.

- [ ] Run the failing tests:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests ProfileServiceCompanyMentorVisibilityTest \
  --tests CompanyProgramMentorAssignmentServiceCompanyPoolTest \
  --tests SessionBookingServiceCompanyMentorVisibilityTest
```

Expected result: tests fail because visibility enforcement is not wired yet.

### Implementation

- [ ] Modify `ProfileRepository.java`. Replace public mentor listing query usage with a new query that excludes company-sourced private mentors unless approved:

```java
@Query(value = """
    SELECT * FROM profiles p
    WHERE p.role = CAST(:role AS user_role)
    AND (:isVerified IS NULL OR p.is_verified = :isVerified)
    AND (:searchTerm IS NULL OR
         LOWER(p.first_name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR
         LOWER(p.last_name) LIKE LOWER(CONCAT('%', :searchTerm, '%')))
    AND NOT EXISTS (
        SELECT 1
        FROM company_mentor_pool_memberships cmm
        WHERE cmm.mentor_profile_id = p.id
          AND cmm.membership_status = 'ACTIVE'
          AND cmm.public_listing_preexisting = false
          AND cmm.public_approval_status <> 'APPROVED'
    )
    """,
    countQuery = """
    SELECT COUNT(*) FROM profiles p
    WHERE p.role = CAST(:role AS user_role)
    AND (:isVerified IS NULL OR p.is_verified = :isVerified)
    AND (:searchTerm IS NULL OR
         LOWER(p.first_name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR
         LOWER(p.last_name) LIKE LOWER(CONCAT('%', :searchTerm, '%')))
    AND NOT EXISTS (
        SELECT 1
        FROM company_mentor_pool_memberships cmm
        WHERE cmm.mentor_profile_id = p.id
          AND cmm.membership_status = 'ACTIVE'
          AND cmm.public_listing_preexisting = false
          AND cmm.public_approval_status <> 'APPROVED'
    )
    """,
    nativeQuery = true)
Page<Profile> findPublicMentorsWithFilters(
    @Param("role") String role,
    @Param("isVerified") Boolean isVerified,
    @Param("searchTerm") String searchTerm,
    Pageable pageable);
```

- [ ] Modify `ProfileService.getAllMentorsPaginated` to call `findPublicMentorsWithFilters`.

- [ ] Add a `ProfileService.isPublicMentorVisible(UUID mentorId)` method that delegates to `CompanyMentorEnrollmentService.isMentorPubliclyDiscoverable(mentorId)` and use it in `ProfileController.getMentorById`. Return 404 when false.

- [ ] Modify `CompanyProgramMentorCandidateDto.java` to expose company pool source and bookability:

```java
private UUID companyMentorMembershipId;
private Boolean companyBookable;
private String visibilityMode;
private String publicApprovalStatus;
```

- [ ] Modify `CompanyProgramMentorAssignmentService.resolveCandidateMentorIds` to union normal program/global mentors with `companyMentorEnrollmentService.eligibleCompanyMentorIds(companyId, companyProgramId)`. The service must be injected through the constructor.

- [ ] Modify `CompanyProgramMentorAssignmentService.toMentorCandidateDto` so company-private candidates use source `COMPANY_POOL` and include membership id, visibility mode, public approval status, and `companyBookable=true`.

- [ ] Modify `CompanyProgramMentorAssignmentService.assignMentor` to call `companyMentorEnrollmentService.canCompanyBookMentor(companyId, companyProgramId, mentorId)` before rejecting a mentor that is not in the regular program pool.

- [ ] Modify `SessionBookingService.createSessionRequest` after mentor/mentee role validation:

```java
UUID mentorId = UUID.fromString(request.getMentorId());
UUID requestedProgramId = parseOptionalUuid(request.getCompanyProgramId());
UUID menteeCompanyId = mentee.getCompany() != null ? mentee.getCompany().getId() : null;

if (requestedProgramId == null) {
    if (!companyMentorEnrollmentService.isMentorPubliclyDiscoverable(mentorId)) {
        throw new IllegalArgumentException("Selected mentor is not available for public booking");
    }
} else if (menteeCompanyId == null || !companyMentorEnrollmentService.canCompanyBookMentor(menteeCompanyId, requestedProgramId, mentorId)) {
    throw new IllegalArgumentException("Selected mentor is not available for this company program");
}
```

- [ ] Inject `CompanyMentorEnrollmentService` into `SessionBookingService`.

- [ ] Run:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests ProfileServiceCompanyMentorVisibilityTest \
  --tests CompanyProgramMentorAssignmentServiceCompanyPoolTest \
  --tests SessionBookingServiceCompanyMentorVisibilityTest
```

Expected result: privacy, matching, and booking tests pass.

- [ ] Run backend regression suite:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test
```

Expected result: all backend tests pass.

- [ ] Commit privacy enforcement:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
git status --short
git add src/main/java/com/prosper/prospermentor/repository/ProfileRepository.java \
  src/main/java/com/prosper/prospermentor/service/ProfileService.java \
  src/main/java/com/prosper/prospermentor/controller/ProfileController.java \
  src/main/java/com/prosper/prospermentor/service/CompanyProgramMentorAssignmentService.java \
  src/main/java/com/prosper/prospermentor/dto/CompanyProgramMentorCandidateDto.java \
  src/main/java/com/prosper/prospermentor/service/SessionBookingService.java \
  src/test/java/com/prosper/prospermentor/service/ProfileServiceCompanyMentorVisibilityTest.java \
  src/test/java/com/prosper/prospermentor/service/CompanyProgramMentorAssignmentServiceCompanyPoolTest.java \
  src/test/java/com/prosper/prospermentor/service/SessionBookingServiceCompanyMentorVisibilityTest.java
git commit -m "Enforce company mentor visibility"
```

---

## Task 5: Enterprise Frontend API Types, Request Module, And Store

### Tests First

- [ ] Create `/Users/macbookpro/WebstormProjects/myProsperV2/tests/company-mentor-enrollment-store.test.mjs`:

```js
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const typesSource = readFileSync(new URL('../types/company-mentors.ts', import.meta.url), 'utf8')
const requestSource = readFileSync(new URL('../http/requests/app/companyMentors.ts', import.meta.url), 'utf8')
const storeSource = readFileSync(new URL('../store/modules/companyMentors.ts', import.meta.url), 'utf8')

assert.match(typesSource, /CompanyMentorInvitation/)
assert.match(typesSource, /CompanyMentorPoolMember/)
assert.match(typesSource, /CompanyMentorImportValidationResponse/)
assert.match(typesSource, /COMPANY_PRIVATE|PROGRAM_RESTRICTED|PUBLIC_REQUESTED|PUBLIC_APPROVED/)

assert.match(requestSource, /\/v1\/companies\/\$\{companyId\}\/mentor-pool/)
assert.match(requestSource, /\/v1\/companies\/\$\{companyId\}\/mentor-invitations/)
assert.match(requestSource, /validate-import/)
assert.match(requestSource, /\/resend/)
assert.match(requestSource, /\/visibility/)

assert.match(storeSource, /defineStore\('companyMentors'/)
assert.match(storeSource, /loadMentorPool/)
assert.match(storeSource, /inviteMentor/)
assert.match(storeSource, /validateImport/)
assert.match(storeSource, /importMentors/)
assert.match(storeSource, /resendInvitation/)
assert.match(storeSource, /updateVisibility/)
assert.match(storeSource, /removeMembership/)

console.log('Company mentor enrollment store contract verified.')
```

- [ ] Run the failing frontend contract test:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
node tests/company-mentor-enrollment-store.test.mjs
```

Expected result: test fails because files do not exist yet.

### Implementation

- [ ] Create `types/company-mentors.ts` with visibility/status union types and interfaces matching `CompanyMentorDtos`.

- [ ] Create `http/requests/app/companyMentors.ts`:

```ts
import axiosInstance from '../../axios/index'
import type {
  CompanyMentorImportValidationResponse,
  CompanyMentorInvitePayload,
  CompanyMentorInviteResponse,
  CompanyMentorPoolResponse,
  CompanyMentorVisibilityPayload,
  CompanyMentorVisibilityResponse,
} from '~/types/company-mentors'

export default {
  getMentorPool(companyId: string, params: { page?: number; size?: number; search?: string } = {}): Promise<{ data: CompanyMentorPoolResponse }> {
    return axiosInstance.get(`/v1/companies/${companyId}/mentor-pool`, { params })
  },

  inviteMentor(companyId: string, payload: CompanyMentorInvitePayload): Promise<{ data: CompanyMentorInviteResponse }> {
    return axiosInstance.post(`/v1/companies/${companyId}/mentor-invitations`, payload)
  },

  validateImport(companyId: string, file: File): Promise<{ data: CompanyMentorImportValidationResponse }> {
    const formData = new FormData()
    formData.append('file', file)
    return axiosInstance.post(`/v1/companies/${companyId}/mentor-invitations/validate-import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  importMentors(companyId: string, file: File): Promise<{ data: CompanyMentorImportValidationResponse }> {
    const formData = new FormData()
    formData.append('file', file)
    return axiosInstance.post(`/v1/companies/${companyId}/mentor-invitations/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  resendInvitation(companyId: string, invitationId: string): Promise<{ data: CompanyMentorInviteResponse }> {
    return axiosInstance.post(`/v1/companies/${companyId}/mentor-invitations/${invitationId}/resend`)
  },

  updateVisibility(companyId: string, membershipId: string, payload: CompanyMentorVisibilityPayload): Promise<{ data: CompanyMentorVisibilityResponse }> {
    return axiosInstance.patch(`/v1/companies/${companyId}/mentor-pool/${membershipId}/visibility`, payload)
  },

  removeMembership(companyId: string, membershipId: string): Promise<{ data: { success: boolean; message: string; data: null } }> {
    return axiosInstance.delete(`/v1/companies/${companyId}/mentor-pool/${membershipId}`)
  },
}
```

- [ ] Create `store/modules/companyMentors.ts` with state:

```ts
state: () => ({
  isLoading: false,
  isSubmitting: false,
  error: null as string | null,
  invitations: [] as CompanyMentorInvitation[],
  members: [] as CompanyMentorPoolMember[],
  metrics: null as CompanyMentorPoolMetrics | null,
  importValidation: null as CompanyMentorImportValidation | null,
  searchQuery: '',
})
```

Actions must call the request module and reload pool state after mutating actions.

- [ ] Run:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
node tests/company-mentor-enrollment-store.test.mjs
```

Expected result: store contract test passes.

- [ ] Commit enterprise data layer:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
git status --short
git add types/company-mentors.ts \
  http/requests/app/companyMentors.ts \
  store/modules/companyMentors.ts \
  tests/company-mentor-enrollment-store.test.mjs
git commit -m "Add company mentor enrollment frontend data layer"
```

---

## Task 6: Enterprise Company Mentors Workspace UI

### Tests First

- [ ] Create `/Users/macbookpro/WebstormProjects/myProsperV2/tests/company-mentor-enrollment-ui.test.mjs`:

```js
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const pageSource = readFileSync(new URL('../pages/app/admin/mentors.vue', import.meta.url), 'utf8')
const inviteDialogSource = readFileSync(new URL('../components/app/admin/mentors/InviteCompanyMentorDialog.vue', import.meta.url), 'utf8')
const importDialogSource = readFileSync(new URL('../components/app/admin/mentors/ImportCompanyMentorsDialog.vue', import.meta.url), 'utf8')
const visibilityDialogSource = readFileSync(new URL('../components/app/admin/mentors/EditCompanyMentorVisibilityDialog.vue', import.meta.url), 'utf8')

assert.match(pageSource, /useCompanyMentorsStore/)
assert.match(pageSource, /InviteCompanyMentorDialog/)
assert.match(pageSource, /ImportCompanyMentorsDialog/)
assert.match(pageSource, /EditCompanyMentorVisibilityDialog/)
assert.match(pageSource, /Pending invites/)
assert.match(pageSource, /Company-bookable/)
assert.match(pageSource, /Email delivery/)
assert.match(pageSource, /WhatsApp delivery/)
assert.match(pageSource, /Public approval/)
assert.match(pageSource, /resendInvitation/)

assert.match(inviteDialogSource, /email/)
assert.match(inviteDialogSource, /phone/)
assert.match(inviteDialogSource, /COMPANY_PRIVATE/)
assert.match(inviteDialogSource, /PROGRAM_RESTRICTED/)
assert.match(inviteDialogSource, /PUBLIC_REQUESTED/)

assert.match(importDialogSource, /validateImport/)
assert.match(importDialogSource, /importMentors/)
assert.match(importDialogSource, /rowNumber/)
assert.match(importDialogSource, /:disabled="[^"]*errors/)

assert.match(visibilityDialogSource, /updateVisibility/)
assert.match(visibilityDialogSource, /companyProgramIds/)

console.log('Company mentor enrollment UI verified.')
```

- [ ] Run:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
node tests/company-mentor-enrollment-ui.test.mjs
```

Expected result: test fails because components are not created or page is not wired.

### Implementation

- [ ] Create `CompanyMentorStatusBadge.vue`. It should map invitation, delivery, membership, bookability, and approval statuses to compact badges. Use muted badges for neutral state, destructive for failed/removed/rejected, and default for active/bookable/approved.

- [ ] Create `InviteCompanyMentorDialog.vue` with required email and phone fields, optional name/title/department/tags, and a visibility select. Submit through `companyMentorsStore.inviteMentor(companyId, payload)`.

- [ ] Create `ImportCompanyMentorsDialog.vue` with `.xlsx` file selection, preview table, row-level errors, and disabled confirm while `importValidation.valid === false`. Supported columns visible in the dialog: `email`, `phone`, `first_name`, `last_name`, `title`, `department`, `tags`, `visibility`, `program_or_cohort`.

- [ ] Create `EditCompanyMentorVisibilityDialog.vue` with visibility select and optional program multi-select. It must allow corporate admins to request public visibility but must not expose approval controls.

- [ ] Modify `/Users/macbookpro/WebstormProjects/myProsperV2/pages/app/admin/mentors.vue`:
  - keep the existing `Prosper Mentors` tab
  - change `Company Mentors` tab to load from `useCompanyMentorsStore`
  - show metrics from backend response
  - show pending invitations and active memberships in one operational table
  - add actions: invite, import, resend, edit visibility, remove membership
  - preserve `definePageMeta({ permissions: ['admin:mentors'] })`

- [ ] Update `/Users/macbookpro/WebstormProjects/myProsperV2/tests/corporate-admin-mentors-route.test.mjs` so it still verifies the Prosper tab and now verifies invite/import controls on the Company Mentors tab.

- [ ] Run:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
node tests/company-mentor-enrollment-ui.test.mjs
node tests/corporate-admin-mentors-route.test.mjs
npm run build
```

Expected result: source tests pass and Nuxt build completes.

- [ ] Commit enterprise UI:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
git status --short
git add pages/app/admin/mentors.vue \
  components/app/admin/mentors/InviteCompanyMentorDialog.vue \
  components/app/admin/mentors/ImportCompanyMentorsDialog.vue \
  components/app/admin/mentors/EditCompanyMentorVisibilityDialog.vue \
  components/app/admin/mentors/CompanyMentorStatusBadge.vue \
  tests/company-mentor-enrollment-ui.test.mjs \
  tests/corporate-admin-mentors-route.test.mjs
git commit -m "Build closed-loop company mentor workspace"
```

---

## Task 7: B2C Invite Verification And Acceptance Service

### Tests First

- [ ] Create `/Users/macbookpro/WebstormProjects/prosper-link-africa/src/tests/company-mentor-invite-flow.test.mjs`:

```js
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const inviteFlowSource = readFileSync(new URL('../utils/inviteFlow.ts', import.meta.url), 'utf8')
const serviceSource = readFileSync(new URL('../services/companyMentorInviteService.ts', import.meta.url), 'utf8')
const mentorSignupSource = readFileSync(new URL('../pages/MentorSignupFlow.tsx', import.meta.url), 'utf8')
const authConfirmSource = readFileSync(new URL('../pages/AuthConfirm.tsx', import.meta.url), 'utf8')

assert.match(inviteFlowSource, /getCompanyMentorInviteToken/)
assert.match(inviteFlowSource, /isCompanyMentorInviteMode/)
assert.match(inviteFlowSource, /companyMentorInviteStorageKey/)

assert.match(serviceSource, /verifyCompanyMentorInvite/)
assert.match(serviceSource, /acceptCompanyMentorInvite/)
assert.match(serviceSource, /Authorization/)
assert.match(serviceSource, /\/v1\/company-mentor-invitations\/verify/)
assert.match(serviceSource, /\/v1\/company-mentor-invitations\/accept/)

assert.match(mentorSignupSource, /verifyCompanyMentorInvite/)
assert.match(mentorSignupSource, /acceptCompanyMentorInvite/)
assert.match(mentorSignupSource, /companyInviteContext/)
assert.match(mentorSignupSource, /from=invite/)
assert.match(mentorSignupSource, /flow=mentor/)
assert.match(authConfirmSource, /readPendingCompanyMentorInviteToken/)
assert.match(authConfirmSource, /acceptCompanyMentorInvite/)
assert.match(authConfirmSource, /clearPendingCompanyMentorInviteToken/)

console.log('B2C company mentor invite flow verified.')
```

- [ ] Run:

```bash
cd /Users/macbookpro/WebstormProjects/prosper-link-africa
node --experimental-strip-types src/tests/company-mentor-invite-flow.test.mjs
```

Expected result: test fails because service and helper functions do not exist yet.

### Implementation

- [ ] Add helper functions to `src/utils/inviteFlow.ts`:

```ts
export function getCompanyMentorInviteToken(searchParams: URLSearchParams): string | null {
  const token = searchParams.get('token');
  return token && token.trim() ? token.trim() : null;
}

export function isCompanyMentorInviteMode(searchParams: URLSearchParams): boolean {
  return searchParams.get('from') === 'invite' && Boolean(getCompanyMentorInviteToken(searchParams));
}

export function companyMentorInviteStorageKey(userId: string): string {
  return `company_mentor_invite_token_${userId}`;
}

export const PENDING_COMPANY_MENTOR_INVITE_TOKEN_KEY = 'pending_company_mentor_invite_token';

export function storePendingCompanyMentorInviteToken(token: string): void {
  try {
    sessionStorage.setItem(PENDING_COMPANY_MENTOR_INVITE_TOKEN_KEY, token);
  } catch {
  }
}

export function readPendingCompanyMentorInviteToken(): string | null {
  try {
    return sessionStorage.getItem(PENDING_COMPANY_MENTOR_INVITE_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearPendingCompanyMentorInviteToken(): void {
  try {
    sessionStorage.removeItem(PENDING_COMPANY_MENTOR_INVITE_TOKEN_KEY);
  } catch {
  }
}

export function storeCompanyMentorInviteToken(userId: string, token: string): void {
  try {
    sessionStorage.setItem(companyMentorInviteStorageKey(userId), token);
  } catch {
  }
}

export function readCompanyMentorInviteToken(userId: string): string | null {
  try {
    return sessionStorage.getItem(companyMentorInviteStorageKey(userId));
  } catch {
    return null;
  }
}

export function clearCompanyMentorInviteToken(userId: string): void {
  try {
    sessionStorage.removeItem(companyMentorInviteStorageKey(userId));
  } catch {
  }
}
```

- [ ] Create `src/services/companyMentorInviteService.ts`:

```ts
import { supabase } from '@/integrations/supabase/client';

export interface CompanyMentorInviteContext {
  email: string;
  phone: string;
  firstName?: string | null;
  lastName?: string | null;
  title?: string | null;
  department?: string | null;
  tags?: string[] | null;
  companyId: string;
  companyName: string;
  defaultVisibility?: string | null;
  existingProsperMentor?: boolean;
  expiresAt?: string | null;
}

export interface CompanyMentorInviteApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

function getApiBaseUrl(): string {
  const configuredBase = String(import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
  return configuredBase || '/api';
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }
  return headers;
}

async function parseResponse<T>(response: Response): Promise<CompanyMentorInviteApiResponse<T>> {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.message || body?.error || `Request failed with status ${response.status}`);
  }
  return body;
}

export async function verifyCompanyMentorInvite(token: string): Promise<CompanyMentorInviteContext> {
  const query = new URLSearchParams({ token });
  const response = await fetch(`${getApiBaseUrl()}/v1/company-mentor-invitations/verify?${query.toString()}`);
  const body = await parseResponse<CompanyMentorInviteContext>(response);
  if (!body.success || !body.data) {
    throw new Error(body.message || 'Unable to verify company mentor invite');
  }
  return body.data;
}

export async function acceptCompanyMentorInvite(token: string) {
  const response = await fetch(`${getApiBaseUrl()}/v1/company-mentor-invitations/accept`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ token }),
  });
  const body = await parseResponse(response);
  if (!body.success) {
    throw new Error(body.message || 'Unable to accept company mentor invite');
  }
  return body.data;
}
```

- [ ] Run:

```bash
cd /Users/macbookpro/WebstormProjects/prosper-link-africa
node --experimental-strip-types src/tests/company-mentor-invite-flow.test.mjs
```

Expected result: B2C invite service contract test passes after `MentorSignupFlow` is wired in Task 8.

---

## Task 8: B2C Mentor Signup Flow Invite Context

### Implementation

- [ ] Modify `src/pages/MentorSignupFlow.tsx`:
  - derive `companyInviteToken` from `getCompanyMentorInviteToken(searchParams)`
  - set `isCompanyMentorInvite` for `from=invite` with token
  - keep legacy Supabase invite behavior only for `from=invite` without a company mentor token
  - call `verifyCompanyMentorInvite(companyInviteToken)` on mount
  - store invite context in `companyInviteContext`
  - prefill email, phone, first name, last name, title, department, and company fields from invite context where the user has not typed values
  - allow new mentors without a session to complete the normal account-creation branch
  - after `ensureMentorProfileRow(userId)` and `markProfileComplete(userId)`, call `acceptCompanyMentorInvite(companyInviteToken)` when a Supabase session exists
  - when no Supabase session exists after signup, call `storePendingCompanyMentorInviteToken(companyInviteToken)` before redirecting to `/verify-email`
  - clear stored invite tokens after successful acceptance
  - keep normal mentor signup behavior unchanged when there is no token

- [ ] Use this state shape:

```ts
const companyInviteToken = getCompanyMentorInviteToken(searchParams);
const isCompanyMentorInvite = isCompanyMentorInviteMode(searchParams);
const isLegacyInviteMode = searchParams.get('from') === 'invite' && !companyInviteToken;
const [companyInviteContext, setCompanyInviteContext] = useState<CompanyMentorInviteContext | null>(null);
const [companyInviteError, setCompanyInviteError] = useState<string | null>(null);
```

- [ ] Add verification effect:

```ts
useEffect(() => {
  if (!companyInviteToken) return;
  let cancelled = false;
  void (async () => {
    try {
      const context = await verifyCompanyMentorInvite(companyInviteToken);
      if (cancelled) return;
      setCompanyInviteContext(context);
      setS1((p) => ({
        ...p,
        firstName: p.firstName || context.firstName || '',
        lastName: p.lastName || context.lastName || '',
        email: p.email || context.email || '',
        phone: p.phone || context.phone || '',
      }));
      setS2((p) => ({
        ...p,
        occupation: p.occupation || context.title || '',
        organizationName: p.organizationName || context.companyName || '',
      }));
    } catch (error) {
      if (cancelled) return;
      setCompanyInviteError(error instanceof Error ? error.message : 'Company mentor invite could not be verified');
    }
  })();
  return () => {
    cancelled = true;
  };
}, [companyInviteToken]);
```

- [ ] Add acceptance after profile completion:

```ts
if (companyInviteToken && hasSession) {
  await acceptCompanyMentorInvite(companyInviteToken);
  clearCompanyMentorInviteToken(userId);
  clearPendingCompanyMentorInviteToken();
} else if (companyInviteToken) {
  storePendingCompanyMentorInviteToken(companyInviteToken);
}
```

- [ ] Do not redirect invited mentors away from the normal mentor flow. The route remains `/auth?mode=signup&flow=mentor&from=invite&token=<token>`.

- [ ] Modify `src/pages/AuthConfirm.tsx` so mentors who had to confirm email can accept the company invite after a session is established:

```ts
if (userRole === 'mentor') {
  try {
    const pendingCompanyMentorInviteToken = readPendingCompanyMentorInviteToken();
    if (pendingCompanyMentorInviteToken) {
      await ensureMentorProfileRow(session.user.id);
      await markProfileComplete(session.user.id);
      await acceptCompanyMentorInvite(pendingCompanyMentorInviteToken);
      clearPendingCompanyMentorInviteToken();
    }
  } catch (companyInviteError) {
    console.error('[AuthConfirm] Error accepting pending company mentor invite:', companyInviteError);
    toast.error('Your mentor profile was created, but the company invite could not be accepted. Please ask the company admin to resend the invite.');
  }
}
```

- [ ] Add imports in `AuthConfirm.tsx`:

```ts
import { acceptCompanyMentorInvite } from '@/services/companyMentorInviteService';
import {
  clearPendingCompanyMentorInviteToken,
  ensureMentorProfileRow,
  markProfileComplete,
  readPendingCompanyMentorInviteToken,
} from '@/utils/inviteFlow';
```

- [ ] Run:

```bash
cd /Users/macbookpro/WebstormProjects/prosper-link-africa
node --experimental-strip-types src/tests/company-mentor-invite-flow.test.mjs
npm run lint
npm run build
```

Expected result: B2C source test passes, lint passes, and Vite build completes.

- [ ] Commit B2C invite flow:

```bash
cd /Users/macbookpro/WebstormProjects/prosper-link-africa
git status --short
git add src/utils/inviteFlow.ts \
  src/services/companyMentorInviteService.ts \
  src/pages/MentorSignupFlow.tsx \
  src/pages/AuthConfirm.tsx \
  src/tests/company-mentor-invite-flow.test.mjs
git commit -m "Support company mentor invite acceptance in B2C signup"
```

---

## Task 9: Cross-Repository Contract Verification

- [ ] Start backend locally:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew bootRun
```

Expected result: Spring Boot starts without Flyway errors.

- [ ] In a second terminal, start enterprise frontend:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
npm run dev
```

Expected result: Nuxt dev server starts, usually at `http://localhost:3000`.

- [ ] In a third terminal, start B2C frontend:

```bash
cd /Users/macbookpro/WebstormProjects/prosper-link-africa
npm run dev -- --port 8080
```

Expected result: Vite dev server starts at `http://localhost:8080`.

- [ ] Manually verify the happy path using a test company admin:
  - open `/app/admin/mentors`
  - invite one mentor with a test email and valid phone
  - confirm the row appears as sent or partial delivery
  - open the generated link in B2C
  - confirm the URL is `/auth?mode=signup&flow=mentor&from=invite&token=<token>`
  - complete mentor profile
  - confirm the company mentor row becomes accepted and reflects profile/availability gates

- [ ] Manually verify strict import:
  - upload a workbook with one invalid row and one valid row
  - confirm row-level errors render
  - confirm import button is disabled or the backend rejects without saving
  - upload an all-valid workbook
  - confirm all rows save as invitations

- [ ] Manually verify privacy:
  - create or use a company-private invited mentor
  - request public mentors through `/api/v1/profiles/mentors`
  - confirm the private mentor is absent
  - add that mentor as a candidate in the owning company program
  - confirm other company programs cannot see the mentor unless scoped

- [ ] Stop dev servers cleanly before finishing the task.

---

## Task 10: Full Verification And Final Commits

- [ ] Run backend full tests:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test
```

- [ ] Run enterprise checks:

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
node tests/company-mentor-enrollment-store.test.mjs
node tests/company-mentor-enrollment-ui.test.mjs
node tests/corporate-admin-mentors-route.test.mjs
npm run build
```

- [ ] Run B2C checks:

```bash
cd /Users/macbookpro/WebstormProjects/prosper-link-africa
node --experimental-strip-types src/tests/company-mentor-invite-flow.test.mjs
npm run lint
npm run build
```

- [ ] Inspect staged changes in each repository:

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor && git status --short
cd /Users/macbookpro/WebstormProjects/myProsperV2 && git status --short
cd /Users/macbookpro/WebstormProjects/prosper-link-africa && git status --short
```

- [ ] Leave unrelated user-modified files unstaged.

- [ ] If any repository has uncommitted plan-owned changes after the task commits above, commit only those files with a scoped message.

---

## Rollout Order

1. Backend schema, service, API, and privacy enforcement.
2. Enterprise admin workspace for invite/import/status/visibility.
3. B2C invite verification and acceptance inside the normal mentor signup flow.
4. Manual cross-repository smoke test with a test company and mentor.
5. Production release using the agreed ProsperMentor release process.

## Completion Criteria

- Backend tests prove strict import, token lifecycle, existing-account attachment, company bookability, public discovery privacy, program-scope filtering, and booking enforcement.
- Enterprise admin can invite, import, resend, edit visibility, remove company pool memberships, and inspect delivery/activation metrics.
- B2C mentors continue the normal mentor signup flow with invite context and accepted company membership.
- Private company mentors are never visible or bookable outside their allowed company/program context unless public approval is granted or they were already a public Prosper Mentor before company attachment.
- All listed verification commands pass, or any failure is documented with the exact command and failure reason.
