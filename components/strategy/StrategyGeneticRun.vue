<template>
  <v-row>
    <v-col cols="12">
      <v-card>
        <v-card-title>
          Genetic Runs
          <v-spacer />
          <genetic v-model="strategy" @newRun="geneticRuns.push($event)">
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
            :headers="headers"
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
              <genetic v-model="strategy" :genetic-run="item">
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
</template>

<script>
import moment from 'moment-timezone'
import Genetic from '~/components/genetic'
import { replaceItemByFieldToArray } from '~/utils/utils'
export default {
  name: 'StrategyGeneticRun',
  components: { Genetic },
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      loading: true,
      geneticRuns: [],
      headers: [
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
    'strategy.id': {
      async handler (val, oldVal) {
        if (val === oldVal) {
          return
        }
        this.loading = true
        const {
          data: { runs, message, errors },
          status
        } = await this.$axios.get(`/genetic-runs/strategy/${val}`).catch(e => e)
        this.loading = false
        if (this.$error(status, message, errors)) {
          return
        }
        this.geneticRuns = runs
        this.sockets.subscribe(`bot-socket:${val}|genetic-run`, (geneticRun) => {
          replaceItemByFieldToArray('id', this.geneticRuns, geneticRun)
        })
        if (oldVal) {
          this.sockets.unsubscribe(`bot-socket:${val}|genetic-run`)
        }
      },
      immediate: true
    }
  },
  beforeDestroy () {
    this.sockets.unsubscribe(`bot-socket:${this.strategy.id}|genetic-run`)
  },
  methods: {
    async deleteGeneticRun (id) {
      const tmp = this.geneticRuns.map(item => item.id)
      const holding = this.geneticRuns.splice(tmp.indexOf(id), 1)[0]
      const { data: { message, errors }, status } = await this.$axios.delete('/genetic-runs/delete/' + id).catch(e => e)
      if (this.$error(status, message, errors)) {
        this.geneticRuns.splice(tmp.indexOf(id), 0, holding)
      }
    },
    formatTime (time) {
      return moment.utc(time.replace('-05:00', '')).local().fromNow()
    }
  }
}
</script>

<style scoped>

</style>
