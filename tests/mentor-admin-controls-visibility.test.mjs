import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const pageSource = readFileSync(new URL('../pages/app/admin/mentors.vue', import.meta.url), 'utf8')
const companyTabButton = pageSource.match(/<button[\s\S]*?Company Mentors[\s\S]*?<\/button>/)?.[0] || ''
const companyMentorsPanel = pageSource.match(/<TabsContent\s+value="company"[\s\S]*?<\/TabsContent>/)?.[0] || ''
const prosperMentorActionBlock = pageSource.match(/<Button\s+v-if="hasCompanyMentorAdminAccess"[\s\S]*?Review matches[\s\S]*?<\/Button>[\s\S]*?<Button\s+v-else[\s\S]*?View mentor[\s\S]*?<\/Button>/)?.[0] || ''

assert.match(
  pageSource,
  /<p\s+v-if="hasCompanyMentorAdminAccess"[\s\S]*?>Corporate Admin<\/p>/,
  'The corporate admin eyebrow should not render for mentee or mentor users.',
)

assert.doesNotMatch(
  pageSource,
  /<Button[^>]*@click="openProgramWorkspace"[\s\S]*?Company Programs[\s\S]*?<\/Button>|<Button[^>]*@click="openMatchingWorkspace"[\s\S]*?Mentor Matching[\s\S]*?<\/Button>/,
  'Company Programs and Mentor Matching shortcuts should not render on the admin mentors page.',
)

assert.match(
  companyTabButton,
  /v-if="hasCompanyMentorAdminAccess"/,
  'The Company Mentors tab should not render for mentee or mentor users.',
)

assert.match(
  companyMentorsPanel,
  /v-if="hasCompanyMentorAdminAccess"/,
  'Company mentor operations should not render for mentee or mentor users.',
)

assert.match(
  companyMentorsPanel,
  /<div v-if="canManageCompanyMentors" class="flex flex-wrap gap-2">[\s\S]*?<Button variant="outline" @click="importDialogOpen = true">/,
  'Import controls should render only inside the admin-only Company Mentors panel.',
)

assert.match(
  companyMentorsPanel,
  /<Button @click="inviteDialogOpen = true">/,
  'Invite controls should render only inside the admin-only Company Mentors panel.',
)

assert.match(
  pageSource,
  /<InviteCompanyMentorDialog\s+v-if="hasCompanyMentorAdminAccess"/,
  'Invite dialog should not mount for mentee or mentor users.',
)

assert.match(
  pageSource,
  /<ImportCompanyMentorsDialog\s+v-if="hasCompanyMentorAdminAccess"/,
  'Import dialog should not mount for mentee or mentor users.',
)

assert.ok(
  prosperMentorActionBlock.includes('Review matches') && prosperMentorActionBlock.includes('View mentor'),
  'Prosper mentor cards should show admin matching action only to admins and a non-admin mentor profile action otherwise.',
)

console.log('Mentor admin controls visibility verified.')
