export default {
  data () {
    return {
      rules: {
        required: [
          v => !!v || v === 0 || 'Field is required'
        ],
        name: [
          v => !!v || 'Name is required',
          // eslint-disable-next-line no-mixed-operators
          v => !!v && v.length <= 255 || 'Name must be less than 255 characters'
        ],
        email: [
          v => /.+@.+/.test(v) || 'E-mail must be valid',
          v => (v && v.length <= 255) || 'Email must be less than 255 characters'
        ],
        password: [
          v => !!v || 'Password is required',
          v => /[*@!#%&()^~{}]+/.test(v) || 'Password must contain 1 special character',
          v => /[A-Z]+/.test(v) || 'Password must contain at least 1 Uppercase character',
          v => /[a-z]+/.test(v) || 'Password must contain at least 1 Lowercase character',
          v => (v && v.length >= 6) || 'Password must be at least 6 characters',
          v => (v && v.length <= 255) || 'Password must be less than 255 characters'
        ],
        zip: [
          v => !!v || 'Zipcode is required',
          v => (v && v.length === 5) || 'Zipcode must be 5 digits'
        ],
        phone: [
          v => !!v || 'Phone Number is required',
          v => (v && v.length === 10) || 'Phone Number must be 11 digits'
        ]
      }
    }
  },
  methods: {
    confirmPasswordRules (val1, val2) {
      return [
        () => (val1 === val2) || 'Password must match',
        v => !!v || 'Confirmation Password is required'
      ]
    },
    requireRule (ruleName) {
      return this[ruleName].concat(this.rules.required)
    }
  }
}
