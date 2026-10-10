const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Media", mediaSchema);
