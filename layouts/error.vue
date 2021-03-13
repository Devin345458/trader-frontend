<template>
  <v-app>
    <v-main>
      <four-oh-four v-if="error.statusCode === 404" />
      <five-hundred v-else :error="error" />
    </v-main>
  </v-app>
</template>

<script>
import FourOhFour from '@/components/error/404'
import FiveHundred from '@/components/error/500'
export default {
  name: 'ErrorLayout',
  components: { FiveHundred, FourOhFour },
  layout () {
    return 'empty'
  },
  props: {
    error: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      pageNotFound: '404 Not Found',
      otherError: 'An error occurred'
    }
  },
  head () {
    const title = this.error.statusCode === 404 ? this.pageNotFound : this.otherError
    return {
      title
    }
  }
}
</script>

<style scoped>
h1 {
  font-size: 20px;
}
</style>
