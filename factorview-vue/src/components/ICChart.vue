<script setup>
import { ref, watch, onMounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  icData: {
    type: Object,
    required: true,
    validator: value => {
      return Array.isArray(value?.index) && 
             Array.isArray(value?.values) &&
             value.values.every(v => Array.isArray(v) && v.length === 2)
    }
  }
})

const chartRef = ref(null)
let chartInstance = null

function initChart() {
  if (!chartRef.value || !props.icData?.index) return
  
  chartInstance = echarts.init(chartRef.value)
  
  const option = {
    title: {
      text: 'IC序列',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: props.icData.index,
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      name: 'IC值'
    },
    series: [
      {
        name: 'IC',
        type: 'bar',
        data: props.icData.values.map(v => v[0]),
        barMaxWidth: 20,
        itemStyle: {
          color: '#1a73e8'
        }
      },
      {
        name: 'IC_MEAN(252)',
        type: 'line',
        data: props.icData.values.map(v => v[1]),
        showSymbol: false,
        lineStyle: {
          color: '#ff9900',
          width: 3
        }
      }
    ],
    legend: {
      bottom: 10,
      data: ['IC', 'IC_MEAN(252)']
    }
  }
  
  chartInstance.setOption(option)
}

function updateChart() {
  if (!chartInstance) return
  
  const option = {
    xAxis: {
      data: props.icData.index
    },
    series: [
      { data: props.icData.values.map(v => v[0]) },
      { data: props.icData.values.map(v => v[1]) }
    ]
  }
  
  chartInstance.setOption(option)
}

function resizeChart() {
  chartInstance?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

watch(() => props.icData, () => {
  updateChart()
}, { deep: true })
</script>

<template>
  <div ref="chartRef" class="ic-chart"></div>
</template>

<style scoped>
.ic-chart {
  width: 100%;
  height: 500px;
}
</style>
