const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const postRoutes = require("./routes/postRoutes");
const pageRoutes = require("./routes/pageRoutes");

const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/posts", postRoutes);
app.use("/api/pages", pageRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Blog CMS Backend is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
