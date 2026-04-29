// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/sanity',
    '@nuxtjs/sitemap',
    '@nuxt/image'
  ],

  css: [
    '~/assets/css/marketing-base.css'
  ],

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Train321 — Online Food Safety Training',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Online food handler, food manager, and alcohol seller-server training. ANAB-accredited, state-approved.' },
        { name: 'theme-color', content: '#0b3d91' },
        { property: 'og:site_name', content: 'Train321' },
        { property: 'og:type', content: 'website' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/img/logos/train321_logo.png' },
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css' }
      ]
    }
  },

  sanity: {
    projectId: process.env.SANITY_PROJECT_ID || 'your-project-id',
    dataset: process.env.SANITY_DATASET || 'production',
    apiVersion: '2025-01-01',
    useCdn: true,
    visualEditing: {
      studioUrl: process.env.SANITY_STUDIO_URL || 'http://localhost:3333',
      token: process.env.SANITY_WRITE_TOKEN,
      mode: 'live-visual-editing',
      previewMode: { enable: '/api/draft' }
    }
  },

  site: {
    url: process.env.SITE_URL || 'https://train321.com',
    name: 'Train321'
  },

  sitemap: {
    autoLastmod: true
  },

  image: {
    domains: ['cdn.sanity.io']
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/'],
      // Legacy nav links (/food-handler, /privacy-policy, etc.) still need
      // 301 redirects added; until then, don't fail the SSG build on them.
      failOnError: false
    }
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE || 'https://api.train321.com',
      appBase: process.env.APP_BASE || 'https://app.train321.com'
    }
  },

  // @sanity/visual-editing pulls in React 19 RC's compiler runtime, which Vite
  // can't optimize correctly without a hint. Pre-bundle it as a single entry.
  vite: {
    optimizeDeps: {
      include: [
        '@sanity/visual-editing',
        '@sanity/visual-editing > react-compiler-runtime',
        '@sanity/ui > react-compiler-runtime',
        '@sanity/insert-menu > react-compiler-runtime'
      ]
    }
  }
})
