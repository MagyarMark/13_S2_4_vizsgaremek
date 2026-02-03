<template>
    <div class="dashboard-wrapper">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

    <aside class="sidebar" :class="{ open: showSidebar }">
        <div class="logo">
            <h2>Smart<span>Manager</span></h2>
            <p>Tanári Portál</p>
        </div>
        <ul class="nav-links">
            <li><a href="#" class="active"><i class="fas fa-home"></i> Áttekintés</a></li>
            <router-link to="/Ttask"><li><i class="fas fa-tasks"></i> Feladatok</li></router-link>
            <router-link to="/ertekeles"><li><i class="fas fa-check-circle"></i> Értékelés</li></router-link>
            <router-link to="/chat"><li><i class="fas fa-comments"></i> Üzenetek</li></router-link>
            <router-link to="/settings"><li><i class="fas fa-cog"></i> Beállítások</li></router-link>
        </ul>
    </aside>


    <header>
        <div class="header-left">
            <button class="hamburger" @click="showSidebar = !showSidebar" aria-label="Toggle menu">
                <i class="fas fa-bars"></i>
            </button>
            <h1>Tanári Dashboard</h1>
        </div>
        <div class="header-right">
          <div class="notifications">
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

    <main>
        <div class="page-title">
            <h2>Áttekintés</h2>
        </div>

        <div class="stats-cards">
            <div class="stat-card">
                <div class="stat-icon bg-primary">
                    <i class="fas fa-tasks"></i>
                </div>
                <div class="stat-info">
              <h3>{{ stats.activeTasks }}</h3>
                    <p>Aktív feladatok</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon bg-success">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-info">
              <h3>{{ stats.totalSubmissions }}</h3>
                    <p>Beadott feladat</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon bg-warning">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="stat-info">
              <h3>{{ stats.lateSubmissions }}</h3>
                    <p>Késések</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon bg-danger">
                    <i class="fas fa-times-circle"></i>
                </div>
                <div class="stat-info">
              <h3>{{ stats.missingSubmissions }}</h3>
                    <p>Hiányzó beadás</p>
                </div>
            </div>
        </div>

        <section class="section">
            <div class="section-header">
                <h3><i class="fas fa-history"></i> Legutóbb beadott feladatok</h3>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Diák</th>
                            <th>Feladat</th>
                            <th>Leadva</th>
                            <th>Határidő</th>
                            <th>Státusz</th>
                        </tr>
                    </thead>
                    <tbody>
                      <tr v-if="recentSubmissions.length === 0">
                        <td colspan="5">Nincs megjeleníthető beadás.</td>
                      </tr>
                      <tr v-for="submission in recentSubmissions" :key="submission.id">
                        <td>{{ submission.studentName }}</td>
                        <td>{{ submission.taskName }}</td>
                        <td>{{ formatDateTime(submission.submittedAt) }}</td>
                        <td>{{ formatDate(submission.deadline) }}</td>
                        <td><span :class="['status-badge', submission.statusClass]">{{ submission.statusLabel }}</span></td>
                      </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <section class="section">
            <div class="section-header">
                <h3><i class="fas fa-clipboard-list"></i> Aktív feladatok</h3>
                <router-link to="/Ttask">Összes megtekintése</router-link>
            </div>
            <div class="assignments-grid">
              <div v-if="activeTasks.length === 0">Nincs aktív feladat.</div>
              <div class="assignment-card" v-for="task in activeTasks" :key="task.id" :class="{ warning: task.statusz === 'késett' }">
                <div class="assignment-header">
                  <div class="assignment-title">{{ task.feladat_nev }}</div>
                  <div class="assignment-date">Határidő: {{ formatDate(task.hatarido) }}</div>
                </div>
                <div class="assignment-stats">
                  <div class="stat">
                    <div class="stat-value">{{ task.submittedCount }}</div>
                    <div class="stat-label">Beadva</div>
                  </div>
                  <div class="stat">
                    <div class="stat-value">{{ task.lateCount }}</div>
                    <div class="stat-label">Késés</div>
                  </div>
                  <div class="stat">
                    <div class="stat-value">{{ task.gradedCount }}</div>
                    <div class="stat-label">Értékelve</div>
                  </div>
                </div>
              </div>
            </div>
        </section>

              <section class="section">
        <div class="section-header">
          <h3><i class="fas fa-chart-line"></i> Projekt statisztika</h3>
          <div>
            <select id="statPeriod">
              <option>Utolsó 30 nap</option>
              <option>Utolsó 3 hónap</option>
              <option>Utolsó 1 év</option>
            </select>
          </div>
        </div>
        <div class="charts-container">
          <div class="chart-card">
            <canvas ref="performanceChart"></canvas>
          </div>
          <div class="chart-card">
            <canvas ref="submissionChart"></canvas>
          </div>
        </div>
      </section>

        <section class="section">
            <div class="section-header">
                <h3><i class="fas fa-project-diagram"></i> Projektek áttekintése</h3>
                <router-link to="/Ttask">Összes megtekintése</router-link>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Projekt neve</th>
                            <th style="text-align: center;">Státusz</th>
                            <th style="text-align: center;">Tagok száma</th>
                            <th style="text-align: center;">Feladatok</th>
                        </tr>
                    </thead>
                    <tbody>
                      <tr v-if="projectsOverview.length === 0">
                        <td colspan="4" style="text-align: center;">Nincs projekt.</td>
                      </tr>
                      <tr v-for="project in projectsOverview" :key="project.id">
                        <td>{{ project.projekt_nev }}</td>
                        <td style="text-align: center;"><span :class="['status-badge', getProjectStatusClass(project.statusz)]">{{ formatProjectStatus(project.statusz) }}</span></td>
                        <td style="text-align: center;">{{ project.memberCount }}</td>
                        <td style="text-align: center;">{{ project.taskCount }}</td>
                      </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </main>

    <div class="modal" :class="{ active: showModal }">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Új feladat létrehozása</h3>
          <button class="modal-close" @click="showModal = false">&times;</button>
        </div>
        <form @submit.prevent="submitAssignment">
          <div class="form-group">
            <label for="assignmentTitle">Feladat címe</label>
            <input type="text" id="assignmentTitle" v-model="assignment.title" required />
          </div>
          <div class="form-group">
            <label for="assignmentDescription">Leírás</label>
            <textarea id="assignmentDescription" v-model="assignment.description" required></textarea>
          </div>
          <div class="form-group">
            <label for="assignmentDeadline">Határidő</label>
            <input type="date" id="assignmentDeadline" v-model="assignment.deadline" required />
          </div>
          <div class="form-group">
            <label for="assignmentClass">Projekt</label>
            <select id="assignmentClass" v-model="assignment.projectId" required>
              <option value="">Válassz projektet</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.projekt_nev }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="assignmentPoints">Maximális pontszám</label>
            <input type="number" id="assignmentPoints" v-model="assignment.points" min="1" value="100" />
          </div>
          <button type="submit" class="btn btn-primary">Feladat kiadása</button>
        </form>
      </div>
    </div>
</div>
</template>

<script>
import { onMounted, ref } from "vue";
import { useRouter } from 'vue-router';
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export default {
  name: "Tanar",
  setup() {
    const showModal = ref(false);
    const showSidebar = ref(false);
    const performanceChart = ref(null);
    const submissionChart = ref(null);
    const performanceChartInstance = ref(null);
    const submissionChartInstance = ref(null);
    const userProfile = ref({
      teljes_nev: '',
      felhasznalonev: '',
      szerep_tipus: 'tanar',
      initials: ''
    });

    const stats = ref({
      activeTasks: 0,
      totalSubmissions: 0,
      lateSubmissions: 0,
      missingSubmissions: 0
    });

    const recentSubmissions = ref([]);
    const activeTasks = ref([]);
    const ranking = ref([]);
    const projects = ref([]);
    const projectsOverview = ref([]);
    const statistics = ref([]);

    const assignment = ref({
      title: "",
      description: "",
      deadline: "",
      projectId: "",
      points: 100
    });

    const submitAssignment = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          alert('Nincs bejelentkezett felhasználó');
          return;
        }

        if (!assignment.value.projectId) {
          alert('Válassz projektet!');
          return;
        }

        const response = await fetch('http://localhost:3000/api/project/ujFeladat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            projekt_id: Number(assignment.value.projectId),
            feladat_nev: assignment.value.title,
            feladat_leiras: assignment.value.description,
            felelos_id: userProfile.value.id,
            prioritas: 'közepes',
            statusz: 'folyamatban',
            hatarido: assignment.value.deadline
          })
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Feladat létrehozása sikertelen');
        }

        await fetchDashboardData();
        showModal.value = false;
        assignment.value = {
          title: "",
          description: "",
          deadline: "",
          projectId: "",
          points: 100
        };
        alert('Feladat sikeresen kiadva!');
      } catch (error) {
        console.error('Feladat létrehozási hiba:', error);
        alert('Hiba a feladat létrehozásakor!');
      }
    };

    const getRoleLabel = (role) => {
      const roleMap = {
        'diak': 'Diák',
        'tanar': 'Tanár',
        'admin': 'Adminisztrátor'
      };
      return roleMap[role] || role;
    };

    const generateInitials = (name) => {
      if (!name) return '';
      const parts = name.split(' ');
      return parts.map(part => part.charAt(0).toUpperCase()).join('').substring(0, 2);
    };

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
        }
      } catch (error) {
        console.error('Felhasználó adatainak lekérése sikertelen:', error);
      }
    };

    const router = useRouter();

    const formatDate = (dateStr) => {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      if (Number.isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('hu-HU');
    };

    const formatDateTime = (dateStr) => {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      if (Number.isNaN(date.getTime())) return dateStr;
      return date.toLocaleString('hu-HU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const buildSubmissionStatus = (status, score) => {
      if (status === 'ertekelt') {
        return {
          label: score !== null && score !== undefined ? `Értékelve (${score}%)` : 'Értékelve',
          className: 'status-graded',
          actionLabel: 'Megtekintés',
          actionClass: 'btn-success'
        };
      }
      if (status === 'beadva') {
        return {
          label: 'Beadva',
          className: 'status-submitted',
          actionLabel: 'Értékelés',
          actionClass: 'btn-primary'
        };
      }
      if (status === 'javitasra_visszaadva') {
        return {
          label: 'Javításra visszaadva',
          className: 'status-late',
          actionLabel: 'Értékelés',
          actionClass: 'btn-warning'
        };
      }
      return {
        label: 'Ismeretlen',
        className: 'status-missing',
        actionLabel: 'Megtekintés',
        actionClass: 'btn'
      };
    };

    const formatProjectStatus = (status) => {
      const statusMap = {
        'aktiv': 'Aktív',
        'inaktiv': 'Inaktív',
        'befejezett': 'Befejezett'
      };
      return statusMap[status] || status;
    };

    const getProjectStatusClass = (status) => {
      if (status === 'aktiv') return 'status-submitted';
      if (status === 'befejezett') return 'status-graded';
      if (status === 'inaktiv') return 'status-late';
      return 'status-missing';
    };

    const buildCharts = (submissions, projectList, tasksMap) => {
      const statsByProject = new Map();
      const statusCounts = {};

      submissions.forEach(submission => {
        const task = tasksMap.get(submission.feladat_id);
        if (task) {
          const projectId = task.projekt_id;
          if (!statsByProject.has(projectId)) {
            statsByProject.set(projectId, []);
          }
          if (submission.pontszam !== null && submission.pontszam !== undefined) {
            statsByProject.get(projectId).push(Number(submission.pontszam));
          }
        }

        const statusKey = submission.statusz || 'Ismeretlen';
        statusCounts[statusKey] = (statusCounts[statusKey] || 0) + 1;
      });

      const labels = projectList.length
        ? projectList.map(project => project.projekt_nev)
        : Array.from(statsByProject.keys()).map(id => {
            const project = projectList.find(p => p.id === id);
            return project ? project.projekt_nev : `Projekt #${id}`;
          });

      const averages = projectList.length
        ? projectList.map(project => {
            const values = statsByProject.get(project.id) || [];
            if (values.length === 0) return 0;
            return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
          })
        : Array.from(statsByProject.values()).map(values => {
            if (!values.length) return 0;
            return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
          });

      const statusLabels = Object.keys(statusCounts);
      const statusValues = Object.values(statusCounts);

      if (performanceChartInstance.value) {
        performanceChartInstance.value.destroy();
      }
      if (submissionChartInstance.value) {
        submissionChartInstance.value.destroy();
      }

      if (performanceChart.value) {
        performanceChartInstance.value = new Chart(performanceChart.value.getContext("2d"), {
          type: "bar",
          data: {
            labels: labels.length ? labels : ['Nincs adat'],
            datasets: [
              {
                label: "Átlagos pontszám",
                data: labels.length ? averages : [0],
                backgroundColor: "#4361ee",
                borderColor: "#3f37c9",
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: "Projekt átlagok" },
            },
            scales: { y: { beginAtZero: true, max: 100 } },
          },
        });
      }

      if (submissionChart.value) {
        submissionChartInstance.value = new Chart(submissionChart.value.getContext("2d"), {
          type: "doughnut",
          data: {
            labels: statusLabels.length ? statusLabels : ['Nincs adat'],
            datasets: [
              {
                data: statusLabels.length ? statusValues : [1],
                backgroundColor: statusLabels.length
                  ? ["#4cc9f0", "#f72585", "#e63946", "#fca311", "#2a9d8f"]
                  : ["#e9ecef"],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: "bottom" },
              title: { display: true, text: "Beadás státusz" },
            },
          },
        });
      }
    };

    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          return;
        }

        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        };

        const [projectsRes, tasksRes, submissionsRes, statsRes] = await Promise.all([
          fetch('http://localhost:3000/api/project/projektek', { headers }),
          fetch('http://localhost:3000/api/project/feladatok', { headers }),
          fetch('http://localhost:3000/api/files/beadas', { headers }),
          fetch('http://localhost:3000/api/project/statisztika', { headers })
        ]);

        const [projectsData, tasksData, submissionsData, statsData] = await Promise.all([
          projectsRes.json(),
          tasksRes.json(),
          submissionsRes.json(),
          statsRes.json()
        ]);

        projects.value = projectsData?.data?.projects || [];
        const tasks = tasksData?.data?.tasks || [];
        const submissions = submissionsData?.data?.beadasList || [];
        statistics.value = statsData?.data?.statistics || [];

        console.log('Projects:', projects.value);
        console.log('Statistics:', statistics.value);
        console.log('Submissions:', submissions);

        const tasksMap = new Map(tasks.map(task => [task.id, task]));
        const submissionsByTask = submissions.reduce((acc, submission) => {
          if (!acc[submission.feladat_id]) {
            acc[submission.feladat_id] = [];
          }
          acc[submission.feladat_id].push(submission);
          return acc;
        }, {});

        const tasksWithCounts = tasks.map(task => {
          const taskSubmissions = submissionsByTask[task.id] || [];
          return {
            ...task,
            submittedCount: taskSubmissions.length,
            gradedCount: taskSubmissions.filter(item => item.statusz === 'ertekelt').length,
            lateCount: taskSubmissions.filter(item => item.statusz === 'javitasra_visszaadva').length
          };
        });

        activeTasks.value = tasksWithCounts
          .filter(task => task.statusz !== 'befejezett')
          .sort((a, b) => new Date(a.hatarido || 0) - new Date(b.hatarido || 0));

        stats.value = {
          activeTasks: tasks.filter(task => task.statusz === 'folyamatban').length,
          totalSubmissions: submissions.length,
          lateSubmissions: submissions.filter(item => item.statusz === 'javitasra_visszaadva').length,
          missingSubmissions: tasks.filter(task => (submissionsByTask[task.id] || []).length === 0).length
        };

        recentSubmissions.value = submissions
          .map(submission => {
            const task = tasksMap.get(submission.feladat_id);
            const presentation = buildSubmissionStatus(submission.statusz, submission.pontszam);
            return {
              id: submission.id,
              studentName: submission.student_name || 'Ismeretlen',
              taskName: submission.task_name || task?.feladat_nev || 'Ismeretlen',
              submittedAt: submission.bekuldes_idopont,
              deadline: task?.hatarido || null,
              statusLabel: presentation.label,
              statusClass: presentation.className,
              actionLabel: presentation.actionLabel,
              actionClass: presentation.actionClass
            };
          })
          .sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0))
          .slice(0, 6);

        const studentGroups = submissions.reduce((acc, submission) => {
          if (!acc[submission.felhasznalo_id]) {
            acc[submission.felhasznalo_id] = [];
          }
          acc[submission.felhasznalo_id].push(submission);
          return acc;
        }, {});

        ranking.value = Object.entries(studentGroups)
          .map(([studentId, studentSubmissions]) => {
            const scored = studentSubmissions.filter(item => item.pontszam !== null && item.pontszam !== undefined);
            const averageScore = scored.length
              ? Math.round(scored.reduce((sum, item) => sum + Number(item.pontszam), 0) / scored.length)
              : 0;
            const latestEvaluated = studentSubmissions
              .filter(item => item.ertekeles_idopont)
              .sort((a, b) => new Date(b.ertekeles_idopont) - new Date(a.ertekeles_idopont))[0];

            return {
              studentId,
              studentName: studentSubmissions[0]?.student_name || 'Ismeretlen',
              averageScore,
              latestScoreLabel: latestEvaluated
                ? `${latestEvaluated.task_name || 'Feladat'} - ${latestEvaluated.pontszam ?? '-'}%`
                : 'Nincs értékelés'
            };
          })
          .sort((a, b) => b.averageScore - a.averageScore)
          .slice(0, 6);

        const tasksByProject = tasks.reduce((acc, task) => {
          if (!acc[task.projekt_id]) {
            acc[task.projekt_id] = [];
          }
          acc[task.projekt_id].push(task);
          return acc;
        }, {});

        projectsOverview.value = projects.value.map(project => ({
          id: project.id,
          projekt_nev: project.projekt_nev,
          statusz: project.statusz,
          memberCount: 0,
          taskCount: tasksByProject[project.id]?.length || 0
        }));

        buildCharts(submissions, projects.value, tasksMap);
      } catch (error) {
        console.error('Dashboard adatok lekérése sikertelen:', error);
      }
    };

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

    onMounted(() => {
      fetchUserProfile();
      fetchDashboardData();
    });

    return {
      showModal,
      showSidebar,
      performanceChart,
      submissionChart,
      assignment,
      userProfile,
      stats,
      recentSubmissions,
      activeTasks,
      ranking,
      projectsOverview,
      projects,
      submitAssignment,
      getRoleLabel,
      fetchUserProfile,
      generateInitials,
      logout,
      formatDate,
      formatDateTime,
      formatProjectStatus,
      getProjectStatusClass
    };
  },
};
</script>

<style scoped>
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

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            background-color: #f5f7fb;
            color: var(--text);
            display: grid;
            grid-template-columns: 250px 1fr;
            grid-template-rows: 60px 1fr;
            grid-template-areas:
                "sidebar header"
                "sidebar main";
            min-height: 100vh;
        }

        header {
            grid-area: header;
            background: white;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 2rem;
            z-index: 100;
        }

        .header-left {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .hamburger {
            display: none;
            background: none;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            color: var(--muted);
        }

        .header-left h1 {
            font-size: 1.5rem;
            color: var(--primary);
        }

        .header-right {
            display: flex;
            align-items: center;
            gap: 1.5rem;
        }

        .user-profile {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
        }

        .user-role{
            font-size: 0.85rem;
            color: var(--dark);
        }

        .user-name {
            font-weight: 600;
            color: var(--primary);
        }

        .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--primary);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }

        .sidebar {
            grid-area: sidebar;
            background: var(--sidebar);
            color: white;
            padding: 1.5rem 0;
        }

        .logo {
            padding: 0 1.5rem 1.5rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            margin-bottom: 1.5rem;
        }

        .logo h2 {
            font-size: 1.3rem;
        }

        .logo span {
            color: var(--success);
        }

        .nav-links {
            list-style: none;
        }

        .nav-links li {
            margin-bottom: 0.5rem;
        }

        .nav-links a {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 1.5rem;
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            transition: all 0.3s;
        }

        .nav-links a:hover,
        .nav-links a.active {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border-left: 4px solid var(--success);
        }

        .nav-links i {
            width: 20px;
            text-align: center;
        }

        main {
            grid-area: main;
            padding: 2rem;
            overflow-y: auto;
        }
        
        .new-task-button {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .page-title {
            margin-bottom: 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .page-title h2 {
            font-size: 1.8rem;
            color: var(--dark);
        }

        .stats-cards {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .stat-card {
            background: white;
            border-radius: 10px;
            padding: 1.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .stat-icon {
            width: 50px;
            height: 50px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            color: white;
        }

        .stat-info h3 {
            font-size: 1.8rem;
            margin-bottom: 0.25rem;
        }

        .stat-info p {
            color: var(--muted);
            font-size: 0.9rem;
        }

        .bg-primary {
            background: var(--primary);
        }

        .bg-success {
            background: var(--success);
        }

        .bg-warning {
            background: var(--warning);
        }

        .bg-danger {
            background: var(--danger);
        }

        .section {
            background: white;
            border-radius: 10px;
            padding: 1.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            margin-bottom: 2rem;
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid var(--border);
        }

        .section-header h3 {
            font-size: 1.3rem;
            color: var(--dark);
        }

        .btn {
            padding: 0.5rem 1rem;
            border-radius: 5px;
            border: none;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s;
        }

        .btn-primary {
            background: var(--primary);
            color: white;
        }

        .btn-primary:hover {
            background: var(--secondary);
        }

        .btn-success {
            background: var(--success);
            color: white;
        }

        .btn-warning {
            background: var(--warning);
            color: white;
        }

        .table-container {
            overflow-x: auto;
            color: var(--dark);
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid var(--border);
        }

        th {
            background: #f8f9fa;
            font-weight: 600;
            color: var(--dark);
        }

        tr:hover {
            background: #f8f9fa;
        }

        .status-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
        }

        .status-submitted {
            background: #d1ecf1;
            color: #0c5460;
        }

        .status-graded {
            background: #d4edda;
            color: #155724;
        }

        .status-late {
            background: #f8d7da;
            color: #721c24;
        }

        .status-missing {
            background: #e9ecef;
            color: var(--dark);
        }

        .assignments-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
        }

        .assignment-card {
            background: white;
            border-radius: 10px;
            padding: 1.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            border-left: 4px solid var(--primary);
            color: var(--dark);
        }

        .assignment-card.warning {
            border-left-color: var(--warning);
        }

        .assignment-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1rem;
        }

        .assignment-title {
            font-weight: 600;
            font-size: 1.1rem;
        }

        .assignment-date {
            color: var(--muted);
            font-size: 0.9rem;
        }

        .assignment-stats {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
            flex-wrap: wrap;
        }

        .stat {
            text-align: center;
        }

        .stat-value {
            font-size: 1.2rem;
            font-weight: 600;
        }

        .stat-label {
            font-size: 0.8rem;
            color: var(--muted);
        }

        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        }

        .modal.active {
            display: flex;
        }

        .modal-content {
            background: white;
            border-radius: 10px;
            padding: 2rem;
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }

        .modal-header h3 {
            font-size: 1.5rem;
            color: var(--dark);
        }

        .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--muted);
        }

        .form-group {
            margin-bottom: 1rem;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: var(--dark);
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid var(--border);
            border-radius: 5px;
            font-size: 1rem;
            color: var(--dark);
        }

        .form-group textarea {
            height: 120px;
            resize: vertical;
        }

        .charts-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
        }

        .chart-card {
            background: white;
            border-radius: 10px;
            padding: 1.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            height: 300px;
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
    display: none !important;
  }

  .hamburger {
    display: none !important;
  }

  header h1 {
    font-size: 1.2rem;
  }

  main {
    padding: 1rem;
  }

  .charts-container {
    grid-template-columns: 1fr;
  }

  .stat-card {
    flex-direction: row;
    padding: 1rem;
  }

  .chart-card {
    height: 240px;
  }
}

@media (max-width: 768px) {
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
    margin-top: 60px;
    padding: 1rem;
  }

  .header-right {
    gap: 1rem;
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .assignments-grid {
    grid-template-columns: 1fr;
  }

  .charts-container {
    grid-template-columns: 1fr;
  }

  .chart-card {
    height: 280px;
  }

  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}

@media (max-width: 600px) {
  header {
    padding: 0 1rem;
    height: 56px;
  }

  main {
    margin-top: 56px;
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
    font-size: 0.9rem;
  }

  .page-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .page-title h2 {
    font-size: 1.3rem;
  }

  .btn {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .stat-card {
    padding: 0.75rem;
    gap: 0.5rem;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }

  .stat-info h3 {
    font-size: 1.5rem;
  }

  .stat-info p {
    font-size: 0.8rem;
  }

  .section {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .section-header {
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-direction: column;
    align-items: flex-start;
  }

  .section-header h3 {
    font-size: 1.1rem;
  }

  .assignments-grid {
    grid-template-columns: 1fr;
  }

  .assignment-card {
    padding: 1rem;
  }

  .assignment-stats {
    flex-direction: row;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .stat {
    flex: 1 1 48%;
    text-align: center;
  }

  table {
    font-size: 0.85rem;
  }

  th, td {
    padding: 0.5rem;
  }

  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .modal-content {
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
    border-radius: 0;
    padding: 1rem;
  }

  .form-group {
    margin-bottom: 0.75rem;
  }

  .form-group input,
  .form-group textarea,
  .form-group select {
    padding: 0.75rem;
    font-size: 1rem;
  }

  .charts-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .chart-card {
    height: 200px;
  }

  .assignment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .assignment-stats {
    flex-direction: column;
    gap: 0.25rem;
  }
}

@media (max-width: 400px) {
  header h1 {
    font-size: 1rem;
  }

  main {
    padding: 0.5rem;
  }

  .btn {
    font-size: 0.85rem;
    padding: 0.5rem 0.8rem;
    width: 100%;
  }

  .page-title {
    gap: 0.5rem;
  }

  .page-title h2 {
    font-size: 1.2rem;
  }

  .stats-cards {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .stat-card {
    flex: 1 1 100%;
    padding: 0.75rem;
    align-items: flex-start;
  }

  .stat-icon {
    width: 36px;
    height: 36px;
  }

  .stat-info h3 {
    font-size: 1.3rem;
  }

  .section {
    padding: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .section-header h3 {
    font-size: 1rem;
  }

  .assignment-card {
    padding: 0.75rem;
  }

  .assignment-title {
    font-size: 1rem;
  }

  table {
    font-size: 0.8rem;
  }

  th, td {
    padding: 0.4rem;
    white-space: nowrap;
  }

  .form-group input,
  .form-group textarea,
  .form-group select {
    padding: 0.65rem;
  }

  .chart-card {
    height: 150px;
  }
}

</style>