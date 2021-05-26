const mongoose = require('mongoose');

const templatesSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User',
  },
  title: {
    type: String,
  },
  templateImage: {
    type: String,
  },
  templatePreview: {
    type: String,
  },
  adminTemplate: {
    type: Boolean,
  },
  templateCategory: {
    type: String,
  },
  musicFile: {
    type: String,
  },
  templateScenes: {
    type: Array,
  },

}, {timestamps: true});

module.exports = mongoose.model('Templates', templatesSchema);
