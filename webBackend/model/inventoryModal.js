const mongoose = require("mongoose");

const inventorySchema = mongoose.Schema({
  DocDate: String,
  ItemCode: String,
  Dscription: String,
  Quantity: Number,
  WhsCode: String,
  FromWhsCod: String
});

const InventoryModal = mongoose.model("inventorySchema", inventorySchema);

module.exports = InventoryModal;
