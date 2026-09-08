import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const sessionsPage = readFileSync(resolve('pages/app/sessions/index.vue'), 'utf8')

assert.match(
  sessionsPage,
  /copyMeetingLink\(selectedSession\.meetingUrl\)/,
  'session details should expose a copy action for generated meeting links',
)

assert.match(
  sessionsPage,
  /:href="selectedSession\.meetingUrl"/,
  'session details should render the generated meeting URL as a visible link',
)

assert.match(
  sessionsPage,
  /Meeting link will appear after the session is confirmed\./,
  'session details should explain pending sessions without a generated meeting link',
)
