const { Router } = require("express");
const InchargeVariableModal = require("../../model/inchargeVariable");
const inchargeVariableRouter = Router();

// Create a new incharge variable
inchargeVariableRouter.post("/", async (req, res) => {
  try {
    const inchargeVariable = new InchargeVariableModal(req.body);
    await inchargeVariable.save();
    res.status(201).json(inchargeVariable);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all incharge variables
inchargeVariableRouter.get("/", async (req, res) => {
  try {
    const inchargeVariables = await InchargeVariableModal.find();
    res.json(inchargeVariables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single incharge variable by _id
inchargeVariableRouter.get("/:id", async (req, res) => {
  try {
    const inchargeVariable = await InchargeVariableModal.findById(
      req.params.id
    );
    if (!inchargeVariable)
      return res.status(404).json({ error: "Incharge variable not found" });
    res.json(inchargeVariable);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an incharge variable by _id
inchargeVariableRouter.put("/:id", async (req, res) => {
  try {
    const inchargeVariable = await InchargeVariableModal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!inchargeVariable)
      return res.status(404).json({ error: "Incharge variable not found" });
    res.json(inchargeVariable);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete an incharge variable by _id
inchargeVariableRouter.delete("/:id", async (req, res) => {
  try {
    const inchargeVariable = await InchargeVariableModal.findByIdAndDelete(
      req.params.id
    );
    if (!inchargeVariable)
      return res.status(404).json({ error: "Incharge variable not found" });
    res.json({ message: "Incharge variable deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = { inchargeVariableRouter };
