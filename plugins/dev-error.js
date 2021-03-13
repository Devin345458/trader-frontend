export default function ({ app }) {
  if (!process.env.production) {
    app.nuxt.error = () => {}
    app.nuxt.err = false
  }
}
