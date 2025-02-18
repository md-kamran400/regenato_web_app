const mongoose = require("mongoose");

// allocation modal
const AllocationPlanningSchema = new mongoose.Schema(
  {
    partName: {
      //projectName
      type: String,
      required: true,
    },
    processName: {
      type: String,
      required: true,
    },
    initialPlannedQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    remainingQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    allocations: [
      {
        partType: {
          type: String,
          enum: ["Make", "Purchase"],
          required: true,
        },
        plannedQuantity: {
          type: Number,
          required: true,
          min: 0,
        },
        startDate: {
          type: Date,
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
          enum: ["Shift A", "Shift B"],
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
        partsListId: {
          // partsListId => projectId
          type: String, // Add project ID to track project
          required: true,
        },
        partsListItemsId: {
          //partsListItemsId => partId
          type: String, // Add part ID to track which part was allocated
          required: true,
        },
        sourceType: {
          type: String, // Track whether it came from partsList, subassembly, or assembly
          required: true,
        },
        process_machineId: {
          type: String,
          require: true,
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
