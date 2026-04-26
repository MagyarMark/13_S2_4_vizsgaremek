// Vue Router fő belépési pont és history kezelés
import { createRouter, createWebHistory } from 'vue-router'
// oldalak importálása
import Home from './pages/Home.vue'
import Settings from './pages/settings.vue'
import Login from './pages/login.vue'
import Register from './pages/register.vue'
import Kapcsolat from './pages/kapcsolat.vue'
import Task from './pages/task.vue'
import Diak from './pages/diak.vue'
import Tanar from './pages/tanar.vue'
import Chat from './pages/chat.vue'
import Terms from './pages/terms.vue'
import TeamWork from './pages/teamwork.vue'
import Ttask from './pages/Ttask.vue'
import Ertekeles from './pages/ertekeles.vue'
import VerifyEmail from './pages/verifyEmail.vue'
import reactivateAccount from './pages/reactivateAccount.vue'
import {
  clearSessionAuthData,
  ensureSessionTimeout,
  isSessionExpired
} from './utils/sessionTimeout'

// alkalmazás útvonalai jogosultsági metaadatokkal
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { public: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { public: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { public: true }
  },
  {
    path: '/kapcsolat',
    name: 'Kapcsolat',
    component: Kapcsolat,
    meta: { public: true }
  },
  {
    path: '/task',
    name: 'Task',
    component: Task,
    meta: { requiresAuth: true, roles: ['diak'] }
  },
  {
    path: '/diak',
    name: 'Diak',
    component: Diak,
    meta: { requiresAuth: true, roles: ['diak'] }
  },
  {
    path: '/tanar',
    name: 'Tanar',
    component: Tanar,
    meta: { requiresAuth: true, roles: ['tanar'] }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat,
    meta: { requiresAuth: true }
  },
  {
    path: '/terms',
    name: 'Terms',
    component: Terms,
    meta: { public: true }
  },
  {
    path: '/teamwork',
    name: 'TeamWork',
    component: TeamWork,
    meta: { requiresAuth: true, roles: ['diak'] }
  },
  {
    path: '/Ttask',
    name: 'Ttask',
    component: Ttask,
    meta: { requiresAuth: true, roles: ['tanar'] }
  },
  {
    path: '/ertekeles',
    name: 'Ertekeles',
    component: Ertekeles,
    meta: { requiresAuth: true, roles: ['tanar'] }
  },
  {
    path: '/verify-email',
    name: 'VerifyEmail',
    component: VerifyEmail,
    meta: { public: true }
  },
  {
    path: '/reactivate-account',
    name: 'reactivateAccount',
    component: reactivateAccount,
    meta: { public: true }
  }
]

// router példány létrehozása HTML5 history móddal
const router = createRouter({
  history: createWebHistory(),
  routes,

  // görgetési pozíció visszaállítása oldalváltáskor
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { left: 0, top: 0 }
    }
  }
})

// globális navigációs guard: auth és szerepkör ellenőrzés
router.beforeEach((to) => {
  // publikus útvonalaknál nincs ellenőrzés
  const isPublicRoute = to.meta.public === true
  // lokálisan tárolt auth adatok
  const token = localStorage.getItem('accessToken')
  const storedUser = localStorage.getItem('user')

  if (isPublicRoute) {
    return true
  }

  // ha nincs token vagy user, login oldalra irányítjuk
  if (!token || !storedUser) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  ensureSessionTimeout()
  if (isSessionExpired()) {
    clearSessionAuthData()
    return { name: 'Login', query: { reason: 'timeout' } }
  }

  // role alapú hozzáférés ellenőrzése, ha a route megköveteli
  if (Array.isArray(to.meta.roles) && to.meta.roles.length > 0) {
    try {
      const user = JSON.parse(storedUser)
      const role = user?.szerep_tipus

      // ha a szerep nem megengedett, a megfelelő dashboardra irányítunk
      if (!to.meta.roles.includes(role)) {
        return role === 'tanar' ? { name: 'Tanar' } : { name: 'Diak' }
      }
    } catch (error) {
      // sérült user adat esetén vissza loginra
      return { name: 'Login' }
    }
  }

  return true
})

// router exportálása az alkalmazás számára
export default router