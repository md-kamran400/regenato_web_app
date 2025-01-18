const { Router } = require("express");
const ShipmentModel = require("../../model/shipmentmodel");
const ShipmentRouter = Router();

// POST request (already existing)
// ShipmentRouter.post("/", async (req, res) => {
//     try {
//         let Shipment = new ShipmentModel(req.body);
//         await Shipment.save();
//         res.status(200).json({ msg: "Shipment Variable Added", addShipment: Shipment });
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// });

ShipmentRouter.post("/", async (req, res) => {
  try {
    // Check if the categoryId already exists
    const existingShipment = await ShipmentModel.findOne({
      categoryId: req.body.categoryId,
    });

    if (existingShipment) {
      return res.status(409).json({
        error: "Category ID already exists",
        message: "Please choose a different Category ID",
      });
    }

    let Shipment = new ShipmentModel(req.body);
    await Shipment.save();

    res.status(201).json({
      msg: "Shipment Variable Added",
      addShipment: Shipment,
      message: "New shipment variable created successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      // MongoDB duplicate key error
      return res.status(409).json({
        error: "Duplicate Category ID",
        message: "Category ID already exists. Please choose a different one.",
      });
    }
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
    const updatedShipment = await ShipmentModel.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

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
