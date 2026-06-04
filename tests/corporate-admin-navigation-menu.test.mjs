import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(
  new URL('../navigation/vertical/corporate-admin.ts', import.meta.url),
  'utf8',
)

const coreSection = source.match(/title:\s*'Core'[\s\S]*?children:\s*\[([\s\S]*?)\n\s*\],\n\s*\}/)?.[1] || ''
const administrationSection = source.match(/title:\s*'Administration'[\s\S]*?children:\s*\[([\s\S]*?)\n\s*\],\n\s*\}/)?.[1] || ''

const coreTitles = [...coreSection.matchAll(/title:\s*'([^']+)'/g)].map(match => match[1])
const expectedCoreStart = ['Dashboard', 'Mentees', 'Programs', 'Billing', 'Mentors', 'Sessions']
assert.deepEqual(
  coreTitles.slice(0, expectedCoreStart.length),
  expectedCoreStart,
  'Corporate admin Core menu should start Dashboard, Mentees, Programs, Billing, Mentors, Sessions.',
)

const expectedCoreOrder = ['Dashboard', 'Mentees', 'Programs', 'Billing', 'Mentors', 'Sessions']
const corePositions = expectedCoreOrder.map(title => {
  const index = coreSection.indexOf(`title: '${title}'`)
  assert.notEqual(index, -1, `Corporate admin Core menu should include ${title}.`)
  return index
})

assert.deepEqual(
  [...corePositions].sort((a, b) => a - b),
  corePositions,
  'Corporate admin Core menu should keep Dashboard, Mentees, Programs, Billing, Mentors, Sessions in order.',
)

assert.match(
  coreSection,
  /title:\s*'Mentees'[\s\S]*?url:\s*'\/app\/admin\/employees'[\s\S]*?permission:\s*'admin:users'/,
  'Mentees should preserve the employee management route and permission.',
)

assert.match(
  coreSection,
  /title:\s*'Programs'[\s\S]*?url:\s*'\/app\/admin\/programs'[\s\S]*?permission:\s*'admin:programs'/,
  'Programs should preserve the company programs route and permission.',
)

assert.match(
  coreSection,
  /title:\s*'Billing'[\s\S]*?url:\s*'\/app\/admin\/billing'[\s\S]*?permission:\s*'admin:billing'/,
  'Billing should be promoted into the Core menu with its existing route and permission.',
)

assert.match(
  coreSection,
  /title:\s*'Mentors'[\s\S]*?url:\s*'\/app\/admin\/mentors'[\s\S]*?permission:\s*'admin:mentors'/,
  'Mentors should preserve the admin mentors route and permission.',
)

assert.doesNotMatch(coreSection, /Employee Management|Company Program|title:\s*'Mentoring'/)
assert.doesNotMatch(administrationSection, /title:\s*'Billing'/)

console.log('Corporate admin navigation menu verified.')
