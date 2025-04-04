const io = require('socket.io')(server);

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Listen for cursor updates
    socket.on('cursor-update', (data) => {
        // Broadcast cursor position to other users
        socket.broadcast.emit('cursor-update', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});