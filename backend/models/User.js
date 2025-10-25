const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['viewer', 'editor'], default: 'viewer' },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
  bio: { type: String },
  subscribe: { type: Boolean, default: false },
  joinCommunity: { type: Boolean, default: false },
  profileImage: { type: String }, // Store the image path/URL
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
