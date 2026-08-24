import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const pageUrl = new URL('../pages/app/admin/programs/[programId]/cohorts/[cohortId].vue', import.meta.url)

assert.equal(existsSync(pageUrl), true, 'Admin cohort workspace route should exist.')

const pageSource = readFileSync(pageUrl, 'utf8')

assert.match(pageSource, /permissions:\s*\['admin:programs'\]/, 'Cohort workspace should stay under company program admin access.')
assert.match(pageSource, /loadCohort/, 'Workspace should load the selected cohort.')
assert.match(pageSource, /loadParticipants/, 'Workspace should load cohort participants.')
assert.match(pageSource, /loadCircles/, 'Workspace should load common-interest circles.')
assert.match(pageSource, /loadDashboard/, 'Workspace should load the cohort dashboard.')
assert.match(pageSource, /CompanyProgramCohortEditorDialog/, 'Workspace should support editing cohort settings.')
assert.match(pageSource, /confirmParticipant/, 'Workspace should support confirming participants.')
assert.match(pageSource, /rejectParticipant/, 'Workspace should support rejecting participants.')
assert.match(pageSource, /resolveDuplicate/, 'Workspace should expose duplicate review actions.')
assert.match(pageSource, /recordPlenaryAttendance/, 'Workspace should support plenary attendance recording.')
assert.match(pageSource, /suggestCircles/, 'Workspace should request circle suggestions.')
assert.match(pageSource, /createCircle/, 'Workspace should support creating circles.')
assert.match(pageSource, /placeParticipant/, 'Workspace should place participants into circles.')
assert.match(pageSource, /moveMembership/, 'Workspace should move circle members.')
assert.match(pageSource, /removeMembership/, 'Workspace should remove circle members.')
assert.match(pageSource, /finalizeCircles/, 'Workspace should finalize circles.')
assert.match(pageSource, /activeTab = 'circles'/, 'Workspace should include a circles tab.')
assert.match(pageSource, /Unplaced participants/, 'Circle workspace should expose unplaced participants.')
assert.match(pageSource, /Confirm circles as final/, 'Circle workspace should expose finalization action.')

console.log('B2B2C admin cohort workspace UI verified.')
