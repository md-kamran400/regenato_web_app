// routes/partsRoutes/parts.route.js

const { Router } = require("express");
const PartsModel = require("../../model/Parts/PartModel");
const PartRoutes = Router();


// parts variable's backend

// POST - Add a new part
// POST - Add a new part or duplicate an existing part
// POST - Add a new part or duplicate an existing part
PartRoutes.post("/", async (req, res) => {
  try {
    const { id, partName, codeName, clientNumber, costPerUnit, timePerUnit, stockPOQty, rmVariables, manufacturingVariables, shipmentVariables, overheadsAndProfits,partsCalculations, originalIndex } = req.body;

    // Check if this is a duplicate request
    if (id && partName && costPerUnit && timePerUnit && stockPOQty) {
      // This is a duplicate request, create a new part with the provided data
      const newPart = new PartsModel({
        id,
        partName,
        clientNumber,
        codeName,
        costPerUnit,
        timePerUnit,
        stockPOQty,
        rmVariables,
        manufacturingVariables,
        shipmentVariables,
        overheadsAndProfits,
        partsCalculations,
      });

      // Find all parts
      const allParts = await PartsModel.find().sort({ id: 1 });

      // Insert the new part at the correct position
      allParts.splice(originalIndex + 1, 0, newPart);

      // Update the database with the new order
      await Promise.all(allParts.map((part, index) => {
        part.index = index;
        return part.save();
      }));

      res.status(201).json(newPart);
    } else {
      // This is a new part creation request
      const newPart = new PartsModel(req.body);
      await newPart.save();
      res.status(201).json(newPart);
    }
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
PartRoutes.get("/:_id", async (req, res) => {
  try {
    const part = await PartsModel.findById(req.params._id);
    if (!part) {
      return res.status(404).json({ message: "Part not found" });
    }
    res.status(200).json(part);
  } catch (error) {
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
    const part = await PartsModel.findById(req.params._id, 'generalVariables'); // Fetch RM Variables only
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
        value: req.body.value
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
      return res.status(404).json({ message: "Part or General Variable not found" });
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
      return res.status(404).json({ message: "Part or General variable not found" });
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
      const part = await PartsModel.findById(req.params._id, 'rmVariables'); // Fetch RM Variables only
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
        totalRate: req.body.totalRate
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
    const part = await PartsModel.findById(req.params._id, 'manufacturingVariables');
    if (!part) {
      return res.status(404).json({ message: "Part not found" });
    }
    res.status(200).json(part.manufacturingVariables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// POST - Add a new Manufacturing Variable to a specific part
PartRoutes.post("/:_id/manufacturingVariables", async (req, res) => {
  try {
    const newManufacturingVariable = {
      categoryId: req.body.categoryId,  
      name: req.body.name,
      hours: req.body.hours,
      hourlyRate: req.body.hourlyRate,
      totalRate: req.body.totalRate,
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
      { _id: req.params._id, "manufacturingVariables._id": req.params.variableId },
      { $set: { "manufacturingVariables.$": req.body } },
      { new: true }
    );
    if (!updatedPart) {
      return res.status(404).json({ message: "Part or manufacturing variable not found" });
    }
    res.status(200).json(updatedPart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



// DELETE - Delete an Manufacturing Variable within a part
PartRoutes.delete("/:_id/manufacturingVariables/:variableId", async (req, res) => {
  try {
    const updatedPart = await PartsModel.findByIdAndUpdate(
      req.params._id,
      { $pull: { manufacturingVariables: { _id: req.params.variableId } } },
      { new: true }
    );
    if (!updatedPart) {
      return res.status(404).json({ message: "Part or manufacturing variable not found" });
    }
    res.status(200).json(updatedPart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// edn Manufacturing variable backend from here 












// start Manufacturing variable backend from here 
PartRoutes.get("/:_id/manufacturingVariablesstactics", async (req, res) => {
  try {
    const part = await PartsModel.findById(req.params._id, 'manufacturingVariablesstactics');
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
      { $push: { manufacturingVariablesstactics: newManufacturingVariablestactics } },
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
PartRoutes.put("/:_id/manufacturingVariablesstactics/:variableId", async (req, res) => {
  try {
    const updatedPart = await PartsModel.findOneAndUpdate(
      { _id: req.params._id, "manufacturingVariablesstactics._id": req.params.variableId },
      { $set: { "manufacturingVariablesstactics.$": req.body } },
      { new: true }
    );
    if (!updatedPart) {
      return res.status(404).json({ message: "Part or manufacturing variable not found" });
    }
    res.status(200).json(updatedPart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



// DELETE - Delete an Manufacturing Variable within a part
PartRoutes.delete("/:_id/manufacturingVariablesstactics/:variableId", async (req, res) => {
  try {
    const updatedPart = await PartsModel.findByIdAndUpdate(
      req.params._id,
      { $pull: { manufacturingVariablesstactics: { _id: req.params.variableId } } },
      { new: true }
    );
    if (!updatedPart) {
      return res.status(404).json({ message: "Part or manufacturing variable not found" });
    }
    res.status(200).json(updatedPart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});















// start Shipment variable backend from here 
// GET for shipment 
PartRoutes.get("/:_id/shipmentVariables", async (req, res) => {
  try {
    const part = await PartsModel.findById(req.params._id, 'shipmentVariables');
    if (!part) {
      return res.status(404).json({ message: "Part not found" });
    }
    res.status(200).json(part.shipmentVariables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST for shipment 
PartRoutes.post("/:_id/shipmentVariables", async (req, res) => {
  try {
    const newShipmentVariable = {
      categoryId: req.body.categoryId,
      name: req.body.name,
      hourlyRate: req.body.hourlyRate
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
      return res.status(404).json({ message: "Part or shipment variable not found" });
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
      return res.status(404).json({ message: "Part or shipment variable not found" });
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
    const part = await PartsModel.findById(req.params._id, 'overheadsAndProfits');
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
      totalRate: req.body.totalRate
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
      return res.status(404).json({ message: "Part or overhead/profit not found" });
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
      return res.status(404).json({ message: "Part or overhead/profit not found" });
    }
    res.status(200).json(updatedPart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// edn overheads and profit variable backend from here 








PartRoutes.get("/:_id/partsCalculations", async (req, res) => {
  try {
    const calculationAvg = await PartsModel.findById(req.params._id, 'partsCalculations'); // Fetch RM Variables only
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
      return res.status(400).json({ message: "partsCalculations already exists for this part. Use PUT to update." });
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
      return res.status(404).json({ message: "Part or partsCalculations not found" });
    }

    res.status(200).json(updatedPart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


module.exports = {PartRoutes};
