const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    eventImage: {
        type: String,
        required: false
    },
    title: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: false
    },
    eventDate: {
        type: Date,
        required: false
    },
    enterTime: {
        type: String,
        required: false
    },
    startTime: {
        type: String,
        required: false
    },
    arenaName: {
        type: String,
        required: false
    },
    categories: {
        type: [],
        required: false
    },
    mapLink: {
        type: String,
        required: false
    },
    iframeLink: {
        type: String,
        required: false
    },
    eventDetails: {
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

module.exports = mongoose.model('Event', eventSchema)