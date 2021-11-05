const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  adminId: {
    type: String,
    required: true,
  },
  memberId: {
    type: String,
    required: true,
  },
  memberName: {
    type: String,
    required: true,
  },
  memberPhone: {
    type: String,

  },
  memberEmail: {
    type: String,
    required: true,
  },
  memberProfilePic: {
    type: String,
  },
  approve: {
    type: Boolean,
    default: false,
  },

}, {timestamps: true});

module.exports = mongoose.model('team', teamSchema);
