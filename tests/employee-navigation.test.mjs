import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const employeeNavigationSource = readFileSync(
  new URL('../navigation/vertical/employee.ts', import.meta.url),
  'utf8',
)

assert.match(
  employeeNavigationSource,
  /title:\s*'Mentors'[\s\S]*?url:\s*'\/app\/mentors'[\s\S]*?permission:\s*'mentors:view'/,
  'Employee sidebar should link Mentors to the mentor marketplace.',
)
assert.doesNotMatch(
  employeeNavigationSource,
  /title:\s*'My Mentor'[\s\S]*?url:\s*'\/app\/employee\/mentor'/,
  'Employee sidebar should no longer show My Mentor as the mentor marketplace entry.',
)
assert.doesNotMatch(
  employeeNavigationSource,
  /title:\s*'My Journey'[\s\S]*?url:\s*'\/app\/employee\/journey'/,
  'Employee sidebar should not show My Journey now that journey progress lives under program details.',
)

console.log('Employee navigation verified.')
