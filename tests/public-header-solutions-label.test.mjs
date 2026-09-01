import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const publicHeaderSource = readFileSync(
  new URL('../components/landing/PublicSiteHeader.vue', import.meta.url),
  'utf8',
)

const countMatches = (source, pattern) => Array.from(source.matchAll(pattern)).length

assert.match(
  publicHeaderSource,
  /go\('\/pricing'\)/,
  'Desktop public header solutions link should keep routing to /pricing.',
)

assert.match(
  publicHeaderSource,
  /goAndClose\('\/pricing'\)/,
  'Mobile public header solutions link should keep routing to /pricing.',
)

assert.equal(
  countMatches(publicHeaderSource, />\s*Solutions\s*<\/button>/g),
  2,
  'Public header should label both desktop and mobile /pricing links as Solutions.',
)

assert.doesNotMatch(
  publicHeaderSource,
  />\s*Pricing\s*<\/button>/,
  'Public header should not label the /pricing navigation item as Pricing.',
)

console.log('Public header solutions label verified.')
