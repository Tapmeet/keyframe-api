const mongoose = require('mongoose');

const UploadMediaSchema = new mongoose.Schema(
    {
      userId: {
        type: String,
      },
      filename: {
        type: String,
      },
      originalname: {
        type: String,
      },
      mimetype: {
        type: String,
      },
      path: {
        type: String,
      },
      size: {
        type: String,
      },
      adminMedia: {
        type: Boolean,
        default: false,
      },
    },
    {timestamps: true},
);

module.exports = mongoose.model('UploadMedia', UploadMediaSchema);
