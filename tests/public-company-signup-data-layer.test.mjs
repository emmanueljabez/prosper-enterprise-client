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

assert.match(signupStore, /savePendingSelection/, 'The signup store should still support authenticated activation quantity persistence.')
assert.match(signupStore, /createIntent/, 'The signup store should create backend signup intents.')
assert.match(signupStore, /completeIntent/, 'The signup store should complete public company signup intents.')
assert.doesNotMatch(signupStore, /companySignupApi\.createIntent\(\{[\s\S]*planId:\s*pendingSelection/, 'Public signup intents should not carry a pre-login plan purchase selection.')
assert.doesNotMatch(signupStore, /companySignupApi\.createIntent\(\{[\s\S]*sessionCount:\s*pendingSelection/, 'Public signup intents should not carry a pre-login session purchase selection.')
assert.match(signupStore, /response\?\.data\?\.message/, 'The signup store should surface backend validation and conflict messages.')
assert.match(signupStore, /A company with this email address already exists/, 'The signup store should return the exact company-email conflict message.')
assert.match(activationStore, /loadActivationState/, 'The activation store should load company activation state.')
assert.doesNotMatch(activationStore, /resumeIntentPurchase|resumePurchase/, 'The activation store should not resume signup-intent purchases.')
assert.match(activationStore, /createDirectPurchase/, 'The activation store should support standalone activation purchases.')

console.log('Company signup and activation stores verified.')
