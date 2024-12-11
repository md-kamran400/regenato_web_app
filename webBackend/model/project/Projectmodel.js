// // model/project/Projectmodel.js
// const mongoose = require("mongoose");

// /// Part schema nested inside Project schema
// const partSchema = new mongoose.Schema({
//   Uid: String,
//   partName: String,
//   costPerUnit: Number,
//   timePerUnit: Number,
//   quantity: Number,
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

// // Project schema to store project details
// const projectSchema = new mongoose.Schema({
//   projectName: String,
//   costPerUnit: Number,
//   timePerUnit: Number,
//   stockPoQty: Number,
//   projectType: String,
//   allProjects: [partSchema],
// });

// const ProjectModal = mongoose.model("Project", projectSchema);
// module.exports = ProjectModal;

// model/project/Projectmodel.js

const mongoose = require("mongoose");

// Part schema nested inside Project schema
const partSchema = new mongoose.Schema({
  Uid: String,
  partName: String,
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

const AssemblyListSchema = new mongoose.Schema({
  assemblyListName: String,
  partsListItems: [partSchema],
});

const SubAssemblyListSchema = new mongoose.Schema({
  subAssemblyListName: String,
  partsListItems: [partSchema],
});

// Modified projectSchema
const projectSchema = new mongoose.Schema({
  projectName: String,
  costPerUnit: Number,
  timePerUnit: Number,
  stockPoQty: Number,
  projectType: String,
  partsLists: [partsListSchema],
  assemblyPartsLists: [
    {
      assemblyListName: String,
      subAssemblyPartsLists: [
        {
          subAssemblyListName: String,
          partsListItems: [partSchema],
        },
      ],
      assemblyMultyPartsList: [
        {
          assemblyMultyPartsListName: String,
          partsListItems: [partSchema],
        },
      ],
    },
  ],
});

const ProjectModal = mongoose.model("Project", projectSchema);
module.exports = ProjectModal;
