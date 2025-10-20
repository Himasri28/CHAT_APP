// server.js
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

// Optional: uncomment if using MongoDB
const mongoose = require('mongoose');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from public/
app.use(express.static(path.join(__dirname, 'public')));

// Basic HTTP endpoint
app.get('/health', (req, res) => res.send({ status: 'ok' }));

// Simple in-memory store for last 100 messages (fallback if no DB)
let recentMessages = [];

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // If you persist messages, load last messages and emit to the client on join
  socket.emit('chat_history', recentMessages);

  // Join room (optional)
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`${socket.id} joined ${room}`);
  });

  // Listen for chat messages from client
  socket.on('chat_message', (payload) => {
    // payload: { username, text, room (optional), timestamp }
    const msg = {
      id: Date.now(), // simple id
      username: payload.username || 'Anonymous',
      text: payload.text,
      timestamp: payload.timestamp || new Date().toISOString(),
      room: payload.room || null
    };

    // Save to recentMessages (keep last 100)
    recentMessages.push(msg);
    if (recentMessages.length > 100) recentMessages.shift();

    // Optionally save to DB:
    const dbMsg = new Message(msg);
    dbMsg.save().catch(err => console.error('DB save err', err));

    // Emit to everyone or to the room
    if (msg.room) {
      io.to(msg.room).emit('chat_message', msg);
    } else {
      io.emit('chat_message', msg);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Optional: connect to MongoDB

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/chatapp';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('MongoDB connected'))
  .catch(err => console.warn('MongoDB connection error', err));


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
