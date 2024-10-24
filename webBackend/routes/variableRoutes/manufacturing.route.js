const { Router } = require("express");
const ManufacturingModel = require("../../model/manufacturingmodel");
const manufacturRouter = Router();

// POST request (already existing)
manufacturRouter.post("/", async (req, res) => {
    try {
        let Manufacture = new ManufacturingModel(req.body);
        await Manufacture.save();
        res.status(200).json({ msg: "Manufacturing variable Added", addManufacture: Manufacture });
    } catch (error) {
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
        const updatedManufacture = await ManufacturingModel.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        if (!updatedManufacture) {
            return res.status(404).json({ msg: "Manufacturing entry not found" });
        }

        res.status(200).json({ msg: "Manufacturing entry updated", updatedManufacture });
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

        res.status(200).json({ msg: "Manufacturing entry deleted", deletedManufacture });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = { manufacturRouter };
