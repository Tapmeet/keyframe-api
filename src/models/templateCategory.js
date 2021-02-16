const mongoose = require('mongoose');

const templateCategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  categoryImage: {
    type: String,
    required: true,
  },

}, {timestamps: true});

module.exports = mongoose.model('templateCategory', templateCategorySchema);
