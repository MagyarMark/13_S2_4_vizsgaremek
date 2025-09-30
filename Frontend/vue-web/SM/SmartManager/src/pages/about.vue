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
</template>

<script>
export default {
  name: "About"
}
</script>

