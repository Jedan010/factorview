<template>
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
</template>

<script>
export default {
  name: 'FactorStats',
  props: {
    rawData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      factors: [],
      sortKey: 'name',
      sortOrder: 'asc'
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
    processFactorData(data) {
      this.factors = data.factor_info.index.map((name, index) => ({
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
    }
  },
  mounted() {
    if (this.rawData) {
      this.processFactorData(this.rawData);
    }
  },
  watch: {
    rawData(newData) {
      if (newData) {
        this.processFactorData(newData);
      }
    }
  }
};
</script>

<style lang="scss">
@use '../assets/styles/base-factor';
</style>