import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const helperSource = readFileSync(resolve(root, 'utils/authSession.ts'), 'utf8')
const authStoreSource = readFileSync(resolve(root, 'store/modules/auth.ts'), 'utf8')

assert.match(
  helperSource,
  /status:\s*raw\.status/,
  'Enterprise auth normalizer should preserve backend signup status.',
)

assert.match(
  helperSource,
  /emailVerificationRequired:\s*raw\.emailVerificationRequired/,
  'Enterprise auth normalizer should preserve pending verification flag.',
)

assert.match(
  authStoreSource,
  /const session = normalizeAuthSession\(response\.data,\s*signupPayload\.email\)/,
  'Enterprise register should normalize signup responses with the shared helper.',
)

assert.match(
  authStoreSource,
  /session\.status === 'PENDING_EMAIL_VERIFICATION'/,
  'Enterprise register should branch for pending email verification responses.',
)

assert.match(
  authStoreSource,
  /resolve\(response\.data\)/,
  'Enterprise register should still resolve the raw backend response for callers.',
)

console.log('Enterprise unified signup response verified.')
