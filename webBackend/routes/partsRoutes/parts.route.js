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
const PartRoutes = Router();
const axios = require("axios");

// Multer Configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: multer.memoryStorage() });

// parts variable's backend

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

// GET - Retrieve all parts

PartRoutes.get("/", async (req, res) => {
  try {
    const parts = await PartsModel.find();
    res.status(200).json(parts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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

PartRoutes.get("/category/:categoryId", async (req, res) => {
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

PartRoutes.get("/categoryrm/:categoryId", async (req, res) => {
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

PartRoutes.get("/categoryoverheads/:categoryId", async (req, res) => {
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

PartRoutes.get("/categoryshipment/:categoryId", async (req, res) => {
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

// PartRoutes.post("/uploadexcel", upload.single("file"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     // Parse the uploaded Excel file
//     const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
//     const sheetName = workbook.SheetNames[0];
//     const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

//     if (sheetData.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "The uploaded Excel file is empty" });
//     }

//     const processedParts = [];
//     const duplicateParts = [];

//     for (const row of sheetData) {
//       const id = row["id"];
//       const partName = row["partName "] || row["partName"];
//       const qty = row["Qty."] || row["Qty"];

//       // Skip rows with missing essential fields
//       if (!id || !partName || !qty) {
//         console.warn(
//           `Skipping row with missing fields: ${JSON.stringify(row)}`
//         );
//         continue;
//       }

//       // Check for duplicate parts
//       const existingPart = await PartsModel.findOne({ id });
//       if (existingPart) {
//         duplicateParts.push(id);
//         continue; // Skip processing this part
//       }

//       // Default values for the part
//       const partType = "Make"; // Default to "Make"
//       const costPerUnit = row["costPerUnit"] || 0;
//       const timePerUnit = row["timePerUnit"] || 0;
//       const stockPOQty = row["stockPOQty"] || 0;
//       const totalCost = row["totalCost"] || 0;
//       const totalQuantity = row["totalQuantity"] || 0;

//       // Collect valid manufacturing variables
//       const validManufacturingVariables = [];
//       for (const [key, value] of Object.entries(row)) {
//         if (key.startsWith("C") && value > 0) {
//           const manufacturingEntry = await ManufacturingModel.findOne({
//             categoryId: key,
//           });
//           if (!manufacturingEntry) {
//             console.warn(`No manufacturing entry found for categoryId: ${key}`);
//             continue;
//           }

//           validManufacturingVariables.push({
//             categoryId: manufacturingEntry.categoryId,
//             name: manufacturingEntry.name,
//             hours: value / 60,
//             hourlyRate: manufacturingEntry.hourlyrate,
//             totalRate: (value / 60) * manufacturingEntry.hourlyrate,
//           });
//         }
//       }

//       // Collect valid RM variables
//       const validRmVariables = [];
//       for (const [key, value] of Object.entries(row)) {
//         if (key === "FC") {
//           const rmEntry = await RmVariableModel.findOne({ categoryId: "FC" });
//           if (!rmEntry) {
//             console.warn(`No RM entry found for categoryId: FC`);
//             continue;
//           }

//           validRmVariables.push({
//             categoryId: rmEntry.categoryId,
//             name: rmEntry.name,
//             netWeight: 0,
//             pricePerKg: 0,
//             totalRate: value,
//           });
//         } else if (key.startsWith("B") && value > 0) {
//           const rmEntry = await RmVariableModel.findOne({ categoryId: key });
//           if (!rmEntry) {
//             console.warn(`No RM entry found for categoryId: ${key}`);
//             continue;
//           }

//           validRmVariables.push({
//             categoryId: rmEntry.categoryId,
//             name: rmEntry.name,
//             netWeight: value,
//             pricePerKg: rmEntry.price,
//             totalRate: value * rmEntry.price,
//           });
//         }
//       }

//       // Collect valid shipment variables
//       const validShipmentVariables = [];
//       for (const [key, value] of Object.entries(row)) {
//         if (key.startsWith("E") && value > 0) {
//           const shipmentEntry = await ShipmentModel.findOne({
//             categoryId: key,
//           });
//           if (!shipmentEntry) {
//             console.warn(`No shipment entry found for categoryId: ${key}`);
//             continue;
//           }

//           validShipmentVariables.push({
//             categoryId: shipmentEntry.categoryId,
//             name: shipmentEntry.name,
//             hourlyRate: value,
//           });
//         }
//       }

//       // Calculate the sum of total rates
//       const manufacturingTotalRate = validManufacturingVariables.reduce(
//         (sum, item) => sum + item.totalRate,
//         0
//       );
//       const rmTotalRate = validRmVariables.reduce(
//         (sum, item) => sum + item.totalRate,
//         0
//       );
//       const shipmentTotalRate = validShipmentVariables.reduce(
//         (sum, item) => sum + item.hourlyRate,
//         0
//       );
//       const totalSum = manufacturingTotalRate + rmTotalRate + shipmentTotalRate;

//       // Collect valid overheads and profits
//       const validOverheadsAndProfits = [];
//       for (const [key, value] of Object.entries(row)) {
//         if (key.startsWith("F") && value > 0) {
//           const overheadsEntry = await OverheadsModel.findOne({
//             categoryId: key,
//           });
//           if (!overheadsEntry) {
//             console.warn(`No overheads entry found for categoryId: ${key}`);
//             continue;
//           }

//           const percentage = value || 0;
//           const totalRate = (percentage / 100) * totalSum;

//           validOverheadsAndProfits.push({
//             categoryId: overheadsEntry.categoryId,
//             name: overheadsEntry.name,
//             percentage,
//             totalRate,
//           });
//         }
//       }

//       // Only create part data if there's valid data
//       const partData = {
//         id,
//         partName,
//         qty,
//         partType,
//         costPerUnit,
//         timePerUnit,
//         stockPOQty,
//         totalCost,
//         totalQuantity,
//         manufacturingVariables: validManufacturingVariables,
//         rmVariables: validRmVariables,
//         shipmentVariables: validShipmentVariables,
//         overheadsAndProfits: validOverheadsAndProfits,
//       };

//       const part = new PartsModel(partData);
//       await part.save();
//       processedParts.push(part);
//     }

//     res.status(201).json({
//       message: "File processed successfully",
//       processedCount: processedParts.length,
//       duplicateCount: duplicateParts.length,
//       duplicateIds: duplicateParts,
//     });
//   } catch (error) {
//     console.error("Error processing file:", error.message);
//     res.status(500).json({ message: error.message });
//   }
// });

// PartRoutes.post("/uploadexcel", upload.single("file"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
//     const sheetName = workbook.SheetNames[0];
//     const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

//     if (sheetData.length === 0) {
//       return res.status(400).json({ message: "The uploaded Excel file is empty" });
//     }

//     const processedParts = [];
//     const duplicateParts = [];

//     for (const row of sheetData) {
//       const id = row["id"];
//       const partName = row["partName "] || row["partName"];
//       const qty = row["Qty."] || row["Qty"];

//       if (!id || !partName || !qty) {
//         console.warn(`Skipping row with missing fields: ${JSON.stringify(row)}`);
//         continue;
//       }

//       const existingPart = await PartsModel.findOne({ id });
//       if (existingPart) {
//         duplicateParts.push(id);
//         continue;
//       }

//       const partType = "Make"; // Default
//       const stockPOQty = row["stockPOQty"] || 0;

//       // Initialize variables
//       const validManufacturingVariables = [];
//       const validRmVariables = [];
//       const validShipmentVariables = [];
//       const validOverheadsAndProfits = [];

//       // Process variables
//       for (const [key, value] of Object.entries(row)) {
//         if (key.startsWith("C") && value > 0) {
//           const manufacturingEntry = await ManufacturingModel.findOne({ categoryId: key });
//           if (manufacturingEntry) {
//             validManufacturingVariables.push({
//               categoryId: manufacturingEntry.categoryId,
//               name: manufacturingEntry.name,
//               hours: value / 60,
//               hourlyRate: manufacturingEntry.hourlyrate,
//               totalRate: (value / 60) * manufacturingEntry.hourlyrate,
//             });
//           }
//         } else if (key.startsWith("B") && value > 0) {
//           const rmEntry = await RmVariableModel.findOne({ categoryId: key });
//           if (rmEntry) {
//             validRmVariables.push({
//               categoryId: rmEntry.categoryId,
//               name: rmEntry.name,
//               netWeight: value,
//               pricePerKg: rmEntry.price,
//               totalRate: value * rmEntry.price,
//             });
//           }
//         } else if (key.startsWith("E") && value > 0) {
//           const shipmentEntry = await ShipmentModel.findOne({ categoryId: key });
//           if (shipmentEntry) {
//             validShipmentVariables.push({
//               categoryId: shipmentEntry.categoryId,
//               name: shipmentEntry.name,
//               hourlyRate: value,
//             });
//           }
//         } else if (key.startsWith("F") && value > 0) {
//           const overheadsEntry = await OverheadsModel.findOne({ categoryId: key });
//           if (overheadsEntry) {
//             const overheadsBase =
//               validManufacturingVariables.reduce((sum, item) => sum + item.totalRate, 0) +
//               validRmVariables.reduce((sum, item) => sum + item.totalRate, 0) +
//               validShipmentVariables.reduce((sum, item) => sum + item.hourlyRate, 0);

//             validOverheadsAndProfits.push({
//               categoryId: overheadsEntry.categoryId,
//               name: overheadsEntry.name,
//               percentage: value,
//               totalRate: (value / 100) * overheadsBase,
//             });
//           }
//         }
//       }

//       // Calculate totals
//       const manufacturingTotalRate = validManufacturingVariables.reduce((sum, item) => sum + item.totalRate, 0);
//       const rmTotalRate = validRmVariables.reduce((sum, item) => sum + item.totalRate, 0);
//       const shipmentTotalRate = validShipmentVariables.reduce((sum, item) => sum + item.hourlyRate, 0);
//       const overheadsTotalRate = validOverheadsAndProfits.reduce((sum, item) => sum + item.totalRate, 0);

//       const allThree = manufacturingTotalRate + rmTotalRate + shipmentTotalRate;
//       const totalSum = allThree + overheadsTotalRate;

//       const totalHours = validManufacturingVariables.reduce((sum, item) => sum + item.hours, 0);

//       const costPerUnit = qty > 0 ? Math.ceil(totalSum / qty) : 0; // Calculate cost per unit
//       const timePerUnit = qty > 0 ? totalHours / qty : 0; // Calculate time per unit

//       // Create part object
//       const partData = {
//         id,
//         partName,
//         qty,
//         partType,
//         costPerUnit,
//         timePerUnit,
//         stockPOQty,
//         manufacturingVariables: validManufacturingVariables,
//         rmVariables: validRmVariables,
//         shipmentVariables: validShipmentVariables,
//         overheadsAndProfits: validOverheadsAndProfits,
//       };

//       const part = new PartsModel(partData);
//       await part.save();
//       processedParts.push(part);
//     }

//     res.status(201).json({
//       message: "File processed successfully",
//       processedCount: processedParts.length,
//       duplicateCount: duplicateParts.length,
//       duplicateIds: duplicateParts,
//     });
//   } catch (error) {
//     console.error("Error processing file:", error.message);
//     res.status(500).json({ message: error.message });
//   }
// });
// 
PartRoutes.post("/uploadexcel", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (sheetData.length === 0) {
      return res.status(400).json({ message: "The uploaded Excel file is empty" });
    }

    const processedParts = [];
    const duplicateParts = [];

    for (const row of sheetData) {
      const id = row["id"];
      const partName = row["partName "] || row["partName"];
      const qty = row["Qty."] || row["Qty"];

      if (!id || !partName || !qty) {
        console.warn(`Skipping row with missing fields: ${JSON.stringify(row)}`);
        continue;
      }

      const existingPart = await PartsModel.findOne({ id });
      if (existingPart) {
        duplicateParts.push(id);
        continue;
      }

      const partType = "Make"; // Default
      const stockPOQty = row["stockPOQty"] || 0;

      // Initialize variables
      const validManufacturingVariables = [];
      const validRmVariables = [];
      const validShipmentVariables = [];
      const validOverheadsAndProfits = [];

      // Process variables
      for (const [key, value] of Object.entries(row)) {
        if (key.startsWith("C") && value > 0) {
          const manufacturingEntry = await ManufacturingModel.findOne({ categoryId: key });
          if (manufacturingEntry) {
            validManufacturingVariables.push({
              categoryId: manufacturingEntry.categoryId,
              name: manufacturingEntry.name,
              hours: value / 60,
              hourlyRate: manufacturingEntry.hourlyrate,
              totalRate: (value / 60) * manufacturingEntry.hourlyrate,
            });
          }
        } else if (key.startsWith("B") && value > 0) {
          const rmEntry = await RmVariableModel.findOne({ categoryId: key });
          if (rmEntry) {
            validRmVariables.push({
              categoryId: rmEntry.categoryId,
              name: rmEntry.name,
              netWeight: value,
              pricePerKg: rmEntry.price,
              totalRate: value * rmEntry.price,
            });
          }
        } else if (key.startsWith("E") && value > 0) {
          const shipmentEntry = await ShipmentModel.findOne({ categoryId: key });
          if (shipmentEntry) {
            validShipmentVariables.push({
              categoryId: shipmentEntry.categoryId,
              name: shipmentEntry.name,
              hourlyRate: value,
            });
          }
        } else if (key.startsWith("F") && value > 0) {
          const overheadsEntry = await OverheadsModel.findOne({ categoryId: key });
          if (overheadsEntry) {
            // Calculate the base for overheads
            const overheadsBase =
              validManufacturingVariables.reduce((sum, item) => sum + item.totalRate, 0) +
              validRmVariables.reduce((sum, item) => sum + item.totalRate, 0) +
              validShipmentVariables.reduce((sum, item) => sum + item.hourlyRate, 0);

            validOverheadsAndProfits.push({
              categoryId: overheadsEntry.categoryId,
              name: overheadsEntry.name,
              percentage: value,
              totalRate: (value / 100) * overheadsBase, // Calculate total rate based on percentage
            });
          }
        }
      }

      // Calculate totals
      const manufacturingTotalRate = validManufacturingVariables.reduce((sum, item) => sum + item.totalRate, 0);
      const rmTotalRate = validRmVariables.reduce((sum, item) => sum + item.totalRate, 0);
      const shipmentTotalRate = validShipmentVariables.reduce((sum, item) => sum + item.hourlyRate, 0);
      const overheadsTotalRate = validOverheadsAndProfits.reduce((sum, item) => sum + item.totalRate, 0);

      const allThree = manufacturingTotalRate + rmTotalRate + shipmentTotalRate;
      const totalSum = allThree + overheadsTotalRate;

      const totalHours = validManufacturingVariables.reduce((sum, item) => sum + item.hours, 0);

      const costPerUnit = qty > 0 ? Math.ceil(totalSum / qty) : 0; // Calculate cost per unit
      const timePerUnit = qty > 0 ? totalHours / qty : 0; // Calculate time per unit

      // Create part object
      const partData = {
        id,
        partName,
        qty,
        partType,
        costPerUnit,
        timePerUnit,
        stockPOQty,
        manufacturingVariables: validManufacturingVariables,
        rmVariables: validRmVariables,
        shipmentVariables: validShipmentVariables,
        overheadsAndProfits: validOverheadsAndProfits,
      };

      const part = new PartsModel(partData);
      await part.save();
      processedParts.push(part);
    }

    res.status(201).json({
      message: "File processed successfully",
      processedCount: processedParts.length,
      duplicateCount: duplicateParts.length,
      duplicateIds: duplicateParts,
    });
  } catch (error) {
    console.error("Error processing file:", error.message);
    res.status(500).json({ message: error.message });
  }
});


module.exports = { PartRoutes };
