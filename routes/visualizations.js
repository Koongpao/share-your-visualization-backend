const { Router } = require("express");

const router = Router();

router.get("/", (req, res) => {
  res.send([{ item: "test", quantity: 2 }]);
});

router.post("/", (req, res) => {
  console.log(req.body);
  res.status(201).send("test");
});

module.exports = router
