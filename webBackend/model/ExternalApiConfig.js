const mongoose = require("mongoose");

const externalApiSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true }, // goodsReceipt, clsIncoming etc.
    url: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExternalApiConfig", externalApiSchema);
