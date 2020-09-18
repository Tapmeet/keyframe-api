const mongoose = require('mongoose');

const templatesBlocksSchema = new mongoose.Schema({
    templateId: {
        type: String,
        required: true,
    },
    templateNumber: {
        type: String,
        required: true,
    },
    blockId: {
        type: String,
        required: true,
    },
    blockData: {
        type: Object,
        required: true,
    },

}, {timestamps: true});

module.exports = mongoose.model('TemplateBlocks', templatesBlocksSchema);