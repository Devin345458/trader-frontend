<template>
  <v-container>
    <v-card>
      <v-card-title>Add Profile</v-card-title>
      <v-card-text>
        <v-form ref="form1">
          <v-text-field v-model="profile.name" label="Profile Name" :rules="rules.required" />
          <v-autocomplete
            v-model="profile.broker"
            label="Broker"
            :items="brokers"
            :rules="rules.required"
          />
          <v-text-field v-for="field in fields" :key="field.field" v-model="profile[field.field]" :label="field.label" :rules="rules.required" />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="primary"
          :loading="loading"
          @click="addProfile"
        >
          Add Profile
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import validations from '~/mixins/validations'
export default {
  name: 'Add',
  mixins: [validations],
  data () {
    return {
      profile: {
        name: undefined,
        broker: undefined,
        apiKey: undefined,
        apiPhrase: undefined,
        apiSecret: undefined
      },
      brokers: [
        { text: 'Coinbase Broker', value: 'CoinbaseBroker' },
        { text: 'Alpaca Broker', value: 'AlpacaBroker' },
        { text: 'KuCoin Broker', value: 'KuCoinBroker' }
      ],
      loading: false,
      fields: []
    }
  },
  watch: {
    async 'profile.broker' (val) {
      this.loading = true
      const { data: { fields, message, problems }, status } = await this.$axios.get('/brokers/fields/' + val).catch(e => e)
      this.loading = false
      if (this.$error(status, message, problems)) { return }
      this.fields = fields
    }
  },
  methods: {
    async addProfile () {
      this.loading = true
      const { data: { message, problems }, status } = await this.$axios.post('/profiles', this.profile).catch(e => e)
      this.loading = false
      if (this.$error(status, message, problems)) { return }
      await this.$router.push('/profiles')
    }
  }
}
</script>

<style scoped>

</style>
