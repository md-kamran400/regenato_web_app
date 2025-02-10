const mongoose = require("mongoose");

const userVariableSchema = mongoose.Schema({
  categoryId: { type: String, required: true, unique: true },
  name: String,
  processName: [{ type: String }], // Allow multiple names
});

const userVariableModel = mongoose.model("usersVariable", userVariableSchema);

module.exports = userVariableModel;
