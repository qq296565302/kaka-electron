import { createRouter, createWebHistory } from 'vue-router'

import utils from '../utils/index'


const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'home',
    meta: {
      title: '首页'
    },
    component: () => import('../views/PageHome.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = utils.SetPageTitle(to.meta.title)
  next()
})

export default router
