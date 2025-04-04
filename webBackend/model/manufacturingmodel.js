const mongoose = require("mongoose");

// ManufacturingModel.js

const downtimeHistorySchema = new mongoose.Schema({
  startTime: { type: Date, required: true },
  endTime: { type: Date, default: null },
  reason: { type: String, required: true },
  shift: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shift",
  },
  downtimeType: {
    type: String,
    enum: ["operator", "maintenance"],
    default: "operator",
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

const manufacturingSchema = mongoose.Schema({
  categoryId: { type: String, required: true, unique: true },
  name: String,
  hours: Number,
  hourlyrate: Number,
  totalrate: Number,
  subCategories: [
    {
      subcategoryId: { type: String, required: true },
      name: { type: String, required: true },
      hours: Number,
      hourlyRate: Number,
      totalRate: Number,
      isAvailable: { type: Boolean, default: true },
      status: {
        type: String,
        enum: ["available", "occupied", "downtime"],
        default: "available",
      },
      allocations: [
        {
          startDate: { type: Date, required: true },
          endDate: { type: Date, required: true },
          projectName: String,
          partName: String,
        },
      ],
      downtimeHistory: [downtimeHistorySchema],
    },
  ],
});

// Middleware to auto-reset availability when fetching data
manufacturingSchema.pre("find", async function (next) {
  await this.model.updateMany(
    { "subCategories.unavailableUntil": { $lt: new Date() } }, // If downtime has expired
    {
      $set: {
        "subCategories.$.isAvailable": true,
        "subCategories.$.unavailableUntil": null,
        "subCategories.$.status": "available",
        "subCategories.$.statusEndDate": null,
      },
    }
  );
  next();
});

const ManufacturingModel = mongoose.model("manufacturing", manufacturingSchema);

module.exports = ManufacturingModel;
