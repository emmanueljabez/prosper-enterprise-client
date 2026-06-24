import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const mentorPagePath = resolve('pages/app/mentors/[id].vue')
const mentorPage = readFileSync(mentorPagePath, 'utf8')

assert.match(
  mentorPage,
  /fetchPlansForAudience\('INDIVIDUAL'\)/,
  'additional-session payment-required flow should load the same individual package plans used by pricing',
)

assert.match(
  mentorPage,
  /v-if="addOnOption && addOnOption\.available && recommendedPlans\.length === 0"/,
  'legacy add-on purchase button should only be shown when no backend package plans are available',
)

assert.doesNotMatch(
  mentorPage,
  /if \(apiAddOnOption && apiAddOnOption\.available\) \{[\s\S]*?recommendedPlans\.value = \[\]/,
  'add-on flow should not clear package recommendations before trying to load backend package plans',
)
