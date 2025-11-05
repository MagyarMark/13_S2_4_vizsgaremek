<template>
  <div id="loader" aria-hidden="true">
        <div class="spinner" role="status" aria-label="Betöltés"></div>
    </div>

    <header>
        <div class="logo">Smart<span>Manager</span></div>
        <nav>
            <button class="mobile-menu-btn" @click="toggleMenu" :aria-expanded="navActive" aria-label="Menü">☰</button>
            <ul :class="{ show: navActive }">
                <li><a href="#landing" @click="navActive = false">Kezdőlap</a></li>
                <li><a href="#features" @click="navActive = false">Funkciók</a></li>
                <li><a href="#contact" @click="navActive = false">Kapcsolat</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section id="landing">
            <h1>Üdv a <span>SmartManager</span> oldalán</h1>
            <p>
                Modern és könnyen használható projektmenedzsment rendszer, amely segít átláthatóan kezelni a
                feladatokat,
                projekteket és csapatmunkát – mindezt letisztult felületen.
            </p>
            <div>
               <router-link to="/login"><button class="btn primary">Bejelentkezés</button></router-link>
               <router-link to="/register"><button class="btn">Regisztráció</button></router-link>
            </div>
        </section>

        <section id="features">
            <div class="section-title">
                <h2 class="logo">Miért válassza a Smart<span>Manager</span>-t?</h2>
                <p>Fedezze fel a hatékony projektmenedzsment kulcsfontosságú funkcióit</p>
            </div>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">📊</div>
                    <h3>Valós idejű elemzés</h3>
                    <p>Követhesse projektjeit valós időben, részletes jelentésekkel és statisztikákkal.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">👥</div>
                    <h3>Csapatmenedzsment</h3>
                    <p>Könnyedén osszon fel feladatokat, kövesse a haladást és kommunikáljon a csapattal.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📅</div>
                    <h3>Hatékony ütemezés</h3>
                    <p>Tervezze meg projekteit részletes idővonalakkal és határidő-kezeléssel.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🔒</div>
                    <h3>Biztonságos adattárolás</h3>
                    <p>Adatai biztonságban vannak titkosított felhőtárolással<!--és biztonsági mentésekkel.-->.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📱</div>
                    <h3>Mobil alkalmazás</h3>
                    <p>Használja bárhol, bármikor iOS és Android eszközön egyaránt.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">💬</div>
                    <h3>Valós idejű kommunikáció</h3>
                    <p>Beépített csevegés és kommentelés a gyors csapatkommunikációért.</p>
                </div>
            </div>
        </section>

        <section id="contact">
            <div class="section-title">
                <h2>Lépjen kapcsolatba velünk</h2>
                <p>Kérdése van? Szívesen segítünk!</p>
            </div>
            <div class="contact-container">
                <div class="contact-info">
                    <h3>Kapcsolati információk</h3>
                    <ul class="contact-details">
                        <li><i>📍</i> 6100 kiskunfélegyháza, Kossuth Lajos utca 24.</li>
                        <li><i>✉️</i> info@smartmanager.hu</li>
                        <!--<li><i>📞</i> +36 1 234 5678</li>
                        <li><i>🕒</i> Hétfő - Péntek: 9:00 - 17:00</li>-->
                    </ul>
                </div>
                <div class="contact-form">
                    <div class="form-group">
                        <label for="name">Név</label>
                        <input type="text" id="name" placeholder="Adja meg a nevét">
                    </div>
                    <div class="form-group">
                        <label for="email">Email cím</label>
                        <input type="email" id="email" placeholder="Adja meg az email címét">
                    </div>
                    <div class="form-group">
                        <label for="message">Üzenet</label>
                        <textarea id="message" rows="5" placeholder="Írja le üzenetét..."></textarea>
                    </div>
                    <button class="btn primary">Üzenet küldése</button>
                </div>
            </div>
        </section>
    </main>

<footer>
        <div class="footer-content">
            <div class="footer-column">
                <h4 class="logo">Smart<span>Manager</span></h4>
                <p>Modern projektmenedzsment megoldás csapatok számára. Egyszerű, hatékony és biztonságos.</p>
            </div>
            <div class="footer-column">
                <!----><h4>Megoldások</h4>
                <ul class="footer-links">
                    <li><a href="#features">Funkciók</a></li>
                    <li><a href="#">Frissítések</a></li>
                </ul>
            </div>
            <div class="footer-column">
                <h4>Támogatás</h4>
                <ul class="footer-links">
                    <li><a href="#contact">Segítségközpont</a></li>
                    <li><a href="#contact">Kapcsolat</a></li>
                </ul>
            </div>
            <div class="footer-column">
                <h4>Vállalat</h4>
                <ul class="footer-links">
                    <li><a href="#">Rólunk</a></li>
                    <li><a href="#">Általános Szerződési Feltételek</a></li>
                </ul>
            </div>
        </div>
        <div class="copyright">
            &copy; 2025 SmartManager. Minden jog fenntartva.
        </div>
    </footer>
</template>

<script>
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (!loader) return;
    loader.classList.add('fade-out');
    setTimeout(() => {
      loader.remove();
    }, 700);
  }, 1500);
});

const menuBtn = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
const headerEl = document.querySelector('header');

function toggleMobileNav() {
  if (!mainNav) return;
  mainNav.classList.toggle('active');
}

if (menuBtn) menuBtn.addEventListener('click', toggleMobileNav);

function onScroll() {
  if (!headerEl) return;
  headerEl.style.background = window.scrollY > 50
    ? 'rgba(8, 24, 39, 0.95)'
    : 'rgba(8, 24, 39, 0.85)';
}

window.addEventListener('scroll', onScroll);

// Cleanup listeners when the page is unloaded/reloaded
window.addEventListener('beforeunload', () => {
  if (menuBtn) menuBtn.removeEventListener('click', toggleMobileNav);
  window.removeEventListener('scroll', onScroll);
});

export default {
  name: "Home",
  data() {
    return {
      navActive: false,
    }
  },
  methods: {
    toggleMenu() {
      this.navActive = !this.navActive;
    }
  }
}
</script>