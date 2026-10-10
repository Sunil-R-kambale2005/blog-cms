const mongoose = require("mongoose");

const pageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    blocks: [
      {
        type: { type: String, required: true },
        content: mongoose.Schema.Types.Mixed,
        position: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Page", pageSchema);
