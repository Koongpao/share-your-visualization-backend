const { Router } = require("express");
const TagsModel = require("../models/tagSchema");

const router = Router();

// GetAllTags - GET /api/tags
router.get("/", async (req, res) => {
  try {
    const tags = await TagsModel.find().select("-_id -__v -created_date");

    const libraryTags = tags
      .filter((tag) => tag.is_library)

    const regularTags = tags
      .filter((tag) => !tag.is_library)

    const response = {
      success: true,
      message: "Tags retrieved successfully",
      data: {
        library: libraryTags,
        tags: regularTags,
      },
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to retrieve tags list" });
  }
});



module.exports = router;
