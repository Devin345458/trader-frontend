import moment from 'moment'
export default {
  filters: {
    full_human_time (time) {
      return moment(time).format('dddd, MMMM D, Y')
    },
    short_human_time (time) {
      return moment(time).format('MMM D, Y')
    }
  }
}
