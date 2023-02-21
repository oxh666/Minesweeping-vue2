import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)
const router = new VueRouter({
  routes: [
    {
      path: '/',
      component: () => import('@/layout/Index.vue'),
      children: [
        {
          path: 'home',
          component: () => import('@/views/home/Index.vue'),
          meta: {
            title: '主页'
          }
        },
        {
          path: 'view',
          component: () => import('@/views/view/Index.vue'),
          meta: {
            title: '游戏界面'
          }
        },
        {
          path: 'options',
          component: () => import('@/views/options/Index.vue'),
          meta: {
            title: '选项'
          }
        },
        {
          path: 'system',
          component: () => import('@/views/system/Index.vue'),
          meta: {
            title: '系统设置'
          }
        }
      ]
    }
  ]
})

export default router
