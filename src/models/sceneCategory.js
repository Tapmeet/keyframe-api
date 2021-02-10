const mongoose = require('mongoose');

const sceneCategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  categoryImage: {
    type: String,
    required: true,
  },

}, {timestamps: true});

module.exports = mongoose.model('sceneCategory', sceneCategorySchema);
