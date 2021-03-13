import * as d3 from 'd3'
export default (context, inject) => {
  inject('d3', d3)
  context.$d3 = d3
}
