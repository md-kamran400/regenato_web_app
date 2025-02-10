const { Router } = require("express");
const userVariableModal = require("../../model/userVariableModal");
const userVariableRouter = Router();

userVariableRouter.post("/", async (req, res) => {
  try {
    // Check if the categoryId already exists
    const existingShipment = await userVariableModal.findOne({
      categoryId: req.body.categoryId,
    });

    if (existingShipment) {
      return res.status(409).json({
        error: "Category ID already exists",
        message: "Please choose a different Category ID",
      });
    }

    let Shipment = new userVariableModal(req.body);
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
userVariableRouter.get("/", async (req, res) => {
  try {
    const allShipment = await userVariableModal.find();
    res.status(200).json(allShipment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

userVariableRouter.get("/:id", async (req, res) => {
    try {
      const userVariable = await userVariableModal.findById(req.params.id);
      if (!userVariable) {
        return res.status(404).json({ message: "User variable not found" });
      }
      res.json(userVariable);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });
  

// PUT request to update a Shipment entry by ID
userVariableRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedShipment = await userVariableModal.findByIdAndUpdate(
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
userVariableRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedShipment = await userVariableModal.findByIdAndDelete(id);

    if (!deletedShipment) {
      return res.status(404).json({ msg: "Shipment entry not found" });
    }

    res.status(200).json({ msg: "Shipment entry deleted", deletedShipment });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = { userVariableRouter };
