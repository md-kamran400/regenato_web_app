const express = require("express");
const allocationRoutes = express.Router();
const AllocationModal = require("../../model/Allocation/AllocationModal"); // Adjust the path as needed

// POST request to create a new allocation
allocationRoutes.post("/addallocations", async (req, res) => {
  try {
    const {
      projectName,
      processName,
      initialPlannedQuantity,
      remainingQuantity,
      allocations,
    } = req.body;

    // Create a new allocation document
    const newAllocation = new AllocationModal({
      projectName,
      processName,
      initialPlannedQuantity,
      remainingQuantity,
      allocations,
    });

    // Save to database
    const savedAllocation = await newAllocation.save();
    res.status(201).json({
      message: "Allocation created successfully",
      data: savedAllocation,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating allocation", error: error.message });
  }
});
allocationRoutes.get("/allallocations", async (req, res) => {
  try {
    const allAllocations = await AllocationModal.find();

    res.status(200).json({
      message: "All allocations retrieved successfully",
      data: allAllocations,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving allocations", error: error.message });
  }
});
module.exports = allocationRoutes;
