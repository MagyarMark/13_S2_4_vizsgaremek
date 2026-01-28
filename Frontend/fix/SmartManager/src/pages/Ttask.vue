<template>
<div class="dashboard-wrapper">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    <!-- Sidebar -->
    <aside class="sidebar">
        <div class="logo">
            <h2>Smart<span>Manager</span></h2>
            <p>Tanári Portál</p>
        </div>
        <ul class="nav-links">
            <router-link to="/tanar"><li><i class="fas fa-home"></i> Áttekintés</li></router-link>
            <router-link to="/Ttask" class="active"><li><i class="fas fa-tasks"></i> Feladatok</li></router-link>
            <router-link to="/ertekeles"><li><i class="fas fa-check-circle"></i> Értékelés</li></router-link>
            <router-link to="/chat"><li><i class="fas fa-comments"></i> Üzenetek</li></router-link>
            <router-link to="/settings"><li><i class="fas fa-cog"></i> Beállítások</li></router-link>
        </ul>
    </aside>
    <!-- Header -->
    <header>
      <div class="header-left">
        <h1>Feladatok</h1>
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
    <main class="main-content">
      <div class="content-wrapper">
        <!-- Tasks Management Section -->
        <section class="tasks-section">
          <div class="section-header">
            <h2>Diákok Feladatai</h2>
            <button class="btn-primary" @click="showCreateTaskModal"><i class="fas fa-plus"></i> Új Feladat</button>
          </div>

          <!-- Filter/Search -->
          <div class="filters">
            <div class="search-box">
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Keresés diák neve vagy feladat alapján..."
              >
              <i class="fas fa-search"></i>
            </div>
            <select v-model="statusFilter" class="filter-select">
              <option value="">Összes státusz</option>
              <option value="new">Új</option>
              <option value="in-progress">Folyamatban</option>
              <option value="completed">Befejezett</option>
              <option value="late">Késett</option>
            </select>
          </div>

          <!-- Tasks Table -->
          <div class="tasks-table-container">
            <table class="tasks-table">
              <thead>
                <tr>
                  <th>Diák Neve</th>
                  <th>Feladat</th>
                  <th>Véghatáridő</th>
                  <th>Státusz</th>
                  <th>Haladás</th>
                  <th>Műveletek</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="task in filteredTasks" :key="task.id" :class="`status-${task.status}`">
                  <td class="student-name">
                    <div class="student-avatar">{{ task.studentInitials }}</div>
                    {{ task.studentName }}
                  </td>
                  <td class="task-name">{{ task.taskName }}</td>
                  <td class="deadline">{{ formatDate(task.deadline) }}</td>
                  <td class="status">
                    <span class="status-badge" :class="`status-${task.status}`">
                      {{ getStatusLabel(task.status) }}
                    </span>
                  </td>
                  <td class="progress">
                    <div class="progress-bar">
                      <div class="progress-fill" :style="{ width: task.progress + '%' }"></div>
                    </div>
                    <span class="progress-text">{{ task.progress }}%</span>
                  </td>
                  <td class="actions">
                    <button class="action-btn view-btn" title="Megtekintés" @click="viewTaskDetails(task)">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit-btn" title="Szerkesztés" @click="editTask(task)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" title="Törlés" @click="deleteTask(task.id)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div v-if="filteredTasks.length === 0" class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>Nincsenek feladatok a keresési feltételeknek megfelelően</p>
          </div>
        </section>

        <!-- Statistics Section -->
        <section class="statistics-section" id="statPeriod">
          <h2>Statisztika</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon"><i class="fas fa-tasks"></i></div>
              <div class="stat-content">
                <div class="stat-value">{{ totalTasks }}</div>
                <div class="stat-label">Összes Feladat</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon"><i class="fas fa-hourglass-half"></i></div>
              <div class="stat-content">
                <div class="stat-value">{{ tasksInProgress }}</div>
                <div class="stat-label">Folyamatban</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
              <div class="stat-content">
                <div class="stat-value">{{ tasksCompleted }}</div>
                <div class="stat-label">Befejezett</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon"><i class="fas fa-exclamation-circle"></i></div>
              <div class="stat-content">
                <div class="stat-value">{{ tasksLate }}</div>
                <div class="stat-label">Késett</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    
</div>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
  name: "Ttask",
  data() {
    return {
      navActive: false,
      userProfile: {
        teljes_nev: '',
        felhasznalonev: '',
        szerep_tipus: 'tanar',
        initials: ''
      },
      searchQuery: '',
      statusFilter: '',
      tasks: [
        {
          id: 1,
          studentName: 'Nagy Péter',
          studentInitials: 'NP',
          taskName: 'api call',
          deadline: '2026-02-05',
          status: 'in-progress',
          progress: 65
        },
        {
          id: 2,
          studentName: 'Szabó Anna',
          studentInitials: 'SZA',
          taskName: 'api Magyara forditasa',
          deadline: '2026-02-03',
          status: 'completed',
          progress: 100
        },
        {
          id: 3,
          studentName: 'Kiss János',
          studentInitials: 'KJ',
          taskName: 'rest api',
          deadline: '2026-02-01',
          status: 'late',
          progress: 30
        },
        {
          id: 4,
          studentName: 'Kovács Márta',
          studentInitials: 'KM',
          taskName: 'frontend',
          deadline: '2026-02-10',
          status: 'new',
          progress: 0
        },
        {
          id: 5,
          studentName: 'Tóth Zsolt',
          studentInitials: 'TZ',
          taskName: 'backend',
          deadline: '2026-02-07',
          status: 'in-progress',
          progress: 45
        },
        {
          id: 6,
          studentName: 'Nagy Péter',
          studentInitials: 'NP',
          taskName: 'db design ',
          deadline: '2026-02-15',
          status: 'new',
          progress: 0
        },
        {
          id: 7,
          studentName: 'Szabó Anna',
          studentInitials: 'SZA',
          taskName: 'js integration',
          deadline: '2026-02-08',
          status: 'in-progress',
          progress: 80
        },
        {
          id: 8,
          studentName: 'Kiss János',
          studentInitials: 'KJ',
          taskName: 'testing',
          deadline: '2026-02-04',
          status: 'late',
          progress: 50
        }
      ]
    }
  },
  computed: {
    filteredTasks() {
      return this.tasks.filter(task => {
        const matchesSearch = this.searchQuery === '' || 
          task.studentName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          task.taskName.toLowerCase().includes(this.searchQuery.toLowerCase());
        
        const matchesStatus = this.statusFilter === '' || task.status === this.statusFilter;
        
        return matchesSearch && matchesStatus;
      });
    },
    totalTasks() {
      return this.tasks.length;
    },
    tasksInProgress() {
      return this.tasks.filter(t => t.status === 'in-progress').length;
    },
    tasksCompleted() {
      return this.tasks.filter(t => t.status === 'completed').length;
    },
    tasksLate() {
      return this.tasks.filter(t => t.status === 'late').length;
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
    getStatusLabel(status) {
      const statusMap = {
        'new': 'Új',
        'in-progress': 'Folyamatban',
        'completed': 'Befejezett',
        'late': 'Késett'
      };
      return statusMap[status] || status;
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric', locale: 'hu-HU' };
      return new Date(dateString).toLocaleDateString('hu-HU', options);
    },
    showCreateTaskModal() {
      alert('Új feladat létrehozása - később implementálandó');
    },
    viewTaskDetails(task) {
      alert(`${task.studentName} - ${task.taskName} részletei - később implementálandó`);
    },
    editTask(task) {
      alert(`${task.taskName} szerkesztése - később implementálandó`);
    },
    deleteTask(taskId) {
      if (confirm('Biztosan törölni szeretné ezt a feladatot?')) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
      }
    },
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
    async fetchUserProfile() {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken');
        
        if (!storedUser || !token) {
          console.warn('Nincs bejelentkezett felhasználó');
          this.$router.push('/login');
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

<style scoped>
.content-wrapper {
  display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 60px;
    margin-top: -50px;
    margin-left: -200px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 12px;
  color: var(--primary);
  font-weight: 500;
}
/* Tasks Section */
.tasks-section {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  font-weight: 600;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Filters */
.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
}

.search-box {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-box input {
  width: 100%;
  padding: 10px 15px 10px 40px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #667eea;
}

.search-box i {
  position: absolute;
  left: 12px;
  color: #95a5a6;
}

.filter-select {
  padding: 10px 15px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  background-color: white;
  cursor: pointer;
  font-size: 14px;
  transition: border-color 0.3s ease;
  min-width: 180px;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
}

/* Tasks Table */
.tasks-table-container {
  overflow-x: auto;
}

.tasks-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.tasks-table thead {
  background-color: #f8f9fa;
  border-bottom: 2px solid #e9ecef;
}

.tasks-table th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
}

.tasks-table td {
  padding: 15px;
  border-bottom: 1px solid #ecf0f1;
}

.tasks-table tbody tr {
  transition: background-color 0.3s ease;
}

.tasks-table tbody tr:hover {
  background-color: #f8f9fa;
}

.tasks-table tbody tr.status-late {
  border-left: 4px solid #e74c3c;
}

.tasks-table tbody tr.status-completed {
  border-left: 4px solid #27ae60;
}

.tasks-table tbody tr.status-in-progress {
  border-left: 4px solid #f39c12;
}

.tasks-table tbody tr.status-new {
  border-left: 4px solid #95a5a6;
}

.student-name {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  color: #2c3e50;
}

.student-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
}

.task-name {
  color: #2c3e50;
  font-weight: 500;
}

.deadline {
  color: #7f8c8d;
  font-size: 13px;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  min-width: 90px;
}

.status-badge.status-new {
  background-color: #e8eef7;
  color: #667eea;
}

.status-badge.status-in-progress {
  background-color: #fef3e0;
  color: #f39c12;
}

.status-badge.status-completed {
  background-color: #e8f8f0;
  color: #27ae60;
}

.status-badge.status-late {
  background-color: #feebe8;
  color: #e74c3c;
}

.progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  width: 100px;
  height: 8px;
  background-color: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 13px;
  font-weight: 600;
  color: #2c3e50;
  min-width: 35px;
}

.actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.3s ease;
}

.action-btn.view-btn {
  background-color: #e8eef7;
  color: #667eea;
}

.action-btn.view-btn:hover {
  background-color: #667eea;
  color: white;
  transform: scale(1.1);
}

.action-btn.edit-btn {
  background-color: #fef3e0;
  color: #f39c12;
}

.action-btn.edit-btn:hover {
  background-color: #f39c12;
  color: white;
  transform: scale(1.1);
}

.action-btn.delete-btn {
  background-color: #feebe8;
  color: #e74c3c;
}

.action-btn.delete-btn:hover {
  background-color: #e74c3c;
  color: white;
  transform: scale(1.1);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #95a5a6;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 15px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 16px;
}

/* Statistics Section */
.statistics-section {
  width: 350px;
  background: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.statistics-section h2 {
  color: #2c3e50;
  font-size: 22px;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #ecf0f1;
}

.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateX(5px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.stat-icon {
  font-size: 24px;
  opacity: 0.8;
  min-width: 30px;
  text-align: center;
}

.stat-content {
    flex: 1;
    gap: 10px;
    padding: 2rem;
    text-align: center;
    font-size: 1.1rem;
    line-height: 1.6;
}

.stat-value {
    text-align: center;
    font-size: 1.4rem;
    font-weight: bold;
    margin-bottom: 3px;
    color: white;
}

.stat-label {
    text-align: center;
    font-size: 1.1rem;
    color: white;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .dashboard-wrapper {
    grid-template-columns: 1fr;
    grid-template-rows: 60px 1fr;
    grid-template-areas:
      "header"
      "main";
  }

  .sidebar {
    display: none;
  }

  header {
    left: 0;
    width: 100%;
  }

  main {
    margin-left: 0;
  }

  .content-wrapper {
    flex-direction: column;
    gap: 1rem;
  }

  .statistics-section {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .dashboard-wrapper {
    grid-template-columns: 1fr;
  }

  header {
    padding: 0 1rem;
    height: 60px;
  }

  main {
    padding: 1rem;
    margin-top: 60px;
  }

  .content-wrapper {
    flex-direction: column;
  }

  .tasks-section {
    width: 100%;
  }

  .filters {
    gap: 0.75rem;
    flex-direction: column;
  }

  .search-box {
    width: 100%;
  }

  .filter-select {
    width: 100%;
  }

  .tasks-table {
    font-size: 0.9rem;
  }

  th, td {
    padding: 0.75rem;
  }

  .statistics-section {
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-content {
    padding: 1rem;
  }
}

@media (max-width: 600px) {
  header {
    padding: 0 0.75rem;
  }

  main {
    padding: 0.75rem;
  }

  .header-left h1 {
    font-size: 1.1rem;
  }

  .header-right {
    gap: 0.5rem;
  }

  .header-right .user-name,
  .header-right .user-role {
    display: none;
  }

  .avatar {
    width: 36px;
    height: 36px;
  }

  .search-box input {
    padding: 0.75rem;
    font-size: 1rem;
  }

  .filter-select {
    padding: 0.75rem;
  }

  .tasks-table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .tasks-table {
    font-size: 0.8rem;
    width: 100%;
    min-width: 600px;
  }

  th, td {
    padding: 0.5rem;
  }

  .student-avatar {
    width: 28px;
    height: 28px;
    font-size: 0.75rem;
  }

  .statistics-section {
    padding: 1rem;
  }

  .statistics-section h2 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .stat-card {
    padding: 0.75rem;
  }

  .stat-icon {
    font-size: 1.3rem;
  }

  .stat-value {
    font-size: 1.1rem;
  }

  .stat-label {
    font-size: 0.85rem;
  }
}

@media (max-width: 400px) {
  header {
    padding: 0 0.5rem;
  }

  main {
    padding: 0.5rem;
  }

  .header-left h1 {
    font-size: 1rem;
  }

  .section-header h2 {
    font-size: 1.1rem;
  }

  .search-box {
    width: 100%;
  }

  .search-box input {
    padding: 0.65rem;
    font-size: 16px;
  }

  .tasks-table {
    font-size: 0.75rem;
  }

  .task-name {
    max-width: 100px;
    white-space: normal;
  }

  .action-btn {
    width: 28px;
    height: 28px;
    font-size: 0.85rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 0.5rem;
  }

  .stat-value {
    font-size: 1rem;
  }
}
</style>