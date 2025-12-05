<!-- Login.vue -->
<template>
  <header>
    <div class="logo">Smart<span>Manager</span></div>
    <nav>
      <button class="mobile-menu-btn" @click="toggleMenu" :aria-expanded="navActive" aria-label="Menü">☰</button>
      <ul :class="{ show: navActive }">
        <li><a href="Home.vue" @click="navActive = false">Kezdőlap</a></li>
      </ul>
    </nav>
  </header>

  <main class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>Bejelentkezés</h1>
        <p>Üdv újra a SmartManager-ben</p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="username">Felhasználónév</label>
          <input 
            type="text" 
            id="username" 
            v-model="form.username"
            placeholder="PéldaBence" 
            required
          >
        </div>

        <div class="form-group">
          <label for="password">Jelszó</label>
          <input 
            type="password" 
            id="password" 
            v-model="form.password"
            placeholder="••••••••" 
            required
          >
        </div>

        <!--<div class="form-options">
          <label class="checkbox">
            <input type="checkbox" v-model="form.remember">
            <span>Emlékezz rám</span>
          </label>
          <a href="#" class="forgot-password">Elfelejtette jelszavát?</a>
        </div>-->

        <button type="submit" class="btn primary auth-btn" :disabled="loading">
          {{ loading ? 'Bejelentkezés...' : 'Bejelentkezés' }}
        </button>
      </form>

      <div class="auth-divider">
        <span>vagy</span>
      </div>

      <div class="auth-footer">
        <p>Még nincs fiókja? <router-link to="/register">Regisztráljon itt</router-link></p>
      </div>
    </div>
  </main>

<footer>
  &copy; 2025 SmartManager. Minden jog fenntartva.
</footer>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      navActive: false,
      loading: false,
      form: {
        username: '',
        password: '',
        remember: false
      }
    }
  },
  methods: {
    toggleMenu() {
      this.navActive = !this.navActive;
    },
    async handleLogin() {
      this.loading = true;
      
      try {
        // Backend API hívás
        const response = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            felhasznalonev: this.form.username,
            jelszo: this.form.password
          })
        });
        const data = await response.json();
        
        // Sikeres bejelentkezés után átirányítás szerepkör alapján
        if (data.success) {
          const role = data && data.data && data.data.user && data.data.user.szerep_tipus;
          if (role === 'diak') {
            this.$router.push('/diak');
          } else if (role === 'tanar') {
            this.$router.push('/tanar');
          } else {
            this.$router.push('/');
          }
        } else {
          alert(data.message || 'Bejelentkezés sikertelen');
        }
      } catch (error) {
        console.error('Bejelentkezési hiba:', error);
      } finally {
        this.loading = false;
      }
    }
  },
}
</script>

<style scoped>
.auth-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100px 2rem 2rem;
}

.auth-card {
  background: var(--card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 3rem;
  width: 100%;
  max-width: 450px;
  margin: 0 auto;
}

.auth-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.auth-header h1 {
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
  color: var(--text);
}

.auth-header p {
  color: var(--muted);
  font-size: 1.1rem;
}

.auth-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--muted);
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 1rem;
  border-radius: var(--radius);
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text);
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox input {
  width: auto;
}

.checkbox span {
  color: var(--muted);
  font-size: 0.9rem;
}

.forgot-password {
  color: var(--accent);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s;
}

.forgot-password:hover {
  color: var(--accent2);
}

.auth-btn {
  width: 100%;
  padding: 1.2rem;
  font-size: 1.1rem;
}

.auth-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
}

.auth-divider {
  display: flex;
  align-items: center;
  margin: 2rem 0;
  color: var(--muted);
}

.auth-divider::before,
.auth-divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.auth-divider span {
  padding: 0 1rem;
  font-size: 0.9rem;
}

.social-auth {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.social-btn {
  flex: 1;
  padding: 1rem;
  border-radius: var(--radius);
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  color: var(--text);
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1rem;
}

.social-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.social-btn.google {
  color: #ea4335;
}

.social-btn.facebook {
  color: #1877f2;
}

.auth-footer {
  text-align: center;
}

.auth-footer p {
  color: var(--muted);
  font-size: 0.95rem;
}

.auth-footer a {
  color: var(--accent);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.auth-footer a:hover {
  color: var(--accent2);
}

@media (max-width: 768px) {
  .auth-container {
    padding: 100px 1rem 1rem;
  }
  
  .auth-card {
    padding: 2rem;
  }
  
  .social-auth {
    flex-direction: column;
  }
  
  .form-options {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>