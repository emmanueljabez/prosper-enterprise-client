import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const progressionUrl = new URL('../utils/company-walkthrough-progression.ts', import.meta.url)
const walkthroughUrl = new URL('../components/app/admin/onboarding/CompanyAdminWalkthrough.client.vue', import.meta.url)

assert.equal(existsSync(progressionUrl), true, 'Walkthrough progression should live in a dedicated utility.')

const progressionSource = readFileSync(progressionUrl, 'utf8')
const transpiled = ts.transpileModule(progressionSource, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
  reportDiagnostics: true,
})

const errors = (transpiled.diagnostics || []).filter(diagnostic => diagnostic.category === ts.DiagnosticCategory.Error)
assert.deepEqual(
  errors.map(error => ts.flattenDiagnosticMessageText(error.messageText, '\n')),
  [],
  'Walkthrough progression utility should transpile without TypeScript errors.',
)

const module = { exports: {} }
vm.runInNewContext(transpiled.outputText, { exports: module.exports, module })

const { resolveNextCompanyWalkthroughTask } = module.exports

const tasks = [
  { id: 'review_dashboard', tourId: 'admin-dashboard-overview', route: '/app/admin' },
  { id: 'fund_session_wallet', tourId: 'admin-wallet-overview', route: '/app/admin' },
  { id: 'invite_mentees', tourId: 'admin-mentees-overview', route: '/app/admin/employees' },
  { id: 'create_program', tourId: 'admin-programs-overview', route: '/app/admin/programs' },
]

assert.equal(
  resolveNextCompanyWalkthroughTask(tasks, ['review_dashboard'], 'admin-dashboard-overview')?.id,
  'fund_session_wallet',
  'Finishing the dashboard tour should hand off to the wallet tour.',
)

assert.equal(
  resolveNextCompanyWalkthroughTask(
    tasks,
    ['review_dashboard', 'fund_session_wallet'],
    'admin-wallet-overview',
  )?.id,
  'invite_mentees',
  'Finishing the wallet tour should hand off to the first cross-route pending task.',
)

assert.equal(
  resolveNextCompanyWalkthroughTask(
    tasks,
    ['review_dashboard', 'fund_session_wallet', 'invite_mentees', 'create_program'],
    'admin-programs-overview',
  ),
  null,
  'A completed checklist should not restart a tour.',
)

const walkthroughSource = readFileSync(walkthroughUrl, 'utf8')

assert.match(
  walkthroughSource,
  /resolveNextCompanyWalkthroughTask/,
  'Walkthrough component should use the progression helper after a tour completes.',
)

assert.match(
  walkthroughSource,
  /router\.push\(nextTask\.route\)/,
  'Walkthrough component should route to the next pending task when it lives on another page.',
)

console.log('Company admin walkthrough progression verified.')
