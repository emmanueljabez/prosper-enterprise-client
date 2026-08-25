import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()

const requestPath = resolve(root, 'http/requests/app/companyLocationCatalog.ts')
const cohortsRequestPath = resolve(root, 'http/requests/app/companyProgramCohorts.ts')
const storePath = resolve(root, 'store/modules/company-location-catalog.ts')
const settingsPath = resolve(root, 'pages/app/admin/settings/index.vue')
const regionsTabPath = resolve(root, 'components/app/admin/settings/RegionsSettingsTab.vue')
const chaptersTabPath = resolve(root, 'components/app/admin/settings/ChaptersSettingsTab.vue')
const cohortDialogPath = resolve(root, 'components/app/admin/cohorts/CompanyProgramCohortEditorDialog.vue')
const employeeJoinPath = resolve(root, 'pages/app/employee/cohorts/join.vue')

for (const path of [requestPath, storePath, regionsTabPath, chaptersTabPath]) {
  assert(existsSync(path), `${path} should exist`)
}

const requestSource = readFileSync(requestPath, 'utf8')
const cohortsRequestSource = readFileSync(cohortsRequestPath, 'utf8')
const storeSource = readFileSync(storePath, 'utf8')
const settingsSource = readFileSync(settingsPath, 'utf8')
const regionsTabSource = readFileSync(regionsTabPath, 'utf8')
const chaptersTabSource = readFileSync(chaptersTabPath, 'utf8')
const cohortDialogSource = readFileSync(cohortDialogPath, 'utf8')
const employeeJoinSource = readFileSync(employeeJoinPath, 'utf8')

assert(
  requestSource.includes('/v1/companies/${companyId}/regions') &&
    requestSource.includes('/v1/companies/${companyId}/chapters'),
  'Location catalog requests should call company region and chapter endpoints',
)

assert(
  storeSource.includes("defineStore('company-location-catalog'") &&
    storeSource.includes('loadRegions') &&
    storeSource.includes('loadChapters'),
  'Location catalog store should expose region and chapter loaders',
)

assert(
  settingsSource.includes("type SettingsTab = 'company' | 'branding' | 'program' | 'departments' | 'regions' | 'chapters' | 'subscription' | 'billing'"),
  'Settings tabs should include separate regions and chapters tabs',
)

assert(
  settingsSource.includes('<RegionsSettingsTab') &&
    settingsSource.includes('<ChaptersSettingsTab'),
  'Settings page should render RegionsSettingsTab and ChaptersSettingsTab',
)

assert(
  regionsTabSource.includes('Create region') &&
    regionsTabSource.includes('Edit region') &&
    regionsTabSource.includes('Delete region'),
  'Regions settings tab should expose create, edit, and delete actions',
)

assert(
  regionsTabSource.includes('code: regionForm.value.code.trim(),') &&
    regionsTabSource.includes('description: regionForm.value.description.trim(),') &&
    !regionsTabSource.includes('code: regionForm.value.code.trim() || undefined') &&
    !regionsTabSource.includes('description: regionForm.value.description.trim() || undefined'),
  'Region edit payloads should submit blank optional fields so admins can clear them',
)

assert(
  chaptersTabSource.includes('Create chapter') &&
    chaptersTabSource.includes('Edit chapter') &&
    chaptersTabSource.includes('Delete chapter'),
  'Chapters settings tab should expose create, edit, and delete actions',
)

assert(
  chaptersTabSource.includes('code: chapterForm.value.code.trim(),') &&
    chaptersTabSource.includes('description: chapterForm.value.description.trim(),') &&
    !chaptersTabSource.includes('code: chapterForm.value.code.trim() || undefined') &&
    !chaptersTabSource.includes('description: chapterForm.value.description.trim() || undefined'),
  'Chapter edit payloads should submit blank optional fields so admins can clear them',
)

assert(
  cohortDialogSource.includes('useCompanyLocationCatalogStore') &&
    cohortDialogSource.includes('SelectItem') &&
    cohortDialogSource.includes('filteredChapterOptions'),
  'Cohort dialog should use catalog dropdowns for region and chapter selection',
)

assert(
  cohortsRequestSource.includes('export interface CohortSelfJoinRecord') &&
    cohortsRequestSource.includes('companyId?: string | null'),
  'Self-join preview records should expose companyId so intake can load the company catalog',
)

assert(
  employeeJoinSource.includes('useCompanyLocationCatalogStore') &&
    employeeJoinSource.includes('selectedRegionId') &&
    employeeJoinSource.includes('selectedChapterId') &&
    employeeJoinSource.includes('filteredChapterOptions') &&
    employeeJoinSource.includes('<Select v-model="selectedRegionId"') &&
    employeeJoinSource.includes('<Select v-model="selectedChapterId"'),
  'Employee self-join should use catalog dropdowns for region and chapter intake',
)

console.log('Company location catalog frontend checks passed')
