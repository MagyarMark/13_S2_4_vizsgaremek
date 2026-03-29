const path = require('path');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const { accessTokenSecret } = require('../config/jwt');

function initializeChat(server, app) {
    const allowedExactOrigins = new Set([
        'http://localhost:5173',
        'http://localhost:5174'
    ]);

    const envAllowedOrigins = (process.env.SOCKET_ALLOWED_ORIGINS || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

    envAllowedOrigins.forEach((origin) => allowedExactOrigins.add(origin));

    const corsOrigin = (origin, callback) => {
        if (!origin) {
            callback(null, true);
            return;
        }

        const isAllowedExact = allowedExactOrigins.has(origin);

        if (isAllowedExact) {
            callback(null, true);
            return;
        }

        callback(new Error(`Origin not allowed by Socket.IO CORS: ${origin}`));
    };

    const io = new Server(server, {
        cors: {
            origin: corsOrigin,
            methods: ['GET', 'POST'],
            credentials: true
        }
    });
    const signalingNsp = io.of('/calls');

    if (app) {
        app.use('/chat', require('express').static(path.join(__dirname, 'public')));
        app.use('/calls', require('express').static(path.join(__dirname, 'public', 'calls')));
    }

    const socketsConnected = new Set();

    const roomStates = new Map();

    const getRoomState = (roomId) => {
        if (!roomStates.has(roomId)) {
            roomStates.set(roomId, {
                offers: [],
                users: []
            });
        }

        return roomStates.get(roomId);
    };

    const removeDisconnectedUser = (socketId, roomId) => {
        const roomState = roomStates.get(roomId);

        if (!roomState) {
            return;
        }

        const user = roomState.users.find((entry) => entry.socketId === socketId);

        if (!user) {
            return;
        }

        const index = roomState.users.findIndex((entry) => entry.socketId === socketId);
        roomState.users.splice(index, 1);

        for (let i = roomState.offers.length - 1; i >= 0; i -= 1) {
            if (
                roomState.offers[i].offererUserName === user.userName ||
                roomState.offers[i].answererUserName === user.userName
            ) {
                roomState.offers.splice(i, 1);
            }
        }

        if (!roomState.users.length && !roomState.offers.length) {
            roomStates.delete(roomId);
        }
    };

    io.on('connection', (socket) => {
        console.log(socket.id);
        socketsConnected.add(socket.id);

        io.emit('clients-total', socketsConnected.size);

        socket.on('disconnect', () => {
            console.log('Socket disconnected', socket.id);
            socketsConnected.delete(socket.id);
            io.emit('clients-total', socketsConnected.size);
        });

        socket.on('message', (data) => {
            console.log(data);
            socket.broadcast.emit('chat-message', data);
        });

        socket.on('chat-event', (data) => {
            socket.broadcast.emit('chat-event', data);
        });

        socket.on('feedback', (data) => {
            socket.broadcast.emit('feedback', data);
        });
    });

    signalingNsp.use((socket, next) => {
        const token = socket.handshake.auth?.token;

        if (!token) {
            return next(new Error('Token required for call signaling'));
        }

        try {
            const decoded = jwt.verify(token, accessTokenSecret);
            const roomId =
                String(socket.handshake.auth?.roomId || '').trim() ||
                'hívás';

            socket.data.user = decoded;
            socket.data.roomId = roomId;
            socket.data.userId = decoded.id || decoded.felhasznalo_id || decoded.userId || null;
            socket.data.userName =
                decoded.felhasznalonev ||
                decoded.email ||
                `User-${decoded.id || socket.id.slice(0, 6)}`;

            return next();
        } catch (error) {
            return next(new Error('Invalid or expired token'));
        }
    });

    signalingNsp.on('connection', (socket) => {
        const { roomId, userName } = socket.data;
        const roomState = getRoomState(roomId);

        socket.join(roomId);

        console.log(`[SIGNALING] User connected: ${userName} (socket: ${socket.id.slice(0, 8)}) in room: ${roomId}`);

        roomState.users.push({
            socketId: socket.id,
            userId: socket.data.userId,
            userName
        });

        console.log(`[SIGNALING] Room ${roomId} now has ${roomState.users.length} users`);

        socket.emit('signalingReady', {
            roomId,
            userName
        });

        const availableOffers = roomState.offers.filter((offer) => {
            if (offer.answer || offer.offererSocketId === socket.id) {
                return false;
            }

            if (Number.isFinite(Number(offer.targetUserId))) {
                return Number(offer.targetUserId) === Number(socket.data.userId);
            }

            if (offer.targetUserName) {
                return offer.targetUserName === userName;
            }

            return true;
        });

        if (availableOffers.length) {
            console.log(`[SIGNALING] Sending ${availableOffers.length} available offers to ${userName}`);
            socket.emit('availableOffers', availableOffers);
        }

        socket.on('disconnect', () => {
            console.log(`[SIGNALING] User disconnected: ${userName} (socket: ${socket.id.slice(0, 8)}) from room: ${roomId}`);
            removeDisconnectedUser(socket.id, roomId);
        });

        socket.on('newOffer', (newOfferPayload, ackFunction) => {
            const offer = newOfferPayload?.offer || newOfferPayload;
            const targetUserName = String(newOfferPayload?.targetUserName || '').trim();
            const targetUserId = Number(newOfferPayload?.targetUserId);

            console.log(`[SIGNALING] newOffer received from ${userName} in room ${roomId}`);
            const offerToStore = {
                id: `${Date.now()}-${socket.id}`,
                offererUserName: userName,
                offererSocketId: socket.id,
                targetUserName: targetUserName || null,
                targetUserId: Number.isFinite(targetUserId) ? targetUserId : null,
                offer,
                offerIceCandidates: [],
                answererUserName: null,
                answer: null,
                answererIceCandidates: []
            };

            roomState.offers.push(offerToStore);

            let targetUsers = roomState.users.filter((entry) => entry.socketId !== socket.id);

            if (Number.isFinite(targetUserId)) {
                targetUsers = targetUsers.filter((entry) => Number(entry.userId) === Number(targetUserId));
            } else if (targetUserName) {
                targetUsers = targetUsers.filter((entry) => entry.userName === targetUserName);
            }

            const hasExplicitTarget = Number.isFinite(targetUserId) || Boolean(targetUserName);
            if (!hasExplicitTarget && targetUsers.length === 0) {
                targetUsers = roomState.users.filter((entry) => entry.socketId !== socket.id);
            }

            if (hasExplicitTarget && targetUsers.length === 0) {
                console.warn(`[SIGNALING] Explicit target not found (targetUserId=${targetUserId}, targetUserName='${targetUserName}') in room ${roomId}`);
            }

            console.log(`[SIGNALING] Sending newOfferAwaiting to ${targetUsers.length} other users in room ${roomId}`);
            targetUsers.forEach((entry) => {
                signalingNsp.to(entry.socketId).emit('newOfferAwaiting', [offerToStore]);
            });
            console.log(`[SIGNALING] newOfferAwaiting emitted successfully`);

            if (typeof ackFunction === 'function') {
                ackFunction({
                    deliveredTo: targetUsers.length,
                    roomUsers: roomState.users.length,
                    targetUserName: targetUserName || null,
                    offerId: offerToStore.id
                });
            }
        });

        socket.on('newAnswer', (offerObj, ackFunction) => {
            const socketToAnswer = roomState.users.find(
                (entry) => entry.userName === offerObj.offererUserName
            );

            if (!socketToAnswer) {
                return;
            }

            const offerToUpdate = roomState.offers.find((entry) => {
                if (offerObj?.id) {
                    return entry.id === offerObj.id;
                }

                return entry.offererUserName === offerObj.offererUserName;
            });

            if (!offerToUpdate) {
                return;
            }

            if (typeof ackFunction === 'function') {
                ackFunction(offerToUpdate.offerIceCandidates);
            }

            offerToUpdate.answer = offerObj.answer;
            offerToUpdate.answererUserName = userName;

            socket.to(socketToAnswer.socketId).emit('answerResponse', offerToUpdate);
        });

        socket.on('sendIceCandidateToSignalingServer', (iceCandidateObj) => {
            const { didIOffer, iceUserName, iceCandidate } = iceCandidateObj;

            if (didIOffer) {
                const offerInOffers = roomState.offers.find(
                    (entry) => entry.offererUserName === iceUserName
                );

                if (!offerInOffers) {
                    return;
                }

                offerInOffers.offerIceCandidates.push(iceCandidate);

                if (offerInOffers.answererUserName) {
                    const socketToSendTo = roomState.users.find(
                        (entry) => entry.userName === offerInOffers.answererUserName
                    );

                    if (socketToSendTo) {
                        socket
                            .to(socketToSendTo.socketId)
                            .emit('receivedIceCandidateFromServer', iceCandidate);
                    }
                }

                return;
            }

            const offerInOffers = roomState.offers.find(
                (entry) => entry.answererUserName === iceUserName
            );

            if (!offerInOffers) {
                return;
            }

            const socketToSendTo = roomState.users.find(
                (entry) => entry.userName === offerInOffers.offererUserName
            );

            if (socketToSendTo) {
                socket
                    .to(socketToSendTo.socketId)
                    .emit('receivedIceCandidateFromServer', iceCandidate);
            }
        });

        socket.on('hangup', ({ targetUserName } = {}) => {
            let resolvedTargetUserName = String(targetUserName || '').trim();

            if (!resolvedTargetUserName) {
                const pendingOffer = roomState.offers.find((entry) => entry.offererUserName === userName && !entry.answer);
                if (pendingOffer) {
                    resolvedTargetUserName = pendingOffer.targetUserName || pendingOffer.answererUserName || '';
                }
            }

            for (let i = roomState.offers.length - 1; i >= 0; i -= 1) {
                const offer = roomState.offers[i];
                if (
                    offer.offererUserName === userName ||
                    offer.answererUserName === userName ||
                    (offer.targetUserName === userName && !offer.answer)
                ) {
                    roomState.offers.splice(i, 1);
                }
            }

            if (!resolvedTargetUserName) {
                return;
            }

            const socketToSendTo = roomState.users.find(
                (entry) => entry.userName === resolvedTargetUserName
            );

            if (socketToSendTo) {
                socket.to(socketToSendTo.socketId).emit('peerHangup', { from: userName });
            }
        });
    });
}

module.exports = initializeChat;
