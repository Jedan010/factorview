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

        <button class="apply-btn" @click="fetchFactors">应用筛选</button>
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
              <th @click="sortTable('name')">因子名称</th>
              <th @click="sortTable('startDate')">起始日期</th>
              <th @click="sortTable('endDate')">结束日期</th>
              <th @click="sortTable('ic')">IC</th>
              <th @click="sortTable('icir')">ICIR</th>
              <th @click="sortTable('longShort')">多空</th>
              <th @click="sortTable('excessAnnualReturn')">超额年化收益率</th>
              <th @click="sortTable('excessMaxDrawdown')">超额最大回撤</th>
              <th @click="sortTable('sharpeRatio')">夏普比率</th>
              <th @click="sortTable('annualTurnover')">年双边换手</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(factor, index) in sortedFactors" :key="index">
              <td>
                <router-link :to="`/factor/${factor.name}`" class="factor-link">
                  {{ factor.name }}
                </router-link>
              </td>
              <td>{{ formatDate(factor.startDate) }}</td>
              <td>{{ formatDate(factor.endDate) }}</td>
              <td>{{ formatNumber(factor.ic, 3) }}</td>
              <td>{{ formatNumber(factor.icir, 3) }}</td>
              <td>{{ formatPercent(factor.longShort) }}</td>
              <td>{{ formatPercent(factor.excessAnnualReturn) }}</td>
              <td>{{ formatPercent(factor.excessMaxDrawdown) }}</td>
              <td>{{ formatNumber(factor.sharpeRatio) }}</td>
              <td>{{ formatNumber(factor.annualTurnover, 1) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { getFactors } from '@/api/factor';
import DatePicker from 'vue-datepicker-next';
import 'vue-datepicker-next/index.css';
import moment from 'moment';

export default {
  components: {
    DatePicker
  },
  name: 'FactorInfo',
  data() {
    return {
      factors: [],
      filters: {
        pool: 'all',
        period: 'all',
        benchmark: '000905.SH',
        optimizer: '000905.SH',
        startDate: null,
        endDate: null
      },
      sortKey: 'name',
      sortOrder: 'asc',
      isLoading: false,
      error: null,
      isDarkMode: false,
    };
  },
  computed: {
    sortedFactors() {
      return [...this.factors].sort((a, b) => {
        const valA = a[this.sortKey];
        const valB = b[this.sortKey];

        if (typeof valA === 'string') {
          return this.sortOrder === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        return this.sortOrder === 'asc'
          ? valA - valB
          : valB - valA;
      });
    }
  },
  methods: {
    getDateRange(period) {
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
    },

    async fetchFactors() {
      this.isLoading = true;
      this.error = null;

      try {
        const dateRange = this.getDateRange(this.filters.period);
        const params = {
          pool: this.filters.pool,
          benchmark_index: this.filters.benchmark,
          optimizer_index: this.filters.optimizer,
          start_date: this.filters.period === 'all'
            ? (this.filters.startDate ? moment(this.filters.startDate).format('YYYY-MM-DD') : null)
            : (dateRange.startDate ? moment(dateRange.startDate).format('YYYY-MM-DD') : null),
          end_date: this.filters.period === 'all'
            ? (this.filters.endDate ? moment(this.filters.endDate).format('YYYY-MM-DD') : null)
            : (dateRange.endDate ? moment(dateRange.endDate).format('YYYY-MM-DD') : null)
        };

        const response = await getFactors(params);
        this.factors = this.processFactorData(response);
      } catch (error) {
        console.error('Error fetching factors:', error);
        this.error = '数据加载失败，请稍后重试';
      } finally {
        this.isLoading = false;
      }
    },
    processFactorData(data) {
      return data.factor_info.index.map((name, index) => ({
        name,
        startDate: data.date.values.min[index],
        endDate: data.date.values.max[index],
        ic: data.ic.values.ic[index],
        icir: data.ic.values.icir[index],
        longShort: data.group.values.long_short_ret[index],
        excessAnnualReturn: data.backtest_ret.values.annual_return[index],
        excessMaxDrawdown: data.backtest_ret.values.max_drawdown[index],
        sharpeRatio: data.backtest_ret.values.sharpe_ratio[index],
        annualTurnover: data.backtest_ret.values.turnover[index]
      }));
    },
    sortTable(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = key;
        this.sortOrder = 'asc';
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
    formatNumber(value, decimals = 2) {
      return Number(value).toFixed(decimals);
    },
    formatPercent(value) {
      return `${(Number(value) * 100).toFixed(2)}%`;
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
  @extend .factor-base-container;
}
</style>
