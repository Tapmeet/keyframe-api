const mongoose = require('mongoose');

const templatesSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    templateNumber: {
        type: String,
        required: true,
    },
    globalFontTitle: {
        type: String,
    },
    globalFontSubTitle: {
        type: String,
    },
    globaltitleColor: {
        type: String,
    },
    globalsubtitleColor: {
        type: String,
    },
    globalfontFamily: {
        type: String,
    },
}, {timestamps: true});

module.exports = mongoose.model('Templates', templatesSchema);