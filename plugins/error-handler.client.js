// Lib imports
import Vue from 'vue'
const vue = new Vue()
export default (context, inject) => {
  const errorHandler = (status, message = 'Unknown Error', errors = false) => {
    if (status > 205) {
      if (message === 'canceled') { return true }
      if (errors) {
        errors.forEach((error) => {
          vue.$noty.error(error.field + '-' + error.message)
        })
      } else {
        vue.$noty.error(message)
      }
      return true
    }
    return false
  }

  inject('error', errorHandler)
  context.$error = errorHandler

  if (process.env.NODE_ENV === 'development') {
    Vue.config.errorHandler = (err, vm, info, ...rest) => {
      console.error(err.message, info)
    }
  }
}
