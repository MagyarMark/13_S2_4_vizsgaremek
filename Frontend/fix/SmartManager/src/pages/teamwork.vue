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
        <router-link to="/teamwork" class="active"><li><i class="fas fa-users"></i> Csapatmunka</li></router-link>
        <router-link to="/chat"><li><i class="fas fa-comments"></i> Üzenetek</li></router-link>
        <router-link to="/settings"><li><i class="fas fa-cog"></i> Beállítások</li></router-link>
      </ul>
    </aside>

    <!-- Header -->
    <header>
      <div class="header-left">
        <h1>Csapatmunka</h1>
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
    <main class="teamwork-dashboard">
      <!-- Teams Overview Section -->
      <section class="teamwork-section">
        <div class="section-header">
          <h2 class="section-title">Csapataim</h2>
          <button class="btn btn-primary" @click="openCreateTeamModal">
            <i class="fas fa-plus"></i> Új csapat
          </button>
        </div>

        <div class="teams-grid">
          <div v-for="team in teams" :key="team.id" class="team-card" @click="selectTeam(team.id)">
            <div class="team-header">
              <div class="team-icon">
                <i :class="team.icon"></i>
              </div>
              <div class="team-actions">
                <button class="btn-icon" @click.stop="editTeam(team)"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete" @click.stop="deleteTeam(team.id)"><i class="fas fa-trash"></i></button>
              </div>
            </div>
            <h3>{{ team.name }}</h3>
            <p class="team-description">{{ team.description }}</p>
            <div class="team-meta">
              <span class="meta-item"><i class="fas fa-users"></i> {{ team.members.length }} tag</span>
              <span class="meta-item"><i class="fas fa-tasks"></i> {{ team.tasks.length }} feladat</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Team Details Section -->
      <section v-if="selectedTeam" class="teamwork-section team-details">
        <div class="section-header">
          <h2 class="section-title">{{ selectedTeam.name }} - Részletek</h2>
          <button class="btn btn-secondary" @click="selectedTeam = null">
            <i class="fas fa-times"></i> Bezárás
          </button>
        </div>

        <div class="team-content">
          <!-- Members Tab -->
          <div class="tabs">
            <button 
              v-for="tab in ['members', 'tasks', 'activity']"
              :key="tab"
              :class="['tab-button', { active: activeTab === tab }]"
              @click="activeTab = tab"
            >
              <i :class="getTabIcon(tab)"></i>
              {{ getTabLabel(tab) }}
            </button>
          </div>

          <!-- Members Content -->
          <div v-if="activeTab === 'members'" class="tab-content">
            <div class="members-section">
              <div class="section-actions">
                <button class="btn btn-primary" @click="openAddMemberModal">
                  <i class="fas fa-user-plus"></i> Tag hozzáadása
                </button>
              </div>

              <div class="members-grid">
                <div v-for="member in selectedTeam.members" :key="member.id" class="member-card">
                  <div class="member-header">
                    <div class="member-avatar">{{ member.initials }}</div>
                    <div class="member-info">
                      <h4>{{ member.name }}</h4>
                      <span class="member-role">{{ member.role }}</span>
                    </div>
                    <button class="btn-icon" @click="removeMember(member.id)"><i class="fas fa-times"></i></button>
                  </div>
                  <div class="member-status">
                    <span :class="['status-badge', member.status]">{{ member.status }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tasks Content -->
          <div v-if="activeTab === 'tasks'" class="tab-content">
            <div class="tasks-section">
              <div class="section-actions">
                <button class="btn btn-primary" @click="openCreateTaskModal">
                  <i class="fas fa-plus"></i> Új feladat
                </button>
              </div>

              <div class="tasks-list">
                <div v-for="task in selectedTeam.tasks" :key="task.id" class="task-item">
                  <div class="task-header">
                    <div class="task-title-section">
                      <input 
                        type="checkbox" 
                        :checked="task.completed"
                        @change="toggleTaskComplete(task.id)"
                        class="task-checkbox"
                      >
                      <h4 :class="{ completed: task.completed }">{{ task.title }}</h4>
                    </div>
                    <button class="btn btn-primary" @click="openDownloadFileModal(task.id)"><i class="fas fa-download"></i> Fájl feltöltése</button>
                    <span :class="['priority-badge', task.priority]">{{ getPriorityLabel(task.priority) }}</span>
                  </div>
                  <p class="task-description">{{ task.description }}</p>
                  <div class="task-footer">
                    <span class="assignee"><i class="fas fa-user-circle"></i> {{ task.assignee }}</span>
                    <span class="deadline"><i class="fas fa-calendar"></i> {{ formatDate(task.deadline) }}</span>
                    <div class="task-actions">
                      <button class="btn-icon" @click="editTask(task)"><i class="fas fa-edit"></i></button>
                      <button class="btn-icon delete" @click="deleteTask(task.id)"><i class="fas fa-trash"></i></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Activity Content -->
          <div v-if="activeTab === 'activity'" class="tab-content">
            <div class="activity-section">
              <div class="activity-timeline">
                <div v-for="activity in selectedTeam.activity" :key="activity.id" class="activity-item">
                  <div class="activity-icon">
                    <i :class="getActivityIcon(activity.type)"></i>
                  </div>
                  <div class="activity-content">
                    <p class="activity-text">
                      <strong>{{ activity.user }}</strong> {{ activity.action }}
                    </p>
                    <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Statistics Sidebar -->
      <aside class="teamwork-stats">
        <section class="teamwork-section">
          <div class="section-header">
            <h2 class="section-title">Statisztika</h2>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">{{ teams.length }}</div>
              <div class="stat-label">Csapatok</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ totalMembers }}</div>
              <div class="stat-label">Tagok</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ totalTasks }}</div>
              <div class="stat-label">Feladatok</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ completedTasks }}</div>
              <div class="stat-label">Befejezett</div>
            </div>
          </div>
        </section>

        <section class="teamwork-section">
          <div class="section-header">
            <h2 class="section-title">Közelgő határidők</h2>
          </div>

          <div class="upcoming-list">
            <div v-for="task in upcomingTasks" :key="task.id" class="upcoming-item">
              <div class="upcoming-header">
                <h4>{{ task.title }}</h4>
                <span :class="['priority-badge', task.priority]">{{ getPriorityLabel(task.priority) }}</span>
              </div>
              <p class="upcoming-team">{{ task.team }}</p>
              <span class="upcoming-date"><i class="fas fa-calendar-alt"></i> {{ formatDate(task.deadline) }}</span>
            </div>
          </div>
        </section>
      </aside>
    </main>

    <!-- Create/Edit Team Modal -->
    <div :class="['modal', { active: showTeamModal }]">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ editingTeam ? 'Csapat szerkesztése' : 'Új csapat hozzáadása' }}</h3>
          <button class="close-modal" @click="showTeamModal = false">&times;</button>
        </div>

        <form @submit.prevent="saveTeam">
          <div class="form-group">
            <label for="teamName">Csapat neve</label>
            <input type="text" id="teamName" v-model="formData.teamName" class="form-control" required>
          </div>

          <div class="form-group">
            <label for="teamDesc">Leírás</label>
            <textarea id="teamDesc" v-model="formData.teamDesc" class="form-control" rows="3"></textarea>
          </div>

          <div class="form-group">
            <label for="teamIcon">Ikon</label>
            <select id="teamIcon" v-model="formData.teamIcon" class="form-control" required>
              <option value="fas fa-code">Webfejlesztés</option>
              <option value="fas fa-database">Adatbázis</option>
              <option value="fas fa-palette">Dizájn</option>
              <option value="fas fa-rocket">Marketing</option>
              <option value="fas fa-cogs">Fejlesztés</option>
            </select>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-outline" @click="showTeamModal = false">Mégse</button>
            <button type="submit" class="btn btn-primary">Mentés</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Member Modal -->
    <div :class="['modal', { active: showMemberModal }]">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Tag hozzáadása</h3>
          <button class="close-modal" @click="showMemberModal = false">&times;</button>
        </div>

        <form @submit.prevent="addMember">
          <div class="form-group">
            <label for="memberSelect">Felhasználó kiválasztása</label>
            <select id="memberSelect" v-model="formData.selectedMember" class="form-control" required>
              <option value="">Válassz felhasználót</option>
              <option v-for="user in availableDiakUsers" :key="user.id" :value="user.teljes_nev || user.felhasznalonev">
                {{ user.teljes_nev }} - ({{ user.felhasznalonev }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="memberRole">Szerep</label>
            <select id="memberRole" v-model="formData.memberRole" class="form-control" required>
              <option value="Tag">Tag</option>
              <option value="Vezető">Vezető</option>
              <option value="Koordinátor">Koordinátor</option>
            </select>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-outline" @click="showMemberModal = false">Mégse</button>
            <button type="submit" class="btn btn-primary">Hozzáadás</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Create Task Modal -->
    <div :class="['modal', { active: showTaskModal }]">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Új feladat hozzáadása</h3>
          <button class="close-modal" @click="showTaskModal = false">&times;</button>
        </div>

        <form @submit.prevent="saveTask">
          <div class="form-group">
            <label for="taskTitle">Feladat címe</label>
            <input type="text" id="taskTitle" v-model="formData.taskTitle" class="form-control" required>
          </div>

          <div class="form-group">
            <label for="taskDesc">Leírás</label>
            <textarea id="taskDesc" v-model="formData.taskDesc" class="form-control" rows="3"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="taskAssignee">Hozzárendelés</label>
              <select id="taskAssignee" v-model="formData.taskAssignee" class="form-control" required :disabled="!selectedTeam">
                <option value="">Válassz tagot</option>
                <option v-for="user in availableDiakUsers" :key="user.id" :value="user.teljes_nev || user.felhasznalonev">
                {{ user.teljes_nev }} - ({{ user.felhasznalonev }})
              </option>
              </select>
            </div>

            <div class="form-group">
              <label for="taskPriority">Prioritás</label>
              <select id="taskPriority" v-model="formData.taskPriority" class="form-control" required>
                <option value="low">Alacsony</option>
                <option value="medium">Közepes</option>
                <option value="high">Magas</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="taskDeadline">Határidő</label>
            <input type="date" id="taskDeadline" v-model="formData.taskDeadline" class="form-control" required>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-outline" @click="showTaskModal = false">Mégse</button>
            <button type="submit" class="btn btn-primary">Mentés</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
  name: "Teamwork",
  data() {
    return {
      userProfile: {
        teljes_nev: '',
        felhasznalonev: '',
        szerep_tipus: 'diak',
        initials: ''
      },
      activeTab: 'members',
      selectedTeam: null,
      editingTeam: null,
      showTeamModal: false,
      showMemberModal: false,
      showTaskModal: false,
      availableUsers: [],
      formData: {
        teamName: '',
        teamDesc: '',
        teamIcon: 'fas fa-code',
        selectedMember: '',
        memberRole: 'Tag',
        taskTitle: '',
        taskDesc: '',
        taskAssignee: '',
        taskPriority: 'medium',
        taskDeadline: ''
      },
      teams: [
        {
          id: 1,
          name: 'Webfejlesztés csapat',
          description: 'Frontend és backend fejlesztés',
          icon: 'fas fa-code',
          members: [
            { id: 1, name: 'Bence Kovács', initials: 'BK', role: 'Vezető', status: 'Aktív' },
            { id: 2, name: 'Kata Varga', initials: 'KV', role: 'Tag', status: 'Aktív' },
            { id: 3, name: 'Te', initials: 'TD', role: 'Tag', status: 'Inaktív' }
          ],
          tasks: [
            {
              id: 1,
              title: 'Login komponens fejlesztése',
              description: 'Vue komponens a bejelentkezéshez',
              assignee: 'Bence Kovács',
              priority: 'high',
              deadline: '2026-01-15',
              completed: false
            },
            {
              id: 2,
              title: 'API integráció',
              description: 'Backend API összekötése',
              assignee: 'Kata Varga',
              priority: 'high',
              deadline: '2026-01-20',
              completed: true
            },
            {
              id: 3,
              title: 'Stílus finomítása',
              description: 'CSS optimalizálás',
              assignee: 'Te',
              priority: 'medium',
              deadline: '2026-01-25',
              completed: false
            }
          ],
          activity: [
            { id: 1, user: 'Bence Kovács', action: 'befejezett egy feladatot', type: 'complete', timestamp: '2 órája' },
            { id: 2, user: 'Kata Varga', action: 'hozzáadott egy megjegyzést', type: 'comment', timestamp: '5 órája' },
            { id: 3, user: 'Te', action: 'törölte a csapathoz', type: 'join', timestamp: '1 napja' },
            { id: 4, user: 'Bence Kovács', action: 'létrehozta a csapatot', type: 'create', timestamp: '3 napja' }
          ]
        },
        {
          id: 2,
          name: 'Adatbázis csapat',
          description: 'Adatmodellezés és SQL',
          icon: 'fas fa-database',
          members: [
            { id: 4, name: 'Dani Soós', initials: 'DS', role: 'Vezető', status: 'Aktív' },
            { id: 5, name: 'Anna Molnár', initials: 'AM', role: 'Tag', status: 'Aktív' }
          ],
          tasks: [
            {
              id: 4,
              title: 'Adatbázis séma tervezése',
              description: 'ER diagram készítés',
              assignee: 'Dani Soós',
              priority: 'high',
              deadline: '2026-01-18',
              completed: false
            },
            {
              id: 5,
              title: 'SQL lekérdezések írása',
              description: 'CRUD operációk',
              assignee: 'Anna Molnár',
              priority: 'medium',
              deadline: '2026-01-22',
              completed: false
            }
          ],
          activity: [
            { id: 5, user: 'Dani Soós', action: 'frissítette az adatbázis sémát', type: 'update', timestamp: '3 órája' },
            { id: 6, user: 'Anna Molnár', action: 'megjegyzést adott hozzá', type: 'comment', timestamp: '1 napja' }
          ]
        },
        {
          id: 3,
          name: 'Dizájn csapat',
          description: 'UI/UX és grafikai dizájn',
          icon: 'fas fa-palette',
          members: [
            { id: 6, name: 'Péter Nagy', initials: 'PN', role: 'Vezető', status: 'Aktív' }
          ],
          tasks: [
            {
              id: 6,
              title: 'Wireframe készítés',
              description: 'Lapok vázlatai',
              assignee: 'Péter Nagy',
              priority: 'medium',
              deadline: '2026-01-16',
              completed: true
            }
          ],
          activity: [
            { id: 7, user: 'Péter Nagy', action: 'feltöltött egy mockupot', type: 'upload', timestamp: '2 napja' }
          ]
        }
      ]
    }
  },
  computed: {
    totalMembers() {
      return this.teams.reduce((sum, team) => sum + team.members.length, 0);
    },
    totalTasks() {
      return this.teams.reduce((sum, team) => sum + team.tasks.length, 0);
    },
    completedTasks() {
      return this.teams.reduce((sum, team) => 
        sum + team.tasks.filter(t => t.completed).length, 0
      );
    },
    upcomingTasks() {
      const allTasks = [];
      this.teams.forEach(team => {
        team.tasks.forEach(task => {
          allTasks.push({
            ...task,
            team: team.name
          });
        });
      });
      return allTasks
        .filter(task => !task.completed)
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 5);
    },
    availableDiakUsers() {
      return this.availableUsers.filter(user => user.szerep_tipus === 'diak');
    }
  },
  methods: {
    selectTeam(teamId) {
      this.selectedTeam = this.teams.find(t => t.id === teamId);
      this.activeTab = 'members';
    },
    openCreateTeamModal() {
      this.editingTeam = null;
      this.formData = { teamName: '', teamDesc: '', teamIcon: 'fas fa-code' };
      this.showTeamModal = true;
      },
    openDownloadFileModal() {
        alert('Fájl feltöltése funkció még nincs implementálva.');
    },
    editTeam(team) {
      this.editingTeam = team;
      this.formData = {
        teamName: team.name,
        teamDesc: team.description,
        teamIcon: team.icon
      };
      this.showTeamModal = true;
    },
    saveTeam() {
      if (this.editingTeam) {
        this.editingTeam.name = this.formData.teamName;
        this.editingTeam.description = this.formData.teamDesc;
        this.editingTeam.icon = this.formData.teamIcon;
      } else {
        const newTeam = {
          id: Math.max(...this.teams.map(t => t.id)) + 1,
          name: this.formData.teamName,
          description: this.formData.teamDesc,
          icon: this.formData.teamIcon,
          members: [],
          tasks: [],
          activity: []
        };
        this.teams.push(newTeam);
      }
      this.showTeamModal = false;
    },
    deleteTeam(teamId) {
      if (confirm('Biztosan törlöd a csapatot?')) {
        this.teams = this.teams.filter(t => t.id !== teamId);
        this.selectedTeam = null;
      }
    },
    openAddMemberModal() {
      this.formData.selectedMember = '';
      this.formData.memberRole = 'Tag';
      this.showMemberModal = true;
    },
    addMember() {
      if (this.selectedTeam && this.formData.selectedMember) {
        const newMember = {
          id: Math.max(...this.selectedTeam.members.map(m => m.id), 0) + 1,
          name: this.formData.selectedMember,
          initials: this.generateInitials(this.formData.selectedMember),
          role: this.formData.memberRole,
          status: 'Aktív'
        };
        this.selectedTeam.members.push(newMember);
        this.showMemberModal = false;
      }
    },
    removeMember(memberId) {
      if (this.selectedTeam) {
        this.selectedTeam.members = this.selectedTeam.members.filter(m => m.id !== memberId);
      }
    },
    openCreateTaskModal() {
      this.formData = {
        taskTitle: '',
        taskDesc: '',
        taskAssignee: '',
        taskPriority: 'medium',
        taskDeadline: ''
      };
      this.showTaskModal = true;
    },
    saveTask() {
      if (this.selectedTeam && this.formData.taskTitle && this.formData.taskAssignee) {
        const newTask = {
          id: Math.max(...this.selectedTeam.tasks.map(t => t.id), 0) + 1,
          title: this.formData.taskTitle,
          description: this.formData.taskDesc,
          assignee: this.formData.taskAssignee,
          priority: this.formData.taskPriority,
          deadline: this.formData.taskDeadline,
          completed: false
        };
        this.selectedTeam.tasks.push(newTask);
        this.showTaskModal = false;
      }
    },
    editTask(task) {
      this.formData = {
        taskTitle: task.title,
        taskDesc: task.description,
        taskAssignee: task.assignee,
        taskPriority: task.priority,
        taskDeadline: task.deadline
      };
      this.showTaskModal = true;
    },
    deleteTask(taskId) {
      if (this.selectedTeam) {
        this.selectedTeam.tasks = this.selectedTeam.tasks.filter(t => t.id !== taskId);
      }
    },
    toggleTaskComplete(taskId) {
      if (this.selectedTeam) {
        const task = this.selectedTeam.tasks.find(t => t.id === taskId);
        if (task) {
          task.completed = !task.completed;
        }
      }
    },
    getTabIcon(tab) {
      const icons = {
        members: 'fas fa-users',
        tasks: 'fas fa-tasks',
        activity: 'fas fa-history'
      };
      return icons[tab] || '';
    },
    getTabLabel(tab) {
      const labels = {
        members: 'Tagok',
        tasks: 'Feladatok',
        activity: 'Tevékenység'
      };
      return labels[tab] || '';
    },
    getPriorityLabel(priority) {
      const labels = {
        low: 'Alacsony',
        medium: 'Közepes',
        high: 'Magas'
      };
      return labels[priority] || priority;
    },
    getActivityIcon(type) {
      const icons = {
        complete: 'fas fa-check-circle',
        comment: 'fas fa-comment',
        join: 'fas fa-user-plus',
        create: 'fas fa-plus-circle',
        update: 'fas fa-edit',
        upload: 'fas fa-cloud-upload-alt'
      };
      return icons[type] || 'fas fa-circle';
    },
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('hu-HU');
    },
    formatTime(timeStr) {
      return timeStr;
    },
    generateInitials(name) {
      if (!name) return '';
      const parts = name.split(' ');
      return parts.map(part => part.charAt(0).toUpperCase()).join('').substring(0, 2);
    },
    getRoleLabel(role) {
      const roleMap = {
        'diak': 'Diák',
        'tanar': 'Tanár',
        'admin': 'Adminisztrátor'
      };
      return roleMap[role] || role;
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
    async fetchTeamUsers() {
      try {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          console.warn('Nincs authentikációs token');
          return;
        }

        const response = await fetch(`http://localhost:3000/api/project/projektTag`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          console.warn(`API válasz hiba: ${response.status}`);
          return;
        }

        const data = await response.json();
        console.log('API válasz:', data);
        
        if (data.success && Array.isArray(data.data)) {
          this.availableUsers = data.data;
          console.log('Felhasználók betöltve:', this.availableUsers);
        } else if (Array.isArray(data.data)) {
          this.availableUsers = data.data;
          console.log('Felhasználók betöltve:', this.availableUsers);
        } else if (Array.isArray(data)) {
          this.availableUsers = data;
          console.log('Felhasználók betöltve:', this.availableUsers);
        } else {
          console.warn('Váratlan API válasz formátum:', data);
        }
      } catch (error) {
        console.error('Csapat felhasználóinak lekérése sikertelen:', error);
      }
    },
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
  },
  mounted() {
    this.fetchUserProfile();
    this.fetchTeamUsers();
  }
}
</script>

<style scoped>
    * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dashboard-wrapper {
  display: grid;
  grid-template-columns: 300px 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "sidebar header"
    "sidebar main";
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8fafc;
  color: #333;
}

/* ==================== MAIN CONTENT ==================== */
.teamwork-dashboard {
  grid-area: main;
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 1.5rem;
  padding: 1.5rem;
  max-width: 1600px;
  margin: 50px auto;
  width: 100%;
}

.teamwork-section {
  background-color: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1e293b;
}

/* ==================== GOMBOK ==================== */
.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 5px 15px rgba(37, 99, 235, 0.3);
}

.btn-secondary {
  background-color: #f1f5f9;
  color: #475569;
}

.btn-secondary:hover {
  background-color: #e2e8f0;
}

.btn-outline {
  background-color: transparent;
  border: 2px solid #cbd5e1;
  color: #475569;
}

.btn-outline:hover {
  border-color: #94a3b8;
  background-color: #f8fafc;
}

.btn-icon {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background-color: #f1f5f9;
  color: #3b82f6;
}

.btn-icon.delete:hover {
  background-color: #fee2e2;
  color: #dc2626;
}

/* ==================== CSAPAT KÁRTYÁK ==================== */
.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.team-card {
  background-color: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
}

.team-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
  background-color: white;
}

.team-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.team-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.team-actions {
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.team-card:hover .team-actions {
  opacity: 1;
}

.team-card h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.team-description {
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.team-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #64748b;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

/* ==================== CSAPAT RÉSZLETEK ==================== */
.team-details {
  margin-top: 2rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
}

.tab-button {
  padding: 0.8rem 1.5rem;
  background: none;
  border: none;
  border-radius: 8px 8px 0 0;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-button:hover {
  background-color: #f1f5f9;
  color: #3b82f6;
}

.tab-button.active {
  background-color: #3b82f6;
  color: white;
}

/* ==================== TAG KÁRTYÁK ==================== */
.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.member-card {
  background-color: #f8fafc;
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid #e2e8f0;
}

.member-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.member-avatar {
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.member-info h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.member-role {
  font-size: 0.85rem;
  color: #64748b;
}

.status-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.active {
  background-color: #dcfce7;
  color: #166534;
}

.status-badge.inactive {
  background-color: #f1f5f9;
  color: #64748b;
}

/* ==================== FELADATOK ==================== */
.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-item {
  background-color: #f8fafc;
  border-radius: 12px;
  padding: 1.2rem;
  border-left: 4px solid #3b82f6;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.task-title-section {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.task-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.task-item h4 {
  font-weight: 600;
  color: #1e293b;
}

.task-item h4.completed {
  text-decoration: line-through;
  color: #94a3b8;
}

.priority-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.priority-badge.high {
  background-color: #fee2e2;
  color: #dc2626;
}

.priority-badge.medium {
  background-color: #fef3c7;
  color: #d97706;
}

.priority-badge.low {
  background-color: #dcfce7;
  color: #166534;
}

.task-description {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #64748b;
}

.assignee, .deadline {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.task-actions {
  display: flex;
  gap: 0.5rem;
}

/* ==================== AKTIVITÁS TIMELINE ==================== */
.activity-timeline {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.activity-item {
  display: flex;
  gap: 1rem;
  padding-bottom: 1.2rem;
  border-bottom: 1px solid #e2e8f0;
  position: relative;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-text {
  color: #1e293b;
  line-height: 1.5;
}

.activity-time {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 0.3rem;
  display: block;
}

/* ==================== STATISZTIKA SIDEBAR ==================== */
.teamwork-stats {
  grid-column: 2;
  grid-row: 1 / span 2;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-card {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  border: 1px solid #e2e8f0;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: #3b82f6;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 600;
}

.upcoming-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upcoming-item {
  background-color: #f8fafc;
  border-radius: 12px;
  padding: 1rem;
  border-left: 4px solid #f59e0b;
}

.upcoming-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.upcoming-team {
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.upcoming-date {
  font-size: 0.85rem;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

/* ==================== MODALOK ==================== */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.modal.active {
  opacity: 1;
  visibility: visible;
}

.modal-content {
  background-color: white;
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1e293b;
}

.close-modal {
  background: none;
  border: none;
  font-size: 1.8rem;
  color: #64748b;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-modal:hover {
  background-color: #f1f5f9;
  color: #dc2626;
}

/* ==================== FORMOK ==================== */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #475569;
  font-size: 0.95rem;
}

.form-control {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid #cbd5e1;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: white;
  color: #1e293b;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

textarea.form-control {
  min-height: 100px;
  resize: vertical;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}
/* ==================== ANIMÁCIÓK ==================== */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(20px);
  opacity: 0;
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

  .teamwork-dashboard {
    grid-template-columns: 1fr;
  }

  .teamwork-stats {
    width: 100%;
  }

  .teams-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  header {
    padding: 0 1rem;
    height: 60px;
  }

  main {
    padding: 1rem;
    margin-top: 60px;
  }

  .teamwork-section {
    padding: 1rem;
  }

  .teams-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .team-card {
    padding: 1rem;
  }

  .team-header {
    gap: 0.75rem;
  }

  .team-icon {
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
  }

  .tabs {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .tab-button {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }

  .members-grid {
    grid-template-columns: 1fr;
  }

  .member-card {
    padding: 0.75rem;
  }

  .tasks-list {
    gap: 0.75rem;
  }

  .task-item {
    padding: 0.75rem;
  }

  .modal-content {
    max-width: 90%;
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-control {
    padding: 0.75rem;
  }
}

@media (max-width: 600px) {
  header {
    padding: 0 0.75rem;
    height: 56px;
  }

  main {
    padding: 0.75rem;
    margin-top: 56px;
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

  .section-title {
    font-size: 1.1rem;
  }

  .section-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }

  .teams-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .team-card {
    padding: 0.75rem;
  }

  .team-icon {
    width: 40px;
    height: 40px;
    font-size: 1.3rem;
  }

  .team-meta {
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.8rem;
  }

  .tabs {
    flex-direction: column;
    gap: 0.25rem;
  }

  .tab-button {
    padding: 0.65rem 0.8rem;
    font-size: 0.85rem;
  }

  .members-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .member-card {
    padding: 0.65rem;
  }

  .member-avatar {
    width: 32px;
    height: 32px;
  }

  .member-info h4 {
    font-size: 0.9rem;
  }

  .member-role {
    font-size: 0.75rem;
  }

  .tasks-list {
    gap: 0.65rem;
  }

  .task-item {
    padding: 0.65rem;
  }

  .task-title-section h4 {
    font-size: 0.95rem;
  }

  .task-description {
    font-size: 0.8rem;
  }

  .task-footer {
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.8rem;
  }

  .activity-item {
    padding: 0.75rem;
  }

  .activity-icon {
    width: 32px;
    height: 32px;
    font-size: 0.95rem;
  }

  .modal-content {
    max-width: 95%;
    padding: 1rem;
  }

  .modal-title {
    font-size: 1.2rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-control {
    padding: 0.65rem;
    font-size: 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .stat-card {
    padding: 0.75rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .stat-label {
    font-size: 0.8rem;
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

  .section-title {
    font-size: 1rem;
  }

  .btn {
    padding: 0.5rem 0.8rem;
    font-size: 0.85rem;
    width: 100%;
  }

  .teams-grid {
    gap: 0.5rem;
  }

  .team-card {
    padding: 0.5rem;
  }

  .team-icon {
    width: 36px;
    height: 36px;
  }

  .team-header {
    gap: 0.25rem;
  }

  .tab-button {
    padding: 0.5rem 0.6rem;
    font-size: 0.8rem;
  }

  .member-card,
  .task-item {
    padding: 0.5rem;
  }

  .member-info h4,
  .task-title-section h4 {
    font-size: 0.85rem;
  }

  .modal-content {
    max-width: 100%;
  }

  .modal-title {
    font-size: 1.1rem;
  }

  .form-control {
    padding: 0.6rem;
    font-size: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .stat-value {
    font-size: 1.3rem;
  }
}
</style>