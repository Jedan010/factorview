<script setup>
import { ref, watch, onMounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  groupData: {
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
      text: '分组收益',
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
      data: []
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
  if (!props.groupData || !props.groupData.values || !props.groupData.index) return

  const series = []
  const legendData = []
  // 处理分组数据
  props.groupData.values[0].forEach((_, i) => {
    const name = i < 10 ? `Group ${i + 1}` : 'LS Hedge'
    const color = i === 10 ? '#ff0000' : `hsl(${i * 36}, 80%, 50%)`
    
    series.push({
      name,
      type: 'line',
      data: calcNav(props.groupData.values.map(v => v[i])),
      lineStyle: {
        width: i === 10 ? 4 : 2,
        color
      },
      symbol: 'none'
    })
    
    legendData.push(name)
  })

  // 添加回撤曲线
  series.push({
    name: 'LS Hedge Drawdown',
    type: 'line',
    yAxisIndex: 1,
    data: calcDrawdown(calcNav(props.groupData.values.map(v => v[10]))),
    lineStyle: {
      width: 0
    },
    areaStyle: {
      color: 'rgba(255,0,0,0.3)'
    },
    symbol: 'none'
  })

  const option = {
    xAxis: {
      data: props.groupData.index
    },
    legend: {
      data: [...legendData, 'LS Hedge Drawdown']
    },
    series
  }

  myChart.setOption(option)
}

onMounted(() => {
  initChart()
  updateChart()
})

watch(() => props.groupData, () => {
  updateChart()
}, { deep: true })
</script>

<template>
  <div ref="chart" class="group-chart"></div>
</template>

<style scoped>
.group-chart {
  width: 100%;
  height: 700px;
}
</style>