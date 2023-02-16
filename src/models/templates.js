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
  fontSize: {
    type: String,
  },
  fontFamily: {
    type: String,
  },
  fontColor: {
    type: String,
  },
  fontWeight: {
    type: String,
  },
  templateScenes: {
    type: Array,
  },
  templateId: {
    type: String,
  },
  lastSceneOption: {
    type: Boolean,
    default: false,
  },

}, {timestamps: true});

module.exports = mongoose.model('Templates', templatesSchema);
