import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const proposalPagePath = fileURLToPath(new URL('../pages/app/sessions/proposals/[id].vue', import.meta.url))
const sessionsDetailSource = readFileSync(new URL('../pages/app/sessions/[id].vue', import.meta.url), 'utf8')

assert.equal(
  existsSync(proposalPagePath),
  true,
  'Enterprise should have a dedicated mentee proposal-response route at /app/sessions/proposals/:id',
)

const proposalPageSource = existsSync(proposalPagePath) ? readFileSync(proposalPagePath, 'utf8') : ''

assert.match(
  proposalPageSource,
  /getActiveProposal/,
  'Dedicated enterprise proposal page should explicitly load active proposal slots from the backend',
)

assert.match(
  proposalPageSource,
  /Alternative Time Proposed/,
  'Dedicated enterprise proposal page should render the mentor-proposed time slots',
)

assert.match(
  proposalPageSource,
  /handleAcceptProposal/,
  'Dedicated enterprise proposal page should let the mentee accept a proposed slot',
)

assert.match(
  proposalPageSource,
  /handleDeclineProposal/,
  'Dedicated enterprise proposal page should let the mentee decline the proposal',
)

assert.match(
  sessionsDetailSource,
  /\/app\/sessions\/proposals\/\$\{session\.value\.id\}/,
  'Enterprise session details should redirect pending proposal responses to the dedicated proposal page',
)

assert.match(
  sessionsDetailSource,
  /if \(hasPendingProposal\.value\)/,
  'Enterprise session details should redirect to the proposal page based on pending proposal status, even before slots are rendered',
)

console.log('Enterprise session proposal response routes verified.')
