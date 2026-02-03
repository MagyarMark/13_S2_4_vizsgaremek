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
        <router-link to="/task" class="active"><li><i class="fas fa-tasks"></i> Feladatok</li></router-link>
        <router-link to="/teamwork"><li><i class="fas fa-users"></i> Csapatmunka</li></router-link>
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

        <main class="task-dashboard">
            <section class="task-section">
                <div class="section-header">
                    <h2 class="section-title">Aktív feladatok</h2>
                    <button class="btn btn-primary" id="addTaskBtn">
                        <i class="fas fa-plus"></i> Új feladat
                    </button>
                </div>

                <ul class="task-list" id="taskList">
                </ul>
            </section>

            <aside>
                <section class="task-section">
                    <div class="section-header">
                        <h2 class="section-title">Áttekintés</h2>
                    </div>

                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value">{{ stats.aktiv }}</div>
                            <div class="stat-label">Aktív feladat</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">{{ stats.befejezett }}</div>
                            <div class="stat-label">Befejezett</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">{{ stats.kozelgo }}</div>
                            <div class="stat-label">Közelgő</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">{{ stats.kesesben }}</div>
                            <div class="stat-label">Késésben</div>
                        </div>
                    </div>
                </section>
            </aside>
        </main>
    </div>

    <div class="modal" id="taskModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title" id="modalTitle">Új feladat hozzáadása</h3>
                <button class="close-modal" id="closeModal">&times;</button>
            </div>

            <form id="taskForm">
                <input type="hidden" id="taskId">

                <div class="form-group">
                    <label for="taskTitle">Feladat címe</label>
                    <input type="text" id="taskTitle" class="form-control" required>
                </div>

                <div class="form-group">
                    <label for="taskDescription">Leírás</label>
                    <textarea id="taskDescription" class="form-control" rows="3"></textarea>
                </div>

                <div class="form-row">

                    <div class="form-group">
                        <label for="taskPriority">Prioritás</label>
                        <select id="taskPriority" class="form-control" required>
                            <option value="">Válassz prioritást</option>
                            <option value="low">Alacsony</option>
                            <option value="medium">Közepes</option>
                            <option value="high">Magas</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label for="taskDeadline">Határidő</label>
                    <input type="date" id="taskDeadline" class="form-control" required>
                </div>

                <div class="form-actions"
                    style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                    <button type="button" class="btn btn-outline" id="cancelBtn">Mégse</button>
                    <button type="submit" class="btn btn-primary">Mentés</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: "Task",
  
  setup() {
    const router = useRouter()
    
    const navActive = ref(false)
    const userProfile = ref({
      teljes_nev: '',
      felhasznalonev: '',
      szerep_tipus: 'diak',
      initials: ''
    })
    const tasks = ref([])
    const stats = ref({
      aktiv: 0,
      befejezett: 0,
      kozelgo: 0,
      kesesben: 0
    })

    let taskListEl = null
    let taskModalEl = null
    let taskFormEl = null
    let modalTitleEl = null
    let taskIdEl = null
    let taskTitleEl = null
    let taskDescriptionEl = null
    let taskPriorityEl = null
    let taskDeadlineEl = null
    let addTaskBtnEl = null
    let closeModalEl = null
    let cancelBtnEl = null

    function generateInitials(name) {
      if (!name) return ''
      const parts = name.split(' ')
      return parts.map(part => part.charAt(0).toUpperCase()).join('').substring(0, 2)
    }

    function getPriorityText(priority) {
      switch (priority) {
        case 'high': return 'Magas'
        case 'medium': return 'Közepes'
        case 'low': return 'Alacsony'
        default: return ''
      }
    }

    function formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' }
      return new Date(dateString).toLocaleDateString('hu-HU', options)
    }

    function calculateDaysUntilDeadline(deadline) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const deadlineDate = new Date(deadline)
      deadlineDate.setHours(0, 0, 0, 0)
      const diffTime = deadlineDate.getTime() - today.getTime()
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    function calculateStats() {
      let aktiv = 0
      let befejezett = 0
      let kozelgo = 0
      let kesesben = 0

      tasks.value.forEach(task => {
        const daysUntil = calculateDaysUntilDeadline(task.deadline)

        if (task.completed) {
          befejezett++
        } else if (daysUntil < 0) {
          kesesben++
        } else if (daysUntil <= 2 && daysUntil >= 0) {
          kozelgo++
        } else {
          aktiv++
        }
      })

      stats.value = {
        aktiv,
        befejezett,
        kozelgo,
        kesesben
      }
    }

    function mapPriorityToFrontend(backendPriority) {
      const priorityMap = {
        'alacsony': 'low',
        'közepes': 'medium',
        'magas': 'high'
      }
      return priorityMap[backendPriority] || 'medium'
    }

    function mapPriorityToBackend(frontendPriority) {
      const priorityMap = {
        'low': 'alacsony',
        'medium': 'közepes',
        'high': 'magas'
      }
      return priorityMap[frontendPriority] || 'közepes'
    }

    function renderTasks() {
      if (!taskListEl) return
      taskListEl.innerHTML = ''

      if (tasks.value.length === 0) {
        taskListEl.innerHTML = '<p style="text-align: center; padding: 20px; color: #6c757d;">Nincsenek feladatok</p>'
        return
      }

      tasks.value.forEach(task => {
        const taskItem = document.createElement('li')
        taskItem.className = `task-item priority-${task.priority}`

        const daysUntilDeadline = calculateDaysUntilDeadline(task.deadline)
        const deadlineClass = daysUntilDeadline < 0 ? 'text-danger' :
          daysUntilDeadline <= 2 ? 'text-warning' : ''

        taskItem.innerHTML = `
          <div class="task-header">
            <div class="task-title">${task.title}</div>
            <div class="task-priority priority-${task.priority}">
              ${getPriorityText(task.priority)}
            </div>
          </div>
          <div class="task-description">${task.description}</div>
          <div class="task-meta">
            <span class="task-subject">${task.subject}</span>
            <div class="task-deadline ${deadlineClass}">
              <i class="far fa-calendar-alt"></i>
              ${formatDate(task.deadline)}
              ${daysUntilDeadline < 0 ? '(Lejárt)' :
                daysUntilDeadline === 0 ? '(Ma)' :
                daysUntilDeadline === 1 ? '(1 nap)' :
                `(${daysUntilDeadline} nap)`}
            </div>
          </div>
          <div class="task-actions">
            <button class="complete-btn" data-id="${task.id}">
              <i class="far ${task.completed ? 'fa-check-square' : 'fa-square'}"></i>
            </button>
          </div>
        `
        taskListEl.appendChild(taskItem)
      })

      taskListEl.querySelectorAll('.complete-btn').forEach(btn => {
        btn.addEventListener('click', toggleTaskCompletion)
      })
      taskListEl.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', openEditTaskModal)
      })
      taskListEl.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', deleteTask)
      })
    }

    function openAddTaskModal() {
      if (!modalTitleEl || !taskFormEl || !taskIdEl) return
      modalTitleEl.textContent = 'Új feladat hozzáadása'
      taskFormEl.reset()
      taskIdEl.value = ''
      taskModalEl.classList.add('active')
    }

    function openEditTaskModal(e) {
      const taskIdValue = e.currentTarget.getAttribute('data-id')
      const task = tasks.value.find(t => t.id == taskIdValue)

      if (task) {
        modalTitleEl.textContent = 'Feladat szerkesztése'
        taskIdEl.value = task.id
        taskTitleEl.value = task.title
        taskDescriptionEl.value = task.description
        taskPriorityEl.value = task.priority
        taskDeadlineEl.value = task.deadline
        taskModalEl.classList.add('active')
      }
    }

    function closeTaskModal() {
      if (!taskModalEl) return
      taskModalEl.classList.remove('active')
    }

    async function fetchUserProfile() {
      try {
        const storedUser = localStorage.getItem('user')
        const token = localStorage.getItem('accessToken')
        
        if (!storedUser || !token) {
          router.push('/login')
          return
        }

        const response = await fetch(`http://localhost:3000/api/auth/profileData`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Felhasználó adatainak lekérése sikertelen')
        }

        const data = await response.json()
        
        if (data.success && data.data && data.data.user) {
          const user = data.data.user
          userProfile.value = {
            teljes_nev: user.teljes_nev || user.felhasznalonev,
            felhasznalonev: user.felhasznalonev,
            szerep_tipus: user.szerep_tipus,
            email: user.email,
            id: user.id,
            initials: generateInitials(user.teljes_nev || user.felhasznalonev)
          }
        }
      } catch (error) {
        console.error('Felhasználó adatainak lekérése sikertelen:', error)
      }
    }

    async function refreshTasksList() {
      try {
        const token = localStorage.getItem('accessToken')
        if (!token) {
          return
        }

        const response = await fetch('http://localhost:3000/api/project/feladatok', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Hiba a feladatok lekérése során')
        }

        const data = await response.json()
        if (data.success && data.data && data.data.tasks) {

          const filteredTasks = data.data.tasks.filter(task => 
            task.statusz !== 'beadva' && task.statusz !== 'elvégezve'
          )
          
          tasks.value = filteredTasks.map(task => ({
            id: task.id,
            felelos_id: task.felelos_id,
            title: task.feladat_nev,
            description: task.feladat_leiras || '',
            subject: 'Általános',
            priority: mapPriorityToFrontend(task.prioritas),
            deadline: task.hatarido,
            completed: task.statusz === 'elvégezve'
          }))
          tasks.value.sort((a, b) => {
            const deadlineA = new Date(a.deadline)
            const deadlineB = new Date(b.deadline)
            return deadlineA - deadlineB
          })
          renderTasks()
          calculateStats()
        }
      } catch (error) {
        console.error('Hiba a feladatok lekérése során:', error)
      }
    }

    async function saveTask(e) {
      e.preventDefault()
      
      const title = taskTitleEl.value.trim()
      const description = taskDescriptionEl.value.trim()
      const priority = taskPriorityEl.value
      const deadline = taskDeadlineEl.value

      if (!title) {
        alert('Kérjük add meg a feladat címét!')
        return
      }
      if (!priority) {
        alert('Kérjük válassz prioritást!')
        return
      }
      if (!deadline) {
        alert('Kérjük add meg a határidőt!')
        return
      }

      try {
        const token = localStorage.getItem('accessToken')
        if (!token) {
          alert('Nincs bejelentkezett felhasználó')
          return
        }

        const taskData = {
          feladat_nev: title,
          feladat_leiras: description || '',
          prioritas: mapPriorityToBackend(priority),
          statusz: 'folyamatban',
          felelos_id: userProfile.value.id,
          hatarido: deadline
        }

        console.log('Sending task data:', taskData)

        const response = await fetch('http://localhost:3000/api/project/ujFeladat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(taskData)
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || `Hiba: ${response.status}`)
        }

        if (result.success) {
          taskFormEl.reset()
          closeTaskModal()
          await refreshTasksList()
          if (result.data && result.data.task) {
            const taskId = result.data.task.id
           }
        } else {
          throw new Error(result.message || 'Ismeretlen hiba')
        }
      } catch (error) {
        console.error('Hiba a feladat mentése során:', error)
        alert('Hiba: ' + error.message)
      }
    }

    function toggleTaskCompletion(e) {
      const id = e.currentTarget.getAttribute('data-id')
      const task = tasks.value.find(t => t.id == id)
      if (task) {
        if (confirm('Biztos befejezed a feladatot?')) {
          completeTask(id)
        }
      }
    }

    async function completeTask(taskId) {
      try {
        const token = localStorage.getItem('accessToken')
        if (!token) {
          alert('Nincs bejelentkezett felhasználó')
          return
        }

        const response = await fetch(`http://localhost:3000/api/project/feladat/${taskId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            statusz: 'beadva'
          })
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || `Hiba: ${response.status}`)
        }

        if (result.success) {
          await refreshTasksList()
          alert('Feladat sikeresen beadva!')
        } else {
          throw new Error(result.message || 'Ismeretlen hiba')
        }
      } catch (error) {
        console.error('Hiba a feladat beadása során:', error)
        alert('Hiba: ' + error.message)
      }
    }

    function deleteTask(e) {
      const id = e.currentTarget.getAttribute('data-id')
      if (confirm('Biztosan törölni szeretnéd ezt a feladatot?')) {
        tasks.value = tasks.value.filter(t => t.id != id)
        renderTasks()
        }
        /*
        const id = e.currentTarget.getAttribute('data-id')
      if (confirm('Biztosan törölni szeretnéd ezt a feladatot?')) {
        try {
          const token = localStorage.getItem('accessToken')
          if (!token) {
            alert('Nincs bejelentkezett felhasználó')
            return
          }

          const response = await fetch(`http://localhost:3000/api/auth/torlesFeladat/${id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          })

          const result = await response.json()

          if (!response.ok) {
            throw new Error(result.message || `Hiba: ${response.status}`)
          }

          if (result.success) {
            tasks.value = tasks.value.filter(t => t.id != id)
            renderTasks()
          } else {
            throw new Error(result.message || 'Ismeretlen hiba')
          }
        } catch (error) {
          console.error('Hiba a feladat törlése során:', error)
          alert('Hiba: ' + error.message)
        }
      }*/
    }

    function toggleMenu() {
      navActive.value = !navActive.value
    }

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

    const getRoleLabel = (role) => {
      const roleMap = {
        'diak': 'Diák',
        'tanar': 'Tanár',
        'admin': 'Adminisztrátor'
      }
      return roleMap[role] || role
    }

    onMounted(() => {
      taskListEl = document.getElementById('taskList')
      taskModalEl = document.getElementById('taskModal')
      taskFormEl = document.getElementById('taskForm')
      modalTitleEl = document.getElementById('modalTitle')
      taskIdEl = document.getElementById('taskId')
      taskTitleEl = document.getElementById('taskTitle')
      taskDescriptionEl = document.getElementById('taskDescription')
      taskPriorityEl = document.getElementById('taskPriority')
      taskDeadlineEl = document.getElementById('taskDeadline')
      addTaskBtnEl = document.getElementById('addTaskBtn')
      closeModalEl = document.getElementById('closeModal')
      cancelBtnEl = document.getElementById('cancelBtn')

      if (addTaskBtnEl) addTaskBtnEl.addEventListener('click', openAddTaskModal)
      if (closeModalEl) closeModalEl.addEventListener('click', closeTaskModal)
      if (cancelBtnEl) cancelBtnEl.addEventListener('click', closeTaskModal)
      if (taskFormEl) taskFormEl.addEventListener('submit', saveTask)

      fetchUserProfile()
      refreshTasksList()
    })

    onBeforeUnmount(() => {
      if (addTaskBtnEl) addTaskBtnEl.removeEventListener('click', openAddTaskModal)
      if (closeModalEl) closeModalEl.removeEventListener('click', closeTaskModal)
      if (cancelBtnEl) cancelBtnEl.removeEventListener('click', closeTaskModal)
      if (taskFormEl) taskFormEl.removeEventListener('submit', saveTask)
    })

    return {
      navActive,
      userProfile,
      tasks,
      stats,
      toggleMenu,
      logout,
      getRoleLabel
    }
  }
}
</script>
<style>
        .task-dashboard {
            display: grid;
            grid-template-columns: 2fr 2fr;
            gap: 20px;
        }

        .task-section {
            background-color: var(--card-bg);
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            padding: 20px;
        }

        .task-section span{
            color: var(--primary);
            padding: 5px 10px;

        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--border);
        }

        .section-title {
            font-size: 1.3rem;
            color: var(--primary);
        }

        .btn {
            padding: 8px 15px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s;
        }

        .btn-primary {
            background-color: var(--primary);
            color: white;
        }

        .btn-primary:hover {
            background-color: var(--secondary);
        }

        .btn-success {
            background-color: var(--success);
            color: white;
        }

        .btn-outline {
            background-color: transparent;
            border: 1px solid var(--primary);
            color: var(--primary);
        }

        .btn-outline:hover {
            background-color: var(--primary);
            color: white;
        }

        .task-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .task-item {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 10px;
            background-color: var(--light);
            border-left: 4px solid var(--primary);
            transition: all 0.3s;
        }

        .task-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .task-item.priority-high {
          border-left-color: var(--warning);
          background-color: #fff0f5;
        }

        .task-item.priority-medium {
          border-left-color: orange;
          background-color: #fff9e6;
        }

        .task-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
        }

        .task-title {
            font-weight: bold;
            font-size: 1.1rem;
        }

        .task-priority {
            padding: 3px 8px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: bold;
        }

        .priority-high {
            background-color: rgba(247, 37, 133, 0.1);
            color: var(--warning);
        }

        .priority-medium {
            background-color: rgba(255, 165, 0, 0.1);
            color: orange;
        }

        .priority-low {
            background-color: rgba(76, 201, 240, 0.1);
            color: var(--success);
        }

        .task-description {
            color: #6c757d;
            margin-bottom: 10px;
            font-size: 0.9rem;
        }

        .task-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.8rem;
            color: #6c757d;
        }

        .task-subject {
            display: inline-block;
            padding: 3px 8px;
            background-color: rgba(67, 97, 238, 0.1);
            color: var(--primary);
            border-radius: 4px;
        }

        .task-deadline {
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .task-actions {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }

        .task-actions button {
            background: none;
            border: none;
            cursor: pointer;
            color: #6c757d;
            transition: color 0.3s;
        }

        .task-actions button:hover {
            color: var(--primary);
        }

        .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }

        .stat-card {
            background-color: var(--light);
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }

        .stat-value {
            font-size: 1.8rem;
            font-weight: bold;
            color: var(--primary);
            margin-bottom: 5px;
        }

        .stat-label {
            font-size: 0.8rem;
            color: #6c757d;
        }

        .progress-item {
            margin-bottom: 15px;
        }

        .progress-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }

        .progress-bar {
            height: 8px;
            background-color: #e9ecef;
            border-radius: 4px;
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            background-color: var(--primary);
            border-radius: 4px;
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
        #taskTitle{
          color: var(--primary);
        }

        #taskDescription{
          color: var(--primary);
        }

        #taskDeadline{
          color: var(--primary);
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

        .form-group {
            margin-bottom: 15px;
        }

        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
        }

        .form-control {
            width: 100%;
            padding: 10px;
            border: 1px solid var(--border);
            border-radius: 5px;
            font-size: 1rem;
        }

        .form-control:focus {
            outline: none;
            border-color: var(--primary);
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }

        @media (max-width: 992px) {
            .task-dashboard {
                grid-template-columns: 1fr;
            }

            .sidebar {
                width: 70px;
                overflow: hidden;
            }

            .logo h2,
            .logo p,
            .nav-links span {
                display: none;
            }

            .nav-links a {
                text-align: center;
                padding: 15px 0;
            }

            .nav-links i {
                margin-right: 0;
                font-size: 1.2rem;
            }

            .dashboard-wrapper {
                margin-left: 70px;
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
                margin-left: 0;
                padding: 1rem;
                margin-top: 60px;
            }

            .task-dashboard {
                grid-template-columns: 1fr;
                gap: 1rem;
            }

            .task-dashboard > aside {
                width: 100%;
            }

            .task-section {
                padding: 1rem;
            }

            .section-header {
                flex-direction: column;
                gap: 0.5rem;
            }

            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 0.75rem;
            }

            .stat-card {
                padding: 0.75rem;
            }
        }

        @media (max-width: 600px) {
            header {
                padding: 0 1rem;
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
                font-size: 0.8rem;
            }

            .page-title {
                flex-direction: column;
                gap: 0.5rem;
            }

            .page-title h2 {
                font-size: 1.3rem;
            }

            .btn {
                padding: 0.6rem 1rem;
                font-size: 0.9rem;
            }

            .task-list {
                gap: 0.75rem;
            }

            .task-item {
                padding: 0.75rem;
            }

            .task-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.5rem;
            }

            .task-meta {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.25rem;
            }

            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 0.5rem;
            }

            .stat-card {
                padding: 0.5rem;
            }

            .stat-value {
                font-size: 1.5rem;
            }

            .stat-label {
                font-size: 0.75rem;
            }

            .progress-item {
                margin-bottom: 0.75rem;
            }

            .form-row {
                grid-template-columns: 1fr;
            }

            .form-control {
                padding: 0.75rem;
                font-size: 1rem;
            }

            .modal-content {
                width: 100%;
                max-width: none;
                padding: 1rem;
                border-radius: 0;
            }
        }

        @media (max-width: 400px) {
            header {
                padding: 0 0.75rem;
            }

            main {
                padding: 0.5rem;
            }

            .header-left h1 {
                font-size: 1rem;
            }

            .page-title h2 {
                font-size: 1.2rem;
            }

            .btn {
                padding: 0.5rem 0.8rem;
                font-size: 0.85rem;
                width: 100%;
            }

            .task-item {
                padding: 0.5rem;
            }

            .section-title {
                font-size: 1rem;
            }

            .stats-grid {
                grid-template-columns: 1fr;
            }

            .task-meta {
                flex-direction: column;
            }

            .form-control {
                padding: 0.65rem;
                font-size: 16px;
            }
        }
</style>