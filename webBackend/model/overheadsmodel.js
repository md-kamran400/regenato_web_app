const mongoose = require("mongoose");

const overheadsSchema = mongoose.Schema({
    categoryId:  { type: String, required: true, unique: true },
    name: String,
    percentage: Number,
    totalrate: Number,
});

const OverheadsModel = mongoose.model("overheads", overheadsSchema);

module.exports = OverheadsModel;