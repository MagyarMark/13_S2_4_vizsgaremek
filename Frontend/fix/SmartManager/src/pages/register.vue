<!-- Register.vue -->
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
        <h1>Regisztráció</h1>
        <p>Hozzon létre új fiókot</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="username">Felhasználónév</label>
          <input
            type="text"
            id="username"
            v-model="form.username"
            placeholder="Felhasználónév"
            required
          >
        </div>

        <div class="form-group">
          <label for="fullName">Teljes név</label>
          <input 
            type="text" 
            id="fullName" 
            v-model="form.fullName"
            placeholder="Teljes név" 
            required
          >
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
            <span>Elfogadom az  <router-link to="/terms">Általános Szerződési Feltételeket</router-link></span>
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
        username: '',
        fullName: '',
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
        // Valós regisztráció a backend felé
        const response = await fetch('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            felhasznalonev: this.form.username,
            jelszo: this.form.password,
            email: this.form.email,
            teljes_nev: this.form.fullName,
            szerep_tipus: this.form.role
          })
        });

        const data = await response.json();
        if (response.ok && data.success) {
          // Átirányítás bejelentkezéshez
          this.$router.push('/login?registered=true');
        } else {
          // Sikertelen regisztráció, hiba üzenet
          const msg = data && data.message ? data.message : 'Regisztráció sikertelen';
          alert(msg);
        }
      } catch (error) {
        console.error('Regisztrációs hiba:', error);
        alert('Szerverhiba történt a regisztráció során.');
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
    padding: 60px 1rem 1rem;
  }
  
  .auth-card {
    padding: 2rem;
    max-width: 100%;
  }

  .auth-header h1 {
    font-size: 1.8rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .social-auth {
    flex-direction: column;
  }

  .role-options {
    flex-direction: column;
    gap: 0.75rem;
  }
}

@media (max-width: 600px) {
  .auth-container {
    padding: 50px 0.75rem 0.75rem;
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

  .password-strength {
    font-size: 0.75rem;
    margin-top: 0.375rem;
  }

  .role-options {
    flex-direction: column;
    gap: 0.5rem;
  }

  .checkbox {
    font-size: 0.85rem;
  }

  .auth-btn {
    padding: 1rem;
    font-size: 1rem;
    margin-top: 0.75rem;
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
    padding: 40px 0.5rem 0.5rem;
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