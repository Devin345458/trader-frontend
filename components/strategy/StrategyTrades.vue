<template>
  <v-row>
    <v-col cols="12">
      <trades-table :trades="trades" />
    </v-col>
  </v-row>
</template>

<script>
import TradesTable from '~/components/tables/TradesTable'
export default {
  name: 'StrategyTrades',
  components: { TradesTable },
  props: {
    strategyId: {
      type: [Number, String],
      required: true
    }
  },
  data () {
    return {
      loading: false,
      trades: []
    }
  },

  watch: {
    strategyId: {
      async handler (val, oldVal) {
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
      immediate: true
    }
  },
  beforeDestroy () {
    this.sockets.unsubscribe(`bot-socket:${this.strategyId}|trade`)
  }
}
</script>

<style scoped>

</style>
