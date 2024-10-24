const mongoose = require("mongoose");

const rmVariableSchema = mongoose.Schema({
    categoryId: String,
    name: String,
    price: Number,
});

const RmVariableModel = mongoose.model("rmvariables", rmVariableSchema); // Collection name: rmvariables

module.exports = RmVariableModel;
