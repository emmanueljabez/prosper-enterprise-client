import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const programIndex = new URL('../pages/app/admin/programs/[programId]/index.vue', import.meta.url)
const flatProgramPage = new URL('../pages/app/admin/programs/[programId].vue', import.meta.url)
const standaloneCohortWorkspace = new URL('../pages/app/admin/cohorts/[cohortId].vue', import.meta.url)
const legacyCohortWorkspace = new URL('../pages/app/admin/programs/[programId]/cohorts/[cohortId].vue', import.meta.url)

assert.ok(
  existsSync(programIndex),
  'Program detail must live at pages/app/admin/programs/[programId]/index.vue so nested cohort routes render.',
)

assert.ok(
  !existsSync(flatProgramPage),
  'Flat pages/app/admin/programs/[programId].vue shadows nested cohort routes and must not exist.',
)

assert.ok(
  existsSync(standaloneCohortWorkspace),
  'Admin cohort workspace must live at pages/app/admin/cohorts/[cohortId].vue.',
)

assert.ok(
  existsSync(legacyCohortWorkspace),
  'Legacy nested admin cohort route should remain for redirect compatibility.',
)

const legacySource = readFileSync(legacyCohortWorkspace, 'utf8')
assert.match(
  legacySource,
  /path:\s*`\/app\/admin\/cohorts\/\$\{route\.params\.cohortId\}`/,
  'Legacy nested admin cohort route should redirect to the standalone workspace.',
)

console.log('Admin programs nested route structure verified.')
