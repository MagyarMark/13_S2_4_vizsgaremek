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
        <li><a href="#"><i class="fas fa-tasks"></i> Feladatok</a></li>
        <li><a href="#"><i class="fas fa-users"></i> Csapatmunka</a></li>
        <router-link to="/chat" class="active"><li><i class="fas fa-comments"></i> Üzenetek</li></router-link>
        <router-link to="/settings"><li><i class="fas fa-cog"></i> Beállítások</li></router-link>
      </ul>
    </aside>

    <!-- Main content -->
    <main class="main-content">
      <!-- Header -->
      <header class="page-header">
        <div class="header-left">
          <h1>Üzenetek</h1>
        </div>
        <div class="header-right">
          <div class="notifications">
            <button class="notifications-button" title="Értesítések"><i class="fas fa-bell"></i></button>
          </div>
          <div class="user-profile">
            <div class="avatar">{{ profile.initials }}</div>
            <div>
              <div class="user-name">{{ profile.fullName }}</div>
              <div class="user-role">{{ profile.role }}</div>
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
import { ref, reactive, computed, onMounted, nextTick } from 'vue'

export default {
  name: "Chat",
  setup() {
    // Profile data
    const profile = reactive({
      fullName: 'Diós Katalin',
      initials: 'DK',
      role: 'Diák'
    })

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
      profile,
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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.dashboard-wrapper {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fb;
}

/* Sidebar Styles */
.sidebar {
  width: 250px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  padding: 20px 0;
}

.logo {
  padding: 0 20px 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
}

.logo h2 {
  font-size: 1.5rem;
  margin-bottom: 5px;
}

.logo h2 span {
  color: #ffd700;
}

.logo p {
  font-size: 0.9rem;
  opacity: 0.8;
}

.nav-links {
  list-style: none;
}

.nav-links a {
  display: block;
  color: white;
  text-decoration: none;
  padding: 15px 20px;
  transition: all 0.3s ease;
}

.nav-links a:hover,
.nav-links a.active {
  background-color: rgba(255, 255, 255, 0.1);
  border-left: 4px solid #ffd700;
}

.nav-links i {
  margin-right: 10px;
  width: 20px;
  text-align: center;
}

/* Main Content Styles */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-left h1 {
  color: #2d3748;
  font-size: 1.8rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.notifications-button {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #4a5568;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.notifications-button:hover {
  background-color: #f7fafc;
  color: #4a6ee0;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  background-color: #4a6ee0;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.user-name {
  font-weight: 600;
  color: #2d3748;
}

.user-role {
  font-size: 0.8rem;
  color: #718096;
}

/* Chat Section Styles */
.section {
  flex: 1;
  margin: 20px;
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
@media (max-width: 768px) {
  .dashboard-wrapper {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
  }
  
  .chat-container {
    flex-direction: column;
    height: auto;
  }
  
  .chat-sidebar, .chat-main {
    width: 100%;
  }
  
  .chat-sidebar {
    max-height: 200px;
    border-right: none;
    border-bottom: 1px solid #e1e5eb;
  }
  
  .message {
    max-width: 85%;
  }
}
</style>