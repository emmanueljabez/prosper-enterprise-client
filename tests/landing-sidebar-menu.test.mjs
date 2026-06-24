import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(
  new URL('../components/landing/PublicSiteHeader.vue', import.meta.url),
  'utf8',
)

assert.doesNotMatch(
  source,
  /goAndClose\('\/auth\/register'\)/,
  'The landing sidebar menu should not route users to registration.',
)

assert.doesNotMatch(
  source,
  /goAndClose\('\/auth\/signup'\)/,
  'The landing sidebar menu should not route users to signup.',
)

assert.match(
  source,
  /@click="goAndClose\('\/auth\/login'\)"[\s\S]*Sign In/,
  'The landing sidebar menu Sign In button should route to the login page.',
)

console.log('Landing sidebar menu account actions verified.')
