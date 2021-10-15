<template>
  <v-dialog ref="dialog" v-model="dialog" width="80%">
    <template #activator="{on, attrs}">
      <slot name="activator" v-bind="{on, attrs}" />
    </template>
    <v-card ref="card" :loading="isRunning || loading">
      <v-card-title>
        Genetic Training Settings
        <v-spacer />
        <p v-if="profitPercentage !== false" class="mr-2 mb-0">
          Profit Percentage: {{ profitPercentage.toFixed(2) }}%
        </p>
        <p v-if="bestPNL" class="mr-2 mb-0">
          Best PNL: ${{ formatPrice(bestPNL) }}
        </p>
        <v-icon @click="dialog = false">
          mdi-close
        </v-icon>
      </v-card-title>
      <v-card-text v-if="!internalGeneticRun">
        <v-form ref="genetic">
          <v-text-field v-model="number_of_days" type="number" label="Number of days to run sim" />
          <v-currency-field v-model="initial_balance" prefix="$" label="Initial Balance" />
          <v-text-field v-model.number="iterations" type="number" label="Number of iterations" />
          <v-text-field v-model.number="populationSize" type="number" label="Population Size" />
        </v-form>
      </v-card-text>
      <v-card-text v-else>
        <v-data-table
          :items="internalGeneticRun.genetic_run_iterations"
          :headers="headers"
        >
          <template #item.profit_loss="{item}">
            {{ formatPrice(item.profit_loss) }}
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions>
        <v-btn v-if="internalGeneticRun" color="error" :loading="canceling" @click="cancel">
          Cancel
        </v-btn>
        <v-spacer />
        <v-btn v-if="!internalGeneticRun" color="primary" :loading="loading" @click="runGeneticEvolution">
          Run Genetic Evolution
        </v-btn>
        <v-btn
          v-if="internalGeneticRun.genetic_run_iterations && internalGeneticRun.genetic_run_iterations.length"
          color="primary"
          :loading="setBestOptionsLoading"
          @click="setBestOptions"
        >
          Set Options From Best Run
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'Genetic',
  props: {
    value: {
      type: Object,
      required: true
    },
    geneticRun: {
      type: Object,
      required: false,
      default: () => {}
    }
  },
  data () {
    return {
      dialog: false,
      loading: false,
      setBestOptionsLoading: false,

      initial_balance: 10000,
      number_of_days: 1,
      iterations: 10,
      populationSize: 10,

      headers: [
        { text: 'Iteration', value: 'iteration' },
        { text: 'Best Value', value: 'profit_loss' }
      ],
      internalGeneticRun: false,
      canceling: false
    }
  },
  computed: {
    profitPercentage () {
      if (!this.internalGeneticRun.genetic_run_iterations || !this.internalGeneticRun.genetic_run_iterations.length) { return false }
      const change = this.internalGeneticRun.genetic_run_iterations[0].profit_loss
      return ((change + this.initial_balance) / this.initial_balance - 1) * 100
    },
    bestPNL () {
      return this.internalGeneticRun.perfect
    },
    strategy: {
      get () {
        return this.value
      },
      set (val) {
        this.$emit('input', val)
      }
    },
    isRunning () {
      return this.internalGeneticRun.status === 'running'
    }
  },
  watch: {
    dialog (val) {
      if (!val) {
        if (!this.geneticRun) {
          this.sockets.unsubscribe(`genetic-run:${this.internalGeneticRun.id}`)
          this.internalGeneticRun = false
          this.canceling = false
        }
      }
    }
  },
  created () {
    if (this.geneticRun) {
      this.internalGeneticRun = this.geneticRun
      this.setUpListeners()
    }
  },
  methods: {
    async runGeneticEvolution () {
      if (!this.$refs.genetic.validate()) { return }
      this.loading = true
      const { data: { geneticRun, message, errors }, status } = await this.$axios.post('/genetic-runs/start', {
        initialBalance: this.initial_balance,
        numberOfDays: this.number_of_days,
        iterations: this.iterations,
        populationSize: this.populationSize,
        strategy: this.strategy
      }).catch(e => e)
      this.loading = false
      if (this.$error(status, message, errors)) { return }
      geneticRun.genetic_run_iterations = []
      this.internalGeneticRun = geneticRun
      this.setUpListeners()
      this.$emit('newRun', this.internalGeneticRun)
    },
    async cancel () {
      this.canceling = true
      const { data: { message, errors }, status } = await this.$axios.delete('/genetic-runs/cancel/' + this.internalGeneticRun.id, {}).catch(e => e)
      if (this.$error(status, message, errors)) { return }
      this.cancling = false
      this.dialog = false
    },
    formatPrice (value) {
      const val = (value / 1).toFixed(2)
      return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    setUpListeners () {
      this.sockets.subscribe(`genetic-run:${this.internalGeneticRun.id}`, ({ data, type }) => {
        switch (type) {
          case 'iteration':
            this.internalGeneticRun.genetic_run_iterations.unshift(data)
            if (this.internalGeneticRun.genetic_run_iterations.length === this.internalGeneticRun.iterations) {
              this.loading = false
            }
            break
          case 'status':
            this.internalGeneticRun.status = data
            break
          default:
            this.$noty.error('unknown genetic event')
        }
      })
    },
    async setBestOptions () {
      this.setBestOptionsLoading = true
      const { data: { strategy, message, errors }, status } = await this.$axios.post('/strategies/set-options/' + this.internalGeneticRun.strategy_id, this.internalGeneticRun.genetic_run_iterations[0].options).catch(e => e)
      this.setBestOptionsLoading = false
      if (this.$error(status, message, errors)) { return }
      this.$emit('update:strategy', strategy)
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
