import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const listPageUrl = new URL('../pages/app/admin/cohorts/index.vue', import.meta.url)
const workspacePageUrl = new URL('../pages/app/admin/cohorts/[cohortId].vue', import.meta.url)
const legacyWorkspaceUrl = new URL('../pages/app/admin/programs/[programId]/cohorts/[cohortId].vue', import.meta.url)
const programDetailUrl = new URL('../pages/app/admin/programs/[programId]/index.vue', import.meta.url)
const requestUrl = new URL('../http/requests/app/companyProgramCohorts.ts', import.meta.url)
const storeUrl = new URL('../store/modules/company-program-cohorts.ts', import.meta.url)
const navUrl = new URL('../navigation/vertical/corporate-admin.ts', import.meta.url)
const roleManagerUrl = new URL('../utils/roleManager.ts', import.meta.url)

assert.equal(existsSync(listPageUrl), true, 'Standalone admin cohorts list should exist at /app/admin/cohorts.')
assert.equal(existsSync(workspacePageUrl), true, 'Standalone admin cohort workspace should exist at /app/admin/cohorts/:cohortId.')
assert.equal(existsSync(legacyWorkspaceUrl), true, 'Legacy nested cohort route should remain as a redirect for old links.')

const listPageSource = readFileSync(listPageUrl, 'utf8')
const workspacePageSource = readFileSync(workspacePageUrl, 'utf8')
const legacyWorkspaceSource = readFileSync(legacyWorkspaceUrl, 'utf8')
const programDetailSource = readFileSync(programDetailUrl, 'utf8')
const requestSource = readFileSync(requestUrl, 'utf8')
const storeSource = readFileSync(storeUrl, 'utf8')
const navSource = readFileSync(navUrl, 'utf8')
const roleManagerSource = readFileSync(roleManagerUrl, 'utf8')

assert.match(
  requestSource,
  /getCompanyCohorts\(companyId:\s*string\)[\s\S]*`\/v1\/companies\/\$\{companyId\}\/program-cohorts`/,
  'Request layer should load cohorts across all company programs from a company-level API.',
)
assert.match(
  storeSource,
  /async loadCompanyCohorts\(companyId:\s*string\)[\s\S]*companyProgramCohortsApi\.getCompanyCohorts\(companyId\)/,
  'Cohort store should expose a company-level load action for the standalone page.',
)
assert.match(
  navSource,
  /title:\s*'Cohorts'[\s\S]*url:\s*'\/app\/admin\/cohorts'[\s\S]*permission:\s*'admin:program-cohorts'/,
  'Corporate admin navigation should expose standalone Cohorts.',
)
assert.match(
  roleManagerSource,
  /'\/app\/admin\/cohorts':\s*\['admin:program-cohorts'\]/,
  'Standalone cohort list should have route access rules.',
)
assert.match(
  roleManagerSource,
  /'\/app\/admin\/cohorts\/\*':\s*\['admin:program-cohorts'\]/,
  'Standalone cohort workspace should have route access rules.',
)

assert.match(listPageSource, /permissions:\s*\['admin:program-cohorts'\]/, 'Standalone cohort list should use the cohort permission.')
assert.match(listPageSource, /loadCompanyCohorts\(companyId\.value\)/, 'Standalone cohort list should load cohorts by company.')
assert.match(listPageSource, /loadCompanyPrograms/, 'Standalone cohort list should load programs for create and filtering.')
assert.match(listPageSource, /selectedProgramFilter/, 'Standalone cohort list should support program filtering.')
assert.match(listPageSource, /selectedRegionFilter/, 'Standalone cohort list should support region filtering.')
assert.match(listPageSource, /selectedChapterFilter/, 'Standalone cohort list should support chapter filtering.')
assert.match(listPageSource, /selectedStatusFilter/, 'Standalone cohort list should support status filtering.')
assert.match(listPageSource, /CompanyProgramCohortEditorDialog/, 'Standalone cohort list should create cohorts from a dialog.')
assert.match(
  listPageSource,
  /Table,\s*TableBody,\s*TableCell,\s*TableHead,\s*TableHeader,\s*TableRow/,
  'Standalone cohort list should import shared table primitives.',
)
assert.match(
  listPageSource,
  /<Table[\s\S]*<TableHeader[\s\S]*<TableBody[\s\S]*v-for="cohort in visibleCohorts"/,
  'Standalone cohort list should render cohorts as table rows.',
)
assert.match(listPageSource, /navigateTo\(`\/app\/admin\/cohorts\/\$\{cohort\.id\}`\)/, 'Standalone cohort rows should open the standalone workspace.')
assert.doesNotMatch(listPageSource, /class="cohort-card/, 'Standalone cohort list should not use card grid items for the primary listing.')

assert.match(workspacePageSource, /permissions:\s*\['admin:program-cohorts'\]/, 'Standalone cohort workspace should use the cohort permission.')
assert.match(workspacePageSource, /const cohortId = computed\(\(\) => String\(route\.params\.cohortId \|\| ''\)\)/, 'Workspace should read cohortId from the standalone route.')
assert.match(workspacePageSource, /selectedCohort\.value\?\.companyProgramId/, 'Workspace should derive the parent program from the loaded cohort.')
assert.match(workspacePageSource, /router\.push\('\/app\/admin\/cohorts'\)/, 'Workspace back action should return to standalone cohorts.')
assert.doesNotMatch(workspacePageSource, /route\.params\.programId/, 'Standalone workspace should not depend on a program route parameter.')

assert.match(
  legacyWorkspaceSource,
  /path:\s*`\/app\/admin\/cohorts\/\$\{route\.params\.cohortId\}`[\s\S]*query:\s*route\.query/,
  'Legacy nested cohort route should redirect to the standalone workspace.',
)
assert.match(
  programDetailSource,
  /\/app\/admin\/cohorts\?programId=\$\{programId\.value\}/,
  'Program detail should link to the standalone cohorts page filtered by program.',
)
assert.doesNotMatch(
  programDetailSource,
  /<CompanyProgramCohortList/,
  'Program detail should not embed the operational cohort list.',
)

console.log('Standalone admin cohort routes verified.')
