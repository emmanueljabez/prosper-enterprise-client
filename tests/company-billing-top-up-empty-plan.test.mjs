import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const billingPage = readFileSync(join(repoRoot, 'pages/app/admin/billing/index.vue'), 'utf8')

assert.match(
  billingPage,
  /routeToCompanyPlanSetup/,
  'Billing top-up flow should centralize empty-plan handling.',
)

assert.match(
  billingPage,
  /router\.push\(\{\s*path:\s*'\/app\/admin\/settings'[\s\S]*?tab:\s*'subscription'/,
  'Billing top-up flow should route admins without a company plan to Settings > Plans.',
)

assert.match(
  billingPage,
  /if\s*\(!subscription\.value\?\.planId\)\s*\{[\s\S]*?routeToCompanyPlanSetup\(\)[\s\S]*?return/,
  'Opening the top-up flow should redirect to plan setup when no company plan exists.',
)

assert.doesNotMatch(
  billingPage,
  /No company plan found\. Select a plan first from settings\./,
  'Billing top-up flow should not leave admins at the old dead-end no-plan toast.',
)

assert.match(
  billingPage,
  /:disabled="isLoading \|\| isCreatingTopUpInvoice"/,
  'Top up Wallet should stay disabled until billing dashboard data has loaded.',
)

console.log('Company billing empty-plan top-up handling verified.')
