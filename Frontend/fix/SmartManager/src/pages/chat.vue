<template>
  <div class="dashboard-wrapper">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="logo">
        <h2>Smart<span>Manager</span></h2>
        <p v-if="userProfile.szerep_tipus === 'tanar'">Tanári Portál</p>
        <p v-else>Diák Portál</p>
      </div>

      <!-- Tanár navigáció -->
      <ul v-if="userProfile.szerep_tipus === 'tanar'" class="nav-links">
        <router-link to="/tanar"><li><i class="fas fa-home"></i> Áttekintés</li></router-link>
        <router-link to="/Ttask"><li><i class="fas fa-tasks"></i> Feladatok</li></router-link>
        <router-link to="/ertekeles"><li><i class="fas fa-check-circle"></i> Értékelés</li></router-link>
        <router-link to="/chat" class="active"><li><i class="fas fa-comments"></i> Üzenetek</li></router-link>
        <router-link to="/settings" ><li ><i class="fas fa-cog"></i> Beállítások</li></router-link>
      </ul>

      <!-- Diák navigáció -->
      <ul v-else class="nav-links">
        <router-link to="/diak"><li><i class="fas fa-home"></i> Áttekintés</li></router-link>
        <router-link to="/task"><li><i class="fas fa-tasks"></i> Feladatok</li></router-link>
        <router-link to="/teamwork"><li><i class="fas fa-users"></i> Csapatmunka</li></router-link>
        <router-link to="/chat" class="active"><li><i class="fas fa-comments"></i> Üzenetek</li></router-link>
        <router-link to="/settings" ><li><i class="fas fa-cog"></i> Beállítások</li></router-link>
      </ul>
    </aside>

    <!-- Main content -->
    <main class="main-content">
      <!-- Header -->
    <header>
      <div class="header-left">
        <h1>Üzenetek</h1>
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

      <!-- Chat Section -->
      <section class="section">
        <div class="section-header">
          <h3><i class="fas fa-comments"></i> Kommunikáció</h3>
          <a href="#">Chat előzmények</a>
        </div>
        <div class="chat-container">
          <div class="chat-sidebar">
            <h4>Beszélgetések</h4>
            <ul class="chat-list">
              <li 
                v-for="chat in chats" 
                :key="chat.id"
                :class="['chat-item', { active: activeChat === chat.id }]"
                @click="selectChat(chat.id)"
              >
                {{ chat.name }}
              </li>
            </ul>
          </div>
          <div class="chat-main">
            <div class="chat-header">
              <h4>{{ activeChatData.name }}</h4>
              <p>{{ activeChatData.participants }} résztvevő</p>
            </div>
            <div class="chat-messages" ref="messagesContainer">
              <div 
                v-for="message in activeChatData.messages" 
                :key="message.id"
                :class="['message', message.type]"
              >
                <strong>{{ message.sender }}:</strong> {{ message.text }}
              </div>
            </div>
            <div class="chat-input">
              <input 
                type="text" 
                placeholder="Írj üzenetet..." 
                v-model="newMessage"
                @keyup.enter="sendMessage"
              >
              <button @click="sendMessage"><i class="fas fa-paper-plane"></i></button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, nextTick, } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: "Chat",
  data() {
    return {
      navActive: false,
      userProfile: {
        teljes_nev: '',
        felhasznalonev: '',
        szerep_tipus: 'diak',
        initials: ''
      }
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
        navigateToTanarStatistics() {
      this.$router.push('/tanar').then(() => {
        this.$nextTick(() => {
          const element = document.getElementById('statPeriod');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });
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
  },
  setup() {
    // Chat data
    const activeChat = ref(1)
    const newMessage = ref('')
    const messagesContainer = ref(null)

    const chats = reactive([
      {
        id: 1,
        name: 'Webfejlesztés csapat',
        participants: 3,
        messages: [
          { id: 1, sender: 'Bence', text: 'Sziasztok! A frontend komponensek készen vannak.', type: 'received' },
          { id: 2, sender: 'Te', text: 'Nagyon király! Én holnap kezdem a backend-et.', type: 'sent' },
          { id: 3, sender: 'Kata', text: 'Az adatbázis design-t ma este befejezem.', type: 'received' }
        ]
      },
      {
        id: 2,
        name: 'Design csoport',
        participants: 4,
        messages: [
          { id: 1, sender: 'Eszter', text: 'Az új design koncepció kész.', type: 'received' },
          { id: 2, sender: 'Te', text: 'Nagyon tetszik! Mikor mutatjuk be?', type: 'sent' }
        ]
      },
      {
        id: 3,
        name: 'Fő projekt',
        participants: 5,
        messages: [
          { id: 1, sender: 'Bálint', text: 'A projekt határidő március 15.', type: 'received' }
        ]
      },
      {
        id: 4,
        name: 'Tanár - Kovács Anna',
        participants: 2,
        messages: [
          { id: 1, sender: 'Kovács Anna', text: 'Kérlek küldd el a házi feladatot holnapig.', type: 'received' },
          { id: 2, sender: 'Te', text: 'Rendben, holnap reggelre elkészül.', type: 'sent' }
        ]
      }
    ])

    // Computed properties
    const activeChatData = computed(() => {
      return chats.find(chat => chat.id === activeChat.value) || chats[0]
    })

    // Methods
    const selectChat = (chatId) => {
      activeChat.value = chatId
      scrollToBottom()
    }

    const sendMessage = () => {
      if (newMessage.value.trim() === '') return
      
      const activeChatObj = chats.find(chat => chat.id === activeChat.value)
      if (activeChatObj) {
        activeChatObj.messages.push({
          id: activeChatObj.messages.length + 1,
          sender: 'Te',
          text: newMessage.value,
          type: 'sent'
        })
        newMessage.value = ''
        
        // Auto-reply after 1 second
        setTimeout(() => {
          const replies = [
            'Érdekes ötlet!',
            'Egyetértek veled.',
            'Holnap beszéljük meg részletesebben.',
            'Köszi az infót!',
            'Jól hangzik!'
          ]
          const randomReply = replies[Math.floor(Math.random() * replies.length)]
          
          activeChatObj.messages.push({
            id: activeChatObj.messages.length + 1,
            sender: activeChatObj.name.split(' ')[0],
            text: randomReply,
            type: 'received'
          })
          scrollToBottom()
        }, 1000)
        
        scrollToBottom()
      }
    }

    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
    }

    // Lifecycle
    onMounted(() => {
      scrollToBottom()
    })

    return {
      chats,
      activeChat,
      activeChatData,
      newMessage,
      messagesContainer,
      selectChat,
      sendMessage
    }
  }
}
</script>

<style scoped>
.dashboard-wrapper {
  min-height: 100vh;
  background-color: #f5f7fb;
}

/* Chat Section Styles */
.section {
  flex: 1;
  margin: 0;
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background-color: #4a6ee0;
  color: white;
}

.section-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
}

.section-header a {
  color: white;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.section-header a:hover {
  text-decoration: underline;
  transform: translateY(-2px);
}

.chat-container {
  display: flex;
  flex: 1;
  height: 500px;
}

.chat-sidebar {
  width: 30%;
  background-color: #f5f7fb;
  border-right: 1px solid #e1e5eb;
  padding: 20px;
  overflow-y: auto;
}

.chat-sidebar h4 {
  color: #4a5568;
  margin-bottom: 15px;
  font-size: 1.1rem;
  font-weight: 600;
}

.chat-list {
  list-style: none;
}

.chat-item {
  padding: 12px 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #4a5568;
}

.chat-item:hover {
  background-color: #e2e8f0;
}

.chat-item.active {
  background-color: #4a6ee0;
  color: white;
}

.chat-main {
  width: 70%;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 20px 25px;
  border-bottom: 1px solid #e1e5eb;
  background-color: #f8fafc;
}

.chat-header h4 {
  font-size: 1.2rem;
  color: #2d3748;
  margin-bottom: 5px;
}

.chat-header p {
  color: #718096;
  font-size: 0.9rem;
}

.chat-messages {
  flex: 1;
  padding: 20px 25px;
  overflow-y: auto;
  background-color: #f8fafc;
}

.message {
  max-width: 75%;
  padding: 12px 18px;
  margin-bottom: 15px;
  border-radius: 18px;
  line-height: 1.4;
  position: relative;
}

.message.received {
  background-color: white;
  border-top-left-radius: 5px;
  color: #2d3748;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.message.sent {
  background-color: #4a6ee0;
  color: white;
  border-top-right-radius: 5px;
  margin-left: auto;
  box-shadow: 0 2px 5px rgba(74, 110, 224, 0.3);
}

.message strong {
  display: block;
  margin-bottom: 5px;
  font-size: 0.85rem;
}

.chat-input {
  display: flex;
  padding: 20px 25px;
  border-top: 1px solid #e1e5eb;
  background-color: white;
}

.chat-input input {
  flex: 1;
  padding: 12px 18px;
  border: 1px solid #e1e5eb;
  border-radius: 25px;
  outline: none;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.chat-input input:focus {
  border-color: #4a6ee0;
  box-shadow: 0 0 0 2px rgba(74, 110, 224, 0.2);
}

.chat-input button {
  background-color: #4a6ee0;
  color: white;
  border: none;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  margin-left: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chat-input button:hover {
  background-color: #3a5ecf;
  transform: scale(1.05);
}

/* Reszponzív design */
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

  .section {
    padding: 1rem;
  }

  .chat-container {
    flex-direction: column;
    height: 500px;
  }

  .chat-sidebar {
    width: 100%;
    max-height: 150px;
    border-right: none;
    border-bottom: 1px solid #e1e5eb;
    overflow-y: auto;
  }

  .chat-main {
    width: 100%;
    flex: 1;
  }

  .message {
    max-width: 85%;
    padding: 0.75rem;
    font-size: 0.95rem;
  }

  .chat-messages {
    height: 300px;
  }

  .chat-input input {
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
  }

  .chat-input button {
    width: 40px;
    height: 40px;
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

  .section-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .section-header h3 {
    font-size: 1.1rem;
  }

  .chat-container {
    height: 400px;
  }

  .chat-sidebar {
    max-height: 100px;
  }

  .chat-list {
    gap: 0.5rem;
  }

  .chat-item {
    padding: 0.5rem;
    font-size: 0.9rem;
  }

  .chat-header h4 {
    font-size: 1rem;
  }

  .message {
    max-width: 90%;
    padding: 0.65rem;
    font-size: 0.85rem;
  }

  .chat-messages {
    height: 200px;
  }

  .chat-input {
    padding: 0.75rem;
    gap: 0.5rem;
  }

  .chat-input input {
    padding: 0.65rem;
    font-size: 16px;
    border-radius: 20px;
  }

  .chat-input button {
    width: 36px;
    height: 36px;
    margin-left: 0.5rem;
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

  .section {
    padding: 0.75rem;
  }

  .section-header h3 {
    font-size: 1rem;
  }

  .chat-container {
    height: 300px;
  }

  .chat-sidebar {
    max-height: 80px;
  }

  .chat-header h4 {
    font-size: 0.95rem;
  }

  .chat-messages {
    height: 150px;
    font-size: 0.8rem;
  }

  .message {
    max-width: 95%;
    padding: 0.5rem;
    font-size: 0.8rem;
  }

  .chat-input input {
    padding: 0.6rem;
    font-size: 14px;
  }

  .chat-input button {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
  }
}
</style>