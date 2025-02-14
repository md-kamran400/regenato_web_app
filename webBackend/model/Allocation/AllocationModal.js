const mongoose = require("mongoose");
const AllocationPlanningSchema = new mongoose.Schema(
  {
    projectName: {
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
        projectId: {
          type: String, // Add project ID to track project
          required: true,
        },
        partId: {
          type: String, // Add part ID to track which part was allocated
          required: true,
        },
        sourceType: {
          type: String, // Track whether it came from partsList, subassembly, or assembly
          required: true,
        },
        process_machineId:{
          type:String,
          require: true,
        }
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

const AllocationModal = mongoose.model("Allocation", AllocationPlanningSchema);

module.exports = AllocationModal;
