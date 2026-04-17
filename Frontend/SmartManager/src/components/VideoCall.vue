<template>
  <div class="video-call-modal" v-if="isOpen">
    <div class="video-call-container">
      <div class="video-call-header">
        <h3 v-if="callStatus === 'calling'">Hívás {{ recipientName }} felé...</h3>
        <h3 v-else-if="callStatus === 'connected'">Beszélgetés: {{ recipientName }}</h3>
        <h3 v-else-if="callStatus === 'ringing'">{{ recipientName }} hívása</h3>
        <h3 v-else>Videóhívás</h3>
        <button class="close-button" @click="closeCall" aria-label="Hívás bezárása">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div v-if="callStatus === 'idle'" class="call-initiation">
        <div class="call-info">
          <p>Videóhívást szeretnél indítani {{ recipientName }} felé?</p>
        </div>
        <div class="call-actions">
          <button class="btn btn-start-call" @click="initiateCall">
            <i class="fas fa-phone"></i> Hívás indítása
          </button>
          <button class="btn btn-cancel" @click="closeCall">
            <i class="fas fa-times"></i> Mégse
          </button>
        </div>
        <div v-if="!isConnected" class="connection-warning">
          <i class="fas fa-spinner fa-spin"></i> Csatlakozás folyamatban...
        </div>
      </div>

      <div v-else-if="callStatus === 'incoming'" class="call-initiation">
        <div class="call-info">
          <p><i class="fas fa-phone"></i> {{ incomingCallerName }} videóhívást indított</p>
        </div>
        <div class="call-actions">
          <button class="btn btn-start-call" @click="answerIncomingCall">
            <i class="fas fa-phone"></i> Válasz
          </button>
          <button class="btn btn-cancel" @click="rejectIncomingCall">
            <i class="fas fa-times"></i> Elutasítás
          </button>
        </div>
      </div>

      <div v-else-if="callStatus === 'calling' || callStatus === 'connected' || callStatus === 'ringing'" class="video-container">
        <div class="video-wrapper local-video-wrapper">
          <video 
            ref="localVideoElement"
            class="video-player local-video"
            autoplay
            playsinline
            muted
          ></video>
          <div class="video-label">Ön</div>
        </div>

        <div class="video-wrapper remote-video-wrapper">
          <video 
            v-show="callStatus === 'connected'"
            ref="remoteVideoElement"
            class="video-player remote-video"
            autoplay
            playsinline
          ></video>
          <div v-if="callStatus !== 'connected'" class="video-placeholder">
            <i class="fas fa-phone"></i>
            <p>{{ callStatus === 'calling' ? 'Várakozás válaszra...' : 'A másik oldal csatlakozik...' }}</p>
          </div>
          <div class="video-label">{{ recipientName }}</div>
        </div>
      </div>

      <div v-if="callStatus === 'calling' || callStatus === 'connected' || callStatus === 'ringing'" class="call-controls">
        <button 
          class="control-button"
          :class="{ 'camera-off': !isLocalVideoEnabled }"
          @click="toggleLocalVideo"
          :title="isLocalVideoEnabled ? 'Kamera kikapcsolása' : 'Kamera bekapcsolása'"
          aria-label="Kamera vezérlés"
        >
          <i :class="isLocalVideoEnabled ? 'fas fa-video' : 'fas fa-video-slash'"></i>
        </button>
        
        <button 
          class="control-button"
          :class="{ 'audio-off': !isLocalAudioEnabled }"
          @click="toggleLocalAudio"
          :title="isLocalAudioEnabled ? 'Mikrofon kikapcsolása' : 'Mikrofon bekapcsolása'"
          aria-label="Mikrofon vezérlés"
        >
          <i :class="isLocalAudioEnabled ? 'fas fa-microphone' : 'fas fa-microphone-slash'"></i>
        </button>

        <button 
          class="control-button end-call"
          @click="endCall"
          title="Hívás befejeztése"
          aria-label="Hívás befejeztése"
        >
          <i class="fas fa-phone-slash"></i>
        </button>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script>
// Vue composablek a reaktív állapothoz és lifecycle-hoz
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
// Socket.IO kliens a signaling kommunikációhoz
import { io } from 'socket.io-client';
// socket URL feloldó a környezetfüggő backend címhez
import { getSocketUrl } from '../utils/api';

export default {
  name: 'VideoCall',
  // szülő komponensből érkező hívás paraméterek
  props: {
    recipientId: {
      type: [Number, String],
      default: null
    },
    recipientName: {
      type: String,
      default: 'Felhasználó'
    },
    recipientUserName: {
      type: String,
      default: ''
    },
    currentUserId: {
      type: [Number, String],
      default: null
    },
    accessToken: {
      type: String,
      default: null
    },
    roomId: {
      type: String,
      default: 'hívás'
    }
  },
  // visszajelzések a szülő felé
  emits: ['close', 'call-ended', 'incoming-call'],
  setup(props, { emit }) {
    // UI és hívás állapotok
    const isOpen = ref(false);
    const callStatus = ref('idle'); 
    const isConnected = ref(false);
    const isLocalVideoEnabled = ref(false);
    const isLocalAudioEnabled = ref(true);
    const errorMessage = ref('');
    const incomingCallerName = ref('');
    const incomingOfferObj = ref(null);

    // DOM referenciák a local/remote video elemekhez
    const localVideoElement = ref(null);
    const remoteVideoElement = ref(null);

    // WebRTC és socket runtime objektumok
    let socket = null;
    let peerConnection = null;
    let localStream = null;
    let remoteStream = null;
    let videoSender = null;

    // signaling és híváskövetéshez szükséges azonosítók/flag-ek
    let localSocketId = null;
    let localUserName = null;
    let didIOffer = false;
    let activePeerUserName = null;

    // már feldolgozott offer-ek deduplikálása
    const processedOfferIds = new Set();

    // STUN konfiguráció NAT mögötti kapcsolatok felépítéséhez
    const peerConfiguration = {
      iceServers: [
        {
          urls: [
            'stun:stun.l.google.com:19302',
            'stun:stun1.l.google.com:19302'
          ]
        }
      ]
    };

    // signaling socket inicializálása és eseménykezelők regisztrálása
    const initSocket = () => {
      if (socket) return;

      const token = props.accessToken || localStorage.getItem('accessToken');
      
      if (!token) {
        console.warn('⚠️  No access token available, cannot initialize socket');
        return;
      }

      socket = io(`${getSocketUrl()}/calls`, {
        auth: {
          token: token,
          roomId: props.roomId
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
        transports: ['polling', 'websocket']
      });

      socket.on('connect', () => {
        localSocketId = socket.id;
        isConnected.value = true;
        errorMessage.value = '';
        console.log('✓ Connected to signaling server');
      });

      socket.on('disconnect', () => {
        isConnected.value = false;
        console.log('✗ Disconnected from signaling server');
      });

      socket.on('connect_error', (error) => {
        console.error('✗ Socket connection error:', error);
        errorMessage.value = 'Csatlakozási hiba: ' + error.message;
      });

      socket.on('signalingReady', (payload) => {
        // backend visszaadja az auth-ból az aktuális felhasználónevet
        localUserName = payload.userName;
        console.log('✓ Signaling ready, username:', localUserName, 'in room:', payload.roomId);
      });

      socket.on('answerResponse', async (offerObj) => {
        console.log('📞 Received answer response');
        activePeerUserName = offerObj?.answererUserName || activePeerUserName;
        addAnswer(offerObj);
        callStatus.value = 'connected';
      });

      socket.on('receivedIceCandidateFromServer', (iceCandidate) => {
        console.log('🧊 Received ICE candidate');
        addNewIceCandidate(iceCandidate);
      });

      socket.on('peerHangup', () => {
        console.log('📵 Peer hung up');
        hangupLocally();
        callStatus.value = 'idle';
        isOpen.value = false;
        emit('call-ended', {
          reason: 'peer-hangup',
          message: 'A másik fél befejezte a hívást.'
        });
      });

      socket.on('availableOffers', (offers) => {
        console.log('📥 Available offers received:', offers.length, 'offers', offers);
        if (offers && offers.length > 0) {
          handleIncomingOffers(offers);
        }
      });

      socket.on('newOfferAwaiting', (offers) => {
        console.log('📥 New offers awaiting received:', offers.length, 'offers', offers);
        if (offers && offers.length > 0) {
          handleIncomingOffers(offers);
        }
      });

      console.log('✅ Socket event listeners registered (availableOffers, newOfferAwaiting, answerResponse, peerHangup, etc.)');
    };

    // böngésző és biztonsági környezet ellenőrzése médiaeszközök előtt
    const ensureMediaDevicesAvailable = () => {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const isSecure = typeof window !== 'undefined' && (window.isSecureContext || window.location.hostname === 'localhost');
        if (!isSecure) {
          errorMessage.value = 'A kamera/mikrofon csak HTTPS kapcsolaton erheto el telefonon.';
        } else {
          errorMessage.value = 'A bongeszo nem tamogatja a kamera/mikrofon hozzaferest.';
        }

        throw new Error('MediaDevices API is unavailable');
      }
    };

    // kamera/mikrofon stream beszerzése, fallback audio-only módra
    const fetchUserMedia = async ({ preferVideo = false } = {}) => {
      try {
        if (localStream) {
          return;
        }

        ensureMediaDevicesAvailable();

        const stream = await navigator.mediaDevices.getUserMedia(
          preferVideo
            ? {
                video: { facingMode: 'user' },
                audio: true
              }
            : {
                video: false,
                audio: true
              }
        );

        localStream = stream;
        isLocalVideoEnabled.value = localStream.getVideoTracks().length > 0;
        isLocalAudioEnabled.value = localStream.getAudioTracks().length > 0;
        if (localVideoElement.value) {
          localVideoElement.value.srcObject = stream;
        }

        return stream;
      } catch (error) {
        // ha a kamera foglalt, újrapróbáljuk videó nélkül
        if (preferVideo && error?.name === 'NotReadableError') {
          console.warn('Camera is busy, retrying with audio-only');
          errorMessage.value = 'A kamera jelenleg foglalt, a hívás audio-only módban folytatódik.';
          return fetchUserMedia({ preferVideo: false });
        }

        console.error('Error accessing media devices:', error);
        errorMessage.value = 'Kamera vagy mikrofon elerese sikertelen.';
        throw error;
      }
    };

    // WebRTC peer kapcsolat létrehozása és események felkötése
    const createPeerConnection = async (offerObj = null) => {
      peerConnection = new RTCPeerConnection(peerConfiguration);
      remoteStream = new MediaStream();
      videoSender = null;

      // remote stream csatolása a videó elemre
      const attachRemoteStream = async () => {
        if (!remoteStream || !remoteVideoElement.value) {
          return;
        }

        if (remoteVideoElement.value.srcObject !== remoteStream) {
          remoteVideoElement.value.srcObject = remoteStream;
        }

        remoteVideoElement.value.play().catch((error) => {
          console.warn('Remote video autoplay blocked temporarily:', error?.message || error);
        });
      };

      await nextTick();
      attachRemoteStream();

      // minden esetben küldünk audio track-et
      localStream.getAudioTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });

      // videó track lehet valós vagy üres transceiver (későbbi kamera bekapcsoláshoz)
      const localVideoTrack = localStream.getVideoTracks()[0];
      if (localVideoTrack) {
        videoSender = peerConnection.addTrack(localVideoTrack, localStream);
      } else {
        const videoTransceiver = peerConnection.addTransceiver('video', { direction: 'sendrecv' });
        videoSender = videoTransceiver.sender;
      }

      // lokális ICE candidate-ek továbbítása a signaling szerverre
      peerConnection.addEventListener('icecandidate', (event) => {
        if (event.candidate) {
          socket.emit('sendIceCandidateToSignalingServer', {
            iceCandidate: event.candidate,
            iceUserName: localUserName,
            didIOffer
          });
        }
      });

      // remote track fogadása
      peerConnection.addEventListener('track', (event) => {
        if (event.streams && event.streams[0]) {
          event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
          });
        } else if (event.track) {
          remoteStream.addTrack(event.track);
        }

        attachRemoteStream();
      });

      // kapcsolatállapot figyelése, hívás státusz frissítése
      peerConnection.addEventListener('connectionstatechange', () => {
        if (peerConnection.connectionState === 'connected') {
          callStatus.value = 'connected';
          nextTick(() => {
            attachRemoteStream();
          });
        }

        if (
          peerConnection.connectionState === 'failed' ||
          peerConnection.connectionState === 'disconnected' ||
          peerConnection.connectionState === 'closed'
        ) {
          hangupLocally();
          callStatus.value = 'idle';
        }
      });

      // bejövő hívás esetén remote offer beállítása
      if (offerObj) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offerObj.offer));
      }
    };

    // új ICE candidate hozzáadása a peer kapcsolathoz
    const addNewIceCandidate = (iceCandidate) => {
      if (!peerConnection) {
        return;
      }

      peerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate));
    };

    // a hívott fél válaszának (answer) beállítása
    const addAnswer = async (offerObj) => {
      if (!peerConnection) {
        return;
      }

      await peerConnection.setRemoteDescription(new RTCSessionDescription(offerObj.answer));
    };

    // bejövő offer lista feldolgozása és releváns hívás kiválasztása
    const handleIncomingOffers = (offers) => {
      if (!offers || offers.length === 0) {
        console.log('No offers to handle');
        return;
      }
      
      console.log('Processing offers:', offers);

      const offer = [...offers]
        .reverse()
        .find((entry) => {
          if (!entry || !entry.offererUserName || entry.answer) {
            return false;
          }

          if (entry.id && processedOfferIds.has(entry.id)) {
            return false;
          }

          if (entry.offererSocketId && localSocketId) {
            return entry.offererSocketId !== localSocketId;
          }

          return entry.offererUserName !== localUserName;
        });

      if (offer) {
        if (offer.id) {
          processedOfferIds.add(offer.id);
        }

        console.log('✓ Incoming call detected from:', offer.offererUserName);
        incomingCallerName.value = offer.offererUserName;
        incomingOfferObj.value = offer;
        isOpen.value = true;
        callStatus.value = 'incoming';
        
        emit('incoming-call', {
          callerName: offer.offererUserName,
          callerId: offer.offererUserName
        });
      } else {
        console.log('No valid unanswered incoming offer found');
      }
    };

    // bejövő hívás elfogadása (answer generálás + ICE szinkron)
    const answerIncomingCall = async () => {
      try {
        if (!incomingOfferObj.value) {
          errorMessage.value = 'Nincs bejövő hívás';
          return;
        }

        callStatus.value = 'ringing';
        
        await fetchUserMedia();
        await createPeerConnection(incomingOfferObj.value);

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        incomingOfferObj.value.answer = answer;
        activePeerUserName = incomingOfferObj.value.offererUserName;
        didIOffer = false;

        const iceList = await socket.emitWithAck('newAnswer', incomingOfferObj.value);
        iceList.forEach((candidate) => {
          peerConnection.addIceCandidate(candidate);
        });

        callStatus.value = 'connected';
      } catch (error) {
        console.error('Error answering call:', error);
        if (error?.name === 'NotReadableError') {
          errorMessage.value = 'A kamera vagy mikrofon foglalt. Zarj be mas appokat, vagy probald ujra.';
        } else {
          errorMessage.value = 'A hívás elfogadása sikertelen.';
        }
        callStatus.value = 'incoming';
      }
    };

    // bejövő hívás elutasítása és másik fél értesítése
    const rejectIncomingCall = () => {
      const callerUserName = incomingOfferObj.value?.offererUserName || incomingCallerName.value;

      if (socket && callerUserName) {
        socket.emit('hangup', { targetUserName: callerUserName });
      }

      incomingOfferObj.value = null;
      incomingCallerName.value = '';
      callStatus.value = 'idle';
      errorMessage.value = '';
      isOpen.value = false;

      emit('call-ended', {
        reason: 'incoming-rejected',
        message: 'A bejövő hívás elutasítva.'
      });
      emit('close');
    };

    // kimenő hívás indítása (socket, media, offer, célzott kézbesítés)
    const initiateCall = async () => {
      try {
        console.log('initiateCall entered', {
          hasSocket: !!socket,
          socketConnected: !!socket?.connected,
          isConnected: isConnected.value,
          roomId: props.roomId,
          recipientUserName: props.recipientUserName,
          recipientName: props.recipientName
        });

        callStatus.value = 'calling';
        errorMessage.value = '';

        if (!socket) {
          initSocket();
        }

        if (socket && !socket.connected) {
          socket.connect();
        }

        if (!isConnected.value) {
          await new Promise((resolve, reject) => {
            const checkInterval = setInterval(() => {
              if (isConnected.value) {
                clearInterval(checkInterval);
                resolve();
              }
            }, 100);
            setTimeout(() => {
              clearInterval(checkInterval);
              reject(new Error('Csatlakozási időkorlát letelt'));
            }, 15000);
          });
        }

        console.log('initiateCall: signaling connected, requesting media');

        await Promise.race([
          fetchUserMedia(),
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Média eszközök elérése időtúllépés miatt megszakadt.')), 12000);
          })
        ]);

        console.log('initiateCall: media ready, creating peer connection');

        await createPeerConnection();

        console.log('initiateCall: peer connection ready, creating offer');

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        didIOffer = true;

        const targetUserName = String(props.recipientUserName || props.recipientName || '').trim();
        const targetUserId = props.recipientId != null ? Number(props.recipientId) : null;
        activePeerUserName = targetUserName || activePeerUserName;
        console.log('📤 Sending newOffer to socket, room:', props.roomId, 'target:', targetUserName, 'targetId:', targetUserId);
        const delivery = await socket.emitWithAck('newOffer', {
          offer,
          targetUserName,
          targetUserId
        });
        console.log('✓ newOffer emitted successfully, delivery:', delivery);

        if (delivery && delivery.deliveredTo === 0) {
          errorMessage.value = 'A hívás nem kézbesíthető: a címzett nem elérhető ebben a szobában.';
          callStatus.value = 'idle';
        }
      } catch (error) {
        console.error('Error initiating call:', error);
        errorMessage.value = error.message || 'A hívás inicializálása sikertelen.';
        callStatus.value = 'idle';
      }
    };

    // helyi kamera be/ki kapcsolása futó kapcsolat közben
    const toggleLocalVideo = async () => {
      if (!localStream) return;

      if (isLocalVideoEnabled.value) {
        const existingTrack = localStream.getVideoTracks()[0];
        if (existingTrack) {
          existingTrack.stop();
          localStream.removeTrack(existingTrack);
        }

        if (videoSender) {
          await videoSender.replaceTrack(null);
        }

        isLocalVideoEnabled.value = false;
        return;
      }

      try {
        ensureMediaDevicesAvailable();

        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false
        });
        const newVideoTrack = cameraStream.getVideoTracks()[0];

        if (!newVideoTrack) {
          throw new Error('Nem sikerult video savot nyitni.');
        }

        localStream.addTrack(newVideoTrack);

        if (videoSender) {
          await videoSender.replaceTrack(newVideoTrack);
        } else if (peerConnection) {
          videoSender = peerConnection.addTrack(newVideoTrack, localStream);
        }

        if (localVideoElement.value) {
          localVideoElement.value.srcObject = localStream;
        }

        isLocalVideoEnabled.value = true;
      } catch (error) {
        console.error('Error enabling camera:', error);
        errorMessage.value = 'A kamera bekapcsolasa sikertelen.';
      }
    };

    // helyi mikrofon némítás/visszakapcsolás
    const toggleLocalAudio = () => {
      if (!localStream) return;

      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });

      isLocalAudioEnabled.value = !isLocalAudioEnabled.value;
    };

    // lokális erőforrások felszabadítása (peer, media, UI állapot)
    const hangupLocally = () => {
      if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
      }

      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        localStream = null;
      }

      if (localVideoElement.value) {
        localVideoElement.value.srcObject = null;
      }

      if (remoteStream) {
        remoteStream.getTracks().forEach((track) => track.stop());
      }

      remoteStream = null;

      if (remoteVideoElement.value) {
        remoteVideoElement.value.srcObject = null;
      }

      videoSender = null;
      didIOffer = false;
      activePeerUserName = null;
      isLocalVideoEnabled.value = false;
      isLocalAudioEnabled.value = true;
    };

    // hívás lezárása és partner értesítése hangup eseménnyel
    const endCall = (reason = 'local-hangup') => {
      const fallbackTarget = String(props.recipientUserName || props.recipientName || '').trim();
      const hangupTarget = activePeerUserName || fallbackTarget;

      if (socket && hangupTarget) {
        socket.emit('hangup', { targetUserName: hangupTarget });
      }

      hangupLocally();
      callStatus.value = 'idle';
      isOpen.value = false;
      emit('call-ended', {
        reason,
        message: 'A hívás befejeződött.'
      });
    };

    // modal bezárása; aktív hívásnál megerősítéssel
    const closeCall = () => {
      if (callStatus.value === 'calling' || callStatus.value === 'connected' || callStatus.value === 'ringing' || callStatus.value === 'incoming') {
        if (callStatus.value !== 'incoming') {
          const shouldCloseActiveCall = window.confirm('Biztosan be szeretnéd fejezni a hívást?');
          if (!shouldCloseActiveCall) {
            return;
          }

          endCall('manual-close');
        } else {
          rejectIncomingCall();
        }
      }
      
      isOpen.value = false;
      errorMessage.value = '';
      emit('close');
    };

    // hívásablak megnyitása idle állapotban
    const openCall = () => {
      console.log('openCall invoked');
      isOpen.value = true;
      callStatus.value = 'idle';
      errorMessage.value = '';
      initSocket();
    };

    // külső API: azonnali kimenő hívásindítás
    const startOutgoingCall = async () => {
      console.log('startOutgoingCall invoked');
      openCall();
      await nextTick();
      await initiateCall();
    };

    // komponens megszűnésekor kapcsolat és média takarítás
    onUnmounted(() => {
      if (socket) {
        socket.disconnect();
      }
      hangupLocally();
    });

    // komponens indulásakor előzetes socket inicializálás, ha van token
    onMounted(() => {
      console.log('📍 VideoCall component mounted, initializing socket...');
      const token = props.accessToken || localStorage.getItem('accessToken');
      if (!socket && token) {
        initSocket();
      } else if (!token) {
        console.warn('⚠️  No access token provided or available in localStorage');
      }
    });

    // template-ben elérhetővé tett állapotok és metódusok
    return {
      isOpen,
      callStatus,
      isConnected,
      isLocalVideoEnabled,
      isLocalAudioEnabled,
      errorMessage,
      incomingCallerName,
      localVideoElement,
      remoteVideoElement,
      recipientName: computed(() => props.recipientName),
      initiateCall,
      answerIncomingCall,
      rejectIncomingCall,
      toggleLocalVideo,
      toggleLocalAudio,
      endCall,
      closeCall,
      openCall,
      startOutgoingCall
    };
  }
};
</script>

<style scoped>
.video-call-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.video-call-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 900px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.video-call-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.video-call-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.close-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.call-initiation {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.call-info {
  margin-bottom: 30px;
}

.call-info p {
  font-size: 1.1rem;
  color: #333;
  text-align: center;
  margin: 0;
}

.call-actions {
  display: flex;
  gap: 15px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  border: none;
  border-radius: 7px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
}

.btn-start-call {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-start-call:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.btn-start-call:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background: #e0e0e0;
  color: #333;
}

.btn-cancel:hover {
  background: #d0d0d0;
}

.connection-warning {
  margin-top: 20px;
  color: #ff9800;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.connection-warning i {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.video-container {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 10px;
  background: #000;
  overflow: hidden;
}

.video-wrapper {
  position: relative;
  background: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.local-video-wrapper {
  grid-column: 2;
  grid-row: 1;
  max-width: 300px;
  max-height: 250px;
  margin-left: auto;
  margin-right: 10px;
  margin-top: 10px;
}

.video-label {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 5px 12px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 20px;
}

.video-placeholder i {
  font-size: 3rem;
  margin-bottom: 10px;
  opacity: 0.8;
}

.video-placeholder p {
  margin: 0;
  font-size: 0.95rem;
}

.call-controls {
  background: #222;
  padding: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.control-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: #444;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-button:hover:not(.end-call) {
  background: #555;
  transform: scale(1.1);
}

.control-button.camera-off,
.control-button.audio-off {
  background: #ff6b6b;
  color: white;
}

.control-button.end-call {
  background: #ff4444;
  color: white;
}

.control-button.end-call:hover {
  background: #ff2222;
  transform: scale(1.1);
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 12px 20px;
  border-top: 1px solid #ef9a9a;
  font-size: 0.9rem;
  text-align: center;
}

@media (max-width: 768px) {
  .video-call-container {
    max-height: 100vh;
  }

  .video-container {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
  }

  .local-video-wrapper {
    grid-column: 1;
    grid-row: 2;
    max-width: none;
    max-height: 150px;
    margin: 0;
  }

  .remote-video-wrapper {
    grid-column: 1;
    grid-row: 1;
  }

  .call-actions {
    flex-direction: column;
    width: 100%;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
