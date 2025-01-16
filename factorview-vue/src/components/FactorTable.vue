<template>
  <div class="factor-table">
    <table>
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key" @click="sortTable(column.key)">
            {{ column.label }}
            <span v-if="sortColumn === column.key">
              {{ sortOrder === 'asc' ? '↑' : '↓' }}
            </span>
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
          <td>{{ factor.className }}</td>
          <td>{{ formatDate(factor.startDate) }}</td>
          <td>{{ formatDate(factor.endDate) }}</td>
          <td>{{ formatNumber(factor.ic) }}</td>
          <td>{{ formatNumber(factor.icir) }}</td>
          <td>{{ formatPercent(factor.topReturn) }}</td>
          <td>{{ formatPercent(factor.bottomReturn) }}</td>
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
    factors: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const columns = [
      { key: 'name', label: '因子名称' },
      { key: 'className', label: '类别' },
      { key: 'startDate', label: '开始日期' },
      { key: 'endDate', label: '结束日期' },
      { key: 'ic', label: 'IC' },
      { key: 'icir', label: 'ICIR' },
      { key: 'topReturn', label: 'Top组收益' },
      { key: 'bottomReturn', label: 'Bottom组收益' },
      { key: 'longShortReturn', label: '多空收益' },
      { key: 'annualReturn', label: '年化收益' },
      { key: 'maxDrawdown', label: '最大回撤' },
      { key: 'sharpeRatio', label: '夏普比率' },
      { key: 'calmarRatio', label: '卡玛比率' },
      { key: 'turnover', label: '换手率' }
    ]

    const sortColumn = ref('name')
    const sortOrder = ref('asc')

    const sortedFactors = computed(() => {
      return [...props.factors].sort((a, b) => {
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

<style scoped>
.factor-table {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f5f5f5;
  cursor: pointer;
  user-select: none;
}

th:hover {
  background-color: #e9e9e9;
}

tr:hover {
  background-color: #f9f9f9;
}

a {
  color: #007bff;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>