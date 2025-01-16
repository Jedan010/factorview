<script setup>
import { computed } from 'vue'

const props = defineProps({
  backtestData: {
    type: Object,
    required: true
  }
})

const stats = computed(() => {
  if (!props.backtestData || !props.backtestData.values || !props.backtestData.index) return []

  const backtestNames = ['Strategy', 'Index', 'Excess']
  const firstDate = new Date(props.backtestData.index[0])
  const lastDate = new Date(props.backtestData.index.at(-1))
  const totalYears = (lastDate - firstDate) / (1000 * 60 * 60 * 24 * 365)

  return backtestNames.map((name, i) => {
    const returns = props.backtestData.values.map(v => v[i])
    const perfStats = calcPerf(returns)
    
    // 计算持仓、换手率等指标
    const positions = props.backtestData.values.map(v => v[v.length - 3])
    const turnovers = props.backtestData.values.map(v => v[v.length - 2])
    const fees = props.backtestData.values.map(v => v[v.length - 1])

    const avgPosition = positions.reduce((a, b) => a + b, 0) / positions.length
    const annualTurnover = turnovers.reduce((a, b) => a + b, 0) / totalYears
    const annualFee = fees.reduce((a, b) => a + b, 0) / totalYears

    return {
      name,
      startDate: props.backtestData.index[0],
      endDate: props.backtestData.index.at(-1),
      totalYears: totalYears.toFixed(1),
      cumulativeReturn: (perfStats.cumulativeReturn * 100).toFixed(2) + '%',
      annualizedReturn: (perfStats.annualizedReturn * 100).toFixed(2) + '%',
      annualizedVolatility: (perfStats.annualizedVolatility * 100).toFixed(2) + '%',
      maxDrawdown: (perfStats.maxDrawdown * 100).toFixed(2) + '%',
      sharpeRatio: perfStats.sharpeRatio.toFixed(2),
      calmarRatio: perfStats.calmarRatio.toFixed(2),
      avgPosition: avgPosition.toFixed(0),
      annualTurnover: annualTurnover.toFixed(0),
      annualFee: (annualFee * 100).toFixed(2) + '%'
    }
  })
})

function calcPerf(returns) {
  // 计算累计净值
  const nav = [1.0]
  for (let i = 0; i < returns.length; i++) {
    nav.push(nav[i] * (1 + returns[i]))
  }
  
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

  // 计算其他指标
  const cumulativeReturn = nav[nav.length - 1] - 1
  const annualizedReturn = Math.pow(1 + cumulativeReturn, 252 / returns.length) - 1
  const annualizedVolatility = Math.sqrt(252) * Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / returns.length)
  
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
</script>

<template>
  <div class="backtest-stats-table">
    <table>
      <thead>
        <tr>
          <th>策略</th>
          <th>开始日期</th>
          <th>结束日期</th>
          <th>总年数</th>
          <th>累计收益</th>
          <th>年化收益</th>
          <th>年化波动</th>
          <th>最大回撤</th>
          <th>夏普比率</th>
          <th>卡玛比率</th>
          <th>平均持仓</th>
          <th>年化换手</th>
          <th>年交易费率</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="stat in stats" :key="stat.name" :class="{ 'excess-row': stat.name === 'Excess' }">
          <td>{{ stat.name }}</td>
          <td>{{ stat.startDate }}</td>
          <td>{{ stat.endDate }}</td>
          <td>{{ stat.totalYears }}</td>
          <td>{{ stat.cumulativeReturn }}</td>
          <td>{{ stat.annualizedReturn }}</td>
          <td>{{ stat.annualizedVolatility }}</td>
          <td>{{ stat.maxDrawdown }}</td>
          <td>{{ stat.sharpeRatio }}</td>
          <td>{{ stat.calmarRatio }}</td>
          <td>{{ stat.avgPosition }}</td>
          <td>{{ stat.annualTurnover }}</td>
          <td>{{ stat.annualFee }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.backtest-stats-table {
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

      &.excess-row {
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

        &.excess-row {
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