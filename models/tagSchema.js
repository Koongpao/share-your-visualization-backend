const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  is_library: {
    type: Boolean,
    required: true,
    default: false,
  },
  created_date: {
    type: Date,
    default: () => Date.now(),
  },
  status: {
    type: String,
    required: true,
    enum: ["approved", "pending", "disapproved"],
    default: "pending",
  },
  creator: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "users",
  },
});

const TagsModel = mongoose.model("tags", tagSchema);

module.exports = TagsModel;
