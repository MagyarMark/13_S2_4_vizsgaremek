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
    name: "Kapcsolat",
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