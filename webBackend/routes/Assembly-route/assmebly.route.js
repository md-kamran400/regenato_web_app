const express = require("express");
const AssemblyRoutes = express.Router();
const AssemblyModel = require("../../model/assembly/AssebmlyModel");
const mongoose = require("mongoose");

// GET all sub-assemblies
AssemblyRoutes.get("/", async (req, res) => {
  try {
    const subAssemblies = await AssemblyModel.find().exec();
    res.status(200).json(subAssemblies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET a single sub-assembly by _id
// AssemblyRoutes.get("/:_id", async (req, res) => {
//   try {
//     const { _id } = req.params;
//     const subAssembly = await AssemblyModel.findById(_id);
//     if (!subAssembly) {
//       return res.status(404).json({ error: "Sub-assembly not found" });
//     }
//     res.status(200).json(subAssembly);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

AssemblyRoutes.get("/:_id", async (req, res) => {
  try {
    const { _id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ error: "Invalid sub-assembly ID format" });
    }

    const subAssembly = await AssemblyModel.findById(_id);
    if (!subAssembly) {
      return res.status(404).json({ error: "Sub-assembly not found" });
    }

    // Initialize total cost and total hours
    let totalCost = 0;
    let totalHours = 0;
    const machineHours = {};

    subAssembly.partsListItems.forEach((item) => {
      const itemTotalCost = item.costPerUnit * item.quantity;
      const itemTotalHours = item.timePerUnit * item.quantity;

      totalCost += itemTotalCost;
      totalHours += itemTotalHours;

      // Calculate individual machine hours
      item.manufacturingVariables.forEach((machine) => {
        const machineName = machine.name;
        const totalMachineHours = machine.hours * item.quantity;
        machineHours[machineName] =
          (machineHours[machineName] || 0) + totalMachineHours;
      });
    });

    // Update the sub-assembly document with calculated values
    subAssembly.totalCost = totalCost;
    subAssembly.totalHours = totalHours;
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
AssemblyRoutes.put("/:assmeblyId/parts/:partId", async (req, res) => {
  try {
    const { assmeblyId, partId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(assmeblyId)) {
      return res.status(400).json({ error: "Invalid sub-assembly ID format" });
    }

    if (!mongoose.Types.ObjectId.isValid(partId)) {
      return res.status(400).json({ error: "Invalid part ID format" });
    }

    const subAssembly = await AssemblyModel.findById(assmeblyId);

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
AssemblyRoutes.post("/", async (req, res) => {
  try {
    const {
      AssemblyName,
      AssemblyNumber,
      timePerUnit,
      costPerUnit,
      partsListItems,
      // subAssemblies,
    } = req.body;

    // Check if AssemblyNumber already exists
    const existingAssembly = await AssemblyModel.findOne({
      AssemblyNumber,
    });

    if (existingAssembly) {
      return res.status(400).json({ error: "Assembly Number Already Exists" });
    }

    const newAssembly = new AssemblyModel({
      AssemblyName,
      AssemblyNumber,
      timePerUnit,
      costPerUnit,
      partsListItems,
      // subAssemblies,
    });

    await newAssembly.save();
    res.status(201).json(newAssembly);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update an existing sub-assembly
AssemblyRoutes.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      AssemblyName,
      AssemblyNumber,
      totalHours,
      totalCost,
      partsListItems,
    } = req.body;

    const updatedSubAssembly = await AssemblyModel.findByIdAndUpdate(
      id,
      {
        AssemblyName,
        AssemblyNumber,
        totalHours,
        totalCost,
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
// AssemblyRoutes.post("/duplicate/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     const originalSubAssembly = await AssemblyModel.findById(id);

//     if (!originalSubAssembly) {
//       return res.status(404).json({ error: "Original sub-assembly not found" });
//     }

//     const newSubAssembly = new AssemblyModel({
//       ...originalSubAssembly._doc,
//       _id: mongoose.Types.ObjectId(), // Generate new ObjectId
//       AssemblyName: `${originalSubAssembly.AssemblyName} - Copy`,
//       AssemblyNumber: `${originalSubAssembly.AssemblyNumber} - Copy`,
//     });

//     await newSubAssembly.save();

//     res.status(201).json(newSubAssembly);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
AssemblyRoutes.post("/duplicate/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find the original sub-assembly
    const originalSubAssembly = await AssemblyModel.findById(id);

    if (!originalSubAssembly) {
      return res.status(404).json({ error: "Original sub-assembly not found" });
    }

    // Create a new sub-assembly based on the original
    const newSubAssembly = new AssemblyModel({
      ...originalSubAssembly._doc,
      _id: new mongoose.Types.ObjectId(), // Use new keyword here
      AssemblyName: `${originalSubAssembly.AssemblyName} - Copy`,
      AssemblyNumber: `${originalSubAssembly.AssemblyNumber} - Copy`,
    });

    await newSubAssembly.save();

    res.status(201).json(newSubAssembly);
  } catch (error) {
    console.error("Error duplicating sub-assembly:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE remove a sub-assembly
AssemblyRoutes.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid sub-assembly ID format" });
    }

    const deletedSubAssembly = await AssemblyModel.findByIdAndDelete(id);

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
AssemblyRoutes.post("/:id/partsListItems", async (req, res) => {
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
    const subAssembly = await AssemblyModel.findById(id);

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

AssemblyRoutes.post(
  "/:id/subAssemblies/:subAssemblyId/parts",
  async (req, res) => {
    try {
      const { id, subAssemblyId } = req.params;
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

      // Fetch the assembly document by ID
      const assembly = await AssemblyModel.findById(id);

      if (!assembly) {
        return res.status(404).json({ error: "Assembly not found" });
      }

      // Find the sub-assembly within the assembly
      const subAssembly = assembly.subAssemblies.id(subAssemblyId);

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

      // Add the new part to the sub-assembly's partsListItems array
      subAssembly.partsListItems.push(newPart);

      // Save the updated assembly to the database
      await assembly.save();

      // Return only the newly added part
      res.status(201).json({
        message: "Part added successfully",
        data: newPart,
      });
    } catch (error) {
      console.error("Error adding part:", error.message);
      res.status(500).json({ error: error.message });
    }
  }
);

AssemblyRoutes.delete(
  "/:id/subAssemblies/:subAssemblyId/parts/:partId",
  async (req, res) => {
    try {
      const { id, subAssemblyId, partId } = req.params;

      // Validate IDs
      if (
        !mongoose.Types.ObjectId.isValid(id) ||
        !mongoose.Types.ObjectId.isValid(subAssemblyId) ||
        !mongoose.Types.ObjectId.isValid(partId)
      ) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      // Fetch the assembly document by ID
      const assembly = await AssemblyModel.findById(id);

      if (!assembly) {
        return res.status(404).json({ error: "Assembly not found" });
      }

      // Find the sub-assembly within the assembly
      const subAssembly = assembly.subAssemblies.id(subAssemblyId);

      if (!subAssembly) {
        return res.status(404).json({ error: "Sub-assembly not found" });
      }

      // Remove the part from the sub-assembly's partsListItems array
      const updatedPartsList = subAssembly.partsListItems.filter(
        (part) => part._id.toString() !== partId
      );

      // Update the partsListItems array
      subAssembly.partsListItems = updatedPartsList;

      // Save the updated assembly to the database
      await assembly.save();

      res.status(200).json({
        message: "Part removed successfully",
        data: updatedPartsList,
      });
    } catch (error) {
      console.error("Error deleting part:", error);
      res.status(500).json({ error: error.message });
    }
  }
);
// ... other routes ...

// DELETE remove a part from a sub-assembly
// Add this route at the end of your file
AssemblyRoutes.delete("/:assmeblyId/parts/:partId", async (req, res) => {
  try {
    const { assmeblyId, partId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(assmeblyId)) {
      return res.status(400).json({ error: "Invalid sub-assembly ID format" });
    }

    if (!mongoose.Types.ObjectId.isValid(partId)) {
      return res.status(400).json({ error: "Invalid part ID format" });
    }

    const subAssembly = await AssemblyModel.findById(assmeblyId);

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
AssemblyRoutes.get("/:id/parts", async (req, res) => {
  try {
    const { id } = req.params;
    const subAssembly = await AssemblyModel.findById(id);
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
AssemblyRoutes.put(
  "/:assmeblyId/parts/:partId/manufacturing/:variableId",
  async (req, res) => {
    try {
      const { assmeblyId, partId, variableId } = req.params;
      const { name, hours, hourlyRate } = req.body;

      // Validate IDs
      if (
        !mongoose.Types.ObjectId.isValid(assmeblyId) ||
        !mongoose.Types.ObjectId.isValid(partId) ||
        !mongoose.Types.ObjectId.isValid(variableId)
      ) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      // Find the sub-assembly
      const subAssembly = await AssemblyModel.findById(assmeblyId);
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
AssemblyRoutes.put(
  "/:assmeblyId/parts/:partId/rmVariables/:rmVariableId",
  async (req, res) => {
    try {
      const { assmeblyId, partId, rmVariableId } = req.params;
      const { name, netWeight, pricePerKg } = req.body;

      // Validate IDs
      if (
        !mongoose.Types.ObjectId.isValid(assmeblyId) ||
        !mongoose.Types.ObjectId.isValid(partId) ||
        !mongoose.Types.ObjectId.isValid(rmVariableId)
      ) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      // Find the sub-assembly
      const subAssembly = await AssemblyModel.findById(assmeblyId);
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
AssemblyRoutes.put(
  "/:assmeblyId/parts/:partId/shipmentVariables/:shipmentVariableId",
  async (req, res) => {
    try {
      const { assmeblyId, partId, shipmentVariableId } = req.params;
      const { name, hourlyRate } = req.body;

      // Validate IDs
      if (
        !mongoose.Types.ObjectId.isValid(assmeblyId) ||
        !mongoose.Types.ObjectId.isValid(partId) ||
        !mongoose.Types.ObjectId.isValid(shipmentVariableId)
      ) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      // Find the sub-assembly
      const subAssembly = await AssemblyModel.findById(assmeblyId);
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
AssemblyRoutes.put(
  "/:assmeblyId/parts/:partId/overheadsAndProfits/:profitId",
  async (req, res) => {
    try {
      const { assmeblyId, partId, profitId } = req.params;
      const { name, percentage } = req.body;

      // Validate IDs
      if (
        !mongoose.Types.ObjectId.isValid(assmeblyId) ||
        !mongoose.Types.ObjectId.isValid(partId) ||
        !mongoose.Types.ObjectId.isValid(profitId)
      ) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      // Find the sub-assembly
      const subAssembly = await AssemblyModel.findById(assmeblyId);
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

AssemblyRoutes.post("/:id/subAssemblies", async (req, res) => {
  try {
    const { id } = req.params;
    const subAssembly = req.body;
    console.log("Received subAssembly data:", subAssembly); // Debugging

    const assembly = await AssemblyModel.findById(id);
    if (!assembly) {
      return res.status(404).json({ error: "Assembly not found" });
    }
    assembly.subAssemblies.push(subAssembly);
    await assembly.save();

    console.log("Updated Assembly:", assembly); // Debugging
    res.status(201).json(assembly);
  } catch (error) {
    console.error("Error adding sub-assembly:", error);
    res.status(500).json({ error: error.message });
  }
});

AssemblyRoutes.get("/:id/subAssemblies", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid assembly ID format" });
    }
    const assembly = await AssemblyModel.findById(id).select("subAssemblies");
    if (!assembly) {
      return res.status(404).json({ error: "Assembly not found" });
    }
    res.status(200).json(assembly.subAssemblies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// puts for manufatcuirng shipment and raw matarisl and overhads
// PUT request for raw materials of a sub-assembly
AssemblyRoutes.put(
  "/:assemblyId/subAssemblies/:subAssemblyId/parts/:partId/rmVariables/:rawmatarialsId",
  async (req, res) => {
    try {
      const { assemblyId, subAssemblyId, partId, rawmatarialsId } = req.params;
      const { name, netWeight, pricePerKg } = req.body;

      // Validate IDs
      if (
        !mongoose.Types.ObjectId.isValid(assemblyId) ||
        !mongoose.Types.ObjectId.isValid(subAssemblyId) ||
        !mongoose.Types.ObjectId.isValid(partId) ||
        !mongoose.Types.ObjectId.isValid(rawmatarialsId)
      ) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      // Find the assembly
      const assembly = await AssemblyModel.findById(assemblyId);
      if (!assembly) {
        return res.status(404).json({ error: "Assembly not found" });
      }

      // Find the sub-assembly
      const subAssembly = assembly.subAssemblies.id(subAssemblyId);
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
      const rmVaraibleindex = part.rmVariables.findIndex(
        (item) => item._id.toString() === rawmatarialsId
      );
      if (rmVaraibleindex === -1) {
        return res
          .status(404)
          .json({ error: "Manufacturing variable not found in part" });
      }

      // Update the manufacturing variable
      part.rmVariables[rmVaraibleindex] = {
        ...part.rmVariables[rmVaraibleindex],
        name: name || part.rmVariables[rmVaraibleindex].name,
        netWeight:
          parseFloat(netWeight) || part.rmVariables[rmVaraibleindex].netWeight,
        pricePerKg:
          parseFloat(pricePerKg) ||
          part.rmVariables[rmVaraibleindex].pricePerKg,
        totalRate: (parseFloat(netWeight) || 0) * (parseFloat(pricePerKg) || 0),
      };

      // Save the changes
      await assembly.save();

      res.status(200).json({
        message: "Manufacturing variable updated successfully",
        data: part.rmVariables[rmVaraibleindex],
      });
    } catch (error) {
      console.error("Error updating manufacturing variable:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// PUT request for manufacturing variables of a sub-assembly
AssemblyRoutes.put(
  "/:assemblyId/subAssemblies/:subAssemblyId/parts/:partId/manufacturingVariables/:manufacturingVariableId",
  async (req, res) => {
    try {
      const { assemblyId, subAssemblyId, partId, manufacturingVariableId } =
        req.params;
      const { name, hours, hourlyRate } = req.body;

      // Validate IDs
      if (
        !mongoose.Types.ObjectId.isValid(assemblyId) ||
        !mongoose.Types.ObjectId.isValid(subAssemblyId) ||
        !mongoose.Types.ObjectId.isValid(partId) ||
        !mongoose.Types.ObjectId.isValid(manufacturingVariableId)
      ) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      // Find the assembly
      const assembly = await AssemblyModel.findById(assemblyId);
      if (!assembly) {
        return res.status(404).json({ error: "Assembly not found" });
      }

      // Find the sub-assembly
      const subAssembly = assembly.subAssemblies.id(subAssemblyId);
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
      const manufacturingVariableIndex = part.manufacturingVariables.findIndex(
        (item) => item._id.toString() === manufacturingVariableId
      );
      if (manufacturingVariableIndex === -1) {
        return res
          .status(404)
          .json({ error: "Manufacturing variable not found in part" });
      }

      // Update the manufacturing variable
      part.manufacturingVariables[manufacturingVariableIndex] = {
        ...part.manufacturingVariables[manufacturingVariableIndex],
        name:
          name || part.manufacturingVariables[manufacturingVariableIndex].name,
        hours:
          parseFloat(hours) ||
          part.manufacturingVariables[manufacturingVariableIndex].hours,
        hourlyRate:
          parseFloat(hourlyRate) ||
          part.manufacturingVariables[manufacturingVariableIndex].hourlyRate,
        totalRate: (parseFloat(hours) || 0) * (parseFloat(hourlyRate) || 0),
      };

      // Save the changes
      await assembly.save();

      res.status(200).json({
        message: "Manufacturing variable updated successfully",
        data: part.manufacturingVariables[manufacturingVariableIndex],
      });
    } catch (error) {
      console.error("Error updating manufacturing variable:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// PUT request for shipment variables of a sub-assembly
AssemblyRoutes.put(
  "/:assemblyId/subAssemblies/:subAssemblyId/parts/:partId/shipmentVariables/:shipmentVariableId",
  async (req, res) => {
    try {
      const { assemblyId, subAssemblyId, partId, shipmentVariableId } =
        req.params;
      const { name, hourlyRate } = req.body;

      // Validate IDs
      if (
        !mongoose.Types.ObjectId.isValid(assemblyId) ||
        !mongoose.Types.ObjectId.isValid(subAssemblyId) ||
        !mongoose.Types.ObjectId.isValid(partId) ||
        !mongoose.Types.ObjectId.isValid(shipmentVariableId)
      ) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      // Find the assembly
      const assembly = await AssemblyModel.findById(assemblyId);
      if (!assembly) {
        return res.status(404).json({ error: "Assembly not found" });
      }

      // Find the sub-assembly
      const subAssembly = assembly.subAssemblies.id(subAssemblyId);
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
          .json({ error: "Shipment variable not found in part" });
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
          part.shipmentVariables[shipmentVariableId].totalRate,
      };

      // Save the changes
      await assembly.save();

      res.status(200).json({
        message: "Shipment variable updated successfully",
        data: part.shipmentVariables[shipmentVariableIndex],
      });
    } catch (error) {
      console.error("Error updating shipment variable:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// PUT request for overheads/profits of a sub-assembly
AssemblyRoutes.put(
  "/:assemblyId/subAssemblies/:subAssemblyId/parts/:partId/overheadsAndProfits/:profitId",
  async (req, res) => {
    try {
      const { assemblyId, subAssemblyId, partId, profitId } = req.params;
      const { name, percentage } = req.body;

      // Validate IDs
      if (
        !mongoose.Types.ObjectId.isValid(assemblyId) ||
        !mongoose.Types.ObjectId.isValid(subAssemblyId) ||
        !mongoose.Types.ObjectId.isValid(partId) ||
        !mongoose.Types.ObjectId.isValid(profitId)
      ) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      // Find the assembly
      const assembly = await AssemblyModel.findById(assemblyId);
      if (!assembly) {
        return res.status(404).json({ error: "Assembly not found" });
      }

      // Find the sub-assembly
      const subAssembly = assembly.subAssemblies.id(subAssemblyId);
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
          .json({ error: "Overhead/profit entry not found in part" });
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
      await assembly.save();

      res.status(200).json({
        message: "Overhead/profit entry updated successfully",
        data: part.overheadsAndProfits[profitIndex],
      });
    } catch (error) {
      console.error("Error updating overhead/profit entry:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = AssemblyRoutes;
