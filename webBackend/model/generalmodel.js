const mongoose = require("mongoose");

const generalSchema = mongoose.Schema({
    categoryId: String,
    name: String,
    value: Number,
});

const GeneralModel = mongoose.model("general", generalSchema);

module.exports = GeneralModel;