import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'

const programIndex = new URL('../pages/app/admin/programs/[programId]/index.vue', import.meta.url)
const flatProgramPage = new URL('../pages/app/admin/programs/[programId].vue', import.meta.url)
const cohortWorkspace = new URL('../pages/app/admin/programs/[programId]/cohorts/[cohortId].vue', import.meta.url)

assert.ok(
  existsSync(programIndex),
  'Program detail must live at pages/app/admin/programs/[programId]/index.vue so nested cohort routes render.',
)

assert.ok(
  !existsSync(flatProgramPage),
  'Flat pages/app/admin/programs/[programId].vue shadows nested cohort routes and must not exist.',
)

assert.ok(
  existsSync(cohortWorkspace),
  'Admin cohort workspace route must remain nested under pages/app/admin/programs/[programId]/cohorts/[cohortId].vue.',
)

console.log('Admin programs nested route structure verified.')
