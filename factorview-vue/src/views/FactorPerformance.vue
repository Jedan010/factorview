<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getFactorPerf } from '@/api/factor'
import ICChart from '@/components/ICChart.vue'
import ICTables from '@/components/ICTables.vue'
import DatePicker from 'vue-datepicker-next'
import 'vue-datepicker-next/index.css'
import moment from 'moment'

const route = useRoute()
const factorName = ref(route.params.factorName)
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

const icData = ref(null)
const groupData = ref(null)
const backtestData = ref(null)

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

    const data = await getFactorPerf(factorName.value, params)
    
    icData.value = data.ic
    groupData.value = data.group
    backtestData.value = data.backtest_ret
    
  } catch (err) {
    error.value = err
    console.error('Error fetching factor data:', err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="factor-performance">
    <div class="header">
      <h1>{{ factorName }} 因子绩效</h1>
      <div class="header-controls">
        <router-link to="/factor" class="back-btn">返回因子列表</router-link>
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
            <span class="date-separator">  至  </span>
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
        <ICChart :icData="icData" />
        
        <ICTables :icData="icData" />

        <div class="chart-container">
          <h2>分组收益</h2>
          <!-- TODO: 实现分组收益图表 -->
        </div>

        <div class="chart-container">
          <h2>回测结果</h2>
          <!-- TODO: 实现回测结果图表 -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../assets/styles/base-factor';

.factor-performance {
  @extend .factor-base-container;

  .chart-container {
    margin-top: 2rem;
    padding: 1.5rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    h2 {
      margin-bottom: 1rem;
      color: #2c3e50;
      font-size: 1.5rem;
      font-weight: 600;
    }

    &.dark-mode {
      background: #2d2d2d;
      
      h2 {
        color: #ffffff;
      }
    }
  }
}
</style>
