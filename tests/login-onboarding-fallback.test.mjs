import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const loginSource = readFileSync(new URL('../pages/auth/login.vue', import.meta.url), 'utf8')

assert.match(
  loginSource,
  /const isMissingOnboardingEndpoint = \(error: unknown\)/,
  'Login should classify missing onboarding-status endpoints explicitly.',
)

assert.match(
  loginSource,
  /try\s*{[\s\S]*await companyOnboardingStore\.loadOnboardingStatus\(companyId\)[\s\S]*}\s*catch\s*\(onboardingError\)/,
  'Login should guard the onboarding-status lookup with a try/catch.',
)

assert.match(
  loginSource,
  /if \(!isMissingOnboardingEndpoint\(onboardingError\)\)\s*{[\s\S]*throw onboardingError[\s\S]*}/,
  'Login should rethrow non-404 onboarding lookup errors.',
)

assert.match(
  loginSource,
  /console\.warn\('Company onboarding status endpoint returned 404 during login; continuing to admin workspace\.'/,
  'Login should continue to the admin workspace when onboarding status is unavailable.',
)

assert.match(
  loginSource,
  /router\.push\('\/app\/admin'\)/,
  'Login should route corporate admins to the admin workspace after the fallback.',
)

console.log('Login onboarding fallback verified.')
