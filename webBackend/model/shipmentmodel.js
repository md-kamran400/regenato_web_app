const mongoose = require("mongoose");

const shipmentSchema = mongoose.Schema({
  categoryId: { type: String, required: true, unique: true },
  name: String,
  hourlyrate: Number,
});

const ShipmentModel = mongoose.model("shipment", shipmentSchema);

module.exports = ShipmentModel;
