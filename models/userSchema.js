const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: {},
    created_date: {},
    role: {},
    email: {},
    salt: {},
    password: {},
    favorites: {},
    visualizations: {},
})