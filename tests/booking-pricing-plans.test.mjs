import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const outDir = mkdtempSync(join(tmpdir(), 'myprosper-booking-pricing-'))
writeFileSync(join(outDir, 'package.json'), '{"type":"module"}\n')

execFileSync(
  'npx',
  [
    'tsc',
    'utils/bookingPricingPlans.ts',
    '--target',
    'ES2022',
    '--module',
    'ES2022',
    '--moduleResolution',
    'bundler',
    '--outDir',
    outDir,
    '--skipLibCheck',
  ],
  {
    cwd: new URL('..', import.meta.url),
    stdio: 'inherit',
  },
)

const pricing = await import(pathToFileURL(join(outDir, 'bookingPricingPlans.js')).href)

const plans = [
  {
    id: 'network',
    code: 'NETWORK',
    name: 'Network',
    cost: 0,
    currency: 'KES',
    sessionsPerPeriod: 0,
    isActive: true,
    displayOrder: 1,
  },
  {
    id: 'single',
    code: 'SINGLE_SESSION',
    name: 'Single Session',
    cost: 4000,
    currency: 'KES',
    sessionsPerPeriod: 1,
    isActive: true,
    displayOrder: 2,
  },
  {
    id: 'legacy-all-access',
    code: 'ALL_ACCESS',
    name: 'All Access',
    cost: 4000,
    currency: 'KES',
    sessionsPerPeriod: 1,
    isActive: true,
    billingType: 'RECURRING',
    displayOrder: 2.5,
  },
  {
    id: 'pack-3',
    code: 'PACK_3',
    name: '3-Session Pack',
    cost: 11000,
    currency: 'KES',
    sessionsPerPeriod: 3,
    isActive: true,
    formattedPrice: 'KES 11000.00/month',
    displayOrder: 3,
  },
  {
    id: 'pack-10',
    code: 'PACK_10',
    name: '10-Session Pack',
    cost: 33000,
    currency: 'KES',
    sessionsPerPeriod: 10,
    isActive: true,
    displayOrder: 4,
  },
  {
    id: 'corp',
    code: 'CORPORATE_SESSION',
    name: 'Enterprise Session',
    cost: 4000,
    currency: 'KES',
    sessionsPerPeriod: 1,
    isActive: true,
    planAudience: 'CORPORATE',
    displayOrder: 5,
  },
  {
    id: 'trial',
    code: 'FREE_TRIAL',
    name: 'Free Trial',
    cost: 0,
    currency: 'KES',
    sessionsPerPeriod: 1,
    isActive: true,
    displayOrder: 6,
  },
]

{
  const bookable = pricing.getBookableSessionPackages(plans)
  assert.deepEqual(
    bookable.map((plan) => plan.code),
    ['SINGLE_SESSION', 'PACK_3', 'PACK_10'],
  )
}

{
  const legacy = plans.find((plan) => plan.code === 'ALL_ACCESS')
  assert.equal(pricing.isBookableSessionPackage(legacy), false)
}

{
  const single = plans[1]
  assert.equal(pricing.formatPackagePrice(single), 'KES 4,000')
  assert.deepEqual(
    pricing.getPackageFeatures(single),
    ['45-minute focused call', 'Immediate session notes', 'Direct chat (24h)'],
  )
}

{
  const pack3 = plans.find((plan) => plan.code === 'PACK_3')
  assert.equal(pricing.formatPackagePrice(pack3), 'KES 11,000')
  const meta = pricing.getPackageDisplayMeta(pack3, plans)
  assert.equal(meta.highlighted, true)
  assert.equal(meta.label, 'SHORT TERM')
  assert.equal(meta.accentLabel, 'SAVE KES 1,000')
}

{
  const pack10 = plans.find((plan) => plan.code === 'PACK_10')
  const meta = pricing.getPackageDisplayMeta(pack10, plans)
  assert.equal(meta.label, 'TRANSFORMATION')
  assert.equal(meta.accentLabel, 'BEST VALUE')
  assert.equal(meta.footnote, 'SAVE KES 7,000')
}

rmSync(outDir, { recursive: true, force: true })
