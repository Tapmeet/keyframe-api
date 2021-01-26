const mongoose = require('mongoose');

const templatesSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User',
  },

}, {timestamps: true});

module.exports = mongoose.model('Templates', templatesSchema)