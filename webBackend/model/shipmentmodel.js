const mongoose = require("mongoose");

const shipmentSchema = mongoose.Schema({
    categoryId: String,
    name: String,
    hourlyrate: Number,
});

const ShipmentModel = mongoose.model("shipment", shipmentSchema);

module.exports = ShipmentModel;