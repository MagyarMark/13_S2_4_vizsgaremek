<template>
  <div class="verify-email-container">
    <div class="card">
      <div v-if="loading" class="state-message">
        <h2>Email megerősítés alatt...</h2>
        <p>Kérjük, várjon...</p>
      </div>

      <div v-else-if="success" class="state-message success">
        <h2>Email sikeresen megerősítve! ✓</h2>
        <p>{{ message }}</p>
        <p class="redirect-text">Átirányítás a Home oldalra...</p>
      </div>

      <div v-else class="state-message error">
        <h2>Hiba az email megerősítés során</h2>
        <p>{{ message }}</p>
        <router-link to="/" class="btn">Vissza a Home oldalra</router-link>
      </div>
    </div>
  </div>
</template>

<script>
// route és router a token olvasásához, illetve az átirányításhoz
import { useRoute, useRouter } from 'vue-router';
// onMounted lifecycle és reaktív állapotok
import { onMounted, onUnmounted, ref } from 'vue';
// központi API URL helper
import { getApiUrl } from '../utils/api';

export default {
  name: 'VerifyEmail',
  setup() {
    // query paraméterek elérése a megerősítő tokenhez
    const route = useRoute();
    // sikeres megerősítés utáni navigációhoz
    const router = useRouter();

    // betöltési, siker és üzenet állapotok
    const loading = ref(true);
    const success = ref(false);
    const message = ref('');
    let redirectTimerId = null;

    // komponens induláskor email megerősítés a token alapján
    onMounted(async () => {
      const token = route.query.token;

      // token hiányában azonnal hibát jelezünk
      if (!token) {
        loading.value = false;
        success.value = false;
        message.value = 'Érvénytelen vagy hiányzó megerősítő link.';
        return;
      }

      try {
        // email megerősítés backend hívása a tokennel
        const response = await fetch(getApiUrl(`/api/auth/verify-email?token=${token}`));
        const data = await response.json();

        // a kérés befejeződött, a loading állapot lekapcsolása
        loading.value = false;

        // sikeres vagy hibás backend válasz kezelése
        if (data.success) {
          success.value = true;
          message.value = 'Az email cím sikeresen megerősítve. Bejelentkezhet az alkalmazásba.';
          // siker esetén 5 mp várakozás után vissza a főoldalra
          redirectTimerId = window.setTimeout(() => {
            router.push('/');
          }, 5000);
        } else {
          success.value = false;
          message.value = data.message || 'Hiba az email megerősítés során.';
        }
      } catch (error) {
        // szerver vagy hálózati hiba kezelése
        loading.value = false;
        success.value = false;
        message.value = 'Szerverhiba a megerősítés során. Kérjük, próbálja később.';
        console.error('Email verification error:', error);
      }
    });

    onUnmounted(() => {
      if (redirectTimerId) {
        clearTimeout(redirectTimerId);
        redirectTimerId = null;
      }
    });

    // template-ben használt state-ek exportja
    return {
      loading,
      success,
      message
    };
  }
};
</script>

<style scoped>
.verify-email-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Arial', sans-serif;
  padding: 20px;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  padding: 40px;
  max-width: 500px;
  width: 100%;
  text-align: center;
}

.state-message {
  animation: fadeIn 0.5s ease-in;
}

.state-message h2 {
  color: #333;
  margin-bottom: 15px;
  font-size: 24px;
}

.state-message p {
  color: #666;
  font-size: 16px;
  margin: 10px 0;
}

.state-message.success h2 {
  color: #10b981;
}

.state-message.success p {
  color: #059669;
}

.state-message.error h2 {
  color: #ef4444;
}

.state-message.error p {
  color: #dc2626;
}

.redirect-text {
  margin-top: 15px;
  font-size: 14px;
  font-style: italic;
}

.btn {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 30px;
  background-color: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-size: 16px;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #764ba2;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 600px) {
  .verify-email-container {
    padding: 16px;
  }

  .card {
    padding: 24px 20px;
  }

  .state-message h2 {
    font-size: 1.35rem;
  }

  .state-message p,
  .btn {
    font-size: 0.95rem;
  }

  .btn {
    width: 100%;
    padding: 12px 20px;
  }
}

@media (max-width: 400px) {
  .card {
    padding: 20px 16px;
  }

  .state-message h2 {
    font-size: 1.15rem;
  }

  .state-message p {
    font-size: 0.9rem;
  }
}
</style>
