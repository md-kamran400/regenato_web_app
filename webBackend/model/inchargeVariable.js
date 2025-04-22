const mongoose = require("mongoose");

// const inchargeVariableSchema = mongoose.Schema({
//   categoryId: { type: String, required: true, unique: true },
//   name: String,
//   processeName: String,
//   processess: [{ type: String }],
//   operators: [{
//     name: String,
//     categoryId: String
//   }]
// });

const inchargeVariableSchema = mongoose.Schema({
  categoryId: { type: String, required: true, unique: true },
  name: String,
  processeName: [{ type: String }], // Changed to array
  processess: [{ type: String }],
  operators: [{
    name: String,
    categoryId: String
  }]
});

const InchargeVariableModal = mongoose.model("inchargeVariable", inchargeVariableSchema);

module.exports = InchargeVariableModal;