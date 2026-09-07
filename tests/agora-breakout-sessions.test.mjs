import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const sessionsApi = readFileSync(resolve('http/requests/app/sessions/sessions.ts'), 'utf8')
const sessionsStore = readFileSync(resolve('store/modules/sessions/sessions.ts'), 'utf8')
const roomPage = readFileSync(resolve('pages/app/sessions/[id]/room.vue'), 'utf8')

assert.match(sessionsApi, /getBreakoutState\(sessionId: string\)/, 'session request API should expose breakout state')
assert.match(sessionsApi, /createBreakoutRooms\(sessionId: string/, 'session request API should create breakout rooms')
assert.match(sessionsApi, /autoAssignBreakoutRooms\(sessionId: string\)/, 'session request API should auto assign breakout rooms')
assert.match(sessionsApi, /moveBreakoutParticipant\(sessionId: string, profileId: string/, 'session request API should move participants')
assert.match(sessionsApi, /openBreakoutRooms\(sessionId: string\)/, 'session request API should open breakout rooms')
assert.match(sessionsApi, /closeBreakoutRooms\(sessionId: string\)/, 'session request API should close breakout rooms')
assert.match(sessionsApi, /createBreakoutRoomToken\(sessionId: string, roomId: string\)/, 'session request API should request room-scoped Agora tokens')
assert.match(sessionsApi, /markBreakoutRoomJoined\(sessionId: string, roomId: string\)/, 'session request API should mark room joins')
assert.match(sessionsApi, /returnToMainRoom\(sessionId: string\)/, 'session request API should mark main-room returns')
assert.match(sessionsApi, /\/v1\/sessions\/\$\{sessionId\}\/breakouts\/rooms\/\$\{roomId\}\/token/, 'room token endpoint should match backend route')

assert.match(sessionsStore, /async getBreakoutState\(sessionId: string\)/, 'sessions store should wrap breakout state')
assert.match(sessionsStore, /async createBreakoutRooms\(sessionId: string/, 'sessions store should wrap room creation')
assert.match(sessionsStore, /async autoAssignBreakoutRooms\(sessionId: string\)/, 'sessions store should wrap auto assignment')
assert.match(sessionsStore, /async moveBreakoutParticipant\(sessionId: string, profileId: string/, 'sessions store should wrap participant moves')
assert.match(sessionsStore, /async createBreakoutRoomToken\(sessionId: string, roomId: string\)/, 'sessions store should wrap room token creation')

assert.match(roomPage, /type MeetingPanel = 'chat' \| 'participants' \| 'breakouts' \| null/, 'room page should include a breakout panel type')
assert.match(roomPage, /Breakout rooms/, 'room page should expose breakout room controls')
assert.match(roomPage, /joinBreakoutRoom/, 'room page should include participant channel switching')
assert.match(roomPage, /pollBreakoutState/, 'room page should poll backend breakout state')
assert.match(roomPage, /currentRoomKind/, 'room page should distinguish main room from breakout room')
assert.match(roomPage, /assignedBreakoutRoom/, 'room page should show participant assignment prompts')
assert.match(roomPage, /breakoutAvailable/, 'room page should stop showing breakout controls when the backend marks them unsupported')
assert.match(roomPage, /Meeting chat/, 'room page should keep chat in-session')
assert.match(roomPage, /withAgoraTimeout/, 'room page should bound Agora SDK operations so room switches cannot hang forever')
assert.match(roomPage, /withAgoraTimeout\(\(\) => client\.join/, 'Agora room joins should be timeout-bounded')
assert.match(roomPage, /withAgoraTimeout\(\(\) => client\.publish/, 'Agora publishing should be timeout-bounded')
assert.match(roomPage, /withAgoraTimeout\(\(\) => client\.unpublish/, 'Agora unpublishing should be timeout-bounded')
assert.match(roomPage, /withAgoraTimeout\(\(\) => client\.leave/, 'Agora channel leaves should be timeout-bounded')
