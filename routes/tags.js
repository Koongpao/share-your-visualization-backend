const { Router } = require("express");
const TagsModel = require("../models/tagSchema");

const router = Router();

// GetAllTags - GET /api/tags
router.get("/", async (req, res) => {
  try {
    const tags = await TagsModel.find();

    const libraryTags = tags
      .filter((tag) => tag.is_library)
      .map(({ name, is_library, status }) => ({ name, is_library, status }));

    const regularTags = tags
      .filter((tag) => !tag.is_library)
      .map(({ name, is_library, status }) => ({ name, is_library, status }));

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
