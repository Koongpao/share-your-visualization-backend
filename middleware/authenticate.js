const jwt = require("jsonwebtoken");

require("dotenv").config();
const secretKey = process.env.SECRET_KEY;

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Unauthorized - No token provided", success: false });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.decoded = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized - Invalid token", success: false });
  }
};

module.exports = verifyToken;
