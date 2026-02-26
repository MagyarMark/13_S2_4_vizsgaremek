const path = require('path');
const { Server } = require('socket.io');

function initializeChat(server, app) {
    const io = new Server(server);

    if (app) {
        app.use('/chat', require('express').static(path.join(__dirname, 'public')));
    }

    const socketsConnected = new Set();

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
}

module.exports = initializeChat;
