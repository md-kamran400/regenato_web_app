const { Router } = require("express");
const InventoryModal = require("../../model/inventoryModal");

const InventoryRouter = Router();

// ✅ Create (POST)
InventoryRouter.post("/PostInventoryVaraibleVaraible", async (req, res) => {
  try {
    console.log("Received inventory data:", req.body);
    const newItem = new InventoryModal(req.body);
    await newItem.save();
    console.log("Inventory item saved successfully:", newItem);
    res.status(201).json({ message: "Inventory item created", data: newItem });
  } catch (error) {
    console.error("Error creating inventory item:", error);
    res.status(500).json({ message: "Error creating item", error: error.message });
  }
});

// ✅ Read (GET all)
InventoryRouter.get("/PostInventoryVaraible", async (req, res) => {
  try {
    const items = await InventoryModal.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching items", error: error.message });
  }
});

// ✅ Read (GET by ID)
InventoryRouter.get("/PostInventoryVaraible/:id", async (req, res) => {
  try {
    const item = await InventoryModal.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: "Error fetching item", error: error.message });
  }
});

// ✅ Update (PUT)
InventoryRouter.put("/PostInventoryVaraible/:id", async (req, res) => {
  try {
    const updatedItem = await InventoryModal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // return updated doc
    );
    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json({ message: "Item updated", data: updatedItem });
  } catch (error) {
    res.status(500).json({ message: "Error updating item", error: error.message });
  }
});

// ✅ Delete (DELETE)
InventoryRouter.delete("/PostInventoryVaraible/:id", async (req, res) => {
  try {
    const deletedItem = await InventoryModal.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json({ message: "Item deleted", data: deletedItem });
  } catch (error) {
    res.status(500).json({ message: "Error deleting item", error: error.message });
  }
});

module.exports = { InventoryRouter };
