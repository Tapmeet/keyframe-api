/* eslint-disable linebreak-style */
/* eslint-disable no-invalid-this */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const Token = require('../models/token');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: 'Your email is required',
    trim: true,
  },
  profileImage: {
    type: String,
    required: false,

  },
  socialLoginId: {
    type: String,
  },
  loginType: {
    type: String,
  },
  password: {
    type: String,
    required: 'Your password is required',
    max: 100,
  },

  firstName: {
    type: String,
    required: 'First Name is required',
    max: 100,
  },
  phone: {
    type: String,
    required: false,
  },
  website: {
    type: String,
    required: false,
  },
  agencyname: {
    type: String,
    required: false,
  },
  agencylogo: {
    type: String,
    required: false,
  },
  bio: {
    type: String,
    required: false,
    max: 255,
  },

  isVerified: {
    type: Boolean,
    default: false,
  },
  userRole: {
    type: String,
    default: 'customer',
  },
  userPlan: {
    type: String,
    default: '0',
  },
  userPlanBuyDate: {
    type: Date,
    required: false,
  },
  newsNotification: {
    type: Boolean,
    default: false,
  },
  resetPasswordToken: {
    type: String,
    required: false,
  },

  resetPasswordExpires: {
    type: Date,
    required: false,
  },
  billing_address_1: {
    type: String,
  },
  billing_address_2: {
    type: String,
  },
  billing_state: {
    type: String,
  },
  billing_city: {
    type: String,
  },
  billing_zip: {
    type: String,
  },
  billing_country: {
    type: String,
  },
  shipping_address_1: {
    type: String,
  },
  shipping_address_2: {
    type: String,
  },
  shipping_city: {
    type: String,
  },
  shipping_state: {
    type: String,
  },
  shipping_zip: {
    type: String,
  },
  shipping_country: {
    type: String,
  },
}, {timestamps: true});


UserSchema.pre('save', function(next) {
  const user = this;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);

      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.generateJWT = function() {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  const payload = {
    id: this._id,
    _id: this._id,
    email: this.email,
    firstName: this.firstName,
    language: this.language,
    phone: this.phone,
    userRole: this.userRole,
    website: this.website,
    agencyname: this.agencyname,
    agencylogo: this.agencylogo,
    profileImage: this.profileImage,
    userPlan: this.userPlan,
    loginType: this.loginType,
    billing_address_1:
      this.billing_address_1,
    billing_address_2:
      this.billing_address_2,
    billing_city: this.billing_city,
    billing_state:
      this. billing_state,
    billing_zip:
      this.billing_zip,
    billing_country:
      this. billing_country,
    shipping_address_1:
      this.shipping_address_1,
    shipping_address_2:
      this.shipping_address_2,
    shipping_city:
      this.shipping_city,
    shipping_state:
      this.shipping_state,
    shipping_zip:
      this.shipping_zip,
    shipping_country:
      this.shipping_country
    ,
  };

  return jwt.sign(payload, new Buffer.from( process.env.JWT_SECRET, 'base64' ));
};

UserSchema.methods.generatePasswordReset = function() {
  this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordExpires = Date.now() + 3600000; // expires in an hour
};

UserSchema.methods.generateVerificationToken = function() {
  const payload = {
    userId: this._id,
    token: crypto.randomBytes(20).toString('hex'),
  };

  return new Token(payload);
};

module.exports = mongoose.model('Users', UserSchema);
