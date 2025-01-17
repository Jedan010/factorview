<template>
  <div class="strategy-info-container" :class="{ 'dark-mode': isDarkMode }">
    <div class="header">
      <h1>策略信息</h1>
      <div class="header-controls">
        <button class="theme-toggle" @click="toggleDarkMode">
          <span class="theme-icon">
            {{ isDarkMode ? 'Dark Mode' : 'Light Mode' }}
          </span>
        </button>
        <router-link to="/" class="back-btn">返回主页</router-link>
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
          </select>
        </div>

        <button class="apply-btn" @click="fetchStrategies">应用筛选</button>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-if="isLoading">
        <div class="loading-indicator">
          <div class="loader"></div>
          数据加载中...
        </div>
      </div>

      <div class="data-table">
        <table>
          <thead>
            <tr>
              <th @click="sortTable('id')">策略ID</th>
              <th @click="sortTable('benchmark')">基准指数</th>
              <th @click="sortTable('optimizer')">优化器</th>
              <th @click="sortTable('pool')">股票池</th>
              <th @click="sortTable('status')">状态</th>
              <th @click="sortTable('insertTime')">插入时间</th>
              <th @click="sortTable('updateTime')">更新时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(strategy, index) in sortedStrategies" :key="index">
              <td>
                <router-link :to="`/strategy/${strategy.id}`" class="strategy-link">
                  {{ strategy.id }}
                </router-link>
              </td>
              <td>{{ strategy.benchmark }}</td>
              <td>{{ strategy.optimizer }}</td>
              <td>{{ strategy.pool }}</td>
              <td>{{ strategy.status }}</td>
              <td>{{ formatDate(strategy.insertTime) }}</td>
              <td>{{ formatDate(strategy.updateTime) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getStrategy } from '@/api/strategy'
import moment from 'moment'

// 状态管理
const strategies = ref([])
const filters = ref({
  pool: 'all',
  benchmark: '000905.SH',
  optimizer: '000905.SH'
})
const sortKey = ref('id')
const sortOrder = ref('asc')
const isLoading = ref(false)
const error = ref(null)
const isDarkMode = ref(false)

// 计算属性
const sortedStrategies = computed(() => {
  return [...strategies.value].sort((a, b) => {
    const valA = a[sortKey.value]
    const valB = b[sortKey.value]

    if (typeof valA === 'string') {
      return sortOrder.value === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA)
    }

    return sortOrder.value === 'asc'
      ? valA - valB
      : valB - valA
  })
})

// 方法
async function fetchStrategies() {
  isLoading.value = true
  error.value = null

  try {
    const params = {
      pool: filters.value.pool,
      benchmark_index: filters.value.benchmark,
      optimizer_index: filters.value.optimizer
    }

    const response = await getStrategy(params)
    strategies.value = processStrategyData(response)
  } catch (err) {
    console.error('Error fetching strategies:', err)
    error.value = '数据加载失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

function processStrategyData(data) {
  if (!data?.strategy_info?.index) {
    throw new Error('Invalid strategy data format')
  }

  return data.strategy_info.index.map((id, index) => ({
    id,
    benchmark: data.strategy_info.values.benchmark_index[index],
    optimizer: data.strategy_info.values.optimizer_index[index],
    pool: data.strategy_info.values.pool[index],
    status: data.strategy_info.values.status[index],
    insertTime: data.strategy_info.values.insert_time[index],
    updateTime: data.strategy_info.values.update_time[index]
  }))
}

function sortTable(key) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

function formatDate(date) {
  return moment(date).format('YYYY-MM-DD HH:mm')
}

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.classList.toggle('dark', isDarkMode.value)
}

// 初始化加载
fetchStrategies()
</script>

<style scoped lang="scss">
@use '../assets/styles/base-factor';

.strategy-info-container {
  @extend .base-container;
}
</style>
