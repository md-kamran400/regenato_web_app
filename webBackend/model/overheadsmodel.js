const mongoose = require("mongoose");

const overheadsSchema = mongoose.Schema({
    categoryId: String,
    name: String,
    percentage: Number,
    totalrate: Number,
});

const OverheadsModel = mongoose.model("overheads", overheadsSchema);

module.exports = OverheadsModel;