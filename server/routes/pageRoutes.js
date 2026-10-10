const express = require("express");
const mongoose = require("mongoose");
const Page = require("../models/page");

const router = express.Router();

// CREATE a page
router.post("/", async (req, res) => {
  try {
    const { title, slug, status, blocks } = req.body;

    const page = await Page.create({
      title,
      slug,
      status,
      blocks,
    });

    res.status(201).json(page);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// READ all pages
router.get("/", async (req, res) => {
  try {
    const pages = await Page.find().sort({ createdAt: -1 });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ one page by ID
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid page ID" });
    }

    const page = await Page.findById(req.params.id);

    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    res.json(page);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE a page
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid page ID" });
    }

    const { title, slug, status, blocks } = req.body;

    const page = await Page.findByIdAndUpdate(
      req.params.id,
      { title, slug, status, blocks },
      { new: true, runValidators: true },
    );

    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    res.json(page);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a page
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid page ID" });
    }

    const page = await Page.findByIdAndDelete(req.params.id);

    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    res.json({ message: "Page deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
