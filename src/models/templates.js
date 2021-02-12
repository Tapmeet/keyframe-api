const mongoose = require('mongoose');

const templatesSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User',
  },
  sceneOrder: {
    type: Array,
  },

}, {timestamps: true});

module.exports = mongoose.model('Templates', templatesSchema)