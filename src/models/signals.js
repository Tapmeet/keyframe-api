const mongoose = require('mongoose');

const signalsSchema = new mongoose.Schema({
  codeString: {
    type: String,
    required: true,
    unique: true,
  },
  codeNumeric: {
    type: String,
  },
}, {timestamps: true});

module.exports = mongoose.model('Signals', signalsSchema);
