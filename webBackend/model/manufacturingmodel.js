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
      wareHouse: String,
      warehouseId: String,
      isAvailable: { type: Boolean, default: true },
      status: {
        type: String,
        enum: ["available", "occupied", "downtime"],
        default: "available",
      },
      unavailableUntil: { type: Date, default: null },
      allocations: [
        {
          startDate: { type: Date, required: true },
          endDate: { type: Date, required: true },
          actualEndDate: { type: Date, default: null },
          projectName: String,
          partName: String,
        },
      ],
      downtimeHistory: [downtimeHistorySchema],
    },
  ],
});

// Add middleware to auto-update status
manufacturingSchema.pre('save', function(next) {
  const now = new Date();
  
  this.subCategories.forEach(subCategory => {
    // Check for active downtime
    const activeDowntime = subCategory.downtimeHistory?.find(downtime => 
      new Date(downtime.startTime) <= now && 
      (!downtime.endTime || new Date(downtime.endTime) > now)
    );

    if (activeDowntime) {
      subCategory.status = 'downtime';
      subCategory.isAvailable = false;
      subCategory.unavailableUntil = new Date(activeDowntime.endTime);
    } else if (subCategory.status === 'downtime') {
      // Downtime has ended
      subCategory.status = 'available';
      subCategory.isAvailable = true;
      subCategory.unavailableUntil = null;
    }

    // Check allocations (this will be updated by the API endpoint)
  });

  next();
});

const ManufacturingModel = mongoose.model("manufacturing", manufacturingSchema);

module.exports = ManufacturingModel;
