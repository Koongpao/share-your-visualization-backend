const { Router } = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const UsersModel = require("../models/userSchema");

require("dotenv").config();
const secretKey = process.env.SECRET_KEY;

const router = Router();

//Login - POST /api/login
router.post("/", async (req, res) => {
  try {
    let { usernameOrEmail, password } = req.body;
    usernameOrEmail = usernameOrEmail.toLowerCase();

    const user = await UsersModel.findOne({
      $or: [
        { username: usernameOrEmail },
        { email: usernameOrEmail }, // Assuming emails are stored in lowercase
      ],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials", success: false });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials", success: false });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      secretKey
      //   { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", data: { token }, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
});

module.exports = router;
