import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const packageJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
)
const nuxtConfigSource = readFileSync(
  new URL('../nuxt.config.ts', import.meta.url),
  'utf8',
)

assert.ok(
  packageJson.dependencies?.['v-onboarding'],
  'Company admin walkthrough should install v-onboarding as a runtime dependency.',
)

assert.match(
  nuxtConfigSource,
  /'v-onboarding\/nuxt'/,
  'Nuxt should load the v-onboarding module so components, composables, and styles are available client-side.',
)

assert.match(
  nuxtConfigSource,
  /modules:\s*\[[\s\S]*'v-onboarding\/nuxt'[\s\S]*\]/,
  'v-onboarding/nuxt should be registered in defineNuxtConfig modules.',
)

console.log('Company admin walkthrough dependency verified.')
