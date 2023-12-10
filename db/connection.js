require("dotenv").config()
const mongoose = require("mongoose")

const {DATABASE_URL} = process.env

mongoose
  .connect(DATABASE_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

module.exports = mongoose