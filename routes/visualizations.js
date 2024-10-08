require("dotenv").config();
const { Router } = require("express");
const verifyToken = require("../middleware/authenticate");
const crypto = require("crypto");
const multer = require("multer");
const AWS = require("aws-sdk");

const VisualizationModel = require("../models/visualizationSchema");
const TagModel = require("../models/tagSchema");
const UsersModel = require("../models/userSchema");

const BUCKET_NAME = process.env.BUCKET_NAME;
const BUCKET_REGION = process.env.BUCKET_REGION;
const ACCESS_KEY = process.env.ACCESS_KEY;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
  region: BUCKET_REGION,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

upload.single("image");

const router = Router();

// SearchVisualization - GET /api/visualizations?search_query=&?tags=&page=?&sortby=
router.get("/", async (req, res) => {
  const searchQuery = req.query.search_query;
  const tags = req.query.tags;
  const page = Number(req.query.page) || 1;
  const limit = 12;
  const sortby = req.query.sortby || "date"; 
  const order = req.query.order || "desc";
  //Default to date descending
  try {
    let query = VisualizationModel.find();

    query = query.find({ status: "approved" });

    if (searchQuery) {
      query = query.find({ title: { $regex: searchQuery, $options: "i" } });
    }

    if (tags) {
      const tagNames = tags.split(",");
      const tagIds = await TagModel.find({ name: { $in: tagNames } }, "_id");
      const tagIdsArray = tagIds.map((tag) => tag._id);
      query = query.find({
        $expr: {
          $setIsSubset: [
            tagIdsArray,
            {
              $concatArrays: [
                { $cond: { if: { $isArray: "$library" }, then: ["$library"], else: ["$library"] } },
                "$tags",
              ],
            },
          ],
        },
      });
      //Concatinate library and tags array and check if tagIdsArray is a subset of the concatinated array
    }

    if (sortby === "date") {
      query = query.sort({ created_date: order === "desc" ? -1 : 1 });
    }
    if (sortby === "likes") {
      query = query.sort({ likesCount: order === "desc" ? -1 : 1 });
    }

    const totalDocuments = await VisualizationModel.countDocuments(query);
    const startIndex = totalDocuments > 0 ? (page - 1) * limit + 1 : 0;
    const endIndex = Math.min(page * limit, totalDocuments);
    const totalPages = Math.ceil(totalDocuments / limit);

    const visualizations = await query
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({ path: "tags", select: "name -_id" })
      .populate({ path: "creator", select: "username -_id" })
      .populate({ path: "library", select: "name -_id" })
      .select("-__v -code -description -externalLink");

    const pagination = {
      currentPage: page,
      totalDocuments: totalDocuments,
      totalPages: totalPages,
      startIndex: startIndex,
      endIndex: endIndex,
    };

    res.json({ message: "Search results", data: visualizations, success: true, pagination: pagination });
  } catch (error) {
    console.error("Error searching visualizations:", error);
    res.json({ message: "Error searching visualizations", success: false });
  }
});

//GetMyVisualization - GET /api/visualizations/my-visualizations
router.get("/my-visualizations", verifyToken, async (req, res) => {
  const userId = req.decoded.userId;

  try {
    const user = await UsersModel.findById(userId)
      .select("-_id visualizations")
      .populate({
        path: "visualizations",
        select: "-__v -code -description -externalLink",
        match: { status: { $ne: "deleted" } },
        populate: [
          { path: "tags", select: "name -_id" },
          { path: "creator", select: "username -_id" },
          { path: "library", select: "name -_id" },
        ],
      });

    res.json({ message: "My visualizations results", data: user.visualizations, success: true });
  } catch (error) {
    console.error("Error finding visualizations:", error);
    res.json({ message: "Error finding visualizations", success: false });
  }
});

// GetMyFavoriteVisualization - GET /api/visualizations/favorite-visualizations
router.get("/favorite-visualizations", verifyToken, async (req, res) => {
  const userId = req.decoded.userId;
  try {
    const user = await UsersModel.findById(userId)
      .select("-_id favorites")
      .populate({
        path: "favorites",
        select: "-__v -code -description -externalLink",
        match: { status: { $ne: "deleted" } },
        populate: [
          { path: "tags", select: "name -_id" },
          { path: "creator", select: "username -_id" },
          { path: "library", select: "name -_id" },
        ],
      });

    res.json({ message: "My favorite visualizations results", data: user.favorites, success: true });
  } catch (error) {
    console.error("Error finding favorite visualizations:", error);
    res.json({ message: "Error finding favorite visualizations", success: false });
  }
});

//GetPendingVisualizations - GET /api/visualizations/pending
router.get("/pending", verifyToken, async (req, res) => {
  const userRole = req.decoded.role;

  try {
    if (userRole !== "admin") {
      return res.json({ message: "User is not admin", success: false });
    }

    const visualizations = await VisualizationModel.find({ status: "pending" })
      .populate({ path: "tags", select: "name -_id" })
      .populate({ path: "creator", select: "username -_id" })
      .populate({ path: "library", select: "name -_id" })
      .select("-__v -code -description -externalLink");

    res.json({ message: "Pending visualizations", data: visualizations, success: true });
  } catch (error) {
    console.error("Error getting pending visualizations:", error);
    res.json({ message: "Error getting pending visualizations", success: false });
  }
});

// GetSpecificVisualization - GET /api/visualizations/:id
router.get("/:id", async (req, res) => {
  const visualizationId = req.params.id;
  try {
    const visualization = await VisualizationModel.findById(visualizationId)
      .populate({ path: "tags", select: "name -_id" })
      .populate({ path: "creator", select: "username -_id" })
      .populate({ path: "library", select: "name -_id" })
      .select("-__v -_id");
    if (visualization) {
      res.json({ message: "Visualization found", data: visualization, success: true });
    } else {
      res.json({ message: "Visualization not found", success: false });
    }
  } catch (error) {
    console.error("Error finding visualization:", error);
    res.json({ message: "Error finding visualization", success: false });
  }
});

//PostVisualization - POST /api/visualizations
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  const userId = req.decoded.userId;

  let response;

  try {
    const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

    const imageUploadToS3Params = {
      Bucket: BUCKET_NAME,
      Key: randomImageName() + ".png",
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    response = await s3.upload(imageUploadToS3Params).promise();
  } catch (error) {
    console.error("Error uploading file:", error);
    res.json({ message: "Error uploading file", success: false });
  }

  const tagNames = JSON.parse(req.body.tags);
  const tagIds = [];

  for (const tagName of tagNames) {
    try {
      const tag = await TagModel.findOne({ name: tagName });
      console.log(tagName);
      if (tag) {
        tagIds.push(tag._id);
      }
    } catch (error) {
      console.error("Error finding tag:", error);
      res.json({ message: "Error finding tag", success: false });
    }
  }

  let libraryId;

  try {
    const library = await TagModel.findOne({ name: req.body.library });
    libraryId = library._id;
  } catch (error) {
    console.error("Error finding library:", error);
    res.json({ message: "Error finding library", success: false });
  }

  const newVisualization = new VisualizationModel({
    title: req.body.title,
    creator: userId,
    description: req.body.description,
    image: response.Location,
    code: req.body.code,
    library: libraryId._id,
    tags: tagIds,
    externalLink: req.body.externalLink,
  });

  try {
    const savedVisualization = await newVisualization.save();

    const user = await UsersModel.findById(userId);
    user.visualizations.push(savedVisualization._id);
    await user.save();

    res.json({ message: "New visualization saved", success: true });
  } catch (error) {
    console.error("Error saving visualization:", error);
    res.json({ message: "Error saving visualization", success: false });
  }
});

//FavoriteVisualization - PUT /api/visualizations/:id/favorite
router.put("/:id/favorite", verifyToken, async (req, res) => {
  const userId = req.decoded.userId;
  const visualizationId = req.params.id;

  try {
    const user = await UsersModel.findById(userId);
    if (!user) {
      return res.json({ message: "User not found", success: false });
    }
    if (user.favorites.includes(visualizationId)) {
      return res.json({ message: "Visualization Already Favorited", success: false });
    }
    user.favorites.push(visualizationId);
    await user.save();

    res.json({ message: "Visualization Favorited", success: true });
  } catch (error) {
    console.error("Error favoriting visualization:", error);
    res.json({ message: "Error Favoriting Visualization", success: false });
  }
});

//UnfavoriteVisualization - PUT /api/visualizations/:id/unfavorite
router.put("/:id/unfavorite", verifyToken, async (req, res) => {
  const userId = req.decoded.userId;
  const visualizationId = req.params.id;

  try {
    const user = await UsersModel.findById(userId);
    if (!user) {
      return res.json({ message: "User not found", success: false });
    }
    if (!user.favorites.includes(visualizationId)) {
      return res.json({ message: "Visualization Not Favorited", success: false });
    }
    user.favorites.pull(visualizationId);
    await user.save();

    res.json({ message: "Visualization Unfavorited", success: true });
  } catch (error) {
    console.error("Error unfavoriting visualization:", error);
    res.json({ message: "Error Unfavoriting Visualization", success: false });
  }
});

//LikeVisualization - PUT /api/visualizations/:id/like
router.put("/:id/like", verifyToken, async (req, res) => {
  const userId = req.decoded.userId;
  const visualizationId = req.params.id;

  try {
    const visualization = await VisualizationModel.findById(visualizationId);
    if (!visualization) {
      return res.json({ message: "Visualization not found", success: false });
    }

    if (visualization.likes.includes(userId)) {
      return res.json({ message: "Visualization Already Liked", success: false });
    }

    visualization.likes.push(userId);
    visualization.likesCount = visualization.likesCount + 1;
    await visualization.save();

    res.json({ message: "Visualization Liked", success: true });
  } catch (error) {
    console.error("Error liking visualization:", error);
    res.json({ message: "Error Liking Visualization", success: false });
  }
});

//UnlikeVisualization - PUT /api/visualizations/:id/unlike
router.put("/:id/unlike", verifyToken, async (req, res) => {
  const userId = req.decoded.userId;
  const visualizationId = req.params.id;

  try {
    const visualization = await VisualizationModel.findById(visualizationId);
    if (!visualization) {
      return res.json({ message: "Visualization not found", success: false });
    }

    if (!visualization.likes.includes(userId)) {
      return res.json({ message: "Visualization Not Liked", success: false });
    }

    visualization.likes.pull(userId);
    visualization.likesCount = visualization.likesCount - 1;
    await visualization.save();

    res.json({ message: "Visualization Unliked", success: true });
  } catch (error) {
    console.error("Error unliking visualization:", error);
    res.json({ message: "Error Unliking Visualization", success: false });
  }
});

//IsLiked - GET /api/visualizations/:id/is-liked
router.get("/:id/is-liked", verifyToken, async (req, res) => {
  const userId = req.decoded.userId;
  const visualizationId = req.params.id;

  try {
    const visualization = await VisualizationModel.findById(visualizationId);
    if (!visualization) {
      return res.json({ message: "Visualization not found", success: false });
    }

    if (visualization.likes.includes(userId)) {
      return res.json({ message: "Visualization is liked", data: true, success: true });
    } else {
      return res.json({ message: "Visualization is not liked", data: false, success: true });
    }
  } catch (error) {
    console.error("Error checking if visualization is liked:", error);
    res.json({ message: "Error checking if visualization is liked", success: false });
  }
});

//IsFavorited - GET /api/visualizations/:id/is-favorited
router.get("/:id/is-favorited", verifyToken, async (req, res) => {
  const userId = req.decoded.userId;
  const visualizationId = req.params.id;

  try {
    const user = await UsersModel.findById(userId);

    if (user.favorites.includes(visualizationId)) {
      return res.json({ message: "Visualization is favorited", data: true, success: true });
    } else {
      return res.json({ message: "Visualization is not favorited", data: false, success: true });
    }
  } catch (error) {
    console.error("Error checking if visualization is favorited:", error);
    res.json({ message: "Error checking if visualization is favorited", success: false });
  }
});

//DeleteVisualizations - DELETE /api/visualizations/:id
router.delete("/:id", verifyToken, async (req, res) => {
  const userId = req.decoded.userId;
  const visualizationId = req.params.id;

  try {
    const visualization = await VisualizationModel.findById(visualizationId);
    if (!visualization) {
      return res.json({ message: "Visualization not found", success: false });
    }

    if (visualization.creator.toString() !== userId) {
      return res.json({ message: "Visualization not created by user", success: false });
    }

    visualization.status = "deleted";
    await visualization.save();

    res.json({ message: "Visualization deleted", success: true });
  } catch (error) {
    console.error("Error deleting visualization:", error);
    res.json({ message: "Error deleting visualization", success: false });
  }
});

//ApproveVisualization - PUT /api/visualizations/:id/approve
router.put("/:id/approve", verifyToken, async (req, res) => {
  const userRole = req.decoded.role;
  const visualizationId = req.params.id;

  if (userRole !== "admin") {
    return res.json({ message: "User is not admin", success: false });
  }

  try {
    const visualization = await VisualizationModel.findById(visualizationId);
    if (!visualization) {
      return res.json({ message: "Visualization not found", success: false });
    }

    visualization.status = "approved";
    await visualization.save();

    res.json({ message: "Visualization status changed to approve", success: true });
  } catch (error) {
    console.error("Error changing visualization status to approve:", error);
    res.json({ message: "Error changing visualization status to approve", success: false });
  }
});

//DisapproveVisualization - PUT /api/visualizations/:id/disapprove
router.put("/:id/disapprove", verifyToken, async (req, res) => {
  const userRole = req.decoded.role;
  const visualizationId = req.params.id;

  if (userRole !== "admin") {
    return res.json({ message: "User is not admin", success: false });
  }

  try {
    const visualization = await VisualizationModel.findById(visualizationId);
    if (!visualization) {
      return res.json({ message: "Visualization not found", success: false });
    }

    visualization.status = "disapproved";
    await visualization.save();

    res.json({ message: "Visualization status changed to disapprove", success: true });
  } catch (error) {
    console.error("Error changing visualization status to disapprove:", error);
    res.json({ message: "Error changing visualization status to disapprove", success: false });
  }
});

module.exports = router;
