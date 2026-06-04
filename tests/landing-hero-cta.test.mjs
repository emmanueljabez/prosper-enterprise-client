import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const landingSource = readFileSync(
  new URL('../pages/landing.vue', import.meta.url),
  'utf8',
)

const getConnectedSource = readFileSync(
  new URL('../components/landing/GetConnectedSection.vue', import.meta.url),
  'utf8',
)

assert.match(
  getConnectedSource,
  /<section\s+id="get-connected-section"/,
  'The Ready to Elevate Your Team section should expose a stable scroll target.',
)

assert.match(
  landingSource,
  /aria-label="Get in touch"\s+@click="scrollToGetConnectedSection"/,
  'The hero Get in touch button should scroll to the Ready to Elevate section.',
)

assert.match(
  landingSource,
  /const scrollToGetConnectedSection = \(\) => \{[\s\S]*document\s*\.\s*getElementById\('get-connected-section'\)[\s\S]*scrollIntoView\(\{ behavior: 'smooth', block: 'start' \}\)/,
  'The hero CTA scroll helper should smoothly scroll to the get-connected section.',
)

assert.doesNotMatch(
  landingSource,
  /aria-label="Get in touch"\s+@click="go\('\/contact'\)"/,
  'The hero Get in touch button should no longer navigate away from the landing page.',
)

console.log('Landing hero CTA scroll behavior verified.')
