<template>
  <span>
    <v-sheet v-if="noProfiles" color="info">
      <v-container>
        <v-row>
          <div>
            <v-card-subtitle>Hi, {{ user.full_name }}</v-card-subtitle>
            <v-card-title>Ready to start trading?</v-card-title>
          </div>
          <v-spacer />
          <v-btn color="primary" class="ma-auto" to="profiles/add">
            Create first profile
          </v-btn>
        </v-row>
      </v-container>
    </v-sheet>
    <v-container>
      <v-card>
        <v-card-title>Portfolio</v-card-title>
        <v-card-text />
      </v-card>
    </v-container>
  </span>
</template>

<script>
export default {
  name: 'Dashboard',
  computed: {
    noProfiles () {
      return !this.user.profiles.length
    }
  },
  head () {
    return {
      title: 'Dashboard'
    }
  }
}
</script>

<style scoped>

</style>
