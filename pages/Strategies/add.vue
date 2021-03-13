<template>
  <v-container>
    <strategy-form ref="form" v-model="loading" :strategy="strategy" @save="save" />
  </v-container>
</template>

<script>
import StrategyForm from '~/components/strategy/form'
export default {
  name: 'Add',
  components: { StrategyForm },
  data () {
    return {
      loading: false,
      strategy: {
        enabled: false,
        name: null,
        indicator: null,
        profile_id: null,
        type: null,
        coin: null,
        options: {}
      }
    }
  },
  methods: {
    async save () {
      if (!this.$refs.form.validate()) { return }
      this.loading = true
      const { data: { strategyId, message, errors }, status } = await this.$axios.post('/v1/strategies', {
        ...this.strategy
      }).catch(e => e)
      this.loading = false
      if (this.$error(status, message, errors)) { return }
      await this.$router.push('/strategies/edit/' + strategyId)
      await this.$router.push('/strategies/view/' + strategyId)
    }
  }

}
</script>

<style scoped>

</style>
