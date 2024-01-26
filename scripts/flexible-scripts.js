const mongoose = require('mongoose');
const VisualizationModel = require('../models/visualizationSchema');
require("../db/connection");

async function updateLikesCount() {
  const visualizations = await VisualizationModel.find();

  for (let viz of visualizations) {
    viz.likesCount = viz.likes.length;
    await viz.save();
  }

  console.log('Updated likesCount for all visualizations');
}

updateLikesCount().catch(console.error).finally(() => mongoose.connection.close());