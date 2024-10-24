const { Router } = require("express");
const RmVariableModel = require("../../model/rmmodel");
const RmRouter = Router();

// POST request to create a new RM variable (already existing)
RmRouter.post("/", async (req, res) => {
    try {
        let Rmvar = new RmVariableModel(req.body);
        await Rmvar.save();
        res.status(200).json({ msg: "RM Variable Added", addRmvar: Rmvar });
    } catch (error) {
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
