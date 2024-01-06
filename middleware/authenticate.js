const jwt = require("jsonwebtoken");

require("dotenv").config();
const secretKey = process.env.SECRET_KEY;

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ message: "You are not logged in", success: false, technicalMessage: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.decoded = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Your session has expired", success: false, technicalMessage: "Invalid token" });
  }
};

module.exports = verifyToken;
