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
        <li><a href="#" class="active"><i class="fas fa-home"></i> Áttekintés</a></li>
        <router-link to="/task"><li><i class="fas fa-tasks"></i> Feladatok</li></router-link>
        <li><a href="#"><i class="fas fa-users"></i> Csapatmunka</a></li>
        <router-link to="/chat"><li><i class="fas fa-comments"></i> Üzenetek</li></router-link>
        <router-link to="/settings"><li><i class="fas fa-cog"></i> Beállítások</li></router-link>
      </ul>
    </aside>

    <!-- Header -->
    <header>
      <div class="header-left">
        <h1>Diák Dashboard</h1>
      </div>
      <div class="header-right">
        <div class="notifications">
          <button class="notifications-button"><i class="fas fa-bell"></i></button>
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

    <!-- Main Content -->
    <main>
      <div class="page-title">
        <h2>Áttekintés</h2>
      </div>

      <!-- Stats Cards -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon bg-primary">
            <i class="fas fa-tasks"></i>
          </div>
          <div class="stat-info">
            <h3>12</h3>
            <p>Összes feladat</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-success">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-info">
            <h3>8</h3>
            <p>Befejezett</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-warning">
            <i class="fas fa-exclamation-circle"></i>
          </div>
          <div class="stat-info">
            <h3>3</h3>
            <p>Folyamatban</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-danger">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-info">
            <h3>1</h3>
            <p>Késésben</p>
          </div>
        </div>
      </div>

      <!-- Közelgő határidők -->
      <section class="section">
        <div class="section-header">
          <h3><i class="fas fa-clock"></i> Közelgő határidők</h3>
          <a href="#">Összes megtekintése</a>
        </div>
        <div class="tasks-container">
          <div class="task-card">
            <div class="task-header">
              <div class="task-title">Vizsgaremek</div>
              <div class="task-date">2025.12.12</div>
            </div>
            <div class="task-desc">adatbázisnak kész kell lenni kell backend api és kell frontend működőképesen</div>
            <div class="task-footer">
              <div class="task-status status-inprogress">Folyamatban</div>
              <button class="btn btn-primary">Beadás</button>
            </div>
          </div>
          <div class="task-card warning">
            <div class="task-header">
              <div class="task-title">Vizsgaremek</div>
              <div class="task-date">2025.12.12</div>
            </div>
            <div class="task-desc">adatbázisnak kész kell lenni kell backend api és kell frontend működőképesen</div>
            <div class="task-footer">
              <div class="task-status status-todo">Elkezdve</div>
              <button class="btn btn-primary">Beadás</button>
            </div>
          </div>
          <div class="task-card danger">
            <div class="task-header">
              <div class="task-title">Vizsgaremek</div>
              <div class="task-date">2025.12.12</div>
            </div>
            <div class="task-desc">adatbázisnak kész kell lenni kell backend api és kell frontend működőképesen</div>
            <div class="task-footer">
              <div class="task-status status-late">Késésben</div>
              <button class="btn btn-primary">Beadás</button>
            </div>
          </div>
        </div>
      </section>

      <!-- Kanban tábla -->
      <section class="section">
        <div class="section-header">
          <h3><i class="fas fa-columns"></i> Projekt: Webfejlesztés</h3>
          <a href="#">További projektek</a>
        </div>
        <div class="kanban-container">
          <div class="kanban-column">
            <h4>Teendő</h4>
            <div class="kanban-card">
              <h5>Design tervek</h5>
              <p>UI/UX tervek elkészítése</p>
              <div class="card-meta">
                <span>Határidő: 11.20.</span>
                <span>monogram</span>
              </div>
            </div>
          </div>
          <div class="kanban-column">
            <h4>Folyamatban</h4>
            <div class="kanban-card">
              <h5>Frontend fejlesztés</h5>
              <p>Főoldal komponensek</p>
              <div class="card-meta">
                <span>Határidő: 11.25.</span>
                <span>monogram</span>
              </div>
            </div>
          </div>
          <div class="kanban-column">
            <h4>Ellenőrzés</h4>
            <div class="kanban-card">
              <h5>Adatbázis design</h5>
              <p>ER diagram és séma</p>
              <div class="card-meta">
                <span>Határidő: 11.18.</span>
                <span>monogram</span>
              </div>
            </div>
          </div>
          <div class="kanban-column">
            <h4>Beadva</h4>
            <div class="kanban-card">
              <h5>Projekt terv</h5>
              <p>Részletes projektterv</p>
              <div class="card-meta">
                <span>Beadva: 11.05.</span>
                <span>monogram</span>
              </div>
            </div>
          </div>
          <div class="kanban-column">
            <h4>Kész</h4>
            <div class="kanban-card">
              <h5>Követelmények</h5>
              <p>Funkcionális specifikáció</p>
              <div class="card-meta">
                <span>Kész: 10.30.</span>
                <span>Csapat</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style>
:root {
  --primary: #4361ee;
  --secondary: #3f37c9;
  --success: #4cc9f0;
  --warning: #f72585;
  --danger: #e63946;
  --light: #f8f9fa;
  --dark: #212529;
  --sidebar: #2b2d42;
  --header: #3a0ca3;
  --card: #ffffff;
  --text: #333333;
  --muted: #6c757d;
  --border: #dee2e6;
}

.dashboard-wrapper {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
  background-color: white;
}

.dashboard-wrapper * {
margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.dashboard-wrapper {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: 60px 1fr;
  grid-template-areas: 
    "sidebar header"
    "sidebar main";
  min-height: 100vh;
  position: relative;
}

/* Header - FIXÁLVA*/
.dashboard-wrapper header {
  grid-area: header;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  z-index: 1100;
  border-bottom: 1px solid var(--border);
  position: fixed;
  top: 0;
  left: 250px;
  right: 0;
  height: 60px;
}

.dashboard-wrapper .header-left h1 {
  font-size: 1.5rem;
  color: var(--primary);
  font-weight: 600;
}

.dashboard-wrapper .header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  color: var(--dark);
  z-index: 1110;
}

.dashboard-wrapper .header-right .notifications-button {
  margin-left: 1rem;
  color: var(--dark);
  margin-left: -450px;
}

.dashboard-wrapper .user-profile {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--dark);
  margin-left: -425px;
}

.dashboard-wrapper .avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.dashboard-wrapper .user-role {
  font-size: 0.85rem;
  color: var(--muted);
}

.dashboard-wrapper .user-name {
  font-weight: 600;
  color: var(--dark);
}
.dashboard-wrapper .notifications-button {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--dark);
}

/* Sidebar - FIXÁLVA */
.dashboard-wrapper .sidebar {
  grid-area: sidebar;
  background: var(--sidebar);
  color: white;
  padding: 1.5rem 0;
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100vh;
  overflow-y: auto;
  z-index: 1001;
}

.dashboard-wrapper .logo {
  padding: 0 1.5rem 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  margin-bottom: 1.5rem;
}

.dashboard-wrapper .logo h2 {
  font-size: 1.5rem;
  font-weight: 700;
}

.dashboard-wrapper .logo span {
  color: var(--success);
}

.dashboard-wrapper .logo p {
  font-size: 0.9rem;
  color: rgba(255,255,255,0.7);
  margin-top: 0.25rem;
}

.dashboard-wrapper .nav-links {
  list-style: none;
}

.dashboard-wrapper .nav-links li {
  margin-bottom: 0.5rem;
}

.dashboard-wrapper .nav-links a {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  transition: all 0.3s;
  font-weight: 500;
}

.dashboard-wrapper .nav-links a:hover, 
.dashboard-wrapper .nav-links a.active {
  background: rgba(255,255,255,0.1);
  color: white;
  border-left: 4px solid var(--success);
}

.dashboard-wrapper .nav-links i {
  width: 20px;
  text-align: center;
}

/* Main Content - FIXÁLVA A PADDING */
.dashboard-wrapper main {
  grid-area: main;
  background: var(--bg-light);
  margin-left: 200px;
  margin-top: 60px;
}

.dashboard-wrapper .page-title {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-wrapper .page-title h2 {
  font-size: 1.8rem;
  color: var(--dark);
}

.dashboard-wrapper .stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.dashboard-wrapper .stat-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dashboard-wrapper .stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.dashboard-wrapper .stat-info h3 {
  font-size: 1.8rem;
  margin-bottom: 0.25rem;
  color: var(--dark);
}

.dashboard-wrapper .stat-info p {
  color: var(--muted);
  font-size: 0.9rem;
}

.dashboard-wrapper .bg-primary { background: var(--primary); }
.dashboard-wrapper .bg-success { background: var(--success); }
.dashboard-wrapper .bg-warning { background: var(--warning); }
.dashboard-wrapper .bg-danger { background: var(--danger); }

/* Sections */
.dashboard-wrapper .section {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
}

.dashboard-wrapper .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.dashboard-wrapper .section-header h3 {
  font-size: 1.3rem;
  color: var(--dark);
}

.dashboard-wrapper .btn {
  padding: 0.5rem 1rem;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.dashboard-wrapper .btn-primary {
  background: var(--primary);
  color: white;
}

#new-task-button{
  margin-right: 255px;
}

.dashboard-wrapper .btn-primary:hover {
  background: var(--secondary);
}

/* Tasks */
.dashboard-wrapper .tasks-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.dashboard-wrapper .task-card {
  border-left: 4px solid var(--primary);
  padding: 1rem;
  background: white;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.dashboard-wrapper .task-card.warning {
  border-left-color: var(--warning);
}

.dashboard-wrapper .task-card.danger {
  border-left-color: var(--danger);
}

.dashboard-wrapper .task-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.dashboard-wrapper .task-title {
  font-weight: 600;
  color: var(--dark);
}

.dashboard-wrapper .task-date {
  color: var(--muted);
  font-size: 0.8rem;
}

.dashboard-wrapper .task-desc {
  color: var(--muted);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.dashboard-wrapper .task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-wrapper .task-status {
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.dashboard-wrapper .status-todo { background: #e9ecef; color: var(--dark); }
.dashboard-wrapper .status-inprogress { background: #fff3cd; color: #856404; }
.dashboard-wrapper .status-submitted { background: #d1ecf1; color: #0c5460; }
.dashboard-wrapper .status-graded { background: #d4edda; color: #155724; }
.dashboard-wrapper .status-late { background: #f8d7da; color: #721c24; }

/* Kanban */
.dashboard-wrapper .kanban-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
}

.dashboard-wrapper .kanban-column {
  background: #f8f9fa;
  border-radius: 5px;
  padding: 1rem;
  min-height: 400px;
  background-color: #e0e0e0;
}

.dashboard-wrapper .kanban-column h4 {
  margin-bottom: 1rem;
  text-align: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
  color: var(--dark);
}

.dashboard-wrapper .kanban-card {
  background: white;
  border-radius: 5px;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  cursor: move;
}

.dashboard-wrapper .kanban-card h5 {
  margin-bottom: 0.5rem;
  color: var(--dark);
}

.dashboard-wrapper .kanban-card p {
  font-size: 0.8rem;
  color: var(--muted);
  margin-bottom: 0.5rem;
}

.dashboard-wrapper .card-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: var(--muted);
}

/* Chat */
.dashboard-wrapper .chat-container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1.5rem;
  height: 400px;
}

.dashboard-wrapper .chat-sidebar {
  background: white;
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
}

.dashboard-wrapper .chat-sidebar h4 {
  margin-bottom: 1rem;
  color: var(--dark);
}

.dashboard-wrapper .chat-list {
  list-style: none;
}

.dashboard-wrapper .chat-item {
  padding: 0.75rem;
  border-radius: 5px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: background 0.3s;
  color: var(--dark);
}

.dashboard-wrapper .chat-item:hover, 
.dashboard-wrapper .chat-item.active {
  background: #f0f2f5;
}

.dashboard-wrapper .chat-main {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
}

.dashboard-wrapper .chat-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  color: var(--dark);
}

.dashboard-wrapper .chat-messages {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dashboard-wrapper .message {
  max-width: 70%;
  padding: 0.75rem;
  border-radius: 10px;
}

.dashboard-wrapper .message.sent {
  align-self: flex-end;
  background: var(--primary);
  color: white;
}

.dashboard-wrapper .message.received {
  align-self: flex-start;
  background: #f0f2f5;
  color: var(--dark);
}

.dashboard-wrapper .chat-input {
  padding: 1rem;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 0.5rem;
}

.dashboard-wrapper .chat-input input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 20px;
}

.dashboard-wrapper .chat-input button {
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
}

/* Közepes képernyők */
@media (max-width: 992px) {
  .dashboard-wrapper {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "main";
  }

  .dashboard-wrapper header {
    left: 0;
    padding: 0 1rem;
  }

  .dashboard-wrapper main {
    margin-left: 0;
    padding: 1rem;
  }

  .dashboard-wrapper .sidebar {
    display: none;
  }

  .dashboard-wrapper .stats-cards {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }

  .dashboard-wrapper .kanban-container {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }

  .dashboard-wrapper .chat-container {
    grid-template-columns: 1fr;
  }

  #new-task-button {
    margin-right: 0;
    margin-left: auto;
    display: block;
  }

  .dashboard-wrapper .avatar {
    width: 35px;
    height: 35px;
  }

  .dashboard-wrapper .user-name {
    font-size: 0.9rem;
  }
}

/* Mobil képernyők */
@media (max-width: 768px) {
  .dashboard-wrapper header {
    flex-direction: column;
    align-items: flex-start;
    height: auto;
    padding: 0.5rem 1rem;
  }

  .dashboard-wrapper .header-left h1 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }

  .dashboard-wrapper .header-right {
    width: 100%;
    justify-content: space-between;
  }

  .dashboard-wrapper .user-profile {
    margin-left: 0;
  }

  .dashboard-wrapper .page-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  #new-task-button {
    align-self: flex-end;
    margin-left: auto;
  }

  .dashboard-wrapper .stats-cards {
    grid-template-columns: 1fr;
  }

  .dashboard-wrapper .tasks-container {
    grid-template-columns: 1fr;
  }

  .dashboard-wrapper .kanban-container {
    grid-template-columns: 1fr;
  }

  .dashboard-wrapper .chat-container {
    display: flex;
    flex-direction: column;
  }

  .dashboard-wrapper .chat-main {
    height: 300px;
  }

  .dashboard-wrapper .chat-input input {
    font-size: 0.9rem;
  }

  .dashboard-wrapper .sidebar.active {
    display: block;
    position: fixed;
    z-index: 2000;
    width: 200px;
    height: 100vh;
    background: var(--sidebar);
    top: 0;
    left: 0;
    animation: slideIn 0.3s ease forwards;
  }

  @keyframes slideIn {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }
}

/* Nagyon kis mobilok */
@media (max-width: 480px) {
  .dashboard-wrapper header {
    padding: 0.5rem;
  }

  .dashboard-wrapper .user-profile {
    flex-direction: row;
    gap: 0.4rem;
  }

  .dashboard-wrapper .avatar {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }

  .dashboard-wrapper .user-name {
    font-size: 0.8rem;
  }

  .dashboard-wrapper .user-role {
    font-size: 0.7rem;
  }

  .dashboard-wrapper .page-title h2 {
    font-size: 1.2rem;
  }

  .dashboard-wrapper .btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }
}
</style>

<script>
import { useRouter } from 'vue-router';

export default {
  name: "Diak",
  data() {
    return {
      navActive: false,
      userProfile: {
        teljes_nev: '',
        felhasznalonev: '',
        szerep_tipus: 'diak',
        initials: ''
      }
    }
  },
  methods: {
    toggleMenu() {
      this.navActive = !this.navActive;
    },
    getRoleLabel(role) {
      const roleMap = {
        'diak': 'Diák',
        'tanar': 'Tanár',
        'admin': 'Adminisztrátor'
      };
      return roleMap[role] || role;
    },
    generateInitials(name) {
      if (!name) return '';
      const parts = name.split(' ');
      return parts.map(part => part.charAt(0).toUpperCase()).join('').substring(0, 2);
    },
    async fetchUserProfile() {
      try {
        const storedUser = localStorage.getItem('user');
        
        if (!storedUser) {
          console.warn('Nincs bejelentkezett felhasználó');
          this.$router.push('/login');
          return;
        }

        const userData = JSON.parse(storedUser);
        
        const response = await fetch(`http://localhost:3000/api/auth/profile/${userData.felhasznalonev}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Felhasználó adatainak lekérése sikertelen');
        }

        const data = await response.json();
        
        if (data.success && data.data && data.data.user) {
          const user = data.data.user;
          this.userProfile = {
            teljes_nev: user.teljes_nev || user.felhasznalonev,
            felhasznalonev: user.felhasznalonev,
            szerep_tipus: user.szerep_tipus,
            email: user.email,
            id: user.id,
            initials: this.generateInitials(user.teljes_nev || user.felhasznalonev)
          };
        }
      } catch (error) {
        console.error('Felhasználó adatainak lekérése sikertelen:', error);
      }
    }
  },
  mounted() {
    this.fetchUserProfile();
  },
  setup() {
    const router = useRouter();
    const logout = () => {
      localStorage.removeItem('user');
      localStorage.removeItem('sm_settings');
      localStorage.removeItem('sm_appearance');
      
      router.push('/home');
    };
    return { router, logout };
  }
}
    
</script>