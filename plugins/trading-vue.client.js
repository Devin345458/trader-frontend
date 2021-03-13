import Vue from 'vue'
import { DataCube, TradingVue } from 'trading-vue-js'

Vue.use(TradingVue)
export default (context, inject) => {
  inject('DataCube', DataCube)
  context.$DataCube = DataCube
}
