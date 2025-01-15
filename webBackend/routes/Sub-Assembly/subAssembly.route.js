// subAssembly.route.js

const express = require("express");
const subAssemblyRoutes = express.Router();
const SubAssemblyModel = require("../../model/sub-Assembly/subAssebmlyModel");

// GET route to fetch all sub-assemblies
subAssemblyRoutes.get("/", async (req, res) => {
  try {
    const subAssemblies = await SubAssemblyModel.find().exec();
    res.status(200).json(subAssemblies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST route to create a new sub-assembly
subAssemblyRoutes.post("/", async (req, res) => {
  try {
    const { subAssemblyName, SubAssemblyNumber } = req.body;

    if (!subAssemblyName || !SubAssemblyNumber) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newSubAssembly = new SubAssemblyModel({
      subAssemblyName,
      SubAssemblyNumber,
    });

    const savedSubAssembly = await newSubAssembly.save();

    res.status(201).json(savedSubAssembly);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT route to update an existing sub-assembly
subAssemblyRoutes.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { subAssemblyName, SubAssemblyNumber } = req.body;

    if (!subAssemblyName || !SubAssemblyNumber) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const updatedSubAssembly = await SubAssemblyModel.findByIdAndUpdate(
      id,
      { $set: { subAssemblyName, SubAssemblyNumber } },
      { new: true }
    );

    if (!updatedSubAssembly) {
      return res.status(404).json({ error: "Sub-assembly not found" });
    }

    res.status(200).json(updatedSubAssembly);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST route to duplicate a sub-assembly
subAssemblyRoutes.post("/duplicate/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { subAssemblyName, SubAssemblyNumber } = req.body;

    // Find the original sub-assembly
    const originalSubAssembly = await SubAssemblyModel.findById(id);

    if (!originalSubAssembly) {
      return res.status(404).json({ error: "Original sub-assembly not found" });
    }

    // Create a new sub-assembly based on the original
    const newSubAssembly = new SubAssemblyModel({
      ...originalSubAssembly._doc,
      subAssemblyName: `${originalSubAssembly.subAssemblyName} - Copy`,
      SubAssemblyNumber: `${originalSubAssembly.SubAssemblyNumber} - Copy`,
    });

    await newSubAssembly.save();

    res.status(201).json(newSubAssembly);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE route to remove a sub-assembly
subAssemblyRoutes.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await SubAssemblyModel.findByIdAndRemove(id);

    res.status(204).json({ message: "Sub-assembly deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = subAssemblyRoutes;
