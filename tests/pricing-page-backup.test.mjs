import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'

const backupUrl = new URL('../pages/pricing.vue.bak', import.meta.url)
const expectedBackupSha256 = '5418ae725a344277cb59d5d43ad521724d78744d27aaeac4025f1c360c80ed6f'

assert.equal(existsSync(backupUrl), true, 'Current pricing page should be backed up before replacement.')

const backupSource = readFileSync(backupUrl, 'utf8')
const backupSha256 = createHash('sha256').update(backupSource).digest('hex')

assert.equal(
  backupSha256,
  expectedBackupSha256,
  'Pricing page backup should exactly match the previous enterprise-main pricing page snapshot.',
)

assert.match(
  backupSource,
  /fetchPlansForAudience\('INDIVIDUAL'\)/,
  'Pricing page backup should preserve the previous backend-backed individual package flow.',
)
assert.match(
  backupSource,
  /Start Free Trial/,
  'Pricing page backup should preserve the previous free-trial CTA.',
)

console.log('Pricing page backup verified.')
