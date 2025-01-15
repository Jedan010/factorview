<template>
  <div class="not-found">
    <h1>404 - 页面未找到</h1>
    <p>您访问的页面不存在。</p>
    <router-link to="/">返回首页</router-link>
  </div>
</template>

<script setup>
// 404页面逻辑
</script>

<style lang="scss" scoped>
.not-found {
  padding: 20px;
  text-align: center;
  
  h1 {
    color: var(--color-text);
    margin-bottom: 20px;
  }
  
  a {
    color: var(--color-primary);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
