<template>
  <div class="factor-info-container" :class="{ 'dark-mode': isDarkMode }">

    <div class="header">

      <h1>因子基本信息</h1>

      <div class="header-controls">
        <button class="theme-toggle" @click="toggleDarkMode">
          <span class="theme-icon">
            {{ isDarkMode ? 'Dark Mode' : 'Light Mode' }}
          </span>
        </button>
        <router-link to="/" class="back-btn">返回主页</router-link>
      </div>

    </div>

    <FactorInfoFilter
      :classes="factorTableRef?.uniqueClasses || []"
      :statuses="factorTableRef?.uniqueStatuses || []"
      :developCodes="factorTableRef?.uniqueDevelopCodes || []"
      :factorIds="factorTableRef?.uniqueFactorIds || []"
      :creationTimes="factorTableRef?.uniqueCreationTimes || []"
      @update:modelValue="handleFactorInfoFilterChange"
      @update:status="handleStatusFilterChange"
      @update:developCode="handleDevelopCodeFilterChange"
      @update:factorId="handleFactorIdFilterChange"
      @update:creationTime="handleCreationTimeFilterChange"
    />

    <div class="action-bar">
      <router-link :to="{
        path: '/factor/stats',
        query: {
          factor_names: Array.isArray(factorTableRef?.selectedFactors)
            ? factorTableRef.selectedFactors
            : [factorTableRef?.selectedFactors]
        }
      }" class="stats-btn">
        因子表现统计
      </router-link>
    </div>

    <div class="content">

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-if="isLoading">
        <div class="loading-indicator">
          <div class="loader"></div>
          数据加载中...
        </div>
      </div>

      <FactorInfoTable ref="factorTableRef" :factorData="response" />
    </div>

  </div>
</template>

<script>
import { ref } from 'vue'
import FactorInfoTable from '@/components/FactorInfoTable.vue'
import FactorInfoFilter from '@/components/FactorInfoFilter.vue'
import { getFactorInfo } from '@/api/factor.js'

export default {
  components: {
    FactorInfoTable,
    FactorInfoFilter
  },
  setup() {
    const factorTableRef = ref(null)
    return {
      factorTableRef
    }
  },
  name: 'FactorInfo',
  data() {
    return {
      factors: [],
      filters: {
        tableNames: [],
        classNames: [],
        status: [],
        developCodes: [],
        factorIds: [],
        creationTime: []
      },
      isLoading: false,
      error: null,
      isDarkMode: false
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
        const params = {
          class_names: this.filters.classNames,
          statuses: this.filters.status,
          develop_codes: this.filters.developCodes,
          factor_ids: this.filters.factorIds,
          creation_times: this.filters.creationTime
        };

        const data = await getFactorInfo(params);
        this.response = {
          ...data,
          filters: {
            classNames: this.filters.classNames,
            status: this.filters.status,
            developCodes: this.filters.developCodes,
            factorIds: this.filters.factorIds,
            creationTime: this.filters.creationTime
          }
        };
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
    },

    handleFactorInfoFilterChange(selectedClasses) {
      this.filters.classNames = selectedClasses;
      this.$nextTick(() => {
        this.fetchFactors();
      });
    },

    handleStatusFilterChange(selectedStatuses) {
      this.filters.status = selectedStatuses;
      this.$nextTick(() => {
        this.fetchFactors();
      });
    },

    handleDevelopCodeFilterChange(selectedDevelopCodes) {
      this.filters.developCodes = selectedDevelopCodes;
      this.$nextTick(() => {
        this.fetchFactors();
      });
    },

    handleFactorIdFilterChange(selectedFactorIds) {
      this.filters.factorIds = selectedFactorIds;
      this.$nextTick(() => {
        this.fetchFactors();
      });
    },

    handleCreationTimeFilterChange(selectedCreationTimes) {
      this.filters.creationTime = selectedCreationTimes;
      this.$nextTick(() => {
        this.fetchFactors();
      });
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

  .action-bar {
    margin: 1rem 0;
    display: flex;
    justify-content: flex-end;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    .stats-btn {
      padding: 0.75rem 1.5rem;
      background: #3498db;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.2s ease;

      &:hover {
        background: #2980b9;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
    }
  }
}
</style>