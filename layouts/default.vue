<template>
  <v-app id="main-app" dark>
    <v-navigation-drawer
      v-if="$vuetify.breakpoint.mdAndUp"
      permanent
      fixed
      :color="$vuetify.theme.dark? '#121D27' : '#F5F6F8'"
      app
    >
      <v-list>
        <v-list-item>
          <v-list-item-content class="logoText">
            Coin Base Trader
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="logout">
          <v-list-item-action>
            <v-icon>mdi-logout</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      v-if="$vuetify.breakpoint.mdAndUp"
      fixed
      app
      :color="$vuetify.theme.dark? '#121D27' : '#F5F6F8'"
    >
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <v-icon @click="toggleDarkMode">
        mdi-brightness-6
      </v-icon>
    </v-app-bar>
    <v-main>
      <nuxt />
    </v-main>
    <v-bottom-navigation
      v-if="$vuetify.breakpoint.smAndDown"
      app
    >
      <v-btn v-for="(item, i) in items" :key="i" :to="item.to">
        {{ item.title }}
        <v-icon>{{ item.icon }}</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<script>
export default {
  name: 'Default',
  data () {
    return {
      drawer: true,
      items: [
        {
          icon: 'mdi-desktop-mac-dashboard',
          title: 'Dashboard',
          to: '/dashboard'
        },
        {
          icon: 'mdi-account',
          title: 'Profiles',
          to: '/profiles'
        },
        {
          icon: 'mdi-strategy',
          title: 'Strategies',
          to: '/strategies'
        },
        {
          icon: 'mdi-cog-outline',
          title: 'Settings',
          to: '/settings'
        }
      ],
      title: 'Coin Base Trader'
    }
  },
  watch: {
    $route: {
      handler (val) {
        if (process.client) {
          this.title = this.$route.name.charAt(0).toUpperCase() + this.$route.name.slice(1)
        }
      },
      immediate: true
    }
  },
  methods: {
    async logout () {
      await this.$auth.logout()
    },
    toggleDarkMode () {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark
    }
  }
}
</script>

<style>
  .logoText {
    color: #1552F0;
    font-size: 18px;
    font-weight: bold;
    text-align: center;
  }
</style>
