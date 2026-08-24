import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const requestUrl = new URL('../http/requests/app/companyProgramCohorts.ts', import.meta.url)
const storeUrl = new URL('../store/modules/company-program-cohorts.ts', import.meta.url)

assert.equal(existsSync(requestUrl), true, 'Cohort APIs should live in a focused request module.')
assert.equal(existsSync(storeUrl), true, 'Cohort state should live in a focused Pinia store.')

const requestSource = readFileSync(requestUrl, 'utf8')
const storeSource = readFileSync(storeUrl, 'utf8')

for (const endpoint of [
  '/v1/company-programs/${companyProgramId}/cohorts',
  '/v1/company-program-cohorts/${cohortId}',
  '/v1/company-program-cohorts/${cohortId}/participants',
  '/v1/company-program-cohorts/${cohortId}/circles',
  '/v1/company-program-cohorts/${cohortId}/circle-suggestions',
  '/v1/company-program-cohorts/${cohortId}/circles/finalize',
  '/v1/company-program-cohorts/${cohortId}/dashboard',
  '/v1/me/company-program-cohorts',
]) {
  assert.ok(requestSource.includes(endpoint), `Request module should define ${endpoint}.`)
}

for (const action of [
  'loadCohorts',
  'loadCohort',
  'createCohort',
  'loadParticipants',
  'confirmParticipant',
  'recordPlenaryAttendance',
  'loadCircles',
  'suggestCircles',
  'placeParticipant',
  'finalizeCircles',
  'loadEmployeeCohorts',
]) {
  assert.match(storeSource, new RegExp(`async ${action}\\(`), `Store should expose ${action}.`)
}

assert.doesNotMatch(storeSource, /from ['"]~?\/?http\/axios['"]/, 'Store should call the cohort request module, not axios directly.')

console.log('B2B2C cohort data layer verified.')
