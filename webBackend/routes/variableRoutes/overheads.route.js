const { Router } = require("express");
const OverheadsModel = require("../../model/overheadsmodel");
const OverheadsRouter = Router();

// POST request (already existing)
// OverheadsRouter.post("/", async (req, res) => {
//     try {
//         let Overheads = new OverheadsModel(req.body);
//         await Overheads.save();
//         res.status(200).json({ msg: "Overheads and Profits Variable Added", addOverheads: Overheads });
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// });

// validRmVariables.push({
//   categoryId: rmEntry.categoryId,
//   name: rmEntry.name,
//   netWeight: 0,
//   pricePerKg: 0,
//   totalRate: value, 
// });

// validRmVariables.push({
//   categoryId: rmEntry.categoryId,
//   name: rmEntry.name,
//   netWeight: value, // Assuming value represents weight in kg
//   pricePerKg: rmEntry.price,
//   totalRate: value * rmEntry.price, // Calculate total cost
// });

OverheadsRouter.post("/", async (req, res) => {
  try {
    // Check if the categoryId already exists
    const existingOverheads = await OverheadsModel.findOne({
      categoryId: req.body.categoryId,
    });

    if (existingOverheads) {
      return res.status(409).json({
        error: "Category ID already exists",
        message: "Please choose a different Category ID",
      });
    }

    let Overheads = new OverheadsModel(req.body);
    await Overheads.save();

    res.status(201).json({
      msg: "Overheads and Profits Variable Added",
      addOverheads: Overheads,
      message: "New overheads variable created successfully",
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

// GET request to retrieve all Overheads (already existing)
OverheadsRouter.get("/", async (req, res) => {
  try {
    const allOverheads = await OverheadsModel.find();
    res.status(200).json(allOverheads);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT request to update an Overheads entry by ID
OverheadsRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedOverheads = await OverheadsModel.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedOverheads) {
      return res.status(404).json({ msg: "Overheads entry not found" });
    }

    res.status(200).json({ msg: "Overheads entry updated", updatedOverheads });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE request to remove an Overheads entry by ID
OverheadsRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOverheads = await OverheadsModel.findByIdAndDelete(id);

    if (!deletedOverheads) {
      return res.status(404).json({ msg: "Overheads entry not found" });
    }

    res.status(200).json({ msg: "Overheads entry deleted", deletedOverheads });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = { OverheadsRouter };
