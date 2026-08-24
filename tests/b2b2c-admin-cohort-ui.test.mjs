import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const detailUrl = new URL('../pages/app/admin/programs/[programId].vue', import.meta.url)
const listUrl = new URL('../components/app/admin/cohorts/CompanyProgramCohortList.vue', import.meta.url)
const editorUrl = new URL('../components/app/admin/cohorts/CompanyProgramCohortEditorDialog.vue', import.meta.url)
const roleManagerUrl = new URL('../utils/roleManager.ts', import.meta.url)
const authTypesUrl = new URL('../types/auth.ts', import.meta.url)

assert.equal(existsSync(listUrl), true, 'Admin program detail should use a dedicated cohort list component.')
assert.equal(existsSync(editorUrl), true, 'Cohort create/edit should use a focused dialog component.')

const detailSource = readFileSync(detailUrl, 'utf8')
const listSource = readFileSync(listUrl, 'utf8')
const editorSource = readFileSync(editorUrl, 'utf8')
const roleManagerSource = readFileSync(roleManagerUrl, 'utf8')
const authTypesSource = readFileSync(authTypesUrl, 'utf8')

assert.match(detailSource, /activeTab = 'cohorts'/, 'Program detail tabs should include Cohorts.')
assert.match(detailSource, /CompanyProgramCohortList/, 'Program detail should render the cohort list in the Cohorts tab.')
assert.match(listSource, /loadCohorts/, 'Cohort list should load cohorts through the cohort store.')
assert.match(listSource, /Create cohort/, 'Cohort list should expose a Create cohort action.')
assert.match(listSource, /navigateTo\(`\/app\/admin\/programs\/\$\{programId\}\/cohorts\/\$\{cohort\.id\}`\)/, 'Cohort cards should open cohort detail route.')
assert.match(editorSource, /selfJoinEnabled/, 'Cohort editor should expose self-join settings.')
assert.match(editorSource, /circleMinSize/, 'Cohort editor should expose circle min size.')
assert.match(editorSource, /circleMaxSize/, 'Cohort editor should expose circle max size.')
assert.match(authTypesSource, /MANAGE_PROGRAM_COHORTS:\s*'admin:program-cohorts'/, 'Auth permission constants should include program cohort management.')
assert.match(roleManagerSource, /admin:program-cohorts/, 'Role manager should register cohort permission.')
assert.match(roleManagerSource, /'\/app\/admin\/programs\/\*':\s*\['admin:programs'[\s\S]*\]/, 'Existing program routes should remain accessible to program admins.')

console.log('B2B2C admin cohort list UI verified.')
