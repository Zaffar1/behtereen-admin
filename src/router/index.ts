import { createRouter, createWebHistory } from 'vue-router'
import { authState } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'Ecommerce',
      component: () => import('../views/Ecommerce.vue'),
      meta: { title: 'eCommerce Dashboard', requiresAuth: true },
    },
    {
      path: '/calendar',
      name: 'Calendar',
      component: () => import('../views/Others/Calendar.vue'),
      meta: { title: 'Calendar', requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/Others/UserProfile.vue'),
      meta: { title: 'Profile', requiresAuth: true },
    },
    {
      path: '/form-elements',
      name: 'Form Elements',
      component: () => import('../views/Forms/FormElements.vue'),
      meta: { title: 'Form Elements', requiresAuth: true },
    },
    {
      path: '/basic-tables',
      name: 'Basic Tables',
      component: () => import('../views/Tables/BasicTables.vue'),
      meta: { title: 'Basic Tables', requiresAuth: true },
    },
    {
      path: '/line-chart',
      name: 'Line Chart',
      component: () => import('../views/Chart/LineChart/LineChart.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/bar-chart',
      name: 'Bar Chart',
      component: () => import('../views/Chart/BarChart/BarChart.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/alerts',
      name: 'Alerts',
      component: () => import('../views/UiElements/Alerts.vue'),
      meta: { title: 'Alerts', requiresAuth: true },
    },
    {
      path: '/avatars',
      name: 'Avatars',
      component: () => import('../views/UiElements/Avatars.vue'),
      meta: { title: 'Avatars', requiresAuth: true },
    },
    {
      path: '/badge',
      name: 'Badge',
      component: () => import('../views/UiElements/Badges.vue'),
      meta: { title: 'Badge', requiresAuth: true },
    },
    {
      path: '/buttons',
      name: 'Buttons',
      component: () => import('../views/UiElements/Buttons.vue'),
      meta: { title: 'Buttons', requiresAuth: true },
    },
    {
      path: '/images',
      name: 'Images',
      component: () => import('../views/UiElements/Images.vue'),
      meta: { title: 'Images', requiresAuth: true },
    },
    {
      path: '/videos',
      name: 'Videos',
      component: () => import('../views/UiElements/Videos.vue'),
      meta: { title: 'Videos', requiresAuth: true },
    },
    {
      path: '/categories',
      name: 'Categories',
      component: () => import('../views/Categories/CategoriesList.vue'),
      meta: { title: 'Categories', requiresAuth: true },
    },
    {
      path: '/categories/new',
      name: 'Create Category',
      component: () => import('../views/Categories/NewCategory.vue'),
      meta: { title: 'Create Category', requiresAuth: true },
    },
    {
      path: '/categories/:id/edit',
      name: 'Edit Category',
      component: () => import('../views/Categories/EditCategory.vue'),
      meta: { title: 'Edit Category', requiresAuth: true },
    },
    {
      path: '/blank',
      name: 'Blank',
      component: () => import('../views/Pages/BlankPage.vue'),
      meta: { title: 'Blank', requiresAuth: true },
    },
    {
      path: '/error-404',
      name: '404 Error',
      component: () => import('../views/Errors/FourZeroFour.vue'),
      meta: { title: '404 Error' },
    },
    {
      path: '/signin',
      name: 'Signin',
      component: () => import('../views/Auth/Signin.vue'),
      meta: { title: 'Signin', guestOnly: true },
    },
    {
      path: '/auth/google/callback',
      name: 'GoogleAuthCallback',
      component: () => import('../views/Auth/GoogleCallback.vue'),
      meta: { title: 'Google Callback', guestOnly: true },
    },
  ],
})

router.beforeEach((to) => {
  document.title = `Admin | ${to.meta.title || 'Dashboard'}`

  if (!authState.ready) {
    return true
  }

  if (to.meta.requiresAuth && !authState.token) {
    return { path: '/signin', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && authState.token) {
    return { path: '/' }
  }

  return true
})

export default router
