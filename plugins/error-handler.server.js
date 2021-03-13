// Lib imports
export default (context, inject) => {
  const errorHandler = (status, message = 'Unknown Error', errors = []) => {
    if (status !== 200) {
      if (message === 'Route Changed') { return true }
      if (status === 422) {
        errors.map((error) => {
          throw new Error(`${error.title} - ${error.detail}`)
        })
      } else {
        throw new Error(message)
      }
      return true
    }
    return false
  }
  inject('error', errorHandler)
  context.$error = errorHandler
}
