require("dotenv").config();
const { Router } = require("express");
const ManufacturingModel = require("../../model/manufacturingmodel");
const manufacturRouter = Router();
const axios = require("axios");
const mongoose = require("mongoose");

manufacturRouter.post("/", async (req, res) => {
  try {
    // Check if the categoryId already exists
    const existingManufacture = await ManufacturingModel.findOne({
      categoryId: req.body.categoryId,
    });

    if (existingManufacture) {
      return res.status(409).json({
        error: "Category ID already exists",
        message: "Please choose a different Category ID",
      });
    }

    let Manufacture = new ManufacturingModel(req.body);
    await Manufacture.save();

    res.status(201).json({
      msg: "Manufacturing variable Added",
      addManufacture: Manufacture,
      message: "New manufacturing variable created successfully",
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

manufacturRouter.post("/", async (req, res) => {
  try {
    // Check if the categoryId already exists
    const existingManufacture = await ManufacturingModel.findOne({
      categoryId: req.body.categoryId,
    });

    if (existingManufacture) {
      return res.status(409).json({
        error: "Category ID already exists",
        message: "Please choose a different Category ID",
      });
    }

    let Manufacture = new ManufacturingModel(req.body);
    await Manufacture.save();

    res.status(201).json({
      msg: "Manufacturing variable Added",
      addManufacture: Manufacture,
      message: "New manufacturing variable created successfully",
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

// GET request to retrieve all Manufacturing data (already existing)
manufacturRouter.get("/", async (req, res) => {
  try {
    const allManufacturingVariable = await ManufacturingModel.find();
    res.status(200).json(allManufacturingVariable);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT request to update a Manufacturing entry by ID
manufacturRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedManufacture = await ManufacturingModel.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedManufacture) {
      return res.status(404).json({ msg: "Manufacturing entry not found" });
    }

    res
      .status(200)
      .json({ msg: "Manufacturing entry updated", updatedManufacture });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE request to remove a Manufacturing entry by ID
manufacturRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedManufacture = await ManufacturingModel.findByIdAndDelete(id);

    if (!deletedManufacture) {
      return res.status(404).json({ msg: "Manufacturing entry not found" });
    }

    res
      .status(200)
      .json({ msg: "Manufacturing entry deleted", deletedManufacture });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add a subcategory to a specific manufacturing entry
manufacturRouter.post("/:id/subcategories", async (req, res) => {
  try {
    const { id } = req.params;
    const { subcategoryId, name, hourlyRate } = req.body;

    // Validate required fields
    if (!subcategoryId || !name || hourlyRate === undefined) {
      return res.status(400).json({
        msg: "Fields (subcategoryId, name, and hourlyRate) are required.",
      });
    }

    // Find the manufacturing entry by ID
    const manufacturingEntry = await ManufacturingModel.findById(id);
    if (!manufacturingEntry) {
      return res.status(404).json({ msg: "Manufacturing entry not found" });
    }

    // Check for duplicate subcategoryId in existing subcategories
    const isDuplicate = manufacturingEntry.subCategories.some(
      (sub) => sub.subcategoryId === subcategoryId
    );

    if (isDuplicate) {
      return res.status(400).json({
        msg: "Subcategory ID already exists. Please provide a unique subcategoryId.",
      });
    }

    // Create a new subcategory object with default values for missing fields
    const subCategory = {
      subcategoryId,
      name,
      hours: 0, // Default value
      hourlyRate,
      totalRate: 0, // Default value
    };

    // Add the subcategory to the manufacturing entry
    manufacturingEntry.subCategories.push(subCategory);

    // Save the updated entry
    await manufacturingEntry.save();

    res.status(200).json({
      msg: "Subcategory added",
      updatedManufacture: manufacturingEntry,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//edit a subcategory to a specific manufacturing entry
manufacturRouter.put("/:id/subcategories/:subId", async (req, res) => {
  try {
    const { id, subId } = req.params; // manufacturing entry ID and subcategory ID
    const updateData = req.body; // updated data for the subcategory

    // Find the manufacturing entry by ID
    const manufacturingEntry = await ManufacturingModel.findById(id);
    if (!manufacturingEntry) {
      return res.status(404).json({ msg: "Manufacturing entry not found" });
    }

    // Find the index of the subcategory to be updated
    const subCategoryIndex = manufacturingEntry.subCategories.findIndex(
      (sub) => sub._id.toString() === subId
    );

    if (subCategoryIndex === -1) {
      return res.status(404).json({ msg: "Subcategory not found" });
    }

    // Update the subcategory data
    Object.assign(
      manufacturingEntry.subCategories[subCategoryIndex],
      updateData
    );

    // Save the updated manufacturing entry
    await manufacturingEntry.save();

    res.status(200).json({
      msg: "Subcategory updated",
      updatedManufacture: manufacturingEntry,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//delete a subcategory to a specific manufacturing entry
manufacturRouter.delete("/:id/subcategories/:subId", async (req, res) => {
  try {
    const { id, subId } = req.params; // manufacturing entry ID and subcategory ID

    // Find the manufacturing entry by ID
    const manufacturingEntry = await ManufacturingModel.findById(id);
    if (!manufacturingEntry) {
      return res.status(404).json({ msg: "Manufacturing entry not found" });
    }

    // Find the index of the subcategory to be deleted
    const subCategoryIndex = manufacturingEntry.subCategories.findIndex(
      (sub) => sub._id.toString() === subId
    );

    if (subCategoryIndex === -1) {
      return res.status(404).json({ msg: "Subcategory not found" });
    }

    // Remove the subcategory from the array
    manufacturingEntry.subCategories.splice(subCategoryIndex, 1);

    // Save the updated manufacturing entry
    await manufacturingEntry.save();

    res.status(200).json({
      msg: "Subcategory deleted",
      updatedManufacture: manufacturingEntry,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add machine downtime
// Update the downtime POST endpoint
manufacturRouter.post("/:id/machines/:machineId/downtime", async (req, res) => {
  try {
    const { id, machineId } = req.params;
    const { startTime, endTime, reason, shift, downtimeType } = req.body;

    // Validate required fields including shift
    if (!startTime || !endTime || !reason || !shift) {
      return res.status(400).json({
        msg: "Start time, end time, reason, and shift are required for downtime scheduling",
      });
    }

    const downtimeRecord = {
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      reason,
      shift, // Make sure this is included
      downtimeType: downtimeType || "operator",
    };

    const manufacturingEntry = await ManufacturingModel.findById(id);
    if (!manufacturingEntry) {
      return res.status(404).json({ msg: "Manufacturing entry not found" });
    }

    const machineIndex = manufacturingEntry.subCategories.findIndex(
      (machine) => machine._id.toString() === machineId
    );

    if (machineIndex === -1) {
      return res.status(404).json({ msg: "Machine not found" });
    }

    // Add downtime record
    manufacturingEntry.subCategories[machineIndex].downtimeHistory.push(
      downtimeRecord
    );

    // Update machine status and availability
    manufacturingEntry.subCategories[machineIndex].isAvailable = false;
    manufacturingEntry.subCategories[machineIndex].status = "downtime";
    manufacturingEntry.subCategories[machineIndex].unavailableUntil = new Date(
      endTime
    );

    await manufacturingEntry.save();

    res.status(201).json({
      msg: "Machine downtime scheduled successfully",
      machine: manufacturingEntry.subCategories[machineIndex],
    });
  } catch (error) {
    console.error("Error scheduling downtime:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get machine downtime history
manufacturRouter.get("/:id/machines/:machineId/downtime", async (req, res) => {
  try {
    const { id, machineId } = req.params;

    // Find the manufacturing entry
    const manufacturingEntry = await ManufacturingModel.findById(id);
    if (!manufacturingEntry) {
      return res.status(404).json({ msg: "Manufacturing entry not found" });
    }

    // Find the machine
    const machine = manufacturingEntry.subCategories.find(
      (machine) => machine._id.toString() === machineId
    );

    if (!machine) {
      return res.status(404).json({ msg: "Machine not found" });
    }

    res.status(200).json({
      msg: "Downtime history retrieved successfully",
      downtimeHistory: machine.downtimeHistory || [],
    });
  } catch (error) {
    console.error("Error retrieving downtime history:", error);
    res.status(500).json({ error: error.message });
  }
});

// End machine downtime early
manufacturRouter.put(
  "/:id/machines/:machineId/downtime/:downtimeId/end",
  async (req, res) => {
    try {
      const { id, machineId, downtimeId } = req.params;
      const { endTime } = req.body;

      // Find the manufacturing entry
      const manufacturingEntry = await ManufacturingModel.findById(id);
      if (!manufacturingEntry) {
        return res.status(404).json({ msg: "Manufacturing entry not found" });
      }

      // Find the machine
      const machineIndex = manufacturingEntry.subCategories.findIndex(
        (machine) => machine._id.toString() === machineId
      );

      if (machineIndex === -1) {
        return res.status(404).json({ msg: "Machine not found" });
      }

      // Find the downtime record
      const downtimeIndex = manufacturingEntry.subCategories[
        machineIndex
      ].downtimeHistory.findIndex(
        (downtime) => downtime._id.toString() === downtimeId
      );

      if (downtimeIndex === -1) {
        return res.status(404).json({ msg: "Downtime record not found" });
      }

      // Update the end time
      manufacturingEntry.subCategories[machineIndex].downtimeHistory[
        downtimeIndex
      ].endTime = endTime ? new Date(endTime) : new Date();

      // Update machine availability
      manufacturingEntry.subCategories[machineIndex].isAvailable = true;
      manufacturingEntry.subCategories[machineIndex].unavailableUntil = null;

      await manufacturingEntry.save();

      res.status(200).json({
        msg: "Machine downtime ended successfully",
        machine: manufacturingEntry.subCategories[machineIndex],
      });
    } catch (error) {
      console.error("Error ending downtime:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

manufacturRouter.get("/category/:categoryId", async (req, res) => {
  try {
    let { categoryId } = req.params;
    const now = new Date();

    if (!categoryId || typeof categoryId !== "string") {
      return res.status(400).json({ msg: "Invalid categoryId format." });
    }

    const manufacturingEntry = await ManufacturingModel.findOne({ categoryId });

    if (!manufacturingEntry) {
      return res.status(404).json({ msg: "Manufacturing entry not found" });
    }

    let updated = false;

    // First check and update downtime status
    manufacturingEntry.subCategories.forEach((machine) => {
      // Only check active downtime records
      const activeDowntime = machine.downtimeHistory?.find(
        (downtime) =>
          downtime.shift && // Ensure shift exists
          !downtime.isCompleted && // Check if not completed
          new Date(downtime.startTime) <= now &&
          (!downtime.endTime || new Date(downtime.endTime) > now)
      );

      if (activeDowntime) {
        // Machine is in downtime
        if (machine.status !== "downtime") {
          machine.status = "downtime";
          machine.isAvailable = false;
          machine.unavailableUntil = new Date(activeDowntime.endTime);
          updated = true;
        }
      } else if (machine.status === "downtime") {
        // Downtime has ended
        machine.status = "available";
        machine.isAvailable = true;
        machine.unavailableUntil = null;
        updated = true;

        // Mark any incomplete downtime records as completed
        machine.downtimeHistory = machine.downtimeHistory.map(downtime => {
          if (!downtime.isCompleted && (!downtime.endTime || new Date(downtime.endTime) <= now)) {
            return { ...downtime, isCompleted: true };
          }
          return downtime;
        });
      }
    });

    if (updated) {
      await manufacturingEntry.save();
    }

    // Rest of your existing allocation checking logic remains the same...
    const allocationResponse = await axios.get(
      `${process.env.BASE_URL}/api/defpartproject/all-allocations`
    );

    if (!allocationResponse.data || !allocationResponse.data.data) {
      return res.status(500).json({ msg: "Failed to retrieve allocation data" });
    }

    const allocationData = allocationResponse.data;
    const currentDate = new Date();

    const allocatedMachinesByProcess = new Map();

    allocationData.data.forEach((project) => {
      project.allocations.forEach((process) => {
        process.allocations.forEach((alloc) => {
          if (alloc.machineId) {
            const startDate = new Date(alloc.startDate);
            const endDate = new Date(alloc.endDate);
            if (currentDate >= startDate && currentDate <= endDate) {
              if (!allocatedMachinesByProcess.has(process.processName)) {
                allocatedMachinesByProcess.set(process.processName, new Set());
              }
              allocatedMachinesByProcess.get(process.processName).add(alloc.machineId);
            }
          }
        });
      });
    });

    // Update machine status only if not in downtime
    manufacturingEntry.subCategories = manufacturingEntry.subCategories.map(
      (machine) => {
        // Skip if machine is in downtime
        if (machine.status === "downtime") {
          return machine.toObject();
        }

        if (
          allocatedMachinesByProcess.has(categoryId) &&
          allocatedMachinesByProcess.get(categoryId).has(machine.subcategoryId)
        ) {
          return {
            ...machine.toObject(),
            isAvailable: false,
            status: "occupied",
            statusEndDate: now,
          };
        }
        return {
          ...machine.toObject(),
          isAvailable: true,
          status: "available",
          statusEndDate: null,
        };
      }
    );

    await manufacturingEntry.save();

    res.status(200).json({
      msg: "Updated subcategories retrieved",
      subCategories: manufacturingEntry.subCategories,
    });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});


manufacturRouter.get("/all-category-ids", async (req, res) => {
  try {
    const allCategoryIds = await ManufacturingModel.distinct("categoryId");

    if (allCategoryIds.length === 0) {
      return res.status(404).json({
        msg: "No categories found",
      });
    }

    res.status(200).json({
      msg: "All category IDs retrieved successfully",
      categoryIds: allCategoryIds,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = { manufacturRouter };
