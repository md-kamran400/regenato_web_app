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

// //Raw Material unit cost schema
// const rmUnitCostSchema = new mongoose.Schema({
//   categoryId: String,
//   name: String,
//   totalRate: Number,
// })

// Schema for Manufacturing Variables
const manufacturingVariableSchema = new mongoose.Schema({
  categoryId: String,
  name: String,
  times: String,
  hours: Number,
  hourlyRate: Number,
  totalRate: Number,
});

// Add unit cost for manufacturing
// const manufacturingUnitCostSchema = new mongoose.Schema({
//   categoryId: String,
//   name: String,
//   times: String,
//   totalRate: Number
// })



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
  partType: { type: String, enum: ['Make', 'Purchase'] },
  costPerUnit: { type: Number },
  timePerUnit: { type: Number },
  stockPOQty: { type: Number },
  totalCost: { type: Number },
  totalQuantity: { type: Number },
  generalVariables: [generalVariableSchema],
  rmVariables: [rmVariableSchema],
  // rmUnitCost: [rmUnitCostSchema],
  manufacturingVariables: [manufacturingVariableSchema],
  // manufacturingUnitCost: [manufacturingUnitCostSchema],
  shipmentVariables: [shipmentVariableSchema],
  overheadsAndProfits: [overheadsAndProfitsSchema],
  partsCalculations: [partsCalculationsSchema],
  index: { type: Number }
});
// const partSchema = new mongoose.Schema({
//   id: { type: String, unique: true },  // add unique: true to ensure no duplicates
//   partName: { type: String },
//   clientNumber: { type: String },
//   codeName: { type: String },
//   costPerUnit: { type: Number },
//   timePerUnit: { type: Number },
//   stockPOQty: { type: Number },
//   generalVariables: [generalVariableSchema],
//   rmVariables: [rmVariableSchema],
//   manufacturingVariables: [manufacturingVariableSchema],
//   shipmentVariables: [shipmentVariableSchema],
//   overheadsAndProfits: [overheadsAndProfitsSchema],
//   partsCalculations: [partsCalculationsSchema],
//   index: { type: Number } // Add this line
// });


const PartsModel = mongoose.model("Part", partSchema);

module.exports = PartsModel;


/**
 * const partSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  partName: { type: String },
  costPerUnit: { type: Number },
  timePerUnit: { type: Number },
  stockPOQty: { type: Number },
  totalCost: { type: Number, default: 0 }, // Aggregated total cost
  totalTime: { type: Number, default: 0 }, // Aggregated total time
  generalVariables: [generalVariableSchema],
  rmVariables: [rmVariableSchema],
  manufacturingVariables: [manufacturingVariableSchema],
  shipmentVariables: [shipmentVariableSchema],
  overheadsAndProfits: [overheadsAndProfitsSchema],
});

 */