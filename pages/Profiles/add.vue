<template>
  <v-container>
    <v-card>
      <v-card-title>Add Profile</v-card-title>
      <v-card-text>
        <v-slide-x-transition group>
          <v-form v-if="phase" :key="1" ref="form1">
            <v-select v-model="profile.type" :items="types" label="Profile Type" :rules="rules.required" @change="loadProfiles" />
            <v-text-field v-model="profile.apiKey" label="Coin Base Api Key" :rules="rules.required" />
            <v-text-field v-model="profile.apiPhrase" label="Coin Base Api Phrase" :rules="rules.required" />
            <v-text-field v-model="profile.apiSecret" label="Coin Base Api Secret" :rules="rules.required" />
          </v-form>
          <v-form v-else :key="2" ref="form2">
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
          </v-form>
        </v-slide-x-transition>
      </v-card-text>
      <v-card-actions>
        <v-btn
          v-if="!phase"
          color="error"
          @click="phase = true"
        >
          Back
        </v-btn>
        <v-spacer />
        <v-btn
          v-if="phase"
          color="primary"
          @click="next"
        >
          Next
        </v-btn>
        <v-btn
          v-else
          color="primary"
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
      profilesLoading: true,
      profile: {
        name: undefined,
        type: 'Paper',
        coinProfileId: undefined,
        apiKey: undefined,
        apiPhrase: undefined,
        apiSecret: undefined
      },
      phase: true,
      profiles: [],
      types: [
        { text: 'Development - Paper Trading', value: 'Paper' },
        { text: 'Live - Production', value: 'Live' }
      ]
    }
  },
  methods: {
    async loadProfiles () {
      this.profilesLoading = true
      const { data: { profiles, message }, status } = await this.$axios.post(`/v1/coinbase/profiles/${this.profile.type}`, {
        apiKey: this.profile.apiKey,
        apiPhrase: this.profile.apiPhrase,
        apiSecret: this.profile.apiSecret
      }).catch(e => e)
      this.profilesLoading = false
      if (this.$error(status, message)) {
        this.phase = true
        return
      }
      this.profiles = profiles
      this.profile.coinProfileId = profiles[0].id
    },
    async addProfile () {
      this.loading = true
      const { data: { message, problems }, status } = await this.$axios.post('/v1/profiles', this.profile).catch(e => e)
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
