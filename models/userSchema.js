const mongoose = require("mongoose");
const bcrypt = require("bcrypt")

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  created_date: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  salt: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  favorites: [{
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'visualizations',
  }],
  visualizations: [{
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'visualizations',
  }],
});

const UsersModel = mongoose.model("users", userSchema);

module.exports = UsersModel;
