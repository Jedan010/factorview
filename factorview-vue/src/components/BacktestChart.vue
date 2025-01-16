<script setup>
import { ref, watch, onMounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  backtestData: {
    type: Object,
    required: true
  }
})

const chart = ref(null)
let myChart = null

function initChart() {
  myChart = echarts.init(chart.value)
  
  const option = {
    title: {
      text: '回测收益',
      left: 'center',
      textStyle: {
        fontSize: 20,
        fontWeight: 'bold',
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: (params) => {
        let res = `${params[0].axisValue}<br>`
        params.forEach(item => {
          let value = item.value
          if (item.seriesName.includes('Drawdown')) {
            value = (value * 100).toFixed(2) + '%'
          } else {
            value = value.toFixed(4)
          }
          res += `${item.seriesName}: ${value}<br>`
        })
        return res
      }
    },
    legend: {
      bottom: 10,
      data: ['Strategy', 'Index', 'Excess', 'Drawdown']
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: []
    },
    yAxis: [
      {
        type: 'value',
        name: '收益率',
        scale: true,
        axisLabel: {
          formatter: (value) => value.toFixed(2)
        }
      },
      {
        type: 'value',
        name: '回撤',
        axisLabel: {
          formatter: (value) => (value * 100).toFixed(1) + '%'
        },
        splitLine: {
          show: false
        }
      }
    ],
    series: []
  }

  myChart.setOption(option)
}

function calcNav(returns) {
  let nav = 1
  return returns.map(ret => {
    nav *= (1 + ret)
    return nav
  })
}

function calcDrawdown(returns) {
  let max = 1
  return returns.map(ret => {
    max = Math.max(max, ret)
    return ((ret - max) / max)
  })
}

function updateChart() {
  if (!props.backtestData || !props.backtestData.values || !props.backtestData.index) return

  const series = [
    {
      name: 'Strategy',
      type: 'line',
      data: calcNav(props.backtestData.values.map(v => v[0])),
      lineStyle: {
        width: 2,
        color: '#1a73e8'
      },
      symbol: 'none'
    },
    {
      name: 'Index',
      type: 'line',
      data: calcNav(props.backtestData.values.map(v => v[1])),
      lineStyle: {
        width: 2,
        color: '#00b050'
      },
      symbol: 'none'
    },
    {
      name: 'Excess',
      type: 'line',
      data: calcNav(props.backtestData.values.map(v => v[2])),
      lineStyle: {
        width: 4,
        color: '#ff0000'
      },
      symbol: 'none'
    },
    {
      name: 'Drawdown',
      type: 'line',
      yAxisIndex: 1,
      data: calcDrawdown(calcNav(props.backtestData.values.map(v => v[2]))),
      lineStyle: {
        width: 0
      },
      areaStyle: {
        color: 'rgba(255,0,0,0.3)'
      },
      symbol: 'none'
    }
  ]

  const option = {
    xAxis: {
      data: props.backtestData.index
    },
    series
  }

  myChart.setOption(option)
}

onMounted(() => {
  initChart()
  updateChart()
})

watch(() => props.backtestData, () => {
  updateChart()
}, { deep: true })
</script>

<template>
  <div ref="chart" class="backtest-chart"></div>
</template>

<style scoped>
.backtest-chart {
  width: 100%;
  height: 700px;
}
</style>