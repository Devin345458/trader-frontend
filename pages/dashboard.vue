<template>
  <span>
    <v-sheet v-if="noProfiles" color="info">
      <v-container>
        <v-row>
          <div>
            <v-card-subtitle>Hi, {{ user.full_name }}</v-card-subtitle>
            <v-card-title>Ready to start trading?</v-card-title>
          </div>
          <v-spacer />
          <v-btn color="primary" class="ma-auto" to="profiles/add">
            Create first profile
          </v-btn>
        </v-row>
      </v-container>
    </v-sheet>
    <v-container class="px-0">
      <v-row>
        <v-col cols="12">
          <v-container>
            <v-row class="ma-0 align-center">
              <h3 class="mb-4" style="color: #4B4CE2; font-size: 55px ">You're <span style="color: #32C47C">up {{ percent.toFixed(2) }}% </span>today</h3>
              <v-spacer />
              <v-btn-toggle v-model="type" group tile>
                <v-btn value="live">
                  Live
                </v-btn>
                <v-btn
                  value="paper"
                >
                  Paper
                </v-btn>
              </v-btn-toggle>
            </v-row>
            <v-row>
              <v-col cols="12" lg="6">
                <v-card color="#7267F5">
                  <v-card-title style="color: #49469B">Total Amount</v-card-title>
                  <v-card-text class="pb-6">
                    <p style="color: #201D93; font-size: 45px; line-height: 45px">${{ total.toFixed(2) }}</p>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" lg="6">
                <v-card color="#45D47C">
                  <v-card-title style="color: #309E59">Sum Profits</v-card-title>
                  <v-card-text class="pb-6">
                    <p style="color: #0C6C39; font-size: 45px; line-height: 45px">${{ amount.toFixed(2) }}</p>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-col>
        <v-col cols="12" lg="6">
          <v-container>
            <div class="d-flex align-center">
              <h3 class="white--text ">Strategy Performance</h3>
              <v-spacer />
              <v-btn-toggle v-model="chartOrList" group tile>
                <v-btn value="chart">
                  Chart
                </v-btn>
                <v-btn
                  value="list"
                >
                  List
                </v-btn>
              </v-btn-toggle>
            </div>
          </v-container>
          <v-tabs-items v-model="chartOrList">
            <v-tab-item value="chart">
              <light-weight-chart :indicators="indicators" /></v-tab-item>
          </v-tabs-items>
        </v-col>
        <v-col cols="12" lg="6">
          <v-container>
            <h3 class="white--text" style="line-height: 56px">Strategy Status</h3>
          </v-container>
          <div style="height: 400px; overflow-y: scroll">
            <v-card v-for="strategy in strategies" :key="strategy.id" flat tile>
              <v-card-title>
                <status-bubble :online="!!strategy.enabled" />
                {{ strategy.name }}
                <v-spacer />
                <v-btn icon :to="'/strategies/view/' + strategy.id">
                  <v-icon>mdi-cog</v-icon>
                </v-btn>
              </v-card-title>
            </v-card>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </span>
</template>

<script>
import moment from 'moment'
import LightWeightChart from '~/components/charts/LightWeightChart'
import StatusBubble from '~/components/strategy/StatusBubble'
export default {
  name: 'Dashboard',
  components: { StatusBubble, LightWeightChart },
  data () {
    return {
      type: 'live',
      percent: 0,
      amount: 0,
      total: 0,
      trades: [],
      chartOrList: 'chart',
      strategies: [],
      headers: [
        { text: 'Status', value: 'status' },
        { text: 'Name', value: 'name' }
      ]
    }
  },
  head () {
    return {
      title: 'Dashboard'
    }
  },
  computed: {
    noProfiles () {
      return !this.user.profiles.length
    },
    indicators () {
      const beginning = moment().startOf('day')
      const end = moment().endOf('day')
      let tradeCount = []
      let lastPnl = 0
      const profits = [{
        time: beginning.unix(),
        value: 0,
        settings: { color: '#ffffff' }
      }]
      while (beginning.isBefore(end)) {
        const windowEnd = beginning.clone().add(15, 'minute')
        const trades = this.trades
          // Remove trade not in window
          .filter((trade) => {
            const tradeTime = moment(new Date(trade.created_at)).unix()
            return tradeTime >= beginning.unix() && tradeTime < windowEnd.unix()
          })
        tradeCount = tradeCount.concat(trades)
        const sum = trades.reduce((acc, trade) => acc + trade.profit_loss, 0)

        profits.push({
          time: windowEnd.unix(),
          value: lastPnl + sum,
          settings: { color: '#ffffff' }
        })

        lastPnl += sum

        beginning.add(15, 'minute')
      }
      return {
        profits
      }
    }
  },
  watch: {
    type () {
      this.getStrategies()
      this.getTradingPNL()
    }
  },
  mounted () {
    this.getStrategies()
    this.getTradingPNL()
  },
  methods: {
    async getTradingPNL () {
      const beginning = moment().startOf('day').toISOString()
      const end = moment().endOf('day').toISOString()
      this.loading = true
      const { data: { percent, amount, total, trades, message, errors }, status } = await this.$axios.get('/trades/pnl/' + this.type, {
        params: {
          beginning,
          end
        }
      }).catch(e => e)
      this.loading = false
      if (this.$error(status, message, errors)) { return }
      this.percent = percent
      this.amount = amount
      this.total = total
      this.trades = trades
    },
    async getStrategies () {
      this.loading = true
      const { data: { strategies, message, problems }, status } = await this.$axios.get('/strategies/index/' + this.type, {}).catch(e => e)
      this.loading = false
      if (this.$error(status, message, problems)) { return }
      this.strategies = strategies
    }
  }
}
</script>

<style scoped>

</style>
