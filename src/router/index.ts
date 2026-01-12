import { createRouter, createWebHistory } from 'vue-router'
import AccountHome from '@/modules/accountHome/components/AccountHome.vue'
import ProjectsHome from '@/modules/projectsHome/components/ProjectsHome.vue'
import ReportsHome from '@/modules/reportsHome/components/ReportsHome.vue'
import TrackingHome from '@/modules/trackingHome/components/TrackingHome.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/projects' },
    { path: '/projects', component: ProjectsHome },
    { path: '/account', component: AccountHome },
    { path: '/reports', component: ReportsHome },
    { path: '/tracking', component: TrackingHome },
  ],
})

export default router
