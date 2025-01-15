<template>
  <div class="factor-info-container" :class="{ 'dark-mode': isDarkMode }">
    <div class="header">
      <h1>因子信息</h1>
      <div class="header-controls">
        <button class="theme-toggle" @click="toggleDarkMode">
          <span class="theme-icon" :class="{ 'sun': isDarkMode, 'moon': !isDarkMode }">
            {{ isDarkMode ? '☀️' : '🌙' }}
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

        <div class="skeleton-loader">
          <div class="skeleton-row" v-for="n in 5" :key="n">
            <div class="skeleton-cell"></div>
            <div class="skeleton-cell"></div>
            <div class="skeleton-cell"></div>
            <div class="skeleton-cell"></div>
            <div class="skeleton-cell"></div>
            <div class="skeleton-cell"></div>
            <div class="skeleton-cell"></div>
            <div class="skeleton-cell"></div>
            <div class="skeleton-cell"></div>
            <div class="skeleton-cell"></div>
          </div>
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
        startDate: '',
        endDate: ''
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
            startDate: '',
            endDate: ''
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
.factor-info-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
  transition: background-color 0.5s ease, color 0.3s ease;

  * {
    transition: background-color 0.3s ease, color 0.2s ease, border-color 0.3s ease;
  }

  &.dark-mode {
    background: #1a1a1a;
    color: #ffffff;

    .header {
      background: #2d2d2d;
      color: #ffffff;

      h1 {
        color: #ffffff;
      }

      .back-btn {
        background: linear-gradient(145deg, #4a5568, #2d3748);
      }
    }

    .filters {
      background: #2d2d2d;
      color: #ffffff;

      label {
        color: #e2e8f0;
      }

      select,
      input {
        background: #3d3d3d;
        border-color: #4a5568;
        color: #ffffff;

        &:focus {
          border-color: #63b3ed;
          box-shadow: 0 0 0 3px rgba(99, 179, 237, 0.1);
        }
      }

      .apply-btn {
        background: linear-gradient(145deg, #4a5568, #2d3748);
      }
    }

    .filter-group {
      .date-range-picker {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .date-picker {
          flex: 1;
          min-width: 120px;

          :deep(.mx-input-wrapper) {
            height: 100%;

            .mx-input {
              height: 100%;
              padding: 0.5rem;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
              background: white;
              color: #4a5568;
              font-size: 0.9rem;
              transition: all 0.2s ease;

              &:hover {
                border-color: #3498db;
              }

              &:focus {
                outline: none;
                border-color: #3498db;
                box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
              }
            }
          }
        }

        .date-separator {
          color: #4a5568;
          font-size: 0.9rem;
          padding: 0 0.5rem;
        }
      }
    }

    .data-table {
      background: #2d2d2d;

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
      }

      .factor-link {
        color: #63b3ed;

        &:hover {
          color: #4299e1;
        }
      }
    }

    .loading-indicator {
      color: #e2e8f0;
    }

    .error-message {
      background: #4a1a1a;
      color: #fc8181;
      border-color: #742a2a;
    }
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: var(--header-bg);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease, background 0.3s ease;

    .header-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    &:hover {
      transform: translateY(-2px);
    }

    h1 {
      font-size: 2rem;
      color: #2c3e50;
      font-weight: 600;
      margin: 0;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 0;
        width: 60px;
        height: 3px;
        background: #3498db;
        border-radius: 2px;
      }
    }

    .back-btn {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(145deg, #3498db, #2980b9);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 2px 4px rgba(52, 152, 219, 0.2);

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
      }
    }
  }

  .filters {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    align-items: flex-end;

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      label {
        font-weight: 500;
        color: #4a5568;
        font-size: 0.9rem;
      }

      select,
      input {
        padding: 0.5rem;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        background: white;
        color: #4a5568;
        transition: all 0.2s ease;
        font-size: 0.9rem;
        min-width: 0;

        &:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }
      }
    }

    .apply-btn {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(145deg, #3498db, #2980b9);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      align-self: flex-end;
      font-weight: 500;
      box-shadow: 0 2px 4px rgba(52, 152, 219, 0.2);

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
      }
    }
  }

  .data-table {
    background: white;
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

        &.sorted-asc::after {
          content: ' ▲';
          color: #3498db;
        }

        &.sorted-desc::after {
          content: ' ▼';
          color: #3498db;
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

        &:last-child td {
          border-bottom: none;
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

      .factor-link {
        color: #3498db;
        text-decoration: none;
        font-weight: 500;
        transition: all 0.2s ease;

        &:hover {
          color: #2980b9;
          text-decoration: underline;
        }
      }
    }
  }

  .loading-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 2rem;
    color: #4a5568;
    animation: fadeIn 0.3s ease;

    .loader {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid #e2e8f0;
      border-top-color: #3498db;
      animation: spin 1s linear infinite;
    }
  }

  .skeleton-loader {
    width: 100%;
    padding: 1rem;
    background: white;
    border-radius: 12px;

    .skeleton-row {
      display: flex;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid #e2e8f0;

      &:last-child {
        border-bottom: none;
      }

      .skeleton-cell {
        flex: 1;
        height: 20px;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        border-radius: 4px;
        animation: skeleton-loading 1.5s infinite;

        &:first-child {
          flex: 2;
        }

        &:nth-child(2),
        &:nth-child(3) {
          flex: 1.5;
        }
      }
    }
  }

  &.dark-mode {
    .skeleton-loader {
      background: #2d2d2d;

      .skeleton-row {
        border-bottom-color: #4a5568;

        .skeleton-cell {
          background: linear-gradient(90deg, #3d3d3d 25%, #4a5568 50%, #3d3d3d 75%);
        }
      }
    }
  }

  @keyframes skeleton-loading {
    0% {
      background-position: 200% 0;
    }

    100% {
      background-position: -200% 0;
    }
  }

  .error-message {
    background: #fff5f5;
    color: #e53e3e;
    padding: 1rem;
    border-radius: 8px;
    margin: 1rem 0;
    border: 1px solid #fed7d7;
    box-shadow: 0 2px 4px rgba(229, 62, 62, 0.1);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .factor-info-container {
    padding: 1rem;
    overflow-x: hidden;

    .header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;

      h1 {
        font-size: 1.5rem;
      }

      .back-btn {
        width: 100%;
        justify-content: center;
      }
    }

    .filters {
      grid-template-columns: 1fr;
      padding: 1rem;
      gap: 1rem;

      .apply-btn {
        width: 100%;
      }
    }

    .data-table {
      padding: 0.5rem;

      table {

        th,
        td {
          padding: 0.75rem;
          font-size: 0.8rem;
        }
      }
    }
  }
}
</style>
