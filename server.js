const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

const onlineUsers = [];
let activeAccounts = 0;

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('newUser', (user) => {
    onlineUsers.push({
      id: user.id,
      socketId: socket.id,
    });
    activeAccounts++;
    io.emit('onlineUser', onlineUsers);
    io.emit('activeAccounts', activeAccounts);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const index = onlineUsers.findIndex((user) => user.socketId === socket.id);
    if (index !== -1) {
      onlineUsers.splice(index, 1);
      activeAccounts--;
      io.emit('onlineUser', onlineUsers);
      io.emit('activeAccounts', activeAccounts);
    }
  });
});

// Server listening
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
