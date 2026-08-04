import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const appSource = readFileSync(resolve(root, 'app.vue'), 'utf8')
const nuxtConfig = readFileSync(resolve(root, 'nuxt.config.ts'), 'utf8')
const componentSource = readFileSync(resolve(root, 'components/NautixWebChat.client.vue'), 'utf8')

assert(
  componentSource.includes("DEFAULT_NAUTIX_SITE_KEY = 'nw_live_2cca861c95684970bf28d01f'"),
  'Nautix webchat should default to the configured Prosper Mentor site key',
)

assert(
  componentSource.includes('public.nautixWebchatSiteKey'),
  'Nautix webchat should allow overriding the site key through Nuxt runtime config',
)

assert(
  componentSource.includes("https://api.nautix.io/widget/v1/loader.js"),
  'Nautix webchat should load the official Nautix widget loader',
)

assert(
  componentSource.includes("document.getElementById(NAUTIX_LOADER_ID)"),
  'Nautix webchat should guard against duplicate loader injection',
)

assert(
  appSource.includes('<NautixWebChat />'),
  'App should mount the Nautix webchat widget once',
)

assert(
  nuxtConfig.includes('nautixWebchatSiteKey') &&
    nuxtConfig.includes('NUXT_PUBLIC_NAUTIX_WEBCHAT_SITE_KEY'),
  'Nuxt config should expose a public Nautix site key override',
)

console.log('Nautix webchat regression checks passed')
