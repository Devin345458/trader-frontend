<template>
  <v-container>
    <v-card>
      <v-card-title>Add Profile</v-card-title>
      <v-card-text>
        <v-form ref="form1">
          <v-text-field v-model="profile.name" label="Profile Name" :rules="rules.required" />
          <v-text-field v-model="profile.cApiKey" label="Coin Base Api Key" :rules="rules.required" />
          <v-text-field v-model="profile.cApiPhrase" label="Coin Base Api Phrase" :rules="rules.required" />
          <v-text-field v-model="profile.cApiSecret" label="Coin Base Api Secret" :rules="rules.required" />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="primary"
          :loading="loading"
          @click="addProfile"
        >
          Add Profile
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import validations from '~/mixins/validations'
export default {
  name: 'Add',
  mixins: [validations],
  data () {
    return {
      profile: {
        name: undefined,
        coinProfileId: undefined,
        cApiKey: undefined,
        cApiPhrase: undefined,
        cApiSecret: undefined
      },
      profiles: [],
      loading: false
    }
  },
  methods: {
    async addProfile () {
      this.loading = true
      const { data: { message, problems }, status } = await this.$axios.post('/profiles', this.profile).catch(e => e)
      this.loading = false
      if (this.$error(status, message, problems)) { return }
      await this.$router.push('/profiles')
    },
    next () {
      if (!this.$refs.form1.validate()) { return }
      this.loadProfiles()
      this.phase = false
    }
  }
}
</script>

<style scoped>

</style>
