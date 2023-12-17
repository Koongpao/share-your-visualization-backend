const { Router } = require("express");
const bcrypt = require("bcrypt");
const UsersModel = require("../models/userSchema");

const router = Router();

//Register - POST /api/users
router.post("/", async (req, res) => {
  const { username, password, email } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format', code: 2 });
  }

  try {
    const existingUser = await UsersModel.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "User with this username or email already exists", code: 1 });
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new UsersModel({
      username: username,
      email: email,
      salt: salt,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;