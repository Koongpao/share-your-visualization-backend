const { Router } = require("express");
const bcrypt = require("bcrypt");
const UsersModel = require("../models/userSchema");

const verifyToken = require("../middleware/authenticate");

const router = Router();

router.get("/", (req, res) => {
  res.send({
    message: "This is the test route to make sure users route is working",
  });
});

//SignUp - POST /api/users
router.post("/", async (req, res) => {
  let { username, password, email } = req.body;

  username = username.toLowerCase();
  email = email.toLowerCase();

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format", success: false });
  }

  try {
    const existingUser = await UsersModel.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ message: "Username already exists", success: false, error_code: 1 });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ message: "Email already exists", success: false, error_code: 2 });
      }
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

    res.status(201).json({ message: "User registered successfully", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", success: false, error: error });
  }
});

//GetMyInformation - GET /api/users/me
router.get("/me", verifyToken, async (req, res) => {
  try {
    userIdfromToken = req.decoded.userId;

    const user = await UsersModel.findById(userIdfromToken);

    const response = {
      success: true,
      message: "User information retrieved successfully",
      data: {
        username: user.username,
        role: user.username,
      },
    };
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to retrieve user information" });
  }
});

module.exports = router;
