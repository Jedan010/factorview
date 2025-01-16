<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getStrategyPerf, getStrategyFactorPerf } from '@/api/strategy'
import BacktestChart from '@/components/BacktestChart.vue'
import BacktestStatsTable from '@/components/BacktestStatsTable.vue'
import FactorTable from '@/components/FactorTable.vue'
import DatePicker from 'vue-datepicker-next'
import 'vue-datepicker-next/index.css'
import moment from 'moment'

// 计算NAV的函数
function calcNav(dailyReturns) {
  let nav = [1.0]; // 初始净值为1
  for (let i = 0; i < dailyReturns.length; i++) {
    nav.push(nav[i] * (1 + dailyReturns[i]));
  }
  return nav;
}

// 计算回撤
function calcDrawdown(ret) {
  const nav = calcNav(ret);
  const dd = [];
  if (nav.length === 0) return dd;

  let currentMax = nav[0];
  dd.push(0); // 第一个回撤为0

  for (let i = 1; i < nav.length; i++) {
    if (nav[i] > currentMax) {
      currentMax = nav[i];
    }
    const drawdownValue = nav[i] / currentMax - 1;
    dd.push(drawdownValue);
  }
  return dd;
}

// 计算年化收益率
function calcAnnualizedReturn(dailyReturns) {
  if (dailyReturns.length === 0) return 0;
  const totalReturn = calcNav(dailyReturns).slice(-1)[0] - 1;
  return Math.pow(1 + totalReturn, 252 / dailyReturns.length) - 1;
}

// 计算年化波动率
function calcAnnualizedVolatility(dailyReturns) {
  if (dailyReturns.length === 0) return 0;
  return Math.sqrt(252) * Math.sqrt(dailyReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / dailyReturns.length);
}

// 计算夏普比率
function calcSharpeRatio(dailyReturns) {
  const annualizedReturn = calcAnnualizedReturn(dailyReturns);
  const annualizedVol = calcAnnualizedVolatility(dailyReturns);
  return annualizedVol !== 0 ? annualizedReturn / annualizedVol : 0;
}

// 计算卡玛比率
function calcCalmarRatio(dailyReturns) {
  const annualizedReturn = calcAnnualizedReturn(dailyReturns);
  const maxDrawdown = Math.min(...calcDrawdown(dailyReturns));
  return maxDrawdown !== 0 ? annualizedReturn / Math.abs(maxDrawdown) : 0;
}

// 汇总计算所有绩效指标
function calcPerf(dailyReturns) {
  return {
    cumulativeReturn: calcNav(dailyReturns).slice(-1)[0] - 1,
    annualizedReturn: calcAnnualizedReturn(dailyReturns),
    annualizedVolatility: calcAnnualizedVolatility(dailyReturns),
    maxDrawdown: Math.min(...calcDrawdown(dailyReturns)),
    sharpeRatio: calcSharpeRatio(dailyReturns),
    calmarRatio: calcCalmarRatio(dailyReturns)
  };
}

const isDarkMode = ref(false)
function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.classList.toggle('dark', isDarkMode.value)
}

const route = useRoute()
const strategyName = ref(route.params.strategyName)

const filters = ref({
  pool: 'all',
  period: 'all',
  benchmark: '000905.SH',
  optimizer: '000905.SH',
  startDate: null,
  endDate: null
})

const loading = ref(false)
const error = ref(null)
const backtestData = ref(null)
const backtestStats = ref(null)
const factors = ref([])

function getDateRange(period) {
  const today = new Date()
  switch (period) {
    case 'ytd':
      return {
        startDate: new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      }
    case '3m':
      return {
        startDate: new Date(today.setMonth(today.getMonth() - 3)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      }
    case '1y':
      return {
        startDate: new Date(today.setFullYear(today.getFullYear() - 1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      }
    case '3y':
      return {
        startDate: new Date(today.setFullYear(today.getFullYear() - 3)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      }
    case '5y':
      return {
        startDate: new Date(today.setFullYear(today.getFullYear() - 5)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      }
    default:
      return {
        startDate: '',
        endDate: ''
      }
  }
}

onMounted(() => {
  filters.value.startDate = localStorage.getItem('startDate') || ''
  filters.value.endDate = localStorage.getItem('endDate') || ''
  fetchData()
})

watch(
  () => [filters.value.period, filters.value.startDate, filters.value.endDate],
  () => {
    localStorage.setItem('startDate', filters.value.startDate)
    localStorage.setItem('endDate', filters.value.endDate)
    fetchData()
  }
)

async function fetchData() {
  try {



    loading.value = true
    error.value = null

    const dateRange = getDateRange(filters.value.period)
    const params = {
      pool: filters.value.pool,
      benchmark_index: filters.value.benchmark,
      optimizer_index: filters.value.optimizer,
      start_date: filters.value.period === 'all'
        ? (filters.value.startDate ? moment(filters.value.startDate).format('YYYY-MM-DD') : null)
        : (dateRange.startDate ? moment(dateRange.startDate).format('YYYY-MM-DD') : null),
      end_date: filters.value.period === 'all'
        ? (filters.value.endDate ? moment(filters.value.endDate).format('YYYY-MM-DD') : null)
        : (dateRange.endDate ? moment(dateRange.endDate).format('YYYY-MM-DD') : null)
    }


    const strategyPerf = await getStrategyPerf(strategyName.value, params)
    const factorPerf = await getStrategyFactorPerf(strategyName.value, params)

    backtestData.value = strategyPerf.backtest_ret
  } catch (err) {
    error.value = err
    console.error('Error fetching factor data:', err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="strategy-performance" :class="{ 'dark-mode': isDarkMode }">
    <div class="header">
      <h1>{{ strategyName }} 策略表现</h1>
      <div class="header-controls">
        <button class="theme-toggle" @click="toggleDarkMode">
          <span class="theme-icon">
            {{ isDarkMode ? 'Dark Mode' : 'Light Mode' }}
          </span>
        </button>
        <router-link to="/strategy" class="back-btn">返回策略列表</router-link>
      </div>
    </div>

    <div class="content">
      <div class="filters">
        <div class="filter-group">
          <label>股票池</label>
          <select v-model="filters.pool">
            <option value="all">全部</option>
            <option value="000300.SH">沪深300</option>
            <option value="000905.SH">中证500</option>
            <option value="000852.SH">中证1000</option>
            <option value="932000.CSI">中证2000</option>
          </select>
        </div>

        <div class="filter-group">
          <label>时间周期</label>
          <select v-model="filters.period">
            <option value="all">自定义</option>
            <option value="ytd">年初至今</option>
            <option value="3m">近3个月</option>
            <option value="1y">近1年</option>
            <option value="3y">近3年</option>
            <option value="5y">近5年</option>
          </select>
        </div>

        <div class="filter-group">
          <label>基准指数</label>
          <select v-model="filters.benchmark">
            <option value="000905.SH">中证500</option>
            <option value="000300.SH">沪深300</option>
            <option value="000852.SH">中证1000</option>
            <option value="932000.CSI">中证2000</option>
          </select>
        </div>

        <div class="filter-group">
          <label>优化器</label>
          <select v-model="filters.optimizer">
            <option value="000905.SH">中证500</option>
            <option value="000300.SH">沪深300</option>
            <option value="000852.SH">中证1000</option>
            <option value="932000.CSI">中证2000</option>
            <option value="NA">NA</option>
          </select>
        </div>

        <div class="filter-group">
          <label>日期范围</label>
          <div class="date-range-picker">
            <DatePicker v-model:value="filters.startDate" type="date" placeholder="开始日期" class="date-picker" />
            <span class="date-separator"> 至 </span>
            <DatePicker v-model:value="filters.endDate" type="date" placeholder="结束日期" class="date-picker" />
          </div>
        </div>

        <button class="apply-btn" @click="fetchData">应用筛选</button>
      </div>

      <div v-if="loading" class="loading-indicator">
        <div class="loader"></div>
        数据加载中...
      </div>

      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-else>
        <div class="chart-container">
          <h2>回测结果</h2>
          <BacktestChart :backtestData="backtestData" />
          <BacktestStatsTable :backtestData="backtestData" />
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../assets/styles/base-factor';


.strategy-performance {
  @extend .base-container;
}
</style>