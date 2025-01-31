// const { default: mongoose } = require("mongoose");

// const partSchema = new mongoose.Schema({
//   partsListName: String,
//   Uid: String,
//   partName: String,
//   codeName: String,
//   costPerUnit: Number,
//   timePerUnit: Number,
//   quantity: { type: Number, default: 0 },
//   rmVariables: [
//     {
//       name: String,
//       netWeight: Number,
//       pricePerKg: Number,
//       totalRate: Number,
//     },
//   ],
//   manufacturingVariables: [
//     {
//       name: String,
//       hours: Number,
//       hourlyRate: Number,
//       totalRate: Number,
//     },
//   ],
//   shipmentVariables: [
//     {
//       name: String,
//       hourlyRate: Number,
//       totalRate: Number,
//     },
//   ],
//   overheadsAndProfits: [
//     {
//       name: String,
//       percentage: Number,
//       totalRate: Number,
//     },
//   ],
// });

// const AssemblySchema = new mongoose.Schema({
//   AssemblyName: String,
//   AssemblyNumber: String,
//   totalCost: Number,
//   totalHours: Number,
//   partsListItems: [partSchema],
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now },
// });

// const AssemblyModel = mongoose.model("Assembly", AssemblySchema);
// module.exports = AssemblyModel;

const { default: mongoose } = require("mongoose");

const partSchema = new mongoose.Schema({
  partsListName: String,
  Uid: String,
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

const subAssemblySchema = new mongoose.Schema({
  subAssemblyName: String,
  subAssemblyNumber: String,
  totalCost: Number,
  totalHours: Number,
  partsListItems: [partSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const assemblySchema = new mongoose.Schema({
  AssemblyName: String,
  AssemblyNumber: String,
  totalCost: Number,
  totalHours: Number,
  partsListItems: [partSchema],
  subAssemblies: [subAssemblySchema], // Nested sub-assemblies inside assembly
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const AssemblyModel = mongoose.model("Assembly", assemblySchema);
module.exports = AssemblyModel;
