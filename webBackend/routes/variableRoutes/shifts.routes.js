const express = require("express");
const ShiftModel = require("../../model/shiftVariableModal"); // Adjust path as needed

const shiftRoutes = express.Router();

// Create a new shift
shiftRoutes.post("/", async (req, res) => {
  try {
    const shift = new ShiftModel(req.body);
    await shift.save();
    res.status(201).json(shift);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all shifts
shiftRoutes.get("/", async (req, res) => {
  try {
    const shifts = await ShiftModel.find();
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single shift by ID
shiftRoutes.get("/:id", async (req, res) => {
  try {
    const shift = await ShiftModel.findById(req.params.id);
    if (!shift) return res.status(404).json({ error: "Shift not found" });
    res.json(shift);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a shift
shiftRoutes.put("/:id", async (req, res) => {
  try {
    const shift = await ShiftModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!shift) return res.status(404).json({ error: "Shift not found" });
    res.json(shift);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a shift
shiftRoutes.delete("/:id", async (req, res) => {
  try {
    const shift = await ShiftModel.findByIdAndDelete(req.params.id);
    if (!shift) return res.status(404).json({ error: "Shift not found" });
    res.json({ message: "Shift deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = shiftRoutes;
