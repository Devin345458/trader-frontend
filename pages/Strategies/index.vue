<template>
  <v-container>
    <v-card>
      <v-card-title>
        Trading Strategies
        <v-spacer />
        <v-btn color="primary" @click="addStrategy">
          <v-icon>mdi-plus</v-icon>
          Add New Strategy
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-data-table
          :items="strategies"
          :headers="headers"
        >
          <template #item.status="{item}">
            {{ item.enabled ? 'Running' : 'Stopped' }}
          </template>
          <template #item.broker="{item}">
            {{ item.broker.substr(0, item.broker.indexOf('Broker')) }}
          </template>
          <template #item.actions="{item}">
            <v-btn color="success" icon :to="'/strategies/view/' + item.id">
              <v-icon>mdi-eye</v-icon>
            </v-btn>
            <v-btn color="primary" icon :to="'/strategies/edit/' + item.id">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn color="error" icon @click="deleteStrategy(item.id)">
              <v-icon>mdi-trash-can</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { removeItemByFieldFromArray } from '~/utils/utils'

export default {
  name: 'Index',
  data () {
    return {
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Status', value: 'status' },
        { text: 'Environment', value: 'type' },
        { text: 'Indicator', value: 'indicator' },
        { text: 'Broker', value: 'broker' },
        { text: 'Coin', value: 'coin' },
        { text: 'Actions', value: 'actions' }
      ],
      strategies: [],
      loading: true
    }
  },
  async mounted () {
    this.loading = true
    const { data: { strategies, message, problems }, status } = await this.$axios.get('/strategies', {}).catch(e => e)
    this.loading = false
    if (this.$error(status, message, problems)) { return }
    this.strategies = strategies
  },
  methods: {
    async deleteStrategy (id) {
      if (await this.$confirm('Do you really want to delete this strategy?', { title: 'Danger Zone', icon: 'mdi-alert-circle-outline', color: 'error' })) {
        this.$nuxt.$loading.start()
        const { data: { message, problems }, status } = await this.$axios.delete('/strategies/' + id).catch(e => e)
        this.$nuxt.$loading.finish()
        if (this.$error(status, message, problems)) { return }
        this.$noty.success('Successfully Deleted Strategy')
        this.strategies = removeItemByFieldFromArray('id', this.strategies, id)
      }
    },
    addStrategy () {
      this.$router.push('/strategies/add')
    }
  }
}
</script>

<style scoped>

</style>
