import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(
  new URL('../components/landing/SocialFooter.vue', import.meta.url),
  'utf8',
)

assert.match(
  source,
  /const currentYear = new Date\(\)\.getFullYear\(\)/,
  'The landing footer should derive the copyright year locally.',
)

assert.doesNotMatch(
  source,
  /:current-year="currentYear"/,
  'The landing footer should not pass the year through a component prop path.',
)

assert.doesNotMatch(
  source,
  /barProps\.currentYear/,
  'The copyright text should not rely on a BottomBar prop that can become undefined.',
)

assert.match(
  source,
  /`© Copyright \$\{currentYear\}, Prosper Mentor`/,
  'The copyright text should interpolate the locally derived year directly.',
)

console.log('Landing footer copyright year wiring verified.')
