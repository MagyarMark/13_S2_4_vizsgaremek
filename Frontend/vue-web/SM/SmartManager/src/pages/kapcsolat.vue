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
    name: "Kapcsolat"
    }
</script>