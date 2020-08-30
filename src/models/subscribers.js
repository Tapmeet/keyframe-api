const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriberSchema = new Schema({
   endpoint: String,
   p256dh: String,
   auth: String,
   createDate: {
       type: Date,
       default: Date.now
   }
});

module.exports = mongoose.model('subscribers', SubscriberSchema, 'subscribers');