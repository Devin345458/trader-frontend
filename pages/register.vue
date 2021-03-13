<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card v-if="!registered">
          <v-card-title>Login</v-card-title>
          <v-card-text>
            <v-alert v-if="showAlert">
              {{ alertMessage }}
            </v-alert>
            <v-form ref="form">
              <v-text-field v-model="first_name" label="First Name" :rules="rules.required" />
              <v-text-field v-model="last_name" label="Last Name" :rules="rules.required" />
              <v-text-field v-model="email" autocomplete="off" type="search" label="Email" :rules="rules.email" />
              <v-text-field v-model="password" autocomplete="off" :rules="rules.password" label="Password" type="password" />
              <v-text-field v-model="confirmPassword" autocomplete="off" :rules="confirmPasswordRules(password, confirmPassword)" label="Confirm Password" type="password" />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn :loading="loading" color="primary" @click="login">
              Register
            </v-btn>
          </v-card-actions>
        </v-card>
        <v-card v-else>
          <v-card-title>Email Confirmation</v-card-title>
          <v-card-title>
            Hey {{ first_name }}, you're almost ready to join Coin Base Trader.
            Simply click the blue confirm email in the email sent to {{ email }}
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import validations from '~/mixins/validations'
export default {
  name: 'Register',
  layout: 'login',
  auth: false,
  mixins: [validations],
  data () {
    return {
      first_name: null,
      last_name: null,
      email: null,
      password: null,
      confirmPassword: null,
      loading: false,
      showAlert: false,
      alertMessage: '',
      registered: false
    }
  },
  methods: {
    async login () {
      if (!this.$refs.form.validate()) { return }
      this.loading = true
      const { data: { message, problems }, status } = await this.$axios.post('/v1/user/register', {
        firstName: this.first_name,
        lastName: this.last_name,
        email: this.email,
        password: this.password
      }).catch(e => e)
      this.loading = false
      if (this.$error(status, message, problems)) { return }
      this.registered = true
    }
  }
}
</script>
