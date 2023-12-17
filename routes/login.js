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
    const { usernameOrEmail, password } = req.body;

    const user = await UsersModel.findOne({
        $or: [
          { username: usernameOrEmail },
          { email: usernameOrEmail.toLowerCase() }, // Assuming emails are stored in lowercase
        ],
      });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      secretKey, 
    //   { expiresIn: "1h" }
    );

    res.json({ status: "success", message: "Login successful", data: { token } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
