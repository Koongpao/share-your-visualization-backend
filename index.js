const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
const PORT = 3001;

//Global Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

//Connect to MongoDB
require("./db/connection");

//API Routes
const visualizationsRoute = require("./routes/visualizations");
const tagsRoute = require("./routes/tags");
const usersRoute = require("./routes/users");
const loginRoute = require("./routes/login")

app.use("/api/visualizations", visualizationsRoute);
app.use("/api/tags", tagsRoute);
app.use("/api/users", usersRoute);
app.use("/api/login", loginRoute)

app.listen(PORT, () => "Running Express server on port 3001");

app.get("/", (req, res) => {
  res.send({
    message: "This is the test route to make sure server is working",
  });
});
