<template>
  <v-dialog v-model="internal_value" persistent max-width="500" :fullscreen="!!candles.length">
    <v-card ref="card" :loading="loading">
      <v-card-title>
        Simulation Settings
        <v-spacer />
        <template v-if="trades.length">
          P&L ${{ formatPrice(totalPNL) }}
        </template>
        <v-icon @click="internal_value = false">
          mdi-close
        </v-icon>
      </v-card-title>
      <v-card-text v-if="!candles.length">
        <v-form ref="simulation">
          <v-text-field v-model="number_of_days" type="number" :rules="rules.requiredNumber" label="Number of days to run sim" />
          <v-currency-field v-model="initial_balance" :rules="rules.requiredNumber" prefix="$" label="Initial Balance" />
        </v-form>
      </v-card-text>
      <v-card-text v-else v-resize="onResize">
        <trading-chart
          :ticks="candles"
          :trades="trades"
          :indicators="indicators"
          :width="cardWidth"
          :coin="strategy.coin"
        />
        <v-data-table
          :items="sorted_trades"
          :headers="headers"
        >
          <template #item.time="{item}">
            {{ time(item.time) }}
          </template>
          <template #item.size="{item}">
            {{ Number(item.quantity).toFixed(2) }}
          </template>
          <template #item.profitLoss="{item}">
            {{ item.profitLoss? '$' + item.profitLoss.toFixed(2): '' }}
          </template>
          <template #item.side="{item: {side}}">
            <div style="border-left: 2px solid; padding-left: 5px" :style="{ color: side === 'buy'? 'green': 'red', borderColor: side === 'buy'? 'green': 'red'}">
              {{ side.charAt(0).toUpperCase() + side.slice(1) }}
            </div>
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions>
        <v-btn v-if="!!candles.length" color="error" @click="internal_value = false">
          Close
        </v-btn>
        <v-spacer />
        <v-btn v-if="!candles.length || loading" color="primary" :loading="loading" @click="runSim">
          Run Sim
        </v-btn>
        <v-btn v-else color="primary" @click="clear">
          Edit
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import moment from 'moment'
import TradingChart from '~/components/charts/TradingChart'
import validations from '~/mixins/validations'
export default {
  name: 'Simulation',
  components: { TradingChart },
  mixins: [validations],
  props: {
    value: {
      type: Boolean,
      required: true
    },
    strategy: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      loading: false,
      initial_balance: 10000,
      number_of_days: 30,
      results: false,
      trades: [],
      candles: [],
      indicators: {},
      headers: [
        { text: 'Side', value: 'side' },
        { text: 'Market', value: 'product_id' },
        { text: 'Time', value: 'time' },
        { text: 'Size', value: 'size' },
        { text: 'Price', value: 'price' },
        { text: 'P&L', value: 'profitLoss' }
      ],
      chart: null,
      cardWidth: 500,
      socket: null,
      best: false
    }
  },
  computed: {
    internal_value: {
      get () {
        return this.value
      },
      set (val) {
        this.$emit('input', val)
      }
    },
    totalPNL () {
      if (!this.trades.length) { return 0 }
      return this.trades.filter(a => a.profitLoss).map(a => a.profitLoss).reduce((a, b) => a + b, 0).toFixed(2)
    },
    sorted_trades () {
      const data = [...this.trades]
      return data.sort((a, b) => a.time - b.time)
    }
  },
  watch: {
    internal_value (val) {
      if (!val) {
        this.clear()
      }
    }
  },
  beforeDestroy () {
    this.clear()
  },
  methods: {
    onResize () {
      this.cardWidth = this.$refs.card.$el.offsetWidth
    },
    async runSim () {
      if (!this.$refs.simulation.validate()) { return }
      this.loading = true
      this.sockets.subscribe('strategy:simulation-' + this.strategy.id, this.handleMessage)
      const { data: { message, errors }, status } = await this.$axios.post('/genetic-runs/simulate', {
        initialBalance: this.initial_balance,
        numberOfDays: this.number_of_days,
        strategy: this.strategy
      }).catch(e => e)
      this.$error(status, message, errors)
    },
    time (val) {
      return moment(val).format('MMMM Do YYYY, h:mm:ss a')
    },
    clear () {
      this.trades = []
      this.candles = []
      this.indicators = {}
      this.loading = false
      this.sockets.unsubscribe('strategy:simulation-' + this.strategy.id)
    },
    formatPrice (value) {
      const val = (value / 1).toFixed(2)
      return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    handleMessage ({ type, data }) {
      const indicators = {}
      switch (type) {
        case 'candles':
          this.candles = this.candles.concat(data)
          break
        case 'order':
          this.trades = this.trades.concat(data)
          break
        case 'error':
          this.$noty.error(data.message)
          this.internal_value = false
          break
        case 'indicator':
          data.forEach((indicator) => {
            if (!indicators[indicator.name]) {
              indicators[indicator.name] = []
            }
            indicators[indicator.name].push({ time: indicator.time, indicator: indicator.indicator })
          })

          for (const key in indicators) {
            if (!this.indicators[key]) {
              this.indicators[key] = []
            }
            this.indicators[key] = this.indicators[key].concat(indicators[key])
          }
          break
        case 'finished':
          this.loading = false
          break
        default:
          this.$noty.error('unknown webhook ' + type, data)
      }
    }
  }
}
</script>

<style lang="scss">
#sim-chart {
  path {
    &.area {
      fill: url(#area-gradient);
      fill-opacity: 1;
    }

    &.line {
      stroke: rgb(26, 154, 249);
      stroke-width: 1.5px;
    }
  }

  .bottom-axis {
    height: 20px !important;
  }

  .y-axis, .x-axis {
    .tick path {
      stroke: #bbb;
    }

    .tick text {
      fill: white;
    }

    .domain {
      display: none;
    }
  }

  .y-axis {
    width: 50px;
    border-left: 1px solid #bbb;
  }

  .volume {
    opacity: 0.2;
  }

  .border {
    border: 1px solid #bbb;
    grid-column: 3 / 5;
    grid-row: 3;
  }
}

</style>
