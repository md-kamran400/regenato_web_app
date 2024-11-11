const mongoose = require("mongoose");

const manufacturingStactic = mongoose.Schema({
    categoryId: String,
    name: String,
    totalRate: Number,
});

const ManufacturingStacticModal = mongoose.model("manufacturingStatic", manufacturingStactic);

module.exports = ManufacturingStacticModal;