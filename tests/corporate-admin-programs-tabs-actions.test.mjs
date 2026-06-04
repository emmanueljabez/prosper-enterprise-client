import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../pages/app/admin/programs/index.vue', import.meta.url), 'utf8')

assert.match(source, /Tabs,\s*TabsContent/, 'Admin programs should import tab primitives.')
assert.match(source, /DropdownMenu,\s*DropdownMenuContent,\s*DropdownMenuItem,\s*DropdownMenuSeparator,\s*DropdownMenuTrigger/, 'Admin programs should import dropdown menu primitives.')
assert.match(source, /<Tabs\s+v-model="activeProgramTab"/, 'Admin programs should render tabbed program sections.')
assert.match(source, /class="program-view-toggle"/, 'Admin programs should use the employee-style segmented tab control.')
assert.match(source, /Our programs[\s\S]*companyProgramsStore\.pagination\.totalItems/, 'Admin programs should rename the company-created tab to Our programs and show its count.')
assert.doesNotMatch(source, /Company Created Programs/, 'Admin programs should not use the old Company Created Programs label.')
assert.match(source, /Prosper Mentor Programs[\s\S]*companyProgramsStore\.catalogPrograms\.length/, 'Admin programs should show a Prosper Mentor Programs tab with its count.')
assert.match(source, /<TabsContent\s+value="company"/, 'Company-created programs should render inside a company tab panel.')
assert.match(source, /<TabsContent\s+value="prosper"/, 'Prosper mentor programs should render inside a Prosper tab panel.')
assert.match(source, /v-for="program in filteredCatalogPrograms"/, 'Prosper mentor programs tab should render catalog programs.')
assert.match(source, /<TabsContent\s+value="prosper"[\s\S]*v-for="program in filteredCatalogPrograms"[\s\S]*class="program-card"/, 'Prosper mentor programs should use the same card design as company programs.')
assert.doesNotMatch(source, /<Table[\s\S]*filteredCatalogPrograms/, 'Prosper mentor programs should not render as a table.')
assert.match(source, /<DropdownMenu>[\s\S]*Open Details[\s\S]*navigateTo\(`\/app\/admin\/programs\/\$\{program\.id\}\?tab=employees`\)[\s\S]*openEditDialog\(program\)[\s\S]*openJourneyDialog\(program\.id,\s*program\.journeyTemplateId\)[\s\S]*runStatusAction\(program\.id,\s*'cancel'\)[\s\S]*<\/DropdownMenu>/, 'Company-created program card actions should be grouped into one dropdown menu.')
assert.doesNotMatch(source, /<div class="flex justify-end gap-2">[\s\S]*Employees[\s\S]*Edit[\s\S]*Journey[\s\S]*Launch[\s\S]*Cancel[\s\S]*<\/div>/, 'Company-created program actions should not be spread across inline buttons.')

console.log('Corporate admin program tabs and actions verified.')
