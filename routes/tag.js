const { Router } = require("express");
const Tags = require("../models/tagSchema");

const router = Router();

//getAllTag - /api/tag
router.get("/", async (req, res) => {
    try {
      const tags = await Tags.find();
      res.json(tags);
    } catch (error) {
      console.error("Error fetching tags:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

module.exports = router