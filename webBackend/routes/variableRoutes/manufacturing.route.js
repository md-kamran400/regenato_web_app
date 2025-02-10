const { Router } = require("express");
const ManufacturingModel = require("../../model/manufacturingmodel");
const manufacturRouter = Router();+

// POST request (already existing)
// manufacturRouter.post("/", async (req, res) => {
//   try {
//     let Manufacture = new ManufacturingModel(req.body);
//     await Manufacture.save();
//     res.status(200).json({
//       msg: "Manufacturing variable Added",
//       addManufacture: Manufacture,
//     });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });
manufacturRouter.post("/", async (req, res) => {
  try {
    // Check if the categoryId already exists
    const existingManufacture = await ManufacturingModel.findOne({
      categoryId: req.body.categoryId,
    });

    if (existingManufacture) {
      return res.status(409).json({
        error: "Category ID already exists",
        message: "Please choose a different Category ID",
      });
    }

    let Manufacture = new ManufacturingModel(req.body);
    await Manufacture.save();

    res.status(201).json({
      msg: "Manufacturing variable Added",
      addManufacture: Manufacture,
      message: "New manufacturing variable created successfully",
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
    const updatedManufacture = await ManufacturingModel.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedManufacture) {
      return res.status(404).json({ msg: "Manufacturing entry not found" });
    }

    res
      .status(200)
      .json({ msg: "Manufacturing entry updated", updatedManufacture });
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

    res
      .status(200)
      .json({ msg: "Manufacturing entry deleted", deletedManufacture });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add a subcategory to a specific manufacturing entry
manufacturRouter.post("/:id/subcategories", async (req, res) => {
  try {
    const { id } = req.params;
    const { subcategoryId, name, hourlyRate } = req.body;

    // Validate required fields
    if (!subcategoryId || !name || hourlyRate === undefined) {
      return res.status(400).json({
        msg: "Fields (subcategoryId, name, and hourlyRate) are required.",
      });
    }

    // Find the manufacturing entry by ID
    const manufacturingEntry = await ManufacturingModel.findById(id);
    if (!manufacturingEntry) {
      return res.status(404).json({ msg: "Manufacturing entry not found" });
    }

    // Check for duplicate subcategoryId in existing subcategories
    const isDuplicate = manufacturingEntry.subCategories.some(
      (sub) => sub.subcategoryId === subcategoryId
    );

    if (isDuplicate) {
      return res.status(400).json({
        msg: "Subcategory ID already exists. Please provide a unique subcategoryId.",
      });
    }

    // Create a new subcategory object with default values for missing fields
    const subCategory = {
      subcategoryId,
      name,
      hours: 0, // Default value
      hourlyRate,
      totalRate: 0, // Default value
    };

    // Add the subcategory to the manufacturing entry
    manufacturingEntry.subCategories.push(subCategory);

    // Save the updated entry
    await manufacturingEntry.save();

    res.status(200).json({
      msg: "Subcategory added",
      updatedManufacture: manufacturingEntry,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//edit a subcategory to a specific manufacturing entry
manufacturRouter.put("/:id/subcategories/:subId", async (req, res) => {
  try {
    const { id, subId } = req.params; // manufacturing entry ID and subcategory ID
    const updateData = req.body; // updated data for the subcategory

    // Find the manufacturing entry by ID
    const manufacturingEntry = await ManufacturingModel.findById(id);
    if (!manufacturingEntry) {
      return res.status(404).json({ msg: "Manufacturing entry not found" });
    }

    // Find the index of the subcategory to be updated
    const subCategoryIndex = manufacturingEntry.subCategories.findIndex(
      (sub) => sub._id.toString() === subId
    );

    if (subCategoryIndex === -1) {
      return res.status(404).json({ msg: "Subcategory not found" });
    }

    // Update the subcategory data
    Object.assign(
      manufacturingEntry.subCategories[subCategoryIndex],
      updateData
    );

    // Save the updated manufacturing entry
    await manufacturingEntry.save();

    res.status(200).json({
      msg: "Subcategory updated",
      updatedManufacture: manufacturingEntry,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//delete a subcategory to a specific manufacturing entry
manufacturRouter.delete("/:id/subcategories/:subId", async (req, res) => {
  try {
    const { id, subId } = req.params; // manufacturing entry ID and subcategory ID

    // Find the manufacturing entry by ID
    const manufacturingEntry = await ManufacturingModel.findById(id);
    if (!manufacturingEntry) {
      return res.status(404).json({ msg: "Manufacturing entry not found" });
    }

    // Find the index of the subcategory to be deleted
    const subCategoryIndex = manufacturingEntry.subCategories.findIndex(
      (sub) => sub._id.toString() === subId
    );

    if (subCategoryIndex === -1) {
      return res.status(404).json({ msg: "Subcategory not found" });
    }

    // Remove the subcategory from the array
    manufacturingEntry.subCategories.splice(subCategoryIndex, 1);

    // Save the updated manufacturing entry
    await manufacturingEntry.save();

    res.status(200).json({
      msg: "Subcategory deleted",
      updatedManufacture: manufacturingEntry,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// manufacturRouter.get("/category/:categoryId", async (req, res) => {
//   try {
//     const { categoryId } = req.params;
    
//     // Find manufacturing entry by categoryId
//     const manufacturingEntry = await ManufacturingModel.findOne({ categoryId });

//     if (!manufacturingEntry) {
//       return res.status(404).json({ msg: "Manufacturing entry not found" });
//     }

//     res.status(200).json({
//       msg: "Manufacturing entry retrieved",
//       manufacturingEntry,
//     });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

manufacturRouter.get("/category/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Find manufacturing entry by categoryId
    const manufacturingEntry = await ManufacturingModel.findOne({ categoryId });

    if (!manufacturingEntry) {
      return res.status(404).json({ msg: "Manufacturing entry not found" });
    }

    // Return only subCategories
    res.status(200).json({
      msg: "Subcategories retrieved",
      subCategories: manufacturingEntry.subCategories,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Add this new route after the existing ones

// GET request to retrieve all category IDs
manufacturRouter.get("/all-category-ids", async (req, res) => {
  try {
    const allCategoryIds = await ManufacturingModel.distinct('categoryId');
    
    if (allCategoryIds.length === 0) {
      return res.status(404).json({
        msg: "No categories found",
      });
    }

    res.status(200).json({
      msg: "All category IDs retrieved successfully",
      categoryIds: allCategoryIds,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = { manufacturRouter };
