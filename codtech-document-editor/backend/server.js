const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000
});

const rooms = {};

io.on('connection', (socket) => {
  console.log('New connection:', socket.id);

  // Join room handler
  socket.on('join-room', ({ roomId, username }) => {
    try {
      socket.join(roomId);
      
      if (!rooms[roomId]) {
        rooms[roomId] = {
          content: '<p style="font-family: Calibri, sans-serif; font-size: 11pt; line-height: 1.5;">Start typing...</p>',
          users: []
        };
      }

      const user = { id: socket.id, name: username };
      rooms[roomId].users.push(user);

      socket.emit('room-data', rooms[roomId]);
      socket.to(roomId).emit('user-joined', user);
      
    } catch (err) {
      console.error('Join error:', err);
      socket.emit('error', 'Failed to join room');
    }
  });

  // Content sync handler
  socket.on('content-change', ({ roomId, content }) => {
    if (rooms[roomId]) {
      rooms[roomId].content = content;
      socket.to(roomId).emit('content-changed', content);
    }
  });

  // Leave room handler
  socket.on('leave-room', ({ roomId }) => {
    socket.leave(roomId);
    if (rooms[roomId]) {
      rooms[roomId].users = rooms[roomId].users.filter(u => u.id !== socket.id);
      socket.to(roomId).emit('user-left', socket.id);
      
      if (rooms[roomId].users.length === 0) {
        delete rooms[roomId];
      }
    }
  });

  // Cleanup on disconnect
  socket.on('disconnect', () => {
    Object.keys(rooms).forEach(roomId => {
      rooms[roomId].users = rooms[roomId].users.filter(u => u.id !== socket.id);
      if (rooms[roomId].users.length === 0) {
        delete rooms[roomId];
      } else {
        io.to(roomId).emit('user-left', socket.id);
      }
    });
  });

  // Error handling
  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});