<template>
  <v-app dark>
    <v-app-bar
      fixed
      app
    >
      <v-toolbar-title style="cursor: pointer" @click="$router.push('/')">
        Coin Base Trader
      </v-toolbar-title>
      <v-spacer />
      <v-btn text to="documentation">
        Documentation
      </v-btn>
    </v-app-bar>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'Login',
  auth: 'guest',
  created () {
    if (this.$auth.user) {
      this.$router.push('/dashboard')
    }
  }
}
</script>

<style scoped>

</style>
