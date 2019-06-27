import Vue from 'vue'
import Router from 'vue-router'
import SuperPanel from './views/SuperPanel.vue'
import Login from './views/Login.vue'
import Dashboard from '@/components/SuperPanel/Dashboard'

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
      component: Login
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard
    },
    {
      path: '*',
      redirect: '/superPanel',
    },
  ]
})
