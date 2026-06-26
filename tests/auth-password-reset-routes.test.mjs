import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const authMiddlewareSource = readFileSync(new URL('../middleware/auth.global.ts', import.meta.url), 'utf8')
const loginSource = readFileSync(new URL('../pages/auth/login.vue', import.meta.url), 'utf8')
const resetPasswordSource = readFileSync(new URL('../pages/reset-password.vue', import.meta.url), 'utf8')
const authRequestSource = readFileSync(new URL('../http/requests/auth/jwt/index.ts', import.meta.url), 'utf8')
const defaultLayoutSource = readFileSync(new URL('../layouts/default.vue', import.meta.url), 'utf8')

const forgotPasswordPagePath = fileURLToPath(new URL('../pages/forgot-password.vue', import.meta.url))
const resetPasswordPagePath = fileURLToPath(new URL('../pages/reset-password.vue', import.meta.url))

assert.ok(existsSync(forgotPasswordPagePath), 'Forgot password page should exist.')
assert.ok(existsSync(resetPasswordPagePath), 'Reset password page should exist.')
assert.match(loginSource, /to="\/forgot-password"/, 'Login should link to the forgot password page.')

assert.match(
  authMiddlewareSource,
  /PUBLIC_PATHS\s*=\s*new Set\(\[[^\]]*['"]\/forgot-password['"][^\]]*\]\)/s,
  'Forgot password route should be public for unauthenticated users.',
)
assert.match(
  authMiddlewareSource,
  /PUBLIC_PATHS\s*=\s*new Set\(\[[^\]]*['"]\/reset-password['"][^\]]*\]\)/s,
  'Reset password route should be public for unauthenticated recovery links.',
)

assert.ok(defaultLayoutSource.includes("'/forgot-password'"), 'Forgot password page should not render inside the app sidebar layout.')
assert.ok(defaultLayoutSource.includes("'/reset-password'"), 'Reset password page should not render inside the app sidebar layout.')
assert.match(resetPasswordSource, /route\.query\.token/, 'Reset password page should read the custom backend reset token from the URL query.')
assert.match(resetPasswordSource, /resetPasswordWithToken/, 'Reset password page should submit the backend-owned reset token through the auth store.')
assert.match(authRequestSource, /token:\s*string/, 'Reset password request should send a backend reset token.')
assert.doesNotMatch(authRequestSource, /accessToken:\s*string/, 'Reset password request should not depend on Supabase recovery access tokens.')

console.log('Auth password reset routes verified.')
