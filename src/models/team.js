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
    required: true,
  },
  memberEmail: {
    type: String,
    required: true,
  },
  memberProfilePic: {
    type: String,
    required: true,
  },

}, {timestamps: true});

module.exports = mongoose.model('team', teamSchema);
