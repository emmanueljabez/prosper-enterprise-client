import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const packageJson = JSON.parse(readFileSync(resolve('package.json'), 'utf8'))
const sessionsApi = readFileSync(resolve('http/requests/app/sessions/sessions.ts'), 'utf8')
const sessionsPage = readFileSync(resolve('pages/app/sessions/index.vue'), 'utf8')
const bookingForm = readFileSync(resolve('components/ui/mentors/MentorBookingForm.vue'), 'utf8')
const mentorPage = readFileSync(resolve('pages/app/mentors/[id].vue'), 'utf8')
const detailPagePath = resolve('pages/app/sessions/[id]/index.vue')
const roomPagePath = resolve('pages/app/sessions/[id]/room.vue')

assert.ok(
  packageJson.dependencies?.['agora-rtc-sdk-ng'],
  'enterprise app should depend on agora-rtc-sdk-ng for in-browser session meetings',
)

assert.match(
  sessionsApi,
  /'GOOGLE_MEET'\s*\|\s*'ZOOM'\s*\|\s*'AGORA'/,
  'session API meeting-platform normalizer should include AGORA',
)

assert.match(
  sessionsApi,
  /axiosInstance\.post(?:<[^>]+>)?\(`\/v1\/sessions\/\$\{sessionId\}\/agora\/token`\)/,
  'session API should request short-lived Agora tokens from the backend',
)

assert.ok(existsSync(detailPagePath), 'enterprise session details should live at /app/sessions/:id/index')
assert.ok(existsSync(roomPagePath), 'enterprise app should expose /app/sessions/:id/room')

const roomPage = readFileSync(roomPagePath, 'utf8')

assert.match(roomPage, /agora-rtc-sdk-ng/, 'Agora room page should load the Agora Web SDK')
assert.match(roomPage, /createMicrophoneAndCameraTracks/, 'Agora room should create local audio and video tracks')
assert.match(roomPage, /createScreenVideoTrack/, 'Agora room should support screen sharing')
assert.match(roomPage, /sendStreamMessage/, 'Agora room should send in-session chat and reaction events over Agora stream messages')
assert.match(roomPage, /stream-message/, 'Agora room should receive in-session chat and reaction events over Agora stream messages')
assert.match(roomPage, /token-privilege-will-expire|token-privilege-did-expire/, 'Agora room should renew expiring tokens')
assert.match(roomPage, /const joinAgoraChannel = async \(payload: AgoraTokenPayload[\s\S]*client\.join\([\s\S]*payload\.appId[\s\S]*payload\.channelName[\s\S]*payload\.token[\s\S]*payload\.uid[\s\S]*\)/, 'Agora room should join using the backend token payload')
assert.match(roomPage, /const tokenPayload = await fetchAgoraToken\(\)[\s\S]*await joinAgoraChannel\(tokenPayload\)/, 'Agora room should pass backend token payload into the channel join helper')
assert.match(roomPage, /layout:\s*false/, 'Agora room should hide the default app chrome for a focused meeting surface')
assert.match(roomPage, /Meeting chat/, 'Agora room should expose a meeting chat panel')
assert.match(roomPage, /Send reaction/, 'Agora room should expose emoji reaction controls')
assert.match(roomPage, /Present now/, 'Agora room should label screen sharing as a meeting presentation action')

assert.match(
  sessionsPage,
  /meetingPlatform\s*===\s*['"]AGORA['"]/,
  'sessions page should route Agora meetings to the internal room route',
)
assert.match(sessionsPage, /copyMeetingLink\(selectedSession\.meetingUrl\)/, 'session details should expose a copy action for generated meeting links')
assert.match(sessionsPage, /:href="selectedSession\.meetingUrl"/, 'session details should render the generated meeting URL as a visible link')
assert.match(sessionsPage, /Meeting link will appear after the session is confirmed\./, 'session details should explain pending sessions without a generated meeting link')

assert.match(bookingForm, /enableAgoraMeetings/, 'booking form should gate Agora behind a public feature flag')
assert.match(bookingForm, /value:\s*['"]agora['"]/, 'booking form should offer Agora when the feature flag is enabled')
assert.match(mentorPage, /normalized\s*===\s*['"]AGORA['"]/, 'mentor profile booking normalization should preserve Agora')
