<template>
  <v-container>
    <v-card>
      <v-card-title>Profile</v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field v-model="profile.name" label="Profile Name" :rules="rules.required" />
          <v-text-field v-model="profile.api_key" label="Coin Base Api Key" :rules="rules.required" />
          <v-text-field v-model="profile.api_phrase" label="Coin Base Api Phrase" :rules="rules.required" />
          <v-text-field v-model="profile.api_secret" label="Coin Base Api Secret" :rules="rules.required" />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="error"
          :loading="loading"
          @click="remove"
        >
          Remove Profile
        </v-btn>
        <v-spacer />
        <v-btn
          color="primary"
          :loading="loading"
          @click="edit"
        >
          Edit Profile
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import validations from '~/mixins/validations'
export default {
  name: 'ViewProfile',
  mixins: [validations],
  data () {
    return {
      profilesLoading: false,
      loading: false,
      profiles: [],
      profile: {}
    }
  },
  async fetch () {
    await this.loadProfile()
  },
  methods: {
    async remove () {
      this.loading = true
      const { data: { message, errors }, status } = await this.$axios.delete('/profiles/' + this.profile.id).catch(e => e)
      this.loading = false
      if (this.$error(status, message, errors)) { return }
      await this.$router.push('/profiles')
    },
    async edit () {
      this.loading = true
      const { data: { profile, message, errors }, status } = await this.$axios.patch('/profiles', this.profile).catch(e => e)
      this.loading = false
      if (this.$error(status, message, errors)) { return }
      this.profile = profile
    },
    async loadProfile () {
      const { data: { profile, message, problems }, status } = await this.$axios.get('/profiles/view/' + this.$route.params.id, {}).catch(e => e)
      if (this.$error(status, message, problems)) {
        await this.$router.push('/profiles')
        return
      }
      this.profile = profile
    }
  }
}
</script>

<style scoped>

</style>
