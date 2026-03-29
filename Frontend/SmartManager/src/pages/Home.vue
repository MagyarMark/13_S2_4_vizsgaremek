<template>
    <header>
        <div class="logo">
          Smart<span>Manager</span>
        </div>
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
          <div class="feature-card">
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
                    <p>Adatai biztonságban vannak titkosított felhőtárolással.</p>
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
                        <li><i>📍</i> 6100 Kiskunfélegyháza, Kossuth Lajos utca 24.</li>
                        <li><i>✉️</i> smartmanager.help@gmail.com</li>
                        
                    </ul>
                </div>
                <div class="contact-form">
                    <form action="https://formspree.io/f/xpqppgwl" method="POST">
                    <div class="form-group">
                        <label for="name">Név</label>
                        <input type="text" id="name" name="name" placeholder="Adja meg a nevét">
                    </div>
                    <div class="form-group">
                        <label for="email">Email cím</label>
                        <input type="email" id="email" name="email" placeholder="Adja meg az email címét">
                    </div>
                    <div class="form-group">
                        <label for="message">Üzenet</label>
                        <textarea id="message" name="message" rows="5" placeholder="Írja le üzenetét..."></textarea>
                    </div>
                    <button class="btn primary" type="submit">Üzenet küldése</button>
                    </form>
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
                <h4>Megoldások</h4>
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

window.addEventListener('beforeunload', () => {
  if (menuBtn) menuBtn.removeEventListener('click', toggleMobileNav);
  window.removeEventListener('scroll', onScroll);
});

export default {
  name: "Home",
}
</script>

<style scoped>
main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
  padding: 2rem;
}

main > section:nth-child(3) {
  grid-column: 1 / -1;
  margin-top: 2rem;
}

#landing {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

#landing h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

#landing p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  color: #666;
}

#landing > div {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn.primary {
    color: white;
    border-radius: 50px;
    padding: 10px 20px;
    font-size: 1.1rem;
}

.btn {
    background-color: var(--primary);
    color: white;
    border-radius: 50px;
    padding: 10px 20px;
    font-size: 1.1rem;
}

#features {
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    min-height: 50vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center; 
    padding: 2rem;
    font-size: 1.1rem;
    line-height: 1.6;
    margin: 0;
    padding: 0;
    box-shadow: 0 4px 60px rgb(245, 241, 241);
    border-style: solid ;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1.5rem;
    width: 100%;
    max-width: 1200px;
}

.contact-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    width: 100%;
    max-width: 1200px;
}

.contact-info {
    background: var(--card);
    padding: 1.5rem;
    border-radius: var(--radius);
    box-shadow: var(--shadow);
}

.contact-form {
    background: var(--card);
    padding: 1.5rem;
    border-radius: var(--radius);
    box-shadow: var(--shadow);
}

#contact{
    padding: 2rem;
    text-align: center;
    font-size: 1.1rem;
    line-height: 1.6;
    box-shadow: 0 4px 60px rgb(245, 241, 241);
    border-style: solid ;
}

footer{
    padding: 2rem;
    text-align: center;
    font-size: 1.1rem;
    line-height: 1.6;
    box-shadow: 0 4px 60px rgba(245, 241, 241);
    border-top: 1px solid var(--border);
}

.copyright{
    box-shadow: 0 0px 0px rgba(245, 241, 241);
    border-top: 1px solid var(--border);
}

@media (max-width: 768px) {
  main {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1.5rem;
  }

  main > section:nth-child(3) {
    grid-column: 1;
  }

  #landing h1 {
    font-size: 2rem;
  }

  #landing p {
    font-size: 1rem;
  }

  #landing > div {
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn {
    padding: 12px 24px;
    font-size: 1rem;
    width: 100%;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .contact-container {
    grid-template-columns: 1fr;
  }

  footer {
    padding: 1.5rem;
    font-size: 1rem;
  }
}

@media (max-width: 600px) {
  main {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }

  #landing h1 {
    font-size: 1.5rem;
    margin-bottom: 0.75rem;
  }

  #landing p {
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
  }

  #landing > div {
    flex-direction: column;
  }

  .btn {
    padding: 12px 16px;
    font-size: 0.95rem;
    width: 100%;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .feature-card {
    padding: 1rem;
  }

  .contact-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .contact-info,
  .contact-form {
    padding: 1rem;
  }

  .form-group {
    margin-bottom: 0.75rem;
  }

  .form-group input,
  .form-group textarea {
    padding: 0.75rem;
  }

  footer {
    padding: 1rem;
    font-size: 0.9rem;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (max-width: 400px) {
  main {
    padding: 0.75rem;
  }

  #landing h1 {
    font-size: 1.25rem;
  }

  #landing p {
    font-size: 0.9rem;
  }

  .btn {
    padding: 10px 12px;
    font-size: 0.9rem;
  }

  .features-grid {
    gap: 0.5rem;
  }

  .contact-info h3,
  .contact-form {
    font-size: 1rem;
  }

  footer {
    padding: 0.75rem;
    font-size: 0.85rem;
  }
}
@media (max-width: 1024px) {
  main {
    grid-template-columns: 1fr;
  }

  main > section:nth-child(3) {
    grid-column: 1;
  }
}
</style>