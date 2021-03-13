import * as fc from 'd3fc'
export default (context, inject) => {
  inject('fc', fc)
  context.$fc = fc
}
