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
      <div class="sidebar-footer">
        <button class="sidebar-logout" type="button" @click="logout">
          <i class="fas fa-sign-out-alt"></i>
          <span>Kijelentkezés</span>
        </button>
      </div>
    </aside>

    <main class="main-content">
    <header>
      <div class="header-left">
        <h1>Üzenetek</h1>
      </div>
      <div class="header-right">
        <div class="user-profile">
          <div class="dropdown" @click="dropdownOpen = !dropdownOpen">
            <div class="avatar">{{ userProfile.initials }}</div>
            <div class="user-name">{{ userProfile.teljes_nev || userProfile.felhasznalonev }}</div>
            <div class="user-role">{{ getRoleLabel(userProfile.szerep_tipus) }}</div>
            <i class="fas fa-chevron-down"></i>
            <div :class="['dropdown-menu', { show: dropdownOpen }]" @click.stop>
              <span v-if="userProfile.szerep_tipus === 'diak'">
                <button class="dropdown-item" @click="openProfile" title="Főoldal">
                <i class="fas fa-home"></i>
                <router-link to="/diak" style="color: inherit; text-decoration: none;">
                  <span>Főoldal</span>
                </router-link>
              </button>
              <button class="dropdown-item" @click="openProfile" title="Profil">
                <i class="fas fa-tasks"></i> 
                <router-link to="/task" style="color: inherit; text-decoration: none;">
                  <span>Feladatok</span>
                </router-link>
              </button>
              <button class="dropdown-item" @click="openTasks" title="Feladatok">
                <i class="fas fa-users"></i>
                <router-link to="/teamwork" style="color: inherit; text-decoration: none;">
                  <span>Csapatmunka</span>
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
              </span>
              <span v-else>
                <button class="dropdown-item" @click="openProfile" title="Főoldal">
                        <i class="fas fa-home"></i>
                        <router-link to="/tanar" style="color: inherit; text-decoration: none;">
                          <span>Főoldal</span>
                        </router-link>
                      </button>
                      <button class="dropdown-item" @click="openProfile" title="Feladatok">
                        <i class="fas fa-tasks"></i> 
                        <router-link to="/Ttask" style="color: inherit; text-decoration: none;">
                          <span>Feladatok</span>
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
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>

      <section class="section">
        <div class="section-header">
          <h3><i class="fas fa-comments"></i> SMchat 💬</h3>
          
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
                <input
                  type="text"
                  v-model="recipientSearch"
                  class="recipient-search"
                  placeholder="Keresés név alapján"
                >
                <div class="recipient-list">
                  <button
                    v-for="user in filteredSelectableUsers"
                    :key="user.id"
                    type="button"
                    :class="['recipient-option', { active: String(user.id) === String(selectedRecipientId) }]"
                    @click="selectRecipient(user.id)"
                  >
                    {{ user.teljes_nev || user.felhasznalonev || ('Felhasználó #' + user.id) }}
                  </button>
                  <div v-if="filteredSelectableUsers.length === 0" class="recipient-empty">
                    Nincs találat.
                  </div>
                </div>
                <button class="start-conversation" :disabled="!selectedRecipientId" @click="startConversation">
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
                    <div class="conversation-title">
                      <span
                        :class="['status-dot', conv.isOnline ? 'online' : 'offline']"
                        :title="conv.isOnline ? 'Elérhető' : 'Nem elérhető'"
                      ></span>
                      {{ conv.userName }}
                    </div>
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
                      <span
                        :class="['status-dot', isOnline(member.elerheto) ? 'online' : 'offline']"
                        :title="isOnline(member.elerheto) ? 'Elérhető' : 'Nem elérhető'"
                      ></span>
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
              <div class="chat-header-left">
                <template v-if="chatMode === 'direct'">
                  <h4 v-if="selectedConversation">Beszélgetés: {{ selectedConversation.userName }}</h4>
                  <h4 v-else>Válassz beszélgetést</h4>
                </template>
                <template v-else>
                  <h4 v-if="selectedProject">Projekt: {{ selectedProject.projekt_nev || selectedProject.nev || ('Projekt #' + selectedProject.id) }}</h4>
                  <h4 v-else>Válassz projektet</h4>
                </template>
              </div>
              <div class="chat-header-actions">
                <button 
                  v-if="chatMode === 'direct' && selectedConversationId"
                  class="video-call-btn"
                  @click="startVideoCall"
                  title="Hívás indítása"
                  aria-label="Hívás indítása"
                >
                  <i class="fas fa-phone"></i>
                </button>
              </div>
            </div>
            <div v-if="callStatusNotice" class="call-status-banner">
              <i class="fas fa-phone-slash"></i>
              <span>{{ callStatusNotice }}</span>
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
                  <div class="message-body">
                    <div class="message-content">
                      <template v-if="editingMessageId === message.id">
                        <textarea
                          v-model="editDraft"
                          class="message-edit-input"
                          rows="2"
                          maxlength="2000"
                          @keyup.esc="cancelEditingMessage"
                        ></textarea>
                        <div class="message-edit-actions">
                          <button
                            type="button"
                            class="message-edit-button"
                            @click="saveEditedMessage(message)"
                          >
                            Mentés
                          </button>
                          <button
                            type="button"
                            class="message-edit-button secondary"
                            @click="cancelEditingMessage"
                          >
                            Mégse
                          </button>
                        </div>
                      </template>
                      <template v-else>
                        <p class="message-text">{{ message.text }}</p>
                        <span class="message-meta">
                          {{ message.sender }} | {{ message.time }}
                          <span v-if="message.isEdited" class="message-edited"> (szerkesztve)</span>
                        </span>
                      </template>
                    </div>
                    <div v-if="message.isOwn" class="message-actions">
                      <button
                        type="button"
                        class="message-menu-toggle"
                        @click.stop="toggleMessageMenu(message.id)"
                        aria-label="Üzenet műveletek"
                        title="Üzenet műveletek"
                      >
                        <i class="fas fa-ellipsis-v"></i>
                      </button>
                      <div
                        v-if="openMessageMenuId === message.id"
                        class="message-menu"
                        @click.stop
                      >
                        <button type="button" class="message-menu-item" @click="startEditingMessage(message)">
                          Szerkesztés
                        </button>
                        <button type="button" class="message-menu-item danger" @click="deleteMessage(message)">
                          Törlés
                        </button>
                      </div>
                    </div>
                  </div>
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
              <button
                @click="sendMessage"
                :disabled="chatMode === 'direct' ? !selectedConversationId : !selectedProjectId"
                aria-label="Üzenet küldése"
                title="Üzenet küldése"
              >
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    
    <VideoCall 
      ref="videoCallComponent"
      :recipient-id="selectedConversationId"
      :recipient-name="selectedConversation?.userName || 'Felhasználó'"
      :recipient-user-name="selectedConversationSignalUserName"
      :current-user-id="currentUserId"
      :access-token="accessToken"
      room-id="hívás"
      @close="showVideoCall = false"
      @call-ended="handleCallEnded"
      @incoming-call="onIncomingCall"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { io } from 'socket.io-client';
import VideoCall from '../components/VideoCall.vue';
import { getApiUrl, getSocketUrl } from '../utils/api';

export default {
  name: "Chat",
  components: {
    VideoCall
  },
  data() {
    return {
      navActive: false,  
      dropdownOpen: false,  
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
        
        const response = await fetch(getApiUrl(`/api/auth/profileData`), {
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

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.user-profile')) {
        this.dropdownOpen = false;
      }
    });
  },
  setup() {
    const router = useRouter();
    const apiBaseUrl = getApiUrl('/api');

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
    const recipientSearch = ref('');
    const projects = ref([]);  
    const selectedProjectId = ref('');  
    const projectMembers = ref([]);  
    const openMessageMenuId = ref(null);
    const editingMessageId = ref(null);
    const editDraft = ref('');
    const showVideoCall = ref(false);
    const accessToken = ref(null);
    const videoCallComponent = ref(null);
    const callStatusNotice = ref('');
    let chatSocket = null;
    let callStatusNoticeTimer = null;
    const selectableUsers = computed(() => users.value.filter((u) => u.id !== currentUserId.value));
    const normalizeForSearch = (value) => String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const filteredSelectableUsers = computed(() => {
      const query = normalizeForSearch(recipientSearch.value).trim();
      if (!query) return selectableUsers.value;

      return selectableUsers.value.filter((user) => {
        const label = user.teljes_nev || user.felhasznalonev || `Felhasználó #${user.id}`;
        return normalizeForSearch(label).includes(query);
      });
    });
    const selectedConversation = computed(() =>
      conversations.value.find((conv) => conv.userId === selectedConversationId.value) || null
    );
    const selectedConversationSignalUserName = computed(() => {
      if (!selectedConversationId.value) {
        return '';
      }

      const directUser = users.value.find((u) => String(u.id) === String(selectedConversationId.value));
      return directUser?.felhasznalonev || selectedConversation.value?.userName || '';
    });
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
        const member = projectMembers.value.find((u) => String(u.id) === String(id));
        return member?.teljes_nev || member?.felhasznalonev || member?.email || `Felhasználó #${id}`;
      }

      const user = users.value.find((u) => String(u.id) === String(id));
      return user?.teljes_nev || user?.felhasznalonev || `Felhasználó #${id}`;
    };

    const isOnline = (elerheto) => {
      if (typeof elerheto === 'boolean') return elerheto;
      if (typeof elerheto === 'number') return elerheto === 1;
      if (typeof elerheto === 'string') {
        const normalized = elerheto.trim().toLowerCase();
        return normalized === '1' || normalized === 'true';
      }
      return false;
    };

    const isUserOnlineById = (id) => {
      const user = users.value.find((u) => String(u.id) === String(id));
      return isOnline(user?.elerheto);
    };

    const huRelativeFormatter = new Intl.RelativeTimeFormat('hu', { numeric: 'auto' });
    const formatRelativeTimeHu = (input) => {
      const date = new Date(input);
      if (Number.isNaN(date.getTime())) return '';

      const diffMs = date.getTime() - Date.now();
      const absDiff = Math.abs(diffMs);
      const second = 1000;
      const minute = 60 * second;
      const hour = 60 * minute;
      const day = 24 * hour;
      const week = 7 * day;
      const month = 30 * day;
      const year = 365 * day;

      if (absDiff < minute) return huRelativeFormatter.format(Math.round(diffMs / second), 'second');
      if (absDiff < hour) return huRelativeFormatter.format(Math.round(diffMs / minute), 'minute');
      if (absDiff < day) return huRelativeFormatter.format(Math.round(diffMs / hour), 'hour');
      if (absDiff < week) return huRelativeFormatter.format(Math.round(diffMs / day), 'day');
      if (absDiff < month) return huRelativeFormatter.format(Math.round(diffMs / week), 'week');
      if (absDiff < year) return huRelativeFormatter.format(Math.round(diffMs / month), 'month');
      return huRelativeFormatter.format(Math.round(diffMs / year), 'year');
    };

    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
      });
    };

    const mapMessage = (msg) => {
      const isOwn = String(msg.kuldo_id) === String(currentUserId.value);  
      return {
        id: msg.id,
        sender: resolveUserName(msg.kuldo_id),
        senderId: msg.kuldo_id,
        receiverId: msg.fogado_id,
        projectId: msg.projekt_id,
        text: msg.uzenet_tartalom,
        time: formatRelativeTimeHu(msg.kuldes_ideje),  
        type: isOwn ? 'sent' : 'received',
        isOwn,
        isEdited: Boolean(msg.modositas_idopont && msg.modositas_idopont !== null)
      };
    };

    const updateClientsTotal = () => {
      clientsTotal.value = chatMode.value === 'project' ? projectMembers.value.length : users.value.length;
    };

    const loadUsers = async () => {
      const token = getToken();
      if (!token) {
        console.warn('Nincs token az users betöltéshez');
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/project/projectMember`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          console.error(`Felhasználók lekérése sikertelen: ${response.status}`);
          throw new Error(`Felhasználók lekérése sikertelen: ${response.status}`);
        }

        const data = await response.json();
        users.value = data.data || [];
        console.log('Felhasználók betöltve:', users.value.length);
        updateClientsTotal();
      } catch (error) {
        console.error('Felhasználók betöltésének hibája:', error);
      }
    };

    const loadProjects = async () => {
      const token = getToken();
      if (!token) return;

      isLoadingProjects.value = true;
      try {
        const response = await fetch(`${apiBaseUrl}/project/projects`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Projektek lekérése sikertelen');

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
          `${apiBaseUrl}/project/projectMembers?projekt_id=${encodeURIComponent(selectedProjectId.value)}`,
          { method: 'GET', headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) throw new Error('Projekt tagok lekérése sikertelen');

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
          `${apiBaseUrl}/messages/allMessages?projektId=${encodeURIComponent(selectedProjectId.value)}`,
          { method: 'GET', headers: buildHeaders() }
        );

        if (!response.ok) throw new Error(`Üzenetek lekérése sikertelen: ${response.status}`);

        const data = await response.json();
        const items = data?.data?.messages || [];
        console.log('Üzenetek betöltve:', items.length);
        items.sort((a, b) => new Date(a.kuldes_ideje).getTime() - new Date(b.kuldes_ideje).getTime());
        messages.value = items.map(mapMessage);
      } catch (error) {
        console.error('Üzenetek betöltésének hibája:', error);
        messages.value = [];
      } finally {
        isLoadingMessages.value = false;
        scrollToBottom();
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
      if (!token) return;

      isLoadingConversations.value = true;
      try {
        const response = await fetch(`${apiBaseUrl}/messages/allMessages`, {
          method: 'GET',
          headers: buildHeaders()
        });

        if (!response.ok) throw new Error(`Beszélgetések lekérése sikertelen: ${response.status}`);

        const data = await response.json();
        const items = (data?.data?.messages || []).filter((msg) => msg.projekt_id == null);
        console.log('Beszélgetések üzenetei betöltve:', items.length, 'users.value.length:', users.value.length);
        const byUser = new Map();  

        items.forEach((msg) => {
          const isOwnMessage = String(msg.kuldo_id) === String(currentUserId.value);
          const otherUserId = isOwnMessage ? msg.fogado_id : msg.kuldo_id;
          if (!otherUserId) return;
          const messageTime = new Date(msg.kuldes_ideje).getTime();
          const existing = byUser.get(otherUserId);

          if (!existing || messageTime > existing.lastTime) {
            byUser.set(otherUserId, {
              userId: otherUserId,
              userName: resolveUserName(otherUserId),
              isOnline: isUserOnlineById(otherUserId),
              lastMessage: msg.uzenet_tartalom,
              lastTime: messageTime,
              lastTimeLabel: formatRelativeTimeHu(msg.kuldes_ideje)
            });
          }
        });

        conversations.value = Array.from(byUser.values()).sort((a, b) => b.lastTime - a.lastTime);
        console.log('Beszélgetések feldolgozva:', conversations.value.length);

        if (conversations.value.length > 0) {
          const hasSelectedConversation = conversations.value.some(
            (conv) => String(conv.userId) === String(selectedConversationId.value)
          );

          if (!hasSelectedConversation) {
            selectedConversationId.value = conversations.value[0].userId;
          }

          await loadConversation(selectedConversationId.value);
        } else {
          selectedConversationId.value = null;
          messages.value = [];
        }
      } catch (error) {
        console.error('Beszélgetések betöltésének hibája:', error);
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
          `${apiBaseUrl}/messages/chatHistory?with=${encodeURIComponent(withUserId)}`,
          { method: 'GET', headers: buildHeaders() }
        );

        if (!response.ok) throw new Error('Beszélgetés lekérése sikertelen');

        const data = await response.json();
        const items = (data?.data?.messages || []).filter((msg) => msg.projekt_id == null);
        messages.value = items.map(mapMessage);
      } finally {
        isLoadingMessages.value = false;
        scrollToBottom();
      }
    };

    const selectConversation = async (userId) => {
      selectedConversationId.value = userId;
      await loadConversation(userId);
    };

    const selectRecipient = (userId) => {
      selectedRecipientId.value = String(userId);
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
      recipientSearch.value = '';
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
      if (newMessage.value.trim() === '') return;

      const payload = chatMode.value === 'direct'
        ? {
            fogado_id: Number(selectedConversationId.value),
            uzenet_tartalom: newMessage.value.trim()
          }
        : {
            projekt_id: Number(selectedProjectId.value),
            uzenet_tartalom: newMessage.value.trim()
          };

      const response = await fetch(`${apiBaseUrl}/messages/send`, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Üzenet küldése sikertelen');

      const data = await response.json();
      if (data?.data) {
        if (chatSocket && chatSocket.connected) {
          chatSocket.emit('message', data.data);
        }

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

    const toggleMessageMenu = (messageId) => {
      if (!messageId) return;
      openMessageMenuId.value = openMessageMenuId.value === messageId ? null : messageId;
    };

    const closeMessageMenu = () => {
      openMessageMenuId.value = null;
    };

    const startEditingMessage = (message) => {
      if (!message?.isOwn || !message?.id) {
        return;
      }

      editingMessageId.value = message.id;
      editDraft.value = message.text || '';
      closeMessageMenu();
    };

    const cancelEditingMessage = () => {
      editingMessageId.value = null;
      editDraft.value = '';
    };

    const saveEditedMessage = async (message) => {
      if (!message?.isOwn || !message?.id || editingMessageId.value !== message.id) {
        return;
      }

      const updatedText = editDraft.value.trim();
      if (!updatedText) {
        alert('Az üzenet nem lehet üres.');
        return;
      }

      if (updatedText === message.text) {
        cancelEditingMessage();
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/messages/update/${message.id}`, {
          method: 'PUT',
          headers: buildHeaders(),
          body: JSON.stringify({ uzenet_tartalom: updatedText })
        });

        if (!response.ok) {
          let errorMessage = 'Az üzenet szerkesztése sikertelen';
          try {
            const errorData = await response.json();
            errorMessage = errorData?.message || errorMessage;
          } catch (error) {
            console.error(error);
          }
          throw new Error(errorMessage);
        }

        const result = await response.json();

        cancelEditingMessage();

        const messageInList = messages.value.find(m => m.id === message.id);
        if (messageInList) {
          messageInList.text = updatedText;
          messageInList.isEdited = true;
        }

        if (chatSocket && chatSocket.connected && result?.data) {
          chatSocket.emit('chat-event', {
            action: 'message-updated',
            data: result.data
          });
        }

        if (chatMode.value === 'direct') {
          await loadConversation(selectedConversationId.value);
          await loadConversations();
        } else {
          await loadMessages();
        }
      } catch (error) {
        console.error(error);
        alert(error.message || 'Az üzenet szerkesztése sikertelen.');
      }
    };

    const deleteMessage = async (message) => {
      if (!message?.isOwn || !message?.id) {
        return;
      }

      closeMessageMenu();

      const shouldDelete = window.confirm('Biztosan törölni szeretnéd ezt az üzenetet?');
      if (!shouldDelete) {
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/messages/delete/${message.id}`, {
          method: 'DELETE',
          headers: buildHeaders()
        });

        if (!response.ok) {
          let errorMessage = 'Az üzenet törlése sikertelen';
          try {
            const errorData = await response.json();
            errorMessage = errorData?.message || errorMessage;
          } catch (error) {
            console.error(error);
          }
          throw new Error(errorMessage);
        }

        messages.value = messages.value.filter((item) => item.id !== message.id);

        if (chatSocket && chatSocket.connected) {
          chatSocket.emit('chat-event', {
            action: 'message-deleted',
            data: {
              id: message.id,
              kuldo_id: currentUserId.value,
              fogado_id: chatMode.value === 'direct' ? Number(selectedConversationId.value) : null,
              projekt_id: chatMode.value === 'project' ? Number(selectedProjectId.value) : null
            }
          });
        }

        if (chatMode.value === 'direct') {
          await loadConversation(selectedConversationId.value);
          await loadConversations();
        } else {
          await loadMessages();
        }
      } catch (error) {
        console.error(error);
        alert(error.message || 'Az üzenet törlése sikertelen.');
      }
    };

    const handleDocumentClick = () => {
      closeMessageMenu();
    };

    const triggerOutgoingCall = (attempt = 0) => {
      const maxAttempts = 10;
      const component = videoCallComponent.value;

      if (!component) {
        if (attempt < maxAttempts) {
          setTimeout(() => triggerOutgoingCall(attempt + 1), 100);
        } else {
          console.warn('VideoCall component is not ready after retries');
        }
        return;
      }

      if (typeof component.startOutgoingCall === 'function') {
        console.log('Starting outgoing call via startOutgoingCall()');
        component.startOutgoingCall();
        return;
      }

      if (typeof component.openCall === 'function') {
        console.log('VideoCall missing startOutgoingCall(), falling back to openCall()');
        component.openCall();
        return;
      }

      console.warn('VideoCall component methods are unavailable on ref');
    };

    const startVideoCall = () => {
      console.log('startVideoCall clicked', {
        selectedConversationId: selectedConversationId.value,
        recipientSignalUserName: selectedConversationSignalUserName.value
      });

      if (!selectedConversationId.value) {
        console.warn('No selected conversation, cannot start call');
        return;
      }

      showVideoCall.value = true;

      const component = videoCallComponent.value;
      if (component && typeof component.startOutgoingCall === 'function') {
        console.log('Starting outgoing call immediately from click handler');
        component.startOutgoingCall();
        return;
      }

      nextTick(() => {
        triggerOutgoingCall();
      });
    };

    const onIncomingCall = (callData) => {
      console.log('Incoming call from:', callData.callerName);
      showVideoCall.value = true;
    };

    const handleCallEnded = (payload = {}) => {
      showVideoCall.value = false;

      const fallbackMessage = 'A hívás befejeződött.';
      callStatusNotice.value = payload.message || fallbackMessage;

      if (callStatusNoticeTimer) {
        clearTimeout(callStatusNoticeTimer);
      }

      callStatusNoticeTimer = setTimeout(() => {
        callStatusNotice.value = '';
      }, 4000);
    };

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
            body: JSON.stringify({ elerheto: false })
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

    const isIncomingDirectMessageRelevant = (messagePayload) => {
      if (!selectedConversationId.value || messagePayload?.projekt_id != null) {
        return false;
      }

      const senderId = String(messagePayload.kuldo_id);
      const receiverId = String(messagePayload.fogado_id);
      const currentId = String(currentUserId.value);
      const selectedId = String(selectedConversationId.value);

      return (
        (senderId === selectedId && receiverId === currentId) ||
        (senderId === currentId && receiverId === selectedId)
      );
    };

    const isIncomingProjectMessageRelevant = (messagePayload) => {
      if (!selectedProjectId.value || messagePayload?.projekt_id == null) {
        return false;
      }

      return String(messagePayload.projekt_id) === String(selectedProjectId.value);
    };

    const handleIncomingMessage = async (messagePayload) => {
      if (!messagePayload?.id) {
        return;
      }

      if (String(messagePayload.kuldo_id) === String(currentUserId.value)) {
        return;
      }

      if (messagePayload?.projekt_id == null) {
        await loadConversations();

        if (chatMode.value === 'direct' && isIncomingDirectMessageRelevant(messagePayload)) {
          await loadConversation(selectedConversationId.value);
        }

        return;
      }

      if (chatMode.value === 'project' && isIncomingProjectMessageRelevant(messagePayload)) {
        await loadMessages();
      }
    };

    const isIncomingChatEventRelevant = (eventData) => {
      if (!eventData || !eventData.id) {
        return false;
      }

      if (eventData.projekt_id == null) {
        return isIncomingDirectMessageRelevant(eventData);
      }

      return isIncomingProjectMessageRelevant(eventData);
    };

    const handleIncomingChatEvent = async (eventPayload) => {
      const action = String(eventPayload?.action || '').trim();
      const eventData = eventPayload?.data;

      if (!action || !eventData?.id) {
        return;
      }

      if (String(eventData.kuldo_id) === String(currentUserId.value)) {
        return;
      }

      if (!isIncomingChatEventRelevant(eventData)) {
        if (eventData.projekt_id == null) {
          await loadConversations();
        }
        return;
      }

      if (action === 'message-updated' || action === 'message-deleted') {
        if (eventData.projekt_id == null) {
          await loadConversations();
          if (chatMode.value === 'direct') {
            await loadConversation(selectedConversationId.value);
          }
          return;
        }

        if (chatMode.value === 'project') {
          await loadMessages();
        }
      }
    };

    const initChatSocket = () => {
      if (chatSocket) {
        return;
      }

      chatSocket = io(getSocketUrl(), {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
        transports: ['polling', 'websocket']
      });

      chatSocket.on('connect_error', (error) => {
        console.error('Chat socket connection error:', error);
      });

      chatSocket.on('chat-message', (payload) => {
        handleIncomingMessage(payload).catch((error) => {
          console.error('Incoming message handling failed:', error);
        });
      });

      chatSocket.on('chat-event', (payload) => {
        handleIncomingChatEvent(payload).catch((error) => {
          console.error('Incoming chat event handling failed:', error);
        });
      });
    };

    onMounted(async () => {
      document.addEventListener('click', handleDocumentClick);
      initChatSocket();

      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('accessToken');
      
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

      if (storedToken) {
        accessToken.value = storedToken;
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

    onUnmounted(() => {
      document.removeEventListener('click', handleDocumentClick);
      if (chatSocket) {
        chatSocket.disconnect();
        chatSocket = null;
      }
      if (callStatusNoticeTimer) {
        clearTimeout(callStatusNoticeTimer);
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
      selectedConversationSignalUserName,
      selectedRecipientId,
      recipientSearch,
      selectableUsers,
      filteredSelectableUsers,
      projects,
      selectedProjectId,
      selectedProject,
      projectMembers,
      openMessageMenuId,
      editingMessageId,
      editDraft,
      showVideoCall,
      accessToken,
      videoCallComponent,
      callStatusNotice,
      isOnline,
      sendMessage,
      toggleMessageMenu,
      startEditingMessage,
      cancelEditingMessage,
      saveEditedMessage,
      deleteMessage,
      handleProjectChange,
      handleChatModeChange,
      selectConversation,
      selectRecipient,
      startConversation,
      startVideoCall,
      onIncomingCall,
      handleCallEnded,
      router,
      logout,
      currentUserId
    };
  }
}
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

.section {
  flex: 1;
  min-height: 0;
  height: calc(100vh - 150px);
  max-height: calc(100vh - 150px);
  padding: 0;
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
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

.chat-sidebar {
  width: 30%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background-color: #f5f7fb;
  border-right: 1px solid #e1e5eb;
  padding: 20px;
  overflow: hidden;
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

.recipient-search {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e1e5eb;
  border-radius: 8px;
  background: #f8fafc;
  font-size: 0.9rem;
  color: #2d3748;
  margin-bottom: 10px;
}

.recipient-search:focus {
  outline: none;
  border-color: #4a6ee0;
  box-shadow: 0 0 0 2px rgba(74, 110, 224, 0.15);
}

.recipient-list {
  max-height: 180px;
  overflow-y: auto;
  border: 1px solid #e1e5eb;
  border-radius: 8px;
  background: #f8fafc;
  padding: 6px;
  margin-bottom: 10px;
}

.recipient-option {
  width: 100%;
  text-align: left;
  border: none;
  background: transparent;
  border-radius: 6px;
  padding: 8px 10px;
  color: #2d3748;
  cursor: pointer;
  transition: background 0.2s ease;
}

.recipient-option:hover {
  background: #edf2ff;
}

.recipient-option.active {
  background: #4a6ee0;
  color: white;
}

.recipient-empty {
  padding: 8px 10px;
  color: #718096;
  font-size: 0.85rem;
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

.start-conversation:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.conversation-list {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 10px;
  margin-top: 10px;
  overflow-y: auto;
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
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.status-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.status-dot.online {
  background-color: #2fca63;
  box-shadow: 0 0 0 2px rgba(47, 202, 99, 0.15);
}

.status-dot.offline {
  background-color: #e15050;
  box-shadow: 0 0 0 2px rgba(225, 80, 80, 0.12);
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
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.chat-header {
  flex-shrink: 0;
  padding: 20px 25px;
  border-bottom: 1px solid #e1e5eb;
  background-color: #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header-left {
  flex: 1;
}

.chat-header-left h4 {
  font-size: 1.2rem;
  color: #2d3748;
  margin-bottom: 5px;
}

.chat-header-left p {
  color: #718096;
  font-size: 0.9rem;
}

.chat-header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.video-call-btn {
  padding: 10px 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.video-call-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.video-call-btn:active {
  transform: translateY(0);
}

.call-status-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 25px 0;
  padding: 10px 12px;
  border: 1px solid #fecaca;
  background: #fff1f2;
  color: #9f1239;
  border-radius: 8px;
  font-size: 0.92rem;
  font-weight: 600;
}

.chat-messages {
  flex: 1 1 auto;
  min-height: 0;
  padding: 20px 25px;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
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

.message-body {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
}

.message-content {
  flex: 1;
}

.message-text {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-actions {
  position: relative;
  flex-shrink: 0;
}

.message-menu-toggle {
  border: none;
  background: transparent;
  color: inherit;
  opacity: 0.75;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: opacity 0.2s ease, background 0.2s ease;
}

.message-menu-toggle:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.08);
}

.message-menu {
  position: absolute;
  top: 28px;
  right: 0;
  min-width: 130px;
  background: white;
  border: 1px solid #e1e5eb;
  border-radius: 8px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
  z-index: 25;
  overflow: hidden;
}

.message-menu-item {
  width: 100%;
  text-align: left;
  border: none;
  background: white;
  color: #2d3748;
  padding: 10px 12px;
  font-size: 0.85rem;
  cursor: pointer;
}

.message-menu-item:hover {
  background: #f5f7fb;
}

.message-menu-item.danger {
  color: #c53030;
}

.message-edit-input {
  width: 100%;
  border: 1px solid #cbd5e0;
  border-radius: 8px;
  padding: 8px 10px;
  resize: vertical;
  min-height: 54px;
  font-size: 0.9rem;
  color: #1a202c;
}

.message-edit-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.message-edit-button {
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  background: #2b6cb0;
  color: white;
  font-size: 0.8rem;
  cursor: pointer;
}

.message-edit-button.secondary {
  background: #718096;
}

.message-meta {
  display: block;
  font-style: italic;
  font-size: 0.75rem;
  margin-top: 6px;
  opacity: 0.8;
}

.message-edited {
  font-style: normal;
  font-weight: 600;
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

.message.sent .message-menu-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
}

.message strong {
  display: block;
  margin-bottom: 5px;
  font-size: 0.85rem;
}

.chat-input {
  display: flex;
  flex-shrink: 0;
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
    min-height: 0;
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