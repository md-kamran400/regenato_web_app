const mongoose = require("mongoose");

// Main Part schema
const partSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  partName: { type: String },
  clientNumber: { type: String },
  codeName: { type: String },
  partType: { type: String, enum: ["Make", "Purchase"] },
  costPerUnit: { type: Number },
  timePerUnit: { type: Number },
  stockPOQty: { type: Number },
  totalCost: { type: Number },
  totalQuantity: { type: Number },
  image: {type: String},
  generalVariables: [
    {
      categoryId: String,
      name: String,
      value: String,
    },
  ],
  rmVariables: [
    {
      categoryId: String,
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
      times: String,
      hours: Number,
      hourlyRate: Number,
      totalRate: Number,
      index: { type: Number, required: true, default: 0 }, // Add this line
    },
  ],
  shipmentVariables: [
    {
      categoryId: String,
      name: String,
      hourlyRate: Number,
    },
  ],
  overheadsAndProfits: [
    {
      categoryId: String,
      name: String,
      percentage: Number,
      totalRate: Number,
    },
  ],
  index: { type: Number },

  //for time traking
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});


partSchema.pre('save', function(next) {
  if (this.manufacturingVariables && this.manufacturingVariables.length > 0) {
    this.manufacturingVariables.forEach((item, index) => {
      item.index = index;
    });
  }
  next();
});

const PartsModel = mongoose.model("Part", partSchema);

module.exports = PartsModel;