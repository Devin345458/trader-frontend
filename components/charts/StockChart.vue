<template>
  <span>
    <div id="sim-chart" style="height: 500px" />
    <svg style="width: 0; height: 0">
      <defs>
        <linearGradient id="area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-opacity="0.3" stop-color="#fff" />
          <stop offset="100%" stop-opacity="0" stop-color="#1a9af9" />
        </linearGradient>
      </defs>
      <g id="active" transform="translate(-9.5-9.5)">
        <circle cx="9.5" cy="9.5" r="9.5" fill="#fff" />
        <path d="M19 9.5c0 5.2-4.3 9.5-9.5 9.5S0 14.7 0 9.5 4.3 0 9.5 0 19 4.3 19 9.5zm-.9 0c0-.4-.3-.7-.7-.7H16c-.4 0-.7.3-.7.7 0 .4.3.7.7.7h1.4c.3 0 .7-.3.7-.7zm-2.5-5c.3-.3.3-.7 0-1-.3-.3-.7-.3-1 0l-1 1c-.3.3-.3.7 0 1 .3.3.7.3 1 0l1-1zm-1.8 5c0-2.4-1.9-4.3-4.3-4.3S5.2 7.1 5.2 9.5s1.9 4.3 4.3 4.3 4.3-1.9 4.3-4.3zm-3.6-6.4V1.7c0-.4-.3-.7-.7-.7-.4 0-.7.3-.7.7v1.4c0 .4.3.7.7.7.4 0 .7-.3.7-.7zM5.5 5.5c.3-.3.3-.7 0-1l-1-1c-.3-.3-.7-.3-1 0s-.3.7 0 1l1 1c.2.2.7.2 1 0zM3.1 8.8H1.6c-.4 0-.7.3-.7.7 0 .4.3.7.7.7H3c.4 0 .7-.3.7-.7.1-.4-.2-.7-.6-.7zm.3 5.7c-.3.3-.3.7 0 1 .3.3.7.3 1 0l1-1c.3-.3.3-.7 0-1-.3-.3-.7-.3-1 0l-1 1zm5.4 1.4v1.4c0 .4.3.7.7.7.4 0 .7-.3.7-.7v-1.4c0-.4-.3-.7-.7-.7-.4 0-.7.3-.7.7zm4.7-2.4c-.3.3-.3.7 0 1l1 1c.3.3.7.3 1 0 .3-.3.3-.7 0-1l-1-1c-.2-.2-.7-.2-1 0z" />
      </g>
      <g id="post" transform="translate(-9.5-9.5)">
        <circle cx="9.5" cy="9.5" r="9.5" fill="#fff" />
        <path d="M9.5 19c5.2 0 9.5-4.3 9.5-9.5S14.7 0 9.5 0 0 4.3 0 9.5 4.3 19 9.5 19zM7.9 1.7c.6-.2 1.3-.3 2-.3C14.4 1.4 18 5 18 9.5s-3.6 8.1-8.1 8.1c-.7 0-1.4-.1-2-.3 3.5-.9 6.1-4.1 6.1-7.8 0-3.8-2.6-6.9-6.1-7.8z" fill-rule="evenodd" clip-rule="evenodd" />
      </g>
      <g id="pre" transform="translate(-9.5-9.5)">
        <circle cx="9.5" cy="9.5" r="9.5" fill="#fff" />
        <path d="M19 9.5c0 5.2-4.3 9.5-9.5 9.5S0 14.7 0 9.5 4.3 0 9.5 0 19 4.3 19 9.5zM14.3 14.3l-3.1-3.7c.2-.3.4-.7.4-1.1 0-.9-.6-1.7-1.5-1.9V2.3c0-.3-.2-.5-.5-.5s-.6.3-.6.5v5.2c-.9.2-1.5 1-1.5 1.9 0 1.1.9 2 2 2 .3 0 .6-.1.9-.2l3.2 3.7c.1.1.2.2.4.2.1 0 .2 0 .3-.1.1-.2.2-.5 0-.7z" />
      </g>
    </svg>
  </span>
</template>

<script>
export default {
  name: 'StockChart',
  props: {
    ticks: {
      type: Array,
      default: () => []
    },
    trades: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      height: '500px',
      width: '100%'
    }
  },
  computed: {
    chartTicks () {
      return this.ticks.map((d) => {
        d.date = new Date(d.time * 1000)
        return d
      }).sort((a, b) => b.date - a.date)
    },
    xScale () {
      return this.$fc.scaleDiscontinuous(this.$d3.scaleTime())
    },
    yScale () {
      return this.$d3.scaleLinear()
    },
    xExtent () {
      return this.$fc.extentTime().accessors([d => d.date])
    },
    yExtent () {
      return this.$fc.extentLinear().pad([0.1, 0.1]).accessors([d => d.close])
    },
    lineSeries () {
      return this.$fc.seriesSvgLine().mainValue(d => d.close).crossValue(d => d.date)
    },
    areaSeries () {
      return this.$fc.seriesSvgArea()
        .baseValue(() => this.yExtent(this.chartTicks)[0])
        .mainValue(d => d.close)
        .crossValue(d => d.date)
    },
    gridlines () {
      return this.$fc
        .annotationSvgGridline()
        .yTicks(5)
        .xTicks(0)
    },
    volumeSeries () {
      const volumeExtent = this.$fc.extentLinear().include([0]).pad([0, 2]).accessors([d => d.volume])
      const volumeDomain = volumeExtent(this.chartTicks)
      const volumeToPriceScale = this.$d3.scaleLinear().domain(volumeDomain).range(this.yExtent(this.chartTicks))

      return this.$fc
        .seriesSvgBar()
        .bandwidth(2)
        .crossValue(d => d.date)
        .mainValue(d => volumeToPriceScale(d.volume))
        .decorate(sel =>
          sel
            .enter()
            .classed('volume', true)
            .attr('fill', d => (d.open > d.close ? 'red' : 'green'))
        )
    }
  },
  mounted () {
    this.loadChart()
  },
  methods: {
    loadChart () {
      const multi = this.$fc.seriesSvgMulti().series([this.gridlines, this.areaSeries, this.lineSeries, this.volumeSeries])

      const zoom = this.$fc.zoom().on('zoom', this.chartRender)

      this.chart = this.$fc.chartCartesian(this.xScale, this.yScale)
        .yOrient('right')
        .yDomain(this.yExtent(this.chartTicks))
        .xDomain(this.xExtent(this.chartTicks))
        .decorate((sel) => {
          sel.enter()
            .selectAll('.plot-area')
            .call(zoom, this.xScale, this.yScale)
          sel.enter()
            .selectAll('.x-axis')
            .call(zoom, this.xScale, null)
          sel.enter()
            .selectAll('.y-axis')
            .call(zoom, null, this.yScale)
        })
        .svgPlotArea(multi)

      this.chartRender()
    },
    chartRender () {
      this.$d3.select('#sim-chart')
        .datum(this.chartTicks)
        .call(this.chart)
    }
  }
}
</script>

<style scoped>

</style>
