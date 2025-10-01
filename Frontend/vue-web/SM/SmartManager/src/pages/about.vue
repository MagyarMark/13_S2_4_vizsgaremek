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
        <h2 id="colortext">Üdv, Örülünk, hogy itt vagy!</h2>
        <p>Fedezd fel a Smart Manager előnyeit és lehetőségeit!</p>
        <p><u>Velünk minden egyszerűen kezelhető!</u></p>
    </section>

    <section class="mid-section" id="mid-section">
        <div class="mid-content-grid">
            <div class="mid-content-card">
                <p>A Smart Manager egy projektmenedzsment rendszer. A szoftver támogatja az általános felhasználást,
                    illetve akár tanárok és diákok közötti hatékony együttműködést is elősegítheti.</p>
            </div>
            <div class="mid-content-card">
                <p>A Smart Manager segítségével a felhasználók könnyedén nyomon követhetik a projektjeiket, kezelhetik a
                    feladatokat, és együttműködhetnek csapatukkal.</p>
            </div>
        </div>
    </section>

      <section class="mid-section" style="background-color: var(--bg);">
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
  name: "About",
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
        document.querySelectorAll('h3').forEach(el => {
          el.style.color = '#fff';
        });
      }
    }
  }
}
</script>

