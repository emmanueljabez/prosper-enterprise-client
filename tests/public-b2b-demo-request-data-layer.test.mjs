import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const requestModule = readFileSync(join(repoRoot, 'http/requests/public/b2bDemoRequests.ts'), 'utf8')
const storeModule = readFileSync(join(repoRoot, 'store/modules/b2b-demo-requests.ts'), 'utf8')

assert.match(
  requestModule,
  /api\.post\('\/v1\/public\/b2b-demo-requests', payload\)/,
  'B2B demo request module should submit to the public backend endpoint',
)

assert.doesNotMatch(
  requestModule,
  /status: string|createdAt|updatedAt|sourcePage: string/,
  'B2B demo request public response should not model admin-only lead fields',
)

assert.match(
  storeModule,
  /defineStore\('b2b-demo-requests'/,
  'B2B demo request store should use a stable Pinia store id',
)

assert.match(
  storeModule,
  /submitRequest/,
  'B2B demo request store should expose a submitRequest action',
)

assert.match(
  storeModule,
  /resolveDemoRequestErrorMessage/,
  'B2B demo request store should normalize API error messages for the dialog',
)
