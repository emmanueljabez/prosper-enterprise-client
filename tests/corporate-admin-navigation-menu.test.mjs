import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(
  new URL('../navigation/vertical/corporate-admin.ts', import.meta.url),
  'utf8',
)

const expectedGroupOrder = [
  'Dashboard',
  'People',
  'People Management',
  'Program Management',
  'Session Management',
  'Mentors & Matching',
  'Finance',
  'Reports',
  'Resources',
  'Administration',
]
const groupPositions = expectedGroupOrder.map(title => {
  const index = source.indexOf(`title: '${title}'`)
  assert.notEqual(index, -1, `Corporate admin menu should include ${title}.`)
  return index
})

assert.deepEqual(
  [...groupPositions].sort((a, b) => a - b),
  groupPositions,
  'Corporate admin menu should follow the enterprise lifecycle group order.',
)

assert.match(
  source,
  /title:\s*'Overview'[\s\S]*?url:\s*'\/app\/admin'[\s\S]*?permission:\s*null/,
  'Overview should preserve the admin dashboard route.',
)

assert.match(
  source,
  /title:\s*'Mentees'[\s\S]*?url:\s*'\/app\/admin\/employees'[\s\S]*?permission:\s*'admin:users'/,
  'Mentees should preserve the employee management route and permission.',
)

assert.match(
  source,
  /title:\s*'Programs'[\s\S]*?url:\s*'\/app\/admin\/programs'[\s\S]*?permission:\s*'admin:programs'/,
  'Programs should preserve the company programs route and permission.',
)

assert.match(
  source,
  /title:\s*'Billing'[\s\S]*?url:\s*'\/app\/admin\/billing'[\s\S]*?permission:\s*'admin:billing'/,
  'Billing should stay in Finance with its existing route and permission.',
)
assert.doesNotMatch(
  source,
  /title:\s*'Session Wallet'|url:\s*'\/app\/admin\/billing\/wallet'/,
  'Session Wallet should not appear as a separate sidebar link.',
)

assert.match(
  source,
  /title:\s*'Mentors'[\s\S]*?url:\s*'\/app\/admin\/mentors'[\s\S]*?permission:\s*'admin:mentors'/,
  'Mentors should preserve the admin mentors route and permission.',
)

assert.match(
  source,
  /title:\s*'One-to-One Matching'[\s\S]*?url:\s*'\/app\/admin\/matches'[\s\S]*?permission:\s*'admin:programs'/,
  'One-to-One Matching should preserve the matching workspace route and permission.',
)

assert.doesNotMatch(source, /title:\s*'Core'|Employee Management|Company Program|title:\s*'Mentoring'|title:\s*'Mentor Matching'/)

console.log('Corporate admin navigation menu verified.')
