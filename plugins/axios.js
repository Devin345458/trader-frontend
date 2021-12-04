export default function ({ app, $axios, redirect }) {
  $axios.onError(({ response, message }) => {
    if (!response) {
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject({ status: 500, data: { message } })
    }
    if (response && response.status === 401 && message === 'E_UNAUTHORIZED_ACCESS: Unauthorized access') {
      console.log('unauthorized response')
      app.$auth.reset()
      redirect('/login')
    }
    return Promise.reject(response)
  })
}
