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
  min-height: 100vh;
  padding: 2rem;
  margin: 0;
  box-sizing: border-box;
}

.content-wrapper {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
  text-align: center;
}

h1 {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  width: 100%;
}

.btn {
  width: 300px;
  max-width: 100%;
  padding: 1.2rem;
  border-radius: 6px;
  text-align: center;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &.factor-btn {
    background-color: #3498db;
    &:hover {
      background-color: darken(#3498db, 10%);
      transform: translateY(-2px);
    }
  }

  &.strategy-btn {
    background-color: #e74c3c;
    &:hover {
      background-color: darken(#e74c3c, 10%);
      transform: translateY(-2px);
    }
  }
}

.footer {
  margin-top: 2rem;
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .index-container {
    padding: 1rem;
  }

  .content-wrapper,
  .btn {
    padding: 1.5rem;
  }

  h1 {
    font-size: 1.8rem;
  }
}
</style>
