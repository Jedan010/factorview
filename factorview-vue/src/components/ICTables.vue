<script setup>
import { computed } from 'vue'

const props = defineProps({
  icData: {
    type: Array,
    required: true
  },
  isDarkMode: {
    type: Boolean,
    default: false
  }
})

// 计算IC统计指标
const icStats = computed(() => {
  if (!props.icData || props.icData.length === 0) return null
  
  const icValues = props.icData.values.map(v => v[0])
  const mean = icValues.reduce((a, b) => a + b, 0) / icValues.length
  const std = Math.sqrt(icValues.reduce((a, b) => a + (b - mean) ** 2, 0) / icValues.length)
  
  return {
    mean: mean.toFixed(4),
    std: std.toFixed(4),
    ir: (mean / std).toFixed(4),
    positiveRatio: ((icValues.filter(v => v > 0).length / icValues.length) * 100).toFixed(2) + '%'
  }
})
</script>

<template>
  <div class="ic-tables" :class="{ 'dark-mode': isDarkMode }">
   
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-label">均值</div>
        <div class="stat-value">{{ icStats?.mean }}</div>
      </div>
      
      <div class="stat-item">
        <div class="stat-label">标准差</div>
        <div class="stat-value">{{ icStats?.std }}</div>
      </div>
      
      <div class="stat-item">
        <div class="stat-label">信息比率</div>
        <div class="stat-value">{{ icStats?.ir }}</div>
      </div>
      
      <div class="stat-item">
        <div class="stat-label">正IC比例</div>
        <div class="stat-value">{{ icStats?.positiveRatio }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ic-tables {
  margin-top: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .stat-item {
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    text-align: center;

    .stat-label {
      font-size: 0.9rem;
      color: #6c757d;
      margin-bottom: 0.5rem;
    }

    .stat-value {
      font-size: 1.2rem;
      font-weight: 600;
      color: #2c3e50;
    }
  }

  &.dark-mode {
    background: #2d2d2d;

    h2 {
      color: #ffffff;
    }

    .stat-item {
      background: #3d3d3d;

      .stat-label {
        color: #e2e8f0;
      }

      .stat-value {
        color: #ffffff;
      }
    }

    .stats-grid {
      color: #ffffff;
    }
  }
}
</style>