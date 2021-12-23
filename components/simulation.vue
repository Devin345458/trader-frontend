<template>
  <v-dialog v-model="internal_value" persistent max-width="500" :fullscreen="!!candles.length">
    <v-card ref="card" :loading="loading">
      <v-card-title>
        Simulation Settings
        <v-spacer />
        <template v-if="holdProfits">
          Hold Profits ${{ formatPrice(holdProfits) }}
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
      <v-card-text v-else>
        <light-weight-chart
          ref="chart"
          skip-validation
          :ticks="candles"
          :trades="trades"
          :coin="strategy.coin"
          :indicators="indicators"
        />
        <trades-table
          :trades="trades"
        />
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
import validations from '~/mixins/validations'
import TradesTable from '~/components/tables/TradesTable'
import LightWeightChart from '~/components/charts/LightWeightChart'
export default {
  name: 'Simulation',
  components: { LightWeightChart, TradesTable },
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
      chart: null,
      cardWidth: 500,
      holdProfits: 0,
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
      return this.trades.map(a => a.profit_loss).reduce((a, b) => a + b, 0).toFixed(2)
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
      this.holdProfits = 0
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
        case 'indicators':
          data.forEach((indicator) => {
            if (!indicators[indicator.name]) {
              indicators[indicator.name] = []
            }
            indicators[indicator.name].push(indicator)
          })

          for (const key in indicators) {
            if (!this.indicators[key]) {
              this.$set(this.indicators, key, [])
            }
            this.$set(this.indicators, key, this.indicators[key].concat(indicators[key]))
          }
          break
        case 'holdProfits':
          this.holdProfits = data
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
