const { Router } = require("express");
const RmVariableModel = require("../../model/rmmodel");
const RmRouter = Router();

// POST request to create a new RM variable (already existing)
// RmRouter.post("/", async (req, res) => {
//     try {
//         let Rmvar = new RmVariableModel(req.body);
//         await Rmvar.save();
//         res.status(200).json({ msg: "RM Variable Added", addRmvar: Rmvar });
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// });

RmRouter.post("/", async (req, res) => {
  try {
    // Check if the categoryId already exists
    const existingRmvar = await RmVariableModel.findOne({
      categoryId: req.body.categoryId,
    });

    if (existingRmvar) {
      return res.status(409).json({
        error: "Category ID already exists",
        message: "Please choose a different Category ID",
      });
    }

    let Rmvar = new RmVariableModel(req.body);
    await Rmvar.save();

    res.status(201).json({
      msg: "RM Variable Added",
      addRmvar: Rmvar,
      message: "New RM variable created successfully",
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

// GET request to retrieve all RM variables (already existing)
RmRouter.get("/", async (req, res) => {
  try {
    const allRmVariables = await RmVariableModel.find();
    res.status(200).json(allRmVariables);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// NEW: PUT request to update an RM variable by ID
RmRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedRmvar = await RmVariableModel.findByIdAndUpdate(id, req.body, {
      new: true, // return the updated document
      runValidators: true, // validate the update against the schema
    });

    if (!updatedRmvar) {
      return res.status(404).json({ msg: "RM Variable not found" });
    }

    res.status(200).json({ msg: "RM Variable Updated", updatedRmvar });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// NEW: DELETE request to remove an RM variable by ID
RmRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRmvar = await RmVariableModel.findByIdAndDelete(id);

    if (!deletedRmvar) {
      return res.status(404).json({ msg: "RM Variable not found" });
    }

    res.status(200).json({ msg: "RM Variable Deleted", deletedRmvar });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = { RmRouter };
