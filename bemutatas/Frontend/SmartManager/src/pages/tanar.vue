<template>
    <div class="dashboard-wrapper">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ open: showSidebar }">
        <div class="logo">
            <h2>Smart<span>Manager</span></h2>
            <p>Tanári Portál</p>
        </div>
        <ul class="nav-links">
            <li><a href="#" class="active"><i class="fas fa-home"></i> Áttekintés</a></li>
            <li><a href="#"><i class="fas fa-tasks"></i> Feladatok</a></li>
            <li><a href="#"><i class="fas fa-check-circle"></i> Értékelés</a></li>
            <li><a href="#statPeriod"><i class="fas fa-chart-bar"></i> Statisztika</a></li>
            <li><a href="#"><i class="fas fa-comments"></i> Üzenetek</a></li>
            <li><a href="#"><i class="fas fa-cog"></i> Beállítások</a></li>
        </ul>
    </aside>

    <!-- Header -->
    <header>
        <div class="header-left">
            <button class="hamburger" @click="showSidebar = !showSidebar" aria-label="Toggle menu">
                <i class="fas fa-bars"></i>
            </button>
            <h1>Tanári Dashboard</h1>
        </div>
        <div class="header-right">
            <div class="notifications">
                <i class="fas fa-bell"></i>
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
            <button class="btn btn-primary new-task-button" id="new-task-button" @click="showModal = true"><i class="fas fa-plus"></i> Új feladat</button>
        </div>

        <!-- Stats Cards -->
        <div class="stats-cards">
            <div class="stat-card">
                <div class="stat-icon bg-primary">
                    <i class="fas fa-tasks"></i>
                </div>
                <div class="stat-info">
                    <h3>8</h3>
                    <p>Aktív feladatok</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon bg-success">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-info">
                    <h3>42</h3>
                    <p>Beadott feladat</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon bg-warning">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="stat-info">
                    <h3>5</h3>
                    <p>Késések</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon bg-danger">
                    <i class="fas fa-times-circle"></i>
                </div>
                <div class="stat-info">
                    <h3>3</h3>
                    <p>Hiányzó beadás</p>
                </div>
            </div>
        </div>

        <!-- Legutóbb beadott feladatok -->
        <section class="section">
            <div class="section-header">
                <h3><i class="fas fa-history"></i> Legutóbb beadott feladatok</h3>
                <a href="#">Összes megtekintése</a>
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
                            <th>Műveletek</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Dobos Katalin</td>
                            <td>Adatbázis terv - 3. fejezet</td>
                            <td>2025.12.14 14:30</td>
                            <td>2025.12.15</td>
                            <td><span class="status-badge status-submitted">Beadva</span></td>
                            <td>
                                <button class="btn btn-primary">Értékelés</button>
                            </td>
                        </tr>
                        <tr>
                            <td>Nagy Bence</td>
                            <td>Projekt munka</td>
                            <td>2025.12.13 16:45</td>
                            <td>2025.12.18</td>
                            <td><span class="status-badge status-graded">Értékelve (85%)</span></td>
                            <td>
                                <button class="btn btn-success">Megtekintés</button>
                            </td>
                        </tr>
                        <tr>
                            <td>Kiss Péter</td>
                            <td>Admin jogok szerkesztése</td>
                            <td><span class="status-badge status-late">Késésben</span></td>
                            <td>2020.12.10</td>
                            <td><span class="status-badge status-late">Késésben</span></td>
                            <td>
                                <button class="btn btn-warning">Értékelés</button>
                            </td>
                        </tr>
                        <tr>
                            <td>Szabó Anna</td>
                            <td>Webfejlesztés projekt</td>
                            <td>2025.12.12 20:20</td>
                            <td>2025.12.12</td>
                            <td><span class="status-badge status-graded">Értékelve (92%)</span></td>
                            <td>
                                <button class="btn btn-success">Megtekintés</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <!-- Aktív feladatok -->
        <section class="section">
            <div class="section-header">
                <h3><i class="fas fa-clipboard-list"></i> Aktív feladatok</h3>
                <a href="#">Összes feladat</a>
            </div>
            <div class="assignments-grid">
                <div class="assignment-card">
                    <div class="assignment-header">
                        <div class="assignment-title">Frontend Projekt</div>
                        <div class="assignment-date">Határidő: 2025.12.15</div>
                    </div>
                    <div class="assignment-stats">
                        <div class="stat">
                            <div class="stat-value">24/28</div>
                            <div class="stat-label">Beadva</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value">0</div>
                            <div class="stat-label">Késés</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value">18</div>
                            <div class="stat-label">Értékelve</div>
                        </div>
                    </div>
                    <div class="assignment-actions">
                        <button class="btn btn-primary">Értékelés</button>
                        <button class="btn">Statisztika</button>
                    </div>
                </div>
                <div class="assignment-card warning">
                    <div class="assignment-header">
                        <div class="assignment-title">Backend Projekt</div>
                        <div class="assignment-date">Határidő: 2025.12.18</div>
                    </div>
                    <div class="assignment-stats">
                        <div class="stat">
                            <div class="stat-value">15/28</div>
                            <div class="stat-label">Beadva</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value">0</div>
                            <div class="stat-label">Késés</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value">8</div>
                            <div class="stat-label">Értékelve</div>
                        </div>
                    </div>
                    <div class="assignment-actions">
                        <button class="btn btn-primary">Értékelés</button>
                        <button class="btn">Emlékeztető</button>
                    </div>
                </div>
                <div class="assignment-card">
                    <div class="assignment-header">
                        <div class="assignment-title">Flowchart készítése</div>
                        <div class="assignment-date">Határidő: 2025.12.19</div>
                    </div>
                    <div class="assignment-stats">
                        <div class="stat">
                            <div class="stat-value">26/28</div>
                            <div class="stat-label">Beadva</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value">0</div>
                            <div class="stat-label">Késés</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value">22</div>
                            <div class="stat-label">Értékelve</div>
                        </div>
                    </div>
                    <div class="assignment-actions">
                        <button class="btn btn-primary">Értékelés</button>
                        <button class="btn">Exportálás</button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Statisztika -->
              <section class="section">
        <div class="section-header">
          <h3><i class="fas fa-chart-line"></i> Osztály statisztika</h3>
          <div>
            <select id="statPeriod">
              <option>Utolsó 30 nap</option>
              <option>Utolsó 3 hónap</option>
              <option>Ezév</option>
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

        <!-- Legjobb és legrosszabb teljesítők -->
        <section class="section">
            <div class="section-header">
                <h3><i class="fas fa-trophy"></i> Teljesítmény rangsor</h3>
                <button class="btn btn-primary"><i class="fas fa-download"></i> PDF Export</button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th style="text-align: center;">Helyezés</th>
                            <th style="text-align: center;">Diák</th>
                            <th style="text-align: center;">Legutóbbi értékelés</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th></th>
                            <td style="text-align: center;">1.</td>
                            <td style="text-align: center;">Szabó Anna</td>
                            <td style="text-align: center;">Játék készítés C# - 95%</td>
                        </tr>
                        <tr>
                            <th></th>
                            <td style="text-align: center;">2.</td>
                            <td style="text-align: center;">Nagy Bence</td>
                            <td style="text-align: center;">Űrlap készítés - 85%</td>
                        </tr>
                        <tr>
                            <th></th>
                            <td style="text-align: center;">3.</td>
                            <td style="text-align: center;">Kovács Eszter</td>
                            <td style="text-align: center;">Adatbázis fejlesztés - 80%</td>
                        </tr>
                        <tr>
                            <th></th>
                            <td style="text-align: center;">26.</td>
                            <td style="text-align: center;">Tóth Gábor</td>
                            <td style="text-align: center;">Játék készítés C# - 58%</td>
                        </tr>
                        <tr>
                            <th></th>
                            <td style="text-align: center;">27.</td>
                            <td style="text-align: center;">Molnár Dávid</td>
                            <td style="text-align: center;">Adatbázis fejlesztés - 52%</td>
                        </tr>
                        <tr>
                            <th></th>
                            <td style="text-align: center;">28.</td>
                            <td style="text-align: center;">Horváth Zsolt</td>
                            <td style="text-align: center;">Űrlap készítés - 45%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </main>

    <!-- Új feladat modal -->
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
            <label for="assignmentClass">Osztály</label>
            <select id="assignmentClass" v-model="assignment.class" required>
              <option value="">Válassz osztályt</option>
              <option value="10.A">10.A</option>
              <option value="10.B">10.B</option>
              <option value="12.A">12.A</option>
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
    const userProfile = ref({
      teljes_nev: '',
      felhasznalonev: '',
      szerep_tipus: 'tanar',
      initials: ''
    });

    const assignment = ref({
      title: "",
      description: "",
      deadline: "",
      class: "",
      points: 100,
    });

    const submitAssignment = () => {
      alert("Feladat sikeresen kiadva!");
      showModal.value = false;
      assignment.value = {
        title: "",
        description: "",
        deadline: "",
        class: "",
        points: 100,
      };
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
        
        if (!storedUser) {
          console.warn('Nincs bejelentkezett felhasználó');
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

    const logout = () => {
      try {
        localStorage.removeItem('user');
        localStorage.removeItem('sm_settings');
        localStorage.removeItem('sm_appearance');
      } catch (e) {
        console.warn('Hiba a localStorage törlésekor:', e);
      }
      router.push('/home');
    };

    onMounted(() => {
      fetchUserProfile();

      // Chart.js cucc
      if (performanceChart.value) {
        new Chart(performanceChart.value.getContext("2d"), {
          type: "bar",
          data: {
            labels: ["10.A", "10.B", "12.A", "12.B"],
            datasets: [
              {
                label: "Átlagos pontszám",
                data: [78, 82, 75, 79],
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
              title: { display: true, text: "Osztályonkénti átlag" },
            },
            scales: { y: { beginAtZero: true, max: 100 } },
          },
        });
      }

      if (submissionChart.value) {
        new Chart(submissionChart.value.getContext("2d"), {
          type: "doughnut",
          data: {
            labels: ["Időben beadva", "Késéssel beadva", "Hiányzó"],
            datasets: [
              {
                data: [42, 5, 3],
                backgroundColor: ["#4cc9f0", "#f72585", "#e63946"],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: "bottom" },
              title: { display: true, text: "Beadási statisztika" },
            },
          },
        });
      }
    });

    return { showModal, showSidebar, performanceChart, submissionChart, assignment, submitAssignment, userProfile, getRoleLabel, fetchUserProfile, logout };
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

        /* Header */
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

        /* Sidebar */
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

        /* Main Content */
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

        /* Sections */
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

        /* Table Styles */
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

        /* Assignment Cards */
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

/* Tablet nézet */
@media (max-width: 1024px) {
  .dashboard-wrapper {
    grid-template-columns: 1fr;
    grid-template-rows: 60px 1fr;
    grid-template-areas:
      "header"
      "main";
  }

  /* Sidebar teljesen elrejtve */
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

/* Mobil nézet */
@media (max-width: 600px) {
  header {
    padding: 0 1rem;
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
    width: 100%;
    text-align: center;
    font-size: 0.95rem;
  }

  /* automatikusan törés a stat kártyákra */
  .stats-cards {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 1rem;
    overflow-x: hidden;
  }

  .stat-card {
    flex: 1 1 100%;
    min-width: 150px;
    max-width: 48%;
    box-sizing: border-box;
  }

  .assignments-grid {
    grid-template-columns: 1fr;
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

/* kis képernyő */
@media (max-width: 400px) {
  header h1 {
    font-size: 1rem;
  }

  .btn {
    font-size: 0.85rem;
    padding: 0.4rem 0.6rem;
  }

  .stat-card {
    flex: 1 1 100%;
    align-items: flex-start;
  }

  .section-header h3 {
    font-size: 1rem;
  }

  table {
    font-size: 0.8rem;
  }

  th, td {
    white-space: nowrap;
  }
}

</style>