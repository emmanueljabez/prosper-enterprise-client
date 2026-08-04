import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const authSource = readFileSync(new URL('../store/modules/auth.ts', import.meta.url), 'utf8')

assert.match(
  authSource,
  /const resolveStoredRoleNames = \(decoded\?: JwtPayload\): string\[\] =>/,
  'Auth storage hydration should centralize role fallback from stored login context.',
)

assert.match(
  authSource,
  /const decodedRoleNames = normalizeRoleNames\(decoded\.roles\)/,
  'Auth storage hydration should normalize role names from the decoded JWT when present.',
)

assert.match(
  authSource,
  /const hydratedRoleNames = decodedRoleNames\.length\s+\? decodedRoleNames\s+: resolveStoredRoleNames\(decoded\)/,
  'When the JWT omits roles, auth hydration should fall back to the persisted response profile or stored user roles.',
)

assert.match(
  authSource,
  /parsedProfile\?\.role/,
  'Auth storage hydration should read persisted responseProfile.role.',
)

assert.match(
  authSource,
  /parsedUser\?\.roles/,
  'Auth storage hydration should read persisted loggedInUser.roles.',
)

assert.doesNotMatch(
  authSource,
  /decoded\.roles\?\.map[\s\S]{0,220}\|\| \[DEFAULT_ROLES\.employee\]/,
  'Auth storage hydration should not default to employee before consulting stored role context.',
)

console.log('Auth storage role hydration contract verified.')
