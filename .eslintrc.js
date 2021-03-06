module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended'
  ],
  ignorePatterns: ['tradingview.js'],
  plugins: [
  ],
  // add your custom rules here
  rules: {
    'vue/valid-v-slot': ['error', {
      allowModifiers: true
    }]
  }
}
