const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    title: String,
    content: String,
    owner: mongoose.Schema.Types.ObjectId,
    versions: {
        type: [
            {
                title: String,
                content: String,
                timestamp: Date,
            },
        ],
        default: [], // Initialize as an empty array
    },
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);
