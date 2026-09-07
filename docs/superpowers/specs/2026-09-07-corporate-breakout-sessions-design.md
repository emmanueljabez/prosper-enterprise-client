# Corporate Breakout Sessions Design

## Goal

Add Zoom-style breakout rooms to Agora-powered corporate group sessions. The MVP is host-managed: only the session host or mentor can create, assign, open, move, and close breakout rooms.

## Scope

This feature applies only to corporate/group sessions with multiple participants. It does not change the one mentor plus one mentee session flow.

The MVP includes:

- Host-created breakout rooms during a live Agora session.
- Even auto-assignment and manual participant moves.
- Participant prompts when assigned to a room.
- Secure Agora tokens for assigned breakout channels.
- Room-local video, audio, screen sharing, reactions, and in-session chat.
- Host-controlled close action that returns participants to the main room.

The MVP excludes:

- Co-host or corporate admin breakout management.
- Broadcast messages from the host to every room.
- Breakout recording.
- Pre-session breakout pre-assignment.
- Ask-for-help and timed countdown flows.

## Architecture

Agora RTC remains the media layer. Each breakout room maps to a separate Agora channel named from the parent session id and breakout room id. The main room continues to use the existing session channel.

The backend owns breakout state and authorization. Frontend clients cannot mint arbitrary room tokens; they can only request a token for the main room or a breakout room that the backend says they may join.

The current Agora RTC stream-message chat works inside whichever Agora channel the user has joined. To move users across rooms reliably, the frontend polls the backend breakout state in this MVP.

## Backend Data Model

Create `session_breakout_rooms`:

- `id uuid primary key`
- `session_id uuid not null references sessions(id)`
- `name varchar(120) not null`
- `agora_channel_name varchar(180) not null unique`
- `status varchar(30) not null` with values `DRAFT`, `OPEN`, `CLOSED`
- `created_by uuid not null`
- `opened_at timestamptz null`
- `closed_at timestamptz null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

Create `session_breakout_participants`:

- `id uuid primary key`
- `room_id uuid not null references session_breakout_rooms(id)`
- `session_id uuid not null references sessions(id)`
- `profile_id uuid not null`
- `status varchar(30) not null` with values `ASSIGNED`, `JOINED`, `LEFT`, `RETURNED`
- `joined_at timestamptz null`
- `left_at timestamptz null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

Enforce one active assignment per participant per session with a partial unique index on `(session_id, profile_id)` where status is `ASSIGNED` or `JOINED`.

## Backend API

Add endpoints under `/api/v1/sessions/{sessionId}/breakouts`:

- `GET /state`: returns current rooms, assignments, and the authenticated user's assigned room.
- `POST /rooms`: host creates draft rooms with requested names or count.
- `POST /auto-assign`: host evenly assigns known session participants across draft or open rooms.
- `PATCH /participants/{profileId}`: host assigns or moves one participant to a room.
- `POST /open`: host opens all draft rooms.
- `POST /rooms/{roomId}/token`: participant or host receives an Agora token for a room they may join.
- `POST /rooms/{roomId}/join`: participant marks themselves joined.
- `POST /return-main`: participant marks themselves returned to the main room.
- `POST /close`: host closes open rooms and marks active assignments returned.

## Authorization

Host management is allowed when:

- The authenticated profile is the session mentor.
- The session is Agora-powered.
- The session is corporate/group eligible.
- The session is inside the existing Agora join window.

Participant room token access is allowed when:

- The authenticated profile belongs to the parent group session.
- The requested breakout room belongs to that session.
- The room is `OPEN`.
- The participant is assigned to that room, or the requester is the host.

## Frontend UX

The session room adds a `Breakout rooms` control alongside chat and participants.

Host panel:

- Create room count control.
- Auto assign button.
- Room cards with participant assignment lists.
- Move participant select action.
- Open rooms button when rooms are draft.
- Close rooms button when rooms are open.

Participant experience:

- When assigned to an open room, show a modal-style prompt: room name, Join breakout room, Stay in main room.
- Joining a breakout leaves the current Agora channel, fetches a room token, joins the breakout channel, and republishes existing local tracks.
- The current room label changes from main session to the breakout room name.
- When rooms close, show a return prompt and switch the participant back to the main room.

Chat, reactions, hand raise, and screen sharing are scoped to the currently joined channel. This keeps in-session chat private to each breakout room for the MVP.

## Error Handling

- If room creation fails, keep the user in the main room and show a toast.
- If token generation fails, keep the user in the current channel and show the backend error message.
- If Agora channel switching fails, attempt to rejoin the previous channel.
- If polling fails, keep existing state visible and retry on the next interval.
- If a room is closed while a user is joining, return them to the main room.

## Testing

Backend tests:

- Host can create breakout rooms for an Agora corporate session.
- Non-host cannot create, assign, open, or close rooms.
- Participant can only fetch a token for their assigned open room.
- Closing rooms returns active participants.

Frontend tests:

- Session API wrapper exposes breakout endpoints.
- Room page contains host breakout UI, participant prompt text, and channel-switching hooks.
- Breakout chat remains in-session only and scoped to the current Agora channel.

Browser verification:

- Login as an eligible test user.
- Open a temporary Agora corporate group session.
- Confirm the room loads with fake camera/microphone.
- Confirm the breakout panel is visible for host-capable sessions.
- Confirm no global webchat appears inside the room.
