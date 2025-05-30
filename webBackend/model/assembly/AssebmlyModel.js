const { default: mongoose } = require("mongoose");

const partSchema = new mongoose.Schema({
  partsListName: String,
  Uid: String,
  partsCodeId: String,
  partName: String,
  codeName: String,
  costPerUnit: Number,
  timePerUnit: Number,
  quantity: { type: Number, default: 0 },
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
      categoryId: String,
      name: String,
      SubMachineName: String,
      hours: Number,
      times: String,
      hourlyRate: Number,
      totalRate: Number,
      isSpecialday: { type: Boolean, default: false }, // New field
      SpecialDayTotalMinutes: { type: Number, default: 0 } // New field
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

const subAssemblySchema = new mongoose.Schema({
  subAssemblyName: String,
  subAssemblyNumber: String,
  costPerUnit: Number,
  timePerUnit: Number,
  partsListItems: [partSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const assemblySchema = new mongoose.Schema({
  AssemblyName: String,
  AssemblyNumber: String,
  costPerUnit: { type: Number, default: 0 },
  timePerUnit: { type: Number, default: 0 },
  partsListItems: [partSchema],
  subAssemblies: [subAssemblySchema], // Nested sub-assemblies inside assembly
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const AssemblyModel = mongoose.model("Assembly", assemblySchema);
module.exports = AssemblyModel;
