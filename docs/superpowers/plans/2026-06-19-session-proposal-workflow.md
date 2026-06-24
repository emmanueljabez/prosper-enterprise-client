# Session Proposal Workflow Plan

## Goal

Implement the backend and frontend flow where mentors can confirm a booking, propose one or more alternative slots, decline, or contact support; mentees can accept a proposed slot, choose among proposed slots, view alternative mentors, or contact support.

## Backend

1. Add `session_proposals`, `session_proposal_slots`, and support-contact persistence with a Flyway migration.
2. Add proposal entities, repositories, DTOs, and a `SessionProposalService`.
3. Keep the existing `confirm` endpoint behavior intact. When a mentee accepts a proposed slot, reuse `SessionBookingService.confirmSession` so meeting creation and normal confirmation notifications still happen.
4. Add endpoints under `/api/v1/sessions/{sessionId}` for proposal creation, active proposal lookup, accept, decline, and support contact.
5. Include the active pending proposal in `SessionResponseDto` so frontend decisions come from backend state rather than URL query state.
6. Send the already-created Nautix templates for proposal and support actions without replacing existing booking notifications.

## Frontend

1. Add proposal methods to the sessions request module and Pinia store.
2. Extend the mentor review page with "Propose alternative" and "Contact support" actions alongside existing accept/decline.
3. Extend the mentee sessions page to show active proposal actions from `session.activeProposal`: accept selected slot, decline, view alternatives, and contact support.
4. Preserve the existing component -> store -> request flow.

## Verification

1. Add backend service unit tests for proposal creation, acceptance, decline, and support contact notifications.
2. Run the targeted backend tests.
3. Run frontend build or type validation available in the repo.
