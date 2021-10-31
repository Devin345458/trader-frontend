<template>
  <v-container>
    <v-card>
      <v-card-title>
        Profiles
        <v-spacer />
        <v-btn
          color="primary"
          to="/profiles/add"
        >
          Add Profile
        </v-btn>
      </v-card-title>
      <v-data-table
        :loading="loading"
        :headers="headers"
        :items="profiles"
      >
        <template #item.actions="{ item }">
          <v-btn
            icon
            color="primary"
            :to="`/profiles/view/${item.id}`"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn
            icon
            color="error"
            @click="remove(item.id)"
          >
            <v-icon>mdi-edit</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>

export default {
  name: 'Index',
  data () {
    return {
      loading: true,
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Broker', value: 'broker' },
        { text: 'Actions', value: 'actions' }
      ],
      profiles: []
    }
  },
  async mounted () {
    this.loading = true
    const { data: { profiles, message, errors }, status } = await this.$axios.get('/profiles', {}).catch(e => e)
    this.loading = false
    if (this.$error(status, message, errors)) { return }
    this.profiles = profiles
  },
  methods: {
    async remove () {

    }
  }
}
</script>

<style scoped>

</style>
