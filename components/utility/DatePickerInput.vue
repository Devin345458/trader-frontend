<template>
  <v-dialog
    ref="dialog"
    v-model="modal2"
    :return-value.sync="internal_date"
    persistent
    width="290px"
    :disabled="disabled || readonly"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-text-field
        v-model="formattedDate"
        :prepend-icon="prependIcon"
        :label="label"
        :hide-detail="hideDetails"
        :placeholder="placeholder"
        :required="required"
        :rules="rules"
        readonly
        v-bind="attrs"
        v-on="on"
      />
    </template>
    <v-date-picker
      v-if="modal2"
      v-model="internal_date"
    >
      <v-spacer />
      <v-btn
        text
        color="primary"
        @click="modal2 = false"
      >
        Cancel
      </v-btn>
      <v-btn
        text
        color="primary"
        @click="$refs.dialog.save(internal_date)"
      >
        OK
      </v-btn>
    </v-date-picker>
  </v-dialog>
</template>

<script>
import moment from 'moment'
// Create Base Mixins and Define Custom Properties
export default {

  name: 'DatePickerInput',
  inheritAttrs: false,
  model: {
    prop: 'date'
  },
  props: {
    date: {
      type: String,
      default: null
    },
    readonly: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    prependIcon: {
      type: String,
      default: 'mdi-calendar'
    },
    hideDetails: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String
    },
    label: {
      type: String
    },
    required: {
      type: Boolean,
      default: false
    },
    rules: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      modal2: false,
      internal_date: null
    }
  },

  computed: {
    formattedDate () {
      if (!this.date) { return this.date }
      return moment(this.date).format('MMM Do Y')
    }
  },
  watch: {
    time (val) {
      if (val !== this.internal_date) {
        this.internal_date = this.date
      }
    },
    internal_date (val) {
      if (val !== this.time) {
        this.$emit('input', val)
      }
    }
  }
}
</script>

<style scoped>

</style>
