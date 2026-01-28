<template>
  <div class="dashboard-wrapper">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="logo">
        <h2>Smart<span>Manager</span></h2>
        <p v-if="userProfile.szerep_tipus === 'tanar'">Tanári Portál</p>
        <p v-else>Diák Portál</p>
      </div>

      <!-- Tanár navigáció -->
      <ul v-if="userProfile.szerep_tipus === 'tanar'" class="nav-links">
        <router-link to="/tanar"><li><i class="fas fa-home"></i> Áttekintés</li></router-link>
        <router-link to="/Ttask"><li><i class="fas fa-tasks"></i> Feladatok</li></router-link>
        <router-link to="/ertekeles"><li><i class="fas fa-check-circle"></i> Értékelés</li></router-link>
        <router-link to="/chat"><li><i class="fas fa-comments"></i> Üzenetek</li></router-link>
        <router-link to="/settings" class="active"><li ><i class="fas fa-cog"></i> Beállítások</li></router-link>
      </ul>

      <!-- Diák navigáció -->
      <ul v-else class="nav-links">
        <router-link to="/diak"><li><i class="fas fa-home"></i> Áttekintés</li></router-link>
        <router-link to="/task"><li><i class="fas fa-tasks"></i> Feladatok</li></router-link>
        <router-link to="/teamwork"><li><i class="fas fa-users"></i> Csapatmunka</li></router-link>
        <router-link to="/chat"><li><i class="fas fa-comments"></i> Üzenetek</li></router-link>
        <router-link to="/settings" class="active"><li><i class="fas fa-cog"></i> Beállítások</li></router-link>
      </ul>
    </aside>

    <!-- Main content -->
    <main class="main-content">
      <!-- Header -->
      <header class="page-header">
        <div class="header-left">
          <h1>Beállítások</h1>
        </div>
        <div class="header-right">
          <div class="notifications">
            <button class="notifications-button" title="Értesítések"><i class="fas fa-bell"></i></button>
          </div>
          <div class="user-profile">
            <div class="avatar">{{ userProfile.initials }}</div>
            <div>
              <div class="user-name">{{ userProfile.teljes_nev || userProfile.felhasznalonev }}</div>
              <div class="user-role">{{ getRoleLabel(userProfile.szerep_tipus) }}</div>
            </div>
            <div class="logout-button">
              <button @click="logout" title="Kijelentkezés"><i class="fas fa-sign-out-alt"></i></button>
            </div>
          </div>
        </div>
      </header>

      <!-- Settings panel -->
      <section class="settings-panel">
        <nav class="settings-nav">
          <button :class="{active: activeTab==='profile'}" @click="activeTab='profile'"><i class="fas fa-user"></i> Profil</button>
          <button :class="{active: activeTab==='account'}" @click="activeTab='account'"><i class="fas fa-lock"></i> Fiók</button>
          <button :class="{active: activeTab==='notifications'}" @click="activeTab='notifications'"><i class="fas fa-bell"></i> Értesítések</button>
          <button :class="{active: activeTab==='appearance'}" @click="activeTab='appearance'"><i class="fas fa-paint-roller"></i> Megjelenés</button>
        </nav>

        <div class="settings-content">
          <!-- Profile -->
          <div v-if="activeTab === 'profile'" class="card">
            <h2>Profil szerkesztése</h2>
            <form @submit.prevent="saveProfile">
              <div class="form-row">
                <label>Teljes név</label>
                <input v-model="profile.teljes_nev" type="text" required />
              </div>
              <div class="form-row">
                <label>Felhasználónév</label>
                <input v-model="profile.felhasznalonev" type="text" disabled />
              </div>
              <div class="form-row">
                <label>Email</label>
                <input v-model="profile.email" type="email" required />
              </div>
              <div class="form-actions">
                <button type="button" class="btn secondary" @click="resetProfile">Visszaállít</button>
                <button type="submit" class="btn primary">Mentés</button>
              </div>
              <div v-if="message.profile" class="message">{{ message.profile }}</div>
            </form>
          </div>

          <!-- Account -->
          <div v-if="activeTab === 'account'" class="card">
            <h2>Fiók beállítások</h2>
            <form @submit.prevent="saveAccount">
              <div class="form-row">
                <label>E-mail cím</label>
                <input v-model="account.email" type="email" required />
              </div>
              <div class="form-row">
                <label>Felhasználónév</label>
                <input v-model="account.felhasznalonev" type="text" disabled />
              </div>

              <h3>Jelszó módosítás</h3>
              <div class="form-row">
                <label>Új jelszó</label>
                <input v-model="password.new" type="password" placeholder="Hagyja üresen, ha nem szeretne változtatni" />
              </div>
              <div class="form-row">
                <label>Új jelszó (újra)</label>
                <input v-model="password.confirm" type="password" placeholder="Hagyja üresen, ha nem szeretne változtatni" />
              </div>

              <div class="form-actions">
                <button type="button" class="btn secondary" @click="resetAccount">Visszaállít</button>
                <button type="submit" class="btn primary">Mentés</button>
              </div>
              <div v-if="message.account" class="message">{{ message.account }}</div>
            </form>
          </div>

          <!-- Notifications -->
          <div v-if="activeTab === 'notifications'" class="card">
            <h2>Értesítések</h2>
            <form @submit.prevent="saveNotifications">
              <div class="form-row inline">
                <label>Email értesítések</label>
                <input type="checkbox" v-model="notifications.email" />
              </div>
              <div class="form-row inline">
                <label>Mobil / SMS</label>
                <input type="checkbox" v-model="notifications.sms" />
              </div>
              <div class="form-row inline">
                <label>Push értesítések</label>
                <input type="checkbox" v-model="notifications.push" />
              </div>

              <div class="form-actions">
                <button type="button" class="btn secondary" @click="resetNotifications">Visszaállít</button>
                <button type="submit" class="btn primary">Mentés</button>
              </div>
              <div v-if="message.notifications" class="message">{{ message.notifications }}</div>
            </form>
          </div>

          <!-- Appearance -->
          <div v-if="activeTab === 'appearance'" class="card">
            <h2>Megjelenés</h2>
            <form @submit.prevent="saveAppearance">
              <div class="form-row">
                <label>Háttérszín téma</label>
                <select v-model="appearance.theme" @change="applyTheme">
                  <option value="light">Világos</option>
                  <option value="dark">Sötét</option>
                </select>
              </div>
              <div class="form-row">
                <label>Nyelv</label>
                <select v-model="appearance.language">
                  <option value="hu">Magyar</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div class="form-actions">
                <button type="button" class="btn secondary" @click="resetAppearance">Visszaállít</button>
                <button type="submit" class="btn primary">Mentés</button>
              </div>
              <div v-if="message.appearance" class="message">{{ message.appearance }}</div>
            </form>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { ref, reactive, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'Settings',
  setup() {
    const activeTab = ref('profile')

    const userProfile = ref({
      id: '',
      teljes_nev: '',
      felhasznalonev: '',
      email: '',
      szerep_tipus: 'diak',
      initials: ''
    })

    const profile = reactive({
      teljes_nev: '',
      felhasznalonev: '',
      email: ''
    })

    const account = reactive({
      email: '',
      felhasznalonev: ''
    })

    const password = reactive({
      new: '',
      confirm: ''
    })

    const notifications = reactive({
      email: true,
      sms: false,
      push: true
    })

    const appearance = reactive({
      theme: 'light',
      language: 'hu'
    })

    const message = reactive({
      profile: '',
      account: '',
      notifications: '',
      appearance: ''
    })

    const STORAGE_KEY = 'sm_settings'
    const APPEARANCE_KEY = 'sm_appearance'

    const saveToStorage = () => {
      const payload = {
        profile: { ...profile },
        notifications: { ...notifications }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    }

    const loadFromStorage = () => {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      try {
        const parsed = JSON.parse(raw)
        Object.assign(profile, parsed.profile || {})
        Object.assign(notifications, parsed.notifications || {})
      } catch (e) {
        console.error('Storage betöltési hiba:', e)
      }
    }

    const saveAppearanceToStorage = () => {
      localStorage.setItem(APPEARANCE_KEY, JSON.stringify(appearance))
    }

    const loadAppearanceFromStorage = () => {
      const raw = localStorage.getItem(APPEARANCE_KEY)
      if (!raw) return
      try {
        const parsed = JSON.parse(raw)
        Object.assign(appearance, parsed)
        applyTheme()
      } catch (e) {
        console.error('Appearance betöltési hiba:', e)
      }
    }

    const generateInitials = (name) => {
      if (!name) return '';
      const parts = name.split(' ');
      return parts.map(part => part.charAt(0).toUpperCase()).join('').substring(0, 2);
    }

    const getRoleLabel = (role) => {
      const roleMap = {
        'diak': 'Diák',
        'tanar': 'Tanár',
        'admin': 'Adminisztrátor'
      }
      return roleMap[role] || role
    }

    const fetchUserProfile = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken');
        
        if (!storedUser || !token) {
          console.warn('Nincs bejelentkezett felhasználó');
          router.push('/login');
          return;
        }

        const userData = JSON.parse(storedUser);
        
        const response = await fetch(`http://localhost:3000/api/auth/profileData`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Felhasználó adatainak lekérése sikertelen');
        }

        const data = await response.json();
        
        if (data.success && data.data && data.data.user ) {
          const user = data.data.user;
          userProfile.value = {
            teljes_nev: user.teljes_nev || user.felhasznalonev,
            felhasznalonev: user.felhasznalonev,
            szerep_tipus: user.szerep_tipus,
            email: user.email,
            id: user.id,
            initials: generateInitials(user.teljes_nev || user.felhasznalonev)
          };
          
          // Form adatok feltöltése
          profile.teljes_nev = user.teljes_nev || user.felhasznalonev;
          profile.felhasznalonev = user.felhasznalonev;
          profile.email = user.email;
          
          account.email = user.email;
          account.felhasznalonev = user.felhasznalonev;
        }
      } catch (error) {
        console.error('Felhasználó adatainak lekérése sikertelen:', error);
      }
    }

    onMounted(() => {
      loadFromStorage()
      loadAppearanceFromStorage()
      fetchUserProfile()
    })

    

    const saveProfile = async () => {
      if (!profile.teljes_nev.trim()) {
        message.profile = 'A teljes név megadása kötelező.'
        return
      }
      if (!profile.email.includes('@')) {
        message.profile = 'Érvényes e-mail szükséges.'
        return
      }

      try {
        const response = await fetch('http://localhost:3000/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: userProfile.value.id,
            teljes_nev: profile.teljes_nev,
            email: profile.email
          })
        })

        const data = await response.json()

        if (data.success) {
          userProfile.value.teljes_nev = profile.teljes_nev
          userProfile.value.email = profile.email
          userProfile.value.initials = generateInitials(profile.teljes_nev)
          
          const storedUser = JSON.parse(localStorage.getItem('user'))
          storedUser.teljes_nev = profile.teljes_nev
          storedUser.email = profile.email
          localStorage.setItem('user', JSON.stringify(storedUser))
          
          message.profile = 'Profil sikeresen mentve.'
          saveToStorage()
        } else {
          message.profile = data.message || 'Hiba a mentés során'
        }
      } catch (error) {
        console.error('Profil mentési hiba:', error)
        message.profile = 'Hiba a mentés során: ' + error.message
      }
      setTimeout(() => (message.profile = ''), 2500)
    }

    const resetProfile = () => {
      profile.teljes_nev = userProfile.value.teljes_nev
      profile.email = userProfile.value.email
      message.profile = 'Visszaállítva.'
      setTimeout(() => (message.profile = ''), 2000)
    }

    const saveAccount = async () => {
      if (!account.email.includes('@')) {
        message.account = 'Érvényes e-mail szükséges.'
        return
      }

      if (password.new || password.confirm) {
        if (password.new !== password.confirm) {
          message.account = 'Az új jelszavak nem egyeznek.'
          return
        }
        if (password.new.length < 6) {
          message.account = 'A jelszó legalább 6 karakter hosszú legyen.'
          return
        }
      }

      try {
        const response = await fetch('http://localhost:3000/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: userProfile.value.id,
            email: account.email,
            jelszo: password.new || undefined
          })
        })

        const data = await response.json()

        if (data.success) {
          userProfile.value.email = account.email
          
          const storedUser = JSON.parse(localStorage.getItem('user'))
          storedUser.email = account.email
          localStorage.setItem('user', JSON.stringify(storedUser))
          
          password.new = ''
          password.confirm = ''
          message.account = 'Fiók sikeresen mentve.'
          saveToStorage()
        } else {
          message.account = data.message || 'Hiba a mentés során'
        }
      } catch (error) {
        console.error('Account mentési hiba:', error)
        message.account = 'Hiba a mentés során: ' + error.message
      }
      setTimeout(() => (message.account = ''), 2500)
    }

    const resetAccount = () => {
      account.email = userProfile.value.email
      password.new = ''
      password.confirm = ''
      message.account = 'Visszaállítva.'
      setTimeout(() => (message.account = ''), 2000)
    }

    const saveNotifications = () => {
      message.notifications = 'Értesítési beállítások mentve.'
      saveToStorage()
      setTimeout(() => (message.notifications = ''), 2000)
    }

    const resetNotifications = () => {
      loadFromStorage()
      message.notifications = 'Visszaállítva.'
      setTimeout(() => (message.notifications = ''), 2000)
    }

    const saveAppearance = () => {
      message.appearance = 'Megjelenés mentve.'
      saveAppearanceToStorage()
      setTimeout(() => (message.appearance = ''), 2000)
    }

    const resetAppearance = () => {
      appearance.theme = 'light'
      appearance.language = 'hu'
      applyTheme()
      saveAppearanceToStorage()
      message.appearance = 'Visszaállítva.'
      setTimeout(() => (message.appearance = ''), 2000)
    }

    const applyTheme = () => {
      if (appearance.theme === 'dark') {
        document.documentElement.classList.add('dark-theme')
      } else {
        document.documentElement.classList.remove('dark-theme')
      }
    }

    const router = useRouter();
    const logout = () => {
      localStorage.removeItem('user');
      localStorage.removeItem('sm_settings');
      localStorage.removeItem('sm_appearance');
      
      router.push('/home');
    }

    watch(() => appearance.theme, () => {
      applyTheme()
      saveAppearanceToStorage()
    })

    return {
      activeTab,
      userProfile,
      profile,
      account,
      password,
      notifications,
      appearance,
      message,
      router,
      logout,
      saveProfile,
      resetProfile,
      saveAccount,
      resetAccount,
      saveNotifications,
      resetNotifications,
      saveAppearance,
      resetAppearance,
      applyTheme,
      getRoleLabel
    }
  },
  methods: {
        navigateToTanarStatistics() {
      this.$router.push('/tanar').then(() => {
        this.$nextTick(() => {
          const element = document.getElementById('statPeriod');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });
    },
  }
}
</script>

<style scoped>
.dashboard-wrapper {
  display: flex;
  min-height: 100vh;
  font-family: Inter, Arial, sans-serif;
}

/* Main content */
.main-content {
  flex: 1;
  background: #f3f4f6;
  padding: 150px;
  box-sizing: border-box;
}

/* Settings panel */
.settings-panel { display:flex; gap:20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);}
.settings-nav {
  width: 200px;
  display:flex;
  flex-direction:column;
  gap:8px;
}
.settings-nav button {
  text-align: left;
  padding:10px 12px;
  border-radius:8px;
  background:transparent;
  border: none;
  cursor: pointer;
  color:#374151;
  box-shadow: 0px 3px 0px rgba(0, 0, 0, 0.5);
}
.settings-nav button.active {
  background:#fff;
  box-shadow: 0 1px 6px rgba(2,6,23,0.06);
  color:#111827;
}
.settings-content {
  flex:1;
  box-shadow: 0 1px 6px rgba(2,6,23,0.06);
}

/* Card */
.card {
  background:#fff;
  padding:18px;
  border-radius:10px;
  margin-bottom: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
}
.card h2 { 
  color: var(--dark);
  margin: 0 0 12px 0; 
}

.card h3{
  color: var(--dark);
}

/* Form */
.form-row { display:flex; flex-direction:column; margin-bottom:12px; }
.form-row.inline { flex-direction:row; gap:12px; align-items:center; }
.form-row label { font-size:13px; color:#374151; margin-bottom:6px; }
.form-row input[type="text"],
.form-row input[type="email"],
.form-row input[type="password"],
.form-row select {
  padding:8px 10px; border-radius:6px; border:1px solid #e5e7eb; background:#fff;
}
.form-actions { display:flex; gap:8px; justify-content:flex-end; margin-top:10px; }
.btn { padding:8px 12px; border-radius:8px; border:none; cursor:pointer; }
.btn.primary { background:#7c3aed; color:#fff; }
.btn.secondary { background:#eef2ff; color:#3730a3; }

.message { margin-top:10px; color:#065f46; background:#ecfdf5; padding:8px 10px; border-radius:6px; font-size:13px; }

/* Dark theme quick */
:root.dark-theme .main-content { background:#0b1220; color:#e6eef8; }
:root.dark-theme .card { background:#081125; box-shadow:none; color:#dbeafe; }
:root.dark-theme .settings-nav button { color:#9aa8c2; }
:root.dark-theme .settings-nav button.active { background:#07102a; color:#fff; }
:root.dark-theme .card h2{ color:#e6eef8;  }
:root.dark-theme .card h3{ color:#e6eef8;  }
:root.dark-theme .card label{ color:#e6eef8;  }

/* Tablet nézet (768px) */
@media (max-width: 768px) {
  .dashboard-wrapper {
    flex-direction: column;
  }

  .sidebar {
    display: none;
  }

  .main-content {
    padding: 100px 1rem 1rem;
    flex: 1;
  }

  .settings-panel {
    flex-direction: column;
    gap: 0;
    box-shadow: none;
  }

  .settings-nav {
    width: 100%;
    flex-direction: row;
    gap: 0;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 1rem;
    overflow-x: auto;
  }

  .settings-nav button {
    flex: 1;
    box-shadow: none;
    border-bottom: 2px solid transparent;
    border-radius: 0;
    padding: 12px 16px;
  }

  .settings-nav button.active {
    border-bottom: 2px solid #7c3aed;
    background: transparent;
    box-shadow: none;
  }

  .card {
    padding: 1.25rem;
  }
}

/* Mobil nézet (600px) */
@media (max-width: 600px) {
  .main-content {
    padding: 80px 0.75rem 0.75rem;
  }

  .card {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .card h2 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }

  .card h3 {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
  }

  .form-row {
    margin-bottom: 1rem;
  }

  .form-row label {
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }

  .form-row input[type="text"],
  .form-row input[type="email"],
  .form-row input[type="password"],
  .form-row select {
    padding: 0.75rem;
    font-size: 1rem;
    border-radius: 6px;
  }

  .form-row.inline {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .form-actions {
    gap: 0.5rem;
    flex-direction: column;
  }

  .btn {
    padding: 0.75rem 1rem;
    width: 100%;
    font-size: 0.95rem;
  }

  .settings-nav button {
    padding: 10px 12px;
    font-size: 0.85rem;
  }

  .message {
    font-size: 0.85rem;
    padding: 0.75rem;
  }
}

/* Nagyon kis mobilok (400px) */
@media (max-width: 400px) {
  .main-content {
    padding: 70px 0.5rem 0.5rem;
  }

  .card {
    padding: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .card h2 {
    font-size: 1.1rem;
  }

  .card h3 {
    font-size: 1rem;
  }

  .form-row {
    margin-bottom: 0.75rem;
  }

  .form-row label {
    font-size: 0.85rem;
  }

  .form-row input[type="text"],
  .form-row input[type="email"],
  .form-row input[type="password"],
  .form-row select {
    padding: 0.65rem;
    font-size: 16px;
  }

  .btn {
    padding: 0.65rem 0.8rem;
    font-size: 0.85rem;
  }

  .settings-nav button {
    padding: 8px 10px;
    font-size: 0.8rem;
  }
}
</style>
