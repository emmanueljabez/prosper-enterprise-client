import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../pages/app/admin/cohorts.vue', import.meta.url), 'utf8')

assert.match(source, /title:\s*'Cohorts & Circles'/, 'Cohorts page should keep the enterprise navigation title.')
assert.doesNotMatch(source, /<WorkspacePlaceholder\b/, 'Cohorts page should not rely on the missing WorkspacePlaceholder component.')
assert.match(source, />Cohorts &amp; Circles</, 'Cohorts page should render a visible heading.')
assert.match(source, /Launch Cohort/, 'Cohorts page should expose a launch cohort action.')
assert.match(source, /navigateTo\('\/app\/admin\/programs'\)/, 'Cohorts page should link cohort setup back to programs.')
assert.match(source, /navigateTo\('\/app\/admin\/employees'\)/, 'Cohorts page should link cohort setup back to mentees.')
assert.match(source, /Matching readiness/, 'Cohorts page should surface matching readiness guidance.')

console.log('Admin cohorts page verified.')
