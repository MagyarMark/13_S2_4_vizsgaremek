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

  mounted() {
    try {
      const token = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        const u = JSON.parse(storedUser);
        const role = u && u.szerep_tipus;

        if (role === 'diak') {
          this.$router.push('/diak');
        } else if (role === 'tanar') {
          this.$router.push('/tanar');
        } else {
          this.$router.push('/home');
        }
      }
    } catch (e) {
      console.warn('Auto-redirect error:', e);
    }
  },

  methods: {
    toggleMenu() {
      this.navActive = !this.navActive;
    },

    async handleLogin() {
      this.loading = true;

      try {
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

        if (data.success && data.data && data.data.user && data.data.accessToken) {

          localStorage.setItem('user', JSON.stringify(data.data.user));
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);

          const role = data.data.user.szerep_tipus;

          if (role === 'diak') {
            this.$router.push('/diak');
          } else if (role === 'tanar') {
            this.$router.push('/tanar');
          } else {
            this.$router.push('/home');
          }

        } else {
          alert(data.message || 'Bejelentkezés sikertelen');
        }

      } catch (error) {
        console.error('Bejelentkezési hiba:', error);
        alert('Hiba történt a bejelentkezés során');
      } finally {
        this.loading = false;
      }
    }
  }
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
    padding: 80px 1rem 1rem;
  }
  
  .auth-card {
    padding: 2rem;
    max-width: 100%;
  }
  
  .auth-header h1 {
    font-size: 1.8rem;
  }
  
  .social-auth {
    flex-direction: column;
  }
  
  .form-options {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .form-group input {
    padding: 0.875rem;
  }
}

@media (max-width: 600px) {
  .auth-container {
    padding: 60px 0.75rem 0.75rem;
  }

  .auth-card {
    padding: 1.5rem;
    border-radius: 12px;
  }

  .auth-header h1 {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }

  .auth-header p {
    font-size: 0.95rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    font-size: 0.9rem;
    margin-bottom: 0.375rem;
  }

  .form-group input {
    padding: 0.75rem;
    font-size: 1rem;
  }

  .auth-btn {
    padding: 1rem;
    font-size: 1rem;
  }

  .auth-divider {
    margin: 1.5rem 0;
  }

  .auth-divider span {
    padding: 0 0.75rem;
    font-size: 0.85rem;
  }

  .auth-footer p {
    font-size: 0.9rem;
  }
}

@media (max-width: 400px) {
  .auth-container {
    padding: 50px 0.5rem 0.5rem;
  }

  .auth-card {
    padding: 1rem;
  }

  .auth-header h1 {
    font-size: 1.25rem;
  }

  .form-group {
    margin-bottom: 0.75rem;
  }

  .form-group input {
    padding: 0.65rem;
    font-size: 16px;
  }

  .auth-btn {
    padding: 0.9rem;
    font-size: 0.95rem;
  }
}
</style>