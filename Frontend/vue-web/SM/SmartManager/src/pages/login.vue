<template>
<div :class="{ dark: darkTheme }">
<header>
    <h1>Smart Manager</h1>
    <button id="menuToggle" aria-label="Menü megnyitása" @click="toggleMenu">☰</button>
    <nav id="mainNav" :class="{ active: navActive }">
      <router-link to="/Home">Kezdőlap</router-link>
      <router-link to="/rolunk">Rólunk</router-link>
      <router-link to="/kapcsolat">Kapcsolat</router-link>
      <button class="theme" id="themeToggle" aria-label="Téma váltása" @click="toggleTheme">{{ darkTheme ?  "🌙" : "🌞" }}</button>
    </nav>
  </header>

      <main>
        <section class="mid-section" style="padding-top:3rem;">
            <div class="mid-content-grid">
                <div class="mid-content-card" style="margin:0 auto;">
                    <h2>Bejelentkezés</h2>
                    <form action="#" method="post" style="margin-top:1rem;display:flex;flex-direction:column;gap:12px;">
                        <input type="text" name="username" placeholder="Felhasználónév" required
                            style="padding:10px;border-radius:8px;border:1px solid #2b3646;background:#0f172a;color:var(--text);">
                        <input type="password" name="password" placeholder="Jelszó" required
                            style="padding:10px;border-radius:8px;border:1px solid #2b3646;background:#0f172a;color:var(--text);">
                        <select v-model="userType" required style="padding:10px;border-radius: 8px;border:1px solid #2b3646;background:#0f172a;color:var(--text);">
                            <option disabled value="">Válassz típust</option>
                            <option value="diak">Diák</option>
                            <option value="tanar">Tanár</option>
                        </select>
                        <button class="btn" type="button" v-if="userType === 'diak' || userType === 'tanar'" style="margin-top: 2px;" @click="login">Bejelentkezés</button>
                    </form>
                    <p style="margin-top:12px;color:var(--gray);">Még nincs fiókod? <router-link to="/register">Regisztráció</router-link></p>
                </div>
            </div>
        </section>
    </main>

    <footer>
        <div class="footer-content">
            <h3>Smart Manager</h3>
            <p>&copy; 2025 Smart Manager. Minden jog fenntartva.</p>
                <div class="footer-links">
                    <router-link to="/Home">Kezdőlap</router-link>
                    <router-link to="/kapcsolat">Kapcsolat</router-link>
                </div>
        </div>
  </footer>
  </div>
</template>

<script>
export default {
        name: "Login",
        data() {
    return {
      navActive: false,
      darkTheme: false,
      userType: ""
    }
  },
  methods: {
    toggleMenu() {
      this.navActive = !this.navActive;
    },
    toggleTheme() {
      this.darkTheme = !this.darkTheme;
      if (this.darkTheme) {
        document.documentElement.style.setProperty('--bg', '#0f172a');
        document.documentElement.style.setProperty('--bg-light', '#1e293b');
        document.documentElement.style.setProperty('--text', '#f1f5f9');
        document.documentElement.style.setProperty('--accent', '#3b82f6');
        document.documentElement.style.setProperty('--accent-hover', '#2563eb');
        document.documentElement.style.setProperty('--gray', '#94a3b8');
      } else {
        document.documentElement.style.setProperty('--bg', '#f1f5f9');
        document.documentElement.style.setProperty('--bg-light', '#e2e8f0');
        document.documentElement.style.setProperty('--text', '#222');
        document.documentElement.style.setProperty('--accent', '#2563eb');
        document.documentElement.style.setProperty('--accent-hover', '#3b82f6');
        document.documentElement.style.setProperty('--gray', '#64748b');
        document.querySelectorAll('h3').forEach(el => {
          el.style.color = '#fff';
        });
      }
    },
    login() {
        if (this.userType === 'diak') {
            this.$router.push('/diak');
        } else if (this.userType === 'tanar') {
            this.$router.push('/tanar');
        }
    }
  }
}
</script>