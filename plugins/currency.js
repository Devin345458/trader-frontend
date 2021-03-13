import Vue from 'vue'
import currency from 'v-currency-field'
import { VTextField } from 'vuetify/lib'

Vue.component('v-text-field', VTextField)
Vue.use(currency, {
  decimal: '.',
  thousands: ',',
  prefix: '$',
  precision: 2,
  allowBlank: true,
  min: Number.MIN_SAFE_INTEGER,
  max: Number.MAX_SAFE_INTEGER
})
