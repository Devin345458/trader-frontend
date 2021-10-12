<template>
  <v-card>
    <v-card-title>Documentation</v-card-title>
    <v-card-text>
      <v-tabs vertical>
        <v-tab>Sign Up</v-tab>
        <v-tab-item>
          <v-container class="d-flex flex-column" style="gap: 32px">
            <v-card>
              <v-card-title>
                Signing Up
              </v-card-title>
              <v-card-subtitle>
                <p><b>Date:</b> October 10, 2021</p>
              </v-card-subtitle>
            </v-card>

            <v-card>
              <v-card-text>
                <h3>1. <a href="https://coin-base-trader.com" target="_blank">Go to https://coin-base-trader.com</a></h3>
              </v-card-text>
            </v-card>

            <v-card>
              <v-card-text>
                <h3>2. Click on SIGN UP</h3>
                <img src="https://images.tango.us/public/edited_image_857c7f1a-cfe9-45b0-8090-a60578bb319a?crop=focalpoint&fit=crop&fp-x=0.5&fp-y=0.5&fp-z=1&w=undefined&ar=1918%3A943" width="600" alt="Click on SIGN UP">
              </v-card-text>
            </v-card>

            <v-card>
              <v-card-text>
                <h3>3. Enter your fist name</h3>
              </v-card-text>
            </v-card>

            <v-card>
              <v-card-text>
                <h3>4. Enter your last name</h3>
              </v-card-text>
            </v-card>

            <v-card>
              <v-card-text>
                <h3>5. Enter your email</h3>
              </v-card-text>
            </v-card>

            <v-card>
              <v-card-text>
                <h3>6. Enter your password</h3>
              </v-card-text>
            </v-card>

            <v-card>
              <v-card-text>
                <h3>7. Confirm Password</h3>
              </v-card-text>
            </v-card>

            <v-card>
              <v-card-text>
                <h3>8. Click on REGISTER</h3>
                <img src="https://images.tango.us/public/edited_image_e30e70fb-fb72-484e-96c0-45abae328d54?crop=focalpoint&fit=crop&w=undefined&ar=990%3A564" width="600" alt="Click on REGISTER">
              </v-card-text>
            </v-card>
          </v-container>
        </v-tab-item>
      </v-tabs>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'Documentation',
  layout: 'login',
  auth: false
}
</script>

<style lang="scss" scoped>
::v-deep {
  .theme--dark.v-tabs-items {
    background-color: #F9FAFB !important;
  }
}

</style>
