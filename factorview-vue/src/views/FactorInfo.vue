<template>
  <div class="factor-info-container" :class="{ 'dark-mode': isDarkMode }">

    <div class="header">
      <h1>因子信息</h1>

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
      <FactorFilter @apply-filters="handleFiltersChange" />

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-if="isLoading">
        <div class="loading-indicator">
          <div class="loader"></div>
          数据加载中...
        </div>

      </div>

      <FactorStats :rawData="response" />

    </div>
  </div>
</template>

<script>
import { getFactors } from '@/api/factor';
import moment from 'moment';
import FactorFilter from '@/components/Filter.vue';
import FactorStats from '@/components/FactorStats.vue';

export default {
  components: {
    FactorFilter,
    FactorStats
  },
  name: 'FactorInfo',
  data() {
    return {
      factors: [],
      response: null,
      isLoading: false,
      error: null,
      isDarkMode: false,
      currentFilters: {
        pool: 'all',
        period: 'all',
        benchmark: '000905.SH',
        optimizer: '000905.SH',
        startDate: null,
        endDate: null
      }
    };
  },
  computed: {},
  methods: {

    handleFiltersChange(filters) {
      this.currentFilters = filters;
      this.fetchFactors();
    },

    async fetchFactors() {
      this.isLoading = true;
      this.error = null;

      try {
        const dateRange = this.currentFilters;
        const params = {
          pool: this.currentFilters.pool,
          benchmark_index: this.currentFilters.benchmark,
          optimizer_index: this.currentFilters.optimizer,
          start_date: this.currentFilters.period === 'all'
            ? (this.currentFilters.startDate ? moment(this.currentFilters.startDate).format('YYYY-MM-DD') : null)
            : (dateRange.startDate ? moment(dateRange.startDate).format('YYYY-MM-DD') : null),
          end_date: this.currentFilters.period === 'all'
            ? (this.currentFilters.endDate ? moment(this.currentFilters.endDate).format('YYYY-MM-DD') : null)
            : (dateRange.endDate ? moment(dateRange.endDate).format('YYYY-MM-DD') : null)
        };

        this.response = await getFactors(params);
      } catch (error) {
        console.error('Error fetching factors:', error);
        this.error = '数据加载失败，请稍后重试';
      } finally {
        this.isLoading = false;
      }
    },
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      document.documentElement.classList.toggle('dark', this.isDarkMode);
    }
  },
  mounted() {
    this.fetchFactors();
  }
};
</script>

<style scoped lang="scss">
@use '../assets/styles/base-factor';

.factor-info-container {
  @extend .base-container;
}
</style>
