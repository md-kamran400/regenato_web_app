const express = require("express");
const subAssemblyRoutes = express.Router();
const SubAssemblyModel = require("../../model/sub-Assembly/subAssebmlyModel");
const mongoose = require("mongoose");

// GET all sub-assemblies
subAssemblyRoutes.get("/", async (req, res) => {
  try {
    const subAssemblies = await SubAssemblyModel.find().exec();
    res.status(200).json(subAssemblies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET a single sub-assembly by _id
// subAssemblyRoutes.get("/:_id", async (req, res) => {
//   try {
//     const { _id } = req.params;
//     const subAssembly = await SubAssemblyModel.findById(_id);
//     if (!subAssembly) {
//       return res.status(404).json({ error: "Sub-assembly not found" });
//     }
//     res.status(200).json(subAssembly);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

subAssemblyRoutes.get("/:_id", async (req, res) => {
  try {
    const { _id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ error: "Invalid sub-assembly ID format" });
    }

    const subAssembly = await SubAssemblyModel.findById(_id);
    if (!subAssembly) {
      return res.status(404).json({ error: "Sub-assembly not found" });
    }

    // Initialize total cost and total hours
    let costPerUnit = 0;
    let timePerUnit = 0;
    const machineHours = {};

    subAssembly.partsListItems.forEach((item) => {
      const itemcostPerUnit = item.costPerUnit * item.quantity;
      const itemtimePerUnit = item.timePerUnit * item.quantity;

      costPerUnit += itemcostPerUnit;
      timePerUnit += itemtimePerUnit;

      // Calculate individual machine hours
      item.manufacturingVariables.forEach((machine) => {
        const machineName = machine.name;
        const totalMachineHours = machine.hours * item.quantity;
        machineHours[machineName] =
          (machineHours[machineName] || 0) + totalMachineHours;
      });
    });

    // Update the sub-assembly document with calculated values
    subAssembly.costPerUnit = costPerUnit;
    subAssembly.timePerUnit = timePerUnit;
    subAssembly.machineHours = machineHours;
    subAssembly.updatedAt = new Date();

    // Save the changes to the database
    await subAssembly.save();

    res.status(200).json(subAssembly);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// put request for edit the quanityt
subAssemblyRoutes.put("/:subAssemblyId/parts/:partId", async (req, res) => {
  try {
    const { subAssemblyId, partId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(subAssemblyId)) {
      return res.status(400).json({ error: "Invalid sub-assembly ID format" });
    }

    if (!mongoose.Types.ObjectId.isValid(partId)) {
      return res.status(400).json({ error: "Invalid part ID format" });
    }

    const subAssembly = await SubAssemblyModel.findById(subAssemblyId);

    if (!subAssembly) {
      return res.status(404).json({ error: "Sub-assembly not found" });
    }

    const updatedPart = subAssembly.partsListItems.id(partId);

    if (!updatedPart) {
      return res.status(404).json({ error: "Part not found in sub-assembly" });
    }

    updatedPart.quantity = quantity;

    await subAssembly.save();

    res.status(200).json({
      message: "Part quantity updated successfully",
      data: updatedPart,
    });
  } catch (error) {
    console.error("Error updating part quantity:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST create a new sub-assembly
// In subAssembly.route.js

subAssemblyRoutes.post("/", async (req, res) => {
  try {
    const {
      subAssemblyName,
      SubAssemblyNumber,
      timePerUnit,
      costPerUnit,
      partsListItems,
    } = req.body;

    // Check if SubAssemblyNumber already exists
    const existingSubAssembly = await SubAssemblyModel.findOne({
      SubAssemblyNumber,
    });

    if (existingSubAssembly) {
      return res
        .status(400)
        .json({ error: "Sub Assembly Number Already Exists" });
    }

    const newSubAssembly = new SubAssemblyModel({
      subAssemblyName,
      SubAssemblyNumber,
      timePerUnit,
      costPerUnit,
      partsListItems,
    });

    await newSubAssembly.save();
    res.status(201).json(newSubAssembly);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update an existing sub-assembly
subAssemblyRoutes.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      subAssemblyName,
      SubAssemblyNumber,
      timePerUnit,
      costPerUnit,
      partsListItems,
    } = req.body;

    const updatedSubAssembly = await SubAssemblyModel.findByIdAndUpdate(
      id,
      {
        subAssemblyName,
        SubAssemblyNumber,
        timePerUnit,
        costPerUnit,
        partsListItems,
      },
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

// POST duplicate a sub-assembly
// subAssemblyRoutes.post("/duplicate/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     const originalSubAssembly = await SubAssemblyModel.findById(id);

//     if (!originalSubAssembly) {
//       return res.status(404).json({ error: "Original sub-assembly not found" });
//     }

//     const newSubAssembly = new SubAssemblyModel({
//       ...originalSubAssembly._doc,
//       _id: mongoose.Types.ObjectId(), // Generate new ObjectId
//       subAssemblyName: `${originalSubAssembly.subAssemblyName} - Copy`,
//       SubAssemblyNumber: `${originalSubAssembly.SubAssemblyNumber} - Copy`,
//     });

//     await newSubAssembly.save();

//     res.status(201).json(newSubAssembly);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
subAssemblyRoutes.post("/duplicate/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find the original sub-assembly
    const originalSubAssembly = await SubAssemblyModel.findById(id);

    if (!originalSubAssembly) {
      return res.status(404).json({ error: "Original sub-assembly not found" });
    }

    // Create a new sub-assembly based on the original
    const newSubAssembly = new SubAssemblyModel({
      ...originalSubAssembly._doc,
      _id: new mongoose.Types.ObjectId(), // Use new keyword here
      subAssemblyName: `${originalSubAssembly.subAssemblyName} - Copy`,
      SubAssemblyNumber: `${originalSubAssembly.SubAssemblyNumber} - Copy`,
    });

    await newSubAssembly.save();

    res.status(201).json(newSubAssembly);
  } catch (error) {
    console.error("Error duplicating sub-assembly:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE remove a sub-assembly
subAssemblyRoutes.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid sub-assembly ID format" });
    }

    const deletedSubAssembly = await SubAssemblyModel.findByIdAndDelete(id);

    if (!deletedSubAssembly) {
      return res.status(404).json({ error: "Sub-assembly not found" });
    }

    res.status(200).json({
      status: "success",
      message: "Sub-assembly deleted successfully",
      data: deletedSubAssembly,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST add a part to a sub-assembly
// POST route to add data to partsListItems for a specific sub-assembly
subAssemblyRoutes.post("/:id/partsListItems", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      partName,
      codeName,
      costPerUnit,
      timePerUnit,
      quantity,
      rmVariables,
      manufacturingVariables,
      shipmentVariables,
      overheadsAndProfits,
    } = req.body;

    // Fetch the sub-assembly document by ID
    const subAssembly = await SubAssemblyModel.findById(id);

    if (!subAssembly) {
      return res.status(404).json({ error: "Sub-assembly not found" });
    }

    // Create the new part object
    const newPart = {
      partName,
      codeName,
      costPerUnit,
      timePerUnit,
      quantity,
      rmVariables: rmVariables || [],
      manufacturingVariables: manufacturingVariables || [],
      shipmentVariables: shipmentVariables || [],
      overheadsAndProfits: overheadsAndProfits || [],
    };

    // Add the new part to the partsListItems array
    subAssembly.partsListItems.push(newPart);

    // Save the updated sub-assembly to the database
    await subAssembly.save();

    // Return only the newly added part
    res.status(201).json({
      message: "Part added successfully",
      data: newPart,
    });
  } catch (error) {
    console.error("Error adding part:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ... other routes ...

// DELETE remove a part from a sub-assembly
// Add this route at the end of your file
subAssemblyRoutes.delete("/:subAssemblyId/parts/:partId", async (req, res) => {
  try {
    const { subAssemblyId, partId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(subAssemblyId)) {
      return res.status(400).json({ error: "Invalid sub-assembly ID format" });
    }

    if (!mongoose.Types.ObjectId.isValid(partId)) {
      return res.status(400).json({ error: "Invalid part ID format" });
    }

    const subAssembly = await SubAssemblyModel.findById(subAssemblyId);

    if (!subAssembly) {
      return res.status(404).json({ error: "Sub-assembly not found" });
    }

    const updatedPartsList = subAssembly.partsListItems.filter(
      (part) => part._id.toString() !== partId
    );

    subAssembly.partsListItems = updatedPartsList;
    await subAssembly.save();

    res.status(200).json({
      message: "Part removed successfully",
      data: updatedPartsList,
    });
  } catch (error) {
    console.error("Error deleting part:", error);
    res.status(500).json({ error: error.message });
  }
});

// ... rest of the file ...

// GET parts of a sub-assembly
subAssemblyRoutes.get("/:id/parts", async (req, res) => {
  try {
    const { id } = req.params;
    const subAssembly = await SubAssemblyModel.findById(id);
    if (!subAssembly) {
      return res.status(404).json({ error: "Sub-assembly not found" });
    }
    res.status(200).json(subAssembly.partsListItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// edit the manufacturing
// PUT route to edit manufacturing data
subAssemblyRoutes.put(
  "/:subAssemblyId/parts/:partId/manufacturing/:variableId",
  async (req, res) => {
    try {
      const { subAssemblyId, partId, variableId } = req.params;
      const { name, hours, hourlyRate } = req.body;

      // Validate IDs
      if (
        !mongoose.Types.ObjectId.isValid(subAssemblyId) ||
        !mongoose.Types.ObjectId.isValid(partId) ||
        !mongoose.Types.ObjectId.isValid(variableId)
      ) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      // Find the sub-assembly
      const subAssembly = await SubAssemblyModel.findById(subAssemblyId);
      if (!subAssembly) {
        return res.status(404).json({ error: "Sub-assembly not found" });
      }

      // Find the part
      const part = subAssembly.partsListItems.id(partId);
      if (!part) {
        return res
          .status(404)
          .json({ error: "Part not found in sub-assembly" });
      }

      // Find the manufacturing variable
      const manufacturingVariable = part.manufacturingVariables.id(variableId);
      if (!manufacturingVariable) {
        return res
          .status(404)
          .json({ error: "Manufacturing variable not found" });
      }

      // Update the manufacturing variable
      manufacturingVariable.name = name;
      manufacturingVariable.hours = parseFloat(hours);
      manufacturingVariable.hourlyRate = parseFloat(hourlyRate);
      manufacturingVariable.totalRate =
        manufacturingVariable.hours * manufacturingVariable.hourlyRate;

      // Save the changes
      await subAssembly.save();

      res.status(200).json({
        message: "Manufacturing variable updated successfully",
        data: manufacturingVariable,
      });
    } catch (error) {
      console.error("Error updating manufacturing variable:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// put request for raw matarisl
subAssemblyRoutes.put(
  "/:subAssemblyId/parts/:partId/rmVariables/:rmVariableId",
  async (req, res) => {
    try {
      const { subAssemblyId, partId, rmVariableId } = req.params;
      const { name, netWeight, pricePerKg } = req.body;

      // Validate IDs
      if (
        !mongoose.Types.ObjectId.isValid(subAssemblyId) ||
        !mongoose.Types.ObjectId.isValid(partId) ||
        !mongoose.Types.ObjectId.isValid(rmVariableId)
      ) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      // Find the sub-assembly
      const subAssembly = await SubAssemblyModel.findById(subAssemblyId);
      if (!subAssembly) {
        return res.status(404).json({ error: "Sub-assembly not found" });
      }

      // Find the part
      const part = subAssembly.partsListItems.id(partId);
      if (!part) {
        return res
          .status(404)
          .json({ error: "Part not found in sub-assembly" });
      }

      // Find the rm variable
      const rmVariableIndex = part.rmVariables.findIndex(
        (item) => item._id.toString() === rmVariableId
      );
      if (rmVariableIndex === -1) {
        return res.status(404).json({ error: "RM Variable not found in part" });
      }

      // Update the rm variable
      part.rmVariables[rmVariableIndex] = {
        ...part.rmVariables[rmVariableIndex],
        name: name || part.rmVariables[rmVariableIndex].name,
        netWeight:
          parseFloat(netWeight) || part.rmVariables[rmVariableIndex].netWeight,
        pricePerKg:
          parseFloat(pricePerKg) ||
          part.rmVariables[rmVariableIndex].pricePerKg,
        totalRate: (parseFloat(netWeight) || 0) * (parseFloat(pricePerKg) || 0),
      };

      // Save the changes
      await subAssembly.save();

      res.status(200).json({
        message: "RM Variable updated successfully",
        data: part.rmVariables[rmVariableIndex],
      });
    } catch (error) {
      console.error("Error updating RM Variable:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// PUT request for the shipment
subAssemblyRoutes.put(
  "/:subAssemblyId/parts/:partId/shipmentVariables/:shipmentVariableId",
  async (req, res) => {
    try {
      const { subAssemblyId, partId, shipmentVariableId } = req.params;
      const { name, hourlyRate } = req.body;

      // Validate IDs
      if (
        !mongoose.Types.ObjectId.isValid(subAssemblyId) ||
        !mongoose.Types.ObjectId.isValid(partId) ||
        !mongoose.Types.ObjectId.isValid(shipmentVariableId)
      ) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      // Find the sub-assembly
      const subAssembly = await SubAssemblyModel.findById(subAssemblyId);
      if (!subAssembly) {
        return res.status(404).json({ error: "Sub-assembly not found" });
      }

      // Find the part
      const part = subAssembly.partsListItems.id(partId);
      if (!part) {
        return res
          .status(404)
          .json({ error: "Part not found in sub-assembly" });
      }

      // Find the shipment variable
      const shipmentVariableIndex = part.shipmentVariables.findIndex(
        (item) => item._id.toString() === shipmentVariableId
      );
      if (shipmentVariableIndex === -1) {
        return res
          .status(404)
          .json({ error: "Shipment Variable not found in part" });
      }

      // Update the shipment variable
      part.shipmentVariables[shipmentVariableIndex] = {
        ...part.shipmentVariables[shipmentVariableIndex],
        name: name || part.shipmentVariables[shipmentVariableIndex].name,
        hourlyRate:
          parseFloat(hourlyRate) ||
          part.shipmentVariables[shipmentVariableIndex].hourlyRate,
        totalRate:
          parseFloat(hourlyRate) ||
          part.shipmentVariables[shipmentVariableIndex].totalRate,
      };

      // Save the changes
      await subAssembly.save();

      res.status(200).json({
        message: "Shipment Variable updated successfully",
        data: part.shipmentVariables[shipmentVariableIndex],
      });
    } catch (error) {
      console.error("Error updating Shipment Variable:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// put request for overheads and proftis
subAssemblyRoutes.put(
  "/:subAssemblyId/parts/:partId/overheadsAndProfits/:profitId",
  async (req, res) => {
    try {
      const { subAssemblyId, partId, profitId } = req.params;
      const { name, percentage } = req.body;

      // Validate IDs
      if (
        !mongoose.Types.ObjectId.isValid(subAssemblyId) ||
        !mongoose.Types.ObjectId.isValid(partId) ||
        !mongoose.Types.ObjectId.isValid(profitId)
      ) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      // Find the sub-assembly
      const subAssembly = await SubAssemblyModel.findById(subAssemblyId);
      if (!subAssembly) {
        return res.status(404).json({ error: "Sub-assembly not found" });
      }

      // Find the part
      const part = subAssembly.partsListItems.id(partId);
      if (!part) {
        return res
          .status(404)
          .json({ error: "Part not found in sub-assembly" });
      }

      // Find the overhead/profit entry
      const profitIndex = part.overheadsAndProfits.findIndex(
        (item) => item._id.toString() === profitId
      );
      if (profitIndex === -1) {
        return res
          .status(404)
          .json({ error: "Overhead/Profit entry not found in part" });
      }

      // Update the overhead/profit entry
      part.overheadsAndProfits[profitIndex] = {
        ...part.overheadsAndProfits[profitIndex],
        name: name || part.overheadsAndProfits[profitIndex].name,
        percentage:
          parseFloat(percentage) ||
          part.overheadsAndProfits[profitIndex].percentage,
        totalRate:
          parseFloat(percentage) ||
          part.overheadsAndProfits[profitIndex].totalRate,
      };

      // Save the changes
      await subAssembly.save();

      res.status(200).json({
        message: "Overhead/Profit entry updated successfully",
        data: part.overheadsAndProfits[profitIndex],
      });
    } catch (error) {
      console.error("Error updating Overhead/Profit entry:", error);
      res.status(500).json({ error: error.message });
    }
  }
);
module.exports = subAssemblyRoutes;
