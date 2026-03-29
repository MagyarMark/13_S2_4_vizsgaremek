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
import { useRoute } from 'vue-router';
import { getApiUrl } from '../utils/api';

export default {
  setup() {
    const route = useRoute();
    return { route };
  },
  data() {
    return {
      email: '',
      fullName: '',
      password: '',
      confirmPassword: '',
      message: '',
      messageType: 'success',
      loading: false,
      token: '' 
    };
  },
  mounted() {
    this.token = this.$route.query.token;
    
    if (!this.token) {
      this.message = 'Hiányzik a reaktivációs token. Kérem, követje az emailben küldött linket.';
      this.messageType = 'error';
    }
  },
  methods: {
    async reactivateAccount() {
      if (!this.email.trim() || !this.fullName.trim() || !this.password.trim()) {
        this.message = 'Kérem, töltse ki az összes mezőt.';
        this.messageType = 'error';
        return;
      }

      if (this.password !== this.confirmPassword) {
        this.message = 'A jelszavak nem egyeznek meg.';
        this.messageType = 'error';
        return;
      }

      if (this.password.length < 6) {
        this.message = 'A jelszó legalább 6 karakter hosszú kell, hogy legyen.';
        this.messageType = 'error';
        return;
      }

      if (!this.token) {
        this.message = 'Hiányzik a reaktivációs token.';
        this.messageType = 'error';
        return;
      }

      this.loading = true;
      try {
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

        if (!response.ok) {
          throw new Error(data.message || 'Hiba történt az újraaktiválás során.');
        }
        
        this.message = data.message || 'Fiók sikeresen újraaktiválva!';
        this.messageType = 'success';
        
        setTimeout(() => {
          this.$router.push('/login');
        }, 2000);
        
      } catch (error) {
        console.error('Újraaktiválási hiba:', error);
        this.message = error.message || 'Hiba történt az újraaktiválás során.';
        this.messageType = 'error';
      } finally {
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
</style>