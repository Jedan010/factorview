<template>
  <div class="data-table">
    <table>
      <thead>
        <tr>
          <th>
            <input type="checkbox" v-model="isAllSelected" @change="toggleSelectAll" />
          </th>
          <th v-for="column in columns.slice(1)" :key="column.key" @click="sortTable(column.key)">
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="factor in sortedFactors" :key="factor.name">
          <td>
            <input type="checkbox" :value="factor.name" v-model="selectedFactors" />
          </td>
          <td>
            <router-link :to="`/factor/${factor.name}`">
              {{ factor.name }}
            </router-link>
          </td>
          <td>{{ factor.className }}</td>
          <td>{{ factor.status }}</td>
          <td>{{ factor.developCode }}</td>
          <td>{{ factor.factorId }}</td>
          <td>{{ factor.creationTime }}</td>
          <td>{{ factor.updateTime }}</td>
          <td>{{ factor.insertTime }}</td>
          <td>{{ factor.tableName }}</td>
          <td>{{ factor.factorDesc }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue'

export default {
  props: {
    factorData: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const selectedFactors = ref([])
    const isAllSelected = ref(false)

    const columns = [
      { key: 'select', label: '选择', width: '50px' },
      { key: 'name', label: '因子名称' },
      { key: 'className', label: '类别' },
      { key: 'status', label: '状态' },
      { key: 'developCode', label: '开发者代码' },
      { key: 'factorId', label: '因子ID' },
      { key: 'creationTime', label: '交易时间' },
      { key: 'updateTime', label: '更新时间' },
      { key: 'insertTime', label: '插入时间' },
      { key: 'tableName', label: '表名' },
      { key: 'factorDesc', label: '因子描述' },
    ]

    const sortColumn = ref('tableName')
    const sortOrder = ref('asc')

    const factors = computed(() => {
      if (!props.factorData?.factor_info?.index) {
        return [];
      }
      return props.factorData.factor_info.index.map((name, i) => ({
        name,
        tableName: props.factorData.factor_info.values.table_name[i],
        className: props.factorData.factor_info.values.class_name[i],
        status: props.factorData.factor_info.values.status[i],
        developCode: props.factorData.factor_info.values.developer_code[i],
        factorId: props.factorData.factor_info.values.factor_id[i],
        creationTime: props.factorData.factor_info.values.creation_time[i],
        updateTime: props.factorData.factor_info.values.update_time[i],
        factorDesc: props.factorData.factor_info.values.factor_desc[i],
        insertTime: props.factorData.factor_info.values.insert_time[i]
      }));
    });

    const filteredFactors = computed(() => {
      let filtered = factors.value;

      if (props.factorData?.filters?.classNames?.length) {
        filtered = filtered.filter(f =>
          props.factorData.filters.classNames.includes(f.className)
        );
      }

      if (props.factorData?.filters?.status?.length) {
        filtered = filtered.filter(f =>
          props.factorData.filters.status.includes(f.status)
        );
      }

      if (props.factorData?.filters?.developCodes?.length) {
        filtered = filtered.filter(f =>
          props.factorData.filters.developCodes.includes(f.developCode)
        );
      }

      if (props.factorData?.filters?.factorIds?.length) {
        filtered = filtered.filter(f =>
          props.factorData.filters.factorIds.includes(f.factorId)
        );
      }

      if (props.factorData?.filters?.creationTime?.length) {
        filtered = filtered.filter(f =>
          props.factorData.filters.creationTime.includes(f.creationTime)
        );
      }

      return filtered;
    });

    const sortedFactors = computed(() => {
      return [...filteredFactors.value].sort((a, b) => {
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

    const toggleSelectAll = () => {
      if (isAllSelected.value) {
        selectedFactors.value = sortedFactors.value.map(f => f.name)
      } else {
        selectedFactors.value = []
      }
    }

    watch(selectedFactors, (newVal) => {
      isAllSelected.value = newVal.length === sortedFactors.value.length
    })

    const uniqueClasses = computed(() => {
      const classes = new Set()
      factors.value.forEach(f => classes.add(f.className))
      return Array.from(classes)
    })

    const uniqueStatuses = computed(() => {
      const statuses = new Set()
      factors.value.forEach(f => statuses.add(f.status))
      return Array.from(statuses)
    })

    const uniqueDevelopCodes = computed(() => {
      const codes = new Set()
      factors.value.forEach(f => codes.add(f.developCode))
      return Array.from(codes)
    })

    const uniqueFactorIds = computed(() => {
      const ids = new Set()
      factors.value.forEach(f => ids.add(f.factorId))
      return Array.from(ids)
    })

    const uniqueCreationTimes = computed(() => {
      const times = new Set()
      factors.value.forEach(f => times.add(f.creationTime))
      return Array.from(times)
    })

    return {
      columns,
      sortColumn,
      sortOrder,
      sortedFactors,
      sortTable,
      selectedFactors,
      isAllSelected,
      toggleSelectAll,
      uniqueClasses,
      uniqueStatuses,
      uniqueDevelopCodes,
      uniqueFactorIds,
      uniqueCreationTimes
    }
  }
}
</script>

<style scoped lang="scss">
@use '../assets/styles/base-factor';

.data-table table tr td:nth-child(2) {
  text-align: left !important;
}
</style>
