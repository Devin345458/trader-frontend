export default function ({ $auth }) {
  $auth.onRedirect((to, from) => {
    // you can optionally change `to` by returning a new value
  })
}
