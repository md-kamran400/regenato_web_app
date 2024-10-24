const { Router } = require("express");
const ShipmentModel = require("../../model/shipmentmodel");
const ShipmentRouter = Router();

// POST request (already existing)
ShipmentRouter.post("/", async (req, res) => {
    try {
        let Shipment = new ShipmentModel(req.body);
        await Shipment.save();
        res.status(200).json({ msg: "Shipment Variable Added", addShipment: Shipment });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET request to retrieve all Shipment data (already existing)
ShipmentRouter.get("/", async (req, res) => {
    try {
        const allShipment = await ShipmentModel.find();
        res.status(200).json(allShipment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT request to update a Shipment entry by ID
ShipmentRouter.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updatedShipment = await ShipmentModel.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        if (!updatedShipment) {
            return res.status(404).json({ msg: "Shipment entry not found" });
        }

        res.status(200).json({ msg: "Shipment entry updated", updatedShipment });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE request to remove a Shipment entry by ID
ShipmentRouter.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedShipment = await ShipmentModel.findByIdAndDelete(id);

        if (!deletedShipment) {
            return res.status(404).json({ msg: "Shipment entry not found" });
        }

        res.status(200).json({ msg: "Shipment entry deleted", deletedShipment });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = { ShipmentRouter };
