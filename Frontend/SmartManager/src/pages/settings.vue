<template>
  <div class="dashboard-wrapper">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="logo">
        <h2>Smart<span>Manager</span></h2>
        <p>Diák Portál</p>
      </div>
      <ul class="nav-links">
        <router-link to="/diak"><li><i class="fas fa-home"></i> Áttekintés</li></router-link>
        <router-link to="/task"><li><i class="fas fa-tasks"></i> Feladatok</li></router-link>
        <li><a href="#"><i class="fas fa-users"></i> Csapatmunka</a></li>
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
            <div class="avatar">{{ profile.initials }}</div>
            <div>
              <div class="user-name">{{ profile.fullName }}</div>
              <div class="user-role">{{ profile.role }}</div>
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
                <input v-model="profile.fullName" type="text" required />
              </div>
              <div class="form-row">
                <label>Initials</label>
                <input v-model="profile.initials" type="text" maxlength="3" />
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
                <input v-model="account.username" type="text" required />
              </div>

              <h3>Jelszó módosítás</h3>
              <div class="form-row">
                <label>Jelenlegi jelszó</label>
                <input v-model="password.current" type="password" />
              </div>
              <div class="form-row">
                <label>Új jelszó</label>
                <input v-model="password.new" type="password" />
              </div>
              <div class="form-row">
                <label>Új jelszó (újra)</label>
                <input v-model="password.confirm" type="password" />
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
                <label>Téma</label>
                <select v-model="appearance.theme">
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
import { ref, reactive, watch, onMounted } from 'vue'

export default {
  name: 'Settings',
  setup() {
    // Tabs
    const activeTab = ref('profile')

    // Profile data
    const profile = reactive({
      fullName: 'Diós Katalin',
      initials: 'DK',
      role: 'Diák'
    })

    // Account data
    const account = reactive({
      email: 'katalin@example.com',
      username: 'dkatalin'
    })

    // Password fields (not persisted in this demo)
    const password = reactive({
      current: '',
      new: '',
      confirm: ''
    })

    // Notifications
    const notifications = reactive({
      email: true,
      sms: false,
      push: true
    })

    // Appearance
    const appearance = reactive({
      theme: 'light',
      language: 'hu'
    })

    // Messages
    const message = reactive({
      profile: '',
      account: '',
      notifications: '',
      appearance: ''
    })

    // Helpers: localStorage persistence for demo
    const STORAGE_KEY = 'sm_settings_demo'

    const saveToStorage = () => {
      const payload = {
        profile: { ...profile },
        account: { ...account },
        notifications: { ...notifications },
        appearance: { ...appearance }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    }

    const loadFromStorage = () => {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      try {
        const parsed = JSON.parse(raw)
        Object.assign(profile, parsed.profile || {})
        Object.assign(account, parsed.account || {})
        Object.assign(notifications, parsed.notifications || {})
        Object.assign(appearance, parsed.appearance || {})
      } catch (e) {
        // ignore
      }
    }

    onMounted(() => {
      loadFromStorage()
    })

    // Save handlers
    const saveProfile = () => {
      if (!profile.fullName.trim()) {
        message.profile = 'A teljes név megadása kötelező.'
        return
      }
      message.profile = 'Profil mentve.'
      saveToStorage()
      setTimeout(() => (message.profile = ''), 2500)
    }

    const resetProfile = () => {
      loadFromStorage()
      message.profile = 'Visszaállítva.'
      setTimeout(() => (message.profile = ''), 2000)
    }

    const saveAccount = () => {
      // basic checks for demo
      if (!account.email.includes('@')) {
        message.account = 'Érvényes e-mail szükséges.'
        return
      }
      if (password.new || password.confirm) {
        if (password.new !== password.confirm) {
          message.account = 'Az új jelszavak nem egyeznek.'
          return
        }
        // In a real app: call API to change password
        password.current = password.new = password.confirm = ''
      }
      message.account = 'Fiók mentve.'
      saveToStorage()
      setTimeout(() => (message.account = ''), 2500)
    }

    const resetAccount = () => {
      loadFromStorage()
      password.current = password.new = password.confirm = ''
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
      saveToStorage()
      // apply theme quickly
      applyTheme()
      setTimeout(() => (message.appearance = ''), 2000)
    }

    const resetAppearance = () => {
      loadFromStorage()
      applyTheme()
      message.appearance = 'Visszaállítva.'
      setTimeout(() => (message.appearance = ''), 2000)
    }

    // Apply theme to document
    const applyTheme = () => {
      if (appearance.theme === 'dark') {
        document.documentElement.classList.add('dark-theme')
      } else {
        document.documentElement.classList.remove('dark-theme')
      }
    }

    // Watch for immediate theme changes
    watch(() => appearance.theme, applyTheme, { immediate: true })

    return {
      activeTab,
      profile,
      account,
      password,
      notifications,
      appearance,
      message,
      saveProfile,
      resetProfile,
      saveAccount,
      resetAccount,
      saveNotifications,
      resetNotifications,
      saveAppearance,
      resetAppearance
    }
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
</style>
