<template>
  <div ref="chart" v-resize="handleResize" class="chart-wrapper" style="width: 100%" />
</template>

<script>
import { createChart } from 'lightweight-charts'
export default {
  name: 'LightWeightChart',
  props: {
    ticks: {
      type: Array,
      default: () => []
    },
    indicators: {
      type: Object,
      default: () => {}
    },
    trades: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      chart: undefined,
      candles: undefined,
      chartIndicators: {}
    }
  },
  watch: {
    ticks: 'setCandles',
    indicators: 'setIndicators',
    trades: 'setTrades'
  },
  mounted () {
    /** @var this.chart IChartApi **/
    this.chart = createChart(this.$refs.chart, {
      width: this.$refs.chart.clientWidth,
      height: 400,
      layout: {
        backgroundColor: '#121826',
        lineColor: '#303240',
        textColor: '#D9D9D9'
      },
      timeScale: {
        timeVisible: true
      },
      watermark: {
        color: 'rgba(0, 0, 0, 0)'
      },
      crosshair: {
        color: '#758696'
      },
      grid: {
        vertLines: {
          color: '#2B2B43'
        },
        horzLines: {
          color: '#363C4E'
        }
      }
    })
    this.candles = this.chart.addCandlestickSeries({
      topColor: 'rgba(32, 226, 47, 0.56)',
      bottomColor: 'rgba(32, 226, 47, 0.04)',
      lineColor: 'rgba(32, 226, 47, 1)'
    })
    this.setCandles()
    this.setTrades()
    this.setIndicators()
  },
  methods: {
    handleResize () {
      if (this.chart) {
        this.chart.applyOptions({ width: this.$refs.chart.clientWidth })
      }
    },
    setCandles () {
      this.candles.setData(this.ticks.map((candle) => {
        candle.time = candle.time / 1000
        return candle
      }))
    },
    setIndicators () {
      Object.keys(this.indicators).forEach((key) => {
        if (!this.chartIndicators[key]) {
          this.chartIndicators[key] = this.chart.addLineSeries({
            lastValueVisible: false,
            priceLineVisible: false
          })
        }
        this.chartIndicators[key].setData(this.indicators[key].map((indicator) => {
          indicator.time = indicator.time / 1000
          return indicator
        }))
        this.chartIndicators[key].applyOptions({ color: this.indicators[key][0].color })
      })
    },
    setTrades () {
      this.candles.setMarkers(this.trades.map((trade) => {
        let color
        switch (trade.side) {
          case 'buy':
            color = 'green'
            break
          case 'sell':
            color = 'red'
            break
          case 'buy short':
            color = 'purple'
            break
          case 'sell short':
            color = 'orange'
            break
        }
        return {
          time: new Date(trade.created_at).getTime() / 1000,
          position: trade.side.includes('buy') ? 'aboveBar' : 'belowBar',
          color,
          shape: 'circle',
          size: 10
        }
      }).sort((a, b) => a.time - b.time))
    },
    updateTicks (candle) {
      candle.time = candle.time / 1000
      this.candles.update(candle)
    },
    updateIndicator (indicator, data) {
      if (!this.chartIndicators[indicator]) {
        this.chartIndicators[indicator] = this.chart.addLineSeries()
      }
      data.time = data.time / 1000
      this.chartIndicators[indicator].update(data)
    }
  }
}
</script>

<style scoped>

</style>
