// routes/partsRoutes/parts.route.js

const { Router } = require("express");
const PartsModel = require("../../model/Parts/PartModel");
const ManufacturingModel = require("../../model/manufacturingmodel");
const RmVariableModel = require("../../model/rmmodel");
const OverheadsModel = require("../../model/overheadsmodel");
const ShipmentModel = require("../../model/shipmentmodel");
const multer = require("multer");
const xlsx = require("xlsx");
const fs = require("fs");
const sharp = require("sharp");
const PartsExcelRoutes = Router();
const axios = require("axios");
const path = require("path");
const maxSize = 5 * 1024 * 1024; // 2MB
// Multer Configuration
const storage = multer.memoryStorage();
const upload = multer({
  limits: { fileSize: 50 * 1024 * 1024 },
  storage: multer.memoryStorage(),
});

// Define the directory for storing images
const imageUploadDir = path.join(__dirname, "../../Images");

// Ensure the directory exists
if (!fs.existsSync(imageUploadDir)) {
  fs.mkdirSync(imageUploadDir, { recursive: true });
}

// parts variable's backend

PartsExcelRoutes.post("/", async (req, res) => {
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

PartsExcelRoutes.put("/:_id", async (req, res) => {
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

// delete all arts
PartsExcelRoutes.delete("/", async (req, res) => {
  try {
    const result = await PartsModel.deleteMany({}); // Deletes all documents in the collection
    res.status(200).json({
      message: "All parts have been deleted successfully.",
      deletedCount: result.deletedCount, // Number of documents deleted
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while deleting parts.",
      error: error.message,
    });
  }
});

// GET - Retrieve all parts

// PartsExcelRoutes.get("/", async (req, res) => {
//   try {
//     const parts = await PartsModel.find();
//     res.status(200).json(parts);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

PartsExcelRoutes.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const filterType = req.query.filterType || "";
    const search = req.query.search || "";

    const query = {};

    if (filterType) {
      query.partType = filterType;
    }

    if (search) {
      query.$or = [
        { partName: { $regex: search, $options: "i" } },
        { id: { $regex: search, $options: "i" } },
      ];
    }

    // ALWAYS search across all records when there's a search term
    if (search) {
      const parts = await PartsModel.find(query)
        .sort({ createdAt: -1 })
        .limit(1000); // Increase limit for search results
      
      return res.status(200).json({
        data: parts,
        pagination: {
          total: parts.length,
          page: 1,
          pages: 1,
          limit: parts.length,
        },
      });
    }

    // Normal pagination when no search
    const total = await PartsModel.countDocuments(query);
    const parts = await PartsModel.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      data: parts,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// PartsExcelRoutes.get("/", async (req, res) => {
//   try {
//     // Get pagination parameters from query string
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 25;
//     const skip = (page - 1) * limit;

//     // Get filter type if provided
//     const filterType = req.query.filterType || '';

//     // Build query
//     const query = {};
//     if (filterType) {
//       query.partType = filterType;
//     }

//     // Get total count for pagination info
//     const total = await PartsModel.countDocuments(query);

//     // Get paginated results
//     const parts = await PartsModel.find(query)
//       .skip(skip)
//       .limit(limit)
//       .sort({ createdAt: -1 }); // Sort by newest first by default

//     res.status(200).json({
//       data: parts,
//       pagination: {
//         total,
//         page,
//         pages: Math.ceil(total / limit),
//         limit
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

PartsExcelRoutes.get("/:_id", async (req, res) => {
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
PartsExcelRoutes.put("/:_id", async (req, res) => {
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
PartsExcelRoutes.delete("/:_id", async (req, res) => {
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
PartsExcelRoutes.get("/:_id/generalVariables", async (req, res) => {
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
PartsExcelRoutes.post("/:_id/generalVariables", async (req, res) => {
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
PartsExcelRoutes.put("/:_id/generalVariables/:variableId", async (req, res) => {
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
PartsExcelRoutes.delete(
  "/:_id/generalVariables/:variableId",
  async (req, res) => {
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
  }
);
// general variable route end here

// start rm variable backend from here
// GET - Retrieve RM Variables of a specific part
PartsExcelRoutes.get("/:_id/rmVariables", async (req, res) => {
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

PartsExcelRoutes.post("/:_id/rmVariables", async (req, res) => {
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

// PUT - Update an RM Variable within a part

PartsExcelRoutes.put("/:_id/rmVariables/:variableId", async (req, res) => {
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
PartsExcelRoutes.delete("/:_id/rmVariables/:variableId", async (req, res) => {
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
PartsExcelRoutes.get("/:_id/manufacturingVariables", async (req, res) => {
  try {
    const part = await PartsModel.findById(req.params._id);

    if (!part) {
      return res.status(404).json({ message: "Part not found" });
    }

    res.status(200).json(part.manufacturingVariables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add the reorder route BEFORE the variableId route
PartsExcelRoutes.put("/:partId/manufacturing-reorder", async (req, res) => {
  try {
    const { partId } = req.params;
    const { variableId, direction } = req.body;

    const part = await PartsModel.findById(partId);
    if (!part) {
      return res.status(404).json({ message: "Part not found" });
    }

    const currentIndex = part.manufacturingVariables.findIndex(
      (v) => v._id.toString() === variableId
    );
    if (currentIndex === -1) {
      return res.status(404).json({ message: "Variable not found" });
    }

    let newIndex;
    if (direction === "up" && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (
      direction === "down" &&
      currentIndex < part.manufacturingVariables.length - 1
    ) {
      newIndex = currentIndex + 1;
    } else {
      return res.status(400).json({ message: "Invalid move operation" });
    }

    const variableToMove = part.manufacturingVariables[currentIndex];
    part.manufacturingVariables.splice(currentIndex, 1);
    part.manufacturingVariables.splice(newIndex, 0, variableToMove);

    // Update indexes
    part.manufacturingVariables.forEach((item, index) => {
      item.index = index;
    });

    await part.save();

    res.status(200).json({
      success: true,
      message: "Variables reordered successfully",
      manufacturingVariables: part.manufacturingVariables,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

PartsExcelRoutes.post("/:_id/manufacturingVariables", async (req, res) => {
  try {
    const newManufacturingVariable = {
      categoryId: req.body.categoryId,
      name: req.body.name,
      SubMachineName: req.body.SubMachineName,
      times: req.body.times,
      hours: req.body.hours,
      hourlyRate: req.body.hourlyRate,
      totalRate: req.body.hours * req.body.hourlyRate,
      isSpecialday: req.body.isSpecialday || false, // Explicitly include
      SpecialDayTotalMinutes: req.body.SpecialDayTotalMinutes || 0, // Explicitly include
      wareHouse: req.body.wareHouse,
      warehouseId: req.body.warehouseId,
    };

    const updatedPart = await PartsModel.findByIdAndUpdate(
      req.params._id,
      { $push: { manufacturingVariables: newManufacturingVariable } },
      { new: true }
    );

    if (!updatedPart) {
      return res.status(404).json({ message: "Part not found" });
    }

    res.status(201).json(updatedPart.manufacturingVariables);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT - Update an Manufacturing Variable within a part
// PartsExcelRoutes.put(
//   "/:_id/manufacturingVariables/:variableId",
//   async (req, res) => {
//     try {
//       const updatedPart = await PartsModel.findOneAndUpdate(
//         {
//           _id: req.params._id,
//           "manufacturingVariables._id": req.params.variableId,
//         },
//         { $set: { "manufacturingVariables.$": req.body } },
//         { new: true }
//       );
//       if (!updatedPart) {
//         return res
//           .status(404)
//           .json({ message: "Part or manufacturing variable not found" });
//       }
//       res.status(200).json(updatedPart);
//     } catch (error) {
//       res.status(400).json({ message: error.message });
//     }
//   }
// );

PartsExcelRoutes.put(
  "/:_id/manufacturingVariables/:variableId",
  async (req, res) => {
    try {
      const updateFields = {};

      if (req.body.name !== undefined) updateFields["manufacturingVariables.$.name"] = req.body.name;
      if (req.body.hours !== undefined) updateFields["manufacturingVariables.$.hours"] = req.body.hours;
      if (req.body.hourlyRate !== undefined) updateFields["manufacturingVariables.$.hourlyRate"] = req.body.hourlyRate;
      if (req.body.totalRate !== undefined) updateFields["manufacturingVariables.$.totalRate"] = req.body.totalRate;
      if (req.body.isSpecialday !== undefined) updateFields["manufacturingVariables.$.isSpecialday"] = req.body.isSpecialday;
      if (req.body.SpecialDayTotalMinutes !== undefined) updateFields["manufacturingVariables.$.SpecialDayTotalMinutes"] = req.body.SpecialDayTotalMinutes;
      if (req.body.times !== undefined) updateFields["manufacturingVariables.$.times"] = req.body.times; // ADD THIS LINE
      if (req.body.SubMachineName !== undefined) updateFields["manufacturingVariables.$.SubMachineName"] = req.body.SubMachineName; // AND THIS LINE

      console.log("Update fields:", updateFields); // Debug log

      const updatedPart = await PartsModel.findOneAndUpdate(
        { _id: req.params._id, "manufacturingVariables._id": req.params.variableId },
        { $set: updateFields },
        { new: true }
      );

      if (!updatedPart) {
        return res.status(404).json({ message: "Part or manufacturing variable not found" });
      }

      res.status(200).json(updatedPart);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);


// DELETE - Delete an Manufacturing Variable within a part
PartsExcelRoutes.delete(
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
PartsExcelRoutes.get(
  "/:_id/manufacturingVariablesstactics",
  async (req, res) => {
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
  }
);

// POST - Add a new Manufacturing Variable to a specific part
PartsExcelRoutes.post(
  "/:_id/manufacturingVariablesstactics",
  async (req, res) => {
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
  }
);

// PUT - Update an Manufacturing Variable within a part
PartsExcelRoutes.put(
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
PartsExcelRoutes.delete(
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
PartsExcelRoutes.get("/:_id/shipmentVariables", async (req, res) => {
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

PartsExcelRoutes.post("/:_id/shipmentVariables", async (req, res) => {
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
PartsExcelRoutes.put(
  "/:_id/shipmentVariables/:variableId",
  async (req, res) => {
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
  }
);

// DELETE for shipment
PartsExcelRoutes.delete(
  "/:_id/shipmentVariables/:variableId",
  async (req, res) => {
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
  }
);

// edn Shipment variable backend from here

// start overheads and profit variable backend from here
PartsExcelRoutes.get("/:_id/overheadsAndProfits", async (req, res) => {
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

PartsExcelRoutes.post("/:_id/overheadsAndProfits", async (req, res) => {
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

PartsExcelRoutes.put(
  "/:_id/overheadsAndProfits/:variableId",
  async (req, res) => {
    try {
      const updatedPart = await PartsModel.findOneAndUpdate(
        {
          _id: req.params._id,
          "overheadsAndProfits._id": req.params.variableId,
        },
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
  }
);

PartsExcelRoutes.delete(
  "/:_id/overheadsAndProfits/:variableId",
  async (req, res) => {
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
  }
);

// end overheads and profit variable backend from here

PartsExcelRoutes.get("/:_id/partsCalculations", async (req, res) => {
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

PartsExcelRoutes.post("/:_id/partsCalculations", async (req, res) => {
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
PartsExcelRoutes.put(
  "/:_id/partsCalculations/:variableId",
  async (req, res) => {
    try {
      const updatedPart = await PartsModel.findOneAndUpdate(
        { _id: req.params._id, "partsCalculations._id": req.params.variableId },
        {
          $set: {
            "partsCalculations.$.AvgragecostPerUnit":
              req.body.AvgragecostPerUnit,
            "partsCalculations.$.AvgragetimePerUnit":
              req.body.AvgragetimePerUnit,
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
  }
);

// rm unit cost start
// POST - Add a new RM Unit Cost to a specific part
PartsExcelRoutes.post("/:_id/rmUnitCost", async (req, res) => {
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
PartsExcelRoutes.get("/:_id/rmUnitCost", async (req, res) => {
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
PartsExcelRoutes.put("/:_id/rmUnitCost/:variableId", async (req, res) => {
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
PartsExcelRoutes.delete("/:_id/rmUnitCost/:variableId", async (req, res) => {
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
PartsExcelRoutes.post("/:_id/manufacturingUnitCost", async (req, res) => {
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
PartsExcelRoutes.get("/:_id/manufacturingUnitCost", async (req, res) => {
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
PartsExcelRoutes.put(
  "/:_id/manufacturingUnitCost/:variableId",
  async (req, res) => {
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
  }
);

// DELETE - Delete a Manufacturing Unit Cost within a part
PartsExcelRoutes.delete(
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

PartsExcelRoutes.get("/category/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Find manufacturing entry by categoryId
    const manufacturingEntry = await ManufacturingModel.findOne({ categoryId });

    if (!manufacturingEntry) {
      return res.status(404).json({ msg: "Manufacturing entry not found" });
    }

    // Extract only the required fields
    const { categoryId: id, name, hourlyrate } = manufacturingEntry;

    res.status(200).json({
      msg: "Manufacturing entry retrieved",
      data: { categoryId: id, name, hourlyrate },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

PartsExcelRoutes.get("/categoryrm/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Find manufacturing entry by categoryId
    const RmEntry = await RmVariableModel.findOne({ categoryId });

    if (!RmEntry) {
      return res.status(404).json({ msg: "Rm entry not found" });
    }

    // Extract only the required fields
    const { categoryId: id, name, price } = RmEntry;

    res.status(200).json({
      msg: "Rm entry retrieved",
      data: { categoryId: id, name, price },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

PartsExcelRoutes.get("/categoryoverheads/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Find manufacturing entry by categoryId
    const OverHeadsEntry = await OverheadsModel.findOne({ categoryId });

    if (!OverHeadsEntry) {
      return res.status(404).json({ msg: "Overheads entry not found" });
    }

    // Extract only the required fields
    const { categoryId: id, name } = OverHeadsEntry;

    res.status(200).json({
      msg: "Overheads entry retrieved",
      data: { categoryId: id, name },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

PartsExcelRoutes.get("/categoryshipment/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Find manufacturing entry by categoryId
    const shipmentEntry = await ShipmentModel.findOne({ categoryId });

    if (!shipmentEntry) {
      return res.status(404).json({ msg: "shipment entry not found" });
    }

    // Extract only the required fields
    const { categoryId: id, name, percentage } = shipmentEntry;

    res.status(200).json({
      msg: "shipment entry retrieved",
      data: { categoryId: id, name, percentage },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PartsExcelRoutes.post("/uploadexcel", upload.single("file"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
//     const sheetName = workbook.SheetNames[0];
//     const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
//       defval: "",
//     });

//     if (sheetData.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "The uploaded Excel file is empty" });
//     }

//     // Fetch all manufacturing categories with hourlyrate
//     const manufacturingCategories = await ManufacturingModel.find(
//       {},
//       "categoryId hourlyrate"
//     ).lean();
//     console.log("Manufacturing Categories:", manufacturingCategories);

//     const hourlyRateMap = new Map(
//       manufacturingCategories.map((item) => [item.categoryId, item.hourlyrate])
//     );
//     console.log("Hourly Rate Map:", hourlyRateMap);

//     // Group data by Part No.
//     const partsMap = new Map();

//     for (const row of sheetData) {
//       const partNo = row["Part No."];
//       const partDescription = row["Part Description"];
//       const timeInMinutes = parseFloat(row["Time in Minutes"]);
//       const stage = row["Stage"];

//       if (!partNo || !partDescription || isNaN(timeInMinutes) || !stage) {
//         console.warn(`Skipping row with missing fields: ${JSON.stringify(row)}`);
//         continue;
//       }

//       // Split stage into categoryId and name
//       const [categoryId, name] = stage.split(" - ");
//       if (!categoryId || !name) {
//         console.warn(`Invalid stage format: ${stage}`);
//         continue;
//       }

//       // Get hourlyrate for the categoryId
//       const hourlyrate = hourlyRateMap.get(categoryId.trim());
//       if (!hourlyrate) {
//         console.warn(`Hourly rate not found for categoryId: ${categoryId}`);
//         continue;
//       }

//       // Calculate totalrate
//       const totalrate = (timeInMinutes / 60) * hourlyrate;

//       if (!partsMap.has(partNo)) {
//         partsMap.set(partNo, {
//           partNo,
//           partDescription,
//           manufacturingVariables: [],
//         });
//       }

//       const partData = partsMap.get(partNo);

//       // Check if the process (categoryId + name) already exists for this part
//       const existingProcess = partData.manufacturingVariables.find(
//         (item) =>
//           item.categoryId === categoryId.trim() && item.name === name.trim()
//       );

//       if (existingProcess) {
//         // If the process exists, update the hours and totalRate
//         existingProcess.hours += timeInMinutes / 60;
//         existingProcess.totalRate += totalrate;
//       } else {
//         // If the process does not exist, add it
//         partData.manufacturingVariables.push({
//           categoryId: categoryId.trim(),
//           name: name.trim(),
//           hours: timeInMinutes / 60,
//           hourlyRate: hourlyrate, // Map to PartsModel's hourlyRate (capital R)
//           totalRate: totalrate, // Map to PartsModel's totalRate (capital R)
//         });
//       }
//     }

//     const processedParts = [];
//     const duplicateParts = [];
//     const operations = [];

//     // Fetch existing part IDs to check for duplicates
//     const existingPartIds = await PartsModel.distinct("id");
//     const existingPartsSet = new Set(existingPartIds);

//     for (const [partNo, partData] of partsMap) {
//       if (existingPartsSet.has(partNo)) {
//         duplicateParts.push(partNo);
//         continue;
//       }

//       const partType = "Make"; // Assuming all parts are of type "Make"

//       // Sort manufacturingVariables by categoryId in ascending order
//       partData.manufacturingVariables.sort((a, b) =>
//         a.categoryId.localeCompare(b.categoryId)
//       );

//       const totalHours = partData.manufacturingVariables.reduce(
//         (sum, item) => sum + item.hours,
//         0
//       );

//       const partDocument = {
//         id: partNo,
//         partName: partData.partDescription,
//         partType,
//         timePerUnit: totalHours,
//         manufacturingVariables: partData.manufacturingVariables,
//       };

//       processedParts.push(partNo);
//       operations.push({
//         insertOne: { document: partDocument },
//       });

//       existingPartsSet.add(partNo);
//     }

//     // Perform bulk write to MongoDB
//     if (operations.length > 0) {
//       await PartsModel.bulkWrite(operations, { ordered: false });
//     }

//     // Send response with processed parts data
//     res.status(201).json({
//       message: "File processed successfully",
//       processedCount: processedParts.length,
//       duplicateCount: duplicateParts.length,
//       duplicateIds: duplicateParts,
//       parts: Array.from(partsMap.values()), // Send processed parts data to frontend
//     });

//     console.log("Response Sent:", {
//       message: "File processed successfully",
//       processedCount: processedParts.length,
//       duplicateCount: duplicateParts.length,
//       duplicateIds: duplicateParts,
//       parts: Array.from(partsMap.values()),
//     });
//   } catch (error) {
//     console.error("Error processing file:", error.message);
//     res.status(500).json({ message: error.message });
//   }
// });

PartsExcelRoutes.post(
  "/uploadexcel",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
        defval: "",
      });

      if (sheetData.length === 0) {
        return res
          .status(400)
          .json({ message: "The uploaded Excel file is empty" });
      }

      // Fetch all manufacturing categories with hourlyrate
      const manufacturingCategories = await ManufacturingModel.find(
        {},
        "categoryId hourlyrate"
      ).lean();
      console.log("Manufacturing Categories:", manufacturingCategories);

      const hourlyRateMap = new Map(
        manufacturingCategories.map((item) => [
          item.categoryId,
          item.hourlyrate,
        ])
      );
      console.log("Hourly Rate Map:", hourlyRateMap);

      // Group data by Part No.
      const partsMap = new Map();

      for (const row of sheetData) {
        const partNo = row["Part No."];
        const partDescription = row["Part Description"];
        const timeInMinutes = parseFloat(row["Time in Minutes"]);
        const stage = row["Stage"];

        if (!partNo || !partDescription || isNaN(timeInMinutes) || !stage) {
          console.warn(
            `Skipping row with missing fields: ${JSON.stringify(row)}`
          );
          continue;
        }

        // Split stage into categoryId and name
        const [categoryId, name] = stage.split(" - ");
        if (!categoryId || !name) {
          console.warn(`Invalid stage format: ${stage}`);
          continue;
        }

        // Get hourlyrate for the categoryId
        const hourlyrate = hourlyRateMap.get(categoryId.trim());
        if (!hourlyrate) {
          console.warn(`Hourly rate not found for categoryId: ${categoryId}`);
          continue;
        }

        // Calculate totalrate
        const totalrate = (timeInMinutes / 60) * hourlyrate;

        if (!partsMap.has(partNo)) {
          partsMap.set(partNo, {
            partNo,
            partDescription,
            manufacturingVariables: [],
          });
        }

        const partData = partsMap.get(partNo);

        // Check if the process (categoryId + name) already exists for this part
        const existingProcess = partData.manufacturingVariables.find(
          (item) =>
            item.categoryId === categoryId.trim() && item.name === name.trim()
        );

        if (existingProcess) {
          // If the process exists, update the hours and totalRate
          existingProcess.hours += timeInMinutes / 60;
          existingProcess.totalRate += totalrate;
        } else {
          // If the process does not exist, add it
          partData.manufacturingVariables.push({
            categoryId: categoryId.trim(),
            name: name.trim(),
            hours: timeInMinutes / 60,
            hourlyRate: hourlyrate, // Map to PartsModel's hourlyRate (capital R)
            totalRate: totalrate, // Map to PartsModel's totalRate (capital R)
          });
        }
      }

      const processedParts = [];
      const duplicateParts = [];
      const operations = [];

      // Fetch existing part IDs to check for duplicates
      const existingPartIds = await PartsModel.distinct("id");
      const existingPartsSet = new Set(existingPartIds);

      for (const [partNo, partData] of partsMap) {
        if (existingPartsSet.has(partNo)) {
          duplicateParts.push(partNo);
          continue;
        }

        const partType = "Make"; // Assuming all parts are of type "Make"

        // Sort manufacturingVariables by categoryId in ascending order
        partData.manufacturingVariables.sort((a, b) =>
          a.categoryId.localeCompare(b.categoryId)
        );

        const totalHours = partData.manufacturingVariables.reduce(
          (sum, item) => sum + item.hours,
          0
        );

        // Calculate costPerUnit based on manufacturingVariables
        const costPerUnit = partData.manufacturingVariables.reduce(
          (sum, item) => sum + item.totalRate,
          0
        );

        const partDocument = {
          id: partNo,
          partName: partData.partDescription,
          partType,
          timePerUnit: totalHours,
          costPerUnit, // Updated costPerUnit
          manufacturingVariables: partData.manufacturingVariables,
        };

        processedParts.push(partNo);
        operations.push({
          insertOne: { document: partDocument },
        });

        existingPartsSet.add(partNo);
      }

      // Perform bulk write to MongoDB
      if (operations.length > 0) {
        await PartsModel.bulkWrite(operations, { ordered: false });
      }

      // Send response with processed parts data
      res.status(201).json({
        message: "File processed successfully",
        processedCount: processedParts.length,
        duplicateCount: duplicateParts.length,
        duplicateIds: duplicateParts,
        parts: Array.from(partsMap.values()),
      });
    } catch (error) {
      console.error("Error processing file:", error.message);
      res.status(500).json({ message: error.message });
    }
  }
);

PartsExcelRoutes.post(
  "/upload-image/:_id",
  upload.single("image"),
  async (req, res) => {
    try {
      const partId = req.params._id;
      const part = await PartsModel.findById(partId);

      if (!part) {
        return res.status(404).json({ message: "Part not found" });
      }

      let imagePath;

      if (req.file) {
        // If an image file is uploaded via file input
        if (req.file.size > maxSize) {
          return res
            .status(400)
            .json({ message: "Image size exceeds 2MB limit" });
        }
        imagePath = path.join(imageUploadDir, `${partId}.webp`);
        await sharp(req.file.buffer).webp({ quality: 80 }).toFile(imagePath);
      } else if (req.body.base64Image) {
        // If a base64 image is uploaded
        const base64Data = req.body.base64Image.replace(
          /^data:image\/\w+;base64,/,
          ""
        );
        const buffer = Buffer.from(base64Data, "base64");
        if (buffer.length > maxSize) {
          return res
            .status(400)
            .json({ message: "Image size exceeds 2MB limit" });
        }
        imagePath = path.join(imageUploadDir, `${partId}.webp`);
        await sharp(buffer).webp({ quality: 80 }).toFile(imagePath);
      } else {
        return res.status(400).json({ message: "No valid image provided" });
      }

      part.image = `/Images/${partId}.webp`;
      await part.save();

      res
        .status(200)
        .json({ message: "Image uploaded successfully", imageUrl: part.image });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

PartsExcelRoutes.put(
  "/update-image/:_id",
  upload.single("image"),
  async (req, res) => {
    try {
      const partId = req.params._id;
      const part = await PartsModel.findById(partId);

      if (!part) {
        return res.status(404).json({ message: "Part not found" });
      }

      if (!part.image) {
        return res
          .status(400)
          .json({ message: "No existing image. Use POST to upload first." });
      }

      let imagePath;

      if (req.file) {
        // If an image file is uploaded via file input
        if (req.file.size > maxSize) {
          return res
            .status(400)
            .json({ message: "Image size exceeds 2MB limit" });
        }
        imagePath = path.join(imageUploadDir, `${partId}.webp`);
        await sharp(req.file.buffer).webp({ quality: 80 }).toFile(imagePath);
      } else if (req.body.base64Image) {
        // If a base64 image is uploaded
        const base64Data = req.body.base64Image.replace(
          /^data:image\/\w+;base64,/,
          ""
        );
        const buffer = Buffer.from(base64Data, "base64");
        if (buffer.length > maxSize) {
          return res
            .status(400)
            .json({ message: "Image size exceeds 2MB limit" });
        }
        imagePath = path.join(imageUploadDir, `${partId}.webp`);
        await sharp(buffer).webp({ quality: 80 }).toFile(imagePath);
      } else {
        return res.status(400).json({ message: "No image uploaded" });
      }

      part.image = `/Images/${partId}.webp`;
      await part.save();

      res.status(200).json({ message: "Image updated successfully", part });
    } catch (error) {
      console.error("Error updating image:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

PartsExcelRoutes.get("/image/:_id", async (req, res) => {
  try {
    const partId = req.params._id;
    const part = await PartsModel.findById(partId);

    if (!part || !part.image) {
      return res.status(404).json({ message: "Image not found" });
    }

    res.sendFile(path.join(__dirname, "../../", part.image));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = { PartsExcelRoutes };
