// models/Message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  username: String,
  text: String,
  timestamp: { type: Date, default: Date.now },
  room: String
});

module.exports = mongoose.model('Message', MessageSchema);
