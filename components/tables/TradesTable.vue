<template>
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
        <template #item.candle_time="{item}">
          {{ short_date_time(convertTimeToSeconds(item.candle_time)) }}
        </template>
        <template #item.profitLoss="{item}">
          {{ item.profit_loss? '$' + item.profit_loss.toFixed(2): '' }}
        </template>
        <template #item.fees="{item}">
          {{ item.fees? '$' + item.fees.toFixed(2): '' }}
        </template>
        <template #item.side="{item: {side}}">
          <div style="border-left: 2px solid; padding-left: 5px" :style="{ color: side === 'buy'? 'green': 'red', borderColor: side === 'buy'? 'green': 'red'}">
            {{ side.charAt(0).toUpperCase() + side.slice(1) }}
          </div>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script>
import time from '~/mixins/time'

export default {
  name: 'TradesTable',
  mixins: [time],
  props: {
    trades: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      headers: [
        { text: 'Side', value: 'side' },
        { text: 'Market', value: 'currency' },
        { text: 'Time', value: 'candle_time' },
        { text: 'Size', value: 'quantity' },
        { text: 'Requested Price', value: 'requested_price' },
        { text: 'Price', value: 'price' },
        { text: 'Fees', value: 'fees' },
        { text: 'Reason', value: 'reason' },
        { text: 'P&L', value: 'profitLoss' }
      ]
    }
  },
  computed: {
    totalPNL () {
      return this.trades.reduce((accumulator, currentValue) => accumulator + currentValue.profit_loss, 0).toFixed(2)
    }
  },
  methods: {
    convertTimeToSeconds (time) {
      if (time < 9999999999) {
        time = time * 1000
      }

      return time
    }
  }
}
</script>

<style scoped>

</style>
