<template>
  <div class="dashboard-wrapper">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <aside class="sidebar">
      <div class="logo">
        <h2>Smart<span>Manager</span></h2>
        <p>Diák Portál</p>
      </div>
      <ul class="nav-links">
        <router-link to="/diak"><li><i class="fas fa-home"></i> Áttekintés</li></router-link>
        <router-link to="/task"><li><i class="fas fa-tasks"></i> Feladatok</li></router-link>
        <router-link to="/teamwork" class="active"><li><i class="fas fa-users"></i> Projektmunka</li></router-link>
        <router-link to="/chat"><li><i class="fas fa-comments"></i> Üzenetek</li></router-link>
        <router-link to="/settings"><li><i class="fas fa-cog"></i> Beállítások</li></router-link>
      </ul>
    </aside>

    <header>
      <div class="header-left">
        <h1>Projektmunka</h1>
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

    <main class="teamwork-dashboard">
      <section class="teamwork-section">
        <div class="section-header">
          <h2 class="section-title">Projektek</h2>
          <!--<button class="btn btn-primary" @click="openCreateTeamModal">
            <i class="fas fa-plus"></i> Új Projekt
          </button>-->
        </div>

        <div class="teams-grid">
          <div v-for="team in teams" :key="team.id" class="team-card" @click="selectTeam(team.id)">
            <div class="team-header">
              <div class="team-icon">
                <i :class="team.icon"></i>
              </div>
              <!--<div class="team-actions">
                <button class="btn-icon" @click.stop="editTeam(team)"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete" @click.stop="deleteTeam(team.id)"><i class="fas fa-trash"></i></button>
              </div>-->
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

      <section v-if="selectedTeam" class="teamwork-section team-details">
        <div class="section-header">
          <h2 class="section-title">{{ selectedTeam.name }} - Részletek</h2>
          <button class="btn btn-secondary" @click="selectedTeam = null">
            <i class="fas fa-times"></i> Bezárás
          </button>
        </div>

        <div class="team-content">
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

          <div v-if="activeTab === 'members'" class="tab-content">
            <div class="members-section">
              <!--<div class="section-actions">
                <button class="btn btn-primary" @click="openAddMemberModal">
                  <i class="fas fa-user-plus"></i> Tag hozzáadása
                </button>
              </div>-->

              <div class="members-grid">
                <div v-for="member in selectedTeam.members" :key="member.id" class="member-card">
                  <div class="member-header">
                    <div class="member-avatar">{{ member.initials }}</div>
                    <div class="member-info">
                      <h4>{{ member.name }}</h4>
                      <span class="member-role">{{ member.role }}</span>
                    </div>
                    <!--<button class="btn-icon" @click="removeMember(member.id)"><i class="fas fa-times"></i></button>-->
                  </div>
                  <div class="member-status">
                    <span :class="['status-badge', member.status]">{{ member.status }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'tasks'" class="tab-content">
            <div class="tasks-section">
              <!--<div class="section-actions">
                <button class="btn btn-primary" @click="openCreateTaskModal">
                  <i class="fas fa-plus"></i> Új feladat
                </button>
              </div>-->

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
                    <!--<div class="task-actions">
                      <button class="btn-icon" @click="editTask(task)"><i class="fas fa-edit"></i></button>
                      <button class="btn-icon delete" @click="deleteTask(task.id)"><i class="fas fa-trash"></i></button>
                    </div>-->
                  </div>
                </div>
              </div>
            </div>
          </div>

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

      <!----><aside class="teamwork-stats">
        <section class="teamwork-section">
          <div class="section-header">
            <h2 class="section-title">Statisztika {{ selectedTeam ? `- ${selectedTeam.name}` : '- Összes' }}</h2>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">{{ selectedTeam ? 1 : teams.length }}</div>
              <div class="stat-label">{{ selectedTeam ? 'Projekt' : 'Projektok' }}</div>
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

        <section class="teamwork-section">
          <div class="section-header">
            <h2 class="section-title">Feltöltött fájlok</h2>
          </div>

          <div class="uploaded-files-list" v-if="teamUploadedFiles.length > 0">
            <div v-for="file in teamUploadedFiles" :key="file.id" class="uploaded-file-item">
              <div class="file-icon">
                <i class="fas fa-file"></i>
              </div>
              <div class="file-info">
                <h4>{{ file.name }}</h4>
                <span class="file-task">{{ file.taskName }}</span>
              </div>
              <span class="file-size" v-if="file.size">{{ file.size }} KB</span> 
              <button 
                @click="deleteFile(file.id)"
                style="background-color: red; color: white; border: none; border-radius: 3px; padding: 2px 6px; cursor: pointer;"
                title="Fájl törlése"
              >
                Törlés
              </button>
            </div>
          </div>
          <div v-else class="no-files">
            <p><i class="fas fa-inbox"></i> Nincs feltöltött fájl</p>
          </div>
        </section>
      </aside>
    </main>

    <div :class="['modal', { active: showTeamModal }]">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ editingTeam ? 'Projekt szerkesztése' : 'Új Projekt hozzáadása' }}</h3>
          <button class="close-modal" @click="showTeamModal = false">&times;</button>
        </div>

        <form @submit.prevent="saveTeam">
          <div class="form-group">
            <label for="teamName">Projekt neve</label>
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

    <div :class="['modal', { active: showUploadModal }]">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Fájlok feltöltése</h3>
          <button class="close-modal" @click="showUploadModal = false">&times;</button>
        </div>

        <form @submit.prevent="uploadFiles">
          <div class="form-group">
            <label for="fileInput">Válassz fájlokat</label>
            <input 
              type="file" 
              id="fileInput" 
              @change="handleFileSelect" 
              class="form-control" 
              multiple
              accept="*/*"
            >
          </div>

          <div v-if="selectedFiles.length > 0" class="form-group">
            <label>Kiválasztott fájlok:</label>
            <div class="file-list">
              <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
                <i class="fas fa-file"></i>
                <span>{{ file.name }}</span>
                <small>({{ (file.size / 1024).toFixed(2) }} KB)</small>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-outline" @click="showUploadModal = false">Mégse</button>
            <button type="submit" class="btn btn-primary" :disabled="isUploading || selectedFiles.length === 0">
              <i v-if="!isUploading" class="fas fa-upload"></i>
              <i v-else class="fas fa-spinner fa-spin"></i>
              {{ isUploading ? 'Feltöltés...' : 'Feltöltés' }}
            </button>
          </div>

          <div v-if="uploadedFiles.length > 0" class="form-group" style="margin-top: 1.5rem; border-top: 2px solid #e2e8f0; padding-top: 1rem;">
            <label style="color: #10b981; font-weight: 700;"><i class="fas fa-check-circle" style="margin-right: 0.5rem;"></i>Feltöltött fájlok:</label>
            <div class="file-list">
              <div v-for="file in uploadedFiles" :key="file.id || `uploaded-${file.name}`" class="file-item" style="border-left-color: #10b981;">
                <i class="fas fa-file-check" style="color: #10b981;"></i>
                <span>{{ file.name }}</span>
                <small style="color: #10b981;">({{ file.size }} KB)</small>
              </div>
            </div>
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
      showUploadModal: false,
      currentTaskId: null,
      selectedFiles: [],
      uploadedFiles: [],
      isUploading: false,
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
          name: 'Webfejlesztés Projekt',
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
              completed: false,
              uploadedFiles: []
            },
            {
              id: 2,
              title: 'API integráció',
              description: 'Backend API összekötése',
              assignee: 'Kata Varga',
              priority: 'high',
              deadline: '2026-01-20',
              completed: true,
              uploadedFiles: []
            },
            {
              id: 3,
              title: 'Stílus finomítása',
              description: 'CSS optimalizálás',
              assignee: 'Te',
              priority: 'medium',
              deadline: '2026-01-25',
              completed: false,
              uploadedFiles: []
            }
          ],
          activity: [
            { id: 1, user: 'Bence Kovács', action: 'befejezett egy feladatot', type: 'complete', timestamp: '2 órája' },
            { id: 2, user: 'Kata Varga', action: 'hozzáadott egy megjegyzést', type: 'comment', timestamp: '5 órája' },
            { id: 3, user: 'Te', action: 'törölte a Projekthoz', type: 'join', timestamp: '1 napja' },
            { id: 4, user: 'Bence Kovács', action: 'létrehozta a Projektot', type: 'create', timestamp: '3 napja' }
          ]
        },
        {
          id: 2,
          name: 'Adatbázis Projekt',
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
              completed: false,
              uploadedFiles: []
            },
            {
              id: 5,
              title: 'SQL lekérdezések írása',
              description: 'CRUD operációk',
              assignee: 'Anna Molnár',
              priority: 'medium',
              deadline: '2026-01-22',
              completed: false,
              uploadedFiles: []
            }
          ],
          activity: [
            { id: 5, user: 'Dani Soós', action: 'frissítette az adatbázis sémát', type: 'update', timestamp: '3 órája' },
            { id: 6, user: 'Anna Molnár', action: 'megjegyzést adott hozzá', type: 'comment', timestamp: '1 napja' }
          ]
        },
        {
          id: 3,
          name: 'Dizájn Projekt',
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
              completed: true,
              uploadedFiles: []
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
      if (this.selectedTeam) {
        return this.selectedTeam.members.length;
      }
      return this.teams.reduce((sum, team) => sum + team.members.length, 0);
    },
    totalTasks() {
      if (this.selectedTeam) {
        return this.selectedTeam.tasks.length;
      }
      return this.teams.reduce((sum, team) => sum + team.tasks.length, 0);
    },
    completedTasks() {
      if (this.selectedTeam) {
        return this.selectedTeam.tasks.filter(t => !t || t.completed === true).length;
      }
      return this.teams.reduce((sum, team) => 
        sum + team.tasks.filter(t => t && t.completed === true).length, 0
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
    },
    teamUploadedFiles() {
      if (!this.selectedTeam) return [];
      const allFiles = [];
      this.selectedTeam.tasks.forEach(task => {
        if (task.uploadedFiles && Array.isArray(task.uploadedFiles)) {
          task.uploadedFiles.forEach(file => {
            allFiles.push({
              ...file,
              taskName: task.title
            });
          });
        }
      });
      return allFiles;
    }
  },
  methods: {
    selectTeam(teamId) {
      this.selectedTeam = this.teams.find(t => t.id === teamId);
      this.activeTab = 'members';
      if (this.selectedTeam) {
        this.loadTeamActivity();
        this.loadTeamTasks();
      }
    },
    openCreateTeamModal() {
      this.editingTeam = null;
      this.formData = { teamName: '', teamDesc: '', teamIcon: 'fas fa-code' };
      this.showTeamModal = true;
      },
    openDownloadFileModal(taskId) {
        this.currentTaskId = taskId;
        this.selectedFiles = [];
        this.uploadedFiles = [];
        
        if (this.selectedTeam) {
          const currentTask = this.selectedTeam.tasks.find(t => t.id === taskId);
          if (currentTask && currentTask.uploadedFiles) {
            this.uploadedFiles = [...currentTask.uploadedFiles];
          }
        }
        
        this.showUploadModal = true;
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
    async saveTeam() {
      try {
        if (!this.formData.teamName) {
          alert('Projekt neve kötelező!');
          return;
        }

        const token = localStorage.getItem('accessToken');
        if (!token) {
          alert('Authentikációs token nem található');
          return;
        }

        const projectData = {
          projekt_nev: this.formData.teamName,
          leiras: this.formData.teamDesc || ''
        };

        console.log('Küldendő adatok:', projectData);

        const response = await fetch('http://localhost:3000/api/project/ujProjekt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(projectData)
        });

        const data = await response.json();
        console.log('Szerver válasz:', data);

        if (!response.ok) {
          const errorMsg = data.message || data.errors?.[0]?.msg || 'Ismeretlen hiba';
          throw new Error(errorMsg);
        }

        if (data.success && data.data.project) {
          const newTeam = {
            id: data.data.project.id,
            name: data.data.project.projekt_nev,
            description: data.data.project.leiras,
            icon: this.formData.teamIcon,
            members: [],
            tasks: [],
            activity: []
          };
          this.teams.push(newTeam);
          this.saveTeamIconsToLocalStorage();
          this.showTeamModal = false;
          this.formData = { teamName: '', teamDesc: '', teamIcon: 'fas fa-code' };
          alert('Projekt sikeresen létrehozva!');
        } else {
          throw new Error(data.message || 'Ismeretlen hiba a szerveren');
        }
      } catch (error) {
        console.error('Hiba a Projekt mentésekor:', error);
        alert('Hiba a Projekt mentésekor: ' + error.message);
      }
    },
    async deleteTeam(teamId) {
      if (!confirm('Biztosan törlöd ezt a Projektot? Ez az összes adatát is törölni fogja (feladatok, fájlok, stb.)!')) {
        return;
      }

      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          alert('Authentikációs token nem található');
          return;
        }

        console.log('Projekt törlésének kezdete:', teamId);

        const response = await fetch(`http://localhost:3000/api/project/projekt/${teamId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Törlés válasz status:', response.status);

        if (!response.ok) {
          const data = await response.json();
          console.error('Törlés hiba válasz:', data);
          alert('Hiba a projekt törléskor: ' + (data.message || 'Ismeretlen hiba'));
          return;
        }

        const data = await response.json();
        console.log('Törlés válasz adatok:', data);

        if (data.success) {
          const teamToDelete = this.teams.find(t => t.id === teamId);
          const teamName = teamToDelete?.name || 'Ismeretlen projekt';
          
          // Törlés a teams listáról
          this.teams = this.teams.filter(t => t.id !== teamId);

          // Ha az aktuálisan kiválasztott team volt, nullázzuk
          if (this.selectedTeam?.id === teamId) {
            this.selectedTeam = null;
          }

          // Activity log
          await this.createActivityLog(
            'törölve',
            `"${teamName}" projekt sikeresen törölve`,
            null
          );
          
          alert('Projekt sikeresen törölve!');
        } else {
          alert('Hiba: ' + (data.message || 'Ismeretlen hiba'));
        }
      } catch (error) {
        console.error('Hiba a projekt törléskor:', error);
        alert('Hiba a projekt törléskor: ' + error.message);
      }
    },
    openAddMemberModal() {
      this.formData.selectedMember = '';
      this.formData.memberRole = 'Tag';
      this.showMemberModal = true;
    },
    async addMember() {
      try {
        if (!this.selectedTeam || !this.formData.selectedMember) {
          alert('Projekt és tag kiválasztása kötelező');
          return;
        }

        const selectedUser = this.availableUsers.find(
          user => user.teljes_nev === this.formData.selectedMember
        );

        if (!selectedUser || !selectedUser.id) {
          alert('Kiválasztott felhasználó nem található');
          return;
        }

        const token = localStorage.getItem('accessToken');
        if (!token) {
          alert('Authentikációs token nem található');
          return;
        }

        const memberData = {
          projekt_id: this.selectedTeam.id,
          felhasznalo_id: selectedUser.id
        };

        console.log('Küldendő tag adatok:', memberData);

        const response = await fetch('http://localhost:3000/api/project/ujProjektTag', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(memberData)
        });

        const data = await response.json();
        console.log('Szerver válasz tagra:', data);

        if (!response.ok) {
          const errorMsg = data.message || data.errors?.[0]?.msg || 'Ismeretlen hiba';
          throw new Error(errorMsg);
        }

        if (data.success) {
          const newMember = {
            id: selectedUser.id,
            name: selectedUser.teljes_nev,
            initials: this.generateInitials(selectedUser.teljes_nev),
            role: this.getRoleLabel(selectedUser.szerep_tipus),
            status: 'Aktív'
          };
          this.selectedTeam.members.push(newMember);
          this.showMemberModal = false;
          this.formData.selectedMember = '';
          this.formData.memberRole = 'Tag';
          
          await this.fetchTeamsAndTasks();
          
          alert('Tag sikeresen hozzáadva!');
        } else {
          throw new Error(data.message || 'Ismeretlen hiba a szerveren');
        }
      } catch (error) {
        console.error('Hiba a tag hozzáadásakor:', error);
        alert('Hiba a tag hozzáadásakor: ' + error.message);
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
    async saveTask() {
      try {
        if (!this.selectedTeam || !this.formData.taskTitle || !this.formData.taskAssignee) {
          alert('Feladat neve, hozzárendelés és határidő kötelezőek');
          return;
        }

        const token = localStorage.getItem('accessToken');
        if (!token) {
          alert('Authentikációs token nem található');
          return;
        }

        const selectedUser = this.availableDiakUsers.find(
          user => (user.teljes_nev || user.felhasznalonev) === this.formData.taskAssignee
        );

        if (!selectedUser || !selectedUser.id) {
          alert('Nem sikerült megtalálni a felhasználót');
          return;
        }

        const priorityMap = {
          'low': 'alacsony',
          'medium': 'közepes',
          'high': 'magas'
        };

        const taskData = {
          feladat_nev: this.formData.taskTitle,
          feladat_leiras: this.formData.taskDesc || '',
          felelos_id: selectedUser.id,
          prioritas: priorityMap[this.formData.taskPriority] || 'közepes',
          statusz: 'folyamatban',
          hatarido: this.formData.taskDeadline,
          projekt_id: this.selectedTeam.id
        };

        console.log('Küldendő feladat adatok:', taskData);

        const response = await fetch('http://localhost:3000/api/project/ujFeladat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(taskData)
        });

        const data = await response.json();
        console.log('Szerver válasz feladatra:', data);

        if (!response.ok) {
          const errorMsg = data.message || data.errors?.[0]?.msg || 'Ismeretlen hiba';
          throw new Error(errorMsg);
        }

        if (data.success && data.data.task) {
          const newTask = {
            id: data.data.task.id,
            title: data.data.task.feladat_nev,
            description: data.data.task.feladat_leiras,
            assignee: this.formData.taskAssignee,
            priority: this.formData.taskPriority,
            deadline: data.data.task.hatarido,
            completed: data.data.task.statusz === 'elvégezve',
            uploadedFiles: []
          };
          this.selectedTeam.tasks.push(newTask);
          
          await this.createActivityLog(
            'létrehozva',
            `"${newTask.title}" feladat létrehozva`,
            newTask.id
          );
          
          this.showTaskModal = false;
          this.formData = {
            taskTitle: '',
            taskDesc: '',
            taskAssignee: '',
            taskPriority: 'medium',
            taskDeadline: ''
          };
          alert('Feladat sikeresen létrehozva!');
        } else {
          throw new Error(data.message || 'Ismeretlen hiba a szerveren');
        }
      } catch (error) {
        console.error('Hiba a feladat mentésekor:', error);
        alert('Hiba a feladat mentésekor: ' + error.message);
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
    async deleteTask(taskId) {
      if (!confirm('Biztosan törlöd ezt a feladatot?')) {
        return;
      }

      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          alert('Authentikációs token nem található');
          return;
        }

        console.log('Feladat törlésének kezdete:', taskId);

        const response = await fetch(`http://localhost:3000/api/project/feladat/${taskId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Törlés válasz status:', response.status);

        if (!response.ok) {
          const data = await response.json();
          console.error('Törlés hiba válasz:', data);
          alert('Hiba a feladat törléskor: ' + (data.message || 'Ismeretlen hiba'));
          return;
        }

        const data = await response.json();
        console.log('Törlés válasz adatok:', data);

        if (data.success) {
          const taskToDelete = this.selectedTeam?.tasks?.find(t => t.id === taskId);
          const taskTitle = taskToDelete?.title || 'Ismeretlen feladat';
          
          // Törlés az aktuálisan kiválasztott teamből
          if (this.selectedTeam && this.selectedTeam.tasks) {
            this.selectedTeam.tasks = this.selectedTeam.tasks.filter(t => t.id !== taskId);
          }

          // Törlés az összes teamből a listában (szinkronizálás)
          if (this.teams && Array.isArray(this.teams)) {
            this.teams.forEach(team => {
              if (team.tasks && Array.isArray(team.tasks)) {
                team.tasks = team.tasks.filter(t => t.id !== taskId);
              }
            });
          }
          
          // Activity log
          await this.createActivityLog(
            'törölve',
            `"${taskTitle}" feladat sikeresen törölve`,
            null
          );
          
          alert('Feladat sikeresen törölve!');
        } else {
          alert('Hiba: ' + (data.message || 'Ismeretlen hiba'));
        }
      } catch (error) {
        console.error('Hiba a feladat törléskor:', error);
        alert('Hiba a feladat törléskor: ' + error.message);
      }
    },
    async toggleTaskComplete(taskId) {
      if (!this.selectedTeam) return;

      const task = this.selectedTeam.tasks.find(t => t.id === taskId);
      if (!task) return;

      const confirmed = confirm('Biztos befejezed a feladatot?');
      if (!confirmed) return;

      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          alert('Authentikációs token nem található');
          return;
        }

        await this.createActivityLog(
          'befejezve',
          `"${task.title}" feladat sikeresen befejezve`,
          taskId
        );

        this.selectedTeam.tasks = this.selectedTeam.tasks.filter(t => t.id !== taskId);
        alert('Feladat sikeresen befejezve!');
      } catch (error) {
        console.error('Hiba a feladat befejezésekor:', error);
        alert('Hiba a feladat befejezésekor: ' + error.message);
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
        console.error('Projekt felhasználóinak lekérése sikertelen:', error);
      }
    },
    async loadTeamActivity() {
      try {
        if (!this.selectedTeam) return;

        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const response = await fetch(`http://localhost:3000/api/project/naplo?projekt_id=${this.selectedTeam.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) return;

        const data = await response.json();
        
        if (data.success && Array.isArray(data.data.logs)) {
          this.selectedTeam.activity = data.data.logs.map((log, index) => {
            const userName = log.teljes_nev || log.felhasznalonev || 'Ismeretlen felhasználó';
            
            return {
              id: log.id || `activity-${Date.now()}-${index}`,
              user: userName,
              action: log.leiras || log.muvelet,
              type: log.muvelet.includes('befejezve') ? 'complete' : 'update',
              timestamp: new Date(log.idopont).toLocaleString('hu-HU')
            };
          });
        }
      } catch (error) {
        console.error('Aktivitás betöltésének hiba:', error);
      }
    },
    async loadTeamTasks() {
      try {
        if (!this.selectedTeam) return;

        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const response = await fetch(`http://localhost:3000/api/project/feladatok?projekt_id=${this.selectedTeam.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) return;

        const data = await response.json();
        
        if (data.success && Array.isArray(data.data.tasks)) {

          data.data.tasks.forEach(dbTask => {
            const localTask = this.selectedTeam.tasks.find(t => t.id === dbTask.id);
            if (localTask) {
              localTask.completed = dbTask.statusz === 'elvégezve';
            }
          });
        }
      } catch (error) {
        console.error('Feladatok betöltésének hiba:', error);
      }
    },
    async createActivityLog(muvelet, leiras, feladat_id = null) {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token || !this.selectedTeam) return;

        const response = await fetch('http://localhost:3000/api/project/ujNaplo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            projekt_id: this.selectedTeam.id,
            feladat_id: feladat_id,
            muvelet: muvelet,
            leiras: leiras
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.log) {
            await this.loadTeamActivity();
          }
        }
      } catch (error) {
        console.error('Hiba az aktivitás naplóban történő rögzítéskor:', error);
      }
    },
    async loadTeamFiles() {
      try {
        if (!this.selectedTeam) return;

        const token = localStorage.getItem('accessToken');
        if (!token) return;

        for (let task of this.selectedTeam.tasks) {
          try {
            const response = await fetch(`http://localhost:3000/api/files/feladat/${task.id}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              }
            });

            if (!response.ok) continue;

            const data = await response.json();
            
            if (data.success && Array.isArray(data.data.files)) {
              const filesWithSize = data.data.files.map(file => ({
                id: file.id,
                name: file.file_nev,
                size: file.file_merete ? (file.file_merete / 1024).toFixed(2) : '0'
              }));
              task.uploadedFiles = filesWithSize;
            }
          } catch (error) {
            console.error(`Hiba a feladat (${task.id}) fájljainak lekérdezésénél:`, error);
          }
        }
      } catch (error) {
        console.error('Csapat fájljainak betöltésének hiba:', error);
      }
    },
    handleFileSelect(event) {
      const files = Array.from(event.target.files);
      this.selectedFiles = files;
    },
    async uploadFiles() {
      if (!this.currentTaskId || this.selectedFiles.length === 0) {
        alert('Válassz legalább egy fájlt!');
        return;
      }

      try {
        this.isUploading = true;
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          alert('Authentikációs token nem található');
          return;
        }

        const formData = new FormData();
        this.selectedFiles.forEach(file => {
          formData.append('files', file);
        });

        console.log('Feltöltés indítása:', {
          url: `http://localhost:3000/api/upload?feladat_id=${this.currentTaskId}`,
          currentTaskId: this.currentTaskId,
          filesCount: this.selectedFiles.length,
          token: token ? 'létezik' : 'nincs'
        });

        const response = await fetch(`http://localhost:3000/api/upload?feladat_id=${this.currentTaskId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        console.log('Szerver válasz status:', response.status, response.statusText);

        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error('JSON parse hiba:', parseError);
          data = { message: response.statusText || 'Szerver hiba' };
        }

        console.log('Szerver adatok:', data);

        if (!response.ok) {
          alert('Hiba a feltöltéskor: ' + (data.message || 'Ismeretlen hiba'));
          return;
        }

        if (data.status === 'success' && data.uploadedFiles && data.uploadedFiles.length > 0) {
          const filesWithData = data.uploadedFiles.map(apiFile => ({
            id: apiFile.id,
            name: apiFile.file_nev || apiFile.name,
            size: apiFile.file_merete ? (apiFile.file_merete / 1024).toFixed(2) : '0'
          }));
          this.uploadedFiles.push(...filesWithData);

          if (this.selectedTeam) {
            const currentTask = this.selectedTeam.tasks.find(t => t.id === this.currentTaskId);
            if (currentTask) {
              if (!currentTask.uploadedFiles) {
                currentTask.uploadedFiles = [];
              }
              currentTask.uploadedFiles.push(...filesWithData);
            }
          }

          alert(`${data.uploadedFiles.length} fájl sikeresen feltöltve!`);
          
          await this.createActivityLog(
            'feltöltés',
            `${data.uploadedFiles.length} fájlt feltöltött`,
            this.currentTaskId
          );
          
          setTimeout(() => {
            const input = document.getElementById('fileInput');
            if (input) {
              input.value = '';
            }
            this.selectedFiles = [];
          }, 500);
        } else {
          alert('Hiba: ' + (data.message || 'Ismeretlen hiba'));
        }
      } catch (error) {
        console.error('Feltöltési hiba:', error);
        alert('Hiba a fájl feltöltéskor: ' + error.message);
      } finally {
        this.isUploading = false;
      }
    },
    async deleteFile(fileId) {
      if (!confirm('Biztosan törlöd ezt a fájlt?')) {
        return;
      }

      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          alert('Authentikációs token nem található');
          return;
        }

        console.log('Fájl törlésének kezdete, ID:', fileId);

        const response = await fetch(`http://localhost:3000/api/files/${fileId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Törlés válasz status:', response.status);

        // Ellenőrizzük az ok státusz
        if (!response.ok) {
          const data = await response.json();
          console.error('Törlés hiba válasz:', data);
          alert('Hiba a fájl törléskor: ' + (data.message || 'Ismeretlen hiba'));
          return;
        }

        const data = await response.json();
        console.log('Törlés válasz adatok:', data);

        // Sikeres törlés
        if (data.success) {
          // Törlés az uploadedFiles listáról
          this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== fileId);

          // Törlés az összes feladat fájljairól az összes teamből
          if (this.selectedTeam && this.selectedTeam.tasks) {
            this.selectedTeam.tasks.forEach(task => {
              if (task.uploadedFiles && Array.isArray(task.uploadedFiles)) {
                task.uploadedFiles = task.uploadedFiles.filter(f => f.id !== fileId);
              }
            });
          }

          // Törlés az összes teamból (globális keresés)
          if (this.teams && Array.isArray(this.teams)) {
            this.teams.forEach(team => {
              if (team.tasks && Array.isArray(team.tasks)) {
                team.tasks.forEach(task => {
                  if (task.uploadedFiles && Array.isArray(task.uploadedFiles)) {
                    task.uploadedFiles = task.uploadedFiles.filter(f => f.id !== fileId);
                  }
                });
              }
            });
          }

          alert('Fájl sikeresen törölve!');

          await this.createActivityLog(
            'törlés',
            'Feltöltött fájlt törölt',
            this.currentTaskId
          );
        } else {
          alert('Hiba: ' + (data.message || 'Ismeretlen hiba'));
        }
      } catch (error) {
        console.error('Hiba a fájl törléskor:', error);
        alert('Hiba a fájl törléskor: ' + error.message);
      }
    },
    saveTeamIconsToLocalStorage() {
      const teamIcons = {};
      this.teams.forEach(team => {
        teamIcons[team.id] = team.icon;
      });
      localStorage.setItem('teamIcons', JSON.stringify(teamIcons));
    },
    loadTeamIconsFromLocalStorage() {
      const stored = localStorage.getItem('teamIcons');
      if (stored) {
        const teamIcons = JSON.parse(stored);
        this.teams.forEach(team => {
          if (teamIcons[team.id]) {
            team.icon = teamIcons[team.id];
          }
        });
      }
    },
    async fetchTeamsAndTasks() {
      try {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          console.warn('Nincs authentikációs token');
          return;
        }

        const projectsResponse = await fetch('http://localhost:3000/api/project/projektek', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });

        if (!projectsResponse.ok) {
          console.warn(`Projektok lekérésének hiba: ${projectsResponse.status}`);
          return;
        }

        const projectsData = await projectsResponse.json();
        console.log('Projektok adatai:', projectsData);

        let projects = [];
        if (projectsData.success && projectsData.data && Array.isArray(projectsData.data.projects)) {
          projects = projectsData.data.projects;
        } else if (projectsData.data && Array.isArray(projectsData.data.projects)) {
          projects = projectsData.data.projects;
        } else if (Array.isArray(projectsData.data)) {
          projects = projectsData.data;
        } else if (Array.isArray(projectsData)) {
          projects = projectsData;
        }

        const newTeams = projects.map(project => ({
          id: project.id,
          name: project.projekt_nev,
          description: project.leiras || '',
          icon: 'fas fa-code',
          members: [],
          tasks: [],
          activity: []
        }));

        this.teams = [...this.teams, ...newTeams];

        this.loadTeamIconsFromLocalStorage();

        for (let team of this.teams) {
          try {
            const tasksResponse = await fetch(`http://localhost:3000/api/project/feladat?projekt_id=${team.id}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              }
            });

            if (tasksResponse.ok) {
              const tasksData = await tasksResponse.json();
              console.log(`Feladatok Projekt ${team.id}:`, tasksData);

              let tasks = [];
              if (tasksData.success && Array.isArray(tasksData.data)) {
                tasks = tasksData.data;
              } else if (Array.isArray(tasksData.data)) {
                tasks = tasksData.data;
              } else if (Array.isArray(tasksData)) {
                tasks = tasksData;
              }

              const newTasks = tasks.map(task => ({
                id: task.id,
                title: task.feladat_nev,
                description: task.feladat_leiras || '',
                assignee: task.felelos_nev || 'Ismeretlen',
                priority: task.prioritas === 'magas' ? 'high' : task.prioritas === 'közepes' ? 'medium' : 'low',
                deadline: task.hatarido,
                completed: task.statusz === 'befejezve',
                uploadedFiles: []
              }));

              team.tasks = [...team.tasks, ...newTasks];
            }

            const membersResponse = await fetch(`http://localhost:3000/api/project/projektTagok?projekt_id=${team.id}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              }
            });

            if (membersResponse.ok) {
              const membersData = await membersResponse.json();
              console.log(`Tagok Projekt ${team.id}:`, membersData);

              let members = [];
              if (membersData.success && Array.isArray(membersData.data)) {
                members = membersData.data;
              } else if (Array.isArray(membersData.data)) {
                members = membersData.data;
              } else if (Array.isArray(membersData)) {
                members = membersData;
              }

              const newMembers = members.map(member => ({
                id: member.id,
                name: member.teljes_nev,
                initials: this.generateInitials(member.teljes_nev),
                role: this.getRoleLabel(member.szerep_tipus),
                status: 'Aktív'
              }));

              const existingIds = new Set(team.members.map(m => m.id));
              const uniqueNewMembers = newMembers.filter(m => !existingIds.has(m.id));
              team.members = [...team.members, ...uniqueNewMembers];
            }
          } catch (error) {
            console.error(`Hiba a feladatok/tagok lekérésénél Projekt ${team.id}:`, error);
          }
        }

        console.log('Teljes Projektok és feladatok:', this.teams);
      } catch (error) {
        console.error('Projektok és feladatok lekérésének hiba:', error);
      }
    },
  },
  setup() {
    const router = useRouter();
    const logout = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        
        if (token) {
          await fetch('http://localhost:3000/api/auth/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              elerheto: false
            })
          });
        }
      } catch (error) {
        console.error('Kijelentkezés hiba:', error);
      }
      
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('sm_settings');
      localStorage.removeItem('sm_appearance');
      
      router.push('/home');
    };
    return { router, logout };
  },
  mounted() {
    this.loadTeamIconsFromLocalStorage();
    this.fetchUserProfile();
    this.fetchTeamUsers();
    this.fetchTeamsAndTasks();
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
  max-height: 320px;
  overflow-y: auto;
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

.uploaded-files-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 280px;
  overflow-y: auto;
}

.uploaded-file-item {
  background-color: #f8fafc;
  border-radius: 10px;
  padding: 0.75rem;
  border-left: 4px solid #10b981;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.file-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  font-size: 1.2rem;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-info h4 {
  font-size: 0.9rem;
  color: #1e293b;
  margin: 0;
  margin-bottom: 0.2rem;
  word-break: break-word;
}

.file-task {
  font-size: 0.8rem;
  color: #64748b;
  display: block;
}

.file-size {
  font-size: 0.8rem;
  color: #64748b;
  flex-shrink: 0;
}

.no-files {
  text-align: center;
  padding: 2rem 1rem;
  color: #94a3b8;
}

.no-files i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
  color: #cbd5e1;
}

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

.file-list {
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 0.8rem;
  max-height: 300px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: white;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  border-left: 3px solid #3b82f6;
  font-size: 0.9rem;
}

.file-item:last-child {
  margin-bottom: 0;
}

.file-item i {
  color: #3b82f6;
}

.file-item small {
  color: #64748b;
  margin-left: auto;
  font-size: 0.8rem;
}
</style>