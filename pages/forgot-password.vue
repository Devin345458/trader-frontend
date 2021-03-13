<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title>Login</v-card-title>
          <v-card-text>
            <v-alert v-if="showAlert">
              {{ alertMessage }}
            </v-alert>
            <v-form ref="form">
              <v-text-field v-model="email" autocomplete="off" label="Email" :rules="rules.email" />
              <v-text-field v-model="password" autocomplete="off" :rules="rules.password" label="Password" type="password" />
              <v-text-field v-model="confirmPassword" autocomplete="off" :rules="confirmPasswordRules" label="Password" type="password" />
            </v-form>
          </v-card-text>
          <v-card-actions>
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
import validations from '~/mixins/validations'
export default {
  name: 'Login',
  layout: 'login',
  mixins: [validations],
  data () {
    return {
      email: null,
      password: null,
      confirmPassword: null,
      loading: false,
      showAlert: false,
      alertMessage: ''
    }
  },
  methods: {
    async login () {
      if (!this.$refs.form.validate()) { return }
      this.loading = true
      const { data: { message, errors }, status } = await this.$axios.post('/v1/users/register', {
        first_name: this.first_name,
        last_name: this.last_name,
        terms: this.terms,
        email: this.email,
        company_name: this.company_name,
        charge: this.charge,
        token: this.token,
        plan_id: this.plan_id,
        password: this.password
      }).catch(e => e)
      this.loading = false
      if (this.$error(status, message, errors)) { return }
      await this.$auth.loginWith('local', { data: { email: this.email, password: this.password } }).catch(e => e)
      await this.$router.push('/dashboard')
    }
  }
}
</script>
