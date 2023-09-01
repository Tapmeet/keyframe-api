const mongoose = require('mongoose');

const templatesBlocksSchema = new mongoose.Schema({
  templateId: {
    type: String,
    required: true,
  },
  order: {
    type: String,
  },
  sceneId: {
    type: String,
    required: true,
  },
  sceneTitle: {
    type: String,
    required: true,
  },
  sceneType: {
    type: String,
  },
  sceneThumbnail: {
    type: String,
  },
  sceneData: {
    type: Object,
  },

}, {timestamps: true});

module.exports = mongoose.model('TemplateBlocks', templatesBlocksSchema);
