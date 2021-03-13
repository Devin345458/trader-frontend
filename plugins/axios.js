export default function ({ app, $axios, redirect }) {
  $axios.onError(({ response, message }) => {
    if (!response) {
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject({ status: 500, data: { message } })
    }
    if (response && response.status === 401 && (message === 'Not Logged In' || message === 'No identity found. You can skip this check by configuring  `requireIdentity` to be `false`.')) {
      app.$auth.reset()
      redirect('/login')
    }
    return Promise.reject(response)
  })
}
