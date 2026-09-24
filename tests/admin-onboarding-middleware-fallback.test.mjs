import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const middlewareUrl = new URL('../middleware/auth.global.ts', import.meta.url)
const middlewareSource = readFileSync(middlewareUrl, 'utf8')

assert.match(
  middlewareSource,
  /const isMissingOnboardingEndpoint = \(error: unknown\)/,
  'Admin auth middleware should identify missing onboarding-status endpoints explicitly.',
)

assert.match(
  middlewareSource,
  /try\s*{[\s\S]*await onboardingStore\.loadOnboardingStatus\(companyId\)[\s\S]*}\s*catch\s*\(onboardingError\)/,
  'Admin auth middleware should guard the onboarding-status lookup with a try/catch.',
)

assert.match(
  middlewareSource,
  /if \(!isMissingOnboardingEndpoint\(onboardingError\)\)\s*{[\s\S]*throw onboardingError[\s\S]*}/,
  'Admin auth middleware should rethrow non-404 onboarding lookup errors.',
)

assert.match(
  middlewareSource,
  /console\.warn\('Company onboarding status endpoint returned 404; continuing without onboarding redirect\.'/,
  'Admin auth middleware should log when it bypasses a missing onboarding-status endpoint.',
)

console.log('Admin onboarding middleware fallback verified.')
