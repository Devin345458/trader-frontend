<template>
  <v-card>
    <v-card-title>{{ title }}</v-card-title>
  </v-card>
</template>

<script>
import http from '~/mixins/http'
export default {
  name: 'Confirm',
  mixins: [http],
  layout: 'login',
  auth: false,
  data () {
    return {
      title: '',
      loading: true
    }
  },
  async mounted () {
    const { data: { success, message } } = await this.$axios.post('/v1/user/confirm-email', {
      token: this.findGetParameter('token')
    }).catch(e => e)
    if (!success) {
      this.title = message
      this.loading = false
      return
    }
    await this.$router.push('/')
    this.$noty.success('Successfully verified email. Please login.')
  }
}
</script>

<style scoped>

</style>
