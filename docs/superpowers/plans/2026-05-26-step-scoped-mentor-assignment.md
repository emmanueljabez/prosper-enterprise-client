# Step-Scoped Mentor Assignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Store employee mentor selections against the journey step that triggered selection, and return step-level mentor/action data so only that stage unlocks booking.

**Architecture:** Keep existing program-level mentor assignments for admin/program-wide flows by allowing `journey_instance_step_id` to be nullable. Add step-scoped assignments when `/select-open` receives a journey step id, change uniqueness to one program-level assignment per participant plus one assignment per participant-step, and have journey DTOs include `mentorAssignment` per step. Frontend will pass the active journey step id and render the step's own assignment instead of the program-wide assignment.

**Tech Stack:** Spring Boot, JPA/Hibernate, Flyway SQL migrations, JUnit/Mockito, Nuxt 3/Vue/Pinia/TypeScript.

---

### Task 1: Backend Schema And Assignment Model

**Files:**
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/entity/CompanyProgramMentorAssignment.java`
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/repository/CompanyProgramMentorAssignmentRepository.java`
- Create: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/resources/db/migration/V62__Add_journey_step_scope_to_company_program_mentor_assignments.sql`

- [ ] Add nullable `journeyInstanceStep` to the assignment entity.
- [ ] Drop participant-only unique constraint and add partial unique indexes for program-level and step-level assignments.
- [ ] Add repository methods for program-level and step-level lookup.

### Task 2: Backend Service And DTO Behavior

**Files:**
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/AssignCompanyProgramMentorRequest.java`
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/dto/EmployeeCompanyProgramJourneyDto.java`
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/CompanyProgramMentorAssignmentService.java`
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/CompanyProgramMatchWorkspaceService.java`
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/controller/CompanyProgramMentorAssignmentController.java`
- Modify: `/Users/macbookpro/IdeaProjects/ProsperMentor/src/main/java/com/prosper/prospermentor/service/CompanyProgramJourneyService.java`

- [ ] Add optional `journeyInstanceStepId` to the selection request.
- [ ] Validate that step-scoped open selection targets a participant-owned, READY, SESSION journey step.
- [ ] Save the open-marketplace selection with `journey_instance_step_id`.
- [ ] Add `mentorAssignment` to each journey step DTO.
- [ ] Resolve session-step actions from the step-level assignment first, then program-level assignment fallback.

### Task 3: Frontend Integration

**Files:**
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/http/requests/app/companyPrograms.ts`
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/store/modules/company-programs.ts`
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/pages/app/employee/programs/[programId].vue`
- Modify: `/Users/macbookpro/WebstormProjects/myProsperV2/tests/employee-programs-page-design.test.mjs`

- [ ] Add `journeyInstanceStepId` to the frontend select-open payload.
- [ ] Pass the active journey step id when confirming a selected mentor.
- [ ] Render `step.mentorAssignment` on that step only.
- [ ] Prefer `step.mentorAssignment.mentorId` when opening booking for that step.

### Task 4: Verification

**Commands:**
- Backend: `./gradlew test --tests com.prosper.prospermentor.service.CompanyProgramMatchWorkspaceServiceTest --tests com.prosper.prospermentor.service.CompanyProgramJourneyServiceTest`
- Frontend: `node tests/employee-programs-page-design.test.mjs && node tests/employee-navigation.test.mjs`
- Frontend build: `npm run build`

---

Self-review: The plan covers schema, service, DTO, frontend request/store/page integration, and targeted verification. No placeholders or unresolved file paths remain.
