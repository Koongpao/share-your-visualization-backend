const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

//Connect to MongoDB
require("./db/connection")
//API Routes
const visualizationRoute = require("./routes/visualization");

//Global Middleware
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  console.log(`${req.method}:${req.url}`);
  next();
});

app.listen(PORT, () => "Running Express server on port 3001");

app.use("/api/visualization", visualizationRoute);

app.get("/", (req, res) => {
  res.send({
    message: "This is the test route to make sure server is working",
  });
});
