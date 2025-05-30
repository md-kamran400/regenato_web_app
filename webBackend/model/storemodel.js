const mongoose = require("mongoose");

const StoresSchema = mongoose.Schema({
  categoryId: { type: String, required: true, unique: true },
  Name: [{ type: String }],
  location: [{ type: String }],
});

const StoreVariableModal = mongoose.model("storeVariable", StoresSchema);

module.exports = StoreVariableModal;
