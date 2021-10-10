<template>
  <trading-vue
    v-if="trading"
    ref="tradingVue"
    toolbar
    :overlays="overlays"
    :data="trading"
    :width="width"
    :title-txt="coin"
    :chart-config="chartConfig"
  />
</template>

<script>
import Overlays from 'tvjs-overlays'
export default {
  name: 'TradingChart',
  props: {
    coin: {
      type: String,
      required: true
    },
    ticks: {
      type: Array,
      default: () => []
    },
    trades: {
      type: Array,
      default: () => []
    },
    indicators: {
      type: Object,
      default: () => {}
    },
    width: {
      type: Number,
      default: 800
    },
    indexBased: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      trading: false,
      overlays: [Overlays.VWMA, Overlays.EMA],
      chartConfig: {
        MAX_ZOOM: 5000,
        MIN_ZOOM: 0
      }
    }
  },

  computed: {
    chartTicks () {
      const data = [...this.ticks]
      return data.sort((a, b) => a.time - b.time).map((d) => {
        return [d.openTimeInMillis, d.close, d.high, d.low, d.close, Number(d.volume.toFixed(2))]
      })
    },
    chartVolume () {
      const data = [...this.ticks]
      return data.sort((a, b) => b.time - a.time).map((d) => {
        return [d.openTimeInMillis, Number(d.volume.toFixed(2))]
      })
    },
    chartTrades () {
      const data = [...this.trades]
      return data.sort((a, b) => a.time - b.time).map((d) => {
        return [d.time, d.side === 'buy' ? 1 : 0, Number(d.price)]
      })
    }
  },
  watch: {
    chartTicks: {
      handler () {
        this.updateChart()
      },
      immediate: true
    },
    indicators: {
      handler () {
        this.updateChart()
      },
      deep: true
    },
    trades: {
      handler () {
        this.updateChart()
      },
      immediate: true
    }
  },
  errorCaptured () {
    return false // stops the error from propagating further
  },
  methods: {
    tradeLabel (trade) {
      switch (trade.side) {
        case 'buy':
          return `Purchased ${Number(trade.quantity).toFixed(2)} shares at $${trade.price}`
        case 'sell':
          return `Sold ${Number(trade.quantity).toFixed(2)} shares at $${trade.price}`
      }
    },
    updateChart () {
      const data = {
        chart: {
          type: 'Spline',
          indexBased: this.indexBased,
          data: this.chartTicks
        },
        onchart: [
          {
            name: 'Trades',
            type: 'Trades',
            data: this.chartTrades,
            settings: {
              color: '#f9ff14',
              legend: false,
              'z-index': 5
            }
          }
        ],
        offchart: [
        ]
      }
      if (this.indicators) {
        Object.keys(this.indicators).forEach((key) => {
          const tmp = this.indicators[key].filter(a => a.indicator).sort((a, b) => a.time - b.time)
          data.onchart.push({
            name: key,
            type: 'Spline',
            data: tmp.map(a => [a.time * 1000, a.indicator]),
            settings: {
              skipNaN: true
            }
          })
        })
      }
      this.trading = new this.$DataCube(data)
    }
  }
}
</script>

<style scoped>

</style>
