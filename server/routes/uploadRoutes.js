const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { upload, uploadsDir } = require("../middleware/upload");

const router = express.Router();

// POST /api/upload: Upload single image
router.post("/", (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ message: "File size exceeds the 10MB limit." });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Please select an image file to upload." });
    }

    const host = req.get("host");
    const protocol = req.protocol;
    const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    res.status(201).json({
      message: "Image uploaded successfully",
      imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  });
});

// GET /api/upload/media: List uploaded media files
router.get("/media", (req, res) => {
  try {
    if (!fs.existsSync(uploadsDir)) {
      return res.json([]);
    }

    const files = fs.readdirSync(uploadsDir);
    const host = req.get("host");
    const protocol = req.protocol;

    const mediaList = files
      .filter((file) => !file.startsWith("."))
      .map((file) => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);

        return {
          filename: file,
          url: `${protocol}://${host}/uploads/${file}`,
          size: stats.size,
          createdAt: stats.birthtime || stats.ctime,
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(mediaList);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to read media library: " + error.message });
  }
});

// DELETE /api/upload/media/:filename: Delete an uploaded media file
router.delete("/media/:filename", (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(uploadsDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.json({ message: "Image deleted successfully", filename });
    } else {
      return res.status(404).json({ message: "File not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to delete file: " + error.message });
  }
});

module.exports = router;

