import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import { isLoggedIn } from './admin/api'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('./views/AdminLogin.vue'),
    meta: { title: 'Connexion admin' },
  },
  {
    path: '/admin/:section(tableau|certifications|experience|projets|parcours|moments|stack|messages|apparence|profil|cv)?',
    name: 'admin',
    component: () => import('./views/AdminView.vue'),
    meta: { requiresAuth: true, title: 'Dashboard admin' },
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 80 }
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    return { name: 'admin-login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'admin' && !to.params.section) {
    return { name: 'admin', params: { section: 'tableau' } }
  }
})

router.afterEach((to) => {
  document.title = to.meta.title
    ? `${to.meta.title} · daniel/portfolio`
    : 'Daniel — Développeur full-stack · Data & Cloud'
})

export default router
