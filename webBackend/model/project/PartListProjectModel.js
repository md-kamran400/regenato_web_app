const mongoose = require("mongoose");
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
    processId: {
      type: String,
      required: true,
    },
    partsCodeId: {
      type: String,
      required: true,
    },
    allocations: [
      {
        splitNumber: {
          type: String,
        },
        AllocationPartType: {
          type: String,
        },
        plannedQuantity: {
          type: Number,
          required: true,
          min: 0,
        },
        // BLNK warehouse transfer fields
        blankStoreTransfer: {
          blankStoreName: {
            type: String,
            default: "BLNK",
          },
          blankStoreQty: {
            type: Number,
            default: 0,
          },
          firstProcessWarehouseName: {
            type: String,
          },
          firstProcessWarehouseQty: {
            type: Number,
            default: 0,
          },
          transferTimestamp: {
            type: Date,
            default: Date.now,
          },
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
        endTime: {
          type: String,
          required: true,
        },
        machineId: {
          type: String,
          required: true,
        },
        wareHouse: {
          type: String,
        },
        warehouseId: {
          type: String,
        },
        warehouseQuantity: {
          type: Number,
        },
        fromWarehouse: {
          type: String,
        },
        fromWarehouseId: {
          type: String,
        },
        fromWarehouseQuantity: {
          type: Number,
          default: 0,
        },
        shift: {
          type: String,
          required: true,
        },
        shiftTotalTime: {
          type: Number,
        },
        dailyPlannedQty: {
          type: Number, // Add this field for daily planned quantity
        },
        plannedTime: {
          type: Number,
          required: true,
        },
        operator: {
          type: String,
          required: true,
        },
        perMachinetotalTime: {
          type: Number,
        },
        actualEndDate: {
          type: Date, // Add this field for actual end date
        },
        actualEndTime: { type: String },
        isProcessCompleted: {
          type: Boolean,
          default: false,
        },
        remaining: {
          type: Number,
          default: 0,
        },
        dailyTracking: [
          {
            date: {
              type: Date,
              required: true,
            },
            planned: {
              type: Number,
              required: true,
              min: 0,
            },
            produced: {
              type: Number,
              required: true,
              min: 0,
            },
            operator: {
              type: String,
            },
            dailyStatus: {
              type: String,
            },
            wareHouseTotalQty: {
              type: Number,
            },
            wareHouseremainingQty: {
              type: Number,
            },
            // Additional fields for complete tracking
            projectName: {
              type: String,
            },
            partName: {
              type: String,
            },
            processName: {
              type: String,
            },
            fromWarehouse: {
              type: String,
            },
            fromWarehouseQty: {
              type: Number,
              default: 0,
            },
            fromWarehouseRemainingQty: {
              type: Number,
              default: 0,
            },
            toWarehouse: {
              type: String,
            },
            toWarehouseQty: {
              type: Number,
              default: 0,
            },
            toWarehouseRemainingQty: {
              type: Number,
              default: 0,
            },
            remaining: {
              type: Number,
              default: 0,
            },
            machineId: {
              type: String,
            },
            shift: {
              type: String,
            },
            partsCodeId: {
              type: String,
            },
            // Rejection warehouse fields
            rejectedWarehouse: {
              type: String,
            },
            rejectedWarehouseId: {
              type: String,
            },
            rejectedWarehouseQuantity: {
              type: Number,
              default: 0,
            },
            remarks: {
              type: String,
            },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

const partSchema = new mongoose.Schema({
  Uid: String,
  partsCodeId: String, // ✅ NEW FIELD
  partName: String,
  codeName: String,
  costPerUnit: Number,
  timePerUnit: Number,
  quantity: Number,
  status: {
    type: String,
    default: "Not Allocated",
  },
  statusClass: {
    type: String,
    default: "badge bg-info text-black",
  },
  isManuallyCompleted: {
    type: Boolean,
    default: false,
  },
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
      SpecialDayTotalMinutes: { type: Number, default: 0 }, // New field
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
  image: { type: String },
  allocations: [AllocationPlanningSchema],
  // Logs for job-work issues/receipts and automatic moves to next process
  jobWorkMovements: [
    {
      type: {
        type: String,
        enum: ["issue", "receipt", "autoMove"],
        required: true,
      },
      productionNo: { type: String },
      partsCodeId: { type: String },
      fromWarehouseId: { type: String },
      toWarehouseId: { type: String },
      warehouseId: { type: String }, // for single-warehouse logs like issue/receipt
      warehouseName: { type: String },
      quantity: { type: Number, default: 0 },
      timestamp: { type: Date, default: Date.now },
      note: { type: String },
    },
  ],
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

const partprojectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: true,
      unique: true, // ensures no duplicates
    },
    costPerUnit: Number,
    timePerUnit: Number,
    stockPoQty: Number,
    projectType: String,
    postingdate: String, // Add postingdate field
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

partSchema.methods.calculateStatus = function () {
  // If manually completed, always return completed status
  if (this.isManuallyCompleted) {
    return {
      text: "Completed",
      class: "badge bg-success text-white",
    };
  }

  if (!this.allocations || this.allocations.length === 0) {
    return {
      text: "Not Allocated",
      class: "badge bg-info text-white",
    };
  }

  const process = this.allocations[0];
  if (!process || !process.allocations || process.allocations.length === 0) {
    return {
      text: "Not Allocated",
      class: "badge bg-info text-white",
    };
  }

  const allocation = process.allocations[0];
  if (!allocation) {
    return {
      text: "Not Allocated",
      class: "badge bg-info text-white",
    };
  }

  // If there's daily tracking data
  if (allocation.dailyTracking && allocation.dailyTracking.length > 0) {
    const currentDate = new Date();
    const endDate = new Date(allocation.endDate);
    const actualEndDate = allocation.actualEndDate
      ? new Date(allocation.actualEndDate)
      : null;

    // Calculate total produced quantity
    const totalProduced = allocation.dailyTracking.reduce(
      (sum, entry) => sum + entry.produced,
      0
    );

    // If production is completed
    if (totalProduced >= allocation.plannedQuantity) {
      if (actualEndDate) {
        if (actualEndDate.getTime() === endDate.getTime()) {
          return {
            text: "On Track",
            class: "badge bg-primary text-white",
          };
        }
        if (actualEndDate > endDate) {
          return {
            text: "Delayed",
            class: "badge bg-danger text-white",
          };
        }
        if (actualEndDate < endDate) {
          return {
            text: "Ahead",
            class: "badge bg-success-subtle text-success",
          };
        }
      }
      return {
        text: "Completed",
        class: "badge bg-success text-white",
      };
    }

    // If current date is past end date but not completed
    if (currentDate > endDate) {
      return {
        text: "Delayed",
        class: "badge bg-danger text-white",
      };
    }

    // Check daily status from tracking
    const lastTracking =
      allocation.dailyTracking[allocation.dailyTracking.length - 1];
    if (lastTracking.dailyStatus === "Delayed") {
      return {
        text: "Delayed",
        class: "badge bg-danger text-white",
      };
    } else if (lastTracking.dailyStatus === "Ahead") {
      return {
        text: "Ahead",
        class: "badge bg-success-subtle text-success",
      };
    }

    return {
      text: "In Progress",
      class: "badge bg-warning text-white",
    };
  }

  // If allocated but no tracking data yet
  const currentDate = new Date();
  const startDate = new Date(allocation.startDate);
  const endDate = new Date(allocation.endDate);

  if (currentDate < startDate) {
    return {
      text: "Allocated",
      class: "badge bg-secondary text-white",
    };
  }

  if (currentDate > endDate) {
    return {
      text: "Delayed",
      class: "badge bg-danger text-white",
    };
  }

  return {
    text: "Allocated",
    class: "badge bg-secondary text-white",
  };
};

partSchema.pre("save", function (next) {
  // Skip status calculation if flag is set
  if (this._skipStatusCalculation) {
    return next();
  }

  const status = this.calculateStatus();
  this.status = status.text;
  this.statusClass = status.class;
  next();
});

const PartListProjectModel = mongoose.model("PartProject", partprojectSchema);
module.exports = PartListProjectModel;
