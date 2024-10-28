const mongoose = require("mongoose");

// general variable schema 
const generalVariableSchema = new mongoose.Schema({
  id: String,
  name: String,
  value: Number
});

// Schema for RM Variables
const rmVariableSchema = new mongoose.Schema({
  id: String,
  name: String,
  netWeight: Number,
  pricePerKg: Number,
  totalRate: Number,
});

// Schema for Manufacturing Variables
const manufacturingVariableSchema = new mongoose.Schema({
  id: String,
  name: String,
  hours: Number,
  hourlyRate: Number,
  totalRate: Number,
});

// Schema for Shipment Variables
const shipmentVariableSchema = new mongoose.Schema({
  id: String,
  name: String,
  hourlyRate: Number,
});

// Schema for Overheads and Profits
const overheadsAndProfitsSchema = new mongoose.Schema({
  id: String,
  name: String,
  percentage: Number,
  totalRate: Number,
});

// Main Part schema
const partSchema = new mongoose.Schema({
  partName: { type: String,  },
  costPerUnit: { type: Number,  },
  timePerUnit: { type: Number,  },
  stockPOQty: { type: Number,  },
  generalVariables: [generalVariableSchema],
  rmVariables: [rmVariableSchema],
  manufacturingVariables: [manufacturingVariableSchema],
  shipmentVariables: [shipmentVariableSchema],
  overheadsAndProfits: [overheadsAndProfitsSchema],
});

// module.exports = mongoose.model('Part', partSchema);


const PartsModel = mongoose.model("Part", partSchema);

module.exports = PartsModel;
