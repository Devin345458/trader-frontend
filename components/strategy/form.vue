<template>
  <v-card :loading="loading || internalLoading">
    <v-card-title>Edit {{ strategy.name }} Strategy</v-card-title>
    <v-card-text>
      <v-form ref="form">
        <v-select v-model="strategy.type" :items="types" label="Trade Type" :rules="rules.required" @change="strategy.profile_id = null" />
        <v-text-field v-model="strategy.name" label="Strategy Name" :rules="rules.required" />
        <v-autocomplete
          v-if="strategy.type && !edit"
          v-model="strategy.broker"
          label="Broker"
          :items="brokers"
        />
        <v-select
          v-if="strategy.broker && strategy.type === 'Live'"
          v-model="strategy.profile_id"
          :items="profiles"
          label="Profile"
          :rules="rules.required"
          :loading="profilesLoading"
          item-value="id"
          item-text="name"
        />
        <v-autocomplete
          v-if="!edit"
          v-model="strategy.coin"
          :items="coins"
          :loading="coinsLoading"
          label="Coin"
          :rules="rules.required"
        />
        <v-select v-model="strategy.indicator" :items="indicators" label="Indicator" :rules="rules.required" />
        <v-select v-if="strategy.indicator === 'Genetic'" v-model="strategy.options.indicator" :items="indicators" label="Indicator" :rules="rules.required" />
        <template v-for="option in options">
          <v-select
            v-if="option.options"
            :key="option.property"
            v-model="strategy.options[option.property]"
            :items="option.options"
            type="number"
            :label="option.label"
            :rules="option.required? rules.required: []"
          />
          <v-currency-field
            v-else-if="option.type === 'Currency'"
            :key="option.property"
            v-model="strategy.options[option.property]"
            prefix="$"
            :label="option.label"
            :rules="option.required? rules.required: []"
          />
          <v-text-field
            v-else-if="option.type === 'email'"
            :key="option.property"
            v-model="strategy.options[option.property]"
            :label="option.label"
            :rules="option.required? requireRule('email'): rules.email"
          />
          <v-text-field
            v-else-if="option.type === 'number'"
            :key="option.property"
            v-model.number="strategy.options[option.property]"
            type="number"
            :label="option.label"
            :rules="option.required? rules.required: []"
          />
          <v-checkbox
            v-else-if="option.type === 'boolean'"
            :key="option.property"
            v-model.number="strategy.options[option.property]"
            :label="option.label"
            :rules="option.required? rules.required: []"
          />
          <v-text-field
            v-else
            :key="option.property"
            v-model="strategy.options[option.property]"
            :type="option.type"
            :label="option.label"
            :rules="option.required? rules.required: []"
          />
        </template>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="primary" :loading="loading" @click="$emit('save')">
        <v-icon v-if="!edit">
          mdi-plus
        </v-icon>
        {{ edit? 'Save': 'Add' }} Strategy
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import validations from '~/mixins/validations'
export default {
  name: 'StrategyForm',
  mixins: [validations],
  props: {
    value: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      required: true
    },
    edit: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      coinsLoading: false,
      profilesLoading: false,
      internalLoading: false,
      indicators: [
        { text: 'Momentum', value: 'Momentum' },
        { text: 'Cross Over Volume Weight Moving Average', value: 'CrossoverVwap' },
        { text: 'Cross Over VWMA EMA', value: 'CrossoverVwapEma' },
        { text: 'Moving Average', value: 'MovingAverage' },
        { text: 'Relative Strength Index', value: 'RelativeStrengthIndex' },
        { text: 'Performance Maximization', value: 'Pmax' },
        { text: 'Running Genetic', value: 'Genetic' },
        { text: 'Neural Network', value: 'NeuralNetwork' },
        { text: 'ML5 Neural Network', value: 'ML5NeuralNetwork' },
        { text: 'Every Tick', value: 'EveryTick' },
        { text: 'RSI Stochastic Take Profit', value: 'RSIStochasticTakeProfit' },
        // { text: 'Fib Retracement', value: 'FibRetracement' },
        { text: 'Mean Reversion', value: 'MeanReversion' }
      ],
      brokers: [
        { text: 'Coinbase Broker', value: 'CoinbaseBroker' },
        { text: 'Alpaca Broker', value: 'AlpacaBroker' },
        { text: 'KuCoin Broker', value: 'KuCoinBroker' }
      ],
      types: [
        { text: 'Development - Paper Trading', value: 'Paper' },
        { text: 'Live - Production', value: 'Live' }
      ],
      options: [],
      coins: [],
      profiles: []
    }
  },
  computed: {
    strategy: {
      get () {
        return this.value
      },
      set (val) {
        this.$emit('input', val)
      }
    }
  },
  watch: {
    'strategy.broker' (val) {
      this.strategy.profile = null
      this.loadCoins(val)
      this.loadProfiles(val)
    },
    'strategy.indicator' (val) {
      this.strategy.options = {}
      this.getOptions(val)
    },
    'strategy.options.indicator' (val) {
      this.strategy.options = { indicator: val, geneticInterval: this.strategy.options.geneticInterval }
      this.getOptions(val, true)
    }
  },
  mounted () {
    if (this.strategy.broker) {
      this.loadProfiles(this.strategy.broker)
    }
    this.getOptions(this.strategy.indicator).then(() => {
      if (this.strategy.options.indicator) {
        this.getOptions(this.strategy.options.indicator, true)
      }
    })
  },
  methods: {
    async loadCoins (broker) {
      this.coinsLoading = true
      const { data: { coins, message }, status } = await this.$axios.get(`/brokers/coins/${broker}`).catch(e => e)
      this.coinsLoading = false
      if (this.$error(status, message)) { return }
      this.coins = coins
    },
    async loadProfiles (broker) {
      this.profilesLoading = true
      const { data: { profiles, message }, status } = await this.$axios.get(`/profiles/${broker}`).catch(e => e)
      this.profilesLoading = false
      if (this.$error(status, message)) { return }
      this.profiles = profiles
    },
    async getOptions (val, merge = false) {
      if (!val) { return }
      this.internalLoading = true
      const { data: { options, message, errors }, status } = await this.$axios.get('/strategies/options/' + val).catch(e => e)
      this.internalLoading = false
      if (this.$error(status, message, errors)) { return }
      if (merge) {
        options.forEach((option) => {
          if (this.options.map(option => option.property).includes(option.property)) {
            return
          }
          this.options.push(option)
        })
      } else {
        this.options = options
      }

      this.options.forEach((option) => {
        if (option.default && this.strategy.options[option.property] === undefined) {
          this.strategy.options[option.property] = option.default
        }
      })
    },
    validate () {
      return this.$refs.form.validate()
    }
  }
}
</script>

<style scoped>

</style>
