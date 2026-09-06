# Agora Meet-Style Room Design

## Goal

Make `/app/sessions/:id/room` feel like a focused video meeting experience while preserving the existing backend-issued Agora token flow.

## Scope

- Replace the current app-page layout with a full-screen dark meeting surface.
- Keep live Agora video, audio, token renewal, leave, and screen sharing behavior.
- Add in-session-only meeting chat and emoji reactions over Agora stream messages.
- Add Google Meet-style controls: microphone, camera, present now, reactions, raise hand, more, leave, chat, and participants.
- Use Prosper Mentor brand colors for selected and accent states: `#016f56` and `#dd63c4`.
- Hide the global Nautix support launcher on live session room routes so it does not collide with meeting controls.

## Architecture

The room remains a single Nuxt page because the current Agora implementation is already localized there. The page owns transient meeting state: local media state, remote user list, chat drawer state, participant drawer state, chat messages, emoji bursts, and raised-hand state.

Chat and reactions use Agora RTC data stream messages through `client.sendStreamMessage` and `client.on('stream-message')`. Messages are not persisted to the backend and disappear when participants leave or reload the room.

`app.vue` keeps the Nautix widget globally mounted except on `/app/sessions/:id/room`, where the meeting has its own chat affordance and bottom controls.

## Components And Data Flow

- The session store continues to load the session and request a short-lived Agora token.
- The Agora client joins using the backend token payload.
- Media tracks are published as before.
- Stream-message payloads are JSON objects with a type of `chat`, `reaction`, or `hand`.
- Incoming stream messages update local UI state only.

## Error Handling

- Existing join/token errors continue to render the room error alert.
- Invalid stream-message payloads are ignored so malformed data does not break the call.
- Sending chat or reactions while not joined is a no-op.

## Testing

- Extend `tests/agora-session-meetings.test.mjs` to assert the Meet-style room affordances and Agora stream-message plumbing.
- Extend `tests/nautix-webchat.test.mjs` to assert the support launcher is hidden for live room routes.
- Run `node tests/agora-session-meetings.test.mjs`.
- Run `node tests/nautix-webchat.test.mjs`.
- Run `npm run build`.
- Use a browser smoke test against the existing production-style test session after deployment if this is released.
