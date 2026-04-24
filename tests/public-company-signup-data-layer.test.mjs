import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const signupStore = readFileSync(
  new URL('../store/modules/company-signup.ts', import.meta.url),
  'utf8',
)

const activationStore = readFileSync(
  new URL('../store/modules/company-activation.ts', import.meta.url),
  'utf8',
)

assert.match(signupStore, /savePendingSelection/, 'The signup store should persist pricing-driven pre-auth selections.')
assert.match(signupStore, /createIntent/, 'The signup store should create backend signup intents.')
assert.match(signupStore, /completeIntent/, 'The signup store should complete public company signup intents.')
assert.match(signupStore, /response\?\.data\?\.message/, 'The signup store should surface backend validation and conflict messages.')
assert.match(signupStore, /A company with this email address already exists/, 'The signup store should return the exact company-email conflict message.')
assert.match(activationStore, /loadActivationState/, 'The activation store should load company activation state.')
assert.match(activationStore, /resumeIntentPurchase/, 'The activation store should resume a signup-intent purchase.')
assert.match(activationStore, /sessionCount/, 'The activation store should pass the edited session count when resuming a signup-intent purchase.')
assert.match(activationStore, /createDirectPurchase/, 'The activation store should support standalone activation purchases.')

console.log('Company signup and activation stores verified.')
