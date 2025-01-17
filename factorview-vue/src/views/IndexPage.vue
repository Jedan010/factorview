<template>
  <div class="index-container">
    <div class="content-wrapper">
      <h1>欢迎使用因子分析系统</h1>
      <div class="nav">
        <router-link to="/factor" class="btn factor-btn">查看因子列表</router-link>
        <router-link to="/strategy" class="btn strategy-btn">查看策略列表</router-link>
      </div>
      <footer class="footer">
        <p>© 2025 因子分析系统. All rights reserved.</p>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IndexPage',
}
</script>

<style scoped lang="scss">
@use "sass:color";

.index-container {
  padding: 10rem;
}

.content-wrapper {
  text-align: center;
}

h1 {
  font-size: 2rem;
  margin-bottom: 4rem;
  color: #2c3e50;
}

.nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.btn {
  width: 200px;
  padding: 1.2rem;
  border-radius: 10px;
  text-align: center;
  text-decoration: none;
  font-size: 1.1rem;
  color: white;

  &.factor-btn {
    background-color: #3498db;

    &:hover {
      background-color: color.adjust(#3498db, $lightness: -10%);
      transform: translateY(-2px);
    }
  }

  &.strategy-btn {
    background-color: #e74c3c;

    &:hover {
      background-color: color.adjust(#e74c3c, $lightness: -10%);
      transform: translateY(-2px);
    }
  }
}

.footer {
  margin-top: 2rem;
  color: #666;
  font-size: 1rem;
}
</style>
