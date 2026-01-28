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

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: var(--accent);
  color: white;
}

header h1 {
  font-size: 1.8rem;
  margin: 0;
}

nav {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

nav a {
  color: white;
  text-decoration: none;
  font-size: 1rem;
  transition: opacity 0.3s;
}

nav a:hover {
  opacity: 0.8;
}

.theme {
  background: none;
  border: none;
  color: white;
  font-size: 1.3rem;
  cursor: pointer;
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.3rem;
  cursor: pointer;
}

footer {
  background: var(--accent);
  color: white;
  text-align: center;
  padding: 2rem;
  margin-top: 3rem;
}

footer h3 {
  margin-bottom: 0.5rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
}

.footer-links a {
  color: white;
  text-decoration: none;
  transition: opacity 0.3s;
}

.footer-links a:hover {
  opacity: 0.8;
}

/* Responsive Design */
@media (max-width: 768px) {
  header {
    padding: 1rem;
  }

  header h1 {
    font-size: 1.5rem;
  }

  nav {
    display: none;
  }

  nav.active {
    display: flex;
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    flex-direction: column;
    background: var(--accent);
    padding: 1rem;
    gap: 1rem;
  }

  .mobile-menu-btn {
    display: block;
  }

  footer {
    padding: 1.5rem;
    margin-top: 2rem;
  }

  .footer-links {
    flex-direction: column;
    gap: 1rem;
  }
}

@media (max-width: 600px) {
  header {
    padding: 0.75rem;
    flex-direction: column;
    gap: 0.75rem;
  }

  header h1 {
    font-size: 1.3rem;
  }

  nav.active {
    top: 50px;
  }

  footer {
    padding: 1rem;
    font-size: 0.9rem;
  }

  footer h3 {
    font-size: 1.1rem;
  }

  .footer-links {
    gap: 0.75rem;
  }

  .footer-links a {
    font-size: 0.9rem;
  }
}

@media (max-width: 400px) {
  header {
    padding: 0.5rem;
  }

  header h1 {
    font-size: 1.1rem;
  }

  .theme {
    font-size: 1.1rem;
  }

  footer {
    padding: 0.75rem;
    font-size: 0.8rem;
  }

  footer h3 {
    font-size: 1rem;
  }

  .footer-content p {
    margin: 0.25rem 0;
  }

  .footer-links {
    gap: 0.5rem;
  }

  .footer-links a {
    font-size: 0.8rem;
  }
}
</style>