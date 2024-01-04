const mongoose = require("mongoose");
const TagsModel = require("../models/tagSchema");
require("../db/connection");

const tagNames = [
  "d3.js",
  "altair",
  "vega",
  "apache_echarts",
  "chart.js",
  "seaborn",
  "recharts",
  "victory",
  "c3.js",
  "matplotlib",
  "bokeh",
  "highcharts",
  "plotly",
];
const tagNames2 = [
  "bar",
  "line",
  "pie",
  "scatter",
  "map",
  "candlestick",
  "boxplot",
  "heatmap",
  "tree",
  "static",
  "interactive",
  "linear_regression",
  "geography",
  "business",
  "themed",
  "machine_learning",
];

async function initializeTags() {
  try {
    const existingTags = await TagsModel.find();

    if (existingTags.length === 0) {
      // Create an array of tag objects with "approved" status
      const approvedTags = tagNames.map((tag) => ({ name: tag, status: "approved", is_library: true }));
      const approvedTags2 = tagNames2.map((tag) => ({ name: tag, status: "approved" }));

      await Tag.insertMany(approvedTags);
      await Tag.insertMany(approvedTags2);
      console.log("Tags initialized successfully.");
    } else {
      console.log("Tags already exist, skipping initialization.");
    }
  } catch (error) {
    console.error("Error initializing tags:", error);
  } finally {
    // Close the MongoDB connection after initializing tags
    mongoose.connection.close();
  }
}

initializeTags();
