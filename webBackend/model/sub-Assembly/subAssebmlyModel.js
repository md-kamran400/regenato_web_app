const { default: mongoose } = require("mongoose");

const partSchema = new mongoose.Schema({
  partsListName: String,
  Uid: String,
  partsCodeId: String,
  partName: String,
  codeName: String,
  costPerUnit: Number,
  timePerUnit: Number,
  quantity: { type: Number, default: 0 },
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
});

const SubAssemblySchema = new mongoose.Schema({
  subAssemblyName: String,
  SubAssemblyNumber: String,
  costPerUnit: Number,
  timePerUnit: Number,
  partsListItems: [partSchema],
  //for time traking
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const SubAssemblyModel = mongoose.model("subAssembly", SubAssemblySchema);
module.exports = SubAssemblyModel;
