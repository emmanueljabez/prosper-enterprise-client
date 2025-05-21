import { defineNuxtPlugin } from '#app'
import { createPinia } from 'pinia'

export default defineNuxtPlugin(nuxtApp => {

  if (!nuxtApp.vueApp._context.provides.$pinia) {
    const pinia = createPinia()
    nuxtApp.vueApp.use(pinia)
  }
})