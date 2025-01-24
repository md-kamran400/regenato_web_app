const mongoose = require("mongoose");

// general variable schema
const generalVariableSchema = new mongoose.Schema({
  categoryId: String,
  name: String,
  value: String,
});

// Schema for RM Variables
const rmVariableSchema = new mongoose.Schema({
  categoryId: String,
  name: String,
  netWeight: Number,
  pricePerKg: Number,
  totalRate: Number,
});

// Schema for Manufacturing Variables
const manufacturingVariableSchema = new mongoose.Schema({
  categoryId: String,
  name: String,
  times: String,
  hours: Number,
  hourlyRate: Number,
  totalRate: Number,
});

// Schema for Shipment Variables
const shipmentVariableSchema = new mongoose.Schema({
  categoryId: String,
  name: String,
  hourlyRate: Number,
});

// Schema for Overheads and Profits
const overheadsAndProfitsSchema = new mongoose.Schema({
  categoryId: String,
  name: String,
  percentage: Number,
  totalRate: Number,
});
const partsCalculationsSchema = new mongoose.Schema({
  AvgragecostPerUnit: Number,
  AvgragetimePerUnit: Number,
  // AveragestockPOQty: Number,
});

// Main Part schema
const partSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  partName: { type: String },
  clientNumber: { type: String },
  codeName: { type: String },
  partType: { type: String, enum: ["Make", "Purchase"] },
  costPerUnit: { type: Number },
  timePerUnit: { type: Number },
  stockPOQty: { type: Number },
  totalCost: { type: Number },
  totalQuantity: { type: Number },
  generalVariables: [
    {
      categoryId: String,
      name: String,
      value: String,
    },
  ],
  rmVariables: [
    {
      categoryId: String,
      name: String,
      netWeight: Number,
      pricePerKg: Number,
      totalRate: Number,
    },
  ],
  manufacturingVariables: [
    {
      categoryId: String,
      name: String,
      times: String,
      hours: Number,
      hourlyRate: Number,
      totalRate: Number,
    },
  ],
  shipmentVariables: [
    {
      categoryId: String,
      name: String,
      hourlyRate: Number,
    },
  ],
  overheadsAndProfits: [
    {
      categoryId: String,
      name: String,
      percentage: Number,
      totalRate: Number,
    },
  ],
  index: { type: Number },

  //for time traking
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const PartsModel = mongoose.model("Part", partSchema);

module.exports = PartsModel;
