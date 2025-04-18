const mongoose = require("mongoose");

const inchargeVariableSchema = mongoose.Schema({
  categoryId: { type: String, required: true, unique: true },
  name: String,
  processeName: String,
  processess: [{ type: String }],
  operators: [{ type: String }],
});

const InchargeVariableModal = mongoose.model("inchargeVariable", inchargeVariableSchema);

module.exports = InchargeVariableModal;