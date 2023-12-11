const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");

const app = express();
const PORT = 3001;

//Connect to MongoDB
require("./db/connection")
//API Routes
const visualizationRoute = require("./routes/visualization");
const tagRoute = require("./routes/tag")

//Global Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.listen(PORT, () => "Running Express server on port 3001");

app.use("/api/visualization", visualizationRoute);
app.use("/api/tag",tagRoute)

app.get("/", (req, res) => {
  res.send({
    message: "This is the test route to make sure server is working",
  });
});

