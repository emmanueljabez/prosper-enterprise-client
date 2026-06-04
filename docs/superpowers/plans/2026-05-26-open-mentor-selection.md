# Open Mentor Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an employee choose any eligible marketplace mentor from a journey-step modal, then refresh the journey so the session step can move to booking.

**Architecture:** Add a backend employee marketplace-selection path that validates participant ownership, employee-selection program mode, selection window, mentor role, and mentor availability without requiring shortlist membership. Reuse the existing `/v1/profiles/mentors` paginated mentor source on the frontend, and reuse the existing journey action button to open an in-page modal instead of navigating away.

**Tech Stack:** Spring Boot, JUnit/Mockito, Nuxt 3, Vue 3, Pinia, TypeScript, shadcn-nuxt dialog/button primitives.

---

### Task 1: Backend Marketplace Selection

**Files:**
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/test/java/com/prosper/prospermentor/service/CompanyProgramMatchWorkspaceServiceTest.java`
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/CompanyProgramMentorAssignmentService.java`
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/CompanyProgramMatchWorkspaceService.java`
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/controller/CompanyProgramMentorAssignmentController.java`
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/http/requests/app/companyPrograms.ts`
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/store/modules/company-programs.ts`

- [ ] **Step 1: Write failing backend test**

Create a service test proving employee marketplace selection succeeds even when the mentor is not in the shortlist.

- [ ] **Step 2: Verify backend test is red**

Run: `./gradlew test --tests com.prosper.prospermentor.service.CompanyProgramMatchWorkspaceServiceTest`
Expected: compile/test failure because marketplace selection does not exist yet.

- [ ] **Step 3: Add backend marketplace assignment path**

Add `assignMarketplaceMentor(...)` to assignment service, `selectMarketplaceMentorForEmployee(...)` to match workspace service, and `POST /v1/me/company-program-matches/{participantId}/select-open` to the controller.

- [ ] **Step 4: Verify backend test is green**

Run: `./gradlew test --tests com.prosper.prospermentor.service.CompanyProgramMatchWorkspaceServiceTest`
Expected: build success.

### Task 2: Journey Modal Frontend

**Files:**
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/pages/app/employee/programs/[programId].vue`
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/tests/employee-programs-page-design.test.mjs`

- [ ] **Step 1: Write failing frontend source test**

Assert the journey detail page opens an in-page mentor selection dialog, loads paginated mentor profiles, and calls the open-selection store action.

- [ ] **Step 2: Verify frontend test is red**

Run: `node tests/employee-programs-page-design.test.mjs`
Expected: failure because the modal and open-selection action are absent.

- [ ] **Step 3: Add modal and action handling**

Add dialog state, search, pagination, mentor cards, and confirm action to the journey detail page. Replace `VIEW_MATCHES` handling for `Choose mentor` with opening the modal.

- [ ] **Step 4: Verify frontend test is green**

Run: `node tests/employee-programs-page-design.test.mjs && node tests/employee-navigation.test.mjs`
Expected: both source tests pass.

### Task 3: Build And Render Verification

**Files:**
- Verify changed backend and frontend files only.

- [ ] **Step 1: Run backend targeted tests**

Run: `./gradlew test --tests com.prosper.prospermentor.service.CompanyProgramMatchWorkspaceServiceTest --tests com.prosper.prospermentor.service.CompanyProgramJourneyServiceTest`
Expected: build success.

- [ ] **Step 2: Run frontend build**

Run: `npm run build`
Expected: build success, allowing existing unrelated warnings already present in the repo.

- [ ] **Step 3: Render journey page**

Use local Nuxt preview or dev server and verify the journey `Choose mentor` action opens a modal with mentor rows, search, pagination, and confirm behavior.
