<template>
<div :class="{ dark: darkTheme }">
<header>
    <h1>Smart Manager</h1>
    <button id="menuToggle" aria-label="Menü megnyitása" @click="toggleMenu">☰</button>
    <nav id="mainNav" :class="{ active: navActive }">
      <router-link to="/Home">Kezdőlap</router-link>
      <router-link to="/rolunk">Rólunk</router-link>
      <router-link to="/kapcsolat">Kapcsolat</router-link>        
      <button class="theme" id="themeToggle" aria-label="Téma váltása" @click="toggleTheme">{{ darkTheme ? "🌞" : "🌙" }}</button>
    </nav>
  </header>

    <section class="hero">
        <h2>Üdv, Tanár!</h2>
        <p>Kellemes időtöltést kívánunk!</p>
    </section>

    <section class="mid-section" id="mid-section">
        <h2>Válassz egy lehetőséget és kezd el használni a Smart Managert!</h2>
        <div class="mid-content-grid">
            <div class="mid-content-card">
                <h3>Feladatkezelés</h3>
                <p>Itt kezelheted a diákok feladatait és nyomon követheted a határidőket.</p>
                <a href="tasks.html"><button class="btn">Feladatok</button></a>
            </div>
            <div class="mid-content-card">
                <h3>Értékelés és Visszajelzés</h3>
                <p>Itt értékelheted a diákok munkáját és adhatsz visszajelzést nekik.</p>
                <a href="settings.html"><button class="btn">Beállítások</button></a>
            </div>
            <div class="mid-content-card">
                <h3>Statisztika és Kommunikáció</h3>
                <p>Itt nyomon követheted a diákok teljesítményét és kommunikálhatsz velük.</p>
                <a href="dashboard.html"><button class="btn">Dashboard</button></a>
            </div>
        </div>
    </section>

    <section class="news-section" id="hirek">
        <h2>📰 Újdonságok</h2>
        <div class="news-container">
            <div class="news-item">
                <h3>info1</h3>
                <p>info</p>
            </div>
            <div class="news-item">
                <h3>info2</h3>
                <p>info</p>
            </div>
            <div class="news-item">
                <h3>info3</h3>
                <p>info</p>
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
  name: "Tanar",
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