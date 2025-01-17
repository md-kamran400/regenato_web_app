const mongoose = require("mongoose");

const partSchema = new mongoose.Schema({
  Uid: String,
  partName: String,
  codeName: String,
  costPerUnit: Number,
  timePerUnit: Number,
  quantity: Number,
  rmVariables: [
    {
      name: String,
      netWeight: Number,
      pricePerKg: Number,
      totalRate: Number,
    },
  ],
  manufacturingVariables: [
    {
      name: String,
      hours: Number,
      times: String,
      hourlyRate: Number,
      totalRate: Number,
    },
  ],
  shipmentVariables: [
    {
      name: String,
      hourlyRate: Number,
      totalRate: Number,
    },
  ],
  overheadsAndProfits: [
    {
      name: String,
      percentage: Number,
      totalRate: Number,
    },
  ],
});

// New partsListSchema
const partsListSchema = new mongoose.Schema({
  partsListName: String,
  partsListItems: [partSchema],
});

const partprojectSchema = new mongoose.Schema({
  projectName: String,
  costPerUnit: Number,
  timePerUnit: Number,
  stockPoQty: Number,
  projectType: String,
  partsLists: [partsListSchema],
  machineHours: {
    type: Object,
    default: {},
  },

  //for time traking
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
const PartListProjectModel = mongoose.model("PartProject", partprojectSchema);
module.exports = PartListProjectModel;
