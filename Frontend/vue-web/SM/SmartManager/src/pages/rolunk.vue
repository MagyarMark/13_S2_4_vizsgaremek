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

  <main class="about-page">
    <section class="about-hero">
    <h2>Üdvözlünk a Smart Manager világában!</h2>
    <p>
        A <strong>Smart Manager</strong> egy modern, magyar nyelvű projektkezelő platform diákoknak és tanároknak. Célunk, hogy az iskolai és tanulmányi projektek szervezése átlátható, egyszerű és motiváló legyen minden résztvevő számára. A Smart Manager segít abban, hogy a tanulás és a közös munka ne kötelesség, hanem élvezetes, hatékony és támogató élmény legyen!
    </p>
    </section>

    <section class="about-mission">
      <h3>🎯 Küldetésünk</h3>
      <p>
        Hiszünk abban, hogy a projektek kezelése mindenki számára átláthatóvá és egyszerűvé tehető – a megfelelő eszközökkel és támogatással. Ezért fejlesztjük a Smart Manager-t modern funkciókkal, automatizált folyamatokkal, vizuális riportokkal és könnyen használható kezelőfelülettel.
        <br><br>
        A rendszert úgy alakítjuk ki, hogy akár kezdőként is magabiztosan használhasd – és ha elakadnál, a beépített kapcsolat modul mindig aktív.
      </p>
    </section>

    <section class="about-team">
      <h3>🧑‍💻 A fejlesztés mögött</h3>
      <div class="team-grid">
        <div class="team-member">
          <img src="/mark.jpg" alt="Frontend" />
          <h4>Márk</h4>
          <p>Frontend</p>
        </div>
        <div class="team-member">
          <img src="/huba.jpg" alt="Backend"/>
          <h4>Huba</h4>
          <p>Bakend</p>
        </div>
      </div>
    </section>

    <section class="about-values">
      <h3>💡 Alapelveink</h3>
      <ul>
        <li>📊 Átlátható, könnyen kezelhető felület</li>
        <li>🔒 Biztonságos adatkezelés és jogosultságkezelés</li>
        <li>📱 Reszponzív, mobilbarát design</li>
        <li>⚡ Automatizált riportok és értesítések</li>
        <li>🤝 Folyamatos támogatás és közösségi visszajelzés</li>
      </ul>
    </section>

    <section class="about-future">
      <h3>🚀 Merre tartunk?</h3>
    <p>A Smart Manager folyamatosan fejlődik: új funkciókat, automatizált riportokat és integrációkat vezetünk be, hogy még hatékonyabbá tegyük a vállalkozások mindennapjait. Célunk egy átlátható, könnyen kezelhető és mobilbarát rendszer kialakítása, amely támogatja a modern üzleti igényeket és segíti a felhasználókat a sikeres működésben.</p>
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
</template>

<script>
export default {
    name: "Rolunk"
    }
</script>