import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const pageSource = readFileSync(new URL('../pages/app/admin/mentors.vue', import.meta.url), 'utf8')
const inviteDialogSource = readFileSync(new URL('../components/app/admin/mentors/InviteCompanyMentorDialog.vue', import.meta.url), 'utf8')
const importDialogSource = readFileSync(new URL('../components/app/admin/mentors/ImportCompanyMentorsDialog.vue', import.meta.url), 'utf8')
const visibilityDialogSource = readFileSync(new URL('../components/app/admin/mentors/EditCompanyMentorVisibilityDialog.vue', import.meta.url), 'utf8')

assert.match(pageSource, /useCompanyMentorsStore/)
assert.match(pageSource, /import CompanyMentorStatusBadge from '~\/components\/app\/admin\/mentors\/CompanyMentorStatusBadge\.vue'/)
assert.match(pageSource, /import EditCompanyMentorVisibilityDialog from '~\/components\/app\/admin\/mentors\/EditCompanyMentorVisibilityDialog\.vue'/)
assert.match(pageSource, /import ImportCompanyMentorsDialog from '~\/components\/app\/admin\/mentors\/ImportCompanyMentorsDialog\.vue'/)
assert.match(pageSource, /import InviteCompanyMentorDialog from '~\/components\/app\/admin\/mentors\/InviteCompanyMentorDialog\.vue'/)
assert.match(pageSource, /InviteCompanyMentorDialog/)
assert.match(pageSource, /ImportCompanyMentorsDialog/)
assert.match(pageSource, /EditCompanyMentorVisibilityDialog/)
assert.match(pageSource, /Pending invites/)
assert.match(pageSource, /Company-bookable/)
assert.match(pageSource, /Email delivery/)
assert.match(pageSource, /WhatsApp delivery/)
assert.match(pageSource, /Public approval/)
assert.match(pageSource, /resendInvitation/)

assert.match(inviteDialogSource, /email/)
assert.match(inviteDialogSource, /phone/)
assert.match(inviteDialogSource, /COMPANY_PRIVATE/)
assert.match(inviteDialogSource, /PROGRAM_RESTRICTED/)
assert.match(inviteDialogSource, /PUBLIC_REQUESTED/)

assert.match(importDialogSource, /validateImport/)
assert.match(importDialogSource, /importMentors/)
assert.match(importDialogSource, /rowNumber/)
assert.match(importDialogSource, /:disabled="[^"]*errors/)

assert.match(visibilityDialogSource, /updateVisibility/)
assert.match(visibilityDialogSource, /companyProgramIds/)

console.log('Company mentor enrollment UI verified.')
