import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const employeeProgramsSource = readFileSync(
  new URL('../pages/app/employee/programs/index.vue', import.meta.url),
  'utf8',
)
const employeeProgramDetailPath = new URL('../pages/app/employee/programs/[programId].vue', import.meta.url)
const employeeProgramDetailSource = readFileSync(employeeProgramDetailPath, 'utf8')
const companyProgramsRequestSource = readFileSync(
  new URL('../http/requests/app/companyPrograms.ts', import.meta.url),
  'utf8',
)
const companyProgramsStoreSource = readFileSync(
  new URL('../store/modules/company-programs.ts', import.meta.url),
  'utf8',
)

assert.match(
  employeeProgramsSource,
  /useCompanyProgramsStore/,
  'Employee programs should keep using the company programs store for employee functionality.',
)
assert.match(
  employeeProgramsSource,
  /loadMyCompanyPrograms\(\)/,
  'Employee programs should keep loading the employee enrolled programs.',
)
assert.match(
  employeeProgramsSource,
  /loadCatalogPrograms\(\)/,
  'Employee programs should keep loading the Prosper catalog programs.',
)
assert.match(
  employeeProgramsSource,
  /router\.push\(`\/app\/employee\/programs\/\$\{companyProgramId\}`\)/,
  'Employee enrolled programs should open the employee program detail route, not the aggregate journey page.',
)
assert.match(
  employeeProgramsSource,
  /router\.push\(`\/app\/mentors\/programs\/\$\{programId\}`\)/,
  'Catalog program details should still open the mentor program detail route.',
)
assert.ok(
  existsSync(employeeProgramDetailPath),
  'Employee program detail route should exist for enrolled company programs.',
)
assert.match(
  employeeProgramDetailSource,
  /journey-timeline/,
  'Employee program detail should render journey progress as a timeline.',
)
assert.match(
  employeeProgramDetailSource,
  /step\.required\s*\?\s*'Required'\s*:\s*'Optional'/,
  'Journey timeline should show whether each step is required or optional.',
)
assert.match(
  employeeProgramDetailSource,
  /step\.stepType === 'SESSION'[\s\S]*Session required[\s\S]*No session required/,
  'Journey timeline should show whether each step requires a session.',
)
assert.match(
  employeeProgramDetailSource,
  /step\.canBeCompletedByEmployee/,
  'Journey timeline should show whether the employee can complete each step.',
)
assert.match(
  employeeProgramDetailSource,
  /step\.dueAt[\s\S]*step\.completedAt[\s\S]*step\.blockedReason[\s\S]*step\.skippedReason/,
  'Journey timeline should include due, completed, blocked, and skipped details.',
)
assert.match(
  employeeProgramDetailSource,
  /loadMySessionBalance\(\)/,
  'Employee program detail should load the employee session allocation balance for journey session actions.',
)
assert.match(
  employeeProgramDetailSource,
  /resolveJourneyStepAction/,
  'Employee program detail should resolve a primary action for each journey timeline step.',
)
assert.match(
  employeeProgramDetailSource,
  /normalizeBackendJourneyStepAction\(step\.primaryAction/,
  'Employee program detail should prefer backend-provided journey step actions when available.',
)
assert.match(
  employeeProgramDetailSource,
  /availableBalance[\s\S]*Book session[\s\S]*Buy session/,
  'Ready session steps should show Book session when funded sessions remain and Buy session when the allocation is depleted.',
)
assert.match(
  employeeProgramDetailSource,
  /completeJourneyStep\(step\.journeyInstanceStepId\)/,
  'Employee-owned ready journey steps should be completable from the timeline action.',
)
assert.match(
  employeeProgramDetailSource,
  /companyProgramParticipantId[\s\S]*mentorAssignmentForStep\(step\)\?\.mentorId/,
  'Journey session actions should route to the assigned mentor with company program booking context.',
)
assert.match(
  employeeProgramDetailSource,
  /step\.mentorAssignment/,
  'Employee program detail should render mentor assignment from the specific journey step.',
)
assert.match(
  employeeProgramDetailSource,
  /shouldShowMentorOnJourneyStep[\s\S]*timeline-mentor/,
  'Assigned mentors should be displayed inline on the relevant journey stage, not only in top-level program chrome.',
)
assert.match(
  employeeProgramDetailSource,
  /isJourneyStepBookingAction[\s\S]*BOOK_SESSION[\s\S]*BUY_SESSION/,
  'Assigned mentors should be scoped to the journey stage that can proceed to booking after selection.',
)
assert.match(
  employeeProgramDetailSource,
  /step\.status === 'READY'[\s\S]*isJourneyStepBookingAction\(action\)/,
  'Assigned mentors should not spread to locked future session stages just because the program has a mentor assignment.',
)
assert.doesNotMatch(
  employeeProgramDetailSource,
  /step\.stepType === 'SESSION'\s*\n\s*\|\| action\?\.type/,
  'The assigned mentor stage predicate should not treat every session step as selected.',
)
assert.doesNotMatch(
  employeeProgramDetailSource,
  /shouldShowMentorOnJourneyStep[\s\S]*mentorAssignment\.value\?\.mentorId/,
  'The assigned mentor stage predicate should not use the program-level mentor assignment for every session step.',
)
assert.doesNotMatch(
  employeeProgramDetailSource,
  /<span>Mentor<\/span>\s*<strong>{{ mentorAssignment\?\.mentorName \|\| 'Pending' }}<\/strong>/,
  'The top program summary should not promote the selected mentor away from the journey stage.',
)
assert.match(
  employeeProgramDetailSource,
  /targetRoute[\s\S]*companyProgramParticipantId/,
  'Journey session actions should preserve backend target routes while keeping company program booking context.',
)
assert.match(
  employeeProgramDetailSource,
  /showMentorSelectionDialog[\s\S]*loadMentorProfiles[\s\S]*confirmMarketplaceMentorSelection/,
  'Choose mentor journey actions should open an in-page paginated marketplace mentor selection dialog.',
)
assert.match(
  employeeProgramDetailSource,
  /Dialog[\s\S]*Choose Mentor[\s\S]*mentorProfiles[\s\S]*Load more/,
  'The journey mentor selection dialog should render marketplace mentors with pagination controls.',
)
assert.match(
  employeeProgramDetailSource,
  /mentor-selection-grid/,
  'The journey mentor selection dialog should present mentors in a responsive grid, not a single stacked row list.',
)
assert.match(
  companyProgramsRequestSource,
  /select-open/,
  'Company program requests should expose the backend open mentor selection endpoint.',
)
assert.match(
  companyProgramsRequestSource,
  /journeyInstanceStepId\?: string \| null/,
  'Open mentor selection payload should support the selected journey step id.',
)
assert.match(
  companyProgramsStoreSource,
  /selectMyMarketplaceMentor/,
  'Company programs store should provide an action for selecting any eligible marketplace mentor.',
)
assert.match(
  companyProgramsStoreSource,
  /selectMyMarketplaceMentor\(participantId: string, mentorId: string, journeyInstanceStepId\?: string \| null\)/,
  'Company programs store should pass the active journey step id when choosing a marketplace mentor.',
)
assert.match(
  employeeProgramDetailSource,
  /activeMentorSelectionStep\.value\?\.journeyInstanceStepId/,
  'Employee program detail should submit the active journey step id with marketplace mentor selection.',
)

for (const className of [
  'page-wrapper',
  'hero-banner',
  'programs-grid',
  'program-card',
  'duration-badge',
  'see-details-btn',
]) {
  assert.match(
    employeeProgramsSource,
    new RegExp(`class="[^"]*${className}|\\.${className}`),
    `Employee programs should reuse the mentor programs ${className} design pattern.`,
  )
}

assert.doesNotMatch(
  employeeProgramsSource,
  /<Card|from ['"]~\/components\/ui\/card['"]/,
  'Employee programs should not render the old generic shadcn card layout.',
)

console.log('Employee programs page design verified.')
