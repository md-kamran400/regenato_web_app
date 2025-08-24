const mongoose = require("mongoose");

const StoresSchema = mongoose.Schema({
  categoryId: { type: String, required: true, unique: true },
  Name: [{ type: String }],
  location: [{ type: String }],
  quantity: [{ type: Number }],
});

const StoreVariableModal = mongoose.model("storeVariable", StoresSchema);

module.exports = StoreVariableModal;
