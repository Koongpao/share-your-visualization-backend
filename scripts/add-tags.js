const mongoose = require("mongoose");
const TagsModel = require("../models/tagSchema");
require("../db/connection");

const tagNames = [
  "sunburst",
  "parallel_coordinates",
  "funnel_chart",
  "calendar",
  "distribution",
  "table",
  "animated",
  "case_study",
];

async function addTags() {
  try {
    const existingTags = await TagsModel.find();

    for (const tagName of tagNames) {
      const tagExists = existingTags.some((tag) => tag.name === tagName);

      if (!tagExists) {
        const newTag = new TagsModel({ name: tagName, status: "approved" });
        await newTag.save();
        console.log(`Tag "${tagName}" added successfully.`);
      } else {
        console.log(`Tag "${tagName}" already exists, skipping.`);
      }
    }
  } catch (error) {
    console.error("Error adding tags:", error);
  } finally {
    // Close the MongoDB connection after adding tags
    mongoose.connection.close();
  }
}

addTags();


