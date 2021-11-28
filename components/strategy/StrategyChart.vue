<template>
  <v-row>
    <v-col>
      <v-card ref="card">
        <v-card-text v-resize="onResize" cols="12">
          <trading-chart
            :ticks="candles"
            :trades="trades"
            :width="cardWidth"
            :indicators="indicators"
            :coin="coin"
            index-based
          />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import TradingChart from '~/components/charts/TradingChart'
export default {
  name: 'StrategyChart',
  components: { TradingChart },
  props: {
    strategyId: {
      type: [Number, String],
      required: true
    },
    coin: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      loading: false,
      candles: [],
      trades: [],
      indicators: {},
      cardWidth: 500
    }
  },

  watch: {
    strategyId: {
      async handler (val, oldVal) {
        await this.loadCandles(val, oldVal)
        await this.loadIndicators(val, oldVal)
        await this.loadTrades(val, oldVal)
      },
      immediate: true
    }
  },
  beforeDestroy () {
    this.sockets.unsubscribe(`bot-socket:${this.strategyId}|trade`)
    this.sockets.unsubscribe(`bot-socket:${this.strategyId}|trade-indicator`)
    this.sockets.unsubscribe(`bot-socket:${this.strategyId}|trade-candle`)
  },
  methods: {
    async loadCandles (val, oldVal) {
      this.candles = []
      this.loading = true
      const { data: { candles, message, errors }, status } = await this.$axios.get(`/trade-candles/strategy/${val}`).catch(e => e)
      this.loading = false
      if (this.$error(status, message, errors)) {
        return
      }
      this.candles = candles

      this.sockets.subscribe(`bot-socket:${val}|trade-candle`, (candle) => {
        this.candles.push(candle)
      })

      if (oldVal) {
        this.sockets.unsubscribe(`bot-socket:${oldVal}|trade-candle`)
      }
    },
    async loadIndicators (val, oldVal) {
      this.indicators = {}
      const { data: { indicators, message, errors }, status } = await this.$axios.get(`/trade-indicators/strategy/${val}`).catch(e => e)
      this.loading = false
      if (this.$error(status, message, errors)) {
        return
      }
      const indicatorObject = {}
      indicators.forEach((indicator) => {
        if (!indicatorObject[indicator.name]) {
          indicatorObject[indicator.name] = []
        }
        indicatorObject[indicator.name].push(indicator)
      })

      for (const key in indicatorObject) {
        if (!this.indicators[key]) {
          this.$set(this.indicators, key, [])
        }
        this.$set(this.indicators, key, this.indicators[key].concat(indicatorObject[key]))
      }

      this.sockets.subscribe(`bot-socket:${val}|trade-indicator`, (indicator) => {
        this.indicators[indicator.name].push(indicator)
      })

      if (oldVal) {
        this.sockets.unsubscribe(`bot-socket:${oldVal}|trade-indicator`)
      }
    },
    async loadTrades (val, oldVal) {
      this.trades = []
      this.loading = true
      const { data: { trades, message, errors }, status } = await this.$axios.get(`/trades/strategy/${val}`).catch(e => e)
      this.loading = false
      if (this.$error(status, message, errors)) {
        return
      }
      this.trades = trades
      this.sockets.subscribe(`bot-socket:${val}|trade`, (trade) => {
        this.trades.unshift(trade)
      })
      if (oldVal) {
        this.sockets.unsubscribe(`bot-socket:${oldVal}|trade`)
      }
    },
    onResize () {
      this.cardWidth = this.$refs.card.$el.offsetWidth - 32
    }
  }
}
</script>

<style scoped>

</style>
