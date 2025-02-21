const mongoose = require("mongoose");

// allocation modal
const AllocationPlanningSchema = new mongoose.Schema(
  {
    partName: {
      type: String, 
      required: true,
    },
    processName: {
      type: String, 
      required: true,
    },
    allocations: [
      {
        plannedQuantity: {
          type: Number,
          required: true,
          min: 0,
        },
        startDate: {
          type: Date,
          required: true,
        },
        startTime: {
          type: String,
          required: true,
        },
        endDate: {
          type: Date,
          required: true,
        },
        machineId: {
          type: String, //
          required: true,
        },
        shift: {
          type: String,
          required: true,
        },
        plannedTime: {
          type: Number,
          required: true,
        },
        operator: {
          type: String,
          required: true,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

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
      categoryId: String,
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
  allocations: [AllocationPlanningSchema],
});

// New partsListSchema
const partsListSchema = new mongoose.Schema({
  partsListName: String,
  partsListItems: [partSchema],
});

const SubAssemblyListSchema = new mongoose.Schema({
  subAssemblyName: String,
  SubAssemblyNumber: String,
  totalCost: Number,
  totalHours: Number,
  partsListItems: [partSchema],
});

const AssemblyListSchema = new mongoose.Schema({
  AssemblyName: String,
  AssemblyNumber: String,
  totalCost: Number,
  totalHours: Number,
  partsListItems: [partSchema],
  subAssemblies: [SubAssemblyListSchema],
});

const partprojectSchema = new mongoose.Schema({
  projectName: String,
  costPerUnit: Number,
  timePerUnit: Number,
  stockPoQty: Number,
  projectType: String,
  partsLists: [partsListSchema],
  subAssemblyListFirst: [SubAssemblyListSchema],
  assemblyList: [AssemblyListSchema],
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

//project/:projectid/partlist/:partlistid/partlistItems/:partlistitemsid/allocation
