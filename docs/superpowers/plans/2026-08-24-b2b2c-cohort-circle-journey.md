# B2B2C Cohort Circle Journey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build first-class B2B2C cohorts under company programs, with cohort intake, plenary gates, circle formation, matching eligibility, employee cohort status, and cohort dashboard metrics.

**Architecture:** Keep `CompanyProgram` as the long-lived enterprise program and introduce cohort/circle domain models as child records in the backend. Keep frontend cohort behavior in a focused request module and Pinia store, then plug admin views into the existing program detail route and employee views into the existing My Program surface. Matching and journey services consume cohort gate status but do not own circle business rules.

**Tech Stack:** Spring Boot 3.5, Java 17, JPA/Hibernate, Flyway, PostgreSQL, JUnit 5, Mockito, Nuxt 3, Vue 3, TypeScript, Pinia, Tailwind, shadcn-nuxt UI primitives, Node `.mjs` source tests, `npm run build`, Gradle.

---

## Source Requirements

- Product design: `/Users/macbookpro/WebstormProjects/myProsperV2/docs/superpowers/specs/2026-08-24-b2b2c-cohort-circle-journey-design.md`
- Frontend repo: `/Users/macbookpro/WebstormProjects/myProsperV2`
- Backend repo: `/Users/macbookpro/IdeaProjects/ProsperMentor`
- Backend latest migration at plan creation: `V76__Create_password_reset_tokens.sql`
- Existing backend program model:
  - `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/entity/CompanyProgram.java`
  - `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/entity/CompanyProgramParticipant.java`
  - `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/CompanyProgramParticipantService.java`
  - `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/CompanyProgramMatchWorkspaceService.java`
- Existing frontend program surfaces:
  - `/Users/macbookpro/WebstormProjects/myProsperV2/pages/app/admin/programs/[programId].vue`
  - `/Users/macbookpro/WebstormProjects/myProsperV2/pages/app/employee/programs/[programId].vue`
  - `/Users/macbookpro/WebstormProjects/myProsperV2/http/requests/app/companyPrograms.ts`
  - `/Users/macbookpro/WebstormProjects/myProsperV2/store/modules/company-programs.ts`
  - `/Users/macbookpro/WebstormProjects/myProsperV2/utils/roleManager.ts`
  - `/Users/macbookpro/WebstormProjects/myProsperV2/types/auth.ts`

## Scope Split

This is one coordinated feature because all surfaces depend on the same cohort/circle data model. Execute the tasks in order. Each group creates working, testable software:

- Tasks 1-6: backend cohort foundation, gates, and APIs.
- Tasks 7-10: frontend data layer and admin cohort operations.
- Task 11: employee cohort status experience.
- Task 12: reporting and verification.

## File Structure Map

### Backend Create

- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/resources/db/migration/V77__Create_company_program_cohorts_and_circles.sql`
  - Creates cohort, cohort participant, join request, attendance, circle, membership, and note tables.
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/entity/CompanyProgramCohort.java`
  - Owns one repeatable delivery cycle under a company program.
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/entity/CompanyProgramCohortParticipant.java`
  - Owns a mentee's cycle-specific participation state.
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/entity/CompanyProgramCohortJoinRequest.java`
  - Owns pending self-join submissions.
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/entity/CompanyProgramCohortPlenaryAttendance.java`
  - Owns plenary attendance evidence.
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/entity/CommonInterestCircle.java`
  - Owns a circle inside a cohort.
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/entity/CommonInterestCircleMembership.java`
  - Owns one mentee placement or request in a circle.
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/entity/CommonInterestCircleNote.java`
  - Owns facilitator/admin notes.
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/repository/CompanyProgramCohortRepository.java`
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/repository/CompanyProgramCohortParticipantRepository.java`
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/repository/CompanyProgramCohortJoinRequestRepository.java`
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/repository/CompanyProgramCohortPlenaryAttendanceRepository.java`
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/repository/CommonInterestCircleRepository.java`
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/repository/CommonInterestCircleMembershipRepository.java`
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/repository/CommonInterestCircleNoteRepository.java`
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/CompanyProgramCohortDto.java`
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/CompanyProgramCohortParticipantDto.java`
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/CreateCompanyProgramCohortRequest.java`
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/UpdateCompanyProgramCohortRequest.java`
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/CohortSelfJoinRequest.java`
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/CohortSelfJoinResponseDto.java`
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/ConfirmCohortJoinRequest.java`
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/ResolveCohortDuplicateRequest.java`
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/RecordPlenaryAttendanceRequest.java`
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/CreateCommonInterestCircleRequest.java`
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/UpdateCommonInterestCircleRequest.java`
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/PlaceCircleParticipantRequest.java`
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/MoveCircleMembershipRequest.java`
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/CompanyProgramCohortWorkspaceDto.java`
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/CommonInterestCircleDto.java`
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/EmployeeCompanyProgramCohortDto.java`
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/CompanyProgramCohortService.java`
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/CompanyProgramCohortIntakeService.java`
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/CompanyProgramCohortGateService.java`
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/CommonInterestCircleService.java`
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/controller/CompanyProgramCohortController.java`
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/CompanyProgramCohortSchemaTest.java`
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/CompanyProgramCohortServiceTest.java`
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/CompanyProgramCohortIntakeServiceTest.java`
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/CommonInterestCircleServiceTest.java`
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/CompanyProgramCohortGateServiceTest.java`

### Backend Modify

- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/repository/ProfileRepository.java`
  - Add phone/email duplicate lookup.
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/CompanyProgramMatchWorkspaceService.java`
  - Apply cohort gate status when deriving matching workspace status.
- `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/MatchWorkspaceSummaryDto.java`
  - Add `blockedReason`.

### Frontend Create

- `/Users/macbookpro/WebstormProjects/myProsperV2/http/requests/app/companyProgramCohorts.ts`
  - Owns all cohort/circle API types and request methods.
- `/Users/macbookpro/WebstormProjects/myProsperV2/store/modules/company-program-cohorts.ts`
  - Owns cohort list/detail, intake, plenary, circles, matching workspace, dashboard, and employee cohort state.
- `/Users/macbookpro/WebstormProjects/myProsperV2/components/app/admin/cohorts/CompanyProgramCohortList.vue`
- `/Users/macbookpro/WebstormProjects/myProsperV2/components/app/admin/cohorts/CompanyProgramCohortEditorDialog.vue`
- `/Users/macbookpro/WebstormProjects/myProsperV2/components/app/admin/cohorts/CohortIntakePanel.vue`
- `/Users/macbookpro/WebstormProjects/myProsperV2/components/app/admin/cohorts/CohortPlenaryPanel.vue`
- `/Users/macbookpro/WebstormProjects/myProsperV2/components/app/admin/cohorts/CohortCirclesPanel.vue`
- `/Users/macbookpro/WebstormProjects/myProsperV2/components/app/admin/cohorts/CohortMatchingPanel.vue`
- `/Users/macbookpro/WebstormProjects/myProsperV2/components/app/admin/cohorts/CohortDashboardPanel.vue`
- `/Users/macbookpro/WebstormProjects/myProsperV2/components/app/employee/cohorts/EmployeeCohortStatusCard.vue`
- `/Users/macbookpro/WebstormProjects/myProsperV2/pages/app/admin/programs/[programId]/cohorts/[cohortId].vue`
- `/Users/macbookpro/WebstormProjects/myProsperV2/pages/app/employee/join-cohort.vue`
- `/Users/macbookpro/WebstormProjects/myProsperV2/tests/b2b2c-cohort-data-layer.test.mjs`
- `/Users/macbookpro/WebstormProjects/myProsperV2/tests/b2b2c-admin-cohort-ui.test.mjs`
- `/Users/macbookpro/WebstormProjects/myProsperV2/tests/b2b2c-employee-cohort-ui.test.mjs`

### Frontend Modify

- `/Users/macbookpro/WebstormProjects/myProsperV2/pages/app/admin/programs/[programId].vue`
  - Add `Cohorts` tab and cohort list component.
- `/Users/macbookpro/WebstormProjects/myProsperV2/pages/app/employee/programs/[programId].vue`
  - Add employee cohort status card above the existing journey sections.
- `/Users/macbookpro/WebstormProjects/myProsperV2/pages/app/employee/programs/index.vue`
  - Add join-code entry point when employee has no active cohort.
- `/Users/macbookpro/WebstormProjects/myProsperV2/types/auth.ts`
  - Add optional `MANAGE_PROGRAM_COHORTS` permission constant.
- `/Users/macbookpro/WebstormProjects/myProsperV2/utils/roleManager.ts`
  - Register admin cohort route permissions.

## Task 0: Preflight

- [ ] Check frontend worktree state.

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
git status --short
```

Expected result at plan creation: unrelated modified files may exist, including `AGENTS.md`, `components/NautixWebChat.client.vue`, `nuxt.config.ts`, and `tests/nautix-webchat.test.mjs`. Do not revert them. Only stage files touched by this plan.

- [ ] Check backend worktree state.

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
git status --short
```

Expected result at plan creation: unrelated modified files may exist, including session booking files plus `output/` and `tmp/`. Do not revert them. Only stage files touched by this plan.

- [ ] Confirm backend migration number.

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
ls src/main/resources/db/migration | sort -V | tail -5
```

Expected output includes `V76__Create_password_reset_tokens.sql`. Use `V77__Create_company_program_cohorts_and_circles.sql` for this feature unless a newer migration appears before implementation starts.

- [ ] Run existing focused backend tests.

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests CompanyProgramJourneyServiceTest --tests CompanyProgramMatchWorkspaceServiceTest
```

Expected result: PASS. If an unrelated existing failure appears, record it in the task notes and continue only with tests added by this plan.

- [ ] Run existing focused frontend tests.

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
node tests/corporate-admin-program-detail-page.test.mjs
node tests/employee-programs-page-design.test.mjs
```

Expected result: PASS. If the uncommitted Nautix-related files affect `npm run build`, do not edit them as part of this feature.

## Task 1: Backend Schema And Domain Models

**Files:**

- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/resources/db/migration/V77__Create_company_program_cohorts_and_circles.sql`
- Create: backend entity and repository files listed in the File Structure Map.
- Test: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/CompanyProgramCohortSchemaTest.java`

- [ ] Create the failing schema source test.

```java
package com.prosper.prospermentor.service;

import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class CompanyProgramCohortSchemaTest {

    @Test
    void migration_shouldCreateCohortCircleTablesAndConstraints() throws Exception {
        String migration = Files.readString(Path.of(
                "src/main/resources/db/migration/V77__Create_company_program_cohorts_and_circles.sql"
        ));

        assertThat(migration).contains("CREATE TABLE IF NOT EXISTS company_program_cohorts");
        assertThat(migration).contains("CREATE TABLE IF NOT EXISTS company_program_cohort_participants");
        assertThat(migration).contains("CREATE TABLE IF NOT EXISTS company_program_cohort_join_requests");
        assertThat(migration).contains("CREATE TABLE IF NOT EXISTS company_program_cohort_plenary_attendance");
        assertThat(migration).contains("CREATE TABLE IF NOT EXISTS common_interest_circles");
        assertThat(migration).contains("CREATE TABLE IF NOT EXISTS common_interest_circle_memberships");
        assertThat(migration).contains("CREATE TABLE IF NOT EXISTS common_interest_circle_notes");
        assertThat(migration).contains("UNIQUE (company_program_cohort_id, profile_id)");
        assertThat(migration).contains("UNIQUE (circle_id, cohort_participant_id)");
        assertThat(migration).contains("circle_max_size >= circle_min_size");
        assertThat(migration).contains("self_join_code_hash");
    }
}
```

- [ ] Run the failing test.

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests CompanyProgramCohortSchemaTest
```

Expected result: FAIL because the migration file does not exist.

- [ ] Create the Flyway migration with these tables and indexes.

```sql
CREATE TABLE IF NOT EXISTS company_program_cohorts (
    id UUID PRIMARY KEY,
    company_program_id UUID NOT NULL REFERENCES company_programs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(80) NOT NULL,
    chapter VARCHAR(160),
    region VARCHAR(160),
    status VARCHAR(40) NOT NULL DEFAULT 'DRAFT',
    starts_at TIMESTAMP,
    ends_at TIMESTAMP,
    self_join_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    self_join_code_hash VARCHAR(255),
    self_join_expires_at TIMESTAMP,
    self_join_capacity INTEGER,
    circle_min_size INTEGER NOT NULL DEFAULT 5,
    circle_max_size INTEGER NOT NULL DEFAULT 10,
    interest_tag_set JSONB NOT NULL DEFAULT '[]'::jsonb,
    plenary_event_type VARCHAR(40),
    plenary_event_id VARCHAR(160),
    matching_starts_after_circles_finalized BOOLEAN NOT NULL DEFAULT TRUE,
    created_by_user_id UUID,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_company_program_cohorts_status CHECK (status IN (
        'DRAFT', 'INTAKE_OPEN', 'INTAKE_CLOSED', 'PLENARY_SCHEDULED',
        'CIRCLES_FORMING', 'CIRCLES_FINALIZED', 'MATCHING', 'ACTIVE',
        'COMPLETED', 'CANCELLED', 'ARCHIVED'
    )),
    CONSTRAINT chk_company_program_cohorts_plenary_event_type CHECK (
        plenary_event_type IS NULL OR plenary_event_type IN ('SUMMIT_EVENT', 'EXTERNAL_EVENT', 'MANUAL_EVENT')
    ),
    CONSTRAINT chk_company_program_cohorts_circle_sizes CHECK (
        circle_min_size > 0 AND circle_max_size >= circle_min_size
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_company_program_cohorts_program_code
    ON company_program_cohorts(company_program_id, lower(code));
CREATE INDEX IF NOT EXISTS idx_company_program_cohorts_program_status
    ON company_program_cohorts(company_program_id, status);

CREATE TABLE IF NOT EXISTS company_program_cohort_join_requests (
    id UUID PRIMARY KEY,
    company_program_cohort_id UUID NOT NULL REFERENCES company_program_cohorts(id) ON DELETE CASCADE,
    submitted_email VARCHAR(255) NOT NULL,
    submitted_phone VARCHAR(80),
    submitted_first_name VARCHAR(160),
    submitted_last_name VARCHAR(160),
    submitted_chapter VARCHAR(160),
    submitted_region VARCHAR(160),
    submitted_interest_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    matched_profile_id UUID REFERENCES profiles(id),
    status VARCHAR(40) NOT NULL DEFAULT 'PENDING',
    reviewed_by_user_id UUID,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_company_program_cohort_join_requests_status CHECK (
        status IN ('PENDING', 'CONFIRMED', 'REJECTED', 'DUPLICATE_REVIEW', 'EXPIRED')
    )
);

CREATE INDEX IF NOT EXISTS idx_cohort_join_requests_cohort_status
    ON company_program_cohort_join_requests(company_program_cohort_id, status);
CREATE INDEX IF NOT EXISTS idx_cohort_join_requests_email
    ON company_program_cohort_join_requests(lower(submitted_email));

CREATE TABLE IF NOT EXISTS company_program_cohort_participants (
    id UUID PRIMARY KEY,
    company_program_cohort_id UUID NOT NULL REFERENCES company_program_cohorts(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id),
    company_program_participant_id UUID REFERENCES company_program_participants(id),
    source VARCHAR(40) NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'PENDING',
    first_name_snapshot VARCHAR(160),
    last_name_snapshot VARCHAR(160),
    email_snapshot VARCHAR(255),
    phone_snapshot VARCHAR(80),
    chapter VARCHAR(160),
    region VARCHAR(160),
    interest_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    self_join_request_id UUID REFERENCES company_program_cohort_join_requests(id),
    confirmed_by_user_id UUID,
    confirmed_at TIMESTAMP,
    duplicate_status VARCHAR(40) NOT NULL DEFAULT 'CLEAR',
    duplicate_candidate_profile_id UUID REFERENCES profiles(id),
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (company_program_cohort_id, profile_id),
    CONSTRAINT chk_cohort_participants_source CHECK (
        source IN ('ROSTER_UPLOAD', 'MANUAL_ADD', 'SELF_JOIN', 'ADMIN_TRANSFER')
    ),
    CONSTRAINT chk_cohort_participants_status CHECK (
        status IN ('PENDING', 'CONFIRMED', 'PLENARY_ATTENDED', 'PLACED_IN_CIRCLE',
                   'ELIGIBLE_FOR_MATCHING', 'MATCHED', 'ACTIVE', 'COMPLETED',
                   'WITHDRAWN', 'REJECTED')
    ),
    CONSTRAINT chk_cohort_participants_duplicate_status CHECK (
        duplicate_status IN ('CLEAR', 'POSSIBLE_DUPLICATE', 'RESOLVED_EXISTING_PROFILE', 'RESOLVED_NEW_PROFILE')
    )
);

CREATE INDEX IF NOT EXISTS idx_cohort_participants_cohort_status
    ON company_program_cohort_participants(company_program_cohort_id, status);
CREATE INDEX IF NOT EXISTS idx_cohort_participants_program_participant
    ON company_program_cohort_participants(company_program_participant_id);

CREATE TABLE IF NOT EXISTS company_program_cohort_plenary_attendance (
    id UUID PRIMARY KEY,
    company_program_cohort_id UUID NOT NULL REFERENCES company_program_cohorts(id) ON DELETE CASCADE,
    cohort_participant_id UUID NOT NULL REFERENCES company_program_cohort_participants(id) ON DELETE CASCADE,
    attendance_source VARCHAR(40) NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'REGISTERED',
    attended_at TIMESTAMP,
    recorded_by_user_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (company_program_cohort_id, cohort_participant_id),
    CONSTRAINT chk_cohort_plenary_attendance_source CHECK (
        attendance_source IN ('SUMMIT_EVENT', 'IMPORT', 'ADMIN_OVERRIDE')
    ),
    CONSTRAINT chk_cohort_plenary_attendance_status CHECK (
        status IN ('REGISTERED', 'ATTENDED', 'ABSENT', 'EXCUSED')
    )
);

CREATE TABLE IF NOT EXISTS common_interest_circles (
    id UUID PRIMARY KEY,
    company_program_cohort_id UUID NOT NULL REFERENCES company_program_cohorts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    theme VARCHAR(255),
    interest_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    facilitator_profile_id UUID REFERENCES profiles(id),
    min_size INTEGER NOT NULL DEFAULT 5,
    max_size INTEGER NOT NULL DEFAULT 10,
    status VARCHAR(40) NOT NULL DEFAULT 'DRAFT',
    next_session_at TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_common_interest_circles_status CHECK (
        status IN ('DRAFT', 'FORMING', 'FINALIZED', 'ACTIVE', 'COMPLETED', 'CANCELLED')
    ),
    CONSTRAINT chk_common_interest_circles_sizes CHECK (min_size > 0 AND max_size >= min_size)
);

CREATE INDEX IF NOT EXISTS idx_common_interest_circles_cohort_status
    ON common_interest_circles(company_program_cohort_id, status);

CREATE TABLE IF NOT EXISTS common_interest_circle_memberships (
    id UUID PRIMARY KEY,
    circle_id UUID NOT NULL REFERENCES common_interest_circles(id) ON DELETE CASCADE,
    cohort_participant_id UUID NOT NULL REFERENCES company_program_cohort_participants(id) ON DELETE CASCADE,
    placement_source VARCHAR(40) NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'PLACED',
    placed_by_user_id UUID,
    placed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (circle_id, cohort_participant_id),
    CONSTRAINT chk_circle_memberships_placement_source CHECK (
        placement_source IN ('SUGGESTED', 'MENTEE_REQUESTED', 'ADMIN_PLACED', 'ADMIN_MOVED')
    ),
    CONSTRAINT chk_circle_memberships_status CHECK (
        status IN ('PENDING_REQUEST', 'PLACED', 'REMOVED', 'COMPLETED')
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_circle_membership_per_cohort_participant
    ON common_interest_circle_memberships(cohort_participant_id)
    WHERE status IN ('PENDING_REQUEST', 'PLACED');

CREATE TABLE IF NOT EXISTS common_interest_circle_notes (
    id UUID PRIMARY KEY,
    circle_id UUID NOT NULL REFERENCES common_interest_circles(id) ON DELETE CASCADE,
    cohort_participant_id UUID REFERENCES company_program_cohort_participants(id) ON DELETE CASCADE,
    author_profile_id UUID REFERENCES profiles(id),
    note_type VARCHAR(40) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_circle_notes_note_type CHECK (
        note_type IN ('FACILITATOR_NOTE', 'COMPLETION_NOTE', 'ADMIN_NOTE')
    )
);
```

- [ ] Create JPA entities using the same conventions as `CompanyProgram`: Lombok getters/setters, `@GenericGenerator(name = "uuid2", strategy = "uuid2")`, `@Version`, `@PrePersist`, and `@PreUpdate`.

Required enum names:

```java
CompanyProgramCohort.CohortStatus
CompanyProgramCohort.PlenaryEventType
CompanyProgramCohortParticipant.ParticipantSource
CompanyProgramCohortParticipant.CohortParticipantStatus
CompanyProgramCohortParticipant.DuplicateStatus
CompanyProgramCohortJoinRequest.JoinRequestStatus
CompanyProgramCohortPlenaryAttendance.AttendanceSource
CompanyProgramCohortPlenaryAttendance.AttendanceStatus
CommonInterestCircle.CircleStatus
CommonInterestCircleMembership.PlacementSource
CommonInterestCircleMembership.MembershipStatus
CommonInterestCircleNote.NoteType
```

- [ ] Create repositories with these required methods.

```java
List<CompanyProgramCohort> findByCompanyProgram_IdOrderByStartsAtDescCreatedAtDesc(UUID companyProgramId);
Optional<CompanyProgramCohort> findByIdAndCompanyProgram_Company_Id(UUID cohortId, UUID companyId);
Optional<CompanyProgramCohort> findBySelfJoinCodeHashAndSelfJoinEnabledTrue(String selfJoinCodeHash);

List<CompanyProgramCohortParticipant> findByCohort_Id(UUID cohortId);
Optional<CompanyProgramCohortParticipant> findByCohort_IdAndProfile_Id(UUID cohortId, UUID profileId);
List<CompanyProgramCohortParticipant> findByCompanyProgramParticipant_Id(UUID companyProgramParticipantId);
long countByCohort_IdAndStatusNot(UUID cohortId, CompanyProgramCohortParticipant.CohortParticipantStatus status);

List<CommonInterestCircle> findByCohort_IdOrderByCreatedAtAsc(UUID cohortId);
Optional<CommonInterestCircle> findByIdAndCohort_Id(UUID circleId, UUID cohortId);
```

- [ ] Run the schema test.

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests CompanyProgramCohortSchemaTest
```

Expected result: PASS.

- [ ] Commit backend schema and domain files.

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
git add src/main/resources/db/migration/V77__Create_company_program_cohorts_and_circles.sql \
  src/main/java/com/prosper/prospermentor/entity/CompanyProgramCohort.java \
  src/main/java/com/prosper/prospermentor/entity/CompanyProgramCohortParticipant.java \
  src/main/java/com/prosper/prospermentor/entity/CompanyProgramCohortJoinRequest.java \
  src/main/java/com/prosper/prospermentor/entity/CompanyProgramCohortPlenaryAttendance.java \
  src/main/java/com/prosper/prospermentor/entity/CommonInterestCircle.java \
  src/main/java/com/prosper/prospermentor/entity/CommonInterestCircleMembership.java \
  src/main/java/com/prosper/prospermentor/entity/CommonInterestCircleNote.java \
  src/main/java/com/prosper/prospermentor/repository/CompanyProgramCohortRepository.java \
  src/main/java/com/prosper/prospermentor/repository/CompanyProgramCohortParticipantRepository.java \
  src/main/java/com/prosper/prospermentor/repository/CompanyProgramCohortJoinRequestRepository.java \
  src/main/java/com/prosper/prospermentor/repository/CompanyProgramCohortPlenaryAttendanceRepository.java \
  src/main/java/com/prosper/prospermentor/repository/CommonInterestCircleRepository.java \
  src/main/java/com/prosper/prospermentor/repository/CommonInterestCircleMembershipRepository.java \
  src/main/java/com/prosper/prospermentor/repository/CommonInterestCircleNoteRepository.java \
  src/test/java/com/prosper/prospermentor/service/CompanyProgramCohortSchemaTest.java
git commit -m "feat: add cohort and circle schema"
```

## Task 2: Backend Cohort CRUD API

**Files:**

- Create DTO/service/controller files listed in the backend create section.
- Test: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/CompanyProgramCohortServiceTest.java`

- [ ] Write the failing service test.

```java
@ExtendWith(MockitoExtension.class)
class CompanyProgramCohortServiceTest {

    @Mock private CompanyProgramRepository companyProgramRepository;
    @Mock private CompanyProgramCohortRepository cohortRepository;
    @InjectMocks private CompanyProgramCohortService service;

    @Test
    void createCohort_shouldDefaultCircleSizeAndDraftStatus() {
        UUID programId = UUID.fromString("44444444-4444-4444-4444-444444444444");
        UUID userId = UUID.fromString("11111111-1111-1111-1111-111111111111");
        CompanyProgram program = new CompanyProgram();
        program.setId(programId);
        program.setName("G4G Mentorship");

        when(companyProgramRepository.findById(programId)).thenReturn(Optional.of(program));
        when(cohortRepository.save(any(CompanyProgramCohort.class))).thenAnswer(invocation -> {
            CompanyProgramCohort cohort = invocation.getArgument(0);
            cohort.setId(UUID.fromString("55555555-5555-5555-5555-555555555555"));
            return cohort;
        });

        CreateCompanyProgramCohortRequest request = CreateCompanyProgramCohortRequest.builder()
                .name("G4G Nairobi - Q3 2026")
                .code("G4G-NBO-Q3-2026")
                .region("Nairobi")
                .chapter("Nairobi")
                .selfJoinEnabled(true)
                .build();

        CompanyProgramCohortDto dto = service.createCohort(programId, request, userId);

        assertThat(dto.getCompanyProgramId()).isEqualTo(programId);
        assertThat(dto.getStatus()).isEqualTo(CompanyProgramCohort.CohortStatus.DRAFT);
        assertThat(dto.getCircleMinSize()).isEqualTo(5);
        assertThat(dto.getCircleMaxSize()).isEqualTo(10);
        assertThat(dto.isSelfJoinEnabled()).isTrue();
    }
}
```

- [ ] Run the failing test.

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests CompanyProgramCohortServiceTest
```

Expected result: FAIL because service and DTO files do not exist.

- [ ] Create request DTO files in `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/`. Each public request class must be in its own `.java` file so controller and service packages can import it.

Required classes:

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCompanyProgramCohortRequest {
    @NotBlank private String name;
    @NotBlank private String code;
    private String chapter;
    private String region;
    private LocalDateTime startsAt;
    private LocalDateTime endsAt;
    private Boolean selfJoinEnabled;
    private LocalDateTime selfJoinExpiresAt;
    private Integer selfJoinCapacity;
    private Integer circleMinSize;
    private Integer circleMaxSize;
    private List<String> interestTagSet;
    private CompanyProgramCohort.PlenaryEventType plenaryEventType;
    private String plenaryEventId;
    private Boolean matchingStartsAfterCirclesFinalized;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCompanyProgramCohortRequest {
    private String name;
    private String code;
    private String chapter;
    private String region;
    private LocalDateTime startsAt;
    private LocalDateTime endsAt;
    private Boolean selfJoinEnabled;
    private LocalDateTime selfJoinExpiresAt;
    private Integer selfJoinCapacity;
    private Integer circleMinSize;
    private Integer circleMaxSize;
    private List<String> interestTagSet;
    private CompanyProgramCohort.PlenaryEventType plenaryEventType;
    private String plenaryEventId;
    private Boolean matchingStartsAfterCirclesFinalized;
}
```

- [ ] Create `CompanyProgramCohortDto` with all public fields from the design spec plus derived counts: `participantCount`, `pendingCount`, `confirmedCount`, `circleCount`, `unplacedCount`, `matchedCount`.

- [ ] Implement `CompanyProgramCohortService` methods.

Required public methods:

```java
List<CompanyProgramCohortDto> getCohorts(UUID companyProgramId);
CompanyProgramCohortDto getCohort(UUID cohortId);
CompanyProgramCohortDto createCohort(UUID companyProgramId, CreateCompanyProgramCohortRequest request, UUID createdByUserId);
CompanyProgramCohortDto updateCohort(UUID cohortId, UpdateCompanyProgramCohortRequest request);
CompanyProgramCohortDto openIntake(UUID cohortId);
CompanyProgramCohortDto closeIntake(UUID cohortId);
CompanyProgramCohortDto toDto(CompanyProgramCohort cohort);
```

Implementation rules:

- Default `circleMinSize` to `5`.
- Default `circleMaxSize` to `10`.
- Reject `circleMaxSize < circleMinSize`.
- Default `selfJoinEnabled` to `false`.
- Default status to `DRAFT`.
- `openIntake` can move `DRAFT` or `INTAKE_CLOSED` to `INTAKE_OPEN`.
- `closeIntake` can move `INTAKE_OPEN` to `INTAKE_CLOSED`.

- [ ] Create `CompanyProgramCohortController` endpoints.

Required admin endpoints:

```java
GET /api/v1/company-programs/{companyProgramId}/cohorts
POST /api/v1/company-programs/{companyProgramId}/cohorts
GET /api/v1/company-program-cohorts/{cohortId}
PATCH /api/v1/company-program-cohorts/{cohortId}
POST /api/v1/company-program-cohorts/{cohortId}/open-intake
POST /api/v1/company-program-cohorts/{cohortId}/close-intake
```

Use the same response shape as existing controllers: `ResponseEntity<ApiResponse<...>>`.

- [ ] Run the service test.

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests CompanyProgramCohortServiceTest
```

Expected result: PASS.

- [ ] Commit.

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
git add src/main/java/com/prosper/prospermentor/dto/CompanyProgramCohortDto.java \
  src/main/java/com/prosper/prospermentor/dto/CreateCompanyProgramCohortRequest.java \
  src/main/java/com/prosper/prospermentor/dto/UpdateCompanyProgramCohortRequest.java \
  src/main/java/com/prosper/prospermentor/service/CompanyProgramCohortService.java \
  src/main/java/com/prosper/prospermentor/controller/CompanyProgramCohortController.java \
  src/test/java/com/prosper/prospermentor/service/CompanyProgramCohortServiceTest.java
git commit -m "feat: add company program cohort api"
```

## Task 3: Backend Intake, Self-Join, And Duplicate Review

**Files:**

- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/repository/ProfileRepository.java`
- Create/modify: cohort intake DTOs, service, controller.
- Test: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/CompanyProgramCohortIntakeServiceTest.java`

- [ ] Write the failing intake tests.

```java
@ExtendWith(MockitoExtension.class)
class CompanyProgramCohortIntakeServiceTest {

    @Mock private CompanyProgramCohortRepository cohortRepository;
    @Mock private CompanyProgramCohortParticipantRepository cohortParticipantRepository;
    @Mock private CompanyProgramCohortJoinRequestRepository joinRequestRepository;
    @Mock private CompanyProgramParticipantRepository programParticipantRepository;
    @Mock private ProfileRepository profileRepository;
    @Mock private CompanyProgramParticipantService programParticipantService;
    @InjectMocks private CompanyProgramCohortIntakeService service;

    @Test
    void submitSelfJoin_shouldCreatePendingJoinRequestWhenNoDuplicateExists() {
        UUID cohortId = UUID.fromString("55555555-5555-5555-5555-555555555555");
        CompanyProgramCohort cohort = intakeOpenCohort(cohortId);
        when(cohortRepository.findBySelfJoinCodeHashAndSelfJoinEnabledTrue(anyString())).thenReturn(Optional.of(cohort));
        when(profileRepository.findByEmailIgnoreCase("amina@example.com")).thenReturn(Optional.empty());
        when(profileRepository.findByPhoneNormalized("254712000000")).thenReturn(Optional.empty());
        when(joinRequestRepository.save(any(CompanyProgramCohortJoinRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CohortSelfJoinResponseDto response = service.submitSelfJoin("JOIN-CODE", CohortSelfJoinRequest.builder()
                .email("amina@example.com")
                .phone("254712000000")
                .firstName("Amina")
                .lastName("Otieno")
                .interestTags(List.of("STEM"))
                .build());

        assertThat(response.getStatus()).isEqualTo(CompanyProgramCohortJoinRequest.JoinRequestStatus.PENDING);
        assertThat(response.isDuplicateReviewRequired()).isFalse();
    }

    @Test
    void submitSelfJoin_shouldFlagDuplicateReviewWhenEmailMatchesProfile() {
        UUID cohortId = UUID.fromString("55555555-5555-5555-5555-555555555555");
        CompanyProgramCohort cohort = intakeOpenCohort(cohortId);
        Profile existing = new Profile();
        existing.setId(UUID.fromString("22222222-2222-2222-2222-222222222222"));
        existing.setEmail("amina@example.com");

        when(cohortRepository.findBySelfJoinCodeHashAndSelfJoinEnabledTrue(anyString())).thenReturn(Optional.of(cohort));
        when(profileRepository.findByEmailIgnoreCase("amina@example.com")).thenReturn(Optional.of(existing));
        when(joinRequestRepository.save(any(CompanyProgramCohortJoinRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CohortSelfJoinResponseDto response = service.submitSelfJoin("JOIN-CODE", CohortSelfJoinRequest.builder()
                .email("amina@example.com")
                .firstName("Amina")
                .lastName("Otieno")
                .interestTags(List.of("STEM"))
                .build());

        assertThat(response.getStatus()).isEqualTo(CompanyProgramCohortJoinRequest.JoinRequestStatus.DUPLICATE_REVIEW);
        assertThat(response.isDuplicateReviewRequired()).isTrue();
        assertThat(response.getMatchedProfileId()).isEqualTo(existing.getId());
    }
}
```

- [ ] Run the failing test.

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests CompanyProgramCohortIntakeServiceTest
```

Expected result: FAIL because intake service and DTOs do not exist.

- [ ] Add duplicate lookup to `ProfileRepository`.

```java
@Query("""
        SELECT p
        FROM Profile p
        WHERE p.phone IS NOT NULL
          AND REPLACE(REPLACE(REPLACE(p.phone, ' ', ''), '+', ''), '-', '') = :normalizedPhone
        """)
Optional<Profile> findByPhoneNormalized(@Param("normalizedPhone") String normalizedPhone);
```

- [ ] Add intake request/response DTO files in `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/`. Each public request or response class must be in its own `.java` file.

Required classes:

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CohortSelfJoinRequest {
    @Email @NotBlank private String email;
    private String phone;
    @NotBlank private String firstName;
    @NotBlank private String lastName;
    private String chapter;
    private String region;
    private List<String> interestTags;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfirmCohortJoinRequest {
    @NotNull private UUID profileId;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResolveCohortDuplicateRequest {
    @NotNull private UUID profileId;
    @NotNull private CompanyProgramCohortParticipant.DuplicateStatus duplicateStatus;
}
```

- [ ] Implement `CompanyProgramCohortIntakeService`.

Required public methods:

```java
CohortSelfJoinResponseDto getSelfJoinPreview(String joinCode);
CohortSelfJoinResponseDto submitSelfJoin(String joinCode, CohortSelfJoinRequest request);
List<CompanyProgramCohortParticipantDto> getParticipants(UUID cohortId);
CompanyProgramCohortParticipantDto confirmJoinRequest(UUID joinRequestId, UUID profileId, UUID adminUserId);
CompanyProgramCohortParticipantDto rejectJoinRequest(UUID joinRequestId, UUID adminUserId);
CompanyProgramCohortParticipantDto confirmParticipant(UUID cohortParticipantId, UUID adminUserId);
CompanyProgramCohortParticipantDto rejectParticipant(UUID cohortParticipantId, UUID adminUserId);
CompanyProgramCohortParticipantDto resolveDuplicate(UUID cohortParticipantId, ResolveCohortDuplicateRequest request, UUID adminUserId);
```

Implementation rules:

- Hash join codes with SHA-256 before lookup; do not store raw join code values.
- Self-join is allowed only when cohort status is `INTAKE_OPEN`.
- Capacity compares non-rejected participants to `selfJoinCapacity` when capacity is set.
- Exact email duplicate check uses `findByEmailIgnoreCase`.
- Phone duplicate check uses digits-only phone normalization.
- Duplicate self-join creates a `DUPLICATE_REVIEW` join request.
- Confirmation links or creates a program-level `CompanyProgramParticipant`, then creates or updates the cohort participant.
- `REJECTED` records remain visible in intake history and do not progress.

- [ ] Add controller endpoints.

```java
GET /api/v1/company-program-cohorts/join/{joinCode}
POST /api/v1/company-program-cohorts/join/{joinCode}
GET /api/v1/company-program-cohorts/{cohortId}/participants
POST /api/v1/company-program-cohort-join-requests/{joinRequestId}/confirm
POST /api/v1/company-program-cohort-join-requests/{joinRequestId}/reject
POST /api/v1/company-program-cohort-participants/{participantId}/confirm
POST /api/v1/company-program-cohort-participants/{participantId}/reject
POST /api/v1/company-program-cohort-participants/{participantId}/resolve-duplicate
```

Public join-code preview and submission must not return participant rosters, circle rosters, admin notes, or matching details.

- [ ] Run intake tests.

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests CompanyProgramCohortIntakeServiceTest
```

Expected result: PASS.

- [ ] Commit.

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
git add src/main/java/com/prosper/prospermentor/repository/ProfileRepository.java \
  src/main/java/com/prosper/prospermentor/dto/CompanyProgramCohortParticipantDto.java \
  src/main/java/com/prosper/prospermentor/dto/CohortSelfJoinRequest.java \
  src/main/java/com/prosper/prospermentor/dto/CohortSelfJoinResponseDto.java \
  src/main/java/com/prosper/prospermentor/dto/ConfirmCohortJoinRequest.java \
  src/main/java/com/prosper/prospermentor/dto/ResolveCohortDuplicateRequest.java \
  src/main/java/com/prosper/prospermentor/service/CompanyProgramCohortIntakeService.java \
  src/main/java/com/prosper/prospermentor/controller/CompanyProgramCohortController.java \
  src/test/java/com/prosper/prospermentor/service/CompanyProgramCohortIntakeServiceTest.java
git commit -m "feat: add cohort intake and self join"
```

## Task 4: Backend Plenary Attendance And Gates

**Files:**

- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/CompanyProgramCohortGateService.java`
- Modify: cohort DTOs, controller, intake service.
- Test: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/CompanyProgramCohortGateServiceTest.java`

- [ ] Write the failing gate tests.

```java
@ExtendWith(MockitoExtension.class)
class CompanyProgramCohortGateServiceTest {

    @Mock private CompanyProgramCohortParticipantRepository cohortParticipantRepository;
    @Mock private CompanyProgramCohortPlenaryAttendanceRepository attendanceRepository;
    @Mock private CommonInterestCircleMembershipRepository membershipRepository;
    @InjectMocks private CompanyProgramCohortGateService service;

    @Test
    void resolveGateStatus_shouldBlockMatchingBeforePlenaryAttendance() {
        UUID programParticipantId = UUID.fromString("77777777-7777-7777-7777-777777777777");
        CompanyProgramCohortParticipant participant = cohortParticipant(programParticipantId);

        when(cohortParticipantRepository.findByCompanyProgramParticipant_Id(programParticipantId))
                .thenReturn(List.of(participant));
        when(attendanceRepository.findByCohortParticipant_Id(participant.getId())).thenReturn(Optional.empty());

        CohortGateStatusDto status = service.resolveGateStatusForProgramParticipant(programParticipantId);

        assertThat(status.isEligibleForMatching()).isFalse();
        assertThat(status.getBlockedReason()).isEqualTo("PLENARY_NOT_ATTENDED");
    }

    @Test
    void resolveGateStatus_shouldAllowMatchingAfterAttendanceAndCirclePlacement() {
        UUID programParticipantId = UUID.fromString("77777777-7777-7777-7777-777777777777");
        CompanyProgramCohortParticipant participant = cohortParticipant(programParticipantId);
        CompanyProgramCohortPlenaryAttendance attendance = new CompanyProgramCohortPlenaryAttendance();
        attendance.setStatus(CompanyProgramCohortPlenaryAttendance.AttendanceStatus.ATTENDED);

        when(cohortParticipantRepository.findByCompanyProgramParticipant_Id(programParticipantId))
                .thenReturn(List.of(participant));
        when(attendanceRepository.findByCohortParticipant_Id(participant.getId())).thenReturn(Optional.of(attendance));
        when(membershipRepository.existsByCohortParticipant_IdAndStatus(
                participant.getId(),
                CommonInterestCircleMembership.MembershipStatus.PLACED
        )).thenReturn(true);

        CohortGateStatusDto status = service.resolveGateStatusForProgramParticipant(programParticipantId);

        assertThat(status.isEligibleForMatching()).isTrue();
        assertThat(status.getBlockedReason()).isNull();
    }
}
```

- [ ] Run the failing gate tests.

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests CompanyProgramCohortGateServiceTest
```

Expected result: FAIL because gate service and repository methods do not exist.

- [ ] Add repository methods.

```java
Optional<CompanyProgramCohortPlenaryAttendance> findByCohortParticipant_Id(UUID cohortParticipantId);
boolean existsByCohortParticipant_IdAndStatus(UUID cohortParticipantId, CommonInterestCircleMembership.MembershipStatus status);
```

- [ ] Add DTO `CohortGateStatusDto` to `CompanyProgramCohortWorkspaceDto.java`.

Required fields:

```java
private UUID cohortId;
private UUID cohortParticipantId;
private UUID companyProgramParticipantId;
private boolean confirmed;
private boolean plenaryAttended;
private boolean placedInCircle;
private boolean circlesFinalized;
private boolean eligibleForMatching;
private String blockedReason;
```

- [ ] Implement plenary methods in `CompanyProgramCohortIntakeService` or a focused `CompanyProgramCohortPlenaryService`.

Required public methods:

```java
CompanyProgramCohortParticipantDto recordPlenaryAttendance(UUID cohortParticipantId, AttendanceStatus status, AttendanceSource source, UUID recordedByUserId);
List<CompanyProgramCohortParticipantDto> importPlenaryAttendance(UUID cohortId, List<PlenaryAttendanceImportRow> rows, UUID recordedByUserId);
```

- [ ] Implement `CompanyProgramCohortGateService`.

Gate order:

1. No cohort participant for a program participant means no cohort restriction: `eligibleForMatching = true`.
2. `PENDING`, `REJECTED`, `WITHDRAWN`, or duplicate review blocks matching.
3. Missing `ATTENDED` plenary attendance blocks matching with `PLENARY_NOT_ATTENDED`.
4. Missing placed circle membership blocks matching with `NOT_PLACED_IN_CIRCLE`.
5. Non-finalized cohort circles block matching with `CIRCLES_NOT_FINALIZED` when cohort config requires finalization.
6. Otherwise matching is eligible.

- [ ] Add plenary controller endpoints.

```java
GET /api/v1/company-program-cohorts/{cohortId}/plenary
POST /api/v1/company-program-cohorts/{cohortId}/plenary/link-event
POST /api/v1/company-program-cohorts/{cohortId}/plenary/attendance/import
POST /api/v1/company-program-cohort-participants/{participantId}/plenary-attendance
```

- [ ] Run tests.

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests CompanyProgramCohortGateServiceTest
```

Expected result: PASS.

- [ ] Commit.

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
git add src/main/java/com/prosper/prospermentor/dto/CompanyProgramCohortWorkspaceDto.java \
  src/main/java/com/prosper/prospermentor/repository/CompanyProgramCohortPlenaryAttendanceRepository.java \
  src/main/java/com/prosper/prospermentor/repository/CommonInterestCircleMembershipRepository.java \
  src/main/java/com/prosper/prospermentor/service/CompanyProgramCohortGateService.java \
  src/main/java/com/prosper/prospermentor/service/CompanyProgramCohortIntakeService.java \
  src/main/java/com/prosper/prospermentor/controller/CompanyProgramCohortController.java \
  src/test/java/com/prosper/prospermentor/service/CompanyProgramCohortGateServiceTest.java
git commit -m "feat: add cohort plenary gates"
```

## Task 5: Backend Circle Formation

**Files:**

- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/CommonInterestCircleService.java`
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/CommonInterestCircleDto.java`
- Test: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/CommonInterestCircleServiceTest.java`

- [ ] Write the failing circle tests.

```java
@ExtendWith(MockitoExtension.class)
class CommonInterestCircleServiceTest {

    @Mock private CompanyProgramCohortRepository cohortRepository;
    @Mock private CompanyProgramCohortParticipantRepository cohortParticipantRepository;
    @Mock private CommonInterestCircleRepository circleRepository;
    @Mock private CommonInterestCircleMembershipRepository membershipRepository;
    @InjectMocks private CommonInterestCircleService service;

    @Test
    void suggestCircles_shouldGroupByStrongestInterestTag() {
        UUID cohortId = UUID.fromString("55555555-5555-5555-5555-555555555555");
        CompanyProgramCohort cohort = cohort(cohortId);
        when(cohortRepository.findById(cohortId)).thenReturn(Optional.of(cohort));
        when(cohortParticipantRepository.findByCohort_Id(cohortId)).thenReturn(List.of(
                participant("Faith Mwangi", "STEM"),
                participant("Diana Njoki", "Career readiness"),
                participant("Joy Adhiambo", "STEM"),
                participant("Naomi Wafula", "Public speaking"),
                participant("Sarah Kimani", "STEM")
        ));

        CircleSuggestionResultDto result = service.suggestCircles(cohortId);

        assertThat(result.getSuggestedCircles()).anySatisfy(circle -> {
            assertThat(circle.getName()).contains("STEM");
            assertThat(circle.getParticipantNames()).contains("Faith Mwangi", "Joy Adhiambo", "Sarah Kimani");
        });
    }

    @Test
    void placeParticipant_shouldRejectFullCircle() {
        UUID circleId = UUID.fromString("66666666-6666-6666-6666-666666666666");
        UUID participantId = UUID.fromString("77777777-7777-7777-7777-777777777777");
        CommonInterestCircle circle = new CommonInterestCircle();
        circle.setId(circleId);
        circle.setMaxSize(5);

        when(circleRepository.findByIdForUpdate(circleId)).thenReturn(Optional.of(circle));
        when(membershipRepository.countByCircle_IdAndStatus(circleId, CommonInterestCircleMembership.MembershipStatus.PLACED))
                .thenReturn(5L);

        assertThatThrownBy(() -> service.placeParticipant(circleId, participantId, PlacementSource.ADMIN_PLACED, UUID.randomUUID()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Circle is full");
    }
}
```

- [ ] Run the failing circle tests.

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests CommonInterestCircleServiceTest
```

Expected result: FAIL because circle service and methods do not exist.

- [ ] Add repository locking method to `CommonInterestCircleRepository`.

```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT c FROM CommonInterestCircle c WHERE c.id = :circleId")
Optional<CommonInterestCircle> findByIdForUpdate(@Param("circleId") UUID circleId);
```

- [ ] Implement circle service methods.

Required public methods:

```java
List<CommonInterestCircleDto> getCircles(UUID cohortId);
CommonInterestCircleDto createCircle(UUID cohortId, CreateCommonInterestCircleRequest request);
CommonInterestCircleDto updateCircle(UUID circleId, UpdateCommonInterestCircleRequest request);
CircleSuggestionResultDto suggestCircles(UUID cohortId);
CommonInterestCircleDto placeParticipant(UUID circleId, UUID cohortParticipantId, PlacementSource source, UUID placedByUserId);
CommonInterestCircleDto removeMembership(UUID membershipId, UUID removedByUserId);
CommonInterestCircleDto moveMembership(UUID membershipId, UUID targetCircleId, UUID movedByUserId);
List<CommonInterestCircleDto> finalizeCircles(UUID cohortId, UUID finalizedByUserId);
```

Suggestion rules:

- Use confirmed or plenary-attended participants without an active membership.
- Count each participant's first interest tag as primary.
- Build proposed circle names from tags, for example `STEM Circle`.
- Keep participants unplaced when a tag group has fewer than `circleMinSize` and there are no compatible secondary tags.
- Do not persist suggestions until the admin places participants or accepts a generated circle.

Finalization rules:

- Every finalized circle must have `facilitatorProfileId`.
- Every finalized circle must have placed member count between `minSize` and `maxSize`.
- Cohort moves to `CIRCLES_FINALIZED` after successful finalization.
- Participants with placed membership move to `PLACED_IN_CIRCLE` or `ELIGIBLE_FOR_MATCHING` depending on plenary attendance and cohort finalization settings.

- [ ] Add circle controller endpoints.

```java
GET /api/v1/company-program-cohorts/{cohortId}/circles
POST /api/v1/company-program-cohorts/{cohortId}/circles
PATCH /api/v1/common-interest-circles/{circleId}
POST /api/v1/company-program-cohorts/{cohortId}/circle-suggestions
POST /api/v1/common-interest-circles/{circleId}/members
DELETE /api/v1/common-interest-circle-memberships/{membershipId}
POST /api/v1/common-interest-circle-memberships/{membershipId}/move
POST /api/v1/company-program-cohorts/{cohortId}/circles/finalize
```

- [ ] Run circle tests.

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests CommonInterestCircleServiceTest
```

Expected result: PASS.

- [ ] Commit.

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
git add src/main/java/com/prosper/prospermentor/dto/CommonInterestCircleDto.java \
  src/main/java/com/prosper/prospermentor/dto/CompanyProgramCohortWorkspaceDto.java \
  src/main/java/com/prosper/prospermentor/repository/CommonInterestCircleRepository.java \
  src/main/java/com/prosper/prospermentor/repository/CommonInterestCircleMembershipRepository.java \
  src/main/java/com/prosper/prospermentor/service/CommonInterestCircleService.java \
  src/main/java/com/prosper/prospermentor/controller/CompanyProgramCohortController.java \
  src/test/java/com/prosper/prospermentor/service/CommonInterestCircleServiceTest.java
git commit -m "feat: add common interest circle formation"
```

## Task 6: Backend Matching Workspace Gate Integration And Dashboard

**Files:**

- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/CompanyProgramMatchWorkspaceService.java`
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/MatchWorkspaceSummaryDto.java`
- Modify/create: cohort dashboard DTO/service methods.
- Test: extend `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/CompanyProgramMatchWorkspaceServiceTest.java`

- [ ] Write the failing matching gate test.

```java
@Test
void getWorkspaceSummaries_shouldExposeBlockedReasonWhenCohortGateBlocksMatching() {
    UUID participantId = UUID.fromString("55555555-5555-5555-5555-555555555555");
    CompanyProgramParticipant participant = participant(participantId);

    when(participantRepository.findAllById(List.of(participantId))).thenReturn(List.of(participant));
    when(workspaceRepository.findByParticipant_IdIn(List.of(participantId))).thenReturn(List.of());
    when(assignmentRepository.findByParticipant_IdInAndJourneyInstanceStepIsNull(List.of(participantId))).thenReturn(List.of());
    when(cohortGateService.resolveGateStatusForProgramParticipant(participantId)).thenReturn(
            CohortGateStatusDto.builder()
                    .companyProgramParticipantId(participantId)
                    .eligibleForMatching(false)
                    .blockedReason("PLENARY_NOT_ATTENDED")
                    .build()
    );

    Map<UUID, MatchWorkspaceSummaryDto> summaries = service.getWorkspaceSummaries(List.of(participantId));

    assertThat(summaries.get(participantId).getStatus()).isEqualTo(CompanyProgramMatchWorkspace.WorkspaceStatus.INACTIVE);
    assertThat(summaries.get(participantId).getBlockedReason()).isEqualTo("PLENARY_NOT_ATTENDED");
}
```

- [ ] Run the failing test.

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests CompanyProgramMatchWorkspaceServiceTest
```

Expected result: FAIL because the match workspace service does not inject gate service and DTO lacks `blockedReason`.

- [ ] Add `blockedReason` to `MatchWorkspaceSummaryDto`.

```java
private String blockedReason;
```

- [ ] Inject `CompanyProgramCohortGateService` into `CompanyProgramMatchWorkspaceService`.

Implementation rule:

```java
CohortGateStatusDto gateStatus = cohortGateService.resolveGateStatusForProgramParticipant(participant.getId());
if (gateStatus != null && !gateStatus.isEligibleForMatching()) {
    return MatchWorkspaceSummaryDto.builder()
            .status(CompanyProgramMatchWorkspace.WorkspaceStatus.INACTIVE)
            .blockedReason(gateStatus.getBlockedReason())
            .canEmployeeSelect(false)
            .shortlistCount(0)
            .build();
}
```

Apply the gate in the derived summary path and before generating employee selection options.

- [ ] Add cohort dashboard DTO to `CompanyProgramCohortWorkspaceDto.java`.

Required fields:

```java
private UUID cohortId;
private long enrolledCount;
private long selfJoinedCount;
private long pendingConfirmationCount;
private long duplicateReviewCount;
private long plenaryAttendedCount;
private double plenaryAttendanceRate;
private long circleCount;
private long unplacedCount;
private long matchedCount;
private double matchCompletionRate;
private long additionalSessionRequestCount;
private double feedbackResponseRate;
private List<String> riskIndicators;
```

- [ ] Add dashboard endpoint.

```java
GET /api/v1/company-program-cohorts/{cohortId}/dashboard
```

- [ ] Run backend focused tests.

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests CompanyProgramMatchWorkspaceServiceTest --tests CompanyProgramCohortGateServiceTest
```

Expected result: PASS.

- [ ] Commit.

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
git add src/main/java/com/prosper/prospermentor/dto/MatchWorkspaceSummaryDto.java \
  src/main/java/com/prosper/prospermentor/dto/CompanyProgramCohortWorkspaceDto.java \
  src/main/java/com/prosper/prospermentor/service/CompanyProgramMatchWorkspaceService.java \
  src/main/java/com/prosper/prospermentor/service/CompanyProgramCohortService.java \
  src/main/java/com/prosper/prospermentor/controller/CompanyProgramCohortController.java \
  src/test/java/com/prosper/prospermentor/service/CompanyProgramMatchWorkspaceServiceTest.java
git commit -m "feat: gate mentor matching by cohort progress"
```

## Task 7: Backend Employee Cohort API

**Files:**

- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/EmployeeCompanyProgramCohortDto.java`
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/CompanyProgramCohortService.java`
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/controller/CompanyProgramCohortController.java`
- Test: extend `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/CompanyProgramCohortServiceTest.java`

- [ ] Write failing employee cohort test.

```java
@Test
void getEmployeeCohorts_shouldReturnStageStatusForProfile() {
    UUID profileId = UUID.fromString("11111111-1111-1111-1111-111111111111");
    CompanyProgramCohortParticipant participant = cohortParticipant(profileId);
    when(cohortParticipantRepository.findByProfile_Id(profileId)).thenReturn(List.of(participant));
    when(cohortGateService.resolveGateStatusForCohortParticipant(participant.getId())).thenReturn(
            CohortGateStatusDto.builder()
                    .cohortParticipantId(participant.getId())
                    .confirmed(true)
                    .plenaryAttended(true)
                    .placedInCircle(true)
                    .eligibleForMatching(true)
                    .build()
    );

    List<EmployeeCompanyProgramCohortDto> cohorts = service.getEmployeeCohorts(profileId);

    assertThat(cohorts).hasSize(1);
    assertThat(cohorts.get(0).getStages().getPlenary().getStatus()).isEqualTo("ATTENDED");
    assertThat(cohorts.get(0).getStages().getCircle().getStatus()).isEqualTo("ACTIVE");
    assertThat(cohorts.get(0).getStages().getOneToOne().getStatus()).isEqualTo("READY_FOR_MATCHING");
}
```

- [ ] Run failing test.

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests CompanyProgramCohortServiceTest
```

Expected result: FAIL because employee DTO/methods do not exist.

- [ ] Implement `EmployeeCompanyProgramCohortDto`.

Required top-level fields:

```java
private UUID cohortId;
private UUID companyProgramId;
private UUID cohortParticipantId;
private UUID companyProgramParticipantId;
private String cohortName;
private String companyProgramName;
private String companyName;
private String chapter;
private String region;
private CompanyProgramCohort.CohortStatus cohortStatus;
private CompanyProgramCohortParticipant.CohortParticipantStatus participantStatus;
private StageSummaryDto stages;
private CommonInterestCircleDto circle;
private MentorAssignmentSummaryDto mentorAssignment;
```

Stage keys:

```java
private StageDto plenary;
private StageDto circle;
private StageDto oneToOne;
```

- [ ] Add service methods.

```java
List<EmployeeCompanyProgramCohortDto> getEmployeeCohorts(UUID profileId);
EmployeeCompanyProgramCohortDto getEmployeeCohort(UUID cohortId, UUID profileId);
```

- [ ] Add employee endpoints.

```java
GET /api/v1/me/company-program-cohorts
GET /api/v1/me/company-program-cohorts/{cohortId}
GET /api/v1/me/company-program-cohorts/{cohortId}/circles
POST /api/v1/me/company-program-cohorts/{cohortId}/circle-requests
```

Employee endpoints must authorize by authenticated profile id and cohort membership.

- [ ] Run backend tests.

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests CompanyProgramCohortServiceTest
```

Expected result: PASS.

- [ ] Commit.

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
git add src/main/java/com/prosper/prospermentor/dto/EmployeeCompanyProgramCohortDto.java \
  src/main/java/com/prosper/prospermentor/service/CompanyProgramCohortService.java \
  src/main/java/com/prosper/prospermentor/controller/CompanyProgramCohortController.java \
  src/test/java/com/prosper/prospermentor/service/CompanyProgramCohortServiceTest.java
git commit -m "feat: expose employee cohort status"
```

## Task 8: Frontend Cohort Request Module And Store

**Files:**

- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/http/requests/app/companyProgramCohorts.ts`
- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/store/modules/company-program-cohorts.ts`
- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/tests/b2b2c-cohort-data-layer.test.mjs`

- [ ] Create the failing frontend data-layer test.

```js
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const requestUrl = new URL('../http/requests/app/companyProgramCohorts.ts', import.meta.url)
const storeUrl = new URL('../store/modules/company-program-cohorts.ts', import.meta.url)

assert.equal(existsSync(requestUrl), true, 'Cohort APIs should live in a focused request module.')
assert.equal(existsSync(storeUrl), true, 'Cohort state should live in a focused Pinia store.')

const requestSource = readFileSync(requestUrl, 'utf8')
const storeSource = readFileSync(storeUrl, 'utf8')

for (const endpoint of [
  '/v1/company-programs/${companyProgramId}/cohorts',
  '/v1/company-program-cohorts/${cohortId}',
  '/v1/company-program-cohorts/${cohortId}/participants',
  '/v1/company-program-cohorts/${cohortId}/circles',
  '/v1/company-program-cohorts/${cohortId}/circle-suggestions',
  '/v1/company-program-cohorts/${cohortId}/circles/finalize',
  '/v1/company-program-cohorts/${cohortId}/dashboard',
  '/v1/me/company-program-cohorts',
]) {
  assert.ok(requestSource.includes(endpoint), `Request module should define ${endpoint}.`)
}

for (const action of [
  'loadCohorts',
  'loadCohort',
  'createCohort',
  'loadParticipants',
  'confirmParticipant',
  'recordPlenaryAttendance',
  'loadCircles',
  'suggestCircles',
  'placeParticipant',
  'finalizeCircles',
  'loadEmployeeCohorts',
]) {
  assert.match(storeSource, new RegExp(`async ${action}\\\\(`), `Store should expose ${action}.`)
}

console.log('B2B2C cohort data layer verified.')
```

- [ ] Run the failing test.

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
node tests/b2b2c-cohort-data-layer.test.mjs
```

Expected result: FAIL because files do not exist.

- [ ] Create `companyProgramCohorts.ts`.

Required exported type unions:

```ts
export type CompanyProgramCohortStatus = 'DRAFT' | 'INTAKE_OPEN' | 'INTAKE_CLOSED' | 'PLENARY_SCHEDULED' | 'CIRCLES_FORMING' | 'CIRCLES_FINALIZED' | 'MATCHING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED'
export type CohortParticipantStatus = 'PENDING' | 'CONFIRMED' | 'PLENARY_ATTENDED' | 'PLACED_IN_CIRCLE' | 'ELIGIBLE_FOR_MATCHING' | 'MATCHED' | 'ACTIVE' | 'COMPLETED' | 'WITHDRAWN' | 'REJECTED'
export type CircleStatus = 'DRAFT' | 'FORMING' | 'FINALIZED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
export type CircleMembershipStatus = 'PENDING_REQUEST' | 'PLACED' | 'REMOVED' | 'COMPLETED'
```

Required request methods:

```ts
getCohorts(companyProgramId: string)
createCohort(companyProgramId: string, payload: CreateCompanyProgramCohortPayload)
getCohort(cohortId: string)
updateCohort(cohortId: string, payload: UpdateCompanyProgramCohortPayload)
openIntake(cohortId: string)
closeIntake(cohortId: string)
getJoinPreview(joinCode: string)
submitSelfJoin(joinCode: string, payload: CohortSelfJoinPayload)
getParticipants(cohortId: string)
confirmParticipant(participantId: string)
rejectParticipant(participantId: string)
resolveDuplicate(participantId: string, payload: ResolveDuplicatePayload)
recordPlenaryAttendance(participantId: string, payload: RecordPlenaryAttendancePayload)
getCircles(cohortId: string)
createCircle(cohortId: string, payload: CreateCirclePayload)
updateCircle(circleId: string, payload: UpdateCirclePayload)
suggestCircles(cohortId: string)
placeParticipant(circleId: string, payload: PlaceParticipantPayload)
removeMembership(membershipId: string)
moveMembership(membershipId: string, payload: MoveMembershipPayload)
finalizeCircles(cohortId: string)
getDashboard(cohortId: string)
getMyCohorts()
getMyCohort(cohortId: string)
requestCircle(cohortId: string, payload: RequestCirclePayload)
```

- [ ] Create `company-program-cohorts.ts` Pinia store.

Required state fields:

```ts
isLoading: boolean
isSaving: boolean
error: string | null
cohorts: CompanyProgramCohortRecord[]
selectedCohort: CompanyProgramCohortRecord | null
participants: CompanyProgramCohortParticipantRecord[]
circles: CommonInterestCircleRecord[]
suggestions: CircleSuggestionResultRecord | null
dashboard: CohortDashboardRecord | null
employeeCohorts: EmployeeCompanyProgramCohortRecord[]
selectedEmployeeCohort: EmployeeCompanyProgramCohortRecord | null
```

Store actions must call only `companyProgramCohortsApi`, not direct `api`.

- [ ] Run data-layer test.

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
node tests/b2b2c-cohort-data-layer.test.mjs
```

Expected result: PASS.

- [ ] Commit.

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
git add http/requests/app/companyProgramCohorts.ts \
  store/modules/company-program-cohorts.ts \
  tests/b2b2c-cohort-data-layer.test.mjs
git commit -m "feat: add cohort frontend data layer"
```

## Task 9: Frontend Admin Cohort List And Route Access

**Files:**

- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/components/app/admin/cohorts/CompanyProgramCohortList.vue`
- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/components/app/admin/cohorts/CompanyProgramCohortEditorDialog.vue`
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/pages/app/admin/programs/[programId].vue`
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/types/auth.ts`
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/utils/roleManager.ts`
- Test: `/Users/macbookpro/WebstormProjects/myProsperV2/tests/b2b2c-admin-cohort-ui.test.mjs`

- [ ] Create the failing admin UI test.

```js
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const detailUrl = new URL('../pages/app/admin/programs/[programId].vue', import.meta.url)
const listUrl = new URL('../components/app/admin/cohorts/CompanyProgramCohortList.vue', import.meta.url)
const editorUrl = new URL('../components/app/admin/cohorts/CompanyProgramCohortEditorDialog.vue', import.meta.url)
const roleManagerUrl = new URL('../utils/roleManager.ts', import.meta.url)
const authTypesUrl = new URL('../types/auth.ts', import.meta.url)

assert.equal(existsSync(listUrl), true, 'Admin program detail should use a dedicated cohort list component.')
assert.equal(existsSync(editorUrl), true, 'Cohort create/edit should use a focused dialog component.')

const detailSource = readFileSync(detailUrl, 'utf8')
const listSource = readFileSync(listUrl, 'utf8')
const editorSource = readFileSync(editorUrl, 'utf8')
const roleManagerSource = readFileSync(roleManagerUrl, 'utf8')
const authTypesSource = readFileSync(authTypesUrl, 'utf8')

assert.match(detailSource, /activeTab = 'cohorts'/, 'Program detail tabs should include Cohorts.')
assert.match(detailSource, /CompanyProgramCohortList/, 'Program detail should render the cohort list in the Cohorts tab.')
assert.match(listSource, /loadCohorts/, 'Cohort list should load cohorts through the cohort store.')
assert.match(listSource, /Create cohort/, 'Cohort list should expose a Create cohort action.')
assert.match(listSource, /navigateTo\(`\/app\/admin\/programs\/\$\{programId\}\/cohorts\/\$\{cohort\.id\}`\)/, 'Cohort cards should open cohort detail route.')
assert.match(editorSource, /selfJoinEnabled/, 'Cohort editor should expose self-join settings.')
assert.match(editorSource, /circleMinSize/, 'Cohort editor should expose circle min size.')
assert.match(editorSource, /circleMaxSize/, 'Cohort editor should expose circle max size.')
assert.match(authTypesSource, /MANAGE_PROGRAM_COHORTS:\s*'admin:program-cohorts'/, 'Auth permission constants should include program cohort management.')
assert.match(roleManagerSource, /admin:program-cohorts/, 'Role manager should register cohort permission.')
assert.match(roleManagerSource, /'\/app\/admin\/programs\/\*':\s*\['admin:programs'[\s\S]*\]/, 'Existing program routes should remain accessible to program admins.')

console.log('B2B2C admin cohort list UI verified.')
```

- [ ] Run the failing UI test.

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
node tests/b2b2c-admin-cohort-ui.test.mjs
```

Expected result: FAIL because components and tab do not exist.

- [ ] Add permission constant in `types/auth.ts`.

```ts
MANAGE_PROGRAM_COHORTS: 'admin:program-cohorts',
```

- [ ] Add permission definition in `utils/roleManager.ts`.

```ts
createPermission('admin:program-cohorts', 'Manage Program Cohorts', 'Manage company program cohorts, intake, circles, and cohort delivery', 'admin', 'program_cohorts')
```

- [ ] Keep route access under the existing dynamic program wildcard.

The current route manager supports wildcard entries that end with `/*`. Do not add middle-wildcard routes such as `/app/admin/programs/*/cohorts`. The existing route permission should remain:

```ts
'/app/admin/programs/*': ['admin:programs'],
```

Cohort pages must also set page metadata with `permissions: ['admin:programs']`. The new `admin:program-cohorts` permission exists for finer product policy, but the MVP route guard should use the existing company program permission to avoid changing wildcard matching behavior in this task.

- [ ] Update `pages/app/admin/programs/[programId].vue`.

Required changes:

```ts
import CompanyProgramCohortList from '@/components/app/admin/cohorts/CompanyProgramCohortList.vue'

const activeTab = ref(['employees', 'matching', 'journey', 'cohorts'].includes(String(route.query.tab)) ? String(route.query.tab) : 'overview')
```

Add tab button text `Cohorts` and a `<TabsContent value="cohorts">` section that passes `programId.value`.

- [ ] Implement `CompanyProgramCohortList.vue`.

Required UI states:

- Loading skeleton.
- Empty state with `Create cohort`.
- Cohort cards with name, status, chapter/region, dates, participant counts, circle counts, and open action.
- Create dialog trigger.

- [ ] Implement `CompanyProgramCohortEditorDialog.vue`.

Required fields:

- `name`
- `code`
- `chapter`
- `region`
- `startsAt`
- `endsAt`
- `selfJoinEnabled`
- `selfJoinCapacity`
- `circleMinSize`
- `circleMaxSize`
- `interestTagSet`
- `plenaryEventType`
- `plenaryEventId`

- [ ] Run the UI test.

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
node tests/b2b2c-admin-cohort-ui.test.mjs
```

Expected result: PASS.

- [ ] Commit.

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
git add types/auth.ts utils/roleManager.ts \
  'pages/app/admin/programs/[programId].vue' \
  components/app/admin/cohorts/CompanyProgramCohortList.vue \
  components/app/admin/cohorts/CompanyProgramCohortEditorDialog.vue \
  tests/b2b2c-admin-cohort-ui.test.mjs
git commit -m "feat: add admin program cohorts tab"
```

## Task 10: Frontend Admin Cohort Workspace

**Files:**

- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/pages/app/admin/programs/[programId]/cohorts/[cohortId].vue`
- Create: admin cohort panel components listed in the File Structure Map.
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/tests/b2b2c-admin-cohort-ui.test.mjs`

- [ ] Extend the admin UI test.

```js
const workspaceUrl = new URL('../pages/app/admin/programs/[programId]/cohorts/[cohortId].vue', import.meta.url)
const intakeUrl = new URL('../components/app/admin/cohorts/CohortIntakePanel.vue', import.meta.url)
const plenaryUrl = new URL('../components/app/admin/cohorts/CohortPlenaryPanel.vue', import.meta.url)
const circlesUrl = new URL('../components/app/admin/cohorts/CohortCirclesPanel.vue', import.meta.url)
const matchingUrl = new URL('../components/app/admin/cohorts/CohortMatchingPanel.vue', import.meta.url)
const dashboardUrl = new URL('../components/app/admin/cohorts/CohortDashboardPanel.vue', import.meta.url)

for (const url of [workspaceUrl, intakeUrl, plenaryUrl, circlesUrl, matchingUrl, dashboardUrl]) {
  assert.equal(existsSync(url), true, `${url.pathname} should exist.`)
}

const workspaceSource = readFileSync(workspaceUrl, 'utf8')
const circlesSource = readFileSync(circlesUrl, 'utf8')

for (const tab of ['Setup', 'Intake', 'Plenary', 'Circles', 'Matching', 'Dashboard']) {
  assert.match(workspaceSource, new RegExp(tab), `Cohort workspace should include ${tab} tab.`)
}

assert.match(circlesSource, /Unplaced mentees/, 'Circle panel should show unplaced mentees.')
assert.match(circlesSource, /Assign facilitator/, 'Circle panel should support facilitator assignment.')
assert.match(circlesSource, /Reset suggestions/, 'Circle panel should support resetting suggestions.')
assert.match(circlesSource, /Confirm circles as final/, 'Circle panel should support finalizing circles.')
```

- [ ] Run the failing UI test.

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
node tests/b2b2c-admin-cohort-ui.test.mjs
```

Expected result: FAIL because workspace files do not exist.

- [ ] Implement cohort workspace page.

Required page metadata:

```ts
definePageMeta({
  title: 'Cohort Workspace',
  description: 'Operate a company program cohort',
  requiresAuth: true,
  permissions: ['admin:programs'],
})
```

Required local tabs:

```ts
const activeTab = ref(['setup', 'intake', 'plenary', 'circles', 'matching', 'dashboard'].includes(String(route.query.tab)) ? String(route.query.tab) : 'intake')
```

- [ ] Implement `CohortIntakePanel.vue`.

Required behavior:

- Shows participant rows with name, email, source, status, duplicate status, interest tags.
- Supports confirm, reject, and resolve duplicate.
- Shows self-join code state and open/close intake actions.
- Uses store actions only.

- [ ] Implement `CohortPlenaryPanel.vue`.

Required behavior:

- Shows linked plenary event type/id.
- Shows attendance counts.
- Supports marking one participant as `ATTENDED`, `ABSENT`, or `EXCUSED`.
- Uses store `recordPlenaryAttendance`.

- [ ] Implement `CohortCirclesPanel.vue`.

Required behavior:

- Shows unplaced mentees as tags with interest tags.
- Shows circles in a responsive grid.
- Shows each circle count as `current / min-max`.
- Supports facilitator selection using available company profiles already loaded through company store.
- Supports create circle, request suggestions, place participant, remove membership, move membership, reset suggestions, and finalize.
- Uses buttons with icons from `lucide-vue-next`.
- Does not copy the prototype sidebar.

- [ ] Implement `CohortMatchingPanel.vue`.

Required behavior:

- Shows eligible mentees.
- Shows blocked mentees with exact backend `blockedReason`.
- Links back to existing program matching UI for assignment actions when eligible.

- [ ] Implement `CohortDashboardPanel.vue`.

Required behavior:

- Shows activation, circle formation, match completion, continuation, and feedback response cards.
- Shows risk indicators as operational alerts.

- [ ] Run UI test.

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
node tests/b2b2c-admin-cohort-ui.test.mjs
```

Expected result: PASS.

- [ ] Commit.

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
git add 'pages/app/admin/programs/[programId]/cohorts/[cohortId].vue' \
  components/app/admin/cohorts/CohortIntakePanel.vue \
  components/app/admin/cohorts/CohortPlenaryPanel.vue \
  components/app/admin/cohorts/CohortCirclesPanel.vue \
  components/app/admin/cohorts/CohortMatchingPanel.vue \
  components/app/admin/cohorts/CohortDashboardPanel.vue \
  tests/b2b2c-admin-cohort-ui.test.mjs
git commit -m "feat: add admin cohort workspace"
```

## Task 11: Frontend Employee Cohort View And Join Code

**Files:**

- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/components/app/employee/cohorts/EmployeeCohortStatusCard.vue`
- Create: `/Users/macbookpro/WebstormProjects/myProsperV2/pages/app/employee/join-cohort.vue`
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/pages/app/employee/programs/[programId].vue`
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/pages/app/employee/programs/index.vue`
- Test: `/Users/macbookpro/WebstormProjects/myProsperV2/tests/b2b2c-employee-cohort-ui.test.mjs`

- [ ] Create the failing employee UI test.

```js
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const cardUrl = new URL('../components/app/employee/cohorts/EmployeeCohortStatusCard.vue', import.meta.url)
const detailUrl = new URL('../pages/app/employee/programs/[programId].vue', import.meta.url)
const listUrl = new URL('../pages/app/employee/programs/index.vue', import.meta.url)
const joinUrl = new URL('../pages/app/employee/join-cohort.vue', import.meta.url)

assert.equal(existsSync(cardUrl), true, 'Employee cohort status should live in a focused component.')
assert.equal(existsSync(joinUrl), true, 'Employee join-code flow should have a route.')

const cardSource = readFileSync(cardUrl, 'utf8')
const detailSource = readFileSync(detailUrl, 'utf8')
const listSource = readFileSync(listUrl, 'utf8')
const joinSource = readFileSync(joinUrl, 'utf8')

for (const label of ['Plenary', 'Circle', '1:1']) {
  assert.match(cardSource, new RegExp(label), `Employee cohort card should render ${label} stage.`)
}

assert.match(cardSource, /Request an additional session/, 'Employee cohort card should expose additional session action after match.')
assert.match(detailSource, /EmployeeCohortStatusCard/, 'Employee program detail should render the cohort status card.')
assert.match(detailSource, /loadEmployeeCohorts/, 'Employee program detail should load employee cohorts through the cohort store.')
assert.match(listSource, /join-cohort/, 'Employee programs index should link to join-code flow.')
assert.match(joinSource, /getJoinPreview/, 'Join-code page should preview a cohort by code.')
assert.match(joinSource, /submitSelfJoin/, 'Join-code page should submit self-join through the cohort store.')

console.log('B2B2C employee cohort UI verified.')
```

- [ ] Run failing employee UI test.

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
node tests/b2b2c-employee-cohort-ui.test.mjs
```

Expected result: FAIL because the employee cohort component and route do not exist.

- [ ] Implement `EmployeeCohortStatusCard.vue`.

Required props:

```ts
const props = defineProps<{
  cohort: EmployeeCompanyProgramCohortRecord
  additionalSessionRoute?: string | null
}>()
```

Required visual sections:

- Header with cohort name.
- Stage row for `Plenary`, `Circle`, `1:1`.
- Plenary card with date/status.
- Circle card with circle name, facilitator, members/tags, next session.
- Mentor card with mentor assignment and additional session action.

- [ ] Update employee program detail page.

Required behavior:

- Load employee cohorts on mount with existing program, journeys, matches, and session balance requests.
- Select the cohort whose `companyProgramId` matches route `programId`.
- Render `EmployeeCohortStatusCard` above the existing journey content.
- Keep existing booking, mentor selection, and session balance behavior.

- [ ] Implement `/app/employee/join-cohort`.

Required behavior:

- Input for join code.
- Preview cohort after code lookup.
- Self-join form fields: first name, last name, email, phone, chapter, region, interest tags.
- Submit shows pending/duplicate review confirmation from backend response.

- [ ] Update employee programs index.

Required behavior:

- Add a restrained `Join cohort` action near the program list empty state and header actions.
- Do not add marketplace-style navigation.

- [ ] Run employee UI test.

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
node tests/b2b2c-employee-cohort-ui.test.mjs
```

Expected result: PASS.

- [ ] Commit.

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
git add components/app/employee/cohorts/EmployeeCohortStatusCard.vue \
  pages/app/employee/join-cohort.vue \
  'pages/app/employee/programs/[programId].vue' \
  pages/app/employee/programs/index.vue \
  tests/b2b2c-employee-cohort-ui.test.mjs
git commit -m "feat: add employee cohort journey view"
```

## Task 12: Full Verification

- [ ] Run backend feature tests.

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
./gradlew test --tests CompanyProgramCohortSchemaTest \
  --tests CompanyProgramCohortServiceTest \
  --tests CompanyProgramCohortIntakeServiceTest \
  --tests CommonInterestCircleServiceTest \
  --tests CompanyProgramCohortGateServiceTest \
  --tests CompanyProgramMatchWorkspaceServiceTest
```

Expected result: PASS.

- [ ] Run frontend feature tests.

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
node tests/b2b2c-cohort-data-layer.test.mjs
node tests/b2b2c-admin-cohort-ui.test.mjs
node tests/b2b2c-employee-cohort-ui.test.mjs
node tests/corporate-admin-program-detail-page.test.mjs
node tests/employee-programs-page-design.test.mjs
```

Expected result: PASS.

- [ ] Run frontend build.

```bash
cd /Users/macbookpro/WebstormProjects/myProsperV2
npm run build
```

Expected result: PASS. If the unrelated Nautix dirty files break the build, confirm whether those changes should be included or fixed outside this feature before staging.

- [ ] Review changed files in both repos.

```bash
cd /Users/macbookpro/IdeaProjects/ProsperMentor
git status --short
git diff --stat HEAD

cd /Users/macbookpro/WebstormProjects/myProsperV2
git status --short
git diff --stat HEAD
```

Expected result: only files from this implementation plan are staged or committed for the feature. Existing unrelated dirty files remain untouched.

## Self-Review Checklist

- [ ] Backend schema supports multiple cohorts under one company program.
- [ ] Cohort membership is unique by cohort/profile, not by company program/profile.
- [ ] Self-join starts pending and duplicate review blocks confirmation.
- [ ] Plenary attendance and circle placement are enforced by backend gates.
- [ ] Circle placement is capacity-safe through repository locking.
- [ ] Existing program-level participant model remains intact.
- [ ] Matching workspace exposes blocked reasons instead of silently hiding users.
- [ ] Admin UI uses `Programs -> Cohorts -> Cohort Workspace`; it does not copy the prototype sidebar.
- [ ] Employee UI shows `Plenary`, `Circle`, and `1:1` in the program-centric My Program surface.
- [ ] Frontend follows component -> Pinia store -> HTTP request module.
- [ ] RBAC and route metadata are updated with real permission keys.
- [ ] Tests cover backend services, frontend request/store wiring, admin UI, employee UI, and build.
