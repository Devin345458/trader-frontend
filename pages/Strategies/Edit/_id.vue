<template>
  <v-container>
    <strategy-form
      ref="form"
      v-model="loading"
      :strategy="strategy"
      edit
      @save="save"
      @simulate="simulationModal = true"
      @genetic="geneticModal = true"
    />
  </v-container>
</template>

<script>
import validations from '~/mixins/validations'
import StrategyForm from '~/components/strategy/form'
export default {
  name: 'Edit',
  components: { StrategyForm },
  mixins: [validations],
  data () {
    return {
      loading: false,
      strategy: {
        options: []
      },
      simulationModal: false,
      geneticModal: false
    }
  },
  async mounted () {
    await this.getStrategy()
  },
  methods: {
    async save () {
      if (!this.$refs.form.validate()) { return }
      this.loading = true
      const { data: { strategyId, message, errors }, status } = await this.$axios.patch('/strategies', {
        ...this.strategy
      }).catch(e => e)
      this.loading = false
      if (this.$error(status, message, errors)) { return }
      await this.$router.push('/strategies/view/' + strategyId)
    },
    async getStrategy () {
      this.loading = true
      const { data: { strategy, message, errors }, status } = await this.$axios.get('/strategies/' + this.$route.params.id).catch(e => e)
      this.loading = false
      if (this.$error(status, message, errors)) { return }
      this.strategy = strategy
    },
    setOptions (options) {
      this.strategy.options = options
    }
  }
}
</script>

<style scoped>

</style>
