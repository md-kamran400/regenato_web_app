const { default: mongoose } = require("mongoose");

const SubAssemblySchema = new mongoose.Schema({
  subAssemblyName: String,
  SubAssemblyNumber: String,

  //for time traking
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const SubAssemblyModel = mongoose.model("subAssembly", SubAssemblySchema);
module.exports = SubAssemblyModel;
