# Agora Meet-Style Room Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the Agora room route into a Google Meet-style in-session meeting UI with transient chat and reactions.

**Architecture:** Keep the feature in `pages/app/sessions/[id]/room.vue`, because the current Agora room state is already localized there. Use Agora RTC stream messages for in-session-only chat, emoji reactions, and raised-hand state.

**Tech Stack:** Nuxt 3, Vue 3, TypeScript, Tailwind, lucide-vue-next, agora-rtc-sdk-ng.

---

### Task 1: Add Regression Checks

**Files:**
- Modify: `tests/agora-session-meetings.test.mjs`

- [x] **Step 1: Write the failing test**

Add assertions that the room page uses `sendStreamMessage`, listens for `stream-message`, hides default app chrome with `layout: false`, and exposes `Meeting chat`, `Send reaction`, and `Present now`.

- [x] **Step 2: Run test to verify it fails**

Run: `node tests/agora-session-meetings.test.mjs`

Expected: FAIL because the current room page does not yet implement Agora stream-message chat and reaction controls.

### Task 2: Replace Room UI And Add Transient Stream Events

**Files:**
- Modify: `pages/app/sessions/[id]/room.vue`

- [ ] **Step 1: Update page metadata**

Set `layout: false` so the meeting room is not wrapped in the default app chrome.

- [ ] **Step 2: Add meeting state**

Add refs for current time, selected drawer, chat draft, chat messages, emoji reaction bursts, and raised-hand status.

- [ ] **Step 3: Add Agora stream-message helpers**

Encode outbound JSON payloads for chat, reaction, and hand events with `TextEncoder`, send them with `client.sendStreamMessage({ payload })`, and parse inbound messages from `client.on('stream-message')`.

- [ ] **Step 4: Rebuild the template**

Use a full-screen dark meeting stage, a top status bar, a main video area, floating bottom controls, a transient reaction overlay, and right-side drawers for chat and participants.

### Task 3: Verify

**Files:**
- Test: `tests/agora-session-meetings.test.mjs`
- Build: project build output

- [ ] **Step 1: Run focused regression test**

Run: `node tests/agora-session-meetings.test.mjs`

Expected: PASS.

- [ ] **Step 2: Run Nuxt build**

Run: `npm run build`

Expected: exit code 0.
