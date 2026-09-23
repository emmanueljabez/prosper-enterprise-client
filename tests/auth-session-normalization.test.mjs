import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const helperSource = readFileSync(resolve(root, 'utils/authSession.ts'), 'utf8')
const authStoreSource = readFileSync(resolve(root, 'store/modules/auth.ts'), 'utf8')

assert.match(
  helperSource,
  /export const normalizeAuthSession/,
  'Enterprise should expose a shared auth session normalizer.',
)

assert.match(
  helperSource,
  /accessToken:\s*raw\.accessToken\s*\|\|\s*raw\.access_token/,
  'Normalizer should prefer camelCase accessToken and fall back to legacy access_token.',
)

assert.match(
  helperSource,
  /refreshToken:\s*raw\.refreshToken\s*\|\|\s*raw\.refresh_token/,
  'Normalizer should prefer camelCase refreshToken and fall back to legacy refresh_token.',
)

assert.match(
  authStoreSource,
  /normalizeAuthSession/,
  'Auth store should consume normalized backend auth sessions.',
)

assert.match(
  authStoreSource,
  /session\.accessToken/,
  'Auth store should persist the normalized accessToken.',
)

console.log('Enterprise auth session normalization verified.')
