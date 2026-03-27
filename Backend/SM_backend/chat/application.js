const path = require('path');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const { accessTokenSecret } = require('../config/jwt');

function initializeChat(server, app) {
    const io = new Server(server);
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
                'general';

            socket.data.user = decoded;
            socket.data.roomId = roomId;
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

        roomState.users.push({
            socketId: socket.id,
            userName
        });

        socket.emit('signalingReady', {
            roomId,
            userName
        });

        if (roomState.offers.length) {
            socket.emit('availableOffers', roomState.offers);
        }

        socket.on('disconnect', () => {
            removeDisconnectedUser(socket.id, roomId);
        });

        socket.on('newOffer', (newOffer) => {
            roomState.offers.push({
                offererUserName: userName,
                offer: newOffer,
                offerIceCandidates: [],
                answererUserName: null,
                answer: null,
                answererIceCandidates: []
            });

            socket.to(roomId).emit('newOfferAwaiting', roomState.offers.slice(-1));
        });

        socket.on('newAnswer', (offerObj, ackFunction) => {
            const socketToAnswer = roomState.users.find(
                (entry) => entry.userName === offerObj.offererUserName
            );

            if (!socketToAnswer) {
                return;
            }

            const offerToUpdate = roomState.offers.find(
                (entry) => entry.offererUserName === offerObj.offererUserName
            );

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
            if (!targetUserName) {
                return;
            }

            const socketToSendTo = roomState.users.find(
                (entry) => entry.userName === targetUserName
            );

            if (socketToSendTo) {
                socket.to(socketToSendTo.socketId).emit('peerHangup', { from: userName });
            }
        });
    });
}

module.exports = initializeChat;
