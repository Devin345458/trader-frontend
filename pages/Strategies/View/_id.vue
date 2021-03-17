<template>
  <v-container>
    <v-card-title>{{ strategy.name }} - {{ strategy.coin }}</v-card-title>
    <v-row>
      <v-col md="12">
        <v-card ref="card">
          <trading-chart
            v-if="strategy.coin"
            :width="cardWidth"
            :ticks="uniqueTicks"
            :trades="trades"
            :coin="strategy.coin"
            :indicators="indicators"
          />
        </v-card>
      </v-col>
      <v-col cols="12">
        <v-card :loading="tradesLoading">
          <v-card-title>
            Trades
            <v-spacer />
            Total PNL: ${{ totalPNL }}
          </v-card-title>
          <v-card-text>
            <v-data-table
              :items="trades"
              :headers="headers"
            >
              <template v-slot:item.profitLoss="{item}">
                {{ item.profitLoss? '$' + item.profitLoss.toFixed(2): '' }}
              </template>
              <template v-slot:item.side="{item: {side}}">
                <div style="border-left: 2px solid; padding-left: 5px" :style="{ color: side === 'buy'? 'green': 'red', borderColor: side === 'buy'? 'green': 'red'}">
                  {{ side.charAt(0).toUpperCase() + side.slice(1) }}
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12">
        <v-card :loading="logLoading">
          <v-card-title>
            Log
            <v-spacer />
            <v-switch v-model="autoScroll" label="Auto Scroll" />
          </v-card-title>
          <v-card-text ref="logTerminal" class="black" style="overflow: scroll; max-height: 300px">
            <p v-for="log in logs" :key="log.id" class="white--text">
              [{{ log.createdAt }}] {{ log.text }}
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import uniqBy from 'lodash.uniqby'
import TradingChart from '~/components/charts/TradingChart'
export default {
  name: 'Index',
  components: { TradingChart },
  data () {
    return {
      headers: [
        { text: 'Side', value: 'side' },
        { text: 'Market', value: 'currency' },
        { text: 'Size', value: 'quantity' },
        { text: 'P&L', value: 'profitLoss' }
      ],
      strategy: {
      },
      trades: [],
      ticks: [],
      loading: true,
      logs: [],
      autoScroll: true,
      tradesLoading: false,
      logLoading: false,
      cardWidth: 0,
      indicators: {}
    }
  },
  computed: {
    totalPNL () {
      return this.trades.reduce((accumulator, currentValue) => accumulator + currentValue.profitLoss, 0).toFixed(2)
    },
    uniqueTicks () {
      return uniqBy(this.ticks, 'time')
    }
  },
  mounted () {
    this.setupSocketListeners()
    this.getStrategy()
    this.getTrades()
    this.getTradeTicks()
    this.getIndicators()
    this.onResize()
  },
  beforeDestroy () {
    if (this.$ws.socket.getSubscription(`bot-socket:${this.$route.params.id}`)) {
      this.$ws.socket.getSubscription(`bot-socket:${this.$route.params.id}`).close()
      this.socket = null
    }
  },
  methods: {
    async getStrategy () {
      this.loading = true
      const { data: { strategy, message, errors }, status } = await this.$axios.get(`/v1/strategies/${this.$route.params.id}`).catch(e => e)
      this.loading = false
      if (this.$error(status, message, errors)) { return }
      this.strategy = strategy
    },
    async getTrades () {
      this.tradesLoading = true
      const { data: { trades, message, errors }, status } = await this.$axios.get(`/v1/trades/strategy/${this.$route.params.id}`).catch(e => e)
      this.tradesLoading = false
      if (this.$error(status, message, errors)) { return }
      this.trades = trades
    },
    async getTradeTicks () {
      this.loading = true
      const { data: { tradeTicks, message, errors }, status } = await this.$axios.get(`/v1/trades/get-ticks/${this.$route.params.id}`).catch(e => e)
      this.loading = false
      if (this.$error(status, message, errors)) { return }
      this.ticks = tradeTicks
    },
    onResize () {
      this.cardWidth = this.$refs.card.$el.offsetWidth
    },
    async getIndicators () {
      this.loading = true
      const { data: { indicators, message, errors }, status } = await this.$axios.get(`/v1/trades/get-indicators/${this.$route.params.id}`).catch(e => e)
      this.loading = false
      if (this.$error(status, message, errors)) { return }
      this.indicators = indicators
    },
    setupSocketListeners () {
      this.$ws.$on('error', (err) => {
        this.$noty.error(err.message || 'Unknown Error')
        this.$router.push('/strategies')
      })
      this.$ws.$on(`bot-socket:${this.$route.params.id}|trade-ticker`, (tradeTick) => {
        this.ticks.push(tradeTick)
      })
      this.$ws.$on(`bot-socket:${this.$route.params.id}|trade-indicator`, (tradeIndicator) => {
        this.indicators[tradeIndicator.name] = { time: tradeIndicator.time, indicator: tradeIndicator.indicator }
      })
      this.$ws.$on(`bot-socket:${this.$route.params.id}|trade`, (trade) => {
        this.trades.push(trade)
      })
      this.$ws.subscribe(`bot-socket:${this.$route.params.id}`)
    }
  }
}
</script>

<style scoped>

</style>
