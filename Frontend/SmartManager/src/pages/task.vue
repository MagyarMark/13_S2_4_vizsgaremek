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
        <router-link to="/task" class="active"><li><i class="fas fa-tasks"></i> Feladatok</li></router-link>
        <li><a href="#"><i class="fas fa-users"></i> Csapatmunka</a></li>
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
            <div class="user-name">{{ userProfile.name }}</div>
            <div class="user-role">{{ userProfile.role }}</div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
        <main class="task-dashboard">
            <!-- Task List Section -->
            <section class="task-section">
                <div class="section-header">
                    <h2 class="section-title">Aktív feladatok</h2>
                    <button class="btn btn-primary" id="addTaskBtn">
                        <i class="fas fa-plus"></i> Új feladat
                    </button>
                </div>

                <ul class="task-list" id="taskList">
                    <!-- Tasks will be dynamically added here -->
                </ul>
            </section>

            <!-- Sidebar Stats -->
            <aside>
                <!-- Stats Section -->
                <section class="task-section">
                    <div class="section-header">
                        <h2 class="section-title">Áttekintés</h2>
                    </div>

                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value">7</div>
                            <div class="stat-label">Aktív feladat</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">3</div>
                            <div class="stat-label">Befejezett</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">2</div>
                            <div class="stat-label">Közelgő</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">1</div>
                            <div class="stat-label">Késésben</div>
                        </div>
                    </div>
                </section>

                <!-- Progress Section -->
                <section class="task-section">
                    <div class="section-header">
                        <h2 class="section-title">Tantárgy szerint</h2>
                    </div>

                    <div class="progress-list">
                        <div class="progress-item">
                            <div class="progress-header">
                                <span>Adatbázis</span>
                                <span>75%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 75%"></div>
                            </div>
                        </div>

                        <div class="progress-item">
                            <div class="progress-header">
                                <span>Python</span>
                                <span>60%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 60%"></div>
                            </div>
                        </div>

                        <div class="progress-item">
                            <div class="progress-header">
                                <span>Scratch</span>
                                <span>40%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 40%"></div>
                            </div>
                        </div>

                        <div class="progress-item">
                            <div class="progress-header">
                                <span>Informatika</span>
                                <span>90%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 90%"></div>
                            </div>
                        </div>
                    </div>
                </section>
            </aside>
        </main>
    </div>

    <!-- Add Task Modal -->
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
                        <label for="taskSubject">Tantárgy</label>
                        <select id="taskSubject" class="form-control" required>
                            <option value="">Válassz tantárgyat</option>
                            <option value="Adatbázis">Adatbázis</option>
                            <option value="Python">Python</option>
                            <option value="Scratch">Scratch</option>
                            <option value="Informatika">Informatika</option>
                            <option value="Fizika">Fizika</option>
                            <option value="Kémia">Kémia</option>
                            <option value="Biológia">Biológia</option>
                        </select>
                    </div>

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
import { ref, onMounted, onBeforeUnmount } from 'vue'

export default {
  name: "Task",
  setup() {
    // Existing UI state
    const navActive = ref(false)
    const userProfile = ref({
      initials: 'DK',
      name: 'Diós Katalin',
      role: 'Diák'
    })

    const toggleMenu = () => {
      navActive.value = !navActive.value
    }

    // Reactive tasks list
    const tasks = ref([
      {
        id: 1,
        title: "Adatbázis feladat",
        description: "Készíts egy SQL lekérdezést, amely visszaadja az összes diák nevét és életkorát a diakok táblából.",
        subject: "Adatbázis",
        priority: "high",
        deadline: "2023-11-15",
        completed: false
      },
      {
        id: 2,
        title: "Python dolgozat",
        description: "Írj egy programot, amely megoldja a következő feladatot: Kérj be egy számot a felhasználótól, és írd ki, hogy az páros vagy páratlan.",
        subject: "Python",
        priority: "medium",
        deadline: "2023-11-20",
        completed: false
      },
      {
        id: 3,
        title: "Scratch prezentáció",
        description: "Készíts egy Scratch prezentációt. A téma szabadon választható, de legyen benne legalább 3 különböző jelenet és interakció.",
        subject: "Scratch",
        priority: "low",
        deadline: "2023-11-25",
        completed: false
      },
      {
        id: 4,
        title: "Programozási feladat",
        description: "Készíts egy egyszerű webalkalmazást HTML, CSS és JavaScript használatával.",
        subject: "Informatika",
        priority: "high",
        deadline: "2023-11-18",
        completed: false
      }
    ])

    //DOM elemek itt:
    let taskListEl = null
    let taskModalEl = null
    let taskFormEl = null
    let modalTitleEl = null
    let taskIdEl = null
    let taskTitleEl = null
    let taskDescriptionEl = null
    let taskSubjectEl = null
    let taskPriorityEl = null
    let taskDeadlineEl = null
    let addTaskBtnEl = null
    let closeModalEl = null
    let cancelBtnEl = null

    // Helper functions
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
            <button class="edit-btn" data-id="${task.id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="delete-btn" data-id="${task.id}">
              <i class="fas fa-trash"></i>
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
        taskSubjectEl.value = task.subject
        taskPriorityEl.value = task.priority
        taskDeadlineEl.value = task.deadline

        taskModalEl.classList.add('active')
      }
    }

    function closeTaskModal() {
      if (!taskModalEl) return
      taskModalEl.classList.remove('active')
    }

    function saveTask(e) {
      e.preventDefault()
      const id = taskIdEl.value ? parseInt(taskIdEl.value) : Date.now()
      const title = taskTitleEl.value
      const description = taskDescriptionEl.value
      const subject = taskSubjectEl.value
      const priority = taskPriorityEl.value
      const deadline = taskDeadlineEl.value

      if (taskIdEl.value) {
        const index = tasks.value.findIndex(t => t.id == taskIdEl.value)
        if (index !== -1) {
          tasks.value[index] = {
            ...tasks.value[index],
            title,
            description,
            subject,
            priority,
            deadline
          }
        }
      } else {
        tasks.value.push({
          id,
          title,
          description,
          subject,
          priority,
          deadline,
          completed: false
        })
      }

      renderTasks()
      closeTaskModal()
    }

    function toggleTaskCompletion(e) {
      const id = e.currentTarget.getAttribute('data-id')
      const task = tasks.value.find(t => t.id == id)
      if (task) {
        task.completed = !task.completed
        renderTasks()
      }
    }

    function deleteTask(e) {
      const id = e.currentTarget.getAttribute('data-id')
      if (confirm('Biztosan törölni szeretnéd ezt a feladatot?')) {
        tasks.value = tasks.value.filter(t => t.id != id)
        renderTasks()
      }
    }

    function init() {
      renderTasks()
    }

    onMounted(() => {
      taskListEl = document.getElementById('taskList')
      taskModalEl = document.getElementById('taskModal')
      taskFormEl = document.getElementById('taskForm')
      modalTitleEl = document.getElementById('modalTitle')
      taskIdEl = document.getElementById('taskId')
      taskTitleEl = document.getElementById('taskTitle')
      taskDescriptionEl = document.getElementById('taskDescription')
      taskSubjectEl = document.getElementById('taskSubject')
      taskPriorityEl = document.getElementById('taskPriority')
      taskDeadlineEl = document.getElementById('taskDeadline')
      addTaskBtnEl = document.getElementById('addTaskBtn')
      closeModalEl = document.getElementById('closeModal')
      cancelBtnEl = document.getElementById('cancelBtn')

      if (addTaskBtnEl) addTaskBtnEl.addEventListener('click', openAddTaskModal)
      if (closeModalEl) closeModalEl.addEventListener('click', closeTaskModal)
      if (cancelBtnEl) cancelBtnEl.addEventListener('click', closeTaskModal)
      if (taskFormEl) taskFormEl.addEventListener('submit', saveTask)

      init()
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
      toggleMenu
    }
  }
}
</script>

<style>

 /* .dashboard-wrapper {
  color: var(--text);
  padding: 80px;
  box-sizing: border-box;
  display: flex;
  }*/

        /* Task Dashboard Styles */
        .task-dashboard {
            display: grid;
            grid-template-columns: 2fr 1fr;
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

        /* Task List Styles */
        .task-list {
            list-style: none;
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
        }

        .task-item.priority-medium {
            border-left-color: orange;
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

        /* Stats Section */
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

        /* eredmeny mutato */
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

        /* task style */
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

        /* Responsive Design */
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

        @media (max-width: 576px) {
            .dashboard-wrapper {
                margin-left: 0;
                padding: 10px;
            }

            .sidebar {
                transform: translateX(-100%);
            }

            .sidebar.active {
                transform: translateX(0);
                width: 250px;
                z-index: 100;
            }

            .sidebar.active .logo h2,
            .sidebar.active .logo p,
            .sidebar.active .nav-links span {
                display: block;
            }

            .sidebar.active .nav-links a {
                text-align: left;
                padding: 15px 20px;
            }

            .sidebar.active .nav-links i {
                margin-right: 10px;
            }

            .header-left h1 {
                font-size: 1.4rem;
            }

            .task-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
            }

            .task-meta {
                flex-direction: column;
                align-items: flex-start;
                gap: 5px;
            }

            .form-row {
                grid-template-columns: 1fr;
            }
        }
</style>