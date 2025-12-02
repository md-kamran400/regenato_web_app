const mongoose = require("mongoose");

const logoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    fileSize: {
      type: Number, // Size in bytes
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Only one logo can be active at a time - we'll handle this in middleware
logoSchema.index({ isActive: 1 });

module.exports = mongoose.model("Logo", logoSchema);