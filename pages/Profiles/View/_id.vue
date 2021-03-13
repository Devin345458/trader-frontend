<template>
  <v-container>
    <v-card>
      <v-card-title>Profile</v-card-title>
      <v-card-text>
        <v-form>
          <v-select v-model="profile.type" :items="types" label="Profile Type" :rules="rules.required" />
          <v-text-field v-model="profile.name" label="Profile Name" :rules="rules.required" />
          <v-select
            v-model="profile.coinProfileId"
            :items="profiles"
            label="Coin Base Profile"
            :rules="rules.required"
            :loading="profilesLoading"
            item-value="id"
            item-text="name"
          />
          <v-text-field v-model="profile.apiKey" label="Coin Base Api Key" :rules="rules.required" />
          <v-text-field v-model="profile.apiPhrase" label="Coin Base Api Phrase" :rules="rules.required" />
          <v-text-field v-model="profile.apiSecret" label="Coin Base Api Secret" :rules="rules.required" />
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
  async fetch () {
    await this.loadProfile()
  },
  data () {
    return {
      profilesLoading: false,
      loading: false,
      profiles: [],
      profile: {},
      types: [
        { text: 'Development - Paper Trading', value: 'Paper' },
        { text: 'Live - Production', value: 'Live' }
      ]
    }
  },
  watch: {
    async 'profile.type' (val, oldval) {
      await this.loadProfiles()
      if (oldval) {
        this.profile.coinProfileId = this.profiles[0].id
      }
    }
  },
  methods: {
    async remove () {
      this.loading = true
      const { data: { message, errors }, status } = await this.$axios.delete('/v1/profiles/' + this.profile.id).catch(e => e)
      this.loading = false
      if (this.$error(status, message, errors)) { return }
      await this.$router.push('/profiles')
    },
    async edit () {
      this.loading = true
      const { data: { profile, message, errors }, status } = await this.$axios.patch('/v1/profiles', this.profile).catch(e => e)
      this.loading = false
      if (this.$error(status, message, errors)) { return }
      this.profile = profile
    },
    async loadProfiles () {
      this.profilesLoading = true
      const { data: { profiles, message }, status } = await this.$axios.post(`/v1/coinbase/profiles/${this.profile.type}`, {
        apiKey: this.profile.apiKey,
        apiPhrase: this.profile.apiPhrase,
        apiSecret: this.profile.apiSecret
      }).catch(e => e)
      this.profilesLoading = false
      if (this.$error(status, message)) { return }
      this.profiles = profiles
    },
    async loadProfile () {
      const { data: { profile, message, problems }, status } = await this.$axios.get('/v1/profiles/view/' + this.$route.params.id, {}).catch(e => e)
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
