<template>
  <v-container>
    <v-card-title class="px-0">
      <v-chip v-if="strategy.type === 'Paper'" class="mr-2" label color="error">
        Paper
      </v-chip>
      {{ strategy.name }} - {{ strategy.coin }}
      <v-spacer />
      {{ currentBalance }}
    </v-card-title>
    <v-card-title>
      <v-spacer />
      <v-btn
        text
        color="primary"
        @click="simulationModal = true"
      >
        Run Simulation
        <v-icon>mdi-notebook-outline</v-icon>
      </v-btn>
      <v-btn
        text
        color="info"
        :to="'/strategies/edit/' + strategy.id"
      >
        Edit
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn
        v-if="strategy.enabled"
        text
        color="error"
        :loading="enableLoading"
        @click="stopStrategy"
      >
        Stop Running
        <v-icon>mdi-stop</v-icon>
      </v-btn>
      <v-btn
        v-else
        text
        color="success"
        :loading="enableLoading"
        @click="startStrategy"
      >
        Start Running
        <v-icon>mdi-play</v-icon>
      </v-btn>
      <v-btn
        v-if="strategy.type === 'Paper'"
        text
        color="yellow"
        :loading="enableLoading"
        @click="resetStrategy"
      >
        Reset Strategy
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-card-title>
    <strategy-chart v-if="strategy.coin" ref="chart" :strategy-id="$route.params.id" :coin="strategy.coin" />
    <strategy-trades :strategy-id="$route.params.id" />
    <strategy-logs :strategy-id="$route.params.id" />
    <strategy-genetic-run v-if="strategy.indicator !== 'Genetic'" v-model="strategy" />
    <simulation v-model="simulationModal" :strategy="strategy" />
  </v-container>
</template>

<script>
import Simulation from '~/components/simulation'
import StrategyLogs from '~/components/strategy/StrategyLogs'
import StrategyGeneticRun from '~/components/strategy/StrategyGeneticRun'
import StrategyTrades from '~/components/strategy/StrategyTrades'
import StrategyChart from '~/components/strategy/StrategyChart'
export default {
  name: 'ViewStrategy',
  components: { StrategyChart, StrategyTrades, StrategyGeneticRun, StrategyLogs, Simulation },
  data () {
    return {
      strategy: {
      },
      loading: true,
      enableLoading: false,
      simulationModal: false
    }
  },
  computed: {
    currentBalance () {
      if (!this.strategy.coin) {
        return
      }

      return `Capital: $${this.strategy?.position_info?.capital || 0}    ${this.strategy.coin}: ${(this.strategy.position_info?.lastOrder?.quantity || 0).toFixed(2)}`
    }
  },
  created () {
    this.strategy.id = Number(this.$route.params.id)
  },
  mounted () {
    this.getStrategy()
  },
  methods: {
    async getStrategy () {
      this.loading = true
      const { data: { strategy, message, errors }, status } = await this.$axios.get(`/strategies/get/${this.$route.params.id}`).catch(e => e)
      this.loading = false
      if (this.$error(status, message, errors)) { return }
      this.strategy = strategy
    },
    async stopStrategy () {
      this.enableLoading = true
      const { data: { message, errors }, status } = await this.$axios.put(`/strategies/stop/${this.$route.params.id}`).catch(e => e)
      this.enableLoading = false
      if (this.$error(status, message, errors)) { return }
      this.strategy.enabled = false
    },
    async startStrategy () {
      this.enableLoading = true
      const { data: { message, errors }, status } = await this.$axios.put(`/strategies/start/${this.$route.params.id}`).catch(e => e)
      this.enableLoading = false
      if (this.$error(status, message, errors)) { return }
      this.strategy.enabled = true
    },
    async resetStrategy () {
      this.enableLoading = true
      const { data: { strategy, message, errors }, status } = await this.$axios.put(`/strategies/reset/${this.$route.params.id}`).catch(e => e)
      this.enableLoading = false
      if (this.$error(status, message, errors)) { return }
      this.$refs.chart.refresh()
      this.strategy = strategy
    }
  }
}
</script>

<style scoped>

</style>
