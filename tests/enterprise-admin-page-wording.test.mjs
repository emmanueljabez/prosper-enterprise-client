import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const read = relativePath => readFileSync(join(repoRoot, relativePath), 'utf8')

const pages = {
  overview: read('pages/app/admin/index.vue'),
  mentees: read('pages/app/admin/employees.vue'),
  importMentees: read('pages/app/admin/users/import.vue'),
  programs: read('pages/app/admin/programs/index.vue'),
  mentors: read('pages/app/admin/mentors.vue'),
  matching: read('pages/app/admin/matches.vue'),
  sessions: read('pages/app/admin/sessions.vue'),
  finance: read('pages/app/admin/billing/index.vue'),
  tracking: read('pages/app/admin/reports/index.vue'),
  templates: read('pages/app/admin/journey-templates/index.vue'),
}

assert.match(pages.overview, /title:\s*'Overview'/, 'Admin dashboard meta title should be Overview.')
assert.match(pages.overview, />Overview</, 'Admin dashboard page heading should be Overview.')
assert.doesNotMatch(pages.overview, /Corporate Admin Dashboard/, 'Overview should not use the old dashboard title.')

assert.match(pages.mentees, /title:\s*'Mentees'/, 'Mentee workspace meta title should be Mentees.')
assert.match(pages.mentees, />Mentee Management</, 'Mentee workspace should use Mentee Management heading.')
assert.match(pages.mentees, /Invite Mentee/, 'Mentee workspace should invite mentees.')
assert.match(pages.mentees, /Import Mentee/, 'Mentee workspace should import mentees.')
assert.doesNotMatch(pages.mentees, />Employee Management</, 'Mentee workspace should not keep the old Employee Management heading.')

assert.match(pages.importMentees, /title:\s*'Import Mentees'/, 'Import page meta title should use mentee terminology.')
assert.match(pages.importMentees, />Import Mentees</, 'Import page heading should use mentee terminology.')
assert.doesNotMatch(pages.importMentees, /Import Employees/, 'Import page should not use the old employee title.')

assert.match(pages.programs, /title:\s*'Programs'/, 'Programs page meta title should be Programs.')
assert.match(pages.programs, />Programs</, 'Programs page heading should be Programs.')
assert.match(pages.programs, /New Program/, 'Programs primary CTA should be New Program.')
assert.doesNotMatch(pages.programs, /Company Programs|New Company Program/, 'Programs page should avoid old company-program framing in primary copy.')

assert.match(pages.mentors, /title:\s*'Mentors'/, 'Mentors page meta title should be Mentors.')
assert.match(pages.mentors, />Mentors</, 'Mentors page heading should be Mentors.')
assert.doesNotMatch(pages.mentors, /title:\s*'Mentoring'|>Mentoring</, 'Mentors page should not use the old Mentoring title.')

assert.match(pages.matching, /title:\s*'One-to-One Matching'/, 'Matching page meta title should be One-to-One Matching.')
assert.match(pages.matching, />One-to-One Matching</, 'Matching page heading should be One-to-One Matching.')
assert.match(pages.matching, /Matching Workspace/, 'Matching page should name the assignment area Matching Workspace.')
assert.doesNotMatch(pages.matching, /Assignment Workspace|Employees</, 'Matching page should avoid old assignment and employee labels.')

assert.match(pages.sessions, /title:\s*'One-to-One Sessions'/, 'Sessions page meta title should be One-to-One Sessions.')
assert.match(pages.sessions, />One-to-One Sessions</, 'Sessions page heading should be One-to-One Sessions.')
assert.match(pages.sessions, /Clear Filters/, 'Sessions empty state should offer a clear-filters path.')
assert.match(pages.sessions, /Go to Programs/, 'Sessions empty state should link empty schedules back to programs.')

assert.match(pages.finance, /title:\s*'Finance'/, 'Billing page meta title should be Finance.')
assert.match(pages.finance, />Finance</, 'Billing page heading should be Finance.')
assert.match(pages.finance, /Billing &amp; Session Wallet/, 'Finance page should still name the billing and wallet surface.')

assert.match(pages.tracking, /title:\s*'Tracking'/, 'Reports index meta title should be Tracking.')
assert.match(pages.tracking, />Tracking</, 'Reports index heading should be Tracking.')
for (const label of ['Program Tracking', 'Mentee Tracking', 'Matching Tracking', 'Session Tracking', 'Pulse Tracking', 'Risk Signals Tracking', 'Finance Tracking']) {
  assert.match(pages.tracking, new RegExp(label), `Tracking page should include ${label}.`)
}

assert.match(pages.templates, /Published|Archived/, 'Journey templates should surface published and archived lifecycle language.')
assert.match(pages.templates, /Preview Journey/, 'Journey templates should use Preview Journey wording.')

console.log('Enterprise admin page wording verified.')
