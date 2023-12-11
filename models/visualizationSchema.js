const mongoose = require("mongoose")

const visualizationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    creator: {},
    date: {},
    description: {},
    image: {},
    code: {},
    library: {},
    tag: {},
    externalLink: {},
    likes: {},
    status: {},
})

module.exports = mongoose.model("visualization", visualizationSchema)