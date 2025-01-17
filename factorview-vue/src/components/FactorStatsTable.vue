<template>
  <div class="data-table">
    <table>
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key" @click="sortTable(column.key)">
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="factor in sortedFactors" :key="factor.name">
          <td>
            <router-link :to="`/factor/${factor.name}`">
              {{ factor.name }}
            </router-link>
          </td>
          <td>{{ formatDate(factor.startDate) }}</td>
          <td>{{ formatDate(factor.endDate) }}</td>
          <td>{{ formatNumber(factor.ic) }}</td>
          <td>{{ formatNumber(factor.icir) }}</td>
          <td>{{ formatPercent(factor.longShortReturn) }}</td>
          <td>{{ formatPercent(factor.annualReturn) }}</td>
          <td>{{ formatPercent(factor.maxDrawdown) }}</td>
          <td>{{ formatNumber(factor.sharpeRatio) }}</td>
          <td>{{ formatNumber(factor.calmarRatio) }}</td>
          <td>{{ formatNumber(factor.turnover, 1) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { computed, ref } from 'vue'

export default {
  props: {
    factorData: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const columns = [
      { key: 'name', label: '因子名称' },
      { key: 'startDate', label: '开始日期' },
      { key: 'endDate', label: '结束日期' },
      { key: 'ic', label: 'IC' },
      { key: 'icir', label: 'ICIR' },
      { key: 'longShortReturn', label: '多空收益' },
      { key: 'annualReturn', label: '年化收益' },
      { key: 'maxDrawdown', label: '最大回撤' },
      { key: 'sharpeRatio', label: '夏普比率' },
      { key: 'calmarRatio', label: '卡玛比率' },
      { key: 'turnover', label: '换手率' }
    ]

    const sortColumn = ref('name')
    const sortOrder = ref('asc')
    
    const factors = computed(() => {
      if (!props.factorData?.factor_info?.index) {
        return [];
      }
      return props.factorData.factor_info.index.map((name, i) => ({
        name,
        className: props.factorData.factor_info.values.class_name[i],
        startDate: props.factorData.date.values.min[i],
        endDate: props.factorData.date.values.max[i],
        ic: props.factorData.ic.values.ic[i],
        icir: props.factorData.ic.values.icir[i],
        topReturn: props.factorData.group.values.top_ret[i],
        bottomReturn: props.factorData.group.values.bottom_ret[i],
        longShortReturn: props.factorData.group.values.long_short_ret[i],
        annualReturn: props.factorData.backtest_ret.values.annual_return[i],
        maxDrawdown: props.factorData.backtest_ret.values.max_drawdown[i],
        sharpeRatio: props.factorData.backtest_ret.values.sharpe_ratio[i],
        calmarRatio: props.factorData.backtest_ret.values.calmar_ratio[i],
        turnover: props.factorData.backtest_ret.values.turnover[i]
      }));
    });

    const sortedFactors = computed(() => {
      return [...factors.value].sort((a, b) => {
        const valueA = a[sortColumn.value]
        const valueB = b[sortColumn.value]

        if (typeof valueA === 'number' && typeof valueB === 'number') {
          return sortOrder.value === 'asc' ? valueA - valueB : valueB - valueA
        }

        if (valueA < valueB) return sortOrder.value === 'asc' ? -1 : 1
        if (valueA > valueB) return sortOrder.value === 'asc' ? 1 : -1
        return 0
      })
    })

    const sortTable = (column) => {
      if (sortColumn.value === column) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortColumn.value = column
        sortOrder.value = 'asc'
      }
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString()
    }

    const formatNumber = (value, decimals = 3) => {
      return value?.toFixed(decimals) || '-'
    }

    const formatPercent = (value) => {
      return value ? `${(value * 100).toFixed(2)}%` : '-'
    }

    return {
      columns,
      sortColumn,
      sortOrder,
      sortedFactors,
      sortTable,
      formatDate,
      formatNumber,
      formatPercent
    }
  }
}
</script>

<style scoped lang="scss">
@use '../assets/styles/base-factor';
</style>