<template>
  <v-row>
    <v-col cols="12">
      <v-card>
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
            <template #item.created_at="{item}">
              {{ short_date_time(item.created_at) }}
            </template>
            <template #item.profitLoss="{item}">
              {{ item.profit_loss? '$' + item.profit_loss.toFixed(2): '' }}
            </template>
            <template #item.side="{item: {side}}">
              <div style="border-left: 2px solid; padding-left: 5px" :style="{ color: side === 'buy'? 'green': 'red', borderColor: side === 'buy'? 'green': 'red'}">
                {{ side.charAt(0).toUpperCase() + side.slice(1) }}
              </div>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import time from '~/mixins/time'
export default {
  name: 'StrategyTrades',
  mixins: [time],
  props: {
    strategyId: {
      type: [Number, String],
      required: true
    }
  },
  data () {
    return {
      loading: false,
      trades: [],
      headers: [
        { text: 'Side', value: 'side' },
        { text: 'Market', value: 'currency' },
        { text: 'Time', value: 'created_at' },
        { text: 'Size', value: 'quantity' },
        { text: 'Price', value: 'price' },
        { text: 'P&L', value: 'profitLoss' }
      ]
    }
  },
  computed: {
    totalPNL () {
      return this.trades.reduce((accumulator, currentValue) => accumulator + currentValue.profit_loss, 0).toFixed(2)
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
