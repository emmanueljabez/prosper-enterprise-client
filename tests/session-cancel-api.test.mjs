import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const sessionsApi = readFileSync(resolve('http/requests/app/sessions/sessions.ts'), 'utf8')
const sessionsStore = readFileSync(resolve('store/modules/sessions/sessions.ts'), 'utf8')
const sessionsPage = readFileSync(resolve('pages/app/sessions/index.vue'), 'utf8')

assert.match(
  sessionsApi,
  /interface CancelSessionPayload[\s\S]*cancelledBy[\s\S]*reason/,
  'enterprise sessions API should expose a cancelSession payload with cancelledBy and reason',
)

assert.match(
  sessionsApi,
  /cancelSession\(sessionId:\s*string,\s*payload:\s*CancelSessionPayload\)/,
  'enterprise sessions API should type cancelSession with the cancel payload',
)

assert.match(
  sessionsApi,
  /axiosInstance\.post\(`\/v1\/sessions\/\$\{sessionId\}\/cancel`,\s*payload\)/,
  'enterprise sessions API should call the backend cancel endpoint',
)

assert.match(
  sessionsStore,
  /async cancelSession\(sessionId:\s*string,[\s\S]*sessionsApi\.cancelSession\(sessionId,/,
  'enterprise sessions store should route cancellation through the backend API',
)

assert.match(
  sessionsPage,
  /await sessionsStore\.cancelSession\(session\.id,/,
  'enterprise sessions page should use the store cancel action instead of a placeholder',
)
