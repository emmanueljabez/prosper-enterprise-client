import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const indexUrl = new URL('../pages/app/employee/cohorts/index.vue', import.meta.url)
const detailUrl = new URL('../pages/app/employee/cohorts/[cohortId].vue', import.meta.url)
const joinUrl = new URL('../pages/app/employee/cohorts/join.vue', import.meta.url)
const navUrl = new URL('../navigation/vertical/employee.ts', import.meta.url)
const roleManagerUrl = new URL('../utils/roleManager.ts', import.meta.url)
const storeUrl = new URL('../store/modules/company-program-cohorts.ts', import.meta.url)
const authMiddlewareUrl = new URL('../middleware/auth.global.ts', import.meta.url)
const adminDetailUrl = new URL('../pages/app/admin/cohorts/[cohortId]/index.vue', import.meta.url)

assert.equal(existsSync(indexUrl), true, 'Employee cohort list route should exist.')
assert.equal(existsSync(detailUrl), true, 'Employee cohort detail route should exist.')
assert.equal(existsSync(joinUrl), true, 'Employee join-code route should exist.')

const indexSource = readFileSync(indexUrl, 'utf8')
const detailSource = readFileSync(detailUrl, 'utf8')
const joinSource = readFileSync(joinUrl, 'utf8')
const navSource = readFileSync(navUrl, 'utf8')
const roleManagerSource = readFileSync(roleManagerUrl, 'utf8')
const storeSource = readFileSync(storeUrl, 'utf8')
const authMiddlewareSource = readFileSync(authMiddlewareUrl, 'utf8')
const adminDetailSource = readFileSync(adminDetailUrl, 'utf8')

assert.match(indexSource, /loadEmployeeCohorts/, 'Employee cohort list should load cohorts through the cohort store.')
assert.match(indexSource, /Join with code/, 'Employee cohort list should expose join-code entry.')
assert.match(indexSource, /navigateTo\(`\/app\/employee\/cohorts\/\$\{cohort\.cohortId\}`\)/, 'Employee cohort cards should open cohort detail.')
assert.match(detailSource, /loadEmployeeCohort/, 'Employee cohort detail should load the selected cohort.')
assert.match(detailSource, /loadEmployeeCohortCircles/, 'Employee cohort detail should load available circles.')
assert.match(detailSource, /requestCircle/, 'Employee cohort detail should allow requesting a circle.')
assert.match(detailSource, /My cohort & circle/, 'Employee detail should match the mentee-facing cohort/circle concept.')
assert.match(detailSource, /Plenary/, 'Employee detail should show plenary stage.')
assert.match(detailSource, /Circle/, 'Employee detail should show circle stage.')
assert.match(detailSource, /1:1/, 'Employee detail should show one-to-one mentor stage.')
assert.match(detailSource, /Request an additional session/, 'Employee detail should surface the expected 1:1 request action.')
assert.match(joinSource, /loadJoinPreview/, 'Join-code page should preview the cohort before submit.')
assert.match(joinSource, /submitSelfJoin/, 'Join-code page should submit self-join intake.')
assert.match(joinSource, /interestTags/, 'Join-code page should capture interest tags for circle suggestions.')
assert.match(joinSource, /previewErrorMessage/, 'Join-code page should keep preview errors visible after the toast disappears.')
assert.match(joinSource, /cohortsStore\.joinPreview\s*=\s*null/, 'Join-code page should clear stale cohort previews when a join code fails.')
const catalogErrorBlock = joinSource.match(/catch \(catalogError: any\) \{([\s\S]*?)\n  \}/)?.[1] || ''
assert.match(catalogErrorBlock, /syncRegionSelectionFromValue\(\)/, 'Join-code page should keep preview region visible if the public catalog lookup is not available.')
assert.match(catalogErrorBlock, /syncChapterSelectionFromValue\(\)/, 'Join-code page should keep preview chapter visible if the public catalog lookup is not available.')
assert.match(joinSource, /showRegionSelect/, 'Join-code page should only use the region select when catalog options are available.')
assert.match(joinSource, /showChapterSelect/, 'Join-code page should only use the chapter select when catalog options are available.')
assert.match(joinSource, /v-else[\s\S]+v-model="joinForm\.region"/, 'Join-code page should fall back to an editable region input.')
assert.match(joinSource, /v-else[\s\S]+v-model="joinForm\.chapter"/, 'Join-code page should fall back to an editable chapter input.')
assert.match(
  joinSource,
  /layout:\s*['"]auth['"]|layout:\s*['"]public['"]|layout:\s*false/,
  'Public cohort join route should not use the logged-in app shell.',
)
assert.doesNotMatch(
  joinSource,
  /middleware:\s*\[['"]auth['"]\]/,
  'Public cohort join route should not require auth before showing the join form.',
)
assert.match(authMiddlewareSource, /\/app\/employee\/cohorts\/join/, 'Global auth middleware should allow public cohort intake links.')
assert.match(
  adminDetailSource,
  /joinCode|join link|Intake Link|publicIntakeLink/i,
  'Admin cohort detail should expose the public intake link.',
)
assert.match(storeSource, /loadEmployeeCohortCircles/, 'Cohort store should expose employee-safe circle loading.')
assert.match(navSource, /My Cohort & Circle/, 'Employee navigation should include cohort and circle entry.')
assert.match(navSource, /\/app\/employee\/cohorts/, 'Employee navigation should point to the cohort list route.')
assert.match(roleManagerSource, /'\/app\/employee\/cohorts':\s*\['mentors:view'\]/, 'Employee cohort list should be covered by route access rules.')
assert.match(roleManagerSource, /'\/app\/employee\/cohorts\/\*':\s*\['mentors:view'\]/, 'Employee cohort detail/join routes should be covered by route access rules.')

console.log('B2B2C employee cohort UI verified.')
