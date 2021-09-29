<template>
  <v-card :loading="loading || internalLoading">
    <v-card-title>Edit {{ strategy.name }} Strategy</v-card-title>
    <v-card-text>
      <v-form ref="form">
        <v-select v-model="strategy.type" :items="types" label="Trade Type" :rules="rules.required" @change="strategy.profile_id = null" />
        <v-text-field v-model="strategy.name" label="Strategy Name" :rules="rules.required" />
        <v-select
          v-if="strategy.type === 'Live'"
          v-model="strategy.profile_id"
          :items="profiles"
          label="Profile"
          :rules="rules.required"
          :loading="profilesLoading"
          item-value="id"
          item-text="name"
        />
        <v-select v-model="strategy.indicator" :items="indicators" label="Indicator" :rules="rules.required" />
        <v-autocomplete
          v-if="!edit"
          v-model="strategy.coin"
          item-value="id"
          item-text="id"
          :items="coins"
          :loading="coinsLoading"
          label="Coin"
          :rules="rules.required"
        />
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
        { text: 'Test Strategy', value: 'Test' }
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
    'strategy.indicator' () {
      this.getOptions()
    }
  },
  mounted () {
    this.getOptions()
    this.loadCoins()
    this.loadProfiles()
  },
  methods: {
    async loadCoins () {
      const paper = this.strategy.type === 'Paper'
      this.coinsLoading = true
      const { data: { coins, message }, status } = await this.$axios.get(`/coinbase/coins/${paper}`).catch(e => e)
      this.coinsLoading = false
      if (this.$error(status, message)) { return }
      this.coins = coins
    },
    async loadProfiles () {
      if (!this.strategy.type) { return }
      this.profilesLoading = true
      const { data: { profiles, message }, status } = await this.$axios.get(`/profiles/${this.strategy.type}`).catch(e => e)
      this.profilesLoading = false
      if (this.$error(status, message)) { return }
      this.profiles = profiles
    },
    async getOptions () {
      if (!this.strategy.indicator) { return }
      this.internalLoading = true
      const { data: { options, message, errors }, status } = await this.$axios.get('/strategies/options/' + this.strategy.indicator).catch(e => e)
      this.internalLoading = false
      if (this.$error(status, message, errors)) { return }
      this.options = options
      this.options.forEach((option) => {
        if (option.default) {
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
