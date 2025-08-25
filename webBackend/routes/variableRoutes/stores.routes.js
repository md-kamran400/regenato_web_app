const { Router } = require("express");
const StoreVariableModal = require("../../model/storemodel");
const storeVariableRouter = Router();

// Create a new store variable
storeVariableRouter.post("/", async (req, res) => {
  try {
    const storeVariable = new StoreVariableModal(req.body);
    await storeVariable.save();
    res.status(201).json(storeVariable);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all store variables
storeVariableRouter.get("/", async (req, res) => {
  try {
    const storeVariables = await StoreVariableModal.find();
    res.json(storeVariables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single store variable by _id
storeVariableRouter.get("/:id", async (req, res) => {
  try {
    const storeVariable = await StoreVariableModal.findById(req.params.id);
    if (!storeVariable)
      return res.status(404).json({ error: "Store variable not found" });
    res.json(storeVariable);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single store variable by categoryId
storeVariableRouter.get("/category/:categoryId", async (req, res) => {
  try {
    const storeVariable = await StoreVariableModal.findOne({
      categoryId: req.params.categoryId,
    });
    if (!storeVariable)
      return res.status(404).json({ error: "Store variable not found" });
    res.json(storeVariable);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Update a store variable by _id
storeVariableRouter.put("/:id", async (req, res) => {
  try {
    const storeVariable = await StoreVariableModal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!storeVariable)
      return res.status(404).json({ error: "Store variable not found" });
    res.json(storeVariable);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a store variable by _id
storeVariableRouter.delete("/:id", async (req, res) => {
  try {
    const storeVariable = await StoreVariableModal.findByIdAndDelete(req.params.id);
    if (!storeVariable)
      return res.status(404).json({ error: "Store variable not found" });
    res.json({ message: "Store variable deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = { storeVariableRouter };