<template>
      <header>
    <h1>Smart Manager</h1>
    <button id="menuToggle" aria-label="Menü megnyitása">☰</button>
    <nav id="mainNav">
      <a href="index.vue">Kezdőlap</a>
      <a href="rolunk.vue">Rólunk</a>
      <a href="kapcsolat.vue">Kapcsolat</a>
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
        <a href="login.vue"><button class="btn">Bejelentkezés</button></a>
      </div>
      <div></div>
      <div class="mid-content-card">
        <h3>Ha még nincs fiókod, regisztrálj, és csatlakozz a Smart Manager közösségéhez!</h3>
        <a href="register.vue"><button class="btn">Regisztráció</button></a>
      </div>
    </div>
  </section>

    <footer>
        <div class="footer-content">
            <h3>Smart Manager</h3>
            <p>&copy; 2025 Smart Manager. Minden jog fenntartva.</p>
            <div class="footer-links">
                <a href="index.vue">Kezdőlap</a>
                <a href="kapcsolat.vue">Kapcsolat</a>
            </div>
        </div>
    </footer>
</template>

<script>
export default {
  name: "About"
}
</script>