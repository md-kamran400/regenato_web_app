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
    const { adjustmentQty, adjustmentType } = req.body;
 
    const storeVariable = await StoreVariableModal.findById(req.params.id);
    if (!storeVariable)
      return res.status(404).json({ error: "Store variable not found" });
 
    // Use current quantity
    const currentQuantity = storeVariable.quantity[0] || 0;
 
    let newQuantity = currentQuantity;
 
    if (adjustmentType === "+") {
      newQuantity = currentQuantity + Number(adjustmentQty || 0);
    } else if (adjustmentType === "-") {
      newQuantity = currentQuantity - Number(adjustmentQty || 0);
    }
 
    // Update fields
    storeVariable.quantity[0] = newQuantity;
    storeVariable.adjustmentQty = Number(adjustmentQty || 0);
    storeVariable.adjustmentType = adjustmentType;
 
    // Save updated document
    await storeVariable.save();
 
    res.json({
      message: "Quantity updated successfully",
      previousQuantity: currentQuantity,
      adjustmentType,
      adjustmentQty,
      newQuantity,
      storeVariable,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update warehouse quantity by adding additional quantity
storeVariableRouter.put("/:id/quantity", async (req, res) => {
  try {
    const { additionalQuantity } = req.body;
    
    if (additionalQuantity === undefined || additionalQuantity < 0) {
      return res.status(400).json({ error: "Valid additional quantity is required" });
    }

    const storeVariable = await StoreVariableModal.findById(req.params.id);
    if (!storeVariable) {
      return res.status(404).json({ error: "Store variable not found" });
    }

    // Update the first quantity in the array (assuming single quantity per warehouse)
    const currentQuantity = storeVariable.quantity[0] || 0;
    storeVariable.quantity[0] = currentQuantity + Number(additionalQuantity);

    await storeVariable.save();

    res.json({
      message: "Warehouse quantity updated successfully",
      warehouse: storeVariable.Name[0],
      previousQuantity: currentQuantity,
      additionalQuantity: Number(additionalQuantity),
      newQuantity: storeVariable.quantity[0],
      storeVariable
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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