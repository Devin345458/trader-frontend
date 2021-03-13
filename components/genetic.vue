<template>
  <v-dialog v-model="internal_value" persistent width="80%">
    <v-card ref="card" :loading="loading">
      <v-card-title>
        Genetic Training Settings
        <v-spacer />
        <v-icon @click="internal_value = false">
          mdi-close
        </v-icon>
      </v-card-title>
      <v-card-text v-if="!results.length">
        <v-form ref="genetic">
          <v-text-field v-model="number_of_days" type="number" label="Number of days to run sim" />
          <v-currency-field v-model="initial_balance" prefix="$" label="Initial Balance" />
          <v-text-field v-model.number="iterations" type="number" label="Number of iterations" />
          <v-text-field v-model.number="populationSize" type="number" label="Population Size" />
        </v-form>
      </v-card-text>
      <v-card-text v-else>
        <v-data-table
          :items="results"
          :headers="headers"
        />
      </v-card-text>
      <v-card-actions>
        <v-btn v-if="results.length" color="error" @click="internal_value = false">
          Close
        </v-btn>
        <v-spacer />
        <v-btn v-if="!results.length" color="primary" :loading="loading" @click="runGeneticEvolution">
          Run Genetic Evolution
        </v-btn>
        <v-btn v-if="bestOptions" color="primary" @click="$emit('setOptions', bestOptions)">
          Set Options From Best Run
        </v-btn>
        <v-btn v-if="results.length === iterations" color="primary" @click="edit">
          Edit
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
      number_of_days: 1,
      iterations: 10,
      populationSize: 10,
      results: [],
      headers: [
        { text: 'Iteration', value: 'iteration' },
        { text: 'Best Value', value: 'best_value' }
      ],
      bestOptions: false
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
    }
  },
  watch: {
    internal_value (val) {
      if (!val) {
        this.clear()
      }
    }
  },
  mounted () {
    this.$ws.$on('error', (err) => {
      this.$noty.error(err.message || 'Unknown Error')
      this.internal_value = false
    })

    this.$ws.$on('close', () => {
      this.internal_value = false
    })

    this.$ws.$on('message', (data) => {
      this.results.unshift(data)
      if (this.results.length === this.iterations) {
        this.loading = false
        this.bestOptions = data.best_options
      }
    })
  },
  beforeDestroy () {
    this.clear()
  },
  methods: {
    runGeneticEvolution () {
      if (!this.$refs.genetic.validate()) { return }
      this.loading = true
      this.$ws.$emitToServer('strategy:evolution-' + this.strategy.id, 'runGenetic', {
        initialBalance: this.initial_balance,
        numberOfDays: this.number_of_days,
        iterations: this.iterations,
        populationSize: this.populationSize,
        strategy: this.strategy
      })
    },
    edit () {
      this.results = []
      this.bestOptions = false
    },
    clear () {
      this.loading = false
      this.results = []
      this.bestOptions = false
      if (this.$ws.socket.getSubscription('strategy:evolution-' + this.strategy.id)) {
        this.$ws.socket.getSubscription('strategy:evolution-' + this.strategy.id).close()
        this.socket = null
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
