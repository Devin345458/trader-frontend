<template>
  <v-container>
    <strategy-form ref="form" v-model="strategy" :loading="loading" @save="save" />
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
        type: 'Live',
        coin: null,
        broker: null,
        options: {}
      }
    }
  },
  methods: {
    async save () {
      if (!this.$refs.form.validate()) { return }
      this.loading = true
      const { data: { strategy, message, errors }, status } = await this.$axios.post('/strategies', {
        ...this.strategy
      }).catch(e => e)
      this.loading = false
      if (this.$error(status, message, errors)) { return }
      await this.$router.replace('/strategies/view/' + strategy.id)
    }
  }

}
</script>

<style scoped>

</style>
