import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const storeUrl = new URL('../store/modules/company-program-cohorts.ts', import.meta.url)

const storeSource = readFileSync(storeUrl, 'utf8')

assert.match(
  storeSource,
  /import companyProgramsApi[\s\S]*from ['"]~\/http\/requests\/app\/companyPrograms['"]/,
  'Cohort store should use the company programs request module for the production fallback.',
)

assert.match(
  storeSource,
  /const isMissingCompanyCohortsEndpoint = error\?\.response\?\.status === 404/,
  'Company cohort loading should detect the missing production company-level endpoint.',
)

assert.match(
  storeSource,
  /companyProgramsApi\.getCompanyPrograms\(\{[\s\S]*companyId,[\s\S]*page:\s*0,[\s\S]*size:\s*100,[\s\S]*status:\s*null[\s\S]*\}\)/,
  'Company cohort fallback should load company programs with a backend-safe unfiltered status.',
)

assert.match(
  storeSource,
  /Promise\.all\([\s\S]*programs\.map\([\s\S]*companyProgramCohortsApi\.getCohorts\(program\.id\)/,
  'Company cohort fallback should aggregate cohorts from each program-level endpoint.',
)

assert.match(
  storeSource,
  /this\.cohorts = fallbackCohorts/,
  'Company cohort fallback should populate the standalone cohort list without surfacing a 404.',
)

console.log('Admin cohort company fallback verified.')
