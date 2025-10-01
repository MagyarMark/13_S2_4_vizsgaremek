import { createRouter, createWebHistory } from 'vue-router'
import Home from './pages/Home.vue'
import About from './pages/about.vue'
import Login from './pages/login.vue'
import Register from './pages/register.vue'
import Kapcsolat from './pages/kapcsolat.vue'
import Rolunk from './pages/rolunk.vue'

const routes = [
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router