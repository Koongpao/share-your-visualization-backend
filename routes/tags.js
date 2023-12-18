const { Router } = require("express");
const TagsModel = require("../models/tagSchema");

const router = Router();

//GetAllTag - GET /api/tags
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
    console.error("Error retrieving tags:", error);

    const errorResponse = {
      success: false,
      message: "Failed to retrieve tags",
      error: error.message,
    };

    res.status(500).json(errorResponse);
  }
});

module.exports = router;
