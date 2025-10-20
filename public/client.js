const socket = io();

// DOM
const messagesEl = document.getElementById('messages');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const usernameInput = document.getElementById('username');
const roomInput = document.getElementById('room');
const joinBtn = document.getElementById('joinBtn');

let currentRoom = null;

// Helper to append message
function addMessage(msg) {
  const el = document.createElement('div');
  el.className = 'message';
  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = `${msg.username} • ${new Date(msg.timestamp).toLocaleTimeString()}`;
  const txt = document.createElement('div');
  txt.textContent = msg.text;
  el.appendChild(meta);
  el.appendChild(txt);
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// On initial chat history load
socket.on('chat_history', (arr) => {
  messagesEl.innerHTML = ''; // clear
  arr.forEach(addMessage);
});

// On new message
socket.on('chat_message', (msg) => {
  addMessage(msg);
});

// Join room button
joinBtn.addEventListener('click', () => {
  const room = roomInput.value.trim();
  if (room) {
    currentRoom = room;
    socket.emit('join_room', room);
    messagesEl.innerHTML = '';
  } else {
    currentRoom = null;
    // leaving room: simply set to null locally; server will emit to everyone
  }
});

// Send message
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;
  const payload = {
    username: usernameInput.value.trim() || 'Anonymous',
    text,
    room: currentRoom,
    timestamp: new Date().toISOString()
  };
  socket.emit('chat_message', payload);
  messageInput.value = '';
});
