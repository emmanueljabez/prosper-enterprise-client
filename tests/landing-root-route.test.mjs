import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const indexSource = readFileSync(
  new URL('../pages/index.vue', import.meta.url),
  'utf8',
)

const authMiddlewareSource = readFileSync(
  new URL('../middleware/auth.global.ts', import.meta.url),
  'utf8',
)

const nuxtConfigSource = readFileSync(
  new URL('../nuxt.config.ts', import.meta.url),
  'utf8',
)

assert.match(
  indexSource,
  /<LandingPage\s*\/>/,
  'The root route should render the landing page component.',
)

assert.match(
  indexSource,
  /import LandingPage from '\.\/landing\.vue'/,
  'The root route should source the existing landing page experience.',
)

assert.doesNotMatch(
  indexSource,
  /router\.push\('\/auth\/login'\)/,
  'The root route should no longer redirect visitors to login.',
)

assert.match(
  authMiddlewareSource,
  /new Set\(\[[^\]]*'\/'[^\]]*\]\)/,
  'The root landing route should be public in the auth middleware.',
)

assert.match(
  indexSource,
  /Mentorship Infrastructure for Organizations|<LandingPage\s*\/>/,
  'The root route should expose the landing experience.',
)

assert.doesNotMatch(
  nuxtConfigSource,
  /'\/landing':\s*\{\s*redirect:/,
  'The legacy /landing route should not return a blank meta-refresh redirect document.',
)

console.log('Landing root route verified.')
