import moment from 'moment'
export default {
  methods: {
    full_human_date (time) {
      const date = moment.parseZone(time)
      if (!date.isValid()) {
        return ''
      }
      return date.format('dddd, MMMM D, Y')
    },
    short_human_date (time) {
      const date = moment.parseZone(time)
      if (!date.isValid()) {
        return ''
      }
      return date.format('MMM D, Y')
    },
    day (time) {
      const date = moment.parseZone(time)
      if (!date.isValid()) {
        return ''
      }
      return date.format('dddd')
    },
    full_date_time (time) {
      const date = moment.parseZone(time)
      if (!date.isValid()) {
        return ''
      }
      return date.format('dddd, MMMM D, Y h:mm a')
    },
    short_date_time (time) {
      const date = moment(time)
      if (!date.isValid()) {
        return ''
      }
      return date.format('MMM D, Y h:mm a')
    },
    time_ago (time) {
      return moment.parseZone(time).fromNow()
    },
    calendar (time) {
      const date = moment.parseZone(time)
      if (!date.isValid()) {
        return 'Never'
      }
      return date.calendar(null, {
        sameDay: '[Today] [@] h:mma',
        nextDay: '[Tomorrow] [@] h:mma',
        nextWeek: 'dddd [@] h:mma',
        lastDay: '[Yesterday] [@] h:mma',
        lastWeek: '[Last] dddd [@] h:mma',
        sameElse: 'MMM D, Y h:mma'
      })
    }
  }
}
