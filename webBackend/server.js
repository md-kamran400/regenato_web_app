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
app.use('/api', stagingRoutes)

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


cron.schedule(
  "45 23 * * *",
  async () => {
    try {
      const today = new Date();
      const todayDateStr = today.toISOString().split("T")[0]; // YYYY-MM-DD

      const allProjects = await PartListProjectModel.find();

      for (const project of allProjects) {
        let projectModified = false;

        // Function to process parts items (reusable for all three types)
        const processPartsItems = (partsItems) => {
          for (const partItem of partsItems) {
            for (const process of partItem.allocations) {
              for (const allocation of process.allocations) {
                const startDate = new Date(allocation.startDate);
                const endDate = new Date(allocation.endDate);

                if (today >= startDate && today <= endDate) {
                  const exists = allocation.dailyTracking.some((entry) => {
                    const entryDateStr = new Date(entry.date)
                      .toISOString()
                      .split("T")[0];
                    return entryDateStr === todayDateStr;
                  });

                  if (!exists) {
                    console.log(
                      `Auto adding tracking for Allocation: ${allocation._id}`
                    );

                    allocation.dailyTracking.push({
                      date: today,
                      planned: allocation.dailyPlannedQty || 0,
                      produced: 0,
                      operator: "Auto-Generated",
                      dailyStatus: "Delayed", // Set default status to Delayed as requested
                    });
                    return true; // Indicates modification was made
                  }
                }
              }
            }
          }
          return false; // No modifications made
        };

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

        // Process assemblyList
        for (const assembly of project.assemblyList) {
          // Process assembly's direct parts
          if (processPartsItems(assembly.partsListItems)) {
            projectModified = true;
          }

          // Process assembly's subAssemblies parts
          for (const subAssembly of assembly.subAssemblies) {
            if (processPartsItems(subAssembly.partsListItems)) {
              projectModified = true;
            }
          }
        }

        // Save only if modifications done
        if (projectModified) {
          await project.save();
          console.log(`Project ${project._id} updated with auto-tracking`);
        }
      }
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
});
