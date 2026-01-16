const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  language: {
    type: String,
    enum: ['en', 'hi', 'ta'],
    default: 'en'
  },
  profileSetup: {
    type: Boolean,
    default: false
  },
  location: {
    state: String,
    district: String
  },
  farmDetails: {
    crops: [String],
    landSize: String,
    irrigation: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

module.exports = mongoose.model('User', userSchema);
