const { Router } = require("express");
const GeneralModel = require("../../model/generalmodel");
const GeneralRouter = Router();

// POST request (already existing)
GeneralRouter.post("/", async (req, res) => {
    try {
        let General = new GeneralModel(req.body);
        await General.save();
        res.status(200).json({ msg: "General Variable Added", addGeneral: General });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET request to retrieve all General variables (already existing)
GeneralRouter.get("/", async (req, res) => {
    try {
        const allGeneral = await GeneralModel.find(); // Fetch all data from the collection
        res.status(200).json(allGeneral); // Respond with the fetched data
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT request to update a General variable by ID
GeneralRouter.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updatedGeneral = await GeneralModel.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        if (!updatedGeneral) {
            return res.status(404).json({ msg: "General variable not found" });
        }

        res.status(200).json({ msg: "General variable updated", updatedGeneral });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE request to remove a General variable by ID
GeneralRouter.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedGeneral = await GeneralModel.findByIdAndDelete(id);

        if (!deletedGeneral) {
            return res.status(404).json({ msg: "General variable not found" });
        }

        res.status(200).json({ msg: "General variable deleted", deletedGeneral });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = { GeneralRouter };
