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

router.get("/", verifyToken, (req, res) => {});

//PostVisualization - POST /api/visualizations
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  userId = req.decoded.userId;

  const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

  const imageUploadToS3Params = {
    Bucket: BUCKET_NAME,
    Key: randomImageName() + ".png",
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };

  let response;

  try {
    response = await s3.upload(imageUploadToS3Params).promise();
  } catch (error) {
    console.error("Error uploading file:", error);
    res.json({ message: "Error uploading file", success: false });
  }

  const tagNames = req.body.tags;
  const tagIds = [];

  for (const tagName of tagNames) {
    try {
      const tag = await TagModel.findOne({ name: tagName });
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
