const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const axios = require("axios");
// Middleware
app.use(express.json());
app.use(cors());
 
// Import other routes
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
const { PartRoutes } = require("./routes/partsRoutes/parts.route"); // Part Routes
const { ProjectRouter } = require("./routes/projectRoutes/project.route"); // Project Routes
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
 
// Use the routes
 
app.use("/api/rmvariable", RmRouter);
app.use("/api/manufacturing", manufacturRouter);
app.use("/api/shipment", ShipmentRouter);
app.use("/api/overheadsAndProfit", OverheadsRouter);
app.use("/api/general", GeneralRouter);
app.use("/api/manufacturingStatics", manufacturingStaticRouter);
app.use("/api/userVariable", userVariableRouter);
app.use("/api/shiftVariable", shiftRoutes);
app.use("/api/eventScheduler", eventRoutes);
 
// Use PartRoutes for handling part-related route
// Use PartRoutes for handling part-related routes
// app.use("/api/parts", PartRoutes); // Corrected the route
 
 
// THIS IS ONLY FOR NEW EXCEL LOGIC
app.use("/api/parts" , PartsExcelRoutes);
 
// Use ProjectRouter for handling project-related routes
app.use("/api/projects", ProjectRouter);
 
app.use("/api/defpartproject", partproject);
 
app.use("/api/subAssembly", subAssemblyRoutes);
app.use("/api/assmebly", AssemblyRoutes);
 
// for authentication
app.use("/api/userManagement", UserRoute);
 
//for allocation
app.use("/api/allocation", allocationRoutes);
 
// app.use("/api/parts", excelPartroutes)
 
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
 
const PORT = 4040;
// app.listen(PORT, () => {
app.listen(PORT, "0.0.0.0", () => {
  connect();
  console.log(`Server is running on port ${PORT}`);
});
 
// ${process.env.REACT_APP_BASE_URL}/