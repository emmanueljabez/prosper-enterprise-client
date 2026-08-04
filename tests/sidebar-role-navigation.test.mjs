import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const sidebarSource = readFileSync(new URL('../store/modules/sidebar.ts', import.meta.url), 'utf8')

assert.match(
  sidebarSource,
  /const CORPORATE_ROLE_NAMES = new Set\(\['company', 'company_admin', 'corporate_admin'\]\)/,
  'Sidebar should treat company, company_admin, and corporate_admin as corporate navigation roles.',
)

assert.match(
  sidebarSource,
  /const resolveSidebarRoleFromRoleNames = \(roleNames: unknown\[\]\)/,
  'Sidebar role resolution should be centralized instead of branching directly on raw storage.',
)

assert.match(
  sidebarSource,
  /authStore\.loggedInUser\?\.roles/,
  'Sidebar should prefer the normalized authenticated session roles.',
)

assert.match(
  sidebarSource,
  /parsedProfile\?\.role/,
  'Sidebar should fall back to the persisted responseProfile.role after refresh.',
)

assert.match(
  sidebarSource,
  /\.\.\.resolveStoredSidebarRoleNames\(\)/,
  'Sidebar should resolve across both hydrated auth roles and persisted login-response roles.',
)

assert.match(
  sidebarSource,
  /localStorage\.getItem\('role'\)/,
  'Sidebar should keep legacy stored role fallback for older sessions.',
)

assert.doesNotMatch(
  sidebarSource,
  /const role = localStorage\.getItem\("role"\)/,
  'Sidebar should not resolve navigation solely from localStorage.role.',
)

assert.match(
  sidebarSource,
  /role === 'company'/,
  'Normalized company sidebar role should select corporate admin navigation.',
)

console.log('Sidebar role navigation contract verified.')
