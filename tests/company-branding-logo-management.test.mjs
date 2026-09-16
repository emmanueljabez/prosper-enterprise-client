import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const companyApiSource = readFileSync(
  new URL('../http/requests/app/company.ts', import.meta.url),
  'utf8',
)
const settingsPageSource = readFileSync(
  new URL('../pages/app/admin/settings/index.vue', import.meta.url),
  'utf8',
)

assert.match(
  companyApiSource,
  /uploadCompanyLogo\(companyId:\s*string,\s*file:\s*File\)/,
  'Company API should expose a typed company logo upload method.',
)
assert.match(
  companyApiSource,
  /new FormData\(\)/,
  'Company logo upload should send multipart form data.',
)
assert.match(
  companyApiSource,
  /formData\.append\('file',\s*file\)/,
  'Company logo upload should append the selected file under the file field.',
)
assert.match(
  companyApiSource,
  /\/v1\/companies\/\$\{companyId\}\/branding\/logo/,
  'Company logo upload/delete should use the company branding logo endpoint.',
)
assert.match(
  companyApiSource,
  /deleteCompanyLogo\(companyId:\s*string\)/,
  'Company API should expose a typed company logo delete method.',
)

assert.match(
  settingsPageSource,
  /logoFileInput\s*=\s*ref<HTMLInputElement\s*\|\s*null>\(null\)/,
  'Branding page should keep a file input ref for triggering logo uploads.',
)
assert.match(
  settingsPageSource,
  /accept="image\/png,image\/jpeg,image\/webp,image\/gif,image\/svg\+xml"/,
  'Logo upload input should restrict selection to image file types.',
)
assert.match(
  settingsPageSource,
  /@change="handleLogoFileChange"/,
  'Branding page should upload a logo when a file is selected.',
)
assert.match(
  settingsPageSource,
  /companyApi\.uploadCompanyLogo\(companyContext\.value\.companyId,\s*file\)/,
  'Branding page should persist uploaded logos through the company API.',
)
assert.match(
  settingsPageSource,
  /companyApi\.deleteCompanyLogo\(companyContext\.value\.companyId\)/,
  'Branding page should delete logos through the company API.',
)
assert.match(settingsPageSource, />\s*Upload Logo\s*</, 'Branding page should expose an Upload Logo action.')
assert.match(settingsPageSource, />\s*Replace Logo\s*</, 'Branding page should expose a Replace Logo action.')
assert.match(settingsPageSource, />\s*Delete Logo\s*</, 'Branding page should expose a Delete Logo action.')
assert.match(settingsPageSource, /Logo upload failed/, 'Branding page should render upload errors near the logo control.')

console.log('Company branding logo management verified.')
