import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const dialogSource = readFileSync(new URL('../components/app/admin/mentors/ImportCompanyMentorsDialog.vue', import.meta.url), 'utf8')
const templateUrl = new URL('../utils/companyMentorImportTemplate.ts', import.meta.url)

assert.equal(existsSync(templateUrl), true, 'company mentor import template helper should exist')

const templateSource = readFileSync(templateUrl, 'utf8')

assert.match(dialogSource, /downloadCompanyMentorImportTemplate/)
assert.match(dialogSource, /Download template/)

for (const column of [
  'email',
  'phone',
  'first_name',
  'last_name',
  'title',
  'department',
  'tags',
  'visibility',
  'program_or_cohort',
]) {
  assert.match(templateSource, new RegExp(`['"]${column}['"]`))
}

assert.match(templateSource, /COMPANY_PRIVATE/)
assert.match(templateSource, /PROGRAM_RESTRICTED/)
assert.match(templateSource, /PUBLIC_REQUESTED/)
assert.match(templateSource, /prosper-company-mentor-import-template\.xlsx/)
assert.match(templateSource, /createObjectURL/)
assert.match(templateSource, /revokeObjectURL/)
assert.doesNotMatch(templateSource, /\.writeFile\(/)

console.log('Company mentor import template verified.')
