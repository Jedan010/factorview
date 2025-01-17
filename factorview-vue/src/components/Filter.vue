<template>
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

    <button class="apply-btn" @click="applyFilters">应用筛选</button>
  </div>
</template>

<script>
import { ref } from 'vue';
import DatePicker from 'vue-datepicker-next';
import 'vue-datepicker-next/index.css';

export default {
  components: {
    DatePicker
  },
  emits: ['apply-filters'],
  setup(props, { emit }) {
    const filters = ref({
      pool: 'all',
      period: 'all',
      benchmark: '000905.SH',
      optimizer: '000905.SH',
      startDate: null,
      endDate: null
    });

    const getDateRange = (period) => {
      const today = new Date();
      switch (period) {
        case 'ytd':
          return {
            startDate: new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0]
          };
        case '3m':
          return {
            startDate: new Date(today.setMonth(today.getMonth() - 3)).toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0]
          };
        case '1y':
          return {
            startDate: new Date(today.setFullYear(today.getFullYear() - 1)).toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0]
          };
        case '3y':
          return {
            startDate: new Date(today.setFullYear(today.getFullYear() - 3)).toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0]
          };
        case '5y':
          return {
            startDate: new Date(today.setFullYear(today.getFullYear() - 5)).toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0]
          };
        default:
          return {
            startDate: null,
            endDate: null
          };
      }
    };

    const applyFilters = () => {
      const dateRange = getDateRange(filters.value.period);
      emit('apply-filters', {
        ...filters.value,
        ...dateRange
      });
    };

    return {
      filters,
      applyFilters
    };
  }
};
</script>

<style lang="scss">
@use '../assets/styles/base-factor';
</style>