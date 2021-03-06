const mongoose = require('mongoose');

const lastBlocksSchema = new mongoose.Schema({
  templateId: {
    type: String,
    required: true,
  },
  sceneId: {
    type: String,
    required: true,
  },
  sceneTitle: {
    type: String,
    required: true,
  },
  sceneThumbnail: {
    type: String,
  },
  sceneData: {
    type: Object,
  },

}, {timestamps: true});

module.exports = mongoose.model('LastBlock', lastBlocksSchema);
