import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const typesSource = readFileSync(new URL('../types/company-mentors.ts', import.meta.url), 'utf8')
const requestSource = readFileSync(new URL('../http/requests/app/companyMentors.ts', import.meta.url), 'utf8')
const storeSource = readFileSync(new URL('../store/modules/companyMentors.ts', import.meta.url), 'utf8')

assert.match(typesSource, /CompanyMentorInvitation/)
assert.match(typesSource, /CompanyMentorPoolMember/)
assert.match(typesSource, /CompanyMentorImportValidationResponse/)
assert.match(typesSource, /COMPANY_PRIVATE|PROGRAM_RESTRICTED|PUBLIC_REQUESTED|PUBLIC_APPROVED/)

assert.match(requestSource, /\/v1\/companies\/\$\{companyId\}\/mentor-pool/)
assert.match(requestSource, /\/v1\/companies\/\$\{companyId\}\/mentor-invitations/)
assert.match(requestSource, /validate-import/)
assert.match(requestSource, /\/resend/)
assert.match(requestSource, /\/visibility/)

assert.match(storeSource, /defineStore\('companyMentors'/)
assert.match(storeSource, /loadMentorPool/)
assert.match(storeSource, /inviteMentor/)
assert.match(storeSource, /validateImport/)
assert.match(storeSource, /importMentors/)
assert.match(storeSource, /resendInvitation/)
assert.match(storeSource, /updateVisibility/)
assert.match(storeSource, /removeMembership/)

console.log('Company mentor enrollment store contract verified.')
