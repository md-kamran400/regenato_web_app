const { Router } = require("express");
const ManufacturingStacticModal = require("../../model/manufacturingmodelStatic");
const manufacturingStaticRouter = Router();

// POST request (already existing)
manufacturingStaticRouter.post("/", async (req, res) => {
    try {
        let manufacturing = new ManufacturingStacticModal(req.body);
        await manufacturing.save();
        res.status(200).json({ msg: "manufacturing Variable Added", addmanufacturing: manufacturing });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET request to retrieve all manufacturing data (already existing)
manufacturingStaticRouter.get("/", async (req, res) => {
    try {
        const allmanufacturing = await ManufacturingStacticModal.find();
        res.status(200).json(allmanufacturing);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT request to update a manufacturing entry by ID
manufacturingStaticRouter.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updatedmanufacturing = await ManufacturingStacticModal.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        if (!updatedmanufacturing) {
            return res.status(404).json({ msg: "manufacturing entry not found" });
        }

        res.status(200).json({ msg: "manufacturing entry updated", updatedmanufacturing });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE request to remove a manufacturing entry by ID
manufacturingStaticRouter.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedmanufacturing = await ManufacturingStacticModal.findByIdAndDelete(id);

        if (!deletedmanufacturing) {
            return res.status(404).json({ msg: "manufacturing entry not found" });
        }

        res.status(200).json({ msg: "manufacturing entry deleted", deletedmanufacturing });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = { manufacturingStaticRouter };
