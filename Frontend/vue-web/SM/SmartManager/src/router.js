import { createRouter, createWebHistory } from 'vue-router'
import Home from './pages/Home.vue'
import Settings from './pages/settings.vue'
import Login from './pages/login.vue'
import Register from './pages/register.vue'
import Kapcsolat from './pages/kapcsolat.vue'
import Rolunk from './pages/rolunk.vue'
import Diak from './pages/diak.vue'
import Tanar from './pages/tanar.vue'
import Chat from './pages/chat.vue'

const routes = [
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/kapcsolat',
    name: 'Kapcsolat',
    component: Kapcsolat
  },
  {
    path: '/rolunk',
    name: 'Rolunk',
    component: Rolunk
  },
  {
    path: '/diak',
    name: 'Diak',
    component: Diak
  },
  {
    path: '/tanar',
    name: 'Tanar',
    component: Tanar
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router