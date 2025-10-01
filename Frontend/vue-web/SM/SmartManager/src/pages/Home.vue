<template>
<div :class="{ dark: darkTheme }">
<header>
    <h1>Smart Manager</h1>
    <button id="menuToggle" aria-label="Menü megnyitása" @click="toggleMenu">☰</button>
    <nav id="mainNav" :class="{ active: navActive }">
      <router-link to="/Home">Kezdőlap</router-link>
      <router-link to="/rolunk">Rólunk</router-link>
      <router-link to="/kapcsolat">Kapcsolat</router-link>        
      <button class="theme" id="themeToggle" aria-label="Téma váltása" @click="toggleTheme">{{ darkTheme ? "🌙" : "🌞" }}</button>
    </nav>
  </header>

  <section class="hero">
    <h2>Mi is az a <u>Smart Manager</u>?</h2>
    <p>↘️Ha érdekel itt el tudod olvasni!↙️</p>
    <router-link to="/about"><button class="btn">Érdekel</button></router-link>
  </section>

  <section class="mid-section" id="mid-section">
    <h2>Csatlakozz hozzánk!</h2>
    <div class="mid-content-grid">
      <div class="mid-content-card">
        <h3>Ha már van fiókod, jelentkezz be, és kezd el használni a Smart Managert!</h3>
        <router-link to="/login"><button class="btn">Bejelentkezés</button></router-link>
      </div>
      <div></div>
      <div class="mid-content-card">
        <h3>Ha még nincs fiókod, regisztrálj, és csatlakozz a Smart Manager közösségéhez!</h3>
        <router-link to="/register"><button class="btn">Regisztráció</button></router-link>
      </div>
    </div>
  </section>

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
  name: "Home",
  data() {
    return {
      navActive: false,
      darkTheme: false
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
        document.querySelectorAll('h3').forEach(el => {
          el.style.color = '#fff';
        });
      } else {
        document.documentElement.style.setProperty('--bg', '#f1f5f9');
        document.documentElement.style.setProperty('--bg-light', '#e2e8f0');
        document.documentElement.style.setProperty('--text', '#222');
        document.documentElement.style.setProperty('--accent', '#2563eb');
        document.documentElement.style.setProperty('--accent-hover', '#3b82f6');
        document.documentElement.style.setProperty('--gray', '#64748b');
      }
    }
  }
}
</script>