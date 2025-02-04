const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Import other routes
const { RmRouter } = require("./routes/variableRoutes/rmvariable.route");
const {
  manufacturRouter,
} = require("./routes/variableRoutes/manufacturing.route");
const { ShipmentRouter } = require("./routes/variableRoutes/shipment.route");
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

// Use PartRoutes for handling part-related routes
app.use("/api/parts", PartRoutes); // Corrected the route

// Use ProjectRouter for handling project-related routes
app.use("/api/projects", ProjectRouter);

app.use("/api/defpartproject", partproject);

app.use("/api/subAssembly", subAssemblyRoutes);
app.use("/api/assmebly", AssemblyRoutes);

// for authentication
app.use("/api/userManagement", UserRoute);

// app.use("/api/parts", excelPartroutes)

const PORT = 4040;
app.listen(PORT, () => {
  connect();
  console.log(`Server is running on port ${PORT}`);
});

// ${process.env.REACT_APP_BASE_URL}/
