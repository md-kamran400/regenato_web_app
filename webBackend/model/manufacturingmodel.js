const mongoose = require("mongoose");

const manufacturingSchema = mongoose.Schema({
    categoryId: String,
    name: String,
    hours: Number,
    hourlyrate: Number,
    totalrate: Number,
});

const ManufacturingModel = mongoose.model("manufacturing", manufacturingSchema);

module.exports = ManufacturingModel;