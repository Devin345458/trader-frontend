<template>
  <v-container>
    <v-card-title class="px-0">
      <v-chip v-if="strategy.type === 'Paper'" class="mr-2" label color="error">
        Paper
      </v-chip>
      {{ strategy.name }} - {{ strategy.coin }}
      <v-spacer />
      <v-btn
        text
        color="primary"
        @click="simulationModal = true"
      >
        Run Simulation
        <v-icon>mdi-notebook-outline</v-icon>
      </v-btn>
      <simulation v-model="simulationModal" :strategy="strategy" />
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
    </v-card-title>
    <v-row>
      <v-col v-if="false" md="12">
        <v-card ref="card">
          <trading-chart
            v-if="strategy.coin"
            :width="cardWidth"
            :ticks="uniqueTicks"
            :trades="strategy.trades"
            :coin="strategy.coin"
            :indicators="indicators"
          />
        </v-card>
      </v-col>
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
      <v-col cols="12">
        <v-card>
          <v-card-title>
            Genetic Runs
            <v-spacer />
            <genetic :strategy.sync="strategy" @newRun="geneticRuns.push($event)">
              <template #activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  color="primary"
                  v-on="on"
                >
                  Run Genetic
                </v-btn>
              </template>
            </genetic>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :items="geneticRuns"
              :headers="geneticHeaders"
            >
              <template #item.created_at="{item}">
                {{ formatTime(item.created_at) }}
              </template>
              <template #item.actions="{item}">
                <v-btn
                  color="error"
                  icon
                  @click="deleteGeneticRun(item.id)"
                >
                  <v-icon>
                    mdi-trash-can
                  </v-icon>
                </v-btn>
                <genetic :genetic-run="item">
                  <template #activator="{on}">
                    <v-btn
                      color="info"
                      icon
                      v-on="on"
                    >
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                  </template>
                </genetic>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import uniqBy from 'lodash.uniqby'
import moment from 'moment'
import TradingChart from '~/components/charts/TradingChart'
import Genetic from '~/components/genetic'
import { replaceItemByFieldToArray } from '~/utils/utils'
import Simulation from '~/components/simulation'
export default {
  name: 'Index',
  components: { Simulation, Genetic, TradingChart },
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
      indicators: {},
      enableLoading: false,
      geneticLoading: true,
      geneticRuns: [],
      simulationModal: false,
      geneticHeaders: [
        { text: 'Created', value: 'created_at' },
        { text: 'Days', value: 'days' },
        { text: 'Iterations', value: 'iterations' },
        { text: 'Initial Balance', value: 'initial_balance' },
        { text: 'Population Size', value: 'population_size' },
        { text: 'Status', value: 'status' },
        { text: '', value: 'actions' }
      ]
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
    this.onResize()
    this.getGeneticRuns()
  },
  methods: {
    async getStrategy () {
      this.loading = true
      const { data: { strategy, message, errors }, status } = await this.$axios.get(`/strategies/get/${this.$route.params.id}`).catch(e => e)
      this.loading = false
      if (this.$error(status, message, errors)) { return }
      this.strategy = strategy
    },
    onResize () {
    },
    setupSocketListeners () {
      this.sockets.subscribe('error', (err) => {
        this.$noty.error(err.message || 'Unknown Error')
        // this.$router.push('/strategies')
      })
      this.sockets.subscribe(`bot-socket:${this.$route.params.id}|trade-ticker`, (tradeTick) => {
        this.ticks.push(tradeTick)
      })
      this.sockets.subscribe(`bot-socket:${this.$route.params.id}|trade-indicator`, (tradeIndicator) => {
        this.indicators[tradeIndicator.name] = { time: tradeIndicator.time, indicator: tradeIndicator.indicator }
      })
      this.sockets.subscribe(`bot-socket:${this.$route.params.id}|trade`, (trade) => {
        this.trades.push(trade)
      })
      this.sockets.subscribe(`bot-socket:${this.$route.params.id}|genetic-run`, (geneticRun) => {
        replaceItemByFieldToArray('id', this.geneticRuns, geneticRun)
      })
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
    async getGeneticRuns () {
      this.geneticLoading = true
      const { data: { runs, message, errors }, status } = await this.$axios.get(`/genetic-runs/strategy/${this.$route.params.id}`).catch(e => e)
      this.geneticLoading = false
      if (this.$error(status, message, errors)) { return }
      this.geneticRuns = runs
    },
    async deleteGeneticRun (id) {
      const tmp = this.geneticRuns.map(item => item.id)
      const holding = this.geneticRuns.splice(tmp.indexOf(id), 1)[0]
      const { data: { message, errors }, status } = await this.$axios.delete('/genetic-runs/delete/' + id).catch(e => e)
      if (this.$error(status, message, errors)) {
        this.geneticRuns.splice(tmp.indexOf(id), 0, holding)
      }
    },
    formatTime (time) {
      return moment(time).fromNow()
    }
  }
}
</script>

<style scoped>

</style>
