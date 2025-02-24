const express = require("express");
const mongoose = require("mongoose");
const partproject = express.Router();
const PartListProjectModel = require("../model/project/PartListProjectModel");

// ============================================ PART-LIST CODE START ===============================
// Create a new project with a parts list named after the project
partproject.post("/projects", async (req, res) => {
  try {
    const { projectName, costPerUnit, timePerUnit, stockPoQty, projectType } =
      req.body;

    // Creating a new project with a parts list named after the project
    const newProject = new PartListProjectModel({
      projectName,
      costPerUnit,
      timePerUnit,
      stockPoQty,
      projectType,
      partsLists: [
        { partsListName: `${projectName}-Parts`, partsListItems: [] },
      ],
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add this new route after the existing POST route
partproject.get("/projects", async (req, res) => {
  try {
    const projects = await PartListProjectModel.find();
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single project by ID
// partproject.get("/projects/:id", async (req, res) => {
//   try {
//     const projectId = req.params.id;

//     if (!mongoose.Types.ObjectId.isValid(projectId)) {
//       return res.status(400).json({ error: "Invalid project ID format" });
//     }

//     const project = await PartListProjectModel.findById(projectId);
//     if (!project) {
//       return res.status(404).json({ error: "Project not found" });
//     }

//     res.status(200).json(project);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// Get a single project by ID
// partproject.get("/projects/:id", async (req, res) => {
//   try {
//     const projectId = req.params.id;

//     if (!mongoose.Types.ObjectId.isValid(projectId)) {
//       return res.status(400).json({ error: "Invalid project ID format" });
//     }

//     const project = await PartListProjectModel.findById(projectId);
//     if (!project) {
//       return res.status(404).json({ error: "Project not found" });
//     }

//     // Calculate total cost and total hours for each parts list
//     let totalProjectCost = 0;
//     let totalProjectHours = 0;

//     project.partsLists.forEach((partsList) => {
//       partsList.partsListItems.forEach((item) => {
//         const itemTotalCost = item.costPerUnit * item.quantity;
//         const itemTotalHours = item.timePerUnit * item.quantity;

//         totalProjectCost += itemTotalCost;
//         totalProjectHours += itemTotalHours;
//       });
//     });

//     // Store calculated values in the project document
//     project.costPerUnit = totalProjectCost;
//     project.timePerUnit = totalProjectHours;

//     // Save the changes to the database
//     await project.save();

//     res.status(200).json(project);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// Get a single project by ID

partproject.get("/projects/:id", async (req, res) => {
  try {
    const projectId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ error: "Invalid project ID format" });
    }

    const project = await PartListProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Calculate total cost and total hours for each parts list
    let totalProjectCost = 0;
    let totalProjectHours = 0;
    const machineHours = {};

    project.partsLists.forEach((partsList) => {
      partsList.partsListItems.forEach((item) => {
        const itemTotalCost = item.costPerUnit * item.quantity;
        const itemTotalHours = item.timePerUnit * item.quantity;

        totalProjectCost += itemTotalCost;
        totalProjectHours += itemTotalHours;

        // Calculate individual machine hours
        item.manufacturingVariables.forEach((machine) => {
          const machineName = machine.name;
          const totalHours = machine.hours * item.quantity;
          machineHours[machineName] =
            (machineHours[machineName] || 0) + totalHours;
        });
      });
    });

    // Update the project document with calculated values
    project.costPerUnit = totalProjectCost;
    project.timePerUnit = totalProjectHours;
    project.machineHours = machineHours;

    // Save the changes to the database
    await project.save();

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// create a put on the project id on the projectName
partproject.put("/projects/:id", async (req, res) => {
  try {
    const { projectName } = req.body;
    console.log("Updating project with ID:", req.params.id);
    console.log("New project name:", projectName);

    if (!projectName) {
      return res.status(400).json({ error: "projectName is required" });
    }

    const updatedProject = await PartListProjectModel.findByIdAndUpdate(
      req.params.id,
      { projectName, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.status(200).json(updatedProject);
  } catch (error) {
    console.error("Error updating project:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

// Route to duplicate a project
partproject.post("/projects/:id/duplicate", async (req, res) => {
  try {
    const projectId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ error: "Invalid project ID format" });
    }

    const originalProject = await PartListProjectModel.findById(projectId);
    if (!originalProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Create a new project with the same data as the original, including machineHours
    const newProject = new PartListProjectModel({
      projectName: `${originalProject.projectName} (Copy)`,
      costPerUnit: originalProject.costPerUnit,
      timePerUnit: originalProject.timePerUnit,
      stockPoQty: originalProject.stockPoQty,
      projectType: originalProject.projectType,
      partsLists: originalProject.partsLists.map((partsList) => ({
        partsListName: `${partsList.partsListName} (Copy)`,
        partsListItems: partsList.partsListItems,
      })),
      subAssemblyListFirst: originalProject.subAssemblyListFirst, // Copy sub-assemblies
      assemblyList: originalProject.assemblyList, // Copy assemblies
      machineHours: { ...originalProject.machineHours }, // Fix: Copy machineHours
    });

    await newProject.save();

    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to remove a project
partproject.delete("/projects/:id", async (req, res) => {
  try {
    const projectId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ error: "Invalid project ID format" });
    }

    const deletedProject = await PartListProjectModel.findByIdAndDelete(
      projectId
    );
    if (!deletedProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.status(200).json({
      status: "success",
      message: "Project deleted successfully",
      data: deletedProject,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//get all part list form the project
partproject.get("/projects/:id/partsLists", async (req, res) => {
  try {
    const projectId = req.params.id;

    const project = await PartListProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.status(200).json(project.partsLists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//post the partlist item like base,ram
partproject.post(
  "/projects/:projectId/partsLists/:listId/items",
  async (req, res) => {
    try {
      const { projectId, listId } = req.params;

      // Validate project ID
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid project ID format" });
      }

      // Find the project by ID
      const project = await PartListProjectModel.findById(projectId);
      if (!project) {
        return res
          .status(404)
          .json({ status: "error", message: "Project not found" });
      }

      // Find the parts list by ID
      const partsList = project.partsLists.id(listId);
      if (!partsList) {
        return res
          .status(404)
          .json({ status: "error", message: "Parts list not found" });
      }

      // Validate request body
      const {
        partId,
        partName,
        costPerUnit,
        timePerUnit,
        quantity,
        rmVariables,
        manufacturingVariables,
        shipmentVariables,
        overheadsAndProfits,
        codeName,
      } = req.body;

      // if (!partId || !partName || !costPerUnit || !timePerUnit || !quantity) {
      //   return res.status(400).json({
      //     status: "error",
      //     message:
      //       "Missing required fields: partId, partName, costPerUnit, timePerUnit, or quantity",
      //   });
      // }

      // Add the new part to the parts list
      const newPart = {
        Uid: partId,
        partName,
        codeName: codeName || "", // Default to empty string if not provided
        costPerUnit,
        timePerUnit,
        quantity,
        rmVariables: rmVariables || [],
        manufacturingVariables: manufacturingVariables || [],
        shipmentVariables: shipmentVariables || [],
        overheadsAndProfits: overheadsAndProfits || [],
      };

      partsList.partsListItems.push(newPart);

      // Save the updated project
      const updatedProject = await project.save();

      res.status(200).json({
        status: "success",
        message: "Part added successfully",
        data: updatedProject,
      });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }
);

//put request for quentitiy
// Route to update part quantity
partproject.put(
  "/projects/:projectId/partsLists/:listId/items/:itemId/quantity",
  async (req, res) => {
    try {
      const { projectId, listId, itemId } = req.params;

      // Validate project ID
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ error: "Invalid project ID format" });
      }

      // Find the project by ID
      const project = await PartListProjectModel.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Find the parts list by ID
      const partsList = project.partsLists.id(listId);
      if (!partsList) {
        return res.status(404).json({ error: "Parts list not found" });
      }

      // Find the item in the parts list
      const item = partsList.partsListItems.id(itemId);
      if (!item) {
        return res.status(404).json({ error: "Item not found in parts list" });
      }

      // Update only the quantity
      item.quantity = req.body.quantity;

      // Save the updated project
      const updatedProject = await project.save();

      res.status(200).json({
        status: "success",
        message: "Part quantity updated successfully",
        data: {
          projectId,
          listId,
          itemId,
          updatedQuantity: item.quantity,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

//get the partlist item like base,ram
partproject.get(
  "/projects/:projectId/partsLists/:listId/items",
  async (req, res) => {
    try {
      const { projectId, listId } = req.params;

      // Validate project ID
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid project ID format" });
      }

      // Find the project by ID
      const project = await PartListProjectModel.findById(projectId);
      if (!project) {
        return res
          .status(404)
          .json({ status: "error", message: "Project not found" });
      }

      // Find the parts list by ID
      const partsList = project.partsLists.id(listId);
      if (!partsList) {
        return res
          .status(404)
          .json({ status: "error", message: "Parts list not found" });
      }

      // Send the parts list items
      res.status(200).json({
        status: "success",
        message: "Parts list items retrieved successfully",
        data: partsList.partsListItems,
      });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }
);

// Route to update partsListName
partproject.put("/projects/:projectId/partsLists/:listId", async (req, res) => {
  try {
    const { projectId, listId } = req.params;

    // Validate project ID
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ error: "Invalid project ID format" });
    }

    // Find the project by ID
    const project = await PartListProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Find the parts list by ID
    const partsList = project.partsLists.id(listId);
    if (!partsList) {
      return res.status(404).json({ error: "Parts list not found" });
    }

    // Update partsListName
    partsList.partsListName = req.body.partsListName || partsList.partsListName;

    // Save the updated project
    const updatedProject = await project.save();

    res.status(200).json({
      status: "success",
      message: "Parts list name updated successfully",
      data: updatedProject,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to delete part list item
partproject.delete(
  "/projects/:projectId/partsLists/:listId/items/:itemId",
  async (req, res) => {
    try {
      const { projectId, listId, itemId } = req.params;

      // Validate project ID
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ error: "Invalid project ID format" });
      }

      // Find the project by ID
      const project = await PartListProjectModel.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Find the parts list by ID
      const partsList = project.partsLists.id(listId);
      if (!partsList) {
        return res.status(404).json({ error: "Parts list not found" });
      }

      // Find and remove the item from partsListItems array
      const index = partsList.partsListItems.findIndex(
        (item) => item._id.toString() === itemId
      );
      if (index === -1) {
        return res.status(404).json({ error: "Item not found in parts list" });
      }
      partsList.partsListItems.splice(index, 1);

      // Save the updated project
      const updatedProject = await project.save();

      res.status(200).json({
        status: "success",
        message: "Part list item deleted successfully",
        data: updatedProject,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

//=== partlist dynamic put request do not touch ==========
partproject.put(
  "/projects/:projectId/partsLists/:partsListId/items/:itemId/:variableType/:variableId",
  async (req, res) => {
    const { projectId, partsListId, itemId, variableType, variableId } =
      req.params;
    const updateData = req.body;

    // Allowed variable types for safety
    const allowedTypes = [
      "rmVariables",
      "manufacturingVariables",
      "shipmentVariables",
      "overheadsAndProfits",
    ];

    // Check if the provided variableType is valid
    if (!allowedTypes.includes(variableType)) {
      return res.status(400).json({ message: "Invalid variable type" });
    }

    try {
      // Find the project and required partsList
      const project = await PartListProjectModel.findOne({
        _id: projectId,
        "partsLists._id": partsListId,
      });

      if (!project) {
        return res
          .status(404)
          .json({ message: "Project or PartsList not found" });
      }

      // Locate the partsList
      const partsList = project.partsLists.find(
        (list) => list._id.toString() === partsListId
      );

      if (!partsList) {
        return res.status(404).json({ message: "PartsList not found" });
      }

      // Locate the item within the partsList
      const item = partsList.partsListItems.find(
        (part) => part._id.toString() === itemId
      );

      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      // Locate the variable within the item
      const variable = item[variableType].find(
        (v) => v._id.toString() === variableId
      );

      if (!variable) {
        return res
          .status(404)
          .json({ message: `${variableType} entry not found` });
      }

      // Update the fields dynamically
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] !== undefined) {
          variable[key] = updateData[key];
        }
      });

      // Save the updated project
      await project.save();

      res.status(200).json({
        message: `${variableType} updated successfully`,
        updatedVariable: variable,
      });
    } catch (error) {
      res.status(500).json({ message: "An error occurred", error });
    }
  }
);
//  ==== partlist dynamic put request do not touch =====

// ============================================ PART-LIST CODE START ===============================

// ============================================ SUB-ASSEMBLY CODE START ===============================
// Route to add a new subAssemblyListFirst item
// partproject.post(
//   "/projects/:projectId/subAssemblyListFirst",
//   async (req, res) => {
//     try {
//       const { projectId } = req.params;

//       if (!mongoose.Types.ObjectId.isValid(projectId)) {
//         return res.status(400).json({ error: "Invalid project ID format" });
//       }

//       const project = await PartListProjectModel.findById(projectId);
//       if (!project) {
//         return res.status(404).json({ error: "Project not found" });
//       }

//       // Fix: Using a plain object instead of trying to instantiate a schema
//       const newSubAssemblyList = {
//         subAssemblyListName:
//           req.body.subAssemblyListName || "Unnamed Sub Assembly List",
//       };

//       project.subAssemblyListFirst.push(newSubAssemblyList);
//       await project.save();

//       res.status(201).json({
//         status: "success",
//         message: "New sub assembly list added successfully",
//         data: newSubAssemblyList,
//       });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   }
// );

// Route to get all subAssemblyListFirst items
partproject.get(
  "/projects/:projectId/subAssemblyListFirst",
  async (req, res) => {
    try {
      const { projectId } = req.params;

      // Validate project ID
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ error: "Invalid project ID format" });
      }

      // Find the project by ID
      const project = await PartListProjectModel.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Send the subAssemblyListFirst items
      res.status(200).json({
        status: "success",
        message: "Sub assembly lists retrieved successfully",
        data: project.subAssemblyListFirst,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ============================================ SUB-ASSEMBLY CODE END ===============================

// ============================================ ASSEMBLY CODE START ===============================
// Route to add a new assemblyPartsList item
// Route to add a new Assembly Part List item
partproject.post(
  "/projects/:projectId/assemblyPartsLists",
  async (req, res) => {
    try {
      const { projectId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ error: "Invalid project ID format" });
      }

      const project = await PartListProjectModel.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Fix: Using a plain object instead of schema instantiation
      const newAssemblyPartList = {
        assemblyListName:
          req.body.assemblyListName || "Unnamed Assembly Part List",
      };

      project.assemblyPartsLists.push(newAssemblyPartList);
      await project.save();

      res.status(201).json({
        status: "success",
        message: "New assembly part list added successfully",
        data: newAssemblyPartList,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Route to get all Assembly Part List items
partproject.get("/projects/:projectId/assemblyPartsLists", async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ error: "Invalid project ID format" });
    }

    const project = await PartListProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.status(200).json({
      status: "success",
      message: "Assembly part lists retrieved successfully",
      data: project.assemblyPartsLists,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================ ASSEMBLY CODE START ===============================
// sub assmebly code start from here
partproject.post("/projects/:_id/subAssemblyListFirst", async (req, res) => {
  const { _id } = req.params;
  const {
    subAssemblyName,
    SubAssemblyNumber,
    costPerUnit,
    timePerUnit,
    partsListItems,
  } = req.body;

  try {
    const project = await PartListProjectModel.findById(_id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const newSubAssemblyList = {
      subAssemblyName,
      SubAssemblyNumber,
      costPerUnit,
      timePerUnit,
      partsListItems,
    };

    project.subAssemblyListFirst.push(newSubAssemblyList);
    const updatedProject = await project.save();
    res.status(200).json(updatedProject);
  } catch (error) {
    console.error(error); // Add this line to log errors
    res.status(500).json({ message: error.message });
  }
});

partproject.delete(
  "/projects/:projectId/subAssemblyListFirst/:subAssemblyId",
  async (req, res) => {
    const { projectId, subAssemblyId } = req.params;

    try {
      // Validate project ID
      if (
        !mongoose.Types.ObjectId.isValid(projectId) ||
        !mongoose.Types.ObjectId.isValid(subAssemblyId)
      ) {
        return res
          .status(400)
          .json({ error: "Invalid project ID or subAssembly ID format" });
      }

      // Find the project and remove the subAssemblyListFirst item
      const project = await PartListProjectModel.findByIdAndUpdate(
        projectId,
        { $pull: { subAssemblyListFirst: { _id: subAssemblyId } } },
        { new: true }
      );

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.status(200).json({
        status: "success",
        message: "subAssemblyListFirst item deleted successfully",
        data: project,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "An error occurred while deleting the subAssemblyListFirst item",
      });
    }
  }
);

partproject.post(
  "/projects/:projectId/subAssemblyListFirst/:subAssemblyId/items",
  async (req, res) => {
    const { projectId, subAssemblyId } = req.params;
    const {
      partName,
      codeName,
      costPerUnit,
      timePerUnit,
      quantity,
      rmVariables,
      manufacturingVariables,
      shipmentVariables,
      overheadsAndProfits,
    } = req.body;

    try {
      // Validate project ID
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ error: "Invalid project ID format" });
      }

      // Find the project and the specific sub-assembly list
      const project = await PartListProjectModel.findOne({
        _id: projectId,
        "subAssemblyListFirst._id": subAssemblyId,
      });

      if (!project) {
        return res
          .status(404)
          .json({ error: "Project or SubAssemblyListFirst not found" });
      }

      // Find the specific sub-assembly list
      const subAssemblyList = project.subAssemblyListFirst.find(
        (item) => item._id.toString() === subAssemblyId
      );

      if (!subAssemblyList) {
        return res
          .status(404)
          .json({ error: "SubAssemblyListFirst item not found" });
      }

      // Create a new part item
      const newPartItem = {
        partName,
        codeName,
        costPerUnit,
        timePerUnit,
        quantity,
        rmVariables: rmVariables || [],
        manufacturingVariables: manufacturingVariables || [],
        shipmentVariables: shipmentVariables || [],
        overheadsAndProfits: overheadsAndProfits || [],
      };

      // Add the new part item to the partsListItems array
      subAssemblyList.partsListItems.push(newPartItem);

      // Save the updated project
      const updatedProject = await project.save();

      res.status(201).json({
        status: "success",
        message: "New part item added successfully",
        data: updatedProject.subAssemblyListFirst.find(
          (item) => item._id.toString() === subAssemblyId
        ),
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while adding the part item" });
    }
  }
);

// Add this new route after the existing GET route for projects

// edit for this
partproject.put(
  "/projects/:projectId/subAssemblyListFirst/:subAssemblyListFirstId",
  async (req, res) => {
    const { projectId, subAssemblyListFirstId } = req.params;
    const { subAssemblyName } = req.body;

    try {
      const project = await PartListProjectModel.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const subAssembly = project.subAssemblyListFirst.id(
        subAssemblyListFirstId
      );
      if (!subAssembly) {
        return res.status(404).json({ message: "Sub-assembly not found" });
      }

      // Update the subAssemblyName
      subAssembly.subAssemblyName = subAssemblyName;

      // Save the entire project back to the database
      await project.save();

      res
        .status(200)
        .json({ message: "Sub-assembly updated successfully", project });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// put the quanity for sub assmebly
partproject.put(
  "/projects/:projectId/subAssembly/:subAssemblyId/part/:partId",
  async (req, res) => {
    try {
      const { projectId, subAssemblyId, partId } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity < 0) {
        return res.status(400).json({ message: "Invalid quantity" });
      }

      const project = await PartListProjectModel.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Find the specific sub-assembly
      const subAssembly = project.subAssemblyListFirst.id(subAssemblyId);
      if (!subAssembly) {
        return res.status(404).json({ message: "SubAssembly not found" });
      }

      // Find the part inside the sub-assembly
      const part = subAssembly.partsListItems.id(partId);
      if (!part) {
        return res.status(404).json({ message: "Part not found" });
      }

      // Update the quantity
      part.quantity = quantity;

      await project.save();

      res
        .status(200)
        .json({ message: "Quantity updated successfully", project });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// delete for parts
partproject.delete(
  "/projects/:projectId/subAssembly/:subAssemblyId/part/:partId",
  async (req, res) => {
    try {
      const { projectId, subAssemblyId, partId } = req.params;

      const project = await PartListProjectModel.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Find the specific sub-assembly
      const subAssembly = project.subAssemblyListFirst.id(subAssemblyId);
      if (!subAssembly) {
        return res.status(404).json({ message: "SubAssembly not found" });
      }

      // Find and remove the part inside the sub-assembly
      const partIndex = subAssembly.partsListItems.findIndex(
        (part) => part._id.toString() === partId
      );
      if (partIndex === -1) {
        return res.status(404).json({ message: "Part not found" });
      }

      subAssembly.partsListItems.splice(partIndex, 1);

      await project.save();

      res.status(200).json({ message: "Part deleted successfully", project });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);
// Add this new route after the existing POST route
partproject.put(
  "/projects/:projectId/subAssemblyListFirst/:subAssemblyId/items/:itemId/rmVariables/:rmVariableId",
  async (req, res) => {
    const { projectId, subAssemblyId, itemId, rmVariableId } = req.params;
    const { name, netWeight, pricePerKg, totalRate } = req.body;

    try {
      // Validate project ID
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ error: "Invalid project ID format" });
      }

      // Find the project and the specific sub-assembly list
      const project = await PartListProjectModel.findOne({
        _id: projectId,
        "subAssemblyListFirst._id": subAssemblyId,
      });

      if (!project) {
        return res
          .status(404)
          .json({ error: "Project or SubAssemblyListFirst not found" });
      }

      // Find the specific sub-assembly list
      const subAssemblyList = project.subAssemblyListFirst.find(
        (item) => item._id.toString() === subAssemblyId
      );

      if (!subAssemblyList) {
        return res
          .status(404)
          .json({ error: "SubAssemblyListFirst item not found" });
      }

      // Find the item in the partsListItems array
      const item = subAssemblyList.partsListItems.find(
        (item) => item._id.toString() === itemId
      );

      if (!item) {
        return res
          .status(404)
          .json({ error: "Item not found in partsListItems" });
      }

      // Find the specific rmVariable in the rmVariables array
      const rmVariable = item.rmVariables.find(
        (v) => v._id.toString() === rmVariableId
      );

      if (!rmVariable) {
        return res
          .status(404)
          .json({ error: "RM Variable not found in rmVariables" });
      }

      // Update the rmVariable
      rmVariable.name = name || rmVariable.name;
      rmVariable.netWeight = netWeight || rmVariable.netWeight;
      rmVariable.pricePerKg = pricePerKg || rmVariable.pricePerKg;
      rmVariable.totalRate = totalRate || rmVariable.totalRate;

      // Save the updated project
      const updatedProject = await project.save();

      res.status(200).json({
        status: "success",
        message: "RM Variable updated successfully",
        data: updatedProject.subAssemblyListFirst
          .find((item) => item._id.toString() === subAssemblyId)
          .partsListItems.find((i) => i._id.toString() === itemId)
          .rmVariables.find((v) => v._id.toString() === rmVariableId),
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while updating the RM Variable" });
    }
  }
);

// Add this new route after the existing routes
partproject.put(
  "/projects/:projectId/subAssemblyListFirst/:subAssemblyId/items/:itemId/manufacturingVariables/:manufacturingVariableId",
  async (req, res) => {
    const { projectId, subAssemblyId, itemId, manufacturingVariableId } =
      req.params;
    const { name, hours, times, hourlyRate, totalRate } = req.body;

    try {
      // Validate project ID
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ error: "Invalid project ID format" });
      }

      // Find the project and the specific sub-assembly list
      const project = await PartListProjectModel.findOne({
        _id: projectId,
        "subAssemblyListFirst._id": subAssemblyId,
      });

      if (!project) {
        return res
          .status(404)
          .json({ error: "Project or SubAssemblyListFirst not found" });
      }

      // Find the specific sub-assembly list
      const subAssemblyList = project.subAssemblyListFirst.find(
        (item) => item._id.toString() === subAssemblyId
      );

      if (!subAssemblyList) {
        return res
          .status(404)
          .json({ error: "SubAssemblyListFirst item not found" });
      }

      // Find the item in the partsListItems array
      const item = subAssemblyList.partsListItems.find(
        (item) => item._id.toString() === itemId
      );

      if (!item) {
        return res
          .status(404)
          .json({ error: "Item not found in partsListItems" });
      }

      // Find the specific manufacturingVariable in the manufacturingVariables array
      const manufacturingVariable = item.manufacturingVariables.find(
        (v) => v._id.toString() === manufacturingVariableId
      );

      if (!manufacturingVariable) {
        return res.status(404).json({
          error: "Manufacturing Variable not found in manufacturingVariables",
        });
      }

      // Update the manufacturingVariable
      manufacturingVariable.name = name || manufacturingVariable.name;
      manufacturingVariable.hours = hours || manufacturingVariable.hours;
      manufacturingVariable.times = times || manufacturingVariable.times;
      manufacturingVariable.hourlyRate =
        hourlyRate || manufacturingVariable.hourlyRate;
      manufacturingVariable.totalRate =
        totalRate || manufacturingVariable.totalRate;

      // Save the updated project
      const updatedProject = await project.save();

      res.status(200).json({
        status: "success",
        message: "Manufacturing Variable updated successfully",
        data: updatedProject.subAssemblyListFirst
          .find((item) => item._id.toString() === subAssemblyId)
          .partsListItems.find((i) => i._id.toString() === itemId)
          .manufacturingVariables.find(
            (v) => v._id.toString() === manufacturingVariableId
          ),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "An error occurred while updating the Manufacturing Variable",
      });
    }
  }
);

// Shipment Variables Update Route
partproject.put(
  "/projects/:projectId/subAssemblyListFirst/:subAssemblyId/items/:itemId/shipmentVariables/:shipmentVariableId",
  async (req, res) => {
    const { projectId, subAssemblyId, itemId, shipmentVariableId } = req.params;
    const { name, hourlyRate, totalRate } = req.body;

    try {
      // Validate project ID
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ error: "Invalid project ID format" });
      }

      // Find the project and the specific sub-assembly list
      const project = await PartListProjectModel.findOne({
        _id: projectId,
        "subAssemblyListFirst._id": subAssemblyId,
      });

      if (!project) {
        return res
          .status(404)
          .json({ error: "Project or SubAssemblyListFirst not found" });
      }

      // Find the specific sub-assembly list
      const subAssemblyList = project.subAssemblyListFirst.find(
        (item) => item._id.toString() === subAssemblyId
      );

      if (!subAssemblyList) {
        return res
          .status(404)
          .json({ error: "SubAssemblyListFirst item not found" });
      }

      // Find the item in the partsListItems array
      const item = subAssemblyList.partsListItems.find(
        (item) => item._id.toString() === itemId
      );

      if (!item) {
        return res
          .status(404)
          .json({ error: "Item not found in partsListItems" });
      }

      // Find the specific shipmentVariable in the shipmentVariables array
      const shipmentVariable = item.shipmentVariables.find(
        (v) => v._id.toString() === shipmentVariableId
      );

      if (!shipmentVariable) {
        return res
          .status(404)
          .json({ error: "Shipment Variable not found in shipmentVariables" });
      }

      // Update the shipmentVariable
      shipmentVariable.name = name || shipmentVariable.name;
      shipmentVariable.hourlyRate = hourlyRate || shipmentVariable.hourlyRate;
      shipmentVariable.totalRate = totalRate || shipmentVariable.totalRate;

      // Save the updated project
      const updatedProject = await project.save();

      res.status(200).json({
        status: "success",
        message: "Shipment Variable updated successfully",
        data: updatedProject.subAssemblyListFirst
          .find((item) => item._id.toString() === subAssemblyId)
          .partsListItems.find((i) => i._id.toString() === itemId)
          .shipmentVariables.find(
            (v) => v._id.toString() === shipmentVariableId
          ),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "An error occurred while updating the Shipment Variable",
      });
    }
  }
);

// Overheads and Profits Update Route
partproject.put(
  "/projects/:projectId/subAssemblyListFirst/:subAssemblyId/items/:itemId/overheadsAndProfits/:overheadsAndProfitsId",
  async (req, res) => {
    const { projectId, subAssemblyId, itemId, overheadsAndProfitsId } =
      req.params;
    const { name, percentage, totalRate } = req.body;

    try {
      // Validate project ID
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ error: "Invalid project ID format" });
      }

      // Find the project and the specific sub-assembly list
      const project = await PartListProjectModel.findOne({
        _id: projectId,
        "subAssemblyListFirst._id": subAssemblyId,
      });

      if (!project) {
        return res
          .status(404)
          .json({ error: "Project or SubAssemblyListFirst not found" });
      }

      // Find the specific sub-assembly list
      const subAssemblyList = project.subAssemblyListFirst.find(
        (item) => item._id.toString() === subAssemblyId
      );

      if (!subAssemblyList) {
        return res
          .status(404)
          .json({ error: "SubAssemblyListFirst item not found" });
      }

      // Find the item in the partsListItems array
      const item = subAssemblyList.partsListItems.find(
        (item) => item._id.toString() === itemId
      );

      if (!item) {
        return res
          .status(404)
          .json({ error: "Item not found in partsListItems" });
      }

      // Find the specific overheadsAndProfits in the overheadsAndProfits array
      const overheadsAndProfits = item.overheadsAndProfits.find(
        (v) => v._id.toString() === overheadsAndProfitsId
      );

      if (!overheadsAndProfits) {
        return res.status(404).json({
          error: "Overheads and Profits not found in overheadsAndProfits",
        });
      }

      // Update the overheadsAndProfits
      overheadsAndProfits.name = name || overheadsAndProfits.name;
      overheadsAndProfits.percentage =
        percentage || overheadsAndProfits.percentage;
      overheadsAndProfits.totalRate =
        totalRate || overheadsAndProfits.totalRate;

      // Save the updated project
      const updatedProject = await project.save();

      res.status(200).json({
        status: "success",
        message: "Overheads and Profits updated successfully",
        data: updatedProject.subAssemblyListFirst
          .find((item) => item._id.toString() === subAssemblyId)
          .partsListItems.find((i) => i._id.toString() === itemId)
          .overheadsAndProfits.find(
            (v) => v._id.toString() === overheadsAndProfitsId
          ),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "An error occurred while updating the Overheads and Profits",
      });
    }
  }
);

// for assmebly
partproject.get(
  "/projects/:projectId/assemblyList/:subAssemblyId/subAssemblies",
  async (req, res) => {
    try {
      const { projectId, subAssemblyId } = req.params;

      // Validate project ID and subAssemblyId
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ error: "Invalid project ID format" });
      }
      if (!mongoose.Types.ObjectId.isValid(subAssemblyId)) {
        return res.status(400).json({ error: "Invalid subAssemblyId format" });
      }

      // Find the project by ID
      const project = await PartListProjectModel.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Find the specific assemblyList item
      const assemblyList = project.assemblyList.find(
        (item) => item._id.toString() === subAssemblyId
      );

      if (!assemblyList) {
        return res.status(404).json({ error: "assemblyList item not found" });
      }

      // Fetch subAssemblies
      const subAssemblies = assemblyList.subAssemblies;

      res.status(200).json({
        status: "success",
        message: "SubAssemblies retrieved successfully",
        data: subAssemblies,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching subAssemblies" });
    }
  }
);

// ==============================for assmebly

// edit the name for awsmebly
partproject.put(
  "/projects/:projectId/assemblyList/:assemblyListId",
  async (req, res) => {
    const { projectId, assemblyListId } = req.params;
    const { AssemblyName } = req.body;

    try {
      const project = await PartListProjectModel.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const assembly = project.assemblyList.id(assemblyListId);
      if (!assembly) {
        return res.status(404).json({ message: "Assembly not found" });
      }

      // Update the AssemblyName
      assembly.AssemblyName = AssemblyName;

      // Save the entire project back to the database
      await project.save();

      res
        .status(200)
        .json({ message: "Assembly updated successfully", project });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

partproject.delete(
  "/projects/:projectId/assemblyList/:assemblyListId",
  async (req, res) => {
    const { projectId, assemblyListId } = req.params;

    try {
      // Validate projectId and assemblyListId
      if (
        !mongoose.Types.ObjectId.isValid(projectId) ||
        !mongoose.Types.ObjectId.isValid(assemblyListId)
      ) {
        return res
          .status(400)
          .json({ error: "Invalid project ID or assembly ID format" });
      }

      // Find the project and remove the assemblyList item
      const project = await PartListProjectModel.findByIdAndUpdate(
        projectId,
        { $pull: { assemblyList: { _id: assemblyListId } } },
        { new: true }
      );

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.status(200).json({
        status: "success",
        message: "Assembly list item deleted successfully",
        data: project,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "An error occurred while deleting the assembly list item",
      });
    }
  }
);

// post for assmebly parts lists
partproject.post(
  "/projects/:projectId/assemblyList/:assemblyId/partsListItems",
  async (req, res) => {
    try {
      const { projectId, assemblyId } = req.params;
      const {
        partName,
        codeName,
        costPerUnit,
        timePerUnit,
        quantity,
        rmVariables,
        manufacturingVariables,
        shipmentVariables,
        overheadsAndProfits,
      } = req.body;

      // Validate IDs
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ error: "Invalid project ID format" });
      }
      if (!mongoose.Types.ObjectId.isValid(assemblyId)) {
        return res.status(400).json({ error: "Invalid assembly ID format" });
      }

      // Find the project
      const project = await PartListProjectModel.findOne({
        _id: projectId,
        "assemblyList._id": assemblyId,
      });

      if (!project) {
        return res
          .status(404)
          .json({ error: "Project, Assembly, or Sub-Assembly not found" });
      }

      // Find the specific assembly list
      const assemblyList = project.assemblyList.find(
        (assembly) => assembly._id.toString() === assemblyId
      );

      if (!assemblyList) {
        return res.status(404).json({ error: "Assembly not found" });
      }

      // Create a new part item
      const newPartItem = {
        Uid: codeName || "",
        partName,
        codeName,
        costPerUnit,
        timePerUnit,
        quantity,
        rmVariables: rmVariables || [],
        manufacturingVariables: manufacturingVariables || [],
        shipmentVariables: shipmentVariables || [],
        overheadsAndProfits: overheadsAndProfits || [],
      };

      // Add the new part item to the sub-assembly's partsListItems array
      assemblyList.partsListItems.push(newPartItem);

      // Save the updated project
      const updatedProject = await project.save();

      res.status(201).json({
        status: "success",
        message: "New part item added successfully",
        data: updatedProject.assemblyList.find(
          (assembly) => assembly._id.toString() === assemblyId
        ),
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while adding the part item" });
    }
  }
);

// delete for assmebly parts lists
partproject.delete(
  "/projects/:projectId/assemblyList/:assemblyId/partsListItems/:partsListId",
  async (req, res) => {
    const { projectId, assemblyId, partsListId } = req.params;

    try {
      // Find the project
      const project = await PartListProjectModel.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Find the assembly
      const assembly = project.assemblyList.id(assemblyId);
      if (!assembly) {
        return res.status(404).json({ message: "Assembly not found" });
      }

      // Remove the part from partsListItems
      const updatedPartsList = assembly.partsListItems.filter(
        (part) => part._id.toString() !== partsListId
      );

      if (updatedPartsList.length === assembly.partsListItems.length) {
        return res.status(404).json({ message: "Part not found in assembly" });
      }

      // Update and save
      assembly.partsListItems = updatedPartsList;
      await project.save();

      res.status(200).json({ message: "Part deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error });
    }
  }
);
// put for assmebly raw matarials
// partproject.put(
//   "/projects/:projectId/assemblyList/:assemblyListId/partsListItems/:partsListItemsId/rawMaterials/:rawMaterialsId",
//   async (req, res) => {
//     const { projectId, assemblyListId, partsListItemsId, rawMaterialsId } = req.params;
//     const updatedData = req.body; // Get updated fields from request body

//     try {
//       // Find the project
//       const project = await PartListProjectModel.findById(projectId);
//       if (!project) {
//         return res.status(404).json({ message: "Project not found" });
//       }

//       // Find the assembly
//       const assembly = project.assemblyList.id(assemblyListId);
//       if (!assembly) {
//         return res.status(404).json({ message: "Assembly not found" });
//       }

//       // Find the partsListItem
//       const partItem = assembly.partsListItems.id(partsListItemsId);
//       if (!partItem) {
//         return res.status(404).json({ message: "Part not found" });
//       }

//       // Find the raw material
//       const rawMaterial = partItem.rmVariables.id(rawMaterialsId);
//       if (!rawMaterial) {
//         return res.status(404).json({ message: "Raw Material not found" });
//       }

//       // Update raw material fields
//       Object.assign(rawMaterial, updatedData);

//       // Save the document
//       await project.save();

//       res.status(200).json({ message: "Raw Material updated successfully", rawMaterial });
//     } catch (error) {
//       res.status(500).json({ message: "Internal Server Error", error });
//     }
//   }
// );

// Helper function to find project, assembly, and part
const findProjectAssemblyPart = async (
  projectId,
  assemblyListId,
  partsListItemsId
) => {
  const project = await PartListProjectModel.findById(projectId);
  if (!project) throw new Error("Project not found");

  const assembly = project.assemblyList.id(assemblyListId);
  if (!assembly) throw new Error("Assembly not found");

  const partItem = assembly.partsListItems.id(partsListItemsId);
  if (!partItem) throw new Error("Part not found");

  return { project, partItem };
};

// UPDATE rawMaterials inside partsListItems
partproject.put(
  "/projects/:projectId/assemblyList/:assemblyListId/partsListItems/:partsListItemsId/rawMaterials/:rawMaterialsId",
  async (req, res) => {
    const { projectId, assemblyListId, partsListItemsId, rawMaterialsId } =
      req.params;
    const updatedData = req.body;

    try {
      const { project, partItem } = await findProjectAssemblyPart(
        projectId,
        assemblyListId,
        partsListItemsId
      );
      const rawMaterial = partItem.rmVariables.id(rawMaterialsId);
      if (!rawMaterial)
        return res.status(404).json({ message: "Raw Material not found" });

      Object.assign(rawMaterial, updatedData);
      await project.save();

      res
        .status(200)
        .json({ message: "Raw Material updated successfully", rawMaterial });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// UPDATE manufacturingVariables inside partsListItems
partproject.put(
  "/projects/:projectId/assemblyList/:assemblyListId/partsListItems/:partsListItemsId/manufacturing/:manufacturingId",
  async (req, res) => {
    const { projectId, assemblyListId, partsListItemsId, manufacturingId } =
      req.params;
    const updatedData = req.body;

    try {
      const { project, partItem } = await findProjectAssemblyPart(
        projectId,
        assemblyListId,
        partsListItemsId
      );
      const manufacturing = partItem.manufacturingVariables.id(manufacturingId);
      if (!manufacturing)
        return res
          .status(404)
          .json({ message: "Manufacturing Variable not found" });

      Object.assign(manufacturing, updatedData);
      await project.save();

      res.status(200).json({
        message: "Manufacturing Variable updated successfully",
        manufacturing,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// UPDATE shipmentVariables inside partsListItems
partproject.put(
  "/projects/:projectId/assemblyList/:assemblyListId/partsListItems/:partsListItemsId/shipment/:shipmentId",
  async (req, res) => {
    const { projectId, assemblyListId, partsListItemsId, shipmentId } =
      req.params;
    const updatedData = req.body;

    try {
      const { project, partItem } = await findProjectAssemblyPart(
        projectId,
        assemblyListId,
        partsListItemsId
      );
      const shipment = partItem.shipmentVariables.id(shipmentId);
      if (!shipment)
        return res.status(404).json({ message: "Shipment Variable not found" });

      Object.assign(shipment, updatedData);
      await project.save();

      res
        .status(200)
        .json({ message: "Shipment Variable updated successfully", shipment });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// UPDATE overheadsAndProfits inside partsListItems
partproject.put(
  "/projects/:projectId/assemblyList/:assemblyListId/partsListItems/:partsListItemsId/overheads/:overheadId",
  async (req, res) => {
    const { projectId, assemblyListId, partsListItemsId, overheadId } =
      req.params;
    const updatedData = req.body;

    try {
      const { project, partItem } = await findProjectAssemblyPart(
        projectId,
        assemblyListId,
        partsListItemsId
      );
      const overhead = partItem.overheadsAndProfits.id(overheadId);
      if (!overhead)
        return res.status(404).json({ message: "Overhead Variable not found" });

      Object.assign(overhead, updatedData);
      await project.save();

      res
        .status(200)
        .json({ message: "Overhead Variable updated successfully", overhead });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// for sub assmebly/================================================>

// edit put reiqest for the assmebly sub assmebly
partproject.put(
  "/projects/:projectId/assemblyList/:assemblyListId/subAssemblies/:subAssemblyListId",
  async (req, res) => {
    const { projectId, assemblyListId, subAssemblyListId } = req.params;
    const { subAssemblyName } = req.body;

    try {
      const project = await PartListProjectModel.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const assembly = project.assemblyList.id(assemblyListId);
      if (!assembly) {
        return res.status(404).json({ message: "Assembly not found" });
      }

      const subAssembly = assembly.subAssemblies.id(subAssemblyListId);
      if (!subAssembly) {
        return res.status(404).json({ message: "Sub-assembly not found" });
      }

      // Update the subAssemblyName
      subAssembly.subAssemblyName = subAssemblyName;

      // Save the entire project back to the database
      await project.save();

      res
        .status(200)
        .json({ message: "Sub-assembly updated successfully", project });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Add this new route after the existing POST route for subAssemblyListFirst
partproject.post(
  "/projects/:projectId/assemblyList/:assemblyId/subAssemblies/:subAssemblyId/partsListItems",
  async (req, res) => {
    try {
      const { projectId, assemblyId, subAssemblyId } = req.params;
      const {
        partName,
        codeName,
        costPerUnit,
        timePerUnit,
        quantity,
        rmVariables,
        manufacturingVariables,
        shipmentVariables,
        overheadsAndProfits,
      } = req.body;

      // Validate IDs
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ error: "Invalid project ID format" });
      }
      if (!mongoose.Types.ObjectId.isValid(assemblyId)) {
        return res.status(400).json({ error: "Invalid assembly ID format" });
      }
      if (!mongoose.Types.ObjectId.isValid(subAssemblyId)) {
        return res
          .status(400)
          .json({ error: "Invalid sub-assembly ID format" });
      }

      // Find the project
      const project = await PartListProjectModel.findOne({
        _id: projectId,
        "assemblyList._id": assemblyId,
        "assemblyList.subAssemblies._id": subAssemblyId,
      });

      if (!project) {
        return res
          .status(404)
          .json({ error: "Project, Assembly, or Sub-Assembly not found" });
      }

      // Find the specific assembly list
      const assemblyList = project.assemblyList.find(
        (assembly) => assembly._id.toString() === assemblyId
      );

      if (!assemblyList) {
        return res.status(404).json({ error: "Assembly not found" });
      }

      // Find the specific sub-assembly list
      const subAssembly = assemblyList.subAssemblies.find(
        (sub) => sub._id.toString() === subAssemblyId
      );

      if (!subAssembly) {
        return res.status(404).json({ error: "Sub-Assembly not found" });
      }

      // Create a new part item
      const newPartItem = {
        Uid: codeName || "",
        partName,
        codeName,
        costPerUnit,
        timePerUnit,
        quantity,
        rmVariables: rmVariables || [],
        manufacturingVariables: manufacturingVariables || [],
        shipmentVariables: shipmentVariables || [],
        overheadsAndProfits: overheadsAndProfits || [],
      };

      // Add the new part item to the sub-assembly's partsListItems array
      subAssembly.partsListItems.push(newPartItem);

      // Save the updated project
      const updatedProject = await project.save();

      res.status(201).json({
        status: "success",
        message: "New part item added successfully",
        data: updatedProject.assemblyList
          .find((assembly) => assembly._id.toString() === assemblyId)
          .subAssemblies.find((sub) => sub._id.toString() === subAssemblyId),
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while adding the part item" });
    }
  }
);
// delet for sub asmebly parts lists items
partproject.delete(
  "/projects/:projectId/assemblyList/:assemblyId/subAssemblies/:subAssemblyId/partsListItems/:partsListId",
  async (req, res) => {
    const { projectId, assemblyId, subAssemblyId, partsListId } = req.params;

    try {
      // Find the project
      const project = await PartListProjectModel.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Find the assembly
      const assembly = project.assemblyList.id(assemblyId);
      if (!assembly) {
        return res.status(404).json({ message: "Assembly not found" });
      }

      // Find the sub-assembly
      const subAssembly = assembly.subAssemblies.id(subAssemblyId);
      if (!subAssembly) {
        return res.status(404).json({ message: "Sub-assembly not found" });
      }

      // Remove the part from partsListItems
      const updatedPartsList = subAssembly.partsListItems.filter(
        (part) => part._id.toString() !== partsListId
      );

      if (updatedPartsList.length === subAssembly.partsListItems.length) {
        return res
          .status(404)
          .json({ message: "Part not found in sub-assembly" });
      }

      // Update and save
      subAssembly.partsListItems = updatedPartsList;
      await project.save();

      res.status(200).json({ message: "Part deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error });
    }
  }
);

// put the quanityt
// UPDATE quantity inside partsListItems in subAssemblyList
partproject.put(
  "/projects/:projectId/assemblyList/:assmeblyId/partsListItems/:partId",
  async (req, res) => {
    try {
      const { projectId, assmeblyId, partId } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity < 0) {
        return res.status(400).json({ message: "Invalid quantity" });
      }

      const project = await PartListProjectModel.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Find the specific sub-assembly
      const Assmebly = project.assemblyList.id(assmeblyId);
      if (!Assmebly) {
        return res.status(404).json({ message: "Assmebly not found" });
      }

      // Find the part inside the sub-assembly
      const part = Assmebly.partsListItems.id(partId);
      if (!part) {
        return res.status(404).json({ message: "Part not found" });
      }

      // Update the quantity
      part.quantity = quantity;

      await project.save();

      res
        .status(200)
        .json({ message: "Quantity updated successfully", project });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

partproject.put(
  "/projects/:projectId/assemblyList/:assemblyId/subAssemblies/:subAssemblyId/partsListItems/:partId",
  async (req, res) => {
    const { projectId, assemblyId, subAssemblyId, partId } = req.params;
    const { quantity } = req.body;

    try {
      const updatedPart = await PartListProjectModel.findByIdAndUpdate(
        {
          $and: [
            { _id: projectId },
            { "assemblyList._id": assemblyId },
            { "assemblyList.subAssemblies._id": subAssemblyId },
            { "assemblyList.subAssemblies.partsListItems._id": partId },
          ],
        },
        {
          $set: {
            "assemblyList.subAssemblies.partsListItems.$.quantity": quantity,
          },
        },
        { new: true, runValidators: true }
      );

      if (!updatedPart) {
        return res.status(404).json({ error: "Part not found" });
      }

      res.status(200).json({ success: true, data: updatedPart });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error updating part quantity" });
    }
  }
);

// put for sub assmeblies raw matarials
partproject.put(
  "/projects/:projectId/assemblyList/:assemblyListId/subassemblies/:subAssembliesId/partsListItems/:partsListItemsId/rmVariables/:rmVariablesId",
  async (req, res) => {
    const {
      projectId,
      assemblyListId,
      subAssembliesId,
      partsListItemsId,
      rmVariablesId,
    } = req.params;
    const { name, netWeight, pricePerKg, totalRate } = req.body;

    try {
      // Validate project ID and other IDs
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ error: "Invalid project ID format" });
      }
      if (!mongoose.Types.ObjectId.isValid(assemblyListId)) {
        return res
          .status(400)
          .json({ error: "Invalid assemblyList ID format" });
      }
      if (!mongoose.Types.ObjectId.isValid(subAssembliesId)) {
        return res
          .status(400)
          .json({ error: "Invalid subAssemblies ID format" });
      }
      if (!mongoose.Types.ObjectId.isValid(partsListItemsId)) {
        return res
          .status(400)
          .json({ error: "Invalid partsListItems ID format" });
      }
      if (!mongoose.Types.ObjectId.isValid(rmVariablesId)) {
        return res.status(400).json({ error: "Invalid rmVariables ID format" });
      }

      // Find the project, assembly list, subassembly, and part item
      const project = await PartListProjectModel.findOne({
        _id: projectId,
        "assemblyList._id": assemblyListId,
        "assemblyList.subAssemblies._id": subAssembliesId,
        "assemblyList.subAssemblies.partsListItems._id": partsListItemsId,
      });

      if (!project) {
        return res
          .status(404)
          .json({ error: "Project or related data not found" });
      }

      // Find the part item by partsListItemsId
      const assemblyList = project.assemblyList.find(
        (a) => a._id.toString() === assemblyListId
      );
      const subAssembly = assemblyList.subAssemblies.find(
        (s) => s._id.toString() === subAssembliesId
      );
      const partsListItem = subAssembly.partsListItems.find(
        (p) => p._id.toString() === partsListItemsId
      );

      // Find the rmVariable within the part item
      const rmVariable = partsListItem.rmVariables.id(rmVariablesId);

      if (!rmVariable) {
        return res.status(404).json({ error: "rmVariable not found" });
      }

      // Update the rmVariable with the provided data
      rmVariable.name = name || rmVariable.name;
      rmVariable.netWeight = netWeight || rmVariable.netWeight;
      rmVariable.pricePerKg = pricePerKg || rmVariable.pricePerKg;
      rmVariable.totalRate = totalRate || rmVariable.totalRate;

      // Save the updated project
      await project.save();

      res
        .status(200)
        .json({ message: "rmVariable updated successfully", data: rmVariable });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

partproject.put(
  "/projects/:projectId/assemblyList/:assemblyListId/subassemblies/:subAssembliesId/partsListItems/:partsListItemsId/manufacturingVariables/:manufacturingVariablesId",
  async (req, res) => {
    const {
      projectId,
      assemblyListId,
      subAssembliesId,
      partsListItemsId,
      manufacturingVariablesId,
    } = req.params;
    const { name, hours, times, hourlyRate, totalRate } = req.body;

    try {
      // Validate project ID and other IDs
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ error: "Invalid project ID format" });
      }
      if (!mongoose.Types.ObjectId.isValid(assemblyListId)) {
        return res
          .status(400)
          .json({ error: "Invalid assemblyList ID format" });
      }
      if (!mongoose.Types.ObjectId.isValid(subAssembliesId)) {
        return res
          .status(400)
          .json({ error: "Invalid subAssemblies ID format" });
      }
      if (!mongoose.Types.ObjectId.isValid(partsListItemsId)) {
        return res
          .status(400)
          .json({ error: "Invalid partsListItems ID format" });
      }
      if (!mongoose.Types.ObjectId.isValid(manufacturingVariablesId)) {
        return res
          .status(400)
          .json({ error: "Invalid manufacturingVariables ID format" });
      }

      // Find the project, assembly list, subassembly, and part item
      const project = await PartListProjectModel.findOne({
        _id: projectId,
        "assemblyList._id": assemblyListId,
        "assemblyList.subAssemblies._id": subAssembliesId,
        "assemblyList.subAssemblies.partsListItems._id": partsListItemsId,
      });

      // Find the manufacturingVariables entry and update it
      const partItem = project.assemblyList
        .find((assembly) => assembly._id.toString() === assemblyListId)
        .subAssemblies.find(
          (subAssembly) => subAssembly._id.toString() === subAssembliesId
        )
        .partsListItems.find((item) => item._id.toString() === partsListItemsId)
        .manufacturingVariables.id(manufacturingVariablesId);

      if (!partItem) {
        return res
          .status(404)
          .json({ error: "Manufacturing Variable not found" });
      }

      // Update the manufacturing variable
      partItem.name = name;
      partItem.hours = hours;
      partItem.times = times;
      partItem.hourlyRate = hourlyRate;
      partItem.totalRate = totalRate;

      // Save the updated project
      await project.save();

      res.status(200).json({
        message: "Manufacturing Variable updated successfully",
        data: partItem,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

partproject.put(
  "/projects/:projectId/assemblyList/:assemblyListId/subassemblies/:subAssembliesId/partsListItems/:partsListItemsId/shipmentVariables/:shipmentVariablesId",
  async (req, res) => {
    const {
      projectId,
      assemblyListId,
      subAssembliesId,
      partsListItemsId,
      shipmentVariablesId,
    } = req.params;
    const { name, hourlyRate, totalRate } = req.body;

    try {
      // Validate project ID and other IDs
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ error: "Invalid project ID format" });
      }
      if (!mongoose.Types.ObjectId.isValid(assemblyListId)) {
        return res
          .status(400)
          .json({ error: "Invalid assemblyList ID format" });
      }
      if (!mongoose.Types.ObjectId.isValid(subAssembliesId)) {
        return res
          .status(400)
          .json({ error: "Invalid subAssemblies ID format" });
      }
      if (!mongoose.Types.ObjectId.isValid(partsListItemsId)) {
        return res
          .status(400)
          .json({ error: "Invalid partsListItems ID format" });
      }
      if (!mongoose.Types.ObjectId.isValid(shipmentVariablesId)) {
        return res
          .status(400)
          .json({ error: "Invalid shipmentVariables ID format" });
      }

      // Find the project, assembly list, subassembly, and part item
      const project = await PartListProjectModel.findOne({
        _id: projectId,
        "assemblyList._id": assemblyListId,
        "assemblyList.subAssemblies._id": subAssembliesId,
        "assemblyList.subAssemblies.partsListItems._id": partsListItemsId,
      });

      // Find the shipmentVariables entry and update it
      const partItem = project.assemblyList
        .find((assembly) => assembly._id.toString() === assemblyListId)
        .subAssemblies.find(
          (subAssembly) => subAssembly._id.toString() === subAssembliesId
        )
        .partsListItems.find((item) => item._id.toString() === partsListItemsId)
        .shipmentVariables.id(shipmentVariablesId);

      if (!partItem) {
        return res.status(404).json({ error: "Shipment Variable not found" });
      }

      // Update the shipment variable
      partItem.name = name;
      partItem.hourlyRate = hourlyRate;
      partItem.totalRate = totalRate;

      // Save the updated project
      await project.save();

      res.status(200).json({
        message: "Shipment Variable updated successfully",
        data: partItem,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

partproject.put(
  "/projects/:projectId/assemblyList/:assemblyListId/subassemblies/:subAssembliesId/partsListItems/:partsListItemsId/overheadsAndProfits/:overheadsAndProfitsId",
  async (req, res) => {
    const {
      projectId,
      assemblyListId,
      subAssembliesId,
      partsListItemsId,
      overheadsAndProfitsId,
    } = req.params;
    const { name, percentage, totalRate } = req.body;

    try {
      // Validate project ID and other IDs
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ error: "Invalid project ID format" });
      }
      if (!mongoose.Types.ObjectId.isValid(assemblyListId)) {
        return res
          .status(400)
          .json({ error: "Invalid assemblyList ID format" });
      }
      if (!mongoose.Types.ObjectId.isValid(subAssembliesId)) {
        return res
          .status(400)
          .json({ error: "Invalid subAssemblies ID format" });
      }
      if (!mongoose.Types.ObjectId.isValid(partsListItemsId)) {
        return res
          .status(400)
          .json({ error: "Invalid partsListItems ID format" });
      }
      if (!mongoose.Types.ObjectId.isValid(overheadsAndProfitsId)) {
        return res
          .status(400)
          .json({ error: "Invalid overheadsAndProfits ID format" });
      }

      // Find the project, assembly list, subassembly, and part item
      const project = await PartListProjectModel.findOne({
        _id: projectId,
        "assemblyList._id": assemblyListId,
        "assemblyList.subAssemblies._id": subAssembliesId,
        "assemblyList.subAssemblies.partsListItems._id": partsListItemsId,
      });

      // Find the overheadsAndProfits entry and update it
      const partItem = project.assemblyList
        .find((assembly) => assembly._id.toString() === assemblyListId)
        .subAssemblies.find(
          (subAssembly) => subAssembly._id.toString() === subAssembliesId
        )
        .partsListItems.find((item) => item._id.toString() === partsListItemsId)
        .overheadsAndProfits.id(overheadsAndProfitsId);

      if (!partItem) {
        return res
          .status(404)
          .json({ error: "Overheads and Profits entry not found" });
      }

      // Update the overheads and profits
      partItem.name = name;
      partItem.percentage = percentage;
      partItem.totalRate = totalRate;

      // Save the updated project
      await project.save();

      res.status(200).json({
        message: "Overheads and Profits updated successfully",
        data: partItem,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// module.exports = partproject;

// ============================================ ASSEMBLY CODE START ===============================
partproject.post("/projects/:projectId/assemblyList", async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      AssemblyName,
      AssemblyNumber,
      totalCost,
      totalHours,
      partsListItems,
      subAssemblies,
    } = req.body;

    // Validate project ID
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ error: "Invalid project ID format" });
    }

    // Find the project by ID
    const project = await PartListProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Create new assembly list entry
    const newAssemblyList = {
      AssemblyName,
      AssemblyNumber,
      totalCost,
      totalHours,
      partsListItems: partsListItems || [],
      subAssemblies: subAssemblies || [],
    };

    // Add assembly list to the project
    project.assemblyList.push(newAssemblyList);

    // Save updated project
    await project.save();

    res.status(201).json({
      status: "success",
      message: "Assembly list added successfully",
      data: project.assemblyList,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================ allocation ===============================

partproject.post(
  "/projects/:projectId/partsLists/:partsListId/partsListItems/:partsListItemsId/allocation",
  async (req, res) => {
    try {
      const { projectId, partsListId, partsListItemsId } = req.params;
      const { allocations } = req.body;

      if (!Array.isArray(allocations) || allocations.length === 0) {
        return res.status(400).json({ message: "Invalid allocation data" });
      }

      // Find the project that contains the given partsListId
      const project = await PartListProjectModel.findOne({ _id: projectId });

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Find the correct parts list
      const partsList = project.partsLists.find(
        (list) => list._id.toString() === partsListId
      );

      if (!partsList) {
        return res.status(404).json({ message: "Parts List not found" });
      }

      // Find the correct part inside the parts list
      const partItem = partsList.partsListItems.find(
        (item) => item._id.toString() === partsListItemsId
      );

      if (!partItem) {
        return res.status(404).json({ message: "Part List Item not found" });
      }

      // Append new allocations
      allocations.forEach((alloc) => {
        partItem.allocations.push({
          partName: alloc.partName,
          processName: alloc.processName,
          allocations: alloc.allocations,
        });
      });

      // Save the updated project
      await project.save();

      res.status(201).json({
        message: "Allocations added successfully",
        data: partItem.allocations,
      });
    } catch (error) {
      console.error("Error adding allocations:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// get for allocation

partproject.get(
  "/projects/:projectId/partsLists/:partsListId/partsListItems/:partsListItemsId/allocation",
  async (req, res) => {
    try {
      const { projectId, partsListId, partsListItemsId } = req.params;

      // Find the project
      const project = await PartListProjectModel.findOne({ _id: projectId });

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Find the correct parts list
      const partsList = project.partsLists.find(
        (list) => list._id.toString() === partsListId
      );

      if (!partsList) {
        return res.status(404).json({ message: "Parts List not found" });
      }

      // Find the correct part inside the parts list
      const partItem = partsList.partsListItems.find(
        (item) => item._id.toString() === partsListItemsId
      );

      if (!partItem) {
        return res.status(404).json({ message: "Part List Item not found" });
      }

      res.status(200).json({
        message: "Allocations retrieved successfully",
        data: partItem.allocations,
      });
    } catch (error) {
      console.error("Error retrieving allocations:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// getiing all lists allocation data
partproject.get("/all-allocations", async (req, res) => {
  try {
    const projects = await PartListProjectModel.find({})
      .populate({
        path: "partsLists.partsListItems.allocations",
      })
      .populate({
        path: "subAssemblyListFirst.partsListItems.allocations",
      })
      .populate({
        path: "assemblyList.partsListItems.allocations",
      })
      .populate({
        path: "assemblyList.subAssemblies.partsListItems.allocations",
      });

    // Extract allocations with projectName
    const allocationData = projects.map((project) => ({
      projectName: project.projectName,
      allocations: [
        ...project.partsLists.flatMap((pl) =>
          pl.partsListItems.flatMap((p) => p.allocations)
        ),
        ...project.subAssemblyListFirst.flatMap((sa) =>
          sa.partsListItems.flatMap((p) => p.allocations)
        ),
        ...project.assemblyList.flatMap((al) => [
          ...al.partsListItems.flatMap((p) => p.allocations),
          ...al.subAssemblies.flatMap((sub) =>
            sub.partsListItems.flatMap((p) => p.allocations)
          ),
        ]),
      ].flat(), // Flatten all allocations into a single array
    }));

    return res.status(200).json({
      message: "All allocations retrieved successfully",
      data: allocationData,
    });
  } catch (error) {
    console.error("Error fetching allocations:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = partproject;
