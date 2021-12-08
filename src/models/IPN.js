const mongoose = require('mongoose');

const ipnSchema = new mongoose.Schema(
    {
      userId: {
        type: String,
        required: true,
      },
      buyer_first_name: {
        type: String,
        required: true,
      },
      buyer_last_name: {
        type: String,
        required: true,
      },
      transaction_id: {
        type: String,
      },
      tracking_id: {
        type: String,
      },
      transaction_time: {
        type: String,
      },
      product_id: {
        type: String,
      },
      product_name: {
        type: String,
      },
      buyer_email: {
        type: String,
        required: true,
      },
      mode: {
        type: String,
      },
      payment_processor: {
        type: String,
      },
      amount: {
        type: String,
      },
      buyer_ip: {
        type: String,
      },
    },
    {timestamps: true},
);

module.exports = mongoose.model('ipn', ipnSchema);
