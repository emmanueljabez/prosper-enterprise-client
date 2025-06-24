import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },  
  runtimeConfig: {
    public: {
      // mapboxToken: process.env.NUXT_PUBLIC_MAPBOX_TOKEN
      nodeEnv: process.env.NODE_ENV,
    }
  },
  ssr: false,
  css: [
    '@/assets/css/global.css',
  ],
  modules: [
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt',
    '@vee-validate/nuxt'
  ],
  shadcn: {
    prefix: '',
    componentDir: './components/ui'
  },
  plugins: [
    // '~/plugins/pinia.ts',
    // '~/plugins/sidebar.ts'
  ],
  app: {
    head: {
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: ''
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap'
        },
        { 
          rel: 'icon',
          type: 'image/x-icon',
          href: '/images/favicon-32x32.png'
        }
      ]
    }
  },
})