const mongoose = require('mongoose');

const divisonSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },

    number: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        required: false
    },
    pickOrDraw: {
        type: String,
        required: false
    },
    timesEnter: {
        type: String,
        required: false
    },
    noOfSteers: {
        type: String,
        required: false
    },
    handicap: {
        type: String,
        required: false
    },
    cap: {
        type: String,
        required: false
    },
    payback: {
        type: String,
        required: false
    },
    detail1: {
        type: String,
        required: false
    },
    detail2: {
        type: String,
        required: false
    },
    detail3: {
        type: String,
        required: false
    },
    finePrint: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: 43200
    }

}, {timestamps: true});

module.exports = mongoose.model('Divison', divisonSchema)