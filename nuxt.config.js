import colors from 'vuetify/es5/util/colors'
export default {
  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    titleTemplate: '%s - Coin Base Trader',
    title: 'Coin Base Trader',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ],
    script: [
      { hid: 'test', src: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js' }
    ]
  },
  env: {
    SOCKET_URL: process.env.SOCKET_URL
  },
  publicRuntimeConfig: {
    axios: {
      browserBaseURL: process.env.BASE_URL
    }
  },
  privateRuntimeConfig: {
    axios: {
      baseURL: process.env.BASE_URL
    }
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: [
  ],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [
    '@/plugins/axios',
    '@/plugins/error-handler.client',
    '@/plugins/error-handler.server',
    '@/plugins/noty.client',
    '@/plugins/loading',
    '@/plugins/globalMixins',
    '@/plugins/currency',
    '@/plugins/confirm.client',
    '@/plugins/d3fc.client',
    '@/plugins/d3.client',
    '@/plugins/highchart.client',
    '@/plugins/trading-vue.client',
    '@/plugins/dev-error'
  ],

  components: false,

  buildModules: [
    '@nuxtjs/eslint-module',
    '@nuxtjs/vuetify'
  ],

  ssr: false,

  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/auth-next'
  ],

  router: {
    middleware: ['auth', 'disconnectSockets']
  },

  auth: {
    redirect: {
      login: '/',
      logout: '/',
      home: false
    },
    watchLoggedIn: true,
    strategies: {
      local: {
        token: {
          maxAge: 60 * 60 * 24 * 7
        },
        endpoints: {
          login: { url: process.env.BASE_URL + '/users/login', method: 'POST', propertyName: 'token', credentials: true },
          logout: { url: process.env.BASE_URL + '/users/logout', method: 'POST' },
          user: { url: process.env.BASE_URL + '/users/logged-in-user', method: 'GET', propertyName: 'user' }
        }
      }
    },
    plugins: [
      '@/plugins/adonis-socket',
      '@/plugins/auth'
    ]
  },

  // Axios module configuration (https://go.nuxtjs.dev/config-axios)
  axios: {},

  // Vuetify module configuration (https://go.nuxtjs.dev/config-vuetify)
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    treeShake: true,
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    }
  },

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {
    hotMiddleware: {
      client: {
        // turn off client overlay when errors are present
        overlay: false
      }
    },
    extend (config) {
      config.devtool = 'eval-source-map'
    }
  }
}
