require("dotenv").config();
const { Router } = require("express");
const verifyToken = require("../middleware/authenticate");
const crypto = require("crypto");
const multer = require("multer");
const AWS = require("aws-sdk");

const VisualizationModel = require("../models/visualizationSchema");
const TagModel = require("../models/tagSchema");

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

// SearchVisualization - GET /api/visualizations?search_query=&?tags=
router.get("/", async (req, res) => {
  const searchQuery = req.query.search_query;
  const tags = req.query.tags;
  console.log(searchQuery, tags)
  try {
    let query = VisualizationModel.find();

    query = query.find({status: "approved"})

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

    const visualizations = await query
      .populate({ path: "tags", select: "name -_id" })
      .populate({ path: "creator", select: "username -_id" })
      .populate({ path: "library", select: "name -_id" })
      .select("-__v -code -description -externalLink");

    res.json({ message: "Search results", data: visualizations, success: true });
  } catch (error) {
    console.error("Error searching visualizations:", error);
    res.json({ message: "Error searching visualizations", success: false });
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
  userId = req.decoded.userId;

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
    res.json({ message: "New visualization saved", success: true });
  } catch (error) {
    console.error("Error saving visualization:", error);
    res.json({ message: "Error saving visualization", success: false });
  }
});

module.exports = router;
