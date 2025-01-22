// routes/partsRoutes/parts.route.js

const { Router } = require("express");
const PartsModel = require("../../model/Parts/PartModel");
const multer = require("multer");
const xlsx = require("xlsx");
const fs = require("fs");
const PartRoutes = Router();
const axios = require("axios");

// Multer Configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// parts variable's backend

// POST - Add a new part
// POST - Add a new part or duplicate an existing part
// POST - Add a new part or duplicate an existing part
// PartRoutes.post("/", async (req, res) => {
//   try {
//     const {
//       id,
//       partName,
//       codeName,
//       clientNumber,
//       costPerUnit,
//       timePerUnit,
//       stockPOQty,
//       rmVariables,
//       manufacturingVariables,
//       shipmentVariables,
//       overheadsAndProfits,
//       partsCalculations,
//       originalIndex,
//     } = req.body;

//     // Check if this is a duplicate request
//     if (id && partName && costPerUnit && timePerUnit && stockPOQty) {
//       // This is a duplicate request, create a new part with the provided data
//       const newPart = new PartsModel({
//         id,
//         partName,
//         clientNumber,
//         codeName,
//         costPerUnit,
//         timePerUnit,
//         stockPOQty,
//         rmVariables,
//         manufacturingVariables,
//         shipmentVariables,
//         overheadsAndProfits,
//         partsCalculations,
//       });

//       // Find all parts
//       const allParts = await PartsModel.find().sort({ id: 1 });

//       // Insert the new part at the correct position
//       allParts.splice(originalIndex + 1, 0, newPart);

//       // Update the database with the new order
//       await Promise.all(
//         allParts.map((part, index) => {
//           part.index = index;
//           return part.save();
//         })
//       );

//       res.status(201).json(newPart);
//     } else {
//       // This is a new part creation request
//       const newPart = new PartsModel(req.body);
//       await newPart.save();
//       res.status(201).json(newPart);
//     }
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });
PartRoutes.post("/", async (req, res) => {
  try {
    const {
      id,
      partName,
      codeName,
      clientNumber,
      partType,
      costPerUnit,
      timePerUnit,
      stockPOQty,
      rmVariables,
      manufacturingVariables,
      shipmentVariables,
      overheadsAndProfits,
      partsCalculations,
      originalIndex,
      totalCost,
      totalQuantity,
    } = req.body;

    // Check if this is a duplicate request
    if (id && partName && costPerUnit && timePerUnit && stockPOQty) {
      // This is a duplicate request, create a new part with the provided data
      const newPart = new PartsModel({
        id,
        partName,
        clientNumber,
        codeName,
        partType,
        costPerUnit,
        timePerUnit,
        stockPOQty,
        rmVariables,
        manufacturingVariables,
        shipmentVariables,
        overheadsAndProfits,
        partsCalculations,
        totalCost,
        totalQuantity,
      });

      // Find all parts
      const allParts = await PartsModel.find().sort({ id: 1 });

      // Insert the new part at the correct position
      allParts.splice(originalIndex + 1, 0, newPart);

      // Update the database with the new order
      await Promise.all(
        allParts.map((part, index) => {
          part.index = index;
          return part.save();
        })
      );

      res.status(201).json(newPart);
    } else {
      // This is a new part creation request
      const newPart = new PartsModel({
        id: req.body.id,
        partName: req.body.partName,
        clientNumber: req.body.clientNumber,
        codeName: req.body.codeName,
        partType: req.body.partType,
        costPerUnit: req.body.costPerUnit,
        timePerUnit: req.body.timePerUnit,
        stockPOQty: req.body.stockPOQty,
        rmVariables: req.body.rmVariables,
        manufacturingVariables: req.body.manufacturingVariables,
        shipmentVariables: req.body.shipmentVariables,
        overheadsAndProfits: req.body.overheadsAndProfits,
        partsCalculations: req.body.partsCalculations,
        totalCost: req.body.totalCost,
        totalQuantity: req.body.totalQuantity,
      });
      await newPart.save();
      res.status(201).json(newPart);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

PartRoutes.put("/:_id", async (req, res) => {
  try {
    const { _id } = req.params;
    const { partName, id, clientNumber } = req.body;

    // Validate the input
    // if (!partName || !id || !clientNumber) {
    //   return res
    //     .status(400)
    //     .json({ message: "partName, id, and clientNumber are required" });
    // }

    // Find the part to update
    const partToUpdate = await PartsModel.findById(_id);

    if (!partToUpdate) {
      return res.status(404).json({ message: "Part not found" });
    }

    // Update the part
    partToUpdate.partName = partName;
    partToUpdate.id = id;
    partToUpdate.clientNumber = clientNumber;

    // Save the updated part
    const updatedPart = await partToUpdate.save();

    res.status(200).json(updatedPart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// post for dupliate
// Route to duplicate a part
// PartRoutes.post("/duplicate/:id", async (req, res) => {
//   try {
//     const { id } = req.params; // Original part ID
//     const { newId, newPartName, ...duplicateData } = req.body;

//     console.log("Duplicate request received:");
//     console.log("Original Part ID:", id);
//     console.log("New Part ID:", newId);
//     console.log("New Part Name:", newPartName);

//     // Fetch the original part
//     const originalPart = await PartsModel.findById(id);
//     if (!originalPart) {
//       return res.status(404).json({ message: "Original part not found" });
//     }

//     // Check if newId is unique
//     const existingPart = await PartsModel.findOne({ id: newId });
//     if (existingPart) {
//       return res.status(400).json({ message: "Duplicate ID already exists" });
//     }

//     // Create duplicate part
//     const duplicatePart = new PartsModel({
//       ...originalPart.toObject(), // Clone original part
//       _id: undefined, // Generate a new MongoDB ID
//       id: newId, // Assign new ID
//       partName: newPartName, // Assign new Name
//       ...duplicateData, // Overwrite other fields
//     });

//     await duplicatePart.save();
//     res.status(201).json(duplicatePart);
//   } catch (error) {
//     console.error("Error duplicating part:", error);
//     res.status(500).json({ message: error.message || "Internal server error" });
//   }
// });

// GET - Retrieve all parts

PartRoutes.get("/", async (req, res) => {
  try {
    const parts = await PartsModel.find();
    res.status(200).json(parts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Retrieve a specific part
// PartRoutes.get("/:_id", async (req, res) => {
//   try {
//     const part = await PartsModel.findById(req.params._id);
//     if (!part) {
//       return res.status(404).json({ message: "Part not found" });
//     }
//     res.status(200).json(part);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// PartRoutes.get("/:_id", async (req, res) => {
//   try {
//     const part = await PartsModel.findById(req.params._id);
//     if (!part) {
//       return res.status(404).json({ message: "Part not found" });
//     }

//     // Calculate total costs
//     const rmVariablesTotalCost = part.rmVariables.reduce((sum, item) => sum + item.totalRate, 0);
//     const manufacturingVariablesTotalCost = part.manufacturingVariables.reduce((sum, item) => sum + item.totalRate, 0);
//     const shipmentVariablesTotalCost = part.shipmentVariables.reduce((sum, item) => sum + item.totalRate, 0);
//     const allThreeSum = rmVariablesTotalCost + manufacturingVariablesTotalCost + shipmentVariablesTotalCost;

//     // Check if partsCalculations is available
//     if (part.partsCalculations.length > 0) {
//       const finalCostPerUnit = part.partsCalculations[0].AvgragecostPerUnit;
//       const updatedPart = await PartsModel.findByIdAndUpdate(
//         req.params._id,
//         { costPerUnit: finalCostPerUnit },
//         { new: true }
//       );
//       res.status(200).json(updatedPart);
//     } else {
//       // If partsCalculations is not available, calculate costPerUnit
//       // Calculate overheads
//       const overheadsAndProfits = part.overheadsAndProfits || [];
//       const overheadsPercentage = overheadsAndProfits.reduce((sum, item) => sum + item.percentage, 0);
//       const overheadsAmount = (allThreeSum * overheadsPercentage) / 100;

//       // Calculate final costPerUnit
//       const finalCostPerUnit = allThreeSum + overheadsAmount;

//       // Update costPerUnit in the part document
//       const updatedPart = await PartsModel.findByIdAndUpdate(
//         req.params._id,
//         { costPerUnit: finalCostPerUnit },
//         { new: true }
//       );

//       res.status(200).json(updatedPart);
//     }
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// PartRoutes.get("/:_id", async (req, res) => {
//   try {
//     const part = await PartsModel.findById(req.params._id);
//     if (!part) {
//       return res.status(404).json({ message: "Part not found" });
//     }

//     // Calculate total costs
//     const rmVariablesTotalCost = part.rmVariables.reduce((sum, item) => sum + (item.totalRate || 0), 0);
//     const manufacturingVariablesTotalCost = part.manufacturingVariables.reduce((sum, item) => sum + (item.totalRate || 0), 0);
//     const shipmentVariablesTotalCost = part.shipmentVariables.reduce((sum, item) => sum + (item.totalRate || 0), 0);
//     const allThreeSum = rmVariablesTotalCost + manufacturingVariablesTotalCost + shipmentVariablesTotalCost;

//     // Calculate total hours from manufacturingVariables
//     const totalHours = part.manufacturingVariables.reduce((sum, item) => sum + (item.hours || 0), 0);

//     // Calculate overheads
//     const overheadsAndProfits = part.overheadsAndProfits || [];
//     const overheadsPercentage = overheadsAndProfits.reduce((sum, item) => sum + (item.percentage || 0), 0);
//     const overheadsAmount = (allThreeSum * overheadsPercentage) / 100;

//     // Calculate final costPerUnit
//     const finalCostPerUnit = allThreeSum + overheadsAmount;

//     // Check if finalCostPerUnit is NaN
//     if (isNaN(finalCostPerUnit)) {
//       return res.status(400).json({ message: "Error calculating costPerUnit. Please check your input values." });
//     }

//     // Update costPerUnit and timePerUnit in the part document
//     const updatedPart = await PartsModel.findByIdAndUpdate(
//       req.params._id,
//       {
//         costPerUnit: finalCostPerUnit,
//         timePerUnit: totalHours
//       },
//       { new: true }
//     );

//     res.status(200).json(updatedPart);
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ message: error.message });
//   }
// });

// PartRoutes.get("/:_id", async (req, res) => {
//   try {
//     const part = await PartsModel.findById(req.params._id);
//     if (!part) {
//       return res.status(404).json({ message: "Part not found" });
//     }

//     // Calculate total costs
//     const rmVariablesTotalCost = part.rmVariables.reduce(
//       (sum, item) => sum + (item.totalRate || 0),
//       0
//     );
//     const manufacturingVariablesTotalCost = part.manufacturingVariables.reduce(
//       (sum, item) => sum + (item.totalRate || 0),
//       0
//     );
//     const shipmentVariablesTotalCost = part.shipmentVariables.reduce(
//       (sum, item) => sum + (item.hourlyRate || 0),
//       0
//     );
//     const allThreeSum =
//       rmVariablesTotalCost +
//       manufacturingVariablesTotalCost +
//       shipmentVariablesTotalCost;

//     // Calculate total hours from manufacturingVariables
//     const totalHours = part.manufacturingVariables.reduce(
//       (sum, item) => sum + (item.hours || 0),
//       0
//     );

//     // Calculate overheads
//     const overheadsAndProfits = part.overheadsAndProfits || [];
//     const overheadsPercentage = overheadsAndProfits.reduce(
//       (sum, item) => sum + (item.percentage || 0),
//       0
//     );
//     const overheadsAmount = (allThreeSum * overheadsPercentage) / 100;

//     // Calculate final costPerUnit
//     const finalCostPerUnit = Math.ceil(allThreeSum + overheadsAmount);

//     // Check if finalCostPerUnit is NaN
//     if (isNaN(finalCostPerUnit)) {
//       return res
//         .status(400)
//         .json({
//           message:
//             "Error calculating costPerUnit. Please check your input values.",
//         });
//     }

//     // Update costPerUnit and timePerUnit in the part document
//     const updatedPart = await PartsModel.findByIdAndUpdate(
//       req.params._id,
//       {
//         costPerUnit: finalCostPerUnit,
//         timePerUnit: totalHours,
//       },
//       { new: true }
//     );

//     res.status(200).json(updatedPart);
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ message: error.message });
//   }
// });

PartRoutes.get("/:_id", async (req, res) => {
  try {
    const part = await PartsModel.findById(req.params._id);
    if (!part) {
      return res.status(404).json({ message: "Part not found" });
    }

    // Calculate total costs
    const rmVariablesTotalCost = part.rmVariables.reduce(
      (sum, item) => sum + (item.totalRate || 0),
      0
    );
    const manufacturingVariablesTotalCost = part.manufacturingVariables.reduce(
      (sum, item) => sum + (item.totalRate || 0),
      0
    );
    const shipmentVariablesTotalCost = part.shipmentVariables.reduce(
      (sum, item) => sum + (item.hourlyRate || 0),
      0
    );
    const allThreeSum =
      rmVariablesTotalCost +
      manufacturingVariablesTotalCost +
      shipmentVariablesTotalCost;

    // Calculate total hours from manufacturingVariables
    const totalHours = part.manufacturingVariables.reduce(
      (sum, item) => sum + (item.hours || 0),
      0
    );

    // Calculate overheads
    const overheadsAndProfits = part.overheadsAndProfits || [];
    const overheadsPercentage = overheadsAndProfits.reduce(
      (sum, item) => sum + (item.percentage || 0),
      0
    );
    const overheadsAmount = (allThreeSum * overheadsPercentage) / 100;

    // Calculate final costPerUnit
    const finalCostPerUnit = Math.ceil(allThreeSum + overheadsAmount);

    // Check if finalCostPerUnit is NaN
    if (isNaN(finalCostPerUnit)) {
      return res.status(400).json({
        message:
          "Error calculating costPerUnit. Please check your input values.",
      });
    }

    // Update costPerUnit and timePerUnit in the part document
    const updatedPart = await PartsModel.findByIdAndUpdate(
      req.params._id,
      {
        costPerUnit: finalCostPerUnit,
        timePerUnit: totalHours,
      },
      { new: true }
    );

    // Create a response object with all calculated values
    const response = {
      ...updatedPart.toObject(),
      rmVariablesTotalCost,
      manufacturingVariablesTotalCost,
      shipmentVariablesTotalCost,

      overheadsPercentage,
      overheadsAmount,
      finalCostPerUnit,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// PUT - Update a specific part
PartRoutes.put("/:_id", async (req, res) => {
  try {
    const updatedPart = await PartsModel.findByIdAndUpdate(
      req.params._id,
      req.body,
      { new: true }
    );
    if (!updatedPart) {
      return res.status(404).json({ message: "Part not found" });
    }
    res.status(200).json(updatedPart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Delete a part
PartRoutes.delete("/:_id", async (req, res) => {
  try {
    const deletedPart = await PartsModel.findByIdAndDelete(req.params._id);
    if (!deletedPart) {
      return res.status(404).json({ message: "Part not found" });
    }
    res.status(200).json({ message: "Part deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// parts variable's backend ends here

// general variable routes start from here
PartRoutes.get("/:_id/generalVariables", async (req, res) => {
  try {
    const part = await PartsModel.findById(req.params._id, "generalVariables"); // Fetch RM Variables only
    if (!part) {
      return res.status(404).json({ message: "Part not found" });
    }
    res.status(200).json(part.generalVariables); // Return RM Variables
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Add a new general Variable to a specific part
PartRoutes.post("/:_id/generalVariables", async (req, res) => {
  try {
    const newGeneralVariable = {
      categoryId: req.body.categoryId,
      name: req.body.name,
      value: req.body.value,
    };

    const updatedPart = await PartsModel.findByIdAndUpdate(
      req.params._id,
      { $push: { generalVariables: newGeneralVariable } },
      { new: true }
    );

    if (!updatedPart) {
      return res.status(404).json({ message: "Part not found" });
    }

    res.status(201).json(updatedPart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT - Update an general Variable within a part
PartRoutes.put("/:_id/generalVariables/:variableId", async (req, res) => {
  try {
    const updatedPart = await PartsModel.findOneAndUpdate(
      { _id: req.params._id, "generalVariables._id": req.params.variableId },
      {
        $set: {
          "generalVariables.$": req.body,
        },
      },
      { new: true }
    );
    if (!updatedPart) {
      return res
        .status(404)
        .json({ message: "Part or General Variable not found" });
    }
    res.status(200).json(updatedPart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Delete an general Variable within a part
PartRoutes.delete("/:_id/generalVariables/:variableId", async (req, res) => {
  try {
    const updatedPart = await PartsModel.findByIdAndUpdate(
      req.params._id,
      {
        $pull: { generalVariables: { _id: req.params.variableId } },
      },
      { new: true }
    );
    if (!updatedPart) {
      return res
        .status(404)
        .json({ message: "Part or General variable not found" });
    }
    res.status(200).json(updatedPart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// general variable route end here

// start rm variable backend from here
// GET - Retrieve RM Variables of a specific part
PartRoutes.get("/:_id/rmVariables", async (req, res) => {
  try {
    const part = await PartsModel.findById(req.params._id, "rmVariables"); // Fetch RM Variables only
    if (!part) {
      return res.status(404).json({ message: "Part not found" });
    }
    res.status(200).json(part.rmVariables); // Return RM Variables
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Add a new RM Variable to a specific part

PartRoutes.post("/:_id/rmVariables", async (req, res) => {
  try {
    const newRMVariable = {
      categoryId: req.body.categoryId,
      name: req.body.name,
      netWeight: req.body.netWeight,
      pricePerKg: req.body.pricePerKg,
      totalRate:
        req.body.netWeight && req.body.pricePerKg
          ? req.body.netWeight * req.body.pricePerKg
          : req.body.totalRate,
    };

    const updatedPart = await PartsModel.findByIdAndUpdate(
      req.params._id,
      { $push: { rmVariables: newRMVariable } },
      { new: true }
    );

    if (!updatedPart) {
      return res.status(404).json({ message: "Part not found" });
    }

    res.status(201).json(updatedPart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// PartRoutes.post("/:_id/rmVariables", async (req, res) => {
//   try {
//     const newRMVariable = {
//       categoryId: req.body.categoryId,
//       name: req.body.name,
//       netWeight: req.body.netWeight,
//       pricePerKg: req.body.pricePerKg,
//       totalRate: req.body.netWeight * req.body.pricePerKg,
//     };

//     const updatedPart = await PartsModel.findByIdAndUpdate(
//       req.params._id,
//       { $push: { rmVariables: newRMVariable } },
//       { new: true }
//     );

//     if (!updatedPart) {
//       return res.status(404).json({ message: "Part not found" });
//     }

//     res.status(201).json(updatedPart);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// PUT - Update an RM Variable within a part
PartRoutes.put("/:_id/rmVariables/:variableId", async (req, res) => {
  try {
    const updatedPart = await PartsModel.findOneAndUpdate(
      { _id: req.params._id, "rmVariables._id": req.params.variableId },
      {
        $set: {
          "rmVariables.$": req.body,
        },
      },
      { new: true }
    );
    if (!updatedPart) {
      return res.status(404).json({ message: "Part or RM Variable not found" });
    }
    res.status(200).json(updatedPart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Delete an RM Variable within a part
PartRoutes.delete("/:_id/rmVariables/:variableId", async (req, res) => {
  try {
    const updatedPart = await PartsModel.findByIdAndUpdate(
      req.params._id,
      {
        $pull: { rmVariables: { _id: req.params.variableId } },
      },
      { new: true }
    );
    if (!updatedPart) {
      return res.status(404).json({ message: "Part or RM Variable not found" });
    }
    res.status(200).json(updatedPart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// end rm variable backend from here

// start Manufacturing variable backend from here
PartRoutes.get("/:_id/manufacturingVariables", async (req, res) => {
  try {
    const part = await PartsModel.findById(
      req.params._id,
      "manufacturingVariables"
    );
    if (!part) {
      return res.status(404).json({ message: "Part not found" });
    }
    res.status(200).json(part.manufacturingVariables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Add a new Manufacturing Variable to a specific part
// PartRoutes.post("/:_id/manufacturingVariables", async (req, res) => {
//   try {
//     const newManufacturingVariable = {
//       categoryId: req.body.categoryId,
//       name: req.body.name,
//       hours: req.body.hours,
//       hourlyRate: req.body.hourlyRate,
//       totalRate: req.body.totalRate,
//     };

//     const updatedPart = await PartsModel.findByIdAndUpdate(
//       req.params._id,
//       { $push: { manufacturingVariables: newManufacturingVariable } },
//       { new: true }
//     );

//     if (!updatedPart) {
//       return res.status(404).json({ message: "Part not found" });
//     }

//     res.status(201).json(updatedPart);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

PartRoutes.post("/:_id/manufacturingVariables", async (req, res) => {
  try {
    const newManufacturingVariable = {
      categoryId: req.body.categoryId,
      name: req.body.name,
      times: req.body.times,
      hours: req.body.hours,
      hourlyRate: req.body.hourlyRate,
      totalRate:
        req.body.hours && req.body.hourlyRate
          ? req.body.hours * req.body.hourlyRate
          : req.body.totalRate,
    };

    const updatedPart = await PartsModel.findByIdAndUpdate(
      req.params._id,
      { $push: { manufacturingVariables: newManufacturingVariable } },
      { new: true }
    );

    if (!updatedPart) {
      return res.status(404).json({ message: "Part not found" });
    }

    res.status(201).json(updatedPart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// PartRoutes.post("/:_id/manufacturingVariables", async (req, res) => {
//   try {
//     const newManufacturingVariable = {
//       categoryId: req.body.categoryId,
//       name: req.body.name,
//       times: req.body.times,
//       hours: req.body.hours,
//       hourlyRate: req.body.hourlyRate,
//       totalRate: req.body.hours * req.body.hourlyRate,
//     };

//     const updatedPart = await PartsModel.findByIdAndUpdate(
//       req.params._id,
//       { $push: { manufacturingVariables: newManufacturingVariable } },
//       { new: true }
//     );

//     if (!updatedPart) {
//       return res.status(404).json({ message: "Part not found" });
//     }

//     res.status(201).json(updatedPart);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// PUT - Update an Manufacturing Variable within a part
PartRoutes.put("/:_id/manufacturingVariables/:variableId", async (req, res) => {
  try {
    const updatedPart = await PartsModel.findOneAndUpdate(
      {
        _id: req.params._id,
        "manufacturingVariables._id": req.params.variableId,
      },
      { $set: { "manufacturingVariables.$": req.body } },
      { new: true }
    );
    if (!updatedPart) {
      return res
        .status(404)
        .json({ message: "Part or manufacturing variable not found" });
    }
    res.status(200).json(updatedPart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Delete an Manufacturing Variable within a part
PartRoutes.delete(
  "/:_id/manufacturingVariables/:variableId",
  async (req, res) => {
    try {
      const updatedPart = await PartsModel.findByIdAndUpdate(
        req.params._id,
        { $pull: { manufacturingVariables: { _id: req.params.variableId } } },
        { new: true }
      );
      if (!updatedPart) {
        return res
          .status(404)
          .json({ message: "Part or manufacturing variable not found" });
      }
      res.status(200).json(updatedPart);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// edn Manufacturing variable backend from here

// start Manufacturing variable backend from here
PartRoutes.get("/:_id/manufacturingVariablesstactics", async (req, res) => {
  try {
    const part = await PartsModel.findById(
      req.params._id,
      "manufacturingVariablesstactics"
    );
    if (!part) {
      return res.status(404).json({ message: "Part not found" });
    }
    res.status(200).json(part.manufacturingVariablesstactics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Add a new Manufacturing Variable to a specific part
PartRoutes.post("/:_id/manufacturingVariablesstactics", async (req, res) => {
  try {
    const newManufacturingVariablestactics = {
      categoryId: req.body.categoryId,
      name: req.body.name,
      hourlyRate: req.body.hourlyRate,
      totalRate: req.body.totalRate,
    };

    const updatedPart = await PartsModel.findByIdAndUpdate(
      req.params._id,
      {
        $push: {
          manufacturingVariablesstactics: newManufacturingVariablestactics,
        },
      },
      { new: true }
    );

    if (!updatedPart) {
      return res.status(404).json({ message: "Part not found" });
    }

    res.status(201).json(updatedPart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT - Update an Manufacturing Variable within a part
PartRoutes.put(
  "/:_id/manufacturingVariablesstactics/:variableId",
  async (req, res) => {
    try {
      const updatedPart = await PartsModel.findOneAndUpdate(
        {
          _id: req.params._id,
          "manufacturingVariablesstactics._id": req.params.variableId,
        },
        { $set: { "manufacturingVariablesstactics.$": req.body } },
        { new: true }
      );
      if (!updatedPart) {
        return res
          .status(404)
          .json({ message: "Part or manufacturing variable not found" });
      }
      res.status(200).json(updatedPart);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// DELETE - Delete an Manufacturing Variable within a part
PartRoutes.delete(
  "/:_id/manufacturingVariablesstactics/:variableId",
  async (req, res) => {
    try {
      const updatedPart = await PartsModel.findByIdAndUpdate(
        req.params._id,
        {
          $pull: {
            manufacturingVariablesstactics: { _id: req.params.variableId },
          },
        },
        { new: true }
      );
      if (!updatedPart) {
        return res
          .status(404)
          .json({ message: "Part or manufacturing variable not found" });
      }
      res.status(200).json(updatedPart);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// start Shipment variable backend from here
// GET for shipment
PartRoutes.get("/:_id/shipmentVariables", async (req, res) => {
  try {
    const part = await PartsModel.findById(req.params._id, "shipmentVariables");
    if (!part) {
      return res.status(404).json({ message: "Part not found" });
    }
    res.status(200).json(part.shipmentVariables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST for shipment
// PartRoutes.post("/:_id/shipmentVariables", async (req, res) => {
//   try {
//     const newShipmentVariable = {
//       categoryId: req.body.categoryId,
//       name: req.body.name,
//       hourlyRate: req.body.hourlyRate,
//       totalRate: req.body.hourlyRate,
//     };

//     const updatedPart = await PartsModel.findByIdAndUpdate(
//       req.params._id,
//       { $push: { shipmentVariables: newShipmentVariable } },
//       { new: true }
//     );

//     if (!updatedPart) {
//       return res.status(404).json({ message: "Part not found" });
//     }

//     res.status(201).json(updatedPart);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });
PartRoutes.post("/:_id/shipmentVariables", async (req, res) => {
  try {
    const newShipmentVariable = {
      categoryId: req.body.categoryId,
      name: req.body.name,
      hourlyRate: req.body.hourlyRate,
      totalRate: req.body.hourlyRate,
    };

    const updatedPart = await PartsModel.findByIdAndUpdate(
      req.params._id,
      { $push: { shipmentVariables: newShipmentVariable } },
      { new: true }
    );

    if (!updatedPart) {
      return res.status(404).json({ message: "Part not found" });
    }

    res.status(201).json(updatedPart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE for shipment
PartRoutes.put("/:_id/shipmentVariables/:variableId", async (req, res) => {
  try {
    const updatedPart = await PartsModel.findOneAndUpdate(
      { _id: req.params._id, "shipmentVariables._id": req.params.variableId },
      { $set: { "shipmentVariables.$": req.body } },
      { new: true }
    );
    if (!updatedPart) {
      return res
        .status(404)
        .json({ message: "Part or shipment variable not found" });
    }
    res.status(200).json(updatedPart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE for shipment
PartRoutes.delete("/:_id/shipmentVariables/:variableId", async (req, res) => {
  try {
    const updatedPart = await PartsModel.findByIdAndUpdate(
      req.params._id,
      { $pull: { shipmentVariables: { _id: req.params.variableId } } },
      { new: true }
    );
    if (!updatedPart) {
      return res
        .status(404)
        .json({ message: "Part or shipment variable not found" });
    }
    res.status(200).json(updatedPart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// edn Shipment variable backend from here

// start overheads and profit variable backend from here
PartRoutes.get("/:_id/overheadsAndProfits", async (req, res) => {
  try {
    const part = await PartsModel.findById(
      req.params._id,
      "overheadsAndProfits"
    );
    if (!part) {
      return res.status(404).json({ message: "Part not found" });
    }
    res.status(200).json(part.overheadsAndProfits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

PartRoutes.post("/:_id/overheadsAndProfits", async (req, res) => {
  try {
    const newOverhead = {
      categoryId: req.body.categoryId,
      name: req.body.name,
      percentage: req.body.percentage,
      totalRate: req.body.totalRate,
    };

    const updatedPart = await PartsModel.findByIdAndUpdate(
      req.params._id,
      { $push: { overheadsAndProfits: newOverhead } },
      { new: true }
    );

    if (!updatedPart) {
      return res.status(404).json({ message: "Part not found" });
    }

    res.status(201).json(updatedPart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

PartRoutes.put("/:_id/overheadsAndProfits/:variableId", async (req, res) => {
  try {
    const updatedPart = await PartsModel.findOneAndUpdate(
      { _id: req.params._id, "overheadsAndProfits._id": req.params.variableId },
      { $set: { "overheadsAndProfits.$": req.body } },
      { new: true }
    );
    if (!updatedPart) {
      return res
        .status(404)
        .json({ message: "Part or overhead/profit not found" });
    }
    res.status(200).json(updatedPart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

PartRoutes.delete("/:_id/overheadsAndProfits/:variableId", async (req, res) => {
  try {
    const updatedPart = await PartsModel.findByIdAndUpdate(
      req.params._id,
      { $pull: { overheadsAndProfits: { _id: req.params.variableId } } },
      { new: true }
    );
    if (!updatedPart) {
      return res
        .status(404)
        .json({ message: "Part or overhead/profit not found" });
    }
    res.status(200).json(updatedPart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// end overheads and profit variable backend from here

PartRoutes.get("/:_id/partsCalculations", async (req, res) => {
  try {
    const calculationAvg = await PartsModel.findById(
      req.params._id,
      "partsCalculations"
    ); // Fetch RM Variables only
    if (!calculationAvg) {
      return res.status(404).json({ message: "calculationAvg not found" });
    }
    res.status(200).json(calculationAvg.partsCalculations); // Return RM Variables
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

PartRoutes.post("/:_id/partsCalculations", async (req, res) => {
  try {
    const part = await PartsModel.findById(req.params._id);
    if (!part) {
      return res.status(404).json({ message: "Part not found" });
    }

    if (part.partsCalculations && part.partsCalculations.length > 0) {
      return res.status(400).json({
        message:
          "partsCalculations already exists for this part. Use PUT to update.",
      });
    }

    const newCalculationValue = {
      AvgragecostPerUnit: req.body.AvgragecostPerUnit,
      AvgragetimePerUnit: req.body.AvgragetimePerUnit,
    };

    const updatedPart = await PartsModel.findByIdAndUpdate(
      req.params._id,
      { $push: { partsCalculations: newCalculationValue } },
      { new: true }
    );

    if (!updatedPart) {
      return res.status(404).json({ message: "Part not found" });
    }

    res.status(201).json(updatedPart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update partsCalculations by Part ID and Variable ID
PartRoutes.put("/:_id/partsCalculations/:variableId", async (req, res) => {
  try {
    const updatedPart = await PartsModel.findOneAndUpdate(
      { _id: req.params._id, "partsCalculations._id": req.params.variableId },
      {
        $set: {
          "partsCalculations.$.AvgragecostPerUnit": req.body.AvgragecostPerUnit,
          "partsCalculations.$.AvgragetimePerUnit": req.body.AvgragetimePerUnit,
        },
      },
      { new: true }
    );

    if (!updatedPart) {
      return res
        .status(404)
        .json({ message: "Part or partsCalculations not found" });
    }

    res.status(200).json(updatedPart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// rm unit cost start
// POST - Add a new RM Unit Cost to a specific part
PartRoutes.post("/:_id/rmUnitCost", async (req, res) => {
  try {
    const newRMUnitCost = {
      categoryId: req.body.categoryId,
      name: req.body.name,
      totalRate: req.body.totalRate,
    };

    const updatedPart = await PartsModel.findByIdAndUpdate(
      req.params._id,
      { $push: { rmUnitCost: newRMUnitCost } },
      { new: true }
    );

    if (!updatedPart) {
      return res.status(404).json({ message: "Part not found" });
    }

    res.status(201).json(updatedPart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET - Retrieve RM Unit Costs of a specific part
PartRoutes.get("/:_id/rmUnitCost", async (req, res) => {
  try {
    const part = await PartsModel.findById(req.params._id, "rmUnitCost");
    if (!part) {
      return res.status(404).json({ message: "Part not found" });
    }
    res.status(200).json(part.rmUnitCost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT - Update an RM Unit Cost within a part
PartRoutes.put("/:_id/rmUnitCost/:variableId", async (req, res) => {
  try {
    const updatedPart = await PartsModel.findOneAndUpdate(
      { _id: req.params._id, "rmUnitCost._id": req.params.variableId },
      { $set: { "rmUnitCost.$": req.body } },
      { new: true }
    );

    if (!updatedPart) {
      return res
        .status(404)
        .json({ message: "Part or RM Unit Cost not found" });
    }

    res.status(200).json(updatedPart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Delete an RM Unit Cost within a part
PartRoutes.delete("/:_id/rmUnitCost/:variableId", async (req, res) => {
  try {
    const updatedPart = await PartsModel.findByIdAndUpdate(
      req.params._id,
      { $pull: { rmUnitCost: { _id: req.params.variableId } } },
      { new: true }
    );

    if (!updatedPart) {
      return res
        .status(404)
        .json({ message: "Part or RM Unit Cost not found" });
    }

    res.status(200).json(updatedPart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// end rm unit cost here

// start manufacturing unit cost
// POST - Add a new Manufacturing Unit Cost to a specific part
PartRoutes.post("/:_id/manufacturingUnitCost", async (req, res) => {
  try {
    const newManufacturingUnitCost = {
      categoryId: req.body.categoryId,
      name: req.body.name,
      times: req.body.times,
      totalRate: req.body.totalRate,
    };

    const updatedPart = await PartsModel.findByIdAndUpdate(
      req.params._id,
      { $push: { manufacturingUnitCost: newManufacturingUnitCost } },
      { new: true }
    );

    if (!updatedPart) {
      return res.status(404).json({ message: "Part not found" });
    }

    res.status(201).json(updatedPart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET - Retrieve Manufacturing Unit Costs of a specific part
PartRoutes.get("/:_id/manufacturingUnitCost", async (req, res) => {
  try {
    const part = await PartsModel.findById(
      req.params._id,
      "manufacturingUnitCost"
    );
    if (!part) {
      return res.status(404).json({ message: "Part not found" });
    }
    res.status(200).json(part.manufacturingUnitCost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT - Update a Manufacturing Unit Cost within a part
PartRoutes.put("/:_id/manufacturingUnitCost/:variableId", async (req, res) => {
  try {
    const updatedPart = await PartsModel.findOneAndUpdate(
      {
        _id: req.params._id,
        "manufacturingUnitCost._id": req.params.variableId,
      },
      { $set: { "manufacturingUnitCost.$": req.body } },
      { new: true }
    );

    if (!updatedPart) {
      return res
        .status(404)
        .json({ message: "Part or Manufacturing Unit Cost not found" });
    }

    res.status(200).json(updatedPart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Delete a Manufacturing Unit Cost within a part
PartRoutes.delete(
  "/:_id/manufacturingUnitCost/:variableId",
  async (req, res) => {
    try {
      const updatedPart = await PartsModel.findByIdAndUpdate(
        req.params._id,
        { $pull: { manufacturingUnitCost: { _id: req.params.variableId } } },
        { new: true }
      );

      // console.log("Updated part:", updatedPart);

      if (!updatedPart) {
        // console.log("Part or Manufacturing Unit Cost not found");
        return res
          .status(404)
          .json({ message: "Part or Manufacturing Unit Cost not found" });
      }

      res.status(200).json(updatedPart);
    } catch (error) {
      console.error("Error during delete operation:", error);
      res.status(500).json({ message: error.message });
    }
  }
);
//end here

// excel post code

// Helper Functions
function parseExcel(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = xlsx.utils.sheet_to_json(sheet);

  const idSet = new Set();
  const partsData = [];
  const duplicates = [];

  jsonData.forEach((row) => {
    if (row["Part ID"]) {
      if (idSet.has(row["Part ID"])) {
        duplicates.push(row["Part ID"]);
      } else {
        idSet.add(row["Part ID"]);
        partsData.push({
          id: row["Part ID"],
          partName: row["Part Name"],
          clientNumber: row["Client Number"],
          codeName: row["Code Name"],
          partType: row["Part Type"],
          costPerUnit: row["Cost Per Unit"],
          timePerUnit: row["Time Per Unit"],
          stockPOQty: row["Stock PO Qty"],
          totalCost: row["Total Cost"],
          totalQuantity: row["Total Quantity"],
          generalVariables: parseArrayData(row, "General Variables"),
          rmVariables: parseArrayData(row, "RM Variables"),
          manufacturingVariables: parseArrayData(row, "Manufacturing Variables"),
          shipmentVariables: parseArrayData(row, "Shipment Variables"),
          overheadsAndProfits: parseArrayData(row, "Overheads and Profits"),
        });
      }
    }
  });

  return {
    partsData,
    duplicates,
    error: null,
    message: "Excel file parsed successfully"
  };
}

function parseArrayData(row, prefix) {
  const items = [];
  let index = 1;
  while (row[`${prefix} Category ID ${index}`]) {
    const item = {
      categoryId: row[`${prefix} Category ID ${index}`],
      name: row[`${prefix} Name ${index}`],
    };

    // Add keys based on prefix type
    if (prefix === "General Variables") {
      item.value = row[`${prefix} Value ${index}`] || null;
    } else if (prefix === "RM Variables") {
      item.netWeight = parseFloat(row[`${prefix} Net Weight ${index}`]) || null;
      item.pricePerKg =
        parseFloat(row[`${prefix} Price Per Kg ${index}`]) || null;
      item.totalRate = parseFloat(row[`${prefix} Total Rate ${index}`]) || null;
    } else if (prefix === "Manufacturing Variables") {
      item.times = row[`${prefix} Times ${index}`] || null;
      item.hours = parseFloat(row[`${prefix} Hours ${index}`]) || null;
      item.hourlyRate =
        parseFloat(row[`${prefix} Hourly Rate ${index}`]) || null;
      item.totalRate = parseFloat(row[`${prefix} Total Rate ${index}`]) || null;
    } else if (prefix === "Shipment Variables") {
      item.hourlyRate =
        parseFloat(row[`${prefix} Hourly Rate ${index}`]) || null;
    } else if (prefix === "Overheads and Profits") {
      item.percentage =
        parseFloat(row[`${prefix} Percentage ${index}`]) || null;
      item.totalRate = parseFloat(row[`${prefix} Total Rate ${index}`]) || null;
    }

    items.push(item);
    index++;
  }
  return items;
}

PartRoutes.post(
  "/uploadexcelparts",
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).send({ error: "File upload failed." });
      } else if (err) {
        return res
          .status(500)
          .send({ error: "An error occurred during upload." });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send("No file uploaded.");
      }

      const tempFilePath = `./upload/${req.file.originalname}`;
      fs.writeFileSync(tempFilePath, req.file.buffer);

      const { partsData, duplicates, error, message } =
        parseExcel(tempFilePath);

      fs.unlinkSync(tempFilePath);

      if (error) {
        return res.status(400).send({ error, message });
      }

      if (partsData.length === 0) {
        return res.status(400).send({
          error: "No unique data to upload.",
          duplicates,
        });
      }

      // Save unique parts data to the database
      const result = await PartsModel.insertMany(partsData);

      res.status(201).send({
        message: "Parts data uploaded successfully.",
        savedData: result,
        savedCount: result.length,
        duplicates,
        duplicateCount: duplicates.length,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        error: "An error occurred while processing the file.",
        message: error.message,
      });
    }
  }
);

// // Helper Function to Fetch Data from API
// const fetchCategoryData = async (categoryId) => {
//   try {
//     const response = await axios.get(
//       `http://localhost:4040/api/manufacturing/category/${categoryId}`
//     );
//     return response.data;
//   } catch (error) {
//     console.error(`Error fetching data for category ${categoryId}:`, error);
//     return null;
//   }
// };

// // Updated parseExcel Function
// async function parseExcelWithAPI(filePath) {
//   const workbook = xlsx.readFile(filePath);
//   const sheet = workbook.Sheets[workbook.SheetNames[0]];
//   const jsonData = xlsx.utils.sheet_to_json(sheet);

//   console.log("Parsed Data:", jsonData);

//   const idSet = new Set();
//   const partsData = [];
//   const duplicates = [];
//   const skippedRows = [];
//   const validPartTypes = ["Make", "Purchase"];

//   for (const [index, row] of jsonData.entries()) {
//     const partId = row["Part ID"]?.trim() || null; // Adjust key based on actual column name
//     if (!partId) {
//       skippedRows.push({ index, reason: "Missing Part ID", row });
//       continue;
//     }

//     if (idSet.has(partId)) {
//       duplicates.push(partId);
//       continue;
//     }

//     idSet.add(partId);

//     // Prepare Manufacturing Variables
//     const manufacturingVariables = [];
//     for (const key in row) {
//       if (key.startsWith("C")) {
//         const categoryId = key.trim();
//         const hours = parseFloat(row[key]) || 0;
//         const categoryData = await fetchCategoryData(categoryId);

//         if (categoryData) {
//           manufacturingVariables.push({
//             categoryId,
//             name: categoryData.name,
//             hours,
//             ...categoryData,
//           });
//         }
//       }
//     }

//     partsData.push({
//       id: partId,
//       partName: row["Part Name"]?.trim() || "Unknown",
//       // partType: row["Part Type"]?.trim() || "Unknown",
//       partType: validPartTypes.includes(row["Part Type"]?.trim())
//         ? row["Part Type"]?.trim()
//         : "Unknown",
//       clientNumber: row["Client Number"]?.trim() || "Unknown",
//       codeName: row["Code Name"]?.trim() || "Unknown",
//       costPerUnit: parseFloat(row["Cost Per Unit"]) || 0,
//       timePerUnit: parseFloat(row["Time Per Unit"]) || 0,
//       stockPOQty: parseInt(row["Stock PO Qty"], 10) || 0,
//       totalCost: parseFloat(row["Total Cost"]) || 0,
//       totalQuantity: parseInt(row["Total Quantity"], 10) || 0,
//       manufacturingVariables,
//     });
//   }

//   console.log("Skipped Rows:", skippedRows);

//   if (partsData.length === 0) {
//     return {
//       partsData,
//       duplicates,
//       skippedRows,
//       error: "No valid data to upload.",
//       message: "No unique data found or all rows were invalid.",
//     };
//   }

//   return {
//     partsData,
//     duplicates,
//     skippedRows,
//     error: null,
//     message: "Excel file parsed successfully.",
//   };
// }

// // Updated Endpoint
// PartRoutes.post(
//   "/uploadexcelparts",
//   (req, res, next) => {
//     upload.single("file")(req, res, (err) => {
//       if (err instanceof multer.MulterError) {
//         return res.status(400).send({ error: "File upload failed." });
//       } else if (err) {
//         return res
//           .status(500)
//           .send({ error: "An error occurred during upload." });
//       }
//       next();
//     });
//   },
//   async (req, res) => {
//     try {
//       if (!req.file) {
//         return res.status(400).send("No file uploaded.");
//       }

//       const tempFilePath = `./upload/${req.file.originalname}`;
//       fs.writeFileSync(tempFilePath, req.file.buffer);

//       const { partsData, duplicates, error, message } = await parseExcelWithAPI(
//         tempFilePath
//       );

//       fs.unlinkSync(tempFilePath);

//       if (error) {
//         return res.status(400).send({ error, message });
//       }

//       // if (partsData.length === 0) {
//       //   return res.status(400).send({
//       //     error: "No unique data to upload.",
//       //     duplicates,
//       //   });
//       // }
//       if (partsData.length === 0) {
//         return res.status(400).send({
//           error: "No unique data to upload.",
//           duplicates,
//           skippedRows,
//         });
//       }

//       // Save unique parts data to the database
//       const result = await PartsModel.insertMany(partsData);

//       res.status(201).send({
//         message: "Parts data uploaded successfully.",
//         savedData: result,
//         savedCount: result.length,
//         duplicates,
//         duplicateCount: duplicates.length,
//       });
//     } catch (error) {
//       console.error("Error inserting data:", error);
//       return res.status(400).send({
//         error: "Failed to insert data into the database",
//         message: error.message,
//       });
//     }
//   }
// );

module.exports = { PartRoutes };
