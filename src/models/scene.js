const mongoose = require('mongoose');

const sceneSchema = new mongoose.Schema({
  sceneTitle: {
    type: String,
    required: true,
  },
  sceneId: {
    type: String,
    required: true,
  },
  sceneThumbnail: {
    type: String,
  },
  sceneCategory: {
    type: String,
  },
  sceneType: {
    type: String,
  },
  sceneData: {
    type: Object,
  },

}, {timestamps: true});

module.exports = mongoose.model('scene', sceneSchema);
