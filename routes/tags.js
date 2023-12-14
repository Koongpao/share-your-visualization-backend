const { Router } = require("express");
const TagsModel = require("../models/tagSchema");

const router = Router();

//getAllTag - /api/tags
router.get("/", async (req, res) => {
  try {
    const tags = await TagsModel.find();

    const libraryTags = tags.filter((tag) => tag.is_library);
    const regularTags = tags.filter((tag) => !tag.is_library);

    const response = {
      status: "success",
      message: "Tags retrieved successfully",
      data: {
        library: {
          data: libraryTags,
        },
        tags: {
          data: regularTags,
        },
      },
    };
    
    res.json(response);
  } catch (error) {
    console.error("Error retrieving tags:", error);

    const errorResponse = {
      status: "error",
      message: "Failed to retrieve tags",
      error: error.message,
    };

    res.status(500).json(errorResponse);
  }
});

module.exports = router;
