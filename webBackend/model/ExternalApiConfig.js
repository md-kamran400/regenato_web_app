// ExternalApiConfig.js 
const mongoose = require("mongoose");

const externalApiSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    url: { type: String, required: true }, // Primary API URL
    active: { type: Boolean, default: true }, // Toggle ON/OFF
    alternateUrlKey: { type: String, default: null }, // key of alternate API
    alternateType: {
      type: String,
      enum: ["external", "internal"],
      default: "external",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExternalApiConfig", externalApiSchema);
