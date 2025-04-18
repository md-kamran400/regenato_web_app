// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const app = express();
// const axios = require("axios");
// // Middleware
// app.use(express.json());
// app.use(cors());

// // Import other routes
// const { RmRouter } = require("./routes/variableRoutes/rmvariable.route");
// const {
//   manufacturRouter,
// } = require("./routes/variableRoutes/manufacturing.route");
// const { ShipmentRouter } = require("./routes/variableRoutes/shipment.route");
// const {
//   userVariableRouter,
// } = require("./routes/variableRoutes/usersVariable.route");
// const { OverheadsRouter } = require("./routes/variableRoutes/overheads.route");
// const { GeneralRouter } = require("./routes/variableRoutes/general.route");
// const { PartRoutes } = require("./routes/partsRoutes/parts.route"); // Part Routes
// const { ProjectRouter } = require("./routes/projectRoutes/project.route"); // Project Routes
// const {
//   manufacturingStaticRouter,
// } = require("./routes/variableRoutes/manufacturingStatic.route");
// const partproject = require("./routes/defaultpartproject");
// const subAssemblyRoutes = require("./routes/Sub-Assembly/subAssembly.route");
// const excelPartroutes = require("./routes/PartsExcelData/excelParts");
// const AssemblyRoutes = require("./routes/Assembly-route/assmebly.route");
// const UserRoute = require("./routes/User_route/user.route");
// const allocationRoutes = require("./routes/Allocation/allocation.routes");
// const shiftRoutes = require("./routes/variableRoutes/shifts.routes");
// const eventRoutes = require("./routes/variableRoutes/eventScheduler");
// const { PartsExcelRoutes } = require("./routes/partsRoutes/partsExcel.routes");

// // MongoDB connection
// const connect = async () => {
//   try {
//     await mongoose.connect(
//       "mongodb+srv://ka5452488:mongodb123@cluster0.10yjjlt.mongodb.net/regenato?retryWrites=true&w=majority"
//     );
//     console.log("Connected to MongoDB");
//   } catch (error) {
//     console.log(error);
//   }
// };

// // Use the routes

// app.use("/api/rmvariable", RmRouter);
// app.use("/api/manufacturing", manufacturRouter);
// app.use("/api/shipment", ShipmentRouter);
// app.use("/api/overheadsAndProfit", OverheadsRouter);
// app.use("/api/general", GeneralRouter);
// app.use("/api/manufacturingStatics", manufacturingStaticRouter);
// app.use("/api/userVariable", userVariableRouter);
// app.use("/api/shiftVariable", shiftRoutes);
// app.use("/api/eventScheduler", eventRoutes);

// // Use PartRoutes for handling part-related route
// // Use PartRoutes for handling part-related routes
// // app.use("/api/parts", PartRoutes); // Corrected the route

// // THIS IS ONLY FOR NEW EXCEL LOGIC
// app.use("/api/parts", PartsExcelRoutes);

// // Use ProjectRouter for handling project-related routes
// app.use("/api/projects", ProjectRouter);

// app.use("/api/defpartproject", partproject);

// app.use("/api/subAssembly", subAssemblyRoutes);
// app.use("/api/assmebly", AssemblyRoutes);

// // for authentication
// app.use("/api/userManagement", UserRoute);

// //for allocation
// app.use("/api/allocation", allocationRoutes);

// // app.use("/api/parts", excelPartroutes)

// app.get("/api/holidays", async (req, res) => {
//   try {
//     const response = await axios.get(
//       "https://api.11holidays.com/v1/holidays?country=IN&year=2025"
//     );
//     res.json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch data" });
//   }
// });

// const PORT = 4040;
// // app.listen(PORT, () => {
// app.listen(PORT, "0.0.0.0", () => {
//   connect();
//   console.log(`Server is running on port ${PORT}`);
// });

// // ${process.env.REACT_APP_BASE_URL}/



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
const { manufacturRouter } = require("./routes/variableRoutes/manufacturing.route");
const { ShipmentRouter } = require("./routes/variableRoutes/shipment.route");
const { userVariableRouter } = require("./routes/variableRoutes/usersVariable.route");
const { OverheadsRouter } = require("./routes/variableRoutes/overheads.route");
const { GeneralRouter } = require("./routes/variableRoutes/general.route");
const { PartRoutes } = require("./routes/partsRoutes/parts.route");
const { ProjectRouter } = require("./routes/projectRoutes/project.route");
const { manufacturingStaticRouter } = require("./routes/variableRoutes/manufacturingStatic.route");
const partproject = require("./routes/defaultpartproject");
const subAssemblyRoutes = require("./routes/Sub-Assembly/subAssembly.route");
const excelPartroutes = require("./routes/PartsExcelData/excelParts");
const AssemblyRoutes = require("./routes/Assembly-route/assmebly.route");
const UserRoute = require("./routes/User_route/user.route");
const allocationRoutes = require("./routes/Allocation/allocation.routes");
const shiftRoutes = require("./routes/variableRoutes/shifts.routes");
const eventRoutes = require("./routes/variableRoutes/eventScheduler");
const { PartsExcelRoutes } = require("./routes/partsRoutes/partsExcel.routes");
const { inchargeVariableRouter } = require("./routes/variableRoutes/incharge.route");

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
app.use("/api/eventScheduler", eventRoutes);
app.use("/api/parts", PartsExcelRoutes);
app.use("/api/projects", ProjectRouter);
app.use("/api/defpartproject", partproject);
app.use("/api/subAssembly", subAssemblyRoutes);
app.use("/api/assmebly", AssemblyRoutes);
app.use("/api/userManagement", UserRoute);
app.use("/api/allocation", allocationRoutes);

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


// ===============================
// ✅ CRON JOB - Auto Daily Tracking
// ===============================
cron.schedule('59 23 * * *', async () => {
  console.log("Running Daily Auto-Tracking Check...");

  try {
    const today = new Date();
    const todayDateStr = today.toISOString().split("T")[0]; // YYYY-MM-DD

    const allProjects = await PartListProjectModel.find();

    for (const project of allProjects) {
      let projectModified = false;

      for (const partsList of project.partsLists) {
        for (const partItem of partsList.partsListItems) {
          for (const process of partItem.allocations) {
            for (const allocation of process.allocations) {
              const startDate = new Date(allocation.startDate);
              const endDate = new Date(allocation.endDate);

              if (today >= startDate && today <= endDate) {
                const exists = allocation.dailyTracking.some(entry => {
                  const entryDateStr = new Date(entry.date).toISOString().split("T")[0];
                  return entryDateStr === todayDateStr;
                });

                if (!exists) {
                  console.log(`Auto adding tracking for Allocation: ${allocation._id}`);

                  allocation.dailyTracking.push({
                    date: today,
                    planned: allocation.dailyPlannedQty || 0,
                    produced: 0,
                    operator: "Auto-Generated",
                    dailyStatus: "Pending",
                  });
                  projectModified = true;
                }
              }
            }
          }
        }
      }

      // Save only if modifications done
      if (projectModified) {
        await project.save();
        console.log(`Project ${project._id} updated with auto-tracking`);
      }
    }

    console.log("Daily Auto-Tracking Completed ✅");

  } catch (error) {
    console.error("Error in Auto Daily Tracking Cron:", error);
  }
});


// ===================
// Start Server
// ===================
const PORT = 4040;
app.listen(PORT, "0.0.0.0", () => {
  connect();
  console.log(`Server is running on port ${PORT}`);
});
