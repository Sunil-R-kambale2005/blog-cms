const express = require("express");
const mongoose = require("mongoose");
const Post = require("../models/post");
const { upload } = require("../middleware/upload");

const router = express.Router();

const createSlug = (title = "") =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const createUniqueSlug = async (title) => {
  const baseSlug = createSlug(title) || "untitled-post";

  let slug = baseSlug;
  let suffix = 1;

  while (await Post.exists({ slug })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
};

// CREATE: Add a new blog post (supports JSON or multipart form with image file)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const payload = { ...req.body };

    // If an image file was uploaded with the post
    if (req.file) {
      const host = req.get("host");
      const protocol = req.protocol;
      payload.featuredImage = `${protocol}://${host}/uploads/${req.file.filename}`;
    }

    if (!payload.slug && payload.title) {
      payload.slug = await createUniqueSlug(payload.title);
    }

    const post = await Post.create(payload);
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// READ: Get all blog posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ: Get published blog posts for the public site
router.get("/published", async (req, res) => {
  try {
    const posts = await Post.find({ status: "published" }).sort({
      createdAt: -1,
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ: Get one post by ID
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE: Edit a blog post (supports JSON or multipart form with image file)
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const updateData = { ...req.body };

    // If a new image file was uploaded with the update
    if (req.file) {
      const host = req.get("host");
      const protocol = req.protocol;
      updateData.featuredImage = `${protocol}://${host}/uploads/${req.file.filename}`;
    }

    const post = await Post.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE: Remove a blog post
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
