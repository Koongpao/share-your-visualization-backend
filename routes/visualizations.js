const { Router } = require("express");
const verifyIdentity = require("../middleware/authenticate")

const router = Router();

router.get("/", verifyIdentity, (req, res) => {
  user = req.user
  console.log(user)
  res.send("test")
});

module.exports = router
