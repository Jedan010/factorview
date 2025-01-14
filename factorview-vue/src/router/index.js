import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/IndexPage.vue')
  },
  {
    path: '/factor',
    name: 'FactorInfo',
    component: () => import('@/views/FactorInfo.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router