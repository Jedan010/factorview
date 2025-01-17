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
  },
  {
    path: '/factor/stats',
    name: 'FactorStats',
    component: () => import('@/views/FactorStats.vue')
  },
  {
    path: '/factor/:factorName',
    name: 'FactorPerformance',
    component: () => import('@/views/FactorPerformance.vue')
  },
  {
    path: '/strategy',
    name: 'StrategyInfo',
    component: () => import('@/views/StrategyInfo.vue')
  },
  {
    path: '/strategy/:strategyName',
    name: 'StrategyPerformance',
    component: () => import('@/views/StrategyPerformance.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
