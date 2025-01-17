<template>
  <div class="class-filter-container">
    <div class="filter-row">
      <details class="filter-select">
        <summary>类别</summary>
        <div class="checkbox-group">
          <label v-for="className in classes" :key="className" class="checkbox-item">
            <input type="checkbox" :value="className" v-model="selectedClasses">
            {{ className }}
          </label>
        </div>
      </details>

      <details class="filter-select">
        <summary>状态</summary>
        <div class="checkbox-group">
          <label v-for="status in statuses" :key="status" class="checkbox-item">
            <input type="checkbox" :value="status" v-model="selectedStatuses">
            {{ status }}
          </label>
        </div>
      </details>

      <details class="filter-select">
        <summary>开发者代码</summary>
        <div class="checkbox-group">
          <label v-for="code in developCodes" :key="code" class="checkbox-item">
            <input type="checkbox" :value="code" v-model="selectedDevelopCodes">
            {{ code }}
          </label>
        </div>
      </details>

      <details class="filter-select">
        <summary>因子ID</summary>
        <div class="checkbox-group">
          <label v-for="id in factorIds" :key="id" class="checkbox-item">
            <input type="checkbox" :value="id" v-model="selectedFactorIds">
            {{ id }}
          </label>
        </div>
      </details>

      <details class="filter-select">
        <summary>交易时间</summary>
        <div class="checkbox-group">
          <label v-for="time in creationTimes" :key="time" class="checkbox-item">
            <input type="checkbox" :value="time" v-model="selectedCreationTimes">
            {{ time }}
          </label>
        </div>
      </details>

      <div class="filter-actions">
        <button class="apply-btn" @click="applyFilter">确认筛选</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  props: {
    classes: {
      type: Array,
      default: () => []
    },
    statuses: {
      type: Array,
      default: () => []
    },
    developCodes: {
      type: Array,
      default: () => []
    },
    factorIds: {
      type: Array,
      default: () => []
    },
    creationTimes: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'update:status', 'update:developCode', 'update:factorId', 'update:creationTime'],
  setup(props, { emit }) {
    const showFilter = ref(false);
    const selectedClasses = ref([]);
    const selectedStatuses = ref([]);
    const selectedDevelopCodes = ref([]);
    const selectedFactorIds = ref([]);
    const selectedCreationTimes = ref([]);

    const toggleFilter = () => {
      showFilter.value = !showFilter.value;
    };

    const applyFilter = () => {
      emit('update:modelValue', selectedClasses.value);
      emit('update:status', selectedStatuses.value);
      emit('update:developCode', selectedDevelopCodes.value);
      emit('update:factorId', selectedFactorIds.value);
      emit('update:creationTime', selectedCreationTimes.value);
      showFilter.value = false;
    };

    return {
      showFilter,
      selectedClasses,
      selectedStatuses,
      selectedDevelopCodes,
      selectedFactorIds,
      selectedCreationTimes,
      toggleFilter,
      applyFilter
    };
  }
};
</script>

<style scoped lang="scss">
@use '../assets/styles/base-factor';

.class-filter-container {
  margin: 1rem 0;
  padding: 1.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  .filter-row {
    display: flex;
    align-items: flex-end;
    gap: 1.5rem;

    .filter-select {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.5rem;
      background: white;
      transition: all 0.2s ease;

      &:hover {
        border-color: #3498db;
        box-shadow: 0 1px 3px rgba(52, 152, 219, 0.12);
      }

      summary {
        font-size: 0.95rem;
        color: #4a5568;
        font-weight: 600;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 6px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;

        &::after {
          content: '▼';
          font-size: 0.8rem;
          transition: transform 0.2s ease;
        }

        &:hover {
          background: #f8fafc;
          color: #2c3e50;
        }
      }

      &[open] summary::after {
        transform: rotate(180deg);
      }

      .checkbox-group {
        position: absolute;
        z-index: 100;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-top: 0.75rem;
        max-height: 300px;
        overflow-y: auto;
        padding: 1rem;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        min-width: 220px;
        animation: slideDown 0.2s ease-out;

        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            background: #f8fafc;
            transform: translateX(4px);
          }

          input[type="checkbox"] {
            width: 1.1rem;
            height: 1.1rem;
            cursor: pointer;
            accent-color: #3498db;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            transition: all 0.2s ease;

            &:checked {
              background-color: #3498db;
              border-color: #3498db;
            }
          }

          span {
            color: #4a5568;
            font-size: 0.9rem;
          }
        }
      }
    }

    .filter-actions {
      margin-left: auto;
      padding-bottom: 0.5rem;

      .apply-btn {
        padding: 0.875rem 1.75rem;
        background: linear-gradient(145deg, #3498db, #2980b9);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        font-size: 0.95rem;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(52, 152, 219, 0.2);

        &:hover {
          background: linear-gradient(145deg, #2980b9, #3498db);
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(52, 152, 219, 0.3);
        }

        &:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(52, 152, 219, 0.2);
        }
      }
    }
  }
}

@keyframes slideDown {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

html.dark {
  .class-filter-container {
    background: #2d3748;
    border-color: #4a5568;

    .filter-select {
      background: #2d3748;
      border-color: #4a5568;

      summary {
        color: #e2e8f0;

        &:hover {
          background: #4a5568;
        }
      }

      .checkbox-group {
        background: #2d3748;
        border-color: #4a5568;

        .checkbox-item {
          &:hover {
            background: #4a5568;
          }

          span {
            color: #e2e8f0;
          }

          input[type="checkbox"] {
            border-color: #4a5568;
            accent-color: #63b3ed;

            &:checked {
              background-color: #63b3ed;
              border-color: #63b3ed;
            }
          }
        }
      }
    }

    .apply-btn {
      background: linear-gradient(145deg, #4a5568, #2d3748);
      box-shadow: 0 2px 4px rgba(74, 85, 104, 0.2);

      &:hover {
        background: linear-gradient(145deg, #2d3748, #4a5568);
        box-shadow: 0 4px 6px rgba(74, 85, 104, 0.3);
      }
    }
  }
}
</style>