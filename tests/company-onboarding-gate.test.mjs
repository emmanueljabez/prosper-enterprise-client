import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const onboardingPageUrl = new URL('../pages/app/admin/onboarding.vue', import.meta.url)
const onboardingStoreUrl = new URL('../store/modules/company-onboarding.ts', import.meta.url)

assert.equal(existsSync(onboardingPageUrl), true, 'Company admins should have a dedicated onboarding page before activation.')
assert.equal(existsSync(onboardingStoreUrl), true, 'Company onboarding should have a dedicated Pinia store.')

const middlewareSource = readFileSync(new URL('../middleware/auth.global.ts', import.meta.url), 'utf8')
const loginSource = readFileSync(new URL('../pages/auth/login.vue', import.meta.url), 'utf8')
const companyApiSource = readFileSync(new URL('../http/requests/app/company.ts', import.meta.url), 'utf8')
const onboardingPageSource = readFileSync(onboardingPageUrl, 'utf8')
const onboardingStoreSource = readFileSync(onboardingStoreUrl, 'utf8')
const layoutSource = readFileSync(new URL('../layouts/default.vue', import.meta.url), 'utf8')

assert.match(middlewareSource, /useCompanyOnboardingStore/, 'Auth middleware should load company onboarding state.')
assert.match(middlewareSource, /requiresOnboarding/, 'Auth middleware should gate incomplete company onboarding.')
assert.match(middlewareSource, /\/app\/admin\/onboarding/, 'Incomplete company onboarding should redirect to the onboarding page.')
assert.match(loginSource, /loadOnboardingStatus/, 'Company login should check onboarding before activation.')
assert.match(loginSource, /\/app\/admin\/onboarding/, 'Company login should route incomplete onboarding before activation.')
assert.match(companyApiSource, /getCompanyOnboarding/, 'Company API should expose onboarding status lookup.')
assert.match(companyApiSource, /updateCompanyOnboarding/, 'Company API should expose onboarding update.')
assert.match(onboardingStoreSource, /saveOnboarding/, 'Onboarding store should persist setup details.')
assert.match(onboardingStoreSource, /requiresOnboarding/, 'Onboarding store should expose a gate-friendly computed state.')
assert.match(onboardingPageSource, /AuthSplitShell/, 'First-time company setup should use the shared auth shell.')
assert.match(layoutSource, /'\/app\/admin\/onboarding'/, 'The app layout should hide the sidebar for first-time company setup.')
assert.match(onboardingPageSource, /setupSteps/, 'Onboarding should render a step-based wizard.')
assert.match(onboardingPageSource, /currentStep/, 'Onboarding wizard should track the active setup step.')
assert.match(onboardingPageSource, /Step 1/, 'Onboarding wizard should show numbered steps.')
assert.match(onboardingPageSource, /Step 2/, 'Onboarding wizard should show numbered steps.')
assert.doesNotMatch(onboardingPageSource, /Step 3/, 'Onboarding wizard should not include the deferred program approach step.')
assert.doesNotMatch(onboardingPageSource, /Program approach/, 'Program approach should not be part of first-time onboarding.')
assert.doesNotMatch(onboardingPageSource, /Preferred Prosper programs/, 'Prosper program selection should happen later, not during onboarding.')
assert.match(onboardingPageSource, /country-state-city/, 'Country setup should use the country catalog dependency.')
assert.match(onboardingPageSource, /filteredCountryOptions/, 'Country setup should support searching countries.')
assert.match(onboardingPageSource, /selectCountry/, 'Country setup should select countries from the searchable dropdown.')
assert.match(onboardingPageSource, /inferredTimezone/, 'Selecting a country should infer the timezone.')
assert.match(onboardingPageSource, /baseIndustryOptions/, 'Industry setup should use a curated dropdown option list.')
assert.match(onboardingPageSource, /<select\s+id="industry"/, 'Industry should be captured through a dropdown.')
assert.doesNotMatch(
  onboardingPageSource,
  /<Input id="industry"/,
  'Industry should not be a plain text input.',
)
assert.doesNotMatch(
  onboardingPageSource,
  /<Input id="country"/,
  'Country should not be a plain text input.',
)
assert.doesNotMatch(
  onboardingPageSource,
  /Tell us how Prosper Mentor should support your company\./,
  'Onboarding should not show the previous hero headline.',
)
assert.doesNotMatch(
  onboardingPageSource,
  /Why this matters/,
  'Onboarding should not show the previous explanatory side card.',
)
assert.doesNotMatch(
  onboardingPageSource,
  /lg:grid-cols-\[minmax\(0,1fr\),360px\]/,
  'The onboarding form should span the available auth-shell column width.',
)

for (const field of [
  'industry',
  'companySizeBand',
  'country',
  'timezone',
  'mentorshipObjective',
  'targetAudienceDescription',
]) {
  assert.match(onboardingPageSource, new RegExp(field), `Onboarding page should capture ${field}.`)
}

assert.doesNotMatch(onboardingPageSource, /recommendedProgramIds/, 'Onboarding should not ask companies to choose preferred Prosper programs.')
assert.match(onboardingPageSource, /\/app\/admin\/activate/, 'Completed onboarding should continue to session activation.')

console.log('Company onboarding gate verified.')
