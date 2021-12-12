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
        {{ indicator }}: <span :style="{color: indicators[indicator][0].settings.color}">{{ value ? value.toFixed(5) : undefined }}</span>
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
      volumes: undefined,
      markers: []
    }
  },
  watch: {
    ticks: 'setCandles',
    indicators: 'setIndicators',
    trades: 'setTrades',
    markers () {
      const markers = []
      this.markers.forEach(marker => markers.push(marker.marker))
      markers.forEach((m) => {
        m.time = this.convertTimeToSeconds(m.time)
      })
      this.candles.setMarkers(markers.sort((a, b) => a.time - b.time))
    }
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
      localization: {
        timeFormatter: (time) => {
          return moment.utc((time - new Date().getTimezoneOffset() * 60) * 1000).format('DD MMM hh:mm a')
        }
      },
      timeScale: {
        timeVisible: true,
        tickMarkFormatter: (time) => {
          return moment.utc((time - new Date().getTimezoneOffset() * 60) * 1000).format('hh:mm a')
        }
      },
      watermark: {
        color: 'rgba(0, 0, 0, 0)'
      },
      crosshair: {
        color: '#758696',
        mode: 1
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
    this.chart.timeScale().fitContent()
  },
  methods: {
    handleResize () {
      if (this.chart) {
        this.chart.applyOptions({ width: this.$refs.chart.clientWidth })
      }
    },
    setCandles () {
      const candles = this.cleanData(this.ticks)
      this.candles.setData(candles)
      if (this.ticks.length) {
        this.lastPrice = this.ticks[this.ticks.length - 1]
        if (!this.selectedPrice) {
          this.selectedPrice = this.lastPrice
        }
      } else {
        this.lastPrice = {}
        this.selectedPrice = {}
      }
    },
    setIndicators () {
      // Clean data
      for (const key in this.chartIndicators) {
        this.chartIndicators[key].setData([])
        delete this.selectedIndicatorsPrice[key]
        delete this.indicatorsLastPrice[key]
      }
      Object.keys(this.indicators).forEach((key) => {
        if (!this.indicators[key].length) {
          return
        }
        if (this.indicators[key][0].settings?.type === 'marker') {
          this.markers = this.markers.filter(marker => marker.type !== key)
          this.markers = this.markers.concat(this.indicators[key].map((indicator) => {
            return {
              marker: Object.assign(indicator.settings, { time: this.convertTimeToSeconds(indicator.time) }),
              type: key
            }
          }))
          return
        }
        if (!this.chartIndicators[key]) {
          this.chartIndicators[key] = this.chart.addLineSeries(Object.assign(this.indicators[key][0].settings, {
            lastValueVisible: false,
            priceLineVisible: false
          }))
        }
        this.chartIndicators[key].setData(this.cleanData(this.indicators[key]))
        this.chartIndicators[key].applyOptions({ color: this.indicators[key][0].color })
        this.indicatorsLastPrice[key] = this.indicators[key][this.indicators[key].length - 1].value
        if (!this.selectedIndicatorsPrice[key]) {
          this.selectedIndicatorsPrice[key] = this.indicatorsLastPrice[key]
        }
      })
    },
    setTrades () {
      this.markers = this.markers.filter((marker) => {
        return marker.type !== 'trade'
      })
      this.markers = this.markers.concat(this.trades.map((trade) => {
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
        return {
          marker: {
            time: this.convertTimeToSeconds(trade.candle_time),
            position: trade.side.includes('buy') ? 'aboveBar' : 'belowBar',
            color,
            shape: 'circle',
            size: '2px'
          },
          type: 'trade'
        }
      }))
    },
    updateTicks (candle) {
      candle = { ...candle }
      candle.time = this.convertTimeToSeconds(candle.time)
      // console.log(candle.time, this.cleanData(this.ticks).slice(-1)[0])
      this.candles.update(candle)
      this.lastPrice = candle
      if (!this.selectedPrice) {
        this.selectedPrice = candle
      }
    },
    updateIndicator (indicator, data) {
      data.time = this.convertTimeToSeconds(data.time)
      if (data.settings.type === 'marker') {
        this.markers.push({
          marker: Object.assign(data.settings, { time: data.time }),
          type: indicator
        })
      } else {
        if (!this.chartIndicators[indicator]) {
          this.chartIndicators[indicator] = this.chart.addLineSeries(Object.assign(data.settings, { lastValueVisible: false, priceLineVisible: false }))
          this.chartIndicators[indicator].applyOptions({ color: data.color })
        }
        this.chartIndicators[indicator].update(data)
        this.indicatorsLastPrice[indicator] = data.value
      }
    },
    convertTimeToSeconds (time) {
      if (time > 9999999999) {
        time = time / 1000
      }

      return time
    },
    cleanData (arr) {
      if (arr.length < 2) {
        return []
      }
      const interval = arr.slice(-1)[0].time - arr.slice(-2)[0].time
      arr = [...new Set(arr)]
      arr.forEach((candle, index) => {
        if (index === 0) {
          return
        }
        const diff = candle.time - arr[index - 1].time
        if (diff > interval) {
          let sum = 0
          let count = 0
          while (sum < diff - interval) {
            arr.splice(index + count, 0, {
              time: arr[index + count - 1].time + interval
            })
            sum += interval
            count++
          }
        }
      })
      arr.forEach((i) => {
        i.time = this.convertTimeToSeconds(i.time)
      })
      return arr.sort((a, b) => a.time - b.time)
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
