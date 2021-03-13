export default {
  methods: {
    findGetParameter (parameterName) {
      let result = null; let tmp = []
      location.search
        .substr(1)
        .split('&')
        .forEach(function (item) {
          tmp = item.split('=')
          if (tmp[0] === parameterName) { result = decodeURIComponent(tmp[1]) }
        })
      return result
    },
    redirect (url) {
      window.location.href = url
    },
    newTab (url) {
      window.open(url)
    }
  }
}
