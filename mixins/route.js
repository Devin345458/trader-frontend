export default {
  computed: {
    route_base () {
      if (this.$auth.user.active_store) {
        return '/' + this.$auth.user.active_store
      } else {
        return ''
      }
    }
  }
}
