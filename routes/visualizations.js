const { Router } = require("express");
const verifyToken = require("../middleware/authenticate")

const router = Router();

router.get("/", verifyToken, (req, res) => {
  user = req.user
  console.log(user)
  res.send("test")
});

module.exports = router
