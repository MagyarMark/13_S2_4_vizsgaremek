<!-- Register.vue -->
<template>
  <div id="loader" aria-hidden="true">
    <div class="spinner" role="status" aria-label="Betöltés"></div>
  </div>

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
        <h1>Regisztráció</h1>
        <p>Hozzon létre új fiókot</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-row">
          <div class="form-group">
            <label for="firstName">Keresztnév</label>
            <input 
              type="text" 
              id="firstName" 
              v-model="form.firstName"
              placeholder="Keresztnév" 
              required
            >
          </div>
          <div class="form-group">
            <label for="lastName">Vezetéknév</label>
            <input 
              type="text" 
              id="lastName" 
              v-model="form.lastName"
              placeholder="Vezetéknév" 
              required
            >
          </div>
        </div>

        <div class="form-group">
          <label for="email">Email cím</label>
          <input 
            type="email" 
            id="email" 
            v-model="form.email"
            placeholder="email@pelda.hu" 
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
          <div class="password-strength" :class="passwordStrength">
            Jelszó erősség: {{ passwordStrengthText }}
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Jelszó megerősítése</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="form.confirmPassword"
            placeholder="••••••••" 
            required
          >
        </div>

        <div class="form-group">
          <label>Regisztráció típusa</label>
          <div class="role-options">
            <label class="checkbox">
              <input type="radio" value="diak" v-model="form.role"> <span>Diák</span>
            </label>
            <label class="checkbox">
              <input type="radio" value="tanar" v-model="form.role"> <span>Tanár</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label class="checkbox">
            <input type="checkbox" v-model="form.agreeTerms" required>
            <span>Elfogadom az <a href="#" class="link">Általános Szerződési Feltételeket</a></span>
          </label>
        </div>

        <button type="submit" class="btn primary auth-btn" :disabled="loading || !form.role">
          {{ loading ? 'Regisztráció...' : 'Regisztráció' }}
        </button>
      </form>

      <div class="auth-divider">
        <span>vagy</span>
      </div>

      <div class="auth-footer">
        <p>Már van fiókja? <router-link to="/login">Jelentkezzen be itt</router-link></p>
      </div>
    </div>
  </main>

  <footer>
  &copy; 2025 SmartManager. Minden jog fenntartva.
</footer>

</template>

<script>
export default {
  name: "Register",
  data() {
    return {
      navActive: false,
      loading: false,
      form: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
        agreeTerms: false
      }
    }
  },
  computed: {
    passwordStrength() {
      if (!this.form.password) return 'empty';
      if (this.form.password.length < 6) return 'weak';
      if (this.form.password.length < 8) return 'medium';
      return 'strong';
    },
    passwordStrengthText() {
      const strengths = {
        empty: 'Nincs megadva',
        weak: 'Gyenge',
        medium: 'Közepes',
        strong: 'Erős'
      };
      return strengths[this.passwordStrength];
    }
  },
  methods: {
    toggleMenu() {
      this.navActive = !this.navActive;
    },
    async handleRegister() {
      if (this.form.password !== this.form.confirmPassword) {
        alert('A jelszavak nem egyeznek!');
        return;
      }

      if (!this.form.agreeTerms) {
        alert('El kell fogadnia az Általános Szerződési Feltételeket!');
        return;
      }

        if (!this.form.role) {
          alert('Válassza ki, hogy diák vagy tanár!');
          return;
        }

      this.loading = true;
      
      try {
        // Itt lenne a valós regisztrációs logika
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Sikeres regisztráció után átirányítás
        this.$router.push('/login?registered=true');
      } catch (error) {
        console.error('Regisztrációs hiba:', error);
      } finally {
        this.loading = false;
      }
    },
    socialRegister(provider) {
      alert(`${provider} regisztráció hamarosan elérhető!`);
    }
  },
  mounted() {
    // Loader eltüntetése
    setTimeout(() => {
      const loader = document.getElementById('loader');
      if (loader) {
        loader.classList.add('fade-out');
        setTimeout(() => {
          loader.remove();
        }, 700);
      }
    }, 1000);
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px 2rem 2rem;
}

.auth-card {
  background: var(--card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 3rem;
  width: 100%;
  max-width: 500px;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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

.password-strength {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-align: center;
}

.password-strength.empty {
  color: var(--muted);
  background: transparent;
}

.password-strength.weak {
  color: #f87171;
  background: rgba(248, 113, 113, 0.1);
}

.password-strength.medium {
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.1);
}

.password-strength.strong {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.checkbox {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
}

.checkbox input {
  width: auto;
  margin-top: 0.2rem;
}

.checkbox span {
  color: var(--muted);
  line-height: 1.4;
}

.link {
  color: var(--accent);
  text-decoration: none;
}

.link:hover {
  color: var(--accent2);
  text-decoration: underline;
}

.auth-btn {
  width: 100%;
  padding: 1.2rem;
  font-size: 1.1rem;
  margin-top: 1rem;
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
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .social-auth {
    flex-direction: column;
  }
}
</style>