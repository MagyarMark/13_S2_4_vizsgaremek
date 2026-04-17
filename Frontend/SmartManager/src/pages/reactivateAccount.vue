<template>
  
  <div class="reactivate-account">
    <h1>Fiók újraaktiválása</h1>
    <div class="reactivation-form">
      <p>Kérem, adja meg az alábbi adatokat a fiók újraaktiválásához:</p>
      
      
      <input 
        v-model="email" 
        type="email" 
        placeholder="E-mail cím" 
        required
        :disabled="loading"
      />
      
      
      <input 
        v-model="fullName" 
        type="text" 
        placeholder="Teljes név" 
        required
        :disabled="loading"
      />
      
      
      <input 
        v-model="password" 
        type="password" 
        placeholder="Jelszó" 
        required
        :disabled="loading"
      />
      
      
      <input 
        v-model="confirmPassword" 
        type="password" 
        placeholder="Jelszó megerősítése" 
        required
        :disabled="loading"
      />
      
      
      <button @click="reactivateAccount" :disabled="loading">
        {{ loading ? 'Mentés...' : 'Fiók újraaktiválása' }}
      </button>
    </div>

    
    <p v-if="message" :class="messageType">{{ message }}</p>
  </div>
</template>

<script>
// route query olvasása a reaktivációs tokenhez
import { useRoute } from 'vue-router';
// központi API URL helper
import { getApiUrl } from '../utils/api';

export default {
  setup() {
    // aktuális route elérhetővé tétele (query paraméterekhez)
    const route = useRoute();
    return { route };
  },
  data() {
    return {
      // űrlap mezők
      email: '',
      fullName: '',
      password: '',
      confirmPassword: '',

      // felhasználói visszajelző üzenet és típusa
      message: '',
      messageType: 'success',

      // folyamatjelző állapot (gomb/input tiltása)
      loading: false,

      // emailben kapott reaktivációs token
      token: '' 
    };
  },
  mounted() {
    // token kiolvasása a query stringből
    this.token = this.$route.query.token;
    
    // ha nincs token, azonnali hibaüzenet megjelenítése
    if (!this.token) {
      this.message = 'Hiányzik a reaktivációs token. Kérem, követje az emailben küldött linket.';
      this.messageType = 'error';
    }
  },
  methods: {
    // fiók újraaktiválás: kliens oldali validáció + backend kérés
    async reactivateAccount() {
      // kötelező mezők ellenőrzése
      if (!this.email.trim() || !this.fullName.trim() || !this.password.trim()) {
        this.message = 'Kérem, töltse ki az összes mezőt.';
        this.messageType = 'error';
        return;
      }

      // jelszó és megerősítés egyezőségének ellenőrzése
      if (this.password !== this.confirmPassword) {
        this.message = 'A jelszavak nem egyeznek meg.';
        this.messageType = 'error';
        return;
      }

      // minimális jelszóhossz ellenőrzése
      if (this.password.length < 6) {
        this.message = 'A jelszó legalább 6 karakter hosszú kell, hogy legyen.';
        this.messageType = 'error';
        return;
      }

      // token meglétének ellenőrzése kérés előtt
      if (!this.token) {
        this.message = 'Hiányzik a reaktivációs token.';
        this.messageType = 'error';
        return;
      }

      this.loading = true;
      try {
        // reaktivációs kérés backend felé
        const response = await fetch(getApiUrl('/api/auth/reactivate-account'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            token: this.token,
            email: this.email,
            jelszo: this.password,
            teljes_nev: this.fullName
          })
        });

        const data = await response.json();

        // nem 2xx válasz esetén backend hibaüzenet dobása
        if (!response.ok) {
          throw new Error(data.message || 'Hiba történt az újraaktiválás során.');
        }
        
        // sikeres reaktiválás visszajelzés
        this.message = data.message || 'Fiók sikeresen újraaktiválva!';
        this.messageType = 'success';
        
        // rövid visszajelzés után átirányítás a login oldalra
        setTimeout(() => {
          this.$router.push('/login');
        }, 2000);
        
      } catch (error) {
        // hálózati/backend hiba kezelése
        console.error('Újraaktiválási hiba:', error);
        this.message = error.message || 'Hiba történt az újraaktiválás során.';
        this.messageType = 'error';
      } finally {
        // loading állapot visszaállítása minden esetben
        this.loading = false;
      }
    }
  }
};
</script>
<style scoped>
.reactivate-account {
  max-width: 500px;
  margin: 0 auto;
  padding: 30px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.reactivate-account h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.username-check,
.reactivation-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.reactivate-account p {
  margin: 10px 0;
  color: #666;
  font-weight: 500;
}

.reactivate-account input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.reactivate-account input:focus {
  outline: none;
  border-color: #007BFF;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
}

.reactivate-account input:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.reactivate-account button {
  padding: 12px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.3s;
}

.reactivate-account button:hover:not(:disabled) {
  background-color: #0056b3;
}

.reactivate-account button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.7;
}

.secondary-btn {
  background-color: #6c757d;
  margin-top: 10px;
}

.secondary-btn:hover {
  background-color: #5a6268;
}

.reactivate-account p.success {
  color: #28a745;
  text-align: center;
  padding: 10px;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  margin-top: 20px;
}

.reactivate-account p.error {
  color: #dc3545;
  text-align: center;
  padding: 10px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  margin-top: 20px;
}

@media (max-width: 600px) {
  .reactivate-account {
    margin: 1rem;
    padding: 20px;
  }

  .reactivate-account h1 {
    margin-bottom: 20px;
    font-size: 1.5rem;
  }

  .reactivate-account input,
  .reactivate-account button {
    padding: 14px 12px;
    font-size: 1rem;
  }
}

@media (max-width: 400px) {
  .reactivate-account {
    margin: 0.75rem;
    padding: 16px;
  }

  .reactivate-account h1 {
    font-size: 1.25rem;
  }

  .reactivate-account input {
    font-size: 16px;
  }
}
</style>