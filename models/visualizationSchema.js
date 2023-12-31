const mongoose = require("mongoose");

const visualizationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  creator: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "users",
    required: true,
  },
  created_date: {
    type: Date,
    default: () => Date.now(),
  },
  description: {
    type: String,
  },
  image: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    lowercase: true,
  },
  library: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tags",
  },
  tags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tags",
    },
  ],
  externalLink: {
    type: String,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  ],
  status: {
    type: String,
    enum: ["approved", "pending", "disapproved"],
    default: "pending",
  },
});

const VisualizationsModel = mongoose.model("visualizations", visualizationSchema);

module.exports = VisualizationsModel;
