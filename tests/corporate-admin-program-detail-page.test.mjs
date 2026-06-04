import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const listSource = readFileSync(new URL('../pages/app/admin/programs/index.vue', import.meta.url), 'utf8')
const storeSource = readFileSync(new URL('../store/modules/company-programs.ts', import.meta.url), 'utf8')
const roleManagerSource = readFileSync(new URL('../utils/roleManager.ts', import.meta.url), 'utf8')
const detailUrl = new URL('../pages/app/admin/programs/[programId].vue', import.meta.url)
const editUrl = new URL('../pages/app/admin/programs/[programId]/edit.vue', import.meta.url)

assert.ok(existsSync(detailUrl), 'Company program detail page should exist at /app/admin/programs/:programId.')
assert.ok(existsSync(editUrl), 'Company program edit page should exist at /app/admin/programs/:programId/edit.')

const detailSource = existsSync(detailUrl) ? readFileSync(detailUrl, 'utf8') : ''
const editSource = existsSync(editUrl) ? readFileSync(editUrl, 'utf8') : ''

assert.match(
  listSource,
  /class="programs-grid"/,
  'Company-created programs should use the employee-style programs grid.',
)
assert.match(
  listSource,
  /class="program-card"/,
  'Company-created programs should render employee-style program cards.',
)
assert.match(
  listSource,
  /class="program-name-link"[\s\S]*navigateTo\(`\/app\/admin\/programs\/\$\{program\.id\}`\)/,
  'Company program names should be blue, underlined links to the detail page.',
)
assert.match(
  listSource,
  /<DropdownMenu>[\s\S]*navigateTo\(`\/app\/admin\/programs\/\$\{program\.id\}`\)[\s\S]*Open Details[\s\S]*<\/DropdownMenu>/,
  'Company program card actions should include a details menu item.',
)

assert.match(
  storeSource,
  /selectedProgram:\s*CompanyProgramRecord\s*\|\s*null/,
  'Company programs store should hold a selected company program for detail pages.',
)
assert.match(
  storeSource,
  /async loadCompanyProgram\(companyProgramId:\s*string\)/,
  'Company programs store should load a single company program through the request layer.',
)
assert.match(
  roleManagerSource,
  /'\/app\/admin\/programs\/\*':\s*\['admin:programs'\]/,
  'Dynamic company program detail routes should require the admin:programs permission.',
)
assert.match(
  roleManagerSource,
  /path\.endsWith\('\/\*'\)[\s\S]*routePath\.startsWith\(path\.slice\(0,\s*-1\)\)/,
  'Route access checks should evaluate wildcard route permissions.',
)

assert.match(
  detailSource,
  /class="program-view-toggle"/,
  'Detail page should use the same segmented tab shell as the admin programs page.',
)
assert.match(
  detailSource,
  /class="program-view-tab"[\s\S]*activeTab = 'overview'[\s\S]*Overview/,
  'Detail page should include an overview segmented tab.',
)
assert.match(
  detailSource,
  /class="program-view-tab"[\s\S]*activeTab = 'employees'[\s\S]*Employees/,
  'Detail page should include an employees segmented tab.',
)
assert.match(
  detailSource,
  /class="program-view-tab"[\s\S]*activeTab = 'matching'[\s\S]*Mentor Matching/,
  'Detail page should include a mentor matching segmented tab.',
)
assert.match(
  detailSource,
  /class="program-view-tab"[\s\S]*activeTab = 'journey'[\s\S]*Journey/,
  'Detail page should include a journey segmented tab.',
)
assert.doesNotMatch(
  detailSource,
  /Settings/,
  'Program detail page should not include a Settings tab.',
)
assert.match(detailSource, /loadCompanyProgram\(programId\.value\)/, 'Detail page should load the selected program by id.')
assert.match(detailSource, /enrollProgramParticipants\(programId\.value,\s*selectedProfileIds\.value\)/, 'Detail page should support adding employees.')
assert.match(detailSource, /loadProgramParticipants\(\{[\s\S]*companyProgramId:\s*programId\.value/, 'Detail page should list program employees.')
assert.match(detailSource, /removeProgramParticipant\(participantId\)/, 'Detail page should support removing employees.')
assert.match(detailSource, /showEnrollEmployeesDialog\.value\s*=\s*true/, 'Detail page should open an add-employees modal from the employees tab.')
assert.match(detailSource, /Dialog,\s*DialogContent,\s*DialogDescription,\s*DialogFooter,\s*DialogHeader,\s*DialogTitle/, 'Detail page should import dialog primitives for employee enrollment.')
assert.match(detailSource, /<Dialog[^>]*:open="showEnrollEmployeesDialog"/, 'Employees enrollment should be driven through a modal dialog.')
assert.match(detailSource, /Add employees/, 'Employees tab should expose an Add employees action button.')
assert.match(detailSource, /loadMentorCandidates\(programId\.value/, 'Detail page should include mentor matching data for the selected program.')
assert.match(detailSource, /assignMentorToParticipant\(participantId,\s*mentorId\)/, 'Detail page should support assigning mentors.')
assert.match(detailSource, /navigateTo\(`\/app\/admin\/programs\/\$\{programId\.value\}\/edit`\)/, 'Detail page actions should navigate to a full program edit page.')
assert.match(detailSource, /const openEditProgramPage = \(\) => \{[\s\S]*navigateTo\(`\/app\/admin\/programs\/\$\{programId\.value\}\/edit`\)/, 'Detail page should provide an edit-page navigation handler.')
assert.match(detailSource, /How Mentor Matching Works/, 'Mentor Matching tab should explain its role in operating program pairings.')
assert.match(editSource, /CompanyProgramEditor/, 'Program edit page should use the shared company program editor.')
assert.match(editSource, /mode="edit"/, 'Program edit page should render editor in edit mode.')
assert.match(editSource, /updateCompanyProgram\(programId\.value,\s*payload\)/, 'Program edit page should persist updates through updateCompanyProgram.')
assert.match(editSource, /navigateTo\(`\/app\/admin\/programs\/\$\{programId\.value\}`\)/, 'Program edit page should navigate back to program details after save.')
assert.match(detailSource, /Program Details[\s\S]*selectedProgram\?\.objective[\s\S]*selectedProgram\?\.targetAudienceDescription/, 'Overview tab should show organized program objective and audience details.')
assert.match(detailSource, /Timeline[\s\S]*selectedProgram\?\.startsAt[\s\S]*selectedProgram\?\.endsAt[\s\S]*selectedProgram\?\.createdAt[\s\S]*selectedProgram\?\.updatedAt/, 'Overview tab should show program timeline details.')
assert.match(detailSource, /Participation[\s\S]*participantsPagination\.totalItems[\s\S]*assignedCount[\s\S]*completedParticipantCount/, 'Overview tab should show participant and matching metrics.')
assert.match(detailSource, /Journey & Catalog[\s\S]*selectedProgram\?\.journeyTemplateName[\s\S]*programCatalogStages/, 'Overview tab should show journey and catalog details.')
assert.match(detailSource, /No lifecycle actions available/, 'Program operations dropdown should not appear empty when no lifecycle actions are available.')
assert.match(
  detailSource,
  /DropdownMenu,\s*DropdownMenuContent,\s*DropdownMenuItem,\s*DropdownMenuSeparator,\s*DropdownMenuTrigger/,
  'Program detail page should import dropdown primitives for header operations.',
)
assert.match(
  detailSource,
  /class="detail-header-actions"[\s\S]*<DropdownMenu>[\s\S]*Actions[\s\S]*Edit program[\s\S]*runStatusAction\('launch'\)[\s\S]*runStatusAction\('pause'\)[\s\S]*runStatusAction\('complete'\)[\s\S]*runStatusAction\('cancel'\)[\s\S]*<\/DropdownMenu>/,
  'Program lifecycle operations should be grouped into a top-right dropdown.',
)
assert.match(
  detailSource,
  /class="program-view-toggle"/,
  'Program detail tabs should match the admin programs segmented tab design.',
)
assert.match(
  detailSource,
  /\.program-view-toggle[\s\S]*width:\s*100%/,
  'Program detail tabs should stretch full width.',
)
assert.match(
  detailSource,
  /\.program-view-tab[\s\S]*min-height:\s*38px[\s\S]*font-size:\s*13px/,
  'Program detail tabs should use a smaller tab size.',
)
assert.doesNotMatch(
  detailSource,
  /<TabsContent\s+value="overview"[\s\S]*<CardTitle>Program Operations<\/CardTitle>/,
  'Program operations should not remain as a card inside the overview tab.',
)

console.log('Corporate admin program detail page verified.')
