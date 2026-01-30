import { createRouter, createWebHistory } from 'vue-router'
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
import Admin from './pages/admin.vue'

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
    path: '/task',
    name: 'Task',
    component: Task
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
  },
  {
    path: '/terms',
    name: 'Terms',
    component: Terms
  },
  {
    path: '/teamwork',
    name: 'TeamWork',
    component: TeamWork
  },
  {
    path: '/Ttask',
    name: 'Ttask',
    component: Ttask
  },
  {
    path: '/ertekeles',
    name: 'Ertekeles',
    component: Ertekeles
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router