import Vue from 'vue'
import HighchartsVue from 'highcharts-vue'
import Highcharts from 'highcharts'
import stockInit from 'highcharts/modules/stock'

stockInit(Highcharts)

Highcharts.setOptions({
  lang: {
    thousandsSep: ','
  }
})

Vue.use(HighchartsVue)
