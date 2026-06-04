import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const dashboardSource = readFileSync(
  new URL('../pages/app/dashboard/index.vue', import.meta.url),
  'utf8',
)

assert.match(
  dashboardSource,
  /useCompanyProgramsStore/,
  'Employee dashboard should keep using employee company-program data.',
)

assert.match(
  dashboardSource,
  /useReviewsStore/,
  'Employee dashboard should keep using employee review data.',
)

assert.match(
  dashboardSource,
  /KpiSummaryCard/,
  'Employee dashboard should reuse the corporate dashboard KPI card design.',
)

for (const className of [
  'employee-dashboard',
  'dashboard-filter-shell',
  'dashboard-card',
  'dashboard-section-title',
  'dashboard-section-description',
  'dashboard-stat-chip',
]) {
  assert.match(
    dashboardSource,
    new RegExp(`class="[^"]*${className}|\\.${className}`),
    `Employee dashboard should reuse the corporate dashboard ${className} design pattern.`,
  )
}

assert.match(
  dashboardSource,
  /employeeDashboardKpis/,
  'Employee dashboard should adapt the corporate KPI layout without changing the underlying mentee metrics.',
)

assert.match(
  dashboardSource,
  /journeyProgressPercent|reviewStatusCards|programStatusCards/,
  'Employee dashboard should present existing mentee journey, review, and program data in corporate-style summary blocks.',
)

console.log('Employee dashboard design verified.')
