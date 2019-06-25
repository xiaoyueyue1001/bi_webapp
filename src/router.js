import Vue from 'vue'
import Router from 'vue-router'
import SuperPanel from './views/SuperPanel.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/superPanel',
    },
    {
      path: '/superPanel',
      name: 'superPanel',
      component: SuperPanel
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('./views/Login.vue')
    },
    {
      path: '*',
      redirect: '/superPanel',
    },
  ]
})
