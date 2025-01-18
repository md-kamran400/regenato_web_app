const mongoose = require("mongoose");

const generalSchema = mongoose.Schema({
  categoryId: { type: String, required: true, unique: true },
  name: String,
  value: Number,
});

const GeneralModel = mongoose.model("general", generalSchema);

module.exports = GeneralModel;
