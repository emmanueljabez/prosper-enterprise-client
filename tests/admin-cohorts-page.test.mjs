import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../pages/app/admin/cohorts.vue', import.meta.url), 'utf8')

assert.match(source, /title:\s*'Cohorts & Circles'/, 'Cohorts page should keep the enterprise navigation title.')
assert.doesNotMatch(source, /<WorkspacePlaceholder\b/, 'Cohorts page should not rely on the missing WorkspacePlaceholder component.')
assert.match(source, />Create Cohort</, 'Cohorts page should render cohort creation as the primary page heading.')
assert.match(source, /<CompanyProgramEditor\b/, 'Cohorts page should use the backend-backed company program editor to create cohorts.')
assert.match(source, /submit-label="Create cohort"/, 'Cohorts page should label the save action as cohort creation.')
assert.match(source, /createCompanyProgram\(companyId\.value, payload\)/, 'Cohorts page should save through the existing company program create flow.')
assert.match(source, /navigateTo\(`\/app\/admin\/programs\/\$\{created\.id\}`\)/, 'Cohorts page should send users to the created cohort detail when an id is returned.')
assert.match(source, /navigateTo\('\/app\/admin\/employees'\)/, 'Cohorts page should keep a working path to manage mentees.')
assert.match(source, /navigateTo\('\/app\/admin\/matches'\)/, 'Cohorts page should keep a working path to matching setup.')

console.log('Admin cohorts page verified.')
