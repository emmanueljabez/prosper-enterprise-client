import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const sessionsApi = readFileSync(resolve(root, 'http/requests/app/sessions/sessions.ts'), 'utf8')
const sessionsStore = readFileSync(resolve(root, 'store/modules/sessions/sessions.ts'), 'utf8')
const sessionsPage = readFileSync(resolve(root, 'pages/app/sessions/index.vue'), 'utf8')
const appSource = readFileSync(resolve(root, 'app.vue'), 'utf8')
const roomPagePath = resolve(root, 'pages/app/sessions/[id]/room.vue')

assert.match(
  packageJson.dependencies?.['agora-rtc-sdk-ng'] || '',
  /^\^4\./,
  'enterprise app should depend on the Agora Web SDK',
)

assert.match(
  sessionsApi,
  /'GOOGLE_MEET'\s*\|\s*'ZOOM'\s*\|\s*'AGORA'/,
  'session API meeting-platform normalizer should include AGORA',
)

assert.match(
  sessionsApi,
  /\/v1\/sessions\/\$\{sessionId\}\/agora\/token/,
  'session API should request backend Agora tokens',
)

assert.match(
  sessionsStore,
  /async createAgoraToken\(sessionId: string\)/,
  'sessions store should expose Agora token creation',
)

assert.ok(
  existsSync(roomPagePath),
  'enterprise app should expose /app/sessions/:id/room',
)

const roomPage = existsSync(roomPagePath) ? readFileSync(roomPagePath, 'utf8') : ''

assert.match(roomPage, /agora-rtc-sdk-ng/, 'Agora room page should load the Agora Web SDK')
assert.match(roomPage, /createMicrophoneAndCameraTracks/, 'Agora room should create local audio and video tracks')
assert.match(roomPage, /createScreenVideoTrack/, 'Agora room should support screen sharing')
assert.match(roomPage, /sendStreamMessage/, 'Agora room should send in-session chat and reaction events')
assert.match(roomPage, /Meeting chat/, 'Agora room should expose meeting chat')
assert.match(roomPage, /Send reaction/, 'Agora room should expose emoji reactions')
assert.match(roomPage, /Breakout rooms/, 'Agora room should expose host breakout controls')
assert.match(roomPage, /layout:\s*false/, 'Agora room should hide default app chrome')

assert.match(
  sessionsPage,
  /meetingPlatform\s*===\s*['"]AGORA['"]/,
  'sessions page should route Agora meetings to the internal room route',
)

assert.match(
  appSource,
  /showNautixWebChat/,
  'app shell should hide the floating webchat inside Agora rooms',
)

console.log('Agora session room production regression checks passed')
