const mongoose = require("mongoose");

const visualizationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    creator: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    code: {
        type: String,
        lowercase: true,
    },
    library: {
        type: String,
    },
    tag: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "tags",
        }
    ],
    externalLink: {
        type: String,
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
        }
    ],
    status: {
        type: String,
        enum: ["approved", "pending", "disapproved"],
        default: "pending",
    },
});

const VisualizationsModel = mongoose.model("visualizations", visualizationSchema);

module.exports = VisualizationsModel;