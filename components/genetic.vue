<template>
  <v-dialog ref="dialog" v-model="value" persistent width="80%">
    <template v-slot:activator="{on, attrs}">
      <slot name="activator" v-bind="{on, attrs}" />
    </template>
    <v-card ref="card" :loading="loading">
      <v-card-title>
        Genetic Training Settings
        <v-spacer />
        <p v-if="profitPercentage !== false" class="mr-2 mb-0">
          Profit Percentage: {{ profitPercentage.toFixed(2) }}%
        </p>
        <p v-if="bestPNL" class="mr-2 mb-0">
          Best PNL: ${{ formatPrice(bestPNL) }}
        </p>
        <v-icon @click="close">
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
          <template v-slot:item.profit_loss="{item}">
            {{ formatPrice(item.profit_loss) }}
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions>
        <v-btn v-if="internalGeneticRun" color="error" @click="close">
          Close
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
    strategy: {
      type: Object,
      required: false,
      default: () => {}
    },
    geneticRun: {
      type: Object,
      required: false,
      default: () => {}
    }
  },
  data () {
    return {
      value: false,
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
      running: false,
      internalGeneticRun: false
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
    }
  },
  created () {
    if (this.geneticRun) {
      this.internalGeneticRun = this.geneticRun
    }
  },
  methods: {
    async runGeneticEvolution () {
      if (!this.$refs.genetic.validate()) { return }
      this.loading = true
      this.running = true
      const { data: { geneticRun, message, errors }, status } = await this.$axios.post('/v1/genetic-runs/start', {
        initialBalance: this.initial_balance,
        numberOfDays: this.number_of_days,
        iterations: this.iterations,
        populationSize: this.populationSize,
        strategy: this.strategy
      }).catch(e => e)
      if (this.$error(status, message, errors)) { return }
      geneticRun.genetic_run_iterations = []
      this.internalGeneticRun = geneticRun
      this.setUpListeners()
    },
    close () {
      this.value = false
      this.clear()
    },
    clear () {
      if (!this.geneticRun) {
        this.internalGeneticRun = false
        this.loading = false
        if (this.$ws.socket.getSubscription(`genetic-run:${this.geneticId}`)) {
          this.$ws.socket.getSubscription(`genetic-run:${this.geneticId}`).close()
        }
      }
    },
    formatPrice (value) {
      const val = (value / 1).toFixed(2)
      return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    setUpListeners () {
      this.$ws.$on('error', () => {
        this.value = false
      })

      this.$ws.$on('close', () => {
        if (this.running) {
          this.clear()
        }
      })

      this.$ws.$on(`genetic-run:${this.internalGeneticRun.id}|iteration`, (iteration) => {
        this.internalGeneticRun.genetic_run_iterations.unshift(iteration)
        if (this.internalGeneticRun.genetic_run_iterations.length === this.internalGeneticRun.iterations) {
          this.loading = false
        }
      })

      this.$ws.subscribe(`genetic-run:${this.internalGeneticRun.id}`)
    },
    async setBestOptions () {
      this.setBestOptionsLoading = true
      const { data: { message, errors }, status } = await this.$axios.post('/v1/strategies/set-options/' + this.internalGeneticRun.strategy_id, this.internalGeneticRun.genetic_run_iterations[0].options).catch(e => e)
      this.setBestOptionsLoading = false
      this.$error(status, message, errors)
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
