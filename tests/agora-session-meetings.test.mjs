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
assert.match(roomPage, /token-privilege-will-expire|token-privilege-did-expire/, 'Agora room should renew expiring tokens')
assert.match(roomPage, /client\.join\([\s\S]*tokenPayload\.appId[\s\S]*tokenPayload\.channelName[\s\S]*tokenPayload\.token[\s\S]*tokenPayload\.uid[\s\S]*\)/, 'Agora room should join using the backend token payload')

assert.match(
  sessionsPage,
  /meetingPlatform\s*===\s*['"]AGORA['"]/,
  'sessions page should route Agora meetings to the internal room route',
)

assert.match(bookingForm, /enableAgoraMeetings/, 'booking form should gate Agora behind a public feature flag')
assert.match(bookingForm, /value:\s*['"]agora['"]/, 'booking form should offer Agora when the feature flag is enabled')
assert.match(mentorPage, /normalized\s*===\s*['"]AGORA['"]/, 'mentor profile booking normalization should preserve Agora')
