<template>
<div class="dashboard-wrapper">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

  <aside class="sidebar">
    <div class="logo">
      <h2>Smart<span>Manager</span></h2>
      <p>Tanári Portál</p><p>Üdvözöljük, {{ userProfile.teljes_nev || userProfile.felhasznalonev }}</p>
    </div>
    <ul class="nav-links">
      <router-link to="/tanar"><li><i class="fas fa-home"></i> Áttekintés</li></router-link>
      <router-link to="/Ttask"><li><i class="fas fa-tasks"></i> Projektek</li></router-link>
      <router-link to="/ertekeles" class="active"><li><i class="fas fa-check-circle"></i> Értékelés</li></router-link>
      <router-link to="/chat"><li><i class="fas fa-comments"></i> Üzenetek</li></router-link>
      <router-link to="/settings"><li><i class="fas fa-cog"></i> Beállítások</li></router-link>
    </ul>
    <div class="sidebar-footer">
      <button class="sidebar-logout" type="button" @click="logout">
        <i class="fas fa-sign-out-alt"></i>
        <span>Kijelentkezés</span>
      </button>
    </div>
  </aside>

  <header>
    <div class="header-left">
      <h1>Értékelés</h1>
    </div>
    <div class="header-right">
      <div class="notifications">
      </div>

      <div class="user-profile">
        <div class="dropdown" @click="dropdownOpen = !dropdownOpen">
                    <div class="avatar">{{ userProfile.initials }}</div>
                    <div>
                        <div class="user-name">{{ userProfile.teljes_nev || userProfile.felhasznalonev }}</div>
                        <div class="user-role">{{ getRoleLabel(userProfile.szerep_tipus) }}</div>
                    </div>
                    <i class="fas fa-chevron-down"></i>
                    <div :class="['dropdown-menu', { show: dropdownOpen }]" @click.stop>
                      <button class="dropdown-item" @click="openProfile" title="Főoldal">
                        <i class="fas fa-home"></i>
                        <router-link to="/tanar" style="color: inherit; text-decoration: none;">
                          <span>Főoldal</span>
                        </router-link>
                      </button>
                      <button class="dropdown-item" @click="openProfile" title="Projektek">
                        <i class="fas fa-tasks"></i> 
                        <router-link to="/Ttask" style="color: inherit; text-decoration: none;">
                          <span>Projektek</span>
                        </router-link>
                      </button>
                      <button class="dropdown-item" @click="openTasks" title="Értékelés">
                        <i class="fas fa-check-circle"></i>
                        <router-link to="/ertekeles" style="color: inherit; text-decoration: none;">
                          <span>Értékelés</span>
                        </router-link>
                      </button>
                      <button class="dropdown-item" @click="openChat" title="Üzenetek">
                        <i class="fas fa-comments"></i>
                        <router-link to="/chat" style="color: inherit; text-decoration: none;">
                          <span>Üzenetek</span>
                        </router-link>
                      </button>
                      <button class="dropdown-item" @click="openSettings" title="Beállítások">
                        <i class="fas fa-cog"></i>
                        <router-link to="/settings" style="color: inherit; text-decoration: none;">
                          <span>Beállítások</span>
                        </router-link>
                      </button>
                      <button class="dropdown-item" @click="logout" title="Kijelentkezés">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Kijelentkezés</span>
                      </button>
                    </div>
                </div>
      </div>
    </div>
  </header>

  <main class="main-content">
    <div class="content-wrapper">

      <section class="evaluation-card">

        <div class="form-group">
          <label>Feladat</label>
          <select v-model="evaluation.task">
            <option disabled value="">Válassz feladatot</option>
            <option
              v-for="task in availableTasks"
              :key="task.id"
              :value="task"
            >
              {{ task.feladat_nev }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Diák</label>
          <select v-model="evaluation.student" :disabled="!evaluation.task">
            <option disabled value="">Válassz diákot</option>
            <option
              v-for="user in availableDiakUsers"
              :key="user.id"
              :value="user"
            >
              {{ user.teljes_nev }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Pontszám</label>
          <input
            type="number"
            v-model.number="evaluation.score"
            min="0"
            max="100"
          />
        </div>

        <div class="form-group">
          <label>Osztályzat</label>
          <select v-model.number="evaluation.grade">
            <option :value="null">Válassz osztályzatot</option>
            <option :value="5">5 - Kiváló</option>
            <option :value="4">4 - Jó</option>
            <option :value="3">3 - Közepes</option>
            <option :value="2">2 - Elégséges</option>
            <option :value="1">1 - Elégtelen</option>
          </select>
        </div>

        <div class="form-group">
          <label>Szöveges értékelés</label>
          <textarea v-model="evaluation.comment"></textarea>
        </div>

        <button class="save-btn" @click="saveEvaluation">
          Értékelés mentése
        </button>

      </section>

      <section class="section">
        <div class="section-header">
          <h3><i class="fas fa-chart-line"></i> Személyes statisztika</h3>
        </div>

        <div class="form-group">
          <label>Diák kiválasztása</label>
          <select v-model="selectedStudentForStats">
            <option :value="null">-- Válassz diákot --</option>
            <option
              v-for="student in allDiakUsers"
              :key="student.id"
              :value="student"
            >
              {{ student.teljes_nev }} ({{ student.felhasznalonev }})
            </option>
          </select>
        </div>

        <div class="charts-container" v-if="selectedStudentForStats">
          <div class="chart-card">
            <canvas ref="performanceChart"></canvas>
          </div>
          <div class="chart-card">
            <canvas ref="submissionChart"></canvas>
          </div>
        </div>
        <div v-else class="no-data" style="text-align: center; padding: 2rem;">
          Válassz egy diákot a statisztika megtekintéséhez
        </div>
      </section>

    </div>

    <section class="grades-summary">
      <div class="section-header">
        <h3><i class="fas fa-trophy"></i> Diákok értékelése</h3>
      </div>

      <div class="table-container">
        <table class="grades-table">
          <thead>
            <tr>
              <th>Diák</th>
              <th>Feladat</th>
              <th>Pontszám / Maxpontszám</th>
              <th>Osztályzat</th>
              <th>Százalék</th>
              <th>Szöveges értékelés</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="grade in studentGrades"
              :key="`${grade.studentId}-${grade.taskId}`"
            >
              <td>{{ grade.studentName }}</td>
              <td>{{ grade.taskTitle }}</td>
              <td>{{ grade.score }} / {{ grade.maxScore }}</td>
              <td>{{ grade.grade || '-' }}</td>
              <td>
                <span
                  :class="['percentage-badge', getPercentageClass(grade.score)]"
                >
                  {{ grade.score }}%
                </span>
              </td>
              <td>{{ grade.comment || '-' }}</td>
            </tr>

            <tr v-if="studentGrades.length === 0">
              <td colspan="6" class="no-data">
                Nincs rögzített értékelés
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

  </main>
</div>
</template>

<script>
// Vue composablek: reaktív állapot, lifecycle és watcherek
import { ref, onMounted, computed, watch, nextTick } from "vue";
// kliens oldali navigáció
import { useRouter } from "vue-router";
// Chart.js statisztikai grafikonokhoz
import { Chart, registerables } from "chart.js";
// központi API URL helper
import { getApiUrl } from "../utils/api";

// Chart.js elemek regisztrálása globálisan a komponensben
Chart.register(...registerables);

export default {
  name: "Ertekeles",
  setup() {
    // router példány navigációhoz (pl. kijelentkezés után)
    const router = useRouter();

    // fejléc/dropdown és profil UI állapotok
    const dropdownOpen = ref(false);
    const userProfile = ref({
      teljes_nev: '',
      felhasznalonev: '',
      szerep_tipus: 'tanar',
      initials: ''
    });

    // opcionális modal/sidebar állapotok (jelenlegi UI-hoz fenntartva)
    const showModal = ref(false);
    const showSidebar = ref(false);

    // canvas referenciák a Chart.js példányokhoz
    const performanceChart = ref(null);
    const submissionChart = ref(null);

    // backendről érkező adatok
    const students = ref([]);
    const allStudents = ref([]);
    const tasks = ref([]);
    const studentGrades = ref([]);

    // statisztikához kiválasztott diák
    const selectedStudentForStats = ref(null);

    // értékelő űrlap reaktív modellje
    const evaluation = ref({
      student: null,
      task: null,
      score: null,
      grade: null,
      comment: ""
    });

    // feladat alapján szűrt diákok (csak diák szerepkör)
    const availableDiakUsers = computed(() =>
      students.value.filter(u => u.szerep_tipus === 'diak')
    );

    // teljes tagságból szűrt összes diák (statisztika selectorhoz)
    const allDiakUsers = computed(() =>
      allStudents.value.filter(u => u.szerep_tipus === 'diak')
    );

    // feladatlista közvetlen computed-ben a template számára
    const availableTasks = computed(() => tasks.value);

    // szerepkód -> megjelenített felirat
    const getRoleLabel = (role) => {
      const map = { diak: 'Diák', tanar: 'Tanár', admin: 'Adminisztrátor' };
      return map[role] || role;
    };

    // névből monogram előállítása (max 2 karakter)
    const generateInitials = (name) => {
      if (!name) return '';
      return name.split(' ').map(p => p[0].toUpperCase()).join('').substring(0, 2);
    };

    // százalékos teljesítményhez badge színosztály
    const getPercentageClass = (score) => {
      if (score >= 90) return "excellent";
      if (score >= 80) return "good";
      if (score >= 70) return "fair";
      if (score >= 60) return "pass";
      return "fail";
    };

    // aktuális user profil betöltése fejléchez és jogosultsághoz
    const fetchUserProfile = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken');
        if (!storedUser || !token) return router.push('/login');

        const res = await fetch(getApiUrl('/api/auth/profileData'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data.user) {
          const u = data.data.user;
          userProfile.value = {
            teljes_nev: u.teljes_nev || u.felhasznalonev,
            felhasznalonev: u.felhasznalonev,
            szerep_tipus: u.szerep_tipus,
            email: u.email,
            id: u.id,
            initials: generateInitials(u.teljes_nev || u.felhasznalonev)
          };
        }
      } catch (e) { console.error(e); }
    };

    // projekt tagok (allStudents) lekérése a diákválasztókhoz
    const fetchTeamUsers = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const res = await fetch(getApiUrl('/api/project/projectMember'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          allStudents.value = data.data;
        }
      } catch (e) { console.error(e); }
    };

    // összes feladat lekérése az értékelő űrlaphoz
    const fetchAllTasks = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(getApiUrl('/api/project/tasks'), {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    console.log("fetchAllTasks:", data);
    tasks.value = data.data.tasks || [];
  } catch (e) { console.error(e); }
};

    // a kiválasztott feladathoz tartozó diák(ok) lekérése
    const fetchTaskStudents = async () => {
  if (!evaluation.value.task || !evaluation.value.task.projekt_id) return;
  try {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(getApiUrl(`/api/project/projectMembers?projekt_id=${evaluation.value.task.projekt_id}`), {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      const filteredStudents = data.data.filter(
        u => u.szerep_tipus === 'diak' && u.id === evaluation.value.task.felelos_id
      );
      students.value = filteredStudents;
    }
  } catch (e) { console.error(e); }
};

    // korábban mentett beadás-értékelések betöltése táblázathoz és stathoz
    const fetchBeadasEvaluations = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(getApiUrl('/api/files/submission'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data.beadasList)) {
          const evaluations = data.data.beadasList.map(b => ({
            studentId: b.felhasznalo_id,
            studentName: b.student_name || 'Ismeretlen',
            taskId: b.feladat_id,
            taskTitle: b.task_name || 'Ismeretlen',
            score: b.pontszam,
            maxScore: b.max_pontszam || 100,
            grade: b.jegy,
            comment: b.visszajelzes,
            evaluatedAt: b.ertekeles_idopont
          }));
          evaluations.sort((a, b) => {
            if (!a.evaluatedAt) return 1;
            if (!b.evaluatedAt) return -1;
            return new Date(b.evaluatedAt) - new Date(a.evaluatedAt);
          });
          studentGrades.value = evaluations;
        }
      } catch (e) { console.error('Hiba az értékelések lekérdezésekor:', e); }
    };

    // kijelentkezés: jelenlét frissítése + localStorage ürítés + átirányítás
    const logout = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        
        if (token) {
          await fetch(getApiUrl('/api/auth/profile'), {
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
      
      router.push('/');
    };

    // értékelés mentése backendre, majd lista és grafikonok frissítése
    const saveEvaluation = async () => {
      if (!evaluation.value.student || !evaluation.value.task) {
        return alert("Kérlek válassz diákot és feladatot!");
      }

      if (evaluation.value.score > 100) {
        return alert("A pontszám nem lehet nagyobb, mint 100!");
      }

      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(getApiUrl('/api/files/submissionCreate'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            feladat_id: evaluation.value.task.id,
            felhasznalo_id: evaluation.value.student.id,
            tanar_id: userProfile.value.id,
            pontszam: evaluation.value.score,
            jegy: evaluation.value.grade,
            statusz: 'ertekelt',
            visszajelzes: evaluation.value.comment,
            ertekeles_idopont: new Date().toISOString()
          })
        });

        const data = await res.json();
        if (data.success) {
          await fetchBeadasEvaluations();
          if (selectedStudentForStats.value) {
            await nextTick();
            updateStudentCharts(selectedStudentForStats.value);
          }
          evaluation.value = { student: null, task: null, score: null, grade: null, comment: "" };
          alert("Értékelés sikeresen elmentve!");
        } else {
          alert("Hiba az értékelés mentésekor: " + (data.message || 'Ismeretlen hiba'));
        }
      } catch (e) {
        console.error("Mentési hiba:", e);
        alert("Hiba az értékelés mentésekor!");
      }
    };

    // feladatváltáskor nullázzuk a diákot és újratöltjük a lehetséges diáklistát
    watch(
  () => evaluation.value.task,
  (newTask) => {
    evaluation.value.student = null;
    if (newTask) fetchTaskStudents();
  }
);

    // statisztikai diák váltáskor újrarendereljük a grafikonokat
    watch(
  () => selectedStudentForStats.value,
  async (newStudent) => {
    if (newStudent) {
      await nextTick();
      updateStudentCharts(newStudent);
    }
  }
);

    // pontszám alapján automatikus jegy kalkuláció
    watch(
  () => evaluation.value.score,
  (newScore) => {
    if (newScore === null || newScore === undefined || newScore === '') {
      evaluation.value.grade = null;
      return;
    }
    if (newScore >= 80) {
      evaluation.value.grade = 5; 
    } else if (newScore >= 70) {
      evaluation.value.grade = 4; 
    } else if (newScore >= 60) {
      evaluation.value.grade = 3; 
    } else if (newScore >= 50) {
      evaluation.value.grade = 2; 
    } else {
      evaluation.value.grade = 1; 
    }
  }
);

    // kiválasztott diákhoz tartozó teljesítmény és jegyeloszlás grafikon frissítése
    const updateStudentCharts = (student) => {
      const studentGradesData = studentGrades.value.filter(g => g.studentId === student.id);
      const scores = studentGradesData.map(g => g.score);
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0;

      // korábbi chart példányok törlése memória- és render hiba elkerüléséhez
      if (performanceChart.value && performanceChart.value.chart) {
        performanceChart.value.chart.destroy();
      }
      if (submissionChart.value && submissionChart.value.chart) {
        submissionChart.value.chart.destroy();
      }

      if (performanceChart.value) {
        const ctx = performanceChart.value.getContext("2d");
        performanceChart.value.chart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: studentGradesData.map(g => g.taskTitle),
            datasets: [{ label: "Pontszám", data: scores, backgroundColor: "#4361ee" }]
          },
          options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            scales: { y: { beginAtZero: true, max: 100 } } 
          }
        });
      }

      // jegyek eloszlása kördiagramon
      if (submissionChart.value) {
        const grades = studentGradesData.map(g => g.grade).filter(g => g !== null && g !== undefined);
        const grade5Count = grades.filter(g => g === 5).length;
        const grade4Count = grades.filter(g => g === 4).length;
        const grade3Count = grades.filter(g => g === 3).length;
        const grade2Count = grades.filter(g => g === 2).length;
        const grade1Count = grades.filter(g => g === 1).length;

        const ctx = submissionChart.value.getContext("2d");
        submissionChart.value.chart = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: ["5 - Kiváló", "4 - Jó", "3 - Közepes", "2 - Elégséges", "1 - Elégtelen"],
            datasets: [{ 
              data: [grade5Count, grade4Count, grade3Count, grade2Count, grade1Count], 
              backgroundColor: ["#4cc9f0", "#4361ee", "#f72585", "#fb8500", "#e63946"] 
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }
    };

    // komponens induláskor adatok betöltése + dropdown kattintáskezelő
    onMounted(() => {
      fetchUserProfile();
      fetchAllTasks();
      fetchTeamUsers();
      fetchBeadasEvaluations();

      document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-profile')) {
          dropdownOpen.value = false;
        }
      });
    });

    // template-ben használt állapotok és metódusok exportja
    return {
      userProfile, showModal, showSidebar, performanceChart, submissionChart,
      students, tasks, studentGrades, evaluation, selectedStudentForStats,
      availableDiakUsers, allDiakUsers, availableTasks, dropdownOpen,
      getRoleLabel, getPercentageClass, saveEvaluation, logout,
    };
  }
};
</script>

<style scoped>

.dashboard-wrapper .dropdown {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: background 0.3s;
  cursor: pointer;
}

.dashboard-wrapper .dropdown:hover {
  background: #f0f0f0;
}

.dashboard-wrapper .dropdown i {
  font-size: 0.8rem;
  transition: transform 0.3s;
}

.dashboard-wrapper .dropdown.show i {
  transform: rotate(180deg);
}

.dashboard-wrapper .dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid var(--border);
  border-radius: 5px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 1200;
  margin-top: 0.5rem;
}

.dashboard-wrapper .dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dashboard-wrapper .dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  color: var(--dark);
  transition: background 0.2s;
  font-size: 0.95rem;
}

.dashboard-wrapper .dropdown-item:first-child {
  border-radius: 4px 4px 0 0;
}

.dashboard-wrapper .dropdown-item:last-child {
  border-radius: 0 0 4px 4px;
}

.dashboard-wrapper .dropdown-item:hover {
  background: #f0f2f5;
  color: var(--primary);
}

.dashboard-wrapper .dropdown-item i {
  width: 20px;
  text-align: center;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: stretch;
  margin-top: -2rem;
  margin-left: -2rem;
  margin-bottom: 2rem;
}

.evaluation-card {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  border-style: 1px solid #dee2e6;
  box-shadow: 0 2px 8px rgb(0, 0, 0);
}

.section {
  background: #fff;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  max-width: 500px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #dee2e6;
}

.section-header h3 {
  font-size: 1.3rem;
  color: var(--dark);
  margin: 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-row .form-group {
  flex: 1;
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: var(--primary);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  color: #333;
}

.form-group textarea {
  height: 100px;
  resize: vertical;
}

.save-btn {
  background-color: #4CAF50;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;
}

.save-btn i {
  margin-right: 0.5rem;
}

.save-btn:hover {
  background-color: #45a049;
}

.charts-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  width: 100%;
  max-width: 100%;
}

.chart-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  height: 200px;
  width: 100%;
  box-sizing: border-box;
}

.grades-summary {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-container {
  overflow-x: auto;
  margin-top: 1rem;
}

.grades-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.grades-table thead {
  background-color: var(--light);
}

.grades-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--dark);
  border-bottom: 2px solid #dee2e6;
}

.grades-table td {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  color: var(--dark);
}

.grades-table tbody tr:hover {
  background-color: var(--light);
}

.percentage-badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.85rem;
}

.percentage-badge.excellent {
  background-color: #d4edda;
  color: #155724;
}

.percentage-badge.good {
  background-color: #cce5ff;
  color: #004085;
}

.percentage-badge.fair {
  background-color: #fff3cd;
  color: #856404;
}

.percentage-badge.pass {
  background-color: #f8d7da;
  color: #721c24;
}

.percentage-badge.fail {
  background-color: #f5c6cb;
  color: #721c24;
}

.no-data {
  text-align: center;
  color: #999;
  font-style: italic;
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
    padding: 0 1rem;
  }

  main {
    margin-left: 0;
    padding: 1rem;
    margin-top: 60px;
  }

  .content-wrapper {
    grid-template-columns: 1fr;
  }

  .evaluation-card {
    height: auto;
  }

  .charts-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  header {
    padding: 0.5rem 0.75rem;
    height: auto;
    min-height: 50px;
  }

  main {
    padding: 0.75rem;
    margin-top: 50px;
  }

  .header-left h1 {
    font-size: 1.1rem;
  }

  .header-right {
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .dashboard-wrapper .dropdown-menu {
    right: 0;
    left: auto;
    min-width: min(260px, calc(100vw - 1rem));
    max-width: calc(100vw - 1rem);
  }

  .content-wrapper {
    gap: 0.75rem;
    margin-top: -1rem;
    margin-left: -0.75rem;
    margin-bottom: 1rem;
  }

  .evaluation-card {
    padding: 0.75rem;
  }

  .form-group {
    margin-bottom: 0.5rem;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 0.6rem;
    font-size: 0.95rem;
  }

  .save-btn {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }

  .section {
    padding: 1rem;
    max-width: 100%;
  }

  .grades-table {
    font-size: 0.85rem;
  }

  .grades-table th,
  .grades-table td {
    padding: 0.6rem 0.4rem;
  }

  .chart-card {
    height: 250px;
  }
}

@media (max-width: 600px) {
  header {
    padding: 0 0.5rem;
    height: auto;
    min-height: 45px;
  }

  main {
    padding: 0.5rem;
    margin-top: 45px;
  }

  .header-left h1 {
    font-size: 1rem;
  }

  .header-right {
    gap: 0.25rem;
    width: 100%;
    justify-content: flex-end;
  }

  .user-profile {
    margin-left: auto;
  }

  .header-right .user-name,
  .header-right .user-role {
    display: none;
  }

  .avatar {
    width: 32px;
    height: 32px;
    font-size: 0.7rem;
  }

  .dropdown {
    padding: 0.35rem 0.5rem;
  }

  .dashboard-wrapper .dropdown-menu {
    position: fixed;
    top: 56px;
    left: 0.5rem;
    right: 0.5rem;
    min-width: auto;
    max-width: none;
    border-radius: 10px;
    margin-top: 0;
  }

  .dashboard-wrapper .dropdown-item {
    padding: 0.75rem 0.9rem;
    font-size: 0.92rem;
    white-space: nowrap;
  }

  .section-header {
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .section-header h3 {
    font-size: 1rem;
  }

  .content-wrapper {
    gap: 0.5rem;
    margin-top: -1rem;
    margin-left: -0.5rem;
    margin-bottom: 1rem;
  }

  .evaluation-card {
    padding: 0.5rem;
  }

  .form-group {
    margin-bottom: 0.4rem;
  }

  .form-group label {
    font-size: 0.85rem;
    margin-bottom: 0.3rem;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 0.5rem;
    font-size: 1rem;
  }

  .save-btn {
    width: 100%;
    padding: 0.5rem;
    font-size: 0.85rem;
  }

  .section {
    padding: 0.75rem;
    margin-bottom: 0.75rem;
    max-width: 100%;
  }

  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .grades-table {
    font-size: 0.7rem;
  }

  .grades-table th,
  .grades-table td {
    padding: 0.35rem;
  }

  .percentage-badge {
    padding: 0.2rem 0.4rem;
    font-size: 0.65rem;
  }

  .chart-card {
    height: 180px;
  }
}

@media (max-width: 400px) {
  header {
    padding: 0 0.25rem;
    height: auto;
    min-height: 40px;
  }

  main {
    padding: 0.25rem;
  }

  .header-left h1 {
    font-size: 0.9rem;
  }

  .section-header h3 {
    font-size: 0.95rem;
  }

  .evaluation-card {
    padding: 0.5rem;
  }

  .form-group {
    margin-bottom: 0.35rem;
  }

  .form-group label {
    font-size: 0.85rem;
    margin-bottom: 0.3rem;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 0.5rem;
    font-size: 16px;
  }

  .save-btn {
    padding: 0.5rem;
    font-size: 0.8rem;
  }

  .section {
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    max-width: 100%;
  }

  .grades-table {
    font-size: 0.7rem;
  }

  .grades-table th,
  .grades-table td {
    padding: 0.25rem 0.15rem;
  }

  .percentage-badge {
    padding: 0.2rem 0.4rem;
    font-size: 0.65rem;
  }

  .chart-card {
    height: 150px;
  }
}
</style>