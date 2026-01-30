<template>
      <header>
    <div class="logo">Smart<span>Manager</span></div>
    <nav>
      <button class="mobile-menu-btn" @click="toggleMenu" :aria-expanded="navActive" aria-label="Menü">☰</button>
      <ul :class="{ show: navActive }">
        <li><a href="Home.vue" @click="navActive = false">Kezdőlap</a></li>
      </ul>
    </nav>
  </header>
    <main class="terms-container">
        <div class="terms-card">
            <h2>Általános Szerződési Feltételek</h2>
            <p>Üdvözöljük a SmartManager Általános Szerződési Feltételeiben ("ÁSZF"). Kérjük, figyelmesen olvassa el ezeket a feltételeket, mielőtt használja szolgáltatásainkat.</p>
            <div class="text-accept">
            <p>Amennyiben elfogadja az <span style="text-decoration: underline;">ÁSZF</span>-ket, akkor kérem kattintson ide: <router-link to="/register"><button class="accept_button">Elfogadom</button></router-link></p>
            </div>
        </div>
        <div class="text-card">
            <h1><b>SmartManager Általános Szerződési Feltételei</b></h1>
            <h3>1. Szolgáltatások</h3>
            <p>A SmartManager egy online platform, amely lehetővé teszi a felhasználók számára, hogy kezeljék tanulmányi és oktatási tevékenységeiket. A szolgáltatások részleteit a weboldalunkon találja.</p>
            <h3>2. Felhasználói Fiók</h3>
            <p>Regisztrációkor köteles valós és pontos információkat megadni. Felelős a fiókja biztonságáért és az összes tevékenységért, amely a fiókjához kapcsolódik.</p>
            <h3>3. Adatvédelem</h3>
            <p>Az Ön adatainak védelme fontos számunkra. Kérjük, olvassa el az Adatvédelmi Szabályzatunkat, hogy megértse, hogyan kezeljük személyes adatait.</p>
            <h3>4. Felelősség Korlátozása</h3>
            <p>A SmartManager nem vállal felelősséget semmilyen közvetlen vagy közvetett károkért, amelyek a szolgáltatásaink használatából erednek.</p>
            <h3>5. Módosítások</h3>
            <p>Fenntartjuk a jogot, hogy bármikor módosítsuk az ÁSZF-ket. A módosítások a weboldalon történő közzétételkor lépnek hatályba.</p>
            <h3>6. Kapcsolat</h3>
            <p>Ha bármilyen kérdése van az ÁSZF-kel kapcsolatban, kérjük, lépjen kapcsolatba velünk a weboldalunkon.</p>
        </div>
        <br>

        
    </main>
<footer>
    &copy; 2025 SmartManager. Minden jog fenntartva.
</footer>
</template>

<script>

export default {
    name: "Terms"
}
</script>

<style>
.terms-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 80vh;
    background-color: var(--background);
    padding: 20px;
}

.terms-card {
    background: var(--card);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 2rem;
    max-width: 800px;
    width: 100%;
}

.text-card {
    background: var(--card);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 2rem;
    max-width: 800px;
    width: 100%;
    margin-top: 20px;
}

.text-accept {
    background: var(--card);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 2rem;
    max-width: 800px;
    width: 100%;
    margin-top: 20px;
    text-align: center;
    font-size: 20px;
}

.accept_button{
    background-color: var(--primary);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: var(--radius);
    cursor: pointer;
    font-size: 16px;
}

.text-card h1, .terms-card h2 {
    color: var(--text);
    margin-bottom: 1rem;
    text-decoration: underline;
}

@media (max-width: 768px) {
  .terms-container {
    padding: 1rem;
    min-height: 60vh;
  }

  .terms-card,
  .text-card,
  .text-accept {
    padding: 1.5rem;
    max-width: 100%;
    margin-top: 1rem;
  }

  .terms-card h2,
  .text-card h1 {
    font-size: 1.3rem;
  }

  .text-card h3 {
    font-size: 1.1rem;
  }

  .text-card p {
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .accept_button {
    padding: 0.75rem 1.5rem;
    font-size: 0.95rem;
  }
}

@media (max-width: 600px) {
  header {
    padding: 0 1rem;
  }

  .terms-container {
    padding: 0.75rem;
  }

  .terms-card,
  .text-card,
  .text-accept {
    padding: 1rem;
    margin-top: 0.75rem;
  }

  .terms-card h2,
  .text-card h1 {
    font-size: 1.15rem;
    margin-bottom: 0.75rem;
  }

  .text-card h3 {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  .text-card p {
    font-size: 0.9rem;
    line-height: 1.4;
    margin-bottom: 0.5rem;
  }

  .text-accept {
    font-size: 1rem;
  }

  .accept_button {
    padding: 0.65rem 1.2rem;
    font-size: 0.9rem;
  }

  footer {
    padding: 1rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 400px) {
  header {
    padding: 0 0.75rem;
  }

  .terms-container {
    padding: 0.5rem;
  }

  .terms-card,
  .text-card,
  .text-accept {
    padding: 0.75rem;
    margin-top: 0.5rem;
  }

  .terms-card h2,
  .text-card h1 {
    font-size: 1rem;
  }

  .text-card h3 {
    font-size: 0.95rem;
  }

  .text-card p {
    font-size: 0.85rem;
  }

  .accept_button {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }

  footer {
    padding: 0.75rem;
    font-size: 0.85rem;
  }
}
</style>