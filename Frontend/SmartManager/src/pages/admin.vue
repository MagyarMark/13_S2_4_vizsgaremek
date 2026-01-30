<template>
  <div class="admin-wrapper">
    <aside class="sidebar">
      <h2 class="logo">Smart<span>Admin</span></h2>

      <ul>
        <li :class="{ active: activeMenu === 'dashboard' }" @click="activeMenu = 'dashboard'">
          <i class="fas fa-chart-line"></i> Dashboard
        </li>
        <li :class="{ active: activeMenu === 'users' }" @click="activeMenu = 'users'">
          <i class="fas fa-users"></i> Felhasználók
        </li>
        <li :class="{ active: activeMenu === 'tasks' }" @click="activeMenu = 'tasks'">
          <i class="fas fa-tasks"></i> Feladatok
        </li>
        <li :class="{ active: activeMenu === 'settings' }" @click="activeMenu = 'settings'">
          <i class="fas fa-cog"></i> Beállítások
        </li>
      </ul>
    </aside>

    <main class="content">
      <header class="topbar">
        <h1>{{ pageTitle }}</h1>
        <router-link to="/home"><button class="logout-btn">Vissza</button></router-link>
      </header>

      <section v-if="activeMenu === 'dashboard'" class="cards">
        <div class="card">
          <h3>Felhasználók</h3>
          <p>{{ stats.users }}</p>
        </div>
        <div class="card">
          <h3>Feladatok</h3>
          <p>{{ stats.tasks }}</p>
        </div>
        <div class="card">
          <h3>Aktív ma</h3>
          <p>{{ stats.activeToday }}</p>
        </div>
      </section>

      <section v-if="activeMenu === 'users'">
        <table>
          <thead>
            <tr>
              <th>Név</th>
              <th>Email</th>
              <th>Szerep</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.role }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section v-if="activeMenu === 'tasks'">
        <ul class="task-list">
          <li v-for="task in tasks" :key="task.id">
            {{ task.title }}
          </li>
        </ul>
      </section>

      <section v-if="activeMenu === 'settings'">
        <p>Admin beállítások hamarosan…</p>
      </section>
    </main>
  </div>
</template>

<script>
export default {
  name: 'AdminPage',
  data() {
    return {
      activeMenu: 'dashboard',
      stats: {
        users: 12,
        tasks: 34,
        activeToday: 5
      },
      users: [
        { id: 1, name: 'Teszt Diák', email: 'diak@test.hu', role: 'Diák' },
        { id: 2, name: 'Teszt Tanár', email: 'tanar@test.hu', role: 'Tanár' }
      ],
      tasks: [
        { id: 1, title: 'HTML alapok' },
        { id: 2, title: 'CSS layout' }
      ]
    };
  },
  computed: {
    pageTitle() {
      const titles = {
        dashboard: 'Admin Dashboard',
        users: 'Felhasználók kezelése',
        tasks: 'Feladatok',
        settings: 'Beállítások'
      };
      return titles[this.activeMenu];
    }
  }
};
</script>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css");

.admin-wrapper {
  display: flex;
  min-height: 100vh;
  background: #0f172a;
  color: #e5e7eb;
}

.sidebar {
  width: 240px;
  background: #020617;
  padding: 20px;
}

.logo {
  color: #38bdf8;
  margin-bottom: 30px;
}

.logo span {
  color: white;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  padding: 12px;
  cursor: pointer;
  border-radius: 8px;
  margin-bottom: 8px;
}

.sidebar li:hover,
.sidebar li.active {
  background: #1e293b;
}

.content {
  flex: 1;
  padding: 30px;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.logout-btn {
  background: #ef4444;
  border: none;
  padding: 8px 14px;
  color: white;
  border-radius: 6px;
  cursor: pointer;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
}

.card {
  background: #020617;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: #020617;
  border-radius: 10px;
  overflow: hidden;
}

th, td {
  padding: 12px;
  border-bottom: 1px solid #1e293b;
}

th {
  background: #020617;
}

.task-list {
  background: #020617;
  padding: 20px;
  border-radius: 10px;
}
</style>
