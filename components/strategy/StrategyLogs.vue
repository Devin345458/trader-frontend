<template>
  <v-row>
    <v-col cols="12">
      <v-card :loading="logLoading">
        <v-card-title>
          Log
          <v-spacer />
          <v-switch v-model="autoScroll" label="Auto Scroll" />
        </v-card-title>
        <v-card-text ref="logTerminal" class="black pt-4" style="overflow: scroll; max-height: 300px">
          <p v-for="log in logs" :key="log.id" :class="{'white--text': log.type === 'info', 'red--text': log.type === 'error', 'info--text': log.type === 'order'}">
            [{{ formatTime(log.created_at) }}] {{ log.message }}
          </p>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import moment from 'moment'
import { replaceItemByFieldToArray } from '~/utils/utils'

export default {
  name: 'StrategyLogs',
  props: {
    strategyId: {
      type: [Number, String],
      required: true
    }
  },
  data () {
    return {
      logs: [],
      logLoading: false,
      autoScroll: true
    }
  },
  watch: {
    strategyId: {
      async handler (val, oldVal) {
        this.logs = []
        this.logLoading = true
        const { data: { logs, message, errors }, status } = await this.$axios.get(`/strategy-logs/strategy/${val}`).catch(e => e)
        this.logLoading = false
        if (this.$error(status, message, errors)) { return }
        this.logs = logs
        this.sockets.subscribe(`bot-socket:${val}|strategy-logs`, (log) => {
          replaceItemByFieldToArray('id', this.logs, log)
        })
        if (oldVal) {
          this.sockets.unsubscribe(`bot-socket:${val}|strategy-logs`)
        }
      },
      immediate: true
    }
  },
  beforeDestroy () {
    this.sockets.unsubscribe(`bot-socket:${this.strategyId}|strategy-logs`)
  },
  methods: {
    formatTime (time) {
      return moment(time).format('YYYY-MM-DD hh:mm:ss a')
    }
  }
}
</script>

<style scoped>

</style>
