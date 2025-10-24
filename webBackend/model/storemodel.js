const mongoose = require("mongoose");

const StoresSchema = mongoose.Schema({
  categoryId: { type: String, required: true, unique: true },
  Name: [{ type: String }],
  location: [{ type: String }],
  quantity: [{ type: Number }],
  adjustmentQty: { type: Number, default: 0 },
  adjustmentType: { type: String, enum: ["+", "-"], default: "+" },
  transactionHistory: [
    {
      adjustmentQty: { type: Number, required: true },
      adjustmentType: { type: String, enum: ["+", "-"], required: true },
      previousQuantity: { type: Number, required: true },
      newQuantity: { type: Number, required: true },
      timestamp: { type: Date, default: Date.now },
      operator: { type: String, default: "System" },
      reason: { type: String, default: "Manual Adjustment" },
    },
  ],
});

const StoreVariableModal = mongoose.model("storeVariable", StoresSchema);

module.exports = StoreVariableModal;
