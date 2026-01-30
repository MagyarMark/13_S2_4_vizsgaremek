<template>
<div class="dashboard-wrapper">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

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

    <header>
      <div class="header-left">
        <h1>Feladatok</h1>
      </div>
      <div class="header-right">
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

    <main class="main-content">
      <div class="content-wrapper">
        <section class="tasks-section">
          <div class="section-header">
            <h2>Diákok Feladatai</h2>
            <button class="btn-primary" @click="showCreateTaskModal"><i class="fas fa-plus"></i> Új Feladat</button>
          </div>

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

          <div v-if="filteredTasks.length === 0" class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>Nincsenek feladatok a keresési feltételeknek megfelelően</p>
          </div>
        </section>

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

<div class="modal" :class="{ active: showModal }">
  <div class="modal-content">
    <div class="modal-header">
      <h3 class="modal-title">Új feladat hozzáadása</h3>
      <button class="close-modal" @click="closeModal">&times;</button>
    </div>

    <form @submit.prevent="handleTaskSubmit">
      <div class="form-group">
        <label for="taskTitle">Feladat címe</label>
        <input type="text" id="taskTitle" v-model="newTask.title" class="form-control" required>
      </div>

      <div class="form-group">
        <label for="taskDescription">Leírás</label>
        <textarea id="taskDescription" v-model="newTask.description" class="form-control" rows="3"></textarea>
      </div>

      <div class="form-group">
        <label for="taskStudent">Felelős diák</label>
        <select id="taskStudent" v-model="newTask.studentId" class="form-control" required>
          <option value="">Válassz diákot</option>
          <option v-for="student in students" :key="student.id" :value="student.id">
            {{ student.teljes_nev }} ({{ student.felhasznalonev }})
          </option>
        </select>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="taskPriority">Prioritás</label>
          <select id="taskPriority" v-model="newTask.priority" class="form-control" required>
            <option value="">Válassz prioritást</option>
            <option value="low">Alacsony</option>
            <option value="medium">Közepes</option>
            <option value="high">Magas</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="taskDeadline">Határidő</label>
        <input type="date" id="taskDeadline" v-model="newTask.deadline" class="form-control" required>
      </div>

      <div class="form-actions" style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="button" class="btn btn-outline" @click="closeModal">Mégse</button>
        <button type="submit" class="btn btn-primary">Mentés</button>
      </div>
    </form>
  </div>
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
      showModal: false,
      students: [],
      projects: [],
      newTask: {
        title: '',
        description: '',
        priority: '',
        studentId: '',
        deadline: ''
      },
      tasks: []
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
      this.showModal = true;
      this.newTask = {
        title: '',
        description: '',
        priority: '',
        studentId: '',
        deadline: ''
      };
    },
    closeModal() {
      this.showModal = false;
    },
    async handleTaskSubmit() {
      if (!this.newTask.title || !this.newTask.studentId || !this.newTask.deadline || !this.newTask.priority) {
        alert('Kérlek töltsd ki az összes kötelező mezőt!');
        return;
      }

      const projektId = this.projects.length > 0 ? parseInt(this.projects[0].id) : 1;

      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('http://localhost:3000/api/project/ujFeladat', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            projekt_id: projektId,
            feladat_nev: this.newTask.title,
            feladat_leiras: this.newTask.description,
            felelos_id: parseInt(this.newTask.studentId),
            prioritas: this.mapPriorityToHungarian(this.newTask.priority),
            statusz: 'folyamatban',
            hatarido: this.newTask.deadline
          })
        });

        const data = await res.json();
        if (data.success) {
          alert('Feladat sikeresen létrehozva!');
          this.closeModal();
          await this.fetchTasks();
        } else {
          alert('Hiba a feladat létrehozásakor: ' + (data.message || 'Ismeretlen hiba'));
        }
      } catch (e) {
        console.error('Feladat létrehozási hiba:', e);
        alert('Hiba a feladat létrehozásakor!');
      }
    },
    mapPriorityToHungarian(priority) {
      const map = {
        'low': 'alacsony',
        'medium': 'közepes',
        'high': 'magas'
      };
      return map[priority] || priority;
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
    },
    async fetchStudents() {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('http://localhost:3000/api/project/projektTag', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          this.students = data.data.filter(u => u.szerep_tipus === 'diak');
        }
        
        const projectRes = await fetch('http://localhost:3000/api/project/projektek', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const projectData = await projectRes.json();
        if (projectData.success && projectData.data && Array.isArray(projectData.data.projects)) {
          this.projects = projectData.data.projects;
        }
        
        await this.fetchTasks();
      } catch (e) {
        console.error('Hiba az adatok lekérdezésekor:', e);
      }
    },
    async fetchTasks() {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('http://localhost:3000/api/project/feladatok', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success && data.data && Array.isArray(data.data.tasks)) {
          this.tasks = data.data.tasks.map(task => {
            const student = this.students.find(s => s.id === task.felelos_id);
            const studentName = student ? student.teljes_nev : 'Ismeretlen';
            const studentInitials = student ? this.generateInitials(student.teljes_nev) : '?';
            
            return {
              id: task.id,
              studentName: studentName,
              studentInitials: studentInitials,
              taskName: task.feladat_nev,
              deadline: task.hatarido,
              status: this.mapTaskStatus(task.statusz),
              progress: this.calculateProgress(task.statusz)
            };
          });
        }
      } catch (e) {
        console.error('Hiba a feladatok lekérdezésekor:', e);
      }
    },
    mapTaskStatus(statusz) {
      const statusMap = {
        'folyamatban': 'in-progress',
        'befejezett': 'completed',
        'késett': 'late'
      };
      return statusMap[statusz] || 'in-progress';
    },
    calculateProgress(statusz) {
      const progressMap = {
        'folyamatban': 50,
        'befejezett': 100,
        'késett': 30
      };
      return progressMap[statusz] || 0;
    }
  },
  mounted() {
    this.fetchUserProfile();
    this.fetchStudents();
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

.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  justify-content: center;
  align-items: center;
}

.modal.active {
  display: flex;
}

.modal-content {
  background-color: white;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
}

.modal-title {
  font-size: 1.3rem;
  color: var(--primary);
}

.close-modal {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
}

.close-modal:hover {
  color: #000;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: var(--primary);
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 5px;
  font-size: 1rem;
  color: var(--primary);
}

.form-control:focus {
  outline: none;
  border-color: var(--primary);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
}

.btn-outline {
  background: white;
  color: var(--primary);
  border: 1px solid var(--primary);
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-outline:hover {
  background: var(--primary);
  color: white;
}
</style>