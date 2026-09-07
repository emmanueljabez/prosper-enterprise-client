# Corporate Breakout Sessions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add host-managed breakout rooms to Agora-powered corporate group sessions and verify the flow end to end.

**Architecture:** Backend owns room state, participant assignments, and token authorization. Frontend extends the existing Agora room to poll breakout state, expose host controls, and switch the active Agora channel for assigned participants.

**Tech Stack:** Spring Boot, JPA, Flyway, JUnit/Mockito, Nuxt 3, Vue 3, Pinia, Tailwind, Agora Web SDK.

---

## File Structure

Backend worktree: `/Users/macbookpro/.config/superpowers/worktrees/ProsperMentor/corporate-breakout-sessions`

- Create `src/main/resources/db/migration/V87__Add_session_breakout_rooms.sql`: additive breakout room tables and indexes.
- Create `src/main/java/com/prosper/prospermentor/entity/SessionBreakoutRoom.java`: JPA entity for room state.
- Create `src/main/java/com/prosper/prospermentor/entity/SessionBreakoutParticipant.java`: JPA entity for participant assignments.
- Create `src/main/java/com/prosper/prospermentor/repository/SessionBreakoutRoomRepository.java`: room persistence queries.
- Create `src/main/java/com/prosper/prospermentor/repository/SessionBreakoutParticipantRepository.java`: assignment persistence queries.
- Create `src/main/java/com/prosper/prospermentor/dto/SessionBreakoutDtos.java`: request/response contracts.
- Create `src/main/java/com/prosper/prospermentor/service/meeting/SessionBreakoutService.java`: authorization, room lifecycle, token delegation.
- Create `src/main/java/com/prosper/prospermentor/controller/SessionBreakoutController.java`: authenticated API endpoints.
- Create `src/test/java/com/prosper/prospermentor/service/meeting/SessionBreakoutServiceTest.java`: service red/green tests.
- Modify `src/main/java/com/prosper/prospermentor/service/meeting/AgoraSessionAccessService.java`: expose shared Agora session validation helpers when needed.

Frontend worktree: `/Users/macbookpro/.config/superpowers/worktrees/myProsperV2/corporate-breakout-sessions`

- Modify `http/requests/app/sessions/sessions.ts`: add breakout API methods and response types.
- Modify `store/modules/sessions/sessions.ts`: add store actions following the existing request pattern.
- Modify `pages/app/sessions/[id]/room.vue`: add breakout state polling, host panel, participant prompt, and channel switching.
- Create `tests/agora-breakout-sessions.test.mjs`: static regression coverage for endpoint wiring and UI hooks.

## Task 1: Backend Breakout Domain Tests

**Files:**
- Create: `src/test/java/com/prosper/prospermentor/service/meeting/SessionBreakoutServiceTest.java`

- [ ] **Step 1: Write the failing service tests**

Create tests that describe the required behavior before any production classes exist:

```java
class SessionBreakoutServiceTest {
    @Test
    void createRooms_shouldAllowSessionMentorForCorporateAgoraSession() {
        SessionBreakoutService service = serviceWithCorporateAgoraSession(MENTOR_ID);
        SessionBreakoutDtos.CreateBreakoutRoomsRequest request = new SessionBreakoutDtos.CreateBreakoutRoomsRequest();
        request.setCount(2);

        SessionBreakoutDtos.SessionBreakoutStateDto state = service.createRooms(SESSION_ID, MENTOR_ID, request);

        assertThat(state.isHost()).isTrue();
        assertThat(state.getRooms()).extracting(SessionBreakoutDtos.SessionBreakoutRoomDto::getName)
                .containsExactly("Room 1", "Room 2");
    }

    @Test
    void createRooms_shouldRejectNonHost() {
        SessionBreakoutService service = serviceWithCorporateAgoraSession(MENTOR_ID);
        SessionBreakoutDtos.CreateBreakoutRoomsRequest request = new SessionBreakoutDtos.CreateBreakoutRoomsRequest();
        request.setCount(1);

        assertThatThrownBy(() -> service.createRooms(SESSION_ID, PARTICIPANT_ONE_ID, request))
                .isInstanceOf(SecurityException.class)
                .hasMessageContaining("Only the session host can manage breakout rooms");
    }

    @Test
    void createRoomToken_shouldAllowAssignedParticipantForOpenRoom() {
        SessionBreakoutService service = serviceWithOpenRoomAssignedTo(PARTICIPANT_ONE_ID);

        AgoraTokenService.AgoraJoinToken token = service.createRoomToken(SESSION_ID, ROOM_ID, PARTICIPANT_ONE_ID);

        assertThat(token.channelName()).isEqualTo("pm-session-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa-breakout-11111111-1111-1111-1111-111111111111");
    }

    @Test
    void createRoomToken_shouldRejectUnassignedParticipant() {
        SessionBreakoutService service = serviceWithOpenRoomAssignedTo(PARTICIPANT_ONE_ID);

        assertThatThrownBy(() -> service.createRoomToken(SESSION_ID, ROOM_ID, PARTICIPANT_TWO_ID))
                .isInstanceOf(SecurityException.class)
                .hasMessageContaining("not assigned");
    }

    @Test
    void closeRooms_shouldMarkOpenAssignmentsReturned() {
        SessionBreakoutService service = serviceWithOpenRoomAssignedTo(PARTICIPANT_ONE_ID);

        SessionBreakoutDtos.SessionBreakoutStateDto state = service.closeBreakouts(SESSION_ID, MENTOR_ID);

        assertThat(state.getRooms()).allMatch(room -> room.getStatus() == SessionBreakoutRoom.RoomStatus.CLOSED);
    }
}
```

- [ ] **Step 2: Run the backend test and verify RED**

Run:

```bash
./gradlew test --tests "com.prosper.prospermentor.service.meeting.SessionBreakoutServiceTest"
```

Expected: compilation fails because `SessionBreakoutService`, entities, repositories, and DTOs do not exist.

## Task 2: Backend Breakout Persistence

**Files:**
- Create: `src/main/resources/db/migration/V87__Add_session_breakout_rooms.sql`
- Create: `src/main/java/com/prosper/prospermentor/entity/SessionBreakoutRoom.java`
- Create: `src/main/java/com/prosper/prospermentor/entity/SessionBreakoutParticipant.java`
- Create: `src/main/java/com/prosper/prospermentor/repository/SessionBreakoutRoomRepository.java`
- Create: `src/main/java/com/prosper/prospermentor/repository/SessionBreakoutParticipantRepository.java`

- [ ] **Step 1: Add the Flyway migration**

Create two tables with additive indexes:

```sql
CREATE TABLE IF NOT EXISTS session_breakout_rooms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    name varchar(120) NOT NULL,
    agora_channel_name varchar(180) NOT NULL UNIQUE,
    status varchar(30) NOT NULL DEFAULT 'DRAFT',
    created_by uuid NOT NULL REFERENCES profiles(id),
    opened_at timestamptz,
    closed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS session_breakout_participants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id uuid NOT NULL REFERENCES session_breakout_rooms(id) ON DELETE CASCADE,
    session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    profile_id uuid NOT NULL REFERENCES profiles(id),
    status varchar(30) NOT NULL DEFAULT 'ASSIGNED',
    joined_at timestamptz,
    left_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_breakout_rooms_session_id
    ON session_breakout_rooms(session_id);

CREATE INDEX IF NOT EXISTS idx_session_breakout_participants_session_id
    ON session_breakout_participants(session_id);

CREATE INDEX IF NOT EXISTS idx_session_breakout_participants_room_id
    ON session_breakout_participants(room_id);

CREATE UNIQUE INDEX IF NOT EXISTS ux_session_breakout_active_assignment
    ON session_breakout_participants(session_id, profile_id)
    WHERE status IN ('ASSIGNED', 'JOINED');
```

- [ ] **Step 2: Add entities and repositories**

Implement enums exactly as:

```java
public enum RoomStatus { DRAFT, OPEN, CLOSED }
public enum AssignmentStatus { ASSIGNED, JOINED, LEFT, RETURNED }
```

Repository methods required by the service:

```java
List<SessionBreakoutRoom> findBySessionIdOrderByCreatedAtAsc(UUID sessionId);
Optional<SessionBreakoutRoom> findByIdAndSessionId(UUID id, UUID sessionId);
List<SessionBreakoutParticipant> findBySessionId(UUID sessionId);
Optional<SessionBreakoutParticipant> findBySessionIdAndProfileIdAndStatusIn(UUID sessionId, UUID profileId, Collection<AssignmentStatus> statuses);
List<SessionBreakoutParticipant> findBySessionIdAndStatusIn(UUID sessionId, Collection<AssignmentStatus> statuses);
void deleteBySessionIdAndProfileIdAndStatusIn(UUID sessionId, UUID profileId, Collection<AssignmentStatus> statuses);
```

- [ ] **Step 3: Run the backend test and verify the failure moves forward**

Run:

```bash
./gradlew test --tests "com.prosper.prospermentor.service.meeting.SessionBreakoutServiceTest"
```

Expected: compilation still fails because DTOs and service/controller do not exist.

## Task 3: Backend Service And API

**Files:**
- Create: `src/main/java/com/prosper/prospermentor/dto/SessionBreakoutDtos.java`
- Create: `src/main/java/com/prosper/prospermentor/service/meeting/SessionBreakoutService.java`
- Create: `src/main/java/com/prosper/prospermentor/controller/SessionBreakoutController.java`

- [ ] **Step 1: Add DTOs**

Use Lombok `@Data`, `@Builder`, `@NoArgsConstructor`, and `@AllArgsConstructor` for:

```java
public static class CreateBreakoutRoomsRequest {
    private Integer count;
    private List<String> names;
}

public static class MoveBreakoutParticipantRequest {
    private UUID roomId;
}

public static class SessionBreakoutParticipantDto {
    private UUID profileId;
    private UUID roomId;
    private String roomName;
    private String name;
    private String avatarUrl;
    private SessionBreakoutParticipant.AssignmentStatus status;
}

public static class SessionBreakoutRoomDto {
    private UUID id;
    private UUID sessionId;
    private String name;
    private String agoraChannelName;
    private SessionBreakoutRoom.RoomStatus status;
    private List<SessionBreakoutParticipantDto> participants;
}

public static class SessionBreakoutStateDto {
    private boolean host;
    private List<SessionBreakoutRoomDto> rooms;
    private List<SessionBreakoutParticipantDto> availableParticipants;
    private SessionBreakoutRoomDto assignedRoom;
}
```

- [ ] **Step 2: Implement service behavior**

Implement `SessionBreakoutService` with these public methods:

```java
SessionBreakoutStateDto getState(UUID sessionId, UUID requesterProfileId);
SessionBreakoutStateDto createRooms(UUID sessionId, UUID requesterProfileId, CreateBreakoutRoomsRequest request);
SessionBreakoutStateDto autoAssign(UUID sessionId, UUID requesterProfileId);
SessionBreakoutStateDto moveParticipant(UUID sessionId, UUID requesterProfileId, UUID profileId, MoveBreakoutParticipantRequest request);
SessionBreakoutStateDto openBreakouts(UUID sessionId, UUID requesterProfileId);
SessionBreakoutStateDto markJoined(UUID sessionId, UUID roomId, UUID requesterProfileId);
SessionBreakoutStateDto returnToMain(UUID sessionId, UUID requesterProfileId);
SessionBreakoutStateDto closeBreakouts(UUID sessionId, UUID requesterProfileId);
AgoraTokenService.AgoraJoinToken createRoomToken(UUID sessionId, UUID roomId, UUID requesterProfileId);
```

Validation rules:

```java
private void requireCorporateAgoraSession(Session session) {
    if (session.getMeetingPlatform() != Session.MeetingPlatform.AGORA) throw new IllegalStateException("Session is not configured for Agora");
    if (session.getCompanyProgramId() == null) throw new IllegalStateException("Breakout rooms are only available for corporate group sessions");
}

private void requireHost(Session session, UUID requesterProfileId) {
    if (!requesterProfileId.equals(session.getMentorId())) throw new SecurityException("Only the session host can manage breakout rooms");
}
```

Participant eligibility comes from `companyProgramParticipantRepository.findByCompanyProgram_IdAndStatusIn(session.getCompanyProgramId(), List.of(ENROLLED, ACTIVE))`.

- [ ] **Step 3: Add controller endpoints**

Expose:

```java
GET /api/v1/sessions/{sessionId}/breakouts/state
POST /api/v1/sessions/{sessionId}/breakouts/rooms
POST /api/v1/sessions/{sessionId}/breakouts/auto-assign
PATCH /api/v1/sessions/{sessionId}/breakouts/participants/{profileId}
POST /api/v1/sessions/{sessionId}/breakouts/open
POST /api/v1/sessions/{sessionId}/breakouts/rooms/{roomId}/token
POST /api/v1/sessions/{sessionId}/breakouts/rooms/{roomId}/join
POST /api/v1/sessions/{sessionId}/breakouts/return-main
POST /api/v1/sessions/{sessionId}/breakouts/close
```

Use the same authenticated-user extraction pattern as `SessionController`.

- [ ] **Step 4: Run service tests and verify GREEN**

Run:

```bash
./gradlew test --tests "com.prosper.prospermentor.service.meeting.SessionBreakoutServiceTest"
```

Expected: tests pass.

- [ ] **Step 5: Commit backend domain and API**

Run:

```bash
git add src/main/resources/db/migration/V87__Add_session_breakout_rooms.sql src/main/java/com/prosper/prospermentor/entity/SessionBreakoutRoom.java src/main/java/com/prosper/prospermentor/entity/SessionBreakoutParticipant.java src/main/java/com/prosper/prospermentor/repository/SessionBreakoutRoomRepository.java src/main/java/com/prosper/prospermentor/repository/SessionBreakoutParticipantRepository.java src/main/java/com/prosper/prospermentor/dto/SessionBreakoutDtos.java src/main/java/com/prosper/prospermentor/service/meeting/SessionBreakoutService.java src/main/java/com/prosper/prospermentor/controller/SessionBreakoutController.java src/test/java/com/prosper/prospermentor/service/meeting/SessionBreakoutServiceTest.java
git commit -m "feat: add session breakout room API"
```

## Task 4: Frontend API And Store

**Files:**
- Create: `tests/agora-breakout-sessions.test.mjs`
- Modify: `http/requests/app/sessions/sessions.ts`
- Modify: `store/modules/sessions/sessions.ts`

- [ ] **Step 1: Write the failing frontend API/store test**

Create `tests/agora-breakout-sessions.test.mjs`:

```javascript
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const sessionsApi = readFileSync(resolve('http/requests/app/sessions/sessions.ts'), 'utf8')
const sessionsStore = readFileSync(resolve('store/modules/sessions/sessions.ts'), 'utf8')
const roomPage = readFileSync(resolve('pages/app/sessions/[id]/room.vue'), 'utf8')

assert.match(sessionsApi, /getBreakoutState\(sessionId: string\)/, 'session request API should expose breakout state')
assert.match(sessionsApi, /createBreakoutRooms\(sessionId: string/, 'session request API should create breakout rooms')
assert.match(sessionsApi, /createBreakoutRoomToken\(sessionId: string, roomId: string\)/, 'session request API should request room-scoped Agora tokens')
assert.match(sessionsApi, /\/v1\/sessions\/\$\{sessionId\}\/breakouts\/rooms\/\$\{roomId\}\/token/, 'room token endpoint should match backend route')

assert.match(sessionsStore, /async getBreakoutState\(sessionId: string\)/, 'sessions store should wrap breakout state')
assert.match(sessionsStore, /async createBreakoutRooms\(sessionId: string/, 'sessions store should wrap room creation')
assert.match(sessionsStore, /async createBreakoutRoomToken\(sessionId: string, roomId: string\)/, 'sessions store should wrap room token creation')

assert.match(roomPage, /Breakout rooms/, 'room page should expose breakout room controls')
assert.match(roomPage, /joinBreakoutRoom/, 'room page should include participant channel switching')
assert.match(roomPage, /pollBreakoutState/, 'room page should poll backend breakout state')
assert.match(roomPage, /currentRoomKind/, 'room page should distinguish main room from breakout room')
```

- [ ] **Step 2: Run the frontend test and verify RED**

Run:

```bash
node tests/agora-breakout-sessions.test.mjs
```

Expected: failure because breakout API/store methods and UI hooks do not exist.

- [ ] **Step 3: Add request-layer methods**

Add interfaces and methods:

```typescript
interface BreakoutStateResponse {
  host: boolean
  rooms: BreakoutRoom[]
  availableParticipants: BreakoutParticipant[]
  assignedRoom?: BreakoutRoom | null
}

getBreakoutState(sessionId: string) {
  return axiosInstance.get<{ data: BreakoutStateResponse }>(`/v1/sessions/${sessionId}/breakouts/state`)
}

createBreakoutRoomToken(sessionId: string, roomId: string) {
  return axiosInstance.post<{ data: AgoraJoinTokenResponse }>(`/v1/sessions/${sessionId}/breakouts/rooms/${roomId}/token`)
}
```

- [ ] **Step 4: Add store actions**

Add actions that unwrap `response.data.data` and throw backend errors consistently with `createAgoraToken`.

- [ ] **Step 5: Run frontend test and verify partial GREEN**

Run:

```bash
node tests/agora-breakout-sessions.test.mjs
```

Expected: API/store checks pass and room page checks fail until Task 5.

## Task 5: Frontend Room Breakout UX

**Files:**
- Modify: `pages/app/sessions/[id]/room.vue`
- Modify: `tests/agora-breakout-sessions.test.mjs`

- [ ] **Step 1: Add state and polling**

Add:

```typescript
type CurrentRoomKind = 'main' | 'breakout'
const currentRoomKind = ref<CurrentRoomKind>('main')
const currentBreakoutRoom = ref<BreakoutRoom | null>(null)
const breakoutState = ref<BreakoutStateResponse | null>(null)
let breakoutPollTimer: ReturnType<typeof setInterval> | null = null
```

Poll every five seconds after session load:

```typescript
const pollBreakoutState = async () => {
  if (!sessionId.value || !isJoined.value) return
  breakoutState.value = await sessionsStore.getBreakoutState(sessionId.value)
}
```

- [ ] **Step 2: Add channel switching helpers**

Extract current `joinRoom` channel join internals into:

```typescript
const joinAgoraChannel = async (payload: AgoraTokenPayload) => {
  await client.join(payload.appId, payload.channelName, payload.token, payload.uid)
  if (!localAudioTrack || !localVideoTrack) {
    const [microphoneTrack, cameraTrack] = await agora.createMicrophoneAndCameraTracks()
    localAudioTrack = microphoneTrack
    localVideoTrack = cameraTrack
  }
  await client.publish([localAudioTrack, localVideoTrack])
}
```

Implement:

```typescript
const joinBreakoutRoom = async (room: BreakoutRoom) => {
  const previousRoom = currentBreakoutRoom.value
  const token = await sessionsStore.createBreakoutRoomToken(sessionId.value, room.id)
  await switchAgoraChannel(token)
  await sessionsStore.markBreakoutRoomJoined(sessionId.value, room.id)
  currentRoomKind.value = 'breakout'
  currentBreakoutRoom.value = room
}
```

`switchAgoraChannel` must unpublish current tracks, leave the existing client, create a fresh client with event handlers, join the new channel, and republish the current enabled local tracks.

- [ ] **Step 3: Add host panel**

Add a panel branch for `activePanel === 'breakouts'` with:

```vue
<h2>Breakout rooms</h2>
<button @click="createBreakoutRooms">Create rooms</button>
<button @click="autoAssignBreakoutRooms">Auto assign</button>
<button @click="openBreakoutRooms">Open rooms</button>
<button @click="closeBreakoutRooms">Close rooms</button>
```

Show room cards and assigned participant names.

- [ ] **Step 4: Add participant assignment prompt**

Show a fixed prompt when `breakoutState?.assignedRoom?.status === 'OPEN' && currentRoomKind === 'main'`:

```vue
<div>
  <h2>{{ breakoutState.assignedRoom.name }}</h2>
  <button @click="joinBreakoutRoom(breakoutState.assignedRoom)">Join breakout room</button>
  <button @click="dismissBreakoutPrompt">Stay in main room</button>
</div>
```

- [ ] **Step 5: Run frontend breakout test and verify GREEN**

Run:

```bash
node tests/agora-breakout-sessions.test.mjs
```

Expected: pass.

- [ ] **Step 6: Commit frontend API and UI**

Run:

```bash
git add http/requests/app/sessions/sessions.ts store/modules/sessions/sessions.ts pages/app/sessions/[id]/room.vue tests/agora-breakout-sessions.test.mjs
git commit -m "feat: add Agora breakout room controls"
```

## Task 6: Full Automated Verification

**Files:**
- Backend and frontend changed files.

- [ ] **Step 1: Run backend targeted tests**

Run:

```bash
./gradlew test --tests "com.prosper.prospermentor.service.meeting.SessionBreakoutServiceTest" --tests "com.prosper.prospermentor.service.meeting.AgoraSessionAccessServiceTest"
```

Expected: pass.

- [ ] **Step 2: Run backend full tests**

Run:

```bash
./gradlew test
```

Expected: pass.

- [ ] **Step 3: Run frontend static tests**

Run:

```bash
for test in tests/*.test.mjs; do node "$test"; done
```

Expected: pass.

- [ ] **Step 4: Run frontend build**

Run:

```bash
npm run build
```

Expected: pass.

## Task 7: Deploy And Browser Test

**Files:**
- Deployment scripts and production environment.

- [ ] **Step 1: Push backend and frontend branches**

Run in each worktree:

```bash
git push -u origin codex/corporate-breakout-sessions
```

- [ ] **Step 2: Create PRs and merge**

Use GitHub CLI to create backend and frontend PRs against `main`, wait for checks where available, and merge with squash or merge commit according to existing repository convention.

- [ ] **Step 3: Tag releases**

Create tags:

```bash
git tag enterprise-service-2026-09-07-corporate-breakouts
git tag enterprise-frontend-2026-09-07-corporate-breakouts
git push origin enterprise-service-2026-09-07-corporate-breakouts
git push origin enterprise-frontend-2026-09-07-corporate-breakouts
```

- [ ] **Step 4: Deploy backend then frontend**

Run:

```bash
/Users/macbookpro/.config/superpowers/worktrees/ProsperMentor/corporate-breakout-sessions/deploy.sh
/Users/macbookpro/.config/superpowers/worktrees/myProsperV2/corporate-breakout-sessions/deploy.sh
```

- [ ] **Step 5: Browser test with fake media**

Use `agent-browser` against production with fake camera/microphone:

```bash
agent-browser --session-name prosper-breakouts --args "--use-fake-ui-for-media-stream,--use-fake-device-for-media-stream" open https://enterprise.prospermentor.com/auth/login
```

Verify:

- Login succeeds.
- A temporary Agora corporate session room loads.
- The meeting UI has no global Nautix webchat.
- Host breakout control is available when authenticated as session mentor.
- `Breakout rooms` panel can load state without a 4xx/5xx.

## Self-Review

- Spec coverage: all MVP requirements map to backend persistence/API, frontend channel switching, host controls, participant prompts, and browser testing tasks.
- Placeholder scan: no task uses unresolved marker language.
- Type consistency: backend `RoomStatus` and `AssignmentStatus` names match DTO and repository references; frontend `BreakoutStateResponse`, `BreakoutRoom`, and `currentRoomKind` names are consistent across tests and room-page steps.
