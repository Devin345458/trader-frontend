<template>
  <div style="width: 100%; position: relative">
    <div class="chart-title">
      <div>{{ coin }}</div>
      <div v-if="selectedPrice" class="chart-tick-title">
        <span class="chart-price-label">O:</span> {{ selectedPrice.open }} <span class="chart-price-label">H:</span> {{ selectedPrice.high }} <span class="chart-price-label">L:</span> {{ selectedPrice.low }} <span class="chart-price-label">C:</span> {{ selectedPrice.close }} <span class="chart-price-label">V:</span> {{ selectedPrice.volume }}
      </div>
    </div>

    <div class="char-indicators-title">
      <div v-for="(value, indicator) in selectedIndicatorsPrice" :key="indicator">
        {{ indicator }}: <span :style="{color: indicators[indicator][0].color}">{{ value.toFixed(5) }}</span>
      </div>
    </div>
    <div ref="chart" v-resize="handleResize" class="chart-wrapper" style="width: 100%" />
  </div>
</template>

<script>
import { createChart } from 'lightweight-charts'
import moment from 'moment'
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
    },
    coin: {
      type: String,
      default: undefined
    }
  },
  data () {
    return {
      chart: undefined,
      candles: undefined,
      chartIndicators: {},
      selectedPrice: undefined,
      lastPrice: undefined,
      indicatorsLastPrice: {},
      selectedIndicatorsPrice: {},
      volumes: undefined
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
      lineColor: 'rgba(32, 226, 47, 1)',
      name: 'candles'
    })
    this.volumes = this.chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume'
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.8,
        bottom: 0
      }
    })
    this.setCandles()
    this.setTrades()
    this.setIndicators()
    this.chart.subscribeCrosshairMove((param) => {
      if (param === undefined || param.time === undefined || param.point.x < 0 || param.point.x > this.$refs.chart.clientWidth || param.point.y < 0 || param.point.y > this.$refs.chart.clientHeight) {
        this.selectedPrice = this.lastPrice
        Object.keys(this.indicators).forEach((key) => {
          this.selectedIndicatorsPrice[key] = this.indicatorsLastPrice[key]
        })
      } else {
        this.selectedPrice = param.seriesPrices.get(this.candles)
        Object.keys(this.indicators).forEach((key) => {
          this.selectedIndicatorsPrice[key] = param.seriesPrices.get(this.chartIndicators[key])
        })
      }
    })
  },
  methods: {
    handleResize () {
      if (this.chart) {
        this.chart.applyOptions({ width: this.$refs.chart.clientWidth })
      }
    },
    setCandles () {
      this.candles.setData(this.ticks.map((candle) => {
        candle = { ...candle }
        candle.time = ((candle.time / 1000) - (new Date().getTimezoneOffset() * 60))
        return candle
      }))
      this.volumes.setData(this.ticks.map((candle) => {
        candle = { ...candle }
        candle.time = ((candle.time / 1000) - (new Date().getTimezoneOffset() * 60))
        return { time: candle.time, value: candle.volume }
      }))
      if (this.ticks.length) {
        this.lastPrice = this.ticks[this.ticks.length - 1]
        if (!this.selectedPrice) {
          this.selectedPrice = this.lastPrice
        }
      }
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
          indicator = { ...indicator }
          indicator.time = ((indicator.time / 1000) - (new Date().getTimezoneOffset() * 60))
          return indicator
        }))
        this.chartIndicators[key].applyOptions({ color: this.indicators[key][0].color })
        this.indicatorsLastPrice[key] = this.indicators[key][this.indicators[key].length - 1].value
        if (!this.selectedIndicatorsPrice[key]) {
          this.selectedIndicatorsPrice[key] = this.indicatorsLastPrice[key]
        }
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
        trade = { ...trade }
        const time = moment(trade.created_at).format('x')
        return {
          time: ((time / 1000) - (new Date().getTimezoneOffset() * 60)) - 60,
          position: trade.side.includes('buy') ? 'aboveBar' : 'belowBar',
          color,
          shape: 'circle',
          size: '2px'
        }
      }).sort((a, b) => a.time - b.time))
    },
    updateTicks (candle) {
      candle.time = ((candle.time / 1000) - (new Date().getTimezoneOffset() * 60))
      this.candles.update(candle)
      this.volumes.update({ time: candle.time, value: candle.volume })
      this.lastPrice = candle
      if (!this.selectedPrice) {
        this.selectedPrice = candle
      }
    },
    updateIndicator (indicator, data) {
      if (!this.chartIndicators[indicator]) {
        this.chartIndicators[indicator] = this.chart.addLineSeries()
      }
      data.time = ((data.time / 1000) - (new Date().getTimezoneOffset() * 60))
      this.chartIndicators[indicator].update(data)
      this.indicatorsLastPrice[indicator] = data.value
    }
  }
}
</script>

<style scoped>
  .chart-title {
    top: 10px;
    left: 10px;
    font-size: 24px;
    color: #42B883;
    position: absolute;
    z-index: 2;
    display: flex;
  }

  .chart-tick-title {
    font-size: 16px;
    color: #999999;
    margin-left: 10px;
  }

  .char-indicators-title {
    top: 40px;
    left: 10px;
    position: absolute;
    z-index: 2;
    font-size: 14px;
    color: #DEDDDD;
  }

  .chart-price-label {
    color: #42B883;
  }
</style>
