import isEqual from 'lodash.isequal'
import transform from 'lodash.transform'
import isObject from 'lodash.isobject'
import size from 'lodash.size'
import cloneDeep from 'lodash.clonedeep'
import debounce from 'lodash.debounce'
import isEmpty from 'lodash.isempty'
export default {
  data () {
    return {
      changed_field: null,
      original: null,
      change_callback: undefined
    }
  },
  mounted () {
    if (this.changed_field) { this.original = cloneDeep(this[this.changed_field]) }
  },
  watch: {
    changed_field (val) {
      if (!val) { return }
      if (val) { this.original = cloneDeep(this[this.changed_field]) }
    },
    changed_values (newValue, oldValue) {
      if (isEqual(newValue, oldValue)) { return }
      if (!this.change_callback || typeof this.change_callback !== 'function') { return }
      if (isEmpty(this.changed_values)) { return }
      this.debouncedCallback(() => { this.change_callback(this.changed_values) })
    }
  },
  computed: {
    changed () {
      if (this.changed_field === null) { return }
      return size(this.changes(this[this.changed_field], this.original))
    },
    changed_values () {
      return this.changes(this[this.changed_field], this.original)
    }
  },
  methods: {
    debouncedCallback: debounce((callback) => {
      callback()
    }, 1000),
    changes (object, base) {
      return transform(object, (result, value, key) => {
        if (!isEqual(value, base[key])) {
          result[key] = (isObject(value) && isObject(base[key])) ? this.changes(value, base[key]) : { key, current: value, original: base[key] }
        }
      })
    },
    setOriginal (val) {
      this.original = cloneDeep(val)
      return true
    },
    resetOriginal () {
      if (!this.changed_field) { return false }
      this.original = cloneDeep(this[this.changed_field])
      return true
    },
    resetChanges () {
      this[this.changed_field] = cloneDeep(this.original)
      return true
    }
  }
}
