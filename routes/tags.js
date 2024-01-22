const { Router } = require("express");
const TagsModel = require("../models/tagSchema");
const verifyToken = require("../middleware/authenticate");

const router = Router();

// GetAllTags - GET /api/tags
router.get("/", async (req, res) => {
  try {
    const tags = await TagsModel.find().select("-__v -created_date");

    const libraryTags = tags.filter((tag) => tag.is_library);

    const regularTags = tags.filter((tag) => !tag.is_library);

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

//RequestNewTag - POST /api/tags
router.post("/", async (req, res) => {
  const { name, is_library } = req.body;
  try {
    const newTag = new TagsModel({
      name,
      is_library,
    });

    await newTag.save();

    const response = {
      success: true,
      message: "Tag requested successfully",
      data: {
        tag: newTag,
      },
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to request tag" });
  }
});

//GetRequestedTags - GET /api/tags/requested
router.get("/requested", verifyToken, async (req, res) => {
  userRole = req.decoded.role;

  if (userRole !== "admin") {
    return res.status(403).json({ success: false, message: "You are not authorized to access this route" });
  }

  try {
    const tags = await TagsModel.find({ is_library: false, status: "pending" }).select("-__v -created_date");

    const libraryTags = await TagsModel.find({ is_library: true, status: "pending"}).select("-__v -created_date");

    const response = {
      success: true,
      message: "Tags retrieved successfully",
      data: {
        library: libraryTags,
        tags,
      },
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to retrieve tags list" });
  }
});

//ApproveTag - PUT /api/tags/:id/approve
router.put("/:id/approve", verifyToken, async (req, res) => {
  userRole = req.decoded.role;

  if (userRole !== "admin") {
    return res.status(403).json({ success: false, message: "You are not authorized to access this route" });
  }

  const { id } = req.params;

  try {
    const tag = await TagsModel.findById(id);

    if (!tag) {
      return res.status(404).json({ success: false, message: "Tag not found" });
    }

    tag.status = "approved";

    await tag.save();

    const response = {
      success: true,
      message: "Tag approved successfully",
      data: {
        tag,
      },
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to approve tag" });
  }
});

//DisapproveTag - PUT /api/tags/:id/disapprove
router.put("/:id/disapprove", verifyToken, async (req, res) => {
  userRole = req.decoded.role;

  if (userRole !== "admin") {
    return res.status(403).json({ success: false, message: "You are not authorized to access this route" });
  }

  const { id } = req.params;

  try {
    const tag = await TagsModel.findById(id);

    if (!tag) {
      return res.status(404).json({ success: false, message: "Tag not found" });
    }

    tag.status = "disapproved";

    await tag.save();

    const response = {
      success: true,
      message: "Tag disapproved successfully",
      data: {
        tag,
      },
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to disapprove tag" });
  }
});


module.exports = router;
