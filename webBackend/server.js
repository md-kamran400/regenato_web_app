const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const axios = require("axios");
const cron = require("node-cron");
const PartListProjectModel = require("./model/project/PartListProjectModel");

// Middleware
app.use(express.json());
app.use(cors());

// Import routes (unchanged)
const { RmRouter } = require("./routes/variableRoutes/rmvariable.route");
const {
  manufacturRouter,
} = require("./routes/variableRoutes/manufacturing.route");
const { ShipmentRouter } = require("./routes/variableRoutes/shipment.route");
const {
  userVariableRouter,
} = require("./routes/variableRoutes/usersVariable.route");
const { OverheadsRouter } = require("./routes/variableRoutes/overheads.route");
const { GeneralRouter } = require("./routes/variableRoutes/general.route");
const { PartRoutes } = require("./routes/partsRoutes/parts.route");
const { ProjectRouter } = require("./routes/projectRoutes/project.route");
const {
  manufacturingStaticRouter,
} = require("./routes/variableRoutes/manufacturingStatic.route");
const partproject = require("./routes/defaultpartproject");
const subAssemblyRoutes = require("./routes/Sub-Assembly/subAssembly.route");
const excelPartroutes = require("./routes/PartsExcelData/excelParts");
const AssemblyRoutes = require("./routes/Assembly-route/assmebly.route");
const UserRoute = require("./routes/User_route/user.route");
const allocationRoutes = require("./routes/Allocation/allocation.routes");
const shiftRoutes = require("./routes/variableRoutes/shifts.routes");
const eventRoutes = require("./routes/variableRoutes/eventScheduler");
const { PartsExcelRoutes } = require("./routes/partsRoutes/partsExcel.routes");
const {
  inchargeVariableRouter,
} = require("./routes/variableRoutes/incharge.route");
const subAssemblyproject = require("./routes/defaultSubAssembly");
const assemblyListProject = require("./routes/defaultassembly");
const {
  storeVariableRouter,
} = require("./routes/variableRoutes/stores.routes");
const stagingRoutes = require("./routes/staging/Staging");
const { InventoryRouter } = require("./routes/variableRoutes/inventory.route");
const autoSyncService = require("./services/autoSyncService");

// MongoDB connection
const connect = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://ka5452488:mongodb123@cluster0.10yjjlt.mongodb.net/regenato?retryWrites=true&w=majority"
    );
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
  }
};

// Use routes
app.use("/api/rmvariable", RmRouter);
app.use("/api/manufacturing", manufacturRouter);
app.use("/api/shipment", ShipmentRouter);
app.use("/api/overheadsAndProfit", OverheadsRouter);
app.use("/api/general", GeneralRouter);
app.use("/api/manufacturingStatics", manufacturingStaticRouter);
app.use("/api/userVariable", userVariableRouter);
app.use("/api/shiftVariable", shiftRoutes);
app.use("/api/inchargeVariable", inchargeVariableRouter);
app.use("/api/storesVariable", storeVariableRouter);
app.use("/api/eventScheduler", eventRoutes);
app.use("/api/parts", PartsExcelRoutes);
app.use("/api/projects", ProjectRouter);

// this is for parts and project
app.use("/api/defpartproject", partproject);

// this is for only subAssebmly came from defaultsubAssembly
app.use("/api/defpartproject", subAssemblyproject);

// this is for assemblylist and came from the defaultassebmly.js
app.use("/api/defpartproject", assemblyListProject);

app.use("/api/subAssembly", subAssemblyRoutes);
app.use("/api/assmebly", AssemblyRoutes);
app.use("/api/userManagement", UserRoute);
app.use("/api/allocation", allocationRoutes);
app.use("/api", stagingRoutes);
app.use("/api/InventoryVaraible", InventoryRouter);

// Auto-sync service endpoints
app.get("/api/auto-sync/status", (req, res) => {
  res.json(autoSyncService.getStatus());
});

app.post("/api/auto-sync/start", (req, res) => {
  autoSyncService.start();
  res.json({
    message: "Auto-sync service started",
    status: autoSyncService.getStatus(),
  });
});

app.post("/api/auto-sync/stop", (req, res) => {
  autoSyncService.stop();
  res.json({
    message: "Auto-sync service stopped",
    status: autoSyncService.getStatus(),
  });
});

app.post("/api/auto-sync/sync-now", async (req, res) => {
  try {
    await autoSyncService.performSync();
    res.json({
      message: "Manual sync completed",
      status: autoSyncService.getStatus(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/holidays", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.11holidays.com/v1/holidays?country=IN&year=2025"
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// cron.schedule(
//   "45 23 * * *",
//   async () => {
//     try {
//       const today = new Date();
//       const todayDateStr = today.toISOString().split("T")[0]; // YYYY-MM-DD

//       const allProjects = await PartListProjectModel.find();

//       for (const project of allProjects) {
//         let projectModified = false;

//         // Function to process parts items (reusable for all three types)
//         const processPartsItems = (partsItems) => {
//           for (const partItem of partsItems) {
//             for (const process of partItem.allocations) {
//               for (const allocation of process.allocations) {
//                 const startDate = new Date(allocation.startDate);
//                 const endDate = new Date(allocation.endDate);

//                 if (today >= startDate && today <= endDate) {
//                   const exists = allocation.dailyTracking.some((entry) => {
//                     const entryDateStr = new Date(entry.date)
//                       .toISOString()
//                       .split("T")[0];
//                     return entryDateStr === todayDateStr;
//                   });

//                   if (!exists) {
//                     console.log(
//                       `Auto adding tracking for Allocation: ${allocation._id}`
//                     );

//                     allocation.dailyTracking.push({
//                       date: today,
//                       planned: allocation.dailyPlannedQty || 0,
//                       produced: 0,
//                       operator: "Auto-Generated",
//                       dailyStatus: "Delayed", // Set default status to Delayed as requested
//                     });
//                     return true; // Indicates modification was made
//                   }
//                 }
//               }
//             }
//           }
//           return false; // No modifications made
//         };

//         // Process partsLists
//         for (const partsList of project.partsLists) {
//           if (processPartsItems(partsList.partsListItems)) {
//             projectModified = true;
//           }
//         }

//         // Process subAssemblyListFirst
//         for (const subAssembly of project.subAssemblyListFirst) {
//           if (processPartsItems(subAssembly.partsListItems)) {
//             projectModified = true;
//           }
//         }

//         // Process assemblyList
//         for (const assembly of project.assemblyList) {
//           // Process assembly's direct parts
//           if (processPartsItems(assembly.partsListItems)) {
//             projectModified = true;
//           }

//           // Process assembly's subAssemblies parts
//           for (const subAssembly of assembly.subAssemblies) {
//             if (processPartsItems(subAssembly.partsListItems)) {
//               projectModified = true;
//             }
//           }
//         }

//         // Save only if modifications done
//         if (projectModified) {
//           await project.save();
//           console.log(`Project ${project._id} updated with auto-tracking`);
//         }
//       }
//     } catch (error) {
//       console.error("Error in Auto Daily Tracking Cron:", error);
//     }
//   },
//   {
//     timezone: "Asia/Kolkata",
//   }
// );

// =====================

// cron.schedule(
//   "45 23 * * *",
//   async () => {
//     try {
//       // Get today's date in YYYY-MM-DD format
//       const today = new Date();
//       const todayDateStr = today.toISOString().split("T")[0];

//       const allProjects = await PartListProjectModel.find();

//       // Helper function to process a list of part items
//       const processPartsItems = (partsItems) => {
//         let modified = false;

//         for (const partItem of partsItems) {
//           for (const process of partItem.allocations) {
//             for (const allocation of process.allocations) {
//               const startDate = new Date(allocation.startDate);
//               const endDate = new Date(allocation.endDate);

//               // Only process allocations that are active today
//               if (today >= startDate && today <= endDate) {
//                 const exists = allocation.dailyTracking.some((entry) => {
//                   const entryDateStr = new Date(entry.date)
//                     .toISOString()
//                     .split("T")[0];
//                   return entryDateStr === todayDateStr;
//                 });

//                 // If today's tracking is missing, auto-generate
//                 if (!exists) {
//                   // console.log(
//                   //   ` Auto adding tracking for Allocation: ${allocation._id}`
//                   // );

//                   allocation.dailyTracking.push({
//                     date: today,
//                     planned: allocation.dailyPlannedQty || 0,
//                     produced: 0,
//                     operator: "Auto-Generated",
//                     dailyStatus: "Delayed", // Default status for auto entries
//                   });
//                   modified = true;
//                 }
//               }
//             }
//           }
//         }

//         return modified;
//       };

//       for (const project of allProjects) {
//         let projectModified = false;

//         // Process partsLists
//         for (const partsList of project.partsLists) {
//           if (processPartsItems(partsList.partsListItems)) {
//             projectModified = true;
//           }
//         }

//         // Process subAssemblyListFirst
//         for (const subAssembly of project.subAssemblyListFirst) {
//           if (processPartsItems(subAssembly.partsListItems)) {
//             projectModified = true;
//           }
//         }

//         // Process assemblyList and its subAssemblies
//         for (const assembly of project.assemblyList) {
//           if (processPartsItems(assembly.partsListItems)) {
//             projectModified = true;
//           }
//           for (const subAssembly of assembly.subAssemblies) {
//             if (processPartsItems(subAssembly.partsListItems)) {
//               projectModified = true;
//             }
//           }
//         }

//         // Save only if any modification was made
//         if (projectModified) {
//           await project.save();
//           console.log(`Project ${project._id} updated with auto-tracking`);
//         }
//       }

//       console.log("✅ Auto Daily Tracking Cron finished");
//     } catch (error) {
//       console.error("Error in Auto Daily Tracking Cron:", error);
//     }
//   },
//   {
//     timezone: "Asia/Kolkata",
//   }
// );

cron.schedule(
  "45 23 * * *",
  async () => {
    try {
      const today = new Date();
      const todayDateStr = today.toISOString().split("T")[0];

      console.log(`Auto Daily Tracking Cron started for ${todayDateStr}`);

      const allProjects = await PartListProjectModel.find();

      const processPartsItems = (partsItems) => {
        let modified = false;

        for (const partItem of partsItems) {
          for (const process of partItem.allocations) {
            for (const allocation of process.allocations) {
              const startDate = new Date(allocation.startDate);
              const endDate = new Date(allocation.endDate);

              // Loop from allocation startDate until yesterday (not today)
              let current = new Date(startDate);
              while (current < today && current <= endDate) {
                const currentDateStr = current.toISOString().split("T")[0];

                const exists = allocation.dailyTracking.some((entry) => {
                  const entryDateStr = new Date(entry.date)
                    .toISOString()
                    .split("T")[0];
                  return entryDateStr === currentDateStr;
                });

                if (!exists) {
                  console.log(
                    `Auto adding tracking for Allocation: ${allocation._id} on ${currentDateStr}`
                  );

                  allocation.dailyTracking.push({
                    date: new Date(current),
                    planned: allocation.dailyPlannedQty || 0,
                    produced: 0,
                    operator: "Auto-Generated",
                    dailyStatus: "Delayed",
                  });
                  modified = true;
                }

                // Move to next day
                current.setDate(current.getDate() + 1);
              }
            }
          }
        }

        return modified;
      };

      for (const project of allProjects) {
        let projectModified = false;

        // Process partsLists
        for (const partsList of project.partsLists) {
          if (processPartsItems(partsList.partsListItems)) {
            projectModified = true;
          }
        }

        // Process subAssemblyListFirst
        for (const subAssembly of project.subAssemblyListFirst) {
          if (processPartsItems(subAssembly.partsListItems)) {
            projectModified = true;
          }
        }

        // Process assemblyList & subAssemblies
        for (const assembly of project.assemblyList) {
          if (processPartsItems(assembly.partsListItems)) {
            projectModified = true;
          }
          for (const subAssembly of assembly.subAssemblies) {
            if (processPartsItems(subAssembly.partsListItems)) {
              projectModified = true;
            }
          }
        }

        if (projectModified) {
          await project.save();
          console.log(`Project ${project._id} updated with auto-tracking`);
        }
      }

      console.log("Auto Daily Tracking Cron finished");
    } catch (error) {
      console.error("Error in Auto Daily Tracking Cron:", error);
    }
  },
  {
    timezone: "Asia/Kolkata",
  }
);

// ===================
// Start Server
// ===================
const PORT = 4040;
app.listen(PORT, "0.0.0.0", () => {
  connect();
  console.log(`Server is running on port ${PORT}`);

  // Start auto-sync service after server starts
  setTimeout(() => {
    autoSyncService.start();
    console.log("Auto-sync service started automatically for 2526 series");
  }, 5000); // Start after 5 seconds to ensure database connection is ready
});
