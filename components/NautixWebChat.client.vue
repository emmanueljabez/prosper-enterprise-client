<template>
  <span aria-hidden="true" class="hidden" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const DEFAULT_NAUTIX_SITE_KEY = 'nw_live_2cca861c95684970bf28d01f'
const NAUTIX_LOADER_ID = 'nautix-webchat-loader'
const NAUTIX_LOADER_SRC = 'https://api.nautix.io/widget/v1/loader.js'

declare global {
  interface Window {
    NautixWidget?: {
      siteKey: string
      position: 'left' | 'right'
      accentColor: string
      visitor?: Record<string, unknown> | null
    }
  }
}

onMounted(() => {
  const config = useRuntimeConfig()
  const siteKey = String(config.public.nautixWebchatSiteKey || DEFAULT_NAUTIX_SITE_KEY).trim()

  if (!siteKey || siteKey.toLowerCase() === 'disabled') return

  window.NautixWidget = {
    siteKey,
    position: 'right',
    accentColor: '#0f766e',
  }

  if (document.getElementById(NAUTIX_LOADER_ID)) return

  const script = document.createElement('script')
  script.id = NAUTIX_LOADER_ID
  script.async = true
  script.src = NAUTIX_LOADER_SRC
  document.body.appendChild(script)
})
</script>
