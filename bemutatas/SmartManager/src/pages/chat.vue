<template>
  <div class="dashboard-wrapper">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <aside class="sidebar">
      <div class="logo">
        <h2>Smart<span>Manager</span></h2>
        <p v-if="userProfile.szerep_tipus === 'tanar'">Tanári Portál</p>
        <p v-else>Diák Portál</p>
      </div>

      <ul v-if="userProfile.szerep_tipus === 'tanar'" class="nav-links">
        <router-link to="/tanar"><li><i class="fas fa-home"></i> Áttekintés</li></router-link>
        <router-link to="/Ttask"><li><i class="fas fa-tasks"></i> Feladatok</li></router-link>
        <router-link to="/ertekeles"><li><i class="fas fa-check-circle"></i> Értékelés</li></router-link>
        <router-link to="/chat" class="active"><li><i class="fas fa-comments"></i> Üzenetek</li></router-link>
        <router-link to="/settings" ><li ><i class="fas fa-cog"></i> Beállítások</li></router-link>
      </ul>

      <ul v-else class="nav-links">
        <router-link to="/diak"><li><i class="fas fa-home"></i> Áttekintés</li></router-link>
        <router-link to="/task"><li><i class="fas fa-tasks"></i> Feladatok</li></router-link>
        <router-link to="/teamwork"><li><i class="fas fa-users"></i> Projektmunka</li></router-link>
        <router-link to="/chat" class="active"><li><i class="fas fa-comments"></i> Üzenetek</li></router-link>
        <router-link to="/settings" ><li><i class="fas fa-cog"></i> Beállítások</li></router-link>
      </ul>
    </aside>

    <main class="main-content">
    <header>
      <div class="header-left">
        <h1>Üzenetek</h1>
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

      <section class="section">
        <div class="section-header">
          <h3><i class="fas fa-comments"></i> SMchat 💬</h3>
          <!--<span class="clients-total">Aktív felhasználók: {{ clientsTotal }}</span>-->
        </div>
        <div class="chat-container">
          <div class="chat-sidebar">
            <div class="name-section">
              <span><i class="far fa-user"></i></span>
              <input 
                type="text" 
                v-model="userName" 
                class="name-input" 
                maxlength="20"
                placeholder="Neved"
                disabled
              >
            </div>
            <h4>Szoba információk</h4>
            <div class="chat-info">
              <p><i class="fas fa-users"></i> {{ clientsTotal }} aktív felhasználó</p>
            </div>

            <div class="chat-mode-toggle">
              <button
                :class="['mode-button', { active: chatMode === 'direct' }]"
                @click="handleChatModeChange('direct')"
              >
                Egyéni
              </button>
              <button
                :class="['mode-button', { active: chatMode === 'project' }]"
                @click="handleChatModeChange('project')"
              >
                Projekt
              </button>
            </div>

            <template v-if="chatMode === 'direct'">
              <div class="new-conversation">
                <label>Új beszélgetés</label>
                <select v-model="selectedRecipientId" class="recipient-select">
                  <option disabled value="">Válassz felhasználót</option>
                  <option v-for="user in selectableUsers" :key="user.id" :value="user.id">
                    {{ user.teljes_nev || user.felhasznalonev || ('Felhasználó #' + user.id) }}
                  </option>
                </select>
                <button class="start-conversation" @click="startConversation">
                  Indítás
                </button>
              </div>

              <h4>Beszélgetések</h4>
              <div class="conversation-list">
                <div v-if="isLoadingConversations" class="conversation-status">Betöltés...</div>
                <div v-else-if="conversations.length === 0" class="conversation-status">Nincs beszélgetés.</div>
                <template v-else>
                  <button
                    v-for="conv in conversations"
                    :key="conv.userId"
                    :class="['conversation-item', { active: conv.userId === selectedConversationId }]"
                    @click="selectConversation(conv.userId)"
                  >
                    <div class="conversation-title">{{ conv.userName }}</div>
                    <div class="conversation-preview">{{ conv.lastMessage }}</div>
                    <div class="conversation-meta">{{ conv.lastTimeLabel }}</div>
                  </button>
                </template>
              </div>
            </template>

            <template v-else>
              <div class="project-select">
                <label>Projekt kiválasztása</label>
                <select v-model="selectedProjectId" class="recipient-select" @change="handleProjectChange">
                  <option disabled value="">Válassz projektet</option>
                  <option v-for="project in projects" :key="project.id" :value="project.id">
                    {{ project.projekt_nev || project.nev || ('Projekt #' + project.id) }}
                  </option>
                </select>
              </div>

              <h4>Projekt tagok</h4>
              <div class="conversation-list">
                <div v-if="isLoadingMembers" class="conversation-status">Tagok betöltése...</div>
                <div v-else-if="projectMembers.length === 0" class="conversation-status">Nincs tag.</div>
                <template v-else>
                  <div
                    v-for="member in projectMembers"
                    :key="member.id"
                    class="conversation-item"
                  >
                    <div class="conversation-title">
                      {{ member.teljes_nev || member.felhasznalonev || member.email || ('Felhasználó #' + member.id) }}
                    </div>
                    <div class="conversation-preview">{{ member.szerep_tipus }}</div>
                  </div>
                </template>
              </div>
            </template>
          </div>
          <div class="chat-main">
            <div class="chat-header">
              <template v-if="chatMode === 'direct'">
                <h4 v-if="selectedConversation">Beszélgetés: {{ selectedConversation.userName }}</h4>
                <h4 v-else>Válassz beszélgetést</h4>
              </template>
              <template v-else>
                <h4 v-if="selectedProject">Projekt: {{ selectedProject.projekt_nev || selectedProject.nev || ('Projekt #' + selectedProject.id) }}</h4>
                <h4 v-else>Válassz projektet</h4>
              </template>
            </div>
            <div class="chat-messages" ref="messagesContainer">
              <div v-if="isLoadingMessages" class="conversation-status">Üzenetek betöltése...</div>
              <div v-else-if="messages.length === 0" class="conversation-status">Nincs üzenet.</div>
              <template v-else>
                <div
                  v-for="message in messages"
                  :key="message.id"
                  :class="['message', message.type]"
                >
                  <p class="message-content">
                    {{ message.text }}
                    <span class="message-meta">{{ message.sender }} | {{ message.time }}</span>
                  </p>
                </div>
              </template>
            </div>
            <div class="chat-input">
              <input 
                type="text" 
                placeholder="Írj üzenetet..." 
                v-model="newMessage"
                @keyup.enter="sendMessage"
                :disabled="chatMode === 'direct' ? !selectedConversationId : !selectedProjectId"
              >
              <button @click="sendMessage" :disabled="chatMode === 'direct' ? !selectedConversationId : !selectedProjectId"><i class="fas fa-paper-plane"></i> Küldés</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import moment from 'moment';
import 'moment/locale/hu';

moment.locale('hu');

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
    const apiBaseUrl = 'http://localhost:3000/api';

    const userName = ref('anonymous');
    const currentUserId = ref(null);
    const newMessage = ref('');
    const messages = ref([]);
    const messagesContainer = ref(null);
    const clientsTotal = ref(0);
    const chatMode = ref('direct');
    const isLoadingMessages = ref(false);
    const isLoadingConversations = ref(false);
    const isLoadingProjects = ref(false);
    const isLoadingMembers = ref(false);
    const users = ref([]);
    const conversations = ref([]);
    const selectedConversationId = ref(null);
    const selectedRecipientId = ref('');
    const projects = ref([]);
    const selectedProjectId = ref('');
    const projectMembers = ref([]);
    const selectableUsers = computed(() => users.value.filter((u) => u.id !== currentUserId.value));
    const selectedConversation = computed(() =>
      conversations.value.find((conv) => conv.userId === selectedConversationId.value) || null
    );
    const selectedProject = computed(() =>
      projects.value.find((project) => String(project.id) === String(selectedProjectId.value)) || null
    );

    const getToken = () => localStorage.getItem('accessToken');

    const buildHeaders = () => {
      const token = getToken();
      return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      };
    };

    const resolveUserName = (id) => {
      if (chatMode.value === 'project') {
        const member = projectMembers.value.find((u) => u.id === id);
        return member?.teljes_nev || member?.felhasznalonev || member?.email || `Felhasználó #${id}`;
      }

      const user = users.value.find((u) => u.id === id);
      return user?.teljes_nev || user?.felhasznalonev || `Felhasználó #${id}`;
    };

    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
      });
    };

    const mapMessage = (msg) => {
      const isOwn = msg.kuldo_id === currentUserId.value;
      return {
        id: msg.id,
        sender: resolveUserName(msg.kuldo_id),
        senderId: msg.kuldo_id,
        text: msg.uzenet_tartalom,
        time: moment(msg.kuldes_ideje).fromNow(),
        type: isOwn ? 'sent' : 'received',
        isOwn
      };
    };

    const updateClientsTotal = () => {
      clientsTotal.value = chatMode.value === 'project' ? projectMembers.value.length : users.value.length;
    };

    const loadUsers = async () => {
      const token = getToken();
      if (!token) {
        return;
      }

      const response = await fetch(`${apiBaseUrl}/project/projektTag`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Felhasználók lekérése sikertelen');
      }

      const data = await response.json();
      users.value = data.data || [];
      updateClientsTotal();
    };

    const loadProjects = async () => {
      const token = getToken();
      if (!token) {
        return;
      }

      isLoadingProjects.value = true;
      try {
        const response = await fetch(`${apiBaseUrl}/project/projektek`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('Projektek lekérése sikertelen');
        }

        const data = await response.json();
        projects.value = data?.data?.projects || [];
      } finally {
        isLoadingProjects.value = false;
      }
    };

    const loadProjectMembers = async () => {
      const token = getToken();
      if (!token || !selectedProjectId.value) {
        projectMembers.value = [];
        clientsTotal.value = 0;
        return;
      }

      isLoadingMembers.value = true;
      try {
        const response = await fetch(
          `${apiBaseUrl}/project/projektTagok?projekt_id=${encodeURIComponent(selectedProjectId.value)}`,
          {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (!response.ok) {
          throw new Error('Projekt tagok lekérése sikertelen');
        }

        const data = await response.json();
        projectMembers.value = data?.data || [];
        clientsTotal.value = projectMembers.value.length;
      } finally {
        isLoadingMembers.value = false;
      }
    };

    const loadMessages = async () => {
      const token = getToken();
      if (!token || !selectedProjectId.value) {
        messages.value = [];
        return;
      }

      isLoadingMessages.value = true;
      try {
        const response = await fetch(
          `${apiBaseUrl}/messages/osszes?projektId=${encodeURIComponent(selectedProjectId.value)}`,
          {
            method: 'GET',
            headers: buildHeaders()
          }
        );

        if (!response.ok) {
          throw new Error('Üzenetek lekérése sikertelen');
        }

        const data = await response.json();
        const items = data?.data?.messages || [];
        items.sort((a, b) => new Date(a.kuldes_ideje).getTime() - new Date(b.kuldes_ideje).getTime());
        messages.value = items.map(mapMessage);
        scrollToBottom();
      } finally {
        isLoadingMessages.value = false;
      }
    };

    const handleProjectChange = async () => {
      if (!selectedProjectId.value) {
        projectMembers.value = [];
        messages.value = [];
        clientsTotal.value = 0;
        return;
      }

      await loadProjectMembers();
      await loadMessages();
    };

    const loadConversations = async () => {
      const token = getToken();
      if (!token) {
        return;
      }

      isLoadingConversations.value = true;
      try {
        const response = await fetch(`${apiBaseUrl}/messages/osszes`, {
          method: 'GET',
          headers: buildHeaders()
        });

        if (!response.ok) {
          throw new Error('Beszélgetések lekérése sikertelen');
        }

        const data = await response.json();
        const items = (data?.data?.messages || []).filter((msg) => msg.projekt_id == null);
        const byUser = new Map();

        items.forEach((msg) => {
          const otherUserId = msg.kuldo_id === currentUserId.value ? msg.fogado_id : msg.kuldo_id;
          if (!otherUserId) {
            return;
          }
          const messageTime = new Date(msg.kuldes_ideje).getTime();
          const existing = byUser.get(otherUserId);

          if (!existing || messageTime > existing.lastTime) {
            byUser.set(otherUserId, {
              userId: otherUserId,
              userName: resolveUserName(otherUserId),
              lastMessage: msg.uzenet_tartalom,
              lastTime: messageTime,
              lastTimeLabel: moment(msg.kuldes_ideje).fromNow()
            });
          }
        });

        conversations.value = Array.from(byUser.values()).sort((a, b) => b.lastTime - a.lastTime);

        if (!selectedConversationId.value && conversations.value.length > 0) {
          selectedConversationId.value = conversations.value[0].userId;
          await loadConversation(selectedConversationId.value);
        }
      } finally {
        isLoadingConversations.value = false;
      }
    };

    const loadConversation = async (withUserId) => {
      const token = getToken();
      if (!token || !withUserId) {
        messages.value = [];
        return;
      }

      isLoadingMessages.value = true;
      try {
        const response = await fetch(
          `${apiBaseUrl}/messages/beszelgetes?with=${encodeURIComponent(withUserId)}`,
          {
            method: 'GET',
            headers: buildHeaders()
          }
        );

        if (!response.ok) {
          throw new Error('Beszélgetés lekérése sikertelen');
        }

        const data = await response.json();
        const items = (data?.data?.messages || []).filter((msg) => msg.projekt_id == null);
        messages.value = items.map(mapMessage);
        scrollToBottom();
      } finally {
        isLoadingMessages.value = false;
      }
    };

    const selectConversation = async (userId) => {
      selectedConversationId.value = userId;
      await loadConversation(userId);
    };

    const startConversation = async () => {
      if (!selectedRecipientId.value) {
        return;
      }

      const targetId = Number(selectedRecipientId.value);
      if (!targetId || targetId === currentUserId.value) {
        return;
      }
      selectedConversationId.value = targetId;
      selectedRecipientId.value = '';
      await loadConversation(targetId);
      await loadConversations();
    };

    const handleChatModeChange = async (mode) => {
      chatMode.value = mode;
      messages.value = [];

      if (mode === 'direct') {
        updateClientsTotal();
        await loadConversations();
        return;
      }

      updateClientsTotal();
      if (!selectedProjectId.value && projects.value.length > 0) {
        selectedProjectId.value = String(projects.value[0].id);
      }
      await handleProjectChange();
    };

    const sendMessage = async () => {
      if (newMessage.value.trim() === '') {
        return;
      }

      const payload = chatMode.value === 'direct'
        ? {
            fogado_id: Number(selectedConversationId.value),
            uzenet_tartalom: newMessage.value.trim()
          }
        : {
            projekt_id: Number(selectedProjectId.value),
            uzenet_tartalom: newMessage.value.trim()
          };

      const response = await fetch(`${apiBaseUrl}/messages/kuldes`, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Üzenet küldése sikertelen');
      }

      const data = await response.json();
      if (data?.data) {
        messages.value.push(mapMessage(data.data));
        scrollToBottom();
      }

      newMessage.value = '';
      if (chatMode.value === 'direct') {
        await loadConversation(selectedConversationId.value);
        await loadConversations();
      } else {
        await loadMessages();
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

    onMounted(async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          userName.value = userData.teljes_nev || userData.felhasznalonev || 'anonymous';
          const parsedId = Number(userData.id || userData.userId || null);
          currentUserId.value = Number.isNaN(parsedId) ? null : parsedId;
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }

      if (!getToken()) {
        router.push('/login');
        return;
      }

      try {
        await loadUsers();
        await loadProjects();
        await handleChatModeChange(chatMode.value);
      } catch (error) {
        console.error(error);
      }
    });

    return {
      userName,
      newMessage,
      messages,
      messagesContainer,
      clientsTotal,
      chatMode,
      isLoadingMessages,
      isLoadingConversations,
      isLoadingProjects,
      isLoadingMembers,
      conversations,
      selectedConversationId,
      selectedConversation,
      selectedRecipientId,
      selectableUsers,
      projects,
      selectedProjectId,
      selectedProject,
      projectMembers,
      sendMessage,
      handleProjectChange,
      handleChatModeChange,
      selectConversation,
      startConversation,
      router,
      logout
    };
  }
}
</script>

<style scoped>
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

.clients-total {
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
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

.name-section {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 15px;
  margin-bottom: 20px;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e1e5eb;
}

.name-section span {
  font-size: 1.5rem;
  color: #4a6ee0;
}

.name-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  background: transparent;
}

.chat-info {
  background-color: white;
  padding: 15px;
  border-radius: 8px;
  margin-top: 10px;
}

.chat-info p {
  margin: 8px 0;
  color: #4a5568;
  font-size: 0.9rem;
}

.chat-info i {
  color: #4a6ee0;
  margin-right: 8px;
  width: 18px;
}

.chat-mode-toggle {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.mode-button {
  flex: 1;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #e1e5eb;
  background: white;
  cursor: pointer;
  font-weight: 600;
  color: #4a5568;
  transition: all 0.2s ease;
}

.mode-button.active {
  background: #4a6ee0;
  color: white;
  border-color: #4a6ee0;
}

.new-conversation {
  margin-top: 20px;
  background-color: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e1e5eb;
}

.new-conversation label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 8px;
}

.project-select {
  margin-top: 20px;
  background-color: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e1e5eb;
}

.project-select label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 8px;
}

.recipient-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e1e5eb;
  border-radius: 8px;
  background: #f8fafc;
  font-size: 0.9rem;
  color: #2d3748;
  margin-bottom: 10px;
}

.start-conversation {
  width: 100%;
  background-color: #4a6ee0;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.start-conversation:hover {
  background-color: #3a5ecf;
}


.conversation-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.conversation-item {
  text-align: left;
  border: 1px solid #e1e5eb;
  background: white;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.conversation-item.active {
  border-color: #4a6ee0;
  box-shadow: 0 4px 12px rgba(74, 110, 224, 0.15);
}

.conversation-item:hover {
  transform: translateY(-1px);
}

.conversation-title {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.conversation-preview {
  color: #718096;
  font-size: 0.85rem;
  margin-bottom: 4px;
}

.conversation-meta {
  font-size: 0.75rem;
  color: #a0aec0;
}

.conversation-status {
  color: #718096;
  font-size: 0.9rem;
  padding: 10px 5px;
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

.message-content {
  margin: 0;
}

.message-meta {
  display: block;
  font-style: italic;
  font-size: 0.75rem;
  margin-top: 6px;
  opacity: 0.8;
}

.typing-feedback {
  padding: 10px 18px;
  font-style: italic;
  color: #718096;
  font-size: 0.9rem;
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
  padding: 0 20px;
  height: 45px;
  border-radius: 25px;
  margin-left: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 500;
}

.chat-input button:hover {
  background-color: #3a5ecf;
  transform: scale(1.05);
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