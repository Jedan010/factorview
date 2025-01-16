<script setup>
import { computed } from 'vue'

const props = defineProps({
  groupData: {
    type: Object,
    required: true
  },
})

function calcPerf(dailyReturns) {
  // 计算累计净值
  const nav = [1.0]
  for (let i = 0; i < dailyReturns.length; i++) {
    nav.push(nav[i] * (1 + dailyReturns[i]))
  }
  
  // 计算各项指标
  const cumulativeReturn = nav[nav.length - 1] - 1
  const annualizedReturn = Math.pow(1 + cumulativeReturn, 252 / dailyReturns.length) - 1
  const annualizedVolatility = Math.sqrt(252) * Math.sqrt(dailyReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / dailyReturns.length)
  
  // 计算最大回撤
  let currentMax = nav[0]
  const drawdowns = [0]
  for (let i = 1; i < nav.length; i++) {
    if (nav[i] > currentMax) {
      currentMax = nav[i]
    }
    drawdowns.push(nav[i] / currentMax - 1)
  }
  const maxDrawdown = Math.min(...drawdowns)
  
  // 计算比率
  const sharpeRatio = annualizedVolatility !== 0 ? annualizedReturn / annualizedVolatility : 0
  const calmarRatio = maxDrawdown !== 0 ? annualizedReturn / Math.abs(maxDrawdown) : 0

  return {
    cumulativeReturn,
    annualizedReturn,
    annualizedVolatility,
    maxDrawdown,
    sharpeRatio,
    calmarRatio
  }
}

const stats = computed(() => {
  if (!props.groupData || !props.groupData.values || !props.groupData.values[0] || !props.groupData.index) {
    return []
  }
  console.log(props.groupData)
  try {
    return props.groupData.values[0].map((_, i) => {
      const groupReturns = props.groupData.values.map(v => v[i])
      const perfStats = calcPerf(groupReturns)

      return {
        group: i < 10 ? `Group ${i + 1}` : 'LS Hedge',
        startDate: props.groupData.index[0],
        endDate: props.groupData.index.at(-1),
        cumulativeReturn: perfStats.cumulativeReturn,
        annualizedReturn: perfStats.annualizedReturn,
        annualizedVolatility: perfStats.annualizedVolatility,
        maxDrawdown: perfStats.maxDrawdown,
        sharpeRatio: perfStats.sharpeRatio,
        calmarRatio: perfStats.calmarRatio
      }
    })
  } catch (error) {
    console.error('Error calculating group stats:', error)
    return []
  }
})
</script>

<template>
  <div class="group-stats-table">
    <table>
      <thead>
        <tr>
          <th>分组</th>
          <th>开始日期</th>
          <th>结束日期</th>
          <th>累计收益</th>
          <th>年化收益</th>
          <th>年化波动率</th>
          <th>最大回撤</th>
          <th>夏普比率</th>
          <th>卡玛比率</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(stat, index) in stats" :key="index" :class="{ 'ls-hedge': index === 10 }">
          <td>{{ stat.group }}</td>
          <td>{{ stat.startDate }}</td>
          <td>{{ stat.endDate }}</td>
          <td>{{ (stat.cumulativeReturn * 100).toFixed(2) }}%</td>
          <td>{{ (stat.annualizedReturn * 100).toFixed(2) }}%</td>
          <td>{{ (stat.annualizedVolatility * 100).toFixed(2) }}%</td>
          <td>{{ (stat.maxDrawdown * 100).toFixed(2) }}%</td>
          <td>{{ stat.sharpeRatio.toFixed(2) }}</td>
          <td>{{ stat.calmarRatio.toFixed(2) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.group-stats-table {
  @extend .data-table;
  margin-top: 2rem;
  border-radius: 12px;
  overflow-x: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 1rem;

  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;

    th,
    td {
      padding: 1rem;
      text-align: center;
      border-bottom: 1px solid #e2e8f0;
      font-size: 1rem;
      transition: all 0.2s ease;
    }

    th {
      background: white;
      color: #2c3e50;
      font-weight: 600;
      position: sticky;
      top: 0;
      z-index: 2;
      border-bottom: 2px solid #e2e8f0;
      white-space: nowrap;

      &:hover {
        background: #f1f5f9;
      }
    }

    tr {
      transition: all 0.2s ease;
      transform-origin: center;

      &:nth-child(even) {
        background: #f8f9fa;
      }

      &:hover {
        background: #e2e8f0;
        transform: scale(1.01);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      &.ls-hedge {
        background-color: #fff0f0;
        font-weight: 500;

        &:hover {
          background: #ffe2e2;
        }
      }

      &:last-child td {
        border-bottom: none;
      }
    }

    td {
      transition: all 0.2s ease;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 1px;
        background: #e2e8f0;
        transform: scaleX(0);
        transform-origin: right;
        transition: transform 0.3s ease;
      }

      &:hover::after {
        transform: scaleX(1);
        transform-origin: left;
      }
    }
  }

  &.dark-mode {
    background: #2d2d2d;

    table {
      th {
        background: #2d2d2d;
        color: #ffffff;
      }

      tr {
        &:nth-child(even) {
          background: #3d3d3d;
        }

        &:hover {
          background: #4a5568;
        }

        &.ls-hedge {
          background-color: #4a1a1a;

          &:hover {
            background: #742a2a;
          }
        }
      }
    }
  }
}
</style>
