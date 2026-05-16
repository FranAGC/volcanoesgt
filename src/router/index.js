import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/HomeView.vue'),
  },
  {
    path: '/volcanes/:id?',
    name: 'Volcanoes',
    component: () => import('@/pages/VolcanoesView.vue'),
  },
  {
    path: '/guias/:id?',
    name: 'Guides',
    component: () => import('@/pages/GuidesView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
  routes,
})

export default router
