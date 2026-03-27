const localVideoEl = document.querySelector('#local-video');
const remoteVideoEl = document.querySelector('#remote-video');
const waitingEl = document.querySelector('#waiting');
const answerContainer = document.querySelector('#answer');
const userNameEl = document.querySelector('#user-name');
const callButton = document.querySelector('#call');
const hangupButton = document.querySelector('#hangup');
const connectButton = document.querySelector('#connect');
const tokenInput = document.querySelector('#token-input');
const roomInput = document.querySelector('#room-input');
const connectionStatusEl = document.querySelector('#connection-status');
const renderedOffers = new Set();

let socket = null;
let userName = '';
let roomId = '';
let localStream;
let remoteStream;
let peerConnection;
let didIOffer = false;
let activePeerUserName = null;

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

const call = async () => {
    if (!socket || !socket.connected) {
        connectionStatusEl.textContent = 'Connect first to start a call.';
        return;
    }

    await fetchUserMedia();
    await createPeerConnection();

    try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        didIOffer = true;
        waitingEl.style.display = 'block';
        socket.emit('newOffer', offer);
    } catch (error) {
        console.error(error);
    }
};

const answerOffer = async (offerObj) => {
    await fetchUserMedia();
    await createPeerConnection(offerObj);

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    offerObj.answer = answer;
    activePeerUserName = offerObj.offererUserName;

    const offerIceCandidates = await socket.emitWithAck('newAnswer', offerObj);
    offerIceCandidates.forEach((candidate) => {
        peerConnection.addIceCandidate(candidate);
    });
};

const addAnswer = async (offerObj) => {
    if (!peerConnection) {
        return;
    }

    await peerConnection.setRemoteDescription(offerObj.answer);
};

const fetchUserMedia = async () => {
    try {
        if (localStream) {
            return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        localVideoEl.srcObject = stream;
        localStream = stream;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const createPeerConnection = async (offerObj) => {
    peerConnection = new RTCPeerConnection(peerConfiguration);
    remoteStream = new MediaStream();
    remoteVideoEl.srcObject = remoteStream;

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.addEventListener('icecandidate', (event) => {
        if (event.candidate) {
            socket.emit('sendIceCandidateToSignalingServer', {
                iceCandidate: event.candidate,
                iceUserName: userName,
                didIOffer
            });
        }
    });

    peerConnection.addEventListener('track', (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
        });
    });

    peerConnection.addEventListener('connectionstatechange', () => {
        if (peerConnection.connectionState === 'connected') {
            waitingEl.style.display = 'none';
        }

        if (
            peerConnection.connectionState === 'failed' ||
            peerConnection.connectionState === 'disconnected' ||
            peerConnection.connectionState === 'closed'
        ) {
            waitingEl.style.display = 'none';
        }
    });

    if (offerObj) {
        await peerConnection.setRemoteDescription(offerObj.offer);
    }
};

const addNewIceCandidate = (iceCandidate) => {
    if (!peerConnection) {
        return;
    }

    peerConnection.addIceCandidate(iceCandidate);
};

const hangupLocally = () => {
    waitingEl.style.display = 'none';

    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }

    if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        localStream = null;
    }

    localVideoEl.srcObject = null;

    if (remoteStream) {
        remoteStream.getTracks().forEach((track) => track.stop());
    }
    remoteStream = null;
    remoteVideoEl.srcObject = null;

    didIOffer = false;
    activePeerUserName = null;
};

const hangup = () => {
    if (!socket || !socket.connected) {
        return;
    }

    if (activePeerUserName) {
        socket.emit('hangup', { targetUserName: activePeerUserName });
    }

    hangupLocally();
};

const connectSignaling = () => {
    const token = tokenInput.value.trim();
    const selectedRoom = roomInput.value.trim() || 'general';

    if (!token) {
        connectionStatusEl.textContent = 'JWT token is required.';
        return;
    }

    if (socket) {
        socket.disconnect();
    }

    answerContainer.innerHTML = '';
    renderedOffers.clear();
    hangupLocally();

    roomId = selectedRoom;
    connectionStatusEl.textContent = `Connecting to room "${roomId}"...`;

    socket = io('/calls', {
        auth: {
            token,
            roomId
        },
        reconnection: false
    });

    registerSocketListeners(socket);

    socket.on('connect', () => {
        callButton.disabled = false;
        hangupButton.disabled = false;
    });

    socket.on('disconnect', () => {
        callButton.disabled = true;
        hangupButton.disabled = true;
        connectionStatusEl.textContent = 'Disconnected.';
    });

    socket.on('connect_error', (error) => {
        connectionStatusEl.textContent = `Connection failed: ${error.message}`;
    });

    socket.on('signalingReady', (payload) => {
        userName = payload.userName;
        userNameEl.textContent = `Bejelentkezve: ${userName}`;
        connectionStatusEl.textContent = `Connected to room "${payload.roomId}".`;
    });
};

connectButton.addEventListener('click', connectSignaling);
callButton.addEventListener('click', call);
hangupButton.addEventListener('click', hangup);
