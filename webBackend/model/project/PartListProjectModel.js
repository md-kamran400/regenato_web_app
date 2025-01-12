const mongoose = require("mongoose");

// Part schema nested inside Project schema
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

const SubAssemblyListSchema = new mongoose.Schema({
  subAssemblyListName: String,
})

const AssemblyPartListSchema = new mongoose.Schema({
  assemblyListName: String,
})


// Modified projectSchema
const partprojectSchema = new mongoose.Schema({
  projectName: String,
  costPerUnit: Number,
  timePerUnit: Number,
  stockPoQty: Number,
  projectType: String,
  partsLists: [partsListSchema],
  subAssemblyListFirst:[SubAssemblyListSchema],
  assemblyPartsLists:[AssemblyPartListSchema]
});

const PartListProjectModel = mongoose.model("PartProject", partprojectSchema);
module.exports = PartListProjectModel;

