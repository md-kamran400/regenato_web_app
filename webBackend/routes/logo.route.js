const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const Logo = require("../model/LogoHandler/logoSchema");

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads/logos");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 1. Upload new logo
router.post("/upload", upload.single("logo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Check file size
    if (req.file.size > 2 * 1024 * 1024) {
      return res
        .status(400)
        .json({ message: "Image size exceeds 2MB limit" });
    }

    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `logo-${uniqueSuffix}.webp`;
    const filepath = path.join(uploadDir, filename);

    // Convert and save image as WebP
    await sharp(req.file.buffer)
      .resize(500, 500, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toFile(filepath);

    // Create logo record
    const logo = new Logo({
      name: req.body.name || req.file.originalname,
      imageUrl: `/uploads/logos/${filename}`,
      fileSize: req.file.size,
      originalName: req.file.originalname,
      isActive: false, // New logos are inactive by default
    });

    await logo.save();

    res.status(201).json({
      message: "Logo uploaded successfully",
      logo: {
        _id: logo._id,
        name: logo.name,
        imageUrl: logo.imageUrl,
        isActive: logo.isActive,
        fileSize: logo.fileSize,
        uploadedAt: logo.uploadedAt,
      },
    });
  } catch (error) {
    console.error("Error uploading logo:", error);
    res.status(500).json({ message: error.message });
  }
});

// 2. Get all logos
router.get("/", async (req, res) => {
  try {
    const logos = await Logo.find().sort({ uploadedAt: -1 });
    res.json(logos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Get active logo
router.get("/active", async (req, res) => {
  try {
    const activeLogo = await Logo.findOne({ isActive: true });
    res.json(activeLogo || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. Set active logo
router.put("/set-active/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Start a session for transaction
    const session = await Logo.startSession();
    session.startTransaction();

    try {
      // Set all logos to inactive first
      await Logo.updateMany(
        { isActive: true },
        { $set: { isActive: false } },
        { session }
      );

      // Set the selected logo to active
      const updatedLogo = await Logo.findByIdAndUpdate(
        id,
        { $set: { isActive: true } },
        { new: true, session }
      );

      if (!updatedLogo) {
        throw new Error("Logo not found");
      }

      await session.commitTransaction();
      session.endSession();

      res.json({
        message: "Active logo updated successfully",
        logo: updatedLogo,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 5. Delete logo
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const logo = await Logo.findById(id);

    if (!logo) {
      return res.status(404).json({ message: "Logo not found" });
    }

    // If deleting active logo, make another one active
    if (logo.isActive) {
      const anotherLogo = await Logo.findOne({ _id: { $ne: id } });
      if (anotherLogo) {
        anotherLogo.isActive = true;
        await anotherLogo.save();
      }
    }

    // Delete file from server
    const filepath = path.join(__dirname, "..", logo.imageUrl);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    // Delete from database
    await Logo.findByIdAndDelete(id);

    res.json({ message: "Logo deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 6. Update logo name
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const logo = await Logo.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    if (!logo) {
      return res.status(404).json({ message: "Logo not found" });
    }

    res.json({
      message: "Logo updated successfully",
      logo,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;