<template>
  <highcharts class="stock" :constructor-type="'stockChart'" :options="stockOptions" />
</template>

<script>
import { currency } from '~/utils/utils'
export default {
  name: 'HighChart',
  props: {
    ticks: {
      type: Array,
      default: () => []
    },
    trades: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    chartTicks () {
      const data = [...this.ticks]
      return data.sort((a, b) => a.time - b.time).map((d) => {
        return [d.time * 1000, d.close]
      })
    },
    chartVolume () {
      const data = [...this.ticks]
      return data.sort((a, b) => a.time - b.time).map((d) => {
        return [d.time * 1000, d.volume]
      })
    },
    chartTrades () {
      const data = [...this.trades]
      return data.sort((a, b) => a.time - b.time).map((d) => {
        return { y: Number(d.price), color: d.side === 'buy' ? 'red' : 'blue', x: d.time * 1000 }
      })
    },
    stockOptions () {
      return {
        plotOptions: {
          series: {
            color: '#42b883'
          },
          area: {
            fillColor: {
              linearGradient: {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 1
              },
              stops: [
                [0, 'rgba(76, 211, 150, 0.1)'],
                [1, 'rgba(53, 183, 125, 0)'],
                [2, 'rgba(119,52,169,0)']
              ]
            }
          }
        },
        time: {
          useUTC: false
        },
        yAxis: [
          {
            gridLineColor: 'transparent',
            min: 30000,
            labels: {
              style: {
                color: 'white'
              },
              formatter () {
                return currency(this.value)
              }
            },
            height: '80%',
            resize: {
              enabled: true
            }
          },
          {
            top: '80%',
            height: '20%',
            offset: 0
          }
        ],
        xAxis: {
          type: 'datetime',
          labels: {
            style: {
              color: 'white'
            }
          }
        },
        chart: {
          backgroundColor: 'rgb(39, 41, 61)',
          zoomType: 'x',
          panKey: 'shift'
        },
        tooltip: {
          valueDecimals: 2,
          valuePrefix: '$',
          valueSuffix: ' USD'
        },
        navigator: {
          enabled: false
        },
        rangeSelector: {
          buttons: [{
            count: 5,
            type: 'minute',
            text: '5M'
          }, {
            count: 1,
            type: 'hour',
            text: '1H'
          }, {
            count: 24,
            type: 'hour',
            text: '1D'
          }, {
            type: 'all',
            text: 'All'
          }],
          inputEnabled: false,
          selected: 0
        },
        exporting: {
          enabled: false
        },
        series: [
          {
            type: 'area',
            name: 'Price',
            data: this.chartTicks
          },
          {
            type: 'column',
            name: 'Volume',
            data: this.chartVolume,
            yAxis: 1
          },
          {
            type: 'line',
            name: 'Trades',
            data: this.chartTrades,
            yAxis: 0,
            lineWidth: 0,
            marker: {
              symbol: 'circle',
              enabled: true,
              radius: 10
            }
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
