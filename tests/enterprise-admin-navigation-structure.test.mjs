import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const read = relativePath => readFileSync(join(repoRoot, relativePath), 'utf8')
const exists = relativePath => existsSync(join(repoRoot, relativePath))

const navigationSource = read('navigation/vertical/corporate-admin.ts')
const roleManagerSource = read('utils/roleManager.ts')

const expectedGroups = [
  ['Dashboard', [['Overview', '/app/admin']]],
  ['People', [['Mentees', '/app/admin/employees'], ['Mentors', '/app/admin/mentors']]],
  ['People Management', [['Cohorts & Circles', '/app/admin/cohorts'], ['Alumni', '/app/admin/alumni']]],
  ['Program Management', [['Programs', '/app/admin/programs'], ['Topics', '/app/admin/topics'], ['Program Content', '/app/admin/content']]],
  ['Session Management', [['Plenary Sessions', '/app/admin/sessions/plenary'], ['Group Sessions', '/app/admin/sessions/group'], ['One-to-One Sessions', '/app/admin/sessions/one-to-one']]],
  ['Mentors & Matching', [['One-to-One Matching', '/app/admin/matches'], ['Bulk Matching', '/app/admin/matches/bulk']]],
  ['Finance', [['Billing', '/app/admin/billing'], ['Session Wallet', '/app/admin/billing/wallet']]],
  ['Reports', [['Tracking', '/app/admin/reports']]],
  ['Resources', [['Journey Templates', '/app/admin/journey-templates']]],
  ['Administration', [['Settings', '/app/admin/settings']]],
]

const routeToPage = route => {
  const cleanRoute = route.split(/[?#]/)[0]
  const adminPath = cleanRoute.replace(/^\/app\/admin\/?/, '')
  if (!adminPath) return 'pages/app/admin/index.vue'

  const directPage = `pages/app/admin/${adminPath}.vue`
  const indexPage = `pages/app/admin/${adminPath}/index.vue`
  return exists(directPage) ? directPage : indexPage
}

let lastGroupPosition = -1
for (const [groupTitle, items] of expectedGroups) {
  const groupPosition = navigationSource.indexOf(`title: '${groupTitle}'`)
  assert.notEqual(groupPosition, -1, `Corporate admin navigation should include the ${groupTitle} group.`)
  assert.ok(groupPosition > lastGroupPosition, `${groupTitle} should appear after the previous navigation group.`)
  lastGroupPosition = groupPosition

  for (const [itemTitle, route] of items) {
    const escapedItemTitle = itemTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const escapedRoute = route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const itemPattern = new RegExp(`title:\\s*'${escapedItemTitle}'[\\s\\S]*?url:\\s*'${escapedRoute}'`)
    assert.match(
      navigationSource,
      itemPattern,
      `${itemTitle} should link to ${route}.`,
    )

    const pagePath = routeToPage(route)
    assert.ok(
      exists(pagePath),
      `${itemTitle} should not be a broken sidebar link; expected page file ${pagePath}.`,
    )

    if (route !== '/app/admin') {
      const parentRoute = route.replace(/\/[^/]+$/, '/*').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const rolePattern = new RegExp(`('${escapedRoute}'\\s*:\\s*\\[)|('${parentRoute}'\\s*:\\s*\\[)`)
      assert.match(roleManagerSource, rolePattern, `${route} should be covered by roleManager route permissions.`)
    }
  }
}

assert.doesNotMatch(navigationSource, /title:\s*'Core'/, 'Corporate admin navigation should no longer use the generic Core group.')

console.log('Enterprise admin navigation structure verified.')
