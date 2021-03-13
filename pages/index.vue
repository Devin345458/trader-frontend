<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title>Login</v-card-title>
          <v-card-text>
            <v-alert v-if="showAlert" type="error" @click="showAlert = false">
              {{ alertMessage }}
            </v-alert>
            <v-form ref="form">
              <v-text-field v-model="email" label="Email" />
              <v-text-field v-model="password" label="Password" type="password" />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn color="secondary" to="register" text>
              Sign Up
            </v-btn>
            <v-btn to="forgot-password" text>
              Forgot Password?
            </v-btn>
            <v-spacer />
            <v-btn :loading="loading" color="primary" @click="login">
              Login
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'Login',
  layout: 'login',
  data () {
    return {
      email: null,
      password: null,
      loading: false,
      showAlert: false,
      alertMessage: ''
    }
  },
  methods: {
    async login () {
      this.loading = true
      const { data: { message }, status } = await this.$auth.loginWith('local', { data: { email: this.email, password: this.password } }).catch(e => e)
      this.loading = false
      if (status !== 200) {
        this.showAlert = true
        this.alertMessage = message || 'Unable to login. Please check your internet connection and try again'
        return
      }
      if (this.$route.query.redirect && this.$route.query.redirect !== '/login') {
        await this.$router.push(this.$route.query.redirect)
        return
      }
      await this.$router.push('/dashboard')
    }
  }
}
</script>
