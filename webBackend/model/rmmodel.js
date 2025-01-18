const mongoose = require("mongoose");

const rmVariableSchema = mongoose.Schema({
    categoryId:  { type: String, required: true, unique: true },
    name: String,
    price: Number,
});

const RmVariableModel = mongoose.model("rmvariables", rmVariableSchema); // Collection name: rmvariables

module.exports = RmVariableModel;
