import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const checklistUrl = new URL('../components/app/admin/onboarding/CompanyAdminChecklist.vue', import.meta.url)
const walkthroughUrl = new URL('../components/app/admin/onboarding/CompanyAdminWalkthrough.client.vue', import.meta.url)
const domUtilityUrl = new URL('../utils/company-walkthrough-dom.ts', import.meta.url)

assert.equal(existsSync(domUtilityUrl), true, 'Walkthrough DOM cleanup should live in a focused utility.')

const utilitySource = readFileSync(domUtilityUrl, 'utf8')
const transpiled = ts.transpileModule(utilitySource, {
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
  'Walkthrough DOM utility should transpile without TypeScript errors.',
)

const module = { exports: {} }
vm.runInNewContext(transpiled.outputText, { exports: module.exports, module })

const { releaseCompanyWalkthroughInteractionLock } = module.exports
const fakeDocument = { body: { style: { pointerEvents: 'none' } } }
releaseCompanyWalkthroughInteractionLock(fakeDocument)
assert.equal(
  fakeDocument.body.style.pointerEvents,
  '',
  'Finishing the final walkthrough should release the body pointer-events lock.',
)

const checklistSource = readFileSync(checklistUrl, 'utf8')
assert.match(
  checklistSource,
  /shouldShowChecklist/,
  'Checklist should expose a visibility guard for completed dismissed walkthroughs.',
)
assert.match(
  checklistSource,
  /<Card[^>]+v-if="shouldShowChecklist"/,
  'Completed dismissed walkthrough checklists should not remain visible on the dashboard.',
)

const walkthroughSource = readFileSync(walkthroughUrl, 'utf8')
assert.match(
  walkthroughSource,
  /releaseCompanyWalkthroughInteractionLock/,
  'Walkthrough should release the v-onboarding interaction lock after the final tour exits.',
)
assert.match(
  walkthroughSource,
  /const startedNextTask = await startNextPendingTask\(tourId\)/,
  'Walkthrough should distinguish final completion from handoff to another task.',
)

console.log('Company admin walkthrough completion behavior verified.')
