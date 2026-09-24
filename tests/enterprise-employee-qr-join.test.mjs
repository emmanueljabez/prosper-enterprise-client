import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const companyApiSource = readFileSync(new URL('../http/requests/app/company.ts', import.meta.url), 'utf8')
const companyStoreSource = readFileSync(new URL('../store/modules/company.ts', import.meta.url), 'utf8')
const signupSource = readFileSync(new URL('../pages/auth/signup.vue', import.meta.url), 'utf8')
const confirmEmailSource = readFileSync(new URL('../pages/auth/confirm-email.vue', import.meta.url), 'utf8')
const employeesSource = readFileSync(new URL('../pages/app/admin/employees.vue', import.meta.url), 'utf8')
const mentorsSource = readFileSync(new URL('../pages/app/admin/mentors.vue', import.meta.url), 'utf8')
const settingsSource = readFileSync(new URL('../pages/app/admin/settings/index.vue', import.meta.url), 'utf8')
const joinQrTabUrl = new URL('../components/app/admin/settings/CompanyJoinQrSettingsTab.vue', import.meta.url)
const joinQrTabSource = existsSync(joinQrTabUrl) ? readFileSync(joinQrTabUrl, 'utf8') : ''
const qrPdfSource = readFileSync(new URL('../utils/companyJoinQrPdf.ts', import.meta.url), 'utf8')
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

assert.match(companyApiSource, /getCompanyJoinLink/, 'Company API should expose getCompanyJoinLink.')
assert.match(companyApiSource, /\/join-link/, 'Company API should call the company join-link endpoint.')
assert.match(companyApiSource, /regenerateCompanyJoinLink/, 'Company API should expose regenerateCompanyJoinLink.')
assert.match(companyApiSource, /\/join-link\/regenerate/, 'Company API should call the regenerate join-link endpoint.')

assert.match(companyStoreSource, /companyJoinLink/, 'Company store should keep the current company join link.')
assert.match(companyStoreSource, /loadCompanyJoinLink/, 'Company store should load the current company join link.')
assert.match(companyStoreSource, /regenerateCompanyJoinLink/, 'Company store should regenerate the company join link.')

assert.match(signupSource, /companyJoinToken/, 'Signup should read and carry companyJoinToken.')
assert.match(signupSource, /isCompanyJoinSignup/, 'Signup should treat company join links as mentee signup.')
assert.match(signupSource, /companyJoinToken:\s*companyJoinToken\.value/, 'Signup should submit companyJoinToken to backend signup.')
assert.match(signupSource, /companyJoinToken:\s*companyJoinToken\.value/, 'Signup should preserve companyJoinToken in email verification route query.')

assert.match(confirmEmailSource, /companyJoinToken/, 'Confirm email page should read companyJoinToken.')
assert.match(confirmEmailSource, /companyJoinToken:\s*companyJoinToken\.value/, 'Confirm email should send companyJoinToken to backend confirmation.')

assert.ok(packageJson.dependencies?.qrcode, 'QR code generation should use qrcode.')
assert.ok(packageJson.dependencies?.jspdf, 'PDF download should use jspdf.')

assert.match(settingsSource, /type SettingsTab = .*'join'/, 'Settings tabs should include a company Join QR tab.')
assert.match(settingsSource, /case 'join':/, 'Settings route query should resolve the Join QR tab.')
assert.match(settingsSource, /Join QR/, 'Settings should expose the shared Join QR tab.')
assert.match(settingsSource, /CompanyJoinQrSettingsTab/, 'Settings should render the Join QR tab component.')

assert.ok(existsSync(joinQrTabUrl), 'Settings Join QR component should exist.')
assert.match(joinQrTabSource, /buildCompanyJoinQrDataUrl/, 'Settings Join QR tab should render the company QR code.')
assert.match(joinQrTabSource, /downloadCompanyJoinQrPdf/, 'Settings Join QR tab should download the shared QR PDF.')
assert.match(joinQrTabSource, /loadCompanyJoinLink/, 'Settings Join QR tab should load the company join link.')
assert.match(joinQrTabSource, /regenerateCompanyJoinLink/, 'Settings Join QR tab should regenerate the company join link.')
assert.match(joinQrTabSource, /mentors and mentees/, 'Settings Join QR tab should describe the shared mentor and mentee QR.')
assert.match(joinQrTabSource, /The same QR code supports mentor and mentee signup/, 'Settings Join QR tab should explain role selection happens on signup.')
assert.match(joinQrTabSource, /Download PDF/, 'Settings Join QR tab should expose Download PDF.')
assert.match(joinQrTabSource, /bg-\[#8f1f74\]/, 'Settings Download PDF button should use the requested brand color.')

assert.doesNotMatch(employeesSource, /Generate QR Code/, 'Employees page should not expose the role-neutral QR action.')
assert.doesNotMatch(employeesSource, /downloadCompanyJoinQrPdf/, 'Employees page should not own the shared QR PDF flow.')
assert.doesNotMatch(employeesSource, /buildCompanyJoinQrDataUrl/, 'Employees page should not render the shared QR code.')
assert.doesNotMatch(employeesSource, />\s*Buy Sessions\s*</, 'Employees page should remove the Buy Sessions action button.')
assert.match(employeesSource, /Actions/, 'Employees page should use an Actions dropdown.')
assert.match(employeesSource, /Invite Employee/, 'Actions dropdown should include Invite Employee.')
assert.match(employeesSource, /Import Employees/, 'Actions dropdown should include Import Employees.')
assert.match(employeesSource, /Export CSV/, 'Actions dropdown should include Export CSV.')
assert.match(employeesSource, /Refresh/, 'Actions dropdown should include Refresh.')
assert.match(qrPdfSource, /COMPANY_JOIN_QR_BRAND_COLOR\s*=\s*'#8f1f74'/, 'QR/PDF helper should use the requested brand color.')
assert.match(qrPdfSource, /COMPANY_JOIN_QR_BRAND_RGB\s*=\s*\[143,\s*31,\s*116\]/, 'PDF helper should use the requested RGB brand color.')
assert.doesNotMatch(qrPdfSource, /#027F63|setFillColor\(2,\s*127,\s*99\)/, 'QR/PDF helper should not use the old green.')
assert.doesNotMatch(employeesSource, /bg-\[#027F63\]/, 'Download PDF button should not use the old green.')

assert.doesNotMatch(mentorsSource, /buildCompanyJoinQrDataUrl/, 'Mentors page should not render the shared company QR code.')
assert.doesNotMatch(mentorsSource, /downloadCompanyJoinQrPdf/, 'Mentors page should not download the shared QR PDF.')
assert.doesNotMatch(mentorsSource, /Generate QR Code/, 'Mentors page Actions dropdown should not include the role-neutral QR action.')
assert.match(mentorsSource, /Invite mentor/, 'Mentors page Actions dropdown should include Invite mentor.')
assert.match(mentorsSource, /Import mentors/, 'Mentors page Actions dropdown should include Import mentors.')

console.log('Enterprise company Join QR settings flow verified.')
