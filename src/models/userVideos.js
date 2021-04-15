const mongoose = require('mongoose');

const UserVideoschema = new mongoose.Schema({
  userId: {
    type: String,
  },
  path: {
    type: String,
  },
  templateImage: {
    type: String,
  },
  videoTitle: {
    type: String,
  },

}, {timestamps: true});

module.exports = mongoose.model('UserVideos', UserVideoschema);
