const { default: mongoose } = require("mongoose");

const SubAssemblySchema = new mongoose.Schema({
  subAssemblyName: String,
  SubAssemblyNumber: String,
});

const SubAssemblyModel = mongoose.model("subAssembly", SubAssemblySchema);
module.exports = SubAssemblyModel;
