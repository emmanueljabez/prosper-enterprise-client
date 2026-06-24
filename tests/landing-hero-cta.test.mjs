import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const landingSource = readFileSync(
  new URL('../pages/landing.vue', import.meta.url),
  'utf8',
)

assert.match(
  landingSource,
  /const FREE_TRIAL_SIGNUP_PATH = '\/auth\/signup\?audience=mentee&trial=1&product=FREE_TRIAL'/,
  'The landing page should keep the free-trial signup path as a stable constant.',
)

assert.match(
  landingSource,
  /<NuxtLink[\s\S]*:to="FREE_TRIAL_SIGNUP_PATH"[\s\S]*aria-label="Start free trial"[\s\S]*Start free trial[\s\S]*<\/NuxtLink>/,
  'The hero CTA should route visitors into the free-trial signup flow.',
)

assert.doesNotMatch(
  landingSource,
  /aria-label="Get in touch"|>\s*Get in touch\s*<\/button>|scrollToImpactSection|scrollToGetConnectedSection/,
  'The hero should no longer render the old Get in touch CTA or scroll behavior.',
)

console.log('Landing hero free-trial CTA verified.')
