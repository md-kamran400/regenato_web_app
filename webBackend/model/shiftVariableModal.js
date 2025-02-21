const mongoose = require("mongoose");

const shiftSchema = mongoose.Schema(
  {
    categoryId: { type: String, required: true, unique: true },
    name: String,
    StartTime: String,
    EndTime: String,
    TotalHours: String,
  },
  { timestamps: true }
);

const ShiftModel = mongoose.model("shift", shiftSchema);

module.exports = ShiftModel;
