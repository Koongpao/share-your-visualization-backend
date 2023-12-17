const jwt = require("jsonwebtoken");

require("dotenv").config();
const secretKey = process.env.SECRET_KEY;

const verifyIdentity = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Unauthorized - No token provided" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

module.exports = verifyIdentity;
