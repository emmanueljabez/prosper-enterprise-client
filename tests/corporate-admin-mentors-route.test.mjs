import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const corporateNavigationSource = readFileSync(
  new URL('../navigation/vertical/corporate-admin.ts', import.meta.url),
  'utf8',
)
const employeeNavigationSource = readFileSync(
  new URL('../navigation/vertical/employee.ts', import.meta.url),
  'utf8',
)
const adminMentorsSource = readFileSync(
  new URL('../pages/app/admin/mentors.vue', import.meta.url),
  'utf8',
)
const prosperMentorsPanel = adminMentorsSource.match(/<TabsContent\s+value="prosper"[\s\S]*?<\/TabsContent>/)?.[0] || ''
const companyMentorsPanel = adminMentorsSource.match(/<TabsContent\s+value="company"[\s\S]*?<\/TabsContent>/)?.[0] || ''

assert.match(
  corporateNavigationSource,
  /title:\s*'Mentors'[\s\S]*?url:\s*'\/app\/admin\/mentors'[\s\S]*?permission:\s*'admin:mentors'/,
  'Corporate admin sidebar Mentors should link to the admin mentors workspace.',
)

assert.match(
  employeeNavigationSource,
  /title:\s*'Mentors'[\s\S]*?url:\s*'\/app\/mentors'[\s\S]*?permission:\s*'mentors:view'/,
  'Employee sidebar Mentors should keep using the mentee mentor marketplace path.',
)

assert.doesNotMatch(
  adminMentorsSource,
  /['"`]\/app\/mentors['"`]/,
  'The admin mentors route should not send corporate admins into the mentee mentor marketplace.',
)

assert.match(
  adminMentorsSource,
  /permissions:\s*\[\s*'admin:mentors'\s*\]/,
  'The admin mentors route should remain protected by admin:mentors.',
)

assert.match(
  adminMentorsSource,
  /Tabs,\s*TabsContent/,
  'The admin mentors page should use tab primitives for mentor sections.',
)

assert.match(
  adminMentorsSource,
  /<Tabs\s+v-model="activeMentorTab"/,
  'The admin mentors page should render tabbed mentor sections.',
)

assert.match(
  adminMentorsSource,
  /class="program-view-toggle"/,
  'The admin mentors page should reuse the admin programs segmented tab control.',
)

assert.match(
  adminMentorsSource,
  /Prosper Mentors[\s\S]*totalMentors/,
  'The admin mentors page should show a Prosper Mentors tab with the platform mentor count.',
)

assert.match(
  adminMentorsSource,
  /Company Mentors[\s\S]*companyMentors\.length/,
  'The admin mentors page should show a Company Mentors tab with the company mentor count.',
)

assert.match(
  adminMentorsSource,
  /<TabsContent\s+value="prosper"/,
  'Prosper mentors should render inside a Prosper tab panel.',
)

assert.match(
  prosperMentorsPanel,
  /prosper-mentor-card-grid/,
  'Prosper mentors should render as the original card grid design.',
)

assert.doesNotMatch(
  prosperMentorsPanel,
  /<Table(?:\s|>)/,
  'Prosper mentors should not render as an operations table.',
)

assert.match(
  adminMentorsSource,
  /<TabsContent\s+value="company"/,
  'Company mentors should render inside a company tab panel.',
)

assert.match(
  companyMentorsPanel,
  /<Table(?:\s|>)/,
  'Company mentors can keep the operational table layout.',
)

assert.match(
  adminMentorsSource,
  /No company mentors yet[\s\S]*Add new/,
  'The company mentors empty state should offer an Add new action.',
)

assert.doesNotMatch(
  adminMentorsSource,
  /Open Mentor Matching/,
  'The company mentors empty state should not use the old Mentor Matching button label.',
)

console.log('Corporate admin mentors route verified.')
