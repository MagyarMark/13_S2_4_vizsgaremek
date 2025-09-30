<template>
  <header>
    <h1>Smart Manager</h1>
    <button id="menuToggle" aria-label="Menü megnyitása">☰</button>
    <nav id="mainNav">
      <router-link to="/Home">Kezdőlap</router-link>
      <router-link to="/rolunk">Rólunk</router-link>
      <router-link to="/kapcsolat">Kapcsolat</router-link>
      <button id="themeToggle" aria-label="Téma váltása">🌙</button>
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
        <router-link to="/login"><button class="btn">Regisztráció</button></router-link>
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

</template>

<script>
export default {
  name: "Home"
}
</script>