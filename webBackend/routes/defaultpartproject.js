require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const partproject = express.Router();
const PartListProjectModel = require("../model/project/PartListProjectModel");
const ManufacturingModel = require("../model/manufacturingmodel");
const axios = require("axios");
const InchargeVariableModal = require("../model/inchargeVariable");

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
// partproject.get("/projects", async (req, res) => {
//   try {
//     const projects = await PartListProjectModel.find();
//     res.status(200).json(projects);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

partproject.get("/projects", async (req, res) => {
  try {
    const projects = await PartListProjectModel.find();

    // Recalculate totals for each project
    for (const project of projects) {
      let totalProjectCost = 0;
      let totalProjectHours = 0;
      const machineHours = {};

      project.partsLists.forEach((partsList) => {
        partsList.partsListItems.forEach((item) => {
          const costPerUnit = Number(item.costPerUnit);
          const timePerUnit = Number(item.timePerUnit);
          const quantity = Number(item.quantity);

          // Ensure all values are valid numbers
          if (!isNaN(costPerUnit) && !isNaN(timePerUnit) && !isNaN(quantity)) {
            const itemTotalCost = costPerUnit * quantity;
            const itemTotalHours = timePerUnit * quantity;

            totalProjectCost += itemTotalCost;
            totalProjectHours += itemTotalHours;

            if (Array.isArray(item.manufacturingVariables)) {
              item.manufacturingVariables.forEach((machine) => {
                const machineName = machine.name;
                const machineHoursVal = Number(machine.hours);

                if (!isNaN(machineHoursVal)) {
                  const totalHours = machineHoursVal * quantity;
                  machineHours[machineName] =
                    (machineHours[machineName] || 0) + totalHours;
                }
              });
            }
          } else {
            //
          }
        });
      });

      // Save calculated values, ensuring they're valid numbers
      project.costPerUnit = isNaN(totalProjectCost) ? 0 : totalProjectCost;
      project.timePerUnit = isNaN(totalProjectHours) ? 0 : totalProjectHours;
      project.machineHours = machineHours;

      await project.save(); // Save updated project
    }

    // Refetch updated list
    const updatedProjects = await PartListProjectModel.find();
    res.status(200).json(updatedProjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
// partproject.get("/projects/:id/partsLists", async (req, res) => {
//   try {
//     const projectId = req.params.id;

//     const project = await PartListProjectModel.findById(projectId);
//     if (!project) {
//       return res.status(404).json({ error: "Project not found" });
//     }

//     res.status(200).json(project.partsLists);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

//get all part list form the project
partproject.get("/projects/:id/partsLists", async (req, res) => {
  try {
    const projectId = req.params.id;

    const project = await PartListProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Add status to each part in partsListItems
    const partsListsWithStatus = project.partsLists.map((partsList) => {
      return {
        ...partsList.toObject(),
        partsListItems: partsList.partsListItems.map((part) => {
          const status = getStatus(part.allocations);
          return {
            ...part.toObject(),
            status: status.text,
            statusClass: status.class,
          };
        }),
      };
    });

    res.status(200).json(partsListsWithStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Status calculation function
const getStatus = (allocations) => {
  if (!allocations || allocations.length === 0)
    return {
      text: "Not Allocated",
      class: "badge bg-info text-white",
    };

  // Check if allocation is explicitly marked as completed
  if (allocations[0].allocationStatus === "Completed") {
    return { 
      text: "Completed", 
      class: "badge bg-success text-white" 
    };
  }

  const allocation = allocations[0].allocations[0];
  if (!allocation)
    return { text: "Not Allocated", class: "badge bg-info text-white" };

  // If there's no actualEndDate, check if current date is past endDate
  if (!allocation.actualEndDate) {
    const endDate = new Date(allocation.endDate);
    const currentDate = new Date();

    if (currentDate > endDate) {
      return { text: "Delayed", class: "badge bg-danger text-white" };
    }
    return { text: "Allocated", class: "badge bg-dark text-white" };
  }

  const actualEndDate = new Date(allocation.actualEndDate);
  const endDate = new Date(allocation.endDate);

  if (actualEndDate.getTime() === endDate.getTime())
    return { text: "On Track", class: "badge bg-primary text-white" };
  if (actualEndDate > endDate)
    return { text: "Delayed", class: "badge bg-danger text-white" };
  if (actualEndDate < endDate)
    return { text: "Ahead", class: "badge bg-success-subtle text-success" };
  return { text: "Allocated", class: "badge bg-dark text-white" };
};

partproject.post(
  "/projects/:projectId/partsLists/:listId/items",
  async (req, res) => {
    try {
      const { projectId, listId } = req.params;
      const itemsToAdd = req.body;

      if (!Array.isArray(itemsToAdd) || itemsToAdd.length === 0) {
        return res
          .status(400)
          .json({ status: "error", message: "No parts provided" });
      }

      const project = await PartListProjectModel.findById(projectId);
      if (!project) {
        return res
          .status(404)
          .json({ status: "error", message: "Project not found" });
      }

      const partsList = project.partsLists.id(listId);
      if (!partsList) {
        return res
          .status(404)
          .json({ status: "error", message: "Parts list not found" });
      }

      // Push each part item to partsListItems
      itemsToAdd.forEach((item) => {
        partsList.partsListItems.push({
          partsCodeId: item.partsCodeId, // ✅ this is your updated field
          partName: item.partName,
          codeName: item.codeName || "",
          costPerUnit: Number(item.costPerUnit || 0),
          timePerUnit: Number(item.timePerUnit || 0),
          quantity: Number(item.quantity || 0),
          rmVariables: item.rmVariables || [],
          manufacturingVariables: item.manufacturingVariables || [],
          shipmentVariables: item.shipmentVariables || [],
          overheadsAndProfits: item.overheadsAndProfits || [],
        });
      });

      await project.save();

      res.status(201).json({
        status: "success",
        message: "Parts added successfully",
        data: {
          partsListItems: partsList.partsListItems,
        },
      });
    } catch (error) {
      console.error("POST /partsLists/items error:", error.message);
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

// Complete Allocation route
partproject.put("/projects/:projectId/partsLists/:listId/items/:itemId/completeAllocation", async (req, res) => {
  try {
    const { projectId, listId, itemId } = req.params;

    const project = await PartListProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Find the parts list
    const partsList = project.partsLists.id(listId);
    if (!partsList) {
      return res.status(404).json({ error: "Parts list not found" });
    }

    // Find the part item
    const partItem = partsList.partsListItems.id(itemId);
    if (!partItem) {
      return res.status(404).json({ error: "Part item not found" });
    }

    // Check if all allocations are completed
    const allCompleted = partItem.allocations.every(allocation => {
      return allocation.allocations.every(item => {
        const totalProduced = item.dailyTracking.reduce(
          (sum, task) => sum + task.produced, 
          0
        );
        return totalProduced >= item.plannedQuantity;
      });
    });

    if (!allCompleted) {
      return res.status(400).json({ error: "Cannot complete allocation. Not all quantities have been produced." });
    }

    // Mark as completed by setting a completion flag or status
    partItem.allocationStatus = "Completed";
    partItem.completedAt = new Date();

    await project.save();

    res.status(200).json({ message: "Allocation marked as completed", data: project });
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

partproject.get(
  "/projects/:projectId/subAssemblyListFirst/:listId/items",
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
      const partsList = project.subAssemblyListFirst.id(listId);
      if (!partsList) {
        return res
          .status(404)
          .json({ status: "error", message: "Parts list not found" });
      }

      // Function to determine status
      const getStatus = (allocations) => {
        if (!allocations || allocations.length === 0)
          return {
            text: "Not Allocated",
            class: "badge bg-info text-white",
          };
        const allocation = allocations[0].allocations[0];
        if (!allocation)
          return { text: "Not Allocated", class: "badge bg-info text-white" };

        const actualEndDate = new Date(allocation.actualEndDate);
        const endDate = new Date(allocation.endDate);

        if (!allocation.actualEndDate)
          return { text: "Allocated", class: "badge bg-dark text-white" };
        if (actualEndDate.getTime() === endDate.getTime())
          return { text: "On Track", class: "badge bg-primary text-white" };
        if (actualEndDate > endDate)
          return { text: "Delayed", class: "badge bg-danger text-white" };
        if (actualEndDate < endDate)
          return {
            text: "Ahead",
            class: "badge bg-success-subtle text-success",
          };
        return { text: "Allocated", class: "badge bg-dark text-white" };
      };

      // Add status to each part
      const partsListItemsWithStatus = partsList.partsListItems.map((part) => {
        return {
          ...part.toObject(),
          status: getStatus(part.allocations),
        };
      });

      // Send the parts list items with status
      res.status(200).json({
        status: "success",
        message: "Parts list items retrieved successfully",
        data: partsListItemsWithStatus,
      });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
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
      partsCodeId,
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
        partsCodeId,
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

// put for sub assmeblies raw matarials

partproject.put(
  "/projects/:projectId/assemblyList/:assemblyId/subAssemblies/:subAssemblyId/partsListItems/:partId",
  async (req, res) => {
    const { projectId, assemblyId, subAssemblyId, partId } = req.params;
    const { quantity } = req.body;

    try {
      // Find the project and update the nested part quantity
      const updatedProject = await PartListProjectModel.findOneAndUpdate(
        {
          _id: projectId,
          "assemblyList._id": assemblyId,
          "assemblyList.subAssemblies._id": subAssemblyId,
          "assemblyList.subAssemblies.partsListItems._id": partId,
        },
        {
          $set: {
            "assemblyList.$[assembly].subAssemblies.$[subAssembly].partsListItems.$[part].quantity":
              quantity,
          },
        },
        {
          arrayFilters: [
            { "assembly._id": assemblyId },
            { "subAssembly._id": subAssemblyId },
            { "part._id": partId },
          ],
          new: true, // Return the updated document
          runValidators: true, // Run schema validators
        }
      );

      if (!updatedProject) {
        return res.status(404).json({ error: "Part not found" });
      }

      res.status(200).json({ success: true, data: updatedProject });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error updating part quantity" });
    }
  }
);

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
          processId: alloc.processId, // ✅ Add this
          partsCodeId: alloc.partsCodeId,
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

partproject.delete(
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

      // Clear all allocations
      partItem.allocations = [];

      // Save the updated project
      await project.save();

      res.status(200).json({
        message: "All allocations deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting allocations:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

partproject.get(
  "/projects/:projectId/partsLists/:partsListId/partsListItems/:partsListItemsId/allocation",
  async (req, res) => {
    try {
      const { projectId, partsListId, partsListItemsId } = req.params;

      // Validate IDs
      if (
        !isValidObjectId(projectId) ||
        !isValidObjectId(partsListId) ||
        !isValidObjectId(partsListItemsId)
      ) {
        return res.status(400).json({ message: "Invalid or missing ID(s)" });
      }

      // Find the project
      const project = await PartListProjectModel.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Find the parts list
      const partsList = project.partsLists.find(
        (list) => list._id.toString() === partsListId
      );
      if (!partsList) {
        return res.status(404).json({ message: "Parts List not found" });
      }

      // Find the part item
      const partItem = partsList.partsListItems.find(
        (item) => item._id.toString() === partsListItemsId
      );
      if (!partItem) {
        return res.status(404).json({ message: "Part List Item not found" });
      }

      // Send response with daily tracking included
      res.status(200).json({
        message: "Allocations retrieved successfully",
        data: partItem.allocations.map((allocation) => ({
          ...allocation.toObject(),
          dailyTracking: allocation.dailyTracking,
        })),
      });
    } catch (error) {
      console.error("Error retrieving allocations:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

partproject.post(
  "/projects/:projectId/partsLists/:partsListId/partsListItems/:partListItemId/allocations/:processId/allocations/:allocationId/dailyTracking",
  async (req, res) => {
    try {
      const {
        projectId,
        partsListId,
        partListItemId,
        processId,
        allocationId,
      } = req.params;
      const { date, planned, produced, operator, dailyStatus } = req.body;

      const project = await PartListProjectModel.findById(projectId);
      if (!project) return res.status(404).json({ error: "Project not found" });

      const partsList = project.partsLists.find(
        (p) => p._id.toString() === partsListId
      );
      if (!partsList)
        return res.status(404).json({ error: "Parts List not found" });

      const partItem = partsList.partsListItems.find(
        (p) => p._id.toString() === partListItemId
      );
      if (!partItem)
        return res.status(404).json({ error: "Part List Item not found" });

      const process = partItem.allocations.find(
        (p) => p._id.toString() === processId
      );
      if (!process) return res.status(404).json({ error: "Process not found" });

      const allocation = process.allocations.find(
        (a) => a._id.toString() === allocationId
      );
      if (!allocation)
        return res.status(404).json({ error: "Allocation not found" });

      const shiftTotalTime = allocation.shiftTotalTime;
      const perMachinetotalTime = allocation.perMachinetotalTime;
      const plannedQuantity = allocation.plannedQuantity;
      const totalTimeRequired = plannedQuantity * perMachinetotalTime;

      const dailyPlannedQty =
        totalTimeRequired <= shiftTotalTime
          ? plannedQuantity
          : Math.floor(shiftTotalTime / perMachinetotalTime);

      allocation.dailyPlannedQty = dailyPlannedQty;

      allocation.dailyTracking.push({
        date,
        planned,
        produced,
        operator,
        dailyStatus,
      });

      allocation.dailyTracking.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      let cumulativeProduced = 0;
      let cumulativePlanned = 0;
      let deficit = 0;
      let surplus = 0;
      allocation.dailyTracking.forEach((entry) => {
        cumulativeProduced += entry.produced;
        cumulativePlanned += entry.planned;

        const dailyDiff = entry.produced - entry.planned;
        if (dailyDiff < 0) {
          deficit += Math.abs(dailyDiff);
        } else if (dailyDiff > 0) {
          if (deficit > 0) {
            const usedToCover = Math.min(deficit, dailyDiff);
            deficit -= usedToCover;
            surplus += dailyDiff - usedToCover;
          } else {
            surplus += dailyDiff;
          }
        }
      });

      let totalDeficit = deficit;
      let extraDays = 0;
      if (totalDeficit > 0) {
        extraDays = Math.ceil(totalDeficit / dailyPlannedQty);
      }

      let totalSurplus = surplus;
      let reducedDays = 0;
      if (totalSurplus > 0) {
        reducedDays = Math.floor(totalSurplus / dailyPlannedQty);
      }

      const originalEndDate = new Date(allocation.endDate);
      const calculatedEndDate = new Date(originalEndDate);
      calculatedEndDate.setDate(
        originalEndDate.getDate() + extraDays - reducedDays
      );

      allocation.actualEndDate = calculatedEndDate;

      await project.save();

      res.status(201).json({
        message: "Daily tracking added successfully",
        allocation,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

partproject.get(
  "/projects/:projectId/partsLists/:partsListId/partsListItems/:partListItemId/allocations/:processId/allocations/:allocationId/dailyTracking",
  async (req, res) => {
    try {
      const {
        projectId,
        partsListId,
        partListItemId,
        processId,
        allocationId,
      } = req.params;

      // Find the project
      const project = await PartListProjectModel.findById(projectId);
      if (!project) return res.status(404).json({ error: "Project not found" });

      // Find the part list
      const partsList = project.partsLists.find(
        (p) => p._id.toString() === partsListId
      );
      if (!partsList)
        return res.status(404).json({ error: "Parts List not found" });

      // Find the part list item
      const partItem = partsList.partsListItems.find(
        (p) => p._id.toString() === partListItemId
      );
      if (!partItem)
        return res.status(404).json({ error: "Part List Item not found" });

      // Find the process
      const process = partItem.allocations.find(
        (p) => p._id.toString() === processId
      );
      if (!process) return res.status(404).json({ error: "Process not found" });

      // Find the allocation within the process
      const allocation = process.allocations.find(
        (a) => a._id.toString() === allocationId
      );
      if (!allocation)
        return res.status(404).json({ error: "Allocation not found" });

      // Return daily tracking data along with dailyPlannedQty and actualEndDate
      res.status(200).json({
        dailyTracking: allocation.dailyTracking,
        dailyPlannedQty: allocation.dailyPlannedQty,
        actualEndDate: allocation.actualEndDate,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// ********************************************
// subassembly allocation code
// subAssemblyListFirst
partproject.post(
  "/projects/:projectId/subAssemblyListFirst/:subAssemblyListFirstId/partsListItems/:partsListItemsId/allocation",
  async (req, res) => {
    try {
      const { projectId, subAssemblyListFirstId, partsListItemsId } =
        req.params;
      const { allocations } = req.body;

      if (!Array.isArray(allocations) || allocations.length === 0) {
        return res.status(400).json({ message: "Invalid allocation data" });
      }

      // Find the project that contains the given subAssemblyListFirstId
      const project = await PartListProjectModel.findOne({ _id: projectId });

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Find the correct subAssemblyListFirst
      const subAssemblyListFirst = project.subAssemblyListFirst.find(
        (list) => list._id.toString() === subAssemblyListFirstId
      );

      if (!subAssemblyListFirst) {
        return res
          .status(404)
          .json({ message: "Sub Assembly List First not found" });
      }

      // Find the correct part inside the subAssemblyListFirst
      const partItem = subAssemblyListFirst.partsListItems.find(
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
          processId: alloc.processId, // ✅ Add this
          partsCodeId: alloc.partsCodeId,
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

partproject.get(
  "/projects/:projectId/subAssemblyListFirst/:subAssemblyListFirstId/partsListItems/:partsListItemsId/allocation",
  async (req, res) => {
    try {
      const { projectId, subAssemblyListFirstId, partsListItemsId } =
        req.params;

      // Find the project
      const project = await PartListProjectModel.findOne({ _id: projectId });

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Find the correct subAssemblyListFirst
      const subAssemblyListFirst = project.subAssemblyListFirst.find(
        (list) => list._id.toString() === subAssemblyListFirstId
      );

      if (!subAssemblyListFirst) {
        return res
          .status(404)
          .json({ message: "Sub Assembly List First not found" });
      }

      // Find the correct part inside the subAssemblyListFirst
      const partItem = subAssemblyListFirst.partsListItems.find(
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

partproject.delete(
  "/projects/:projectId/subAssemblyListFirst/:subAssemblyListFirstId/partsListItems/:partsListItemsId/allocation",
  async (req, res) => {
    try {
      const { projectId, subAssemblyListFirstId, partsListItemsId } =
        req.params;

      // Find the project
      const project = await PartListProjectModel.findOne({ _id: projectId });

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Find the correct subAssemblyListFirst
      const subAssemblyListFirst = project.subAssemblyListFirst.find(
        (list) => list._id.toString() === subAssemblyListFirstId
      );

      if (!subAssemblyListFirst) {
        return res
          .status(404)
          .json({ message: "Sub Assembly List First not found" });
      }

      // Find the correct part inside the subAssemblyListFirst
      const partItem = subAssemblyListFirst.partsListItems.find(
        (item) => item._id.toString() === partsListItemsId
      );

      if (!partItem) {
        return res.status(404).json({ message: "Part List Item not found" });
      }

      // Clear all allocations
      partItem.allocations = [];

      // Save the updated project
      await project.save();

      res.status(200).json({
        message: "All allocations deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting allocations:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

partproject.post(
  "/projects/:projectId/subAssemblyListFirst/:partsListId/partsListItems/:partListItemId/allocations/:processId/allocations/:allocationId/dailyTracking",
  async (req, res) => {
    try {
      const {
        projectId,
        partsListId,
        partListItemId,
        processId,
        allocationId,
      } = req.params;
      const { date, planned, produced, operator, dailyStatus } = req.body;

      const project = await PartListProjectModel.findById(projectId);
      if (!project) return res.status(404).json({ error: "Project not found" });

      const partsList = project.subAssemblyListFirst.find(
        (p) => p._id.toString() === partsListId
      );
      if (!partsList)
        return res.status(404).json({ error: "Parts List not found" });

      const partItem = partsList.partsListItems.find(
        (p) => p._id.toString() === partListItemId
      );
      if (!partItem)
        return res.status(404).json({ error: "Part List Item not found" });

      const process = partItem.allocations.find(
        (p) => p._id.toString() === processId
      );
      if (!process) return res.status(404).json({ error: "Process not found" });

      const allocation = process.allocations.find(
        (a) => a._id.toString() === allocationId
      );
      if (!allocation)
        return res.status(404).json({ error: "Allocation not found" });

      const shiftTotalTime = allocation.shiftTotalTime;
      const perMachinetotalTime = allocation.perMachinetotalTime;
      const plannedQuantity = allocation.plannedQuantity;
      const totalTimeRequired = plannedQuantity * perMachinetotalTime;

      const dailyPlannedQty =
        totalTimeRequired <= shiftTotalTime
          ? plannedQuantity
          : Math.floor(shiftTotalTime / perMachinetotalTime);

      allocation.dailyPlannedQty = dailyPlannedQty;

      allocation.dailyTracking.push({
        date,
        planned,
        produced,
        operator,
        dailyStatus,
      });

      allocation.dailyTracking.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      let cumulativeProduced = 0;
      let cumulativePlanned = 0;
      let deficit = 0;
      let surplus = 0;
      allocation.dailyTracking.forEach((entry) => {
        cumulativeProduced += entry.produced;
        cumulativePlanned += entry.planned;

        const dailyDiff = entry.produced - entry.planned;
        if (dailyDiff < 0) {
          deficit += Math.abs(dailyDiff);
        } else if (dailyDiff > 0) {
          if (deficit > 0) {
            const usedToCover = Math.min(deficit, dailyDiff);
            deficit -= usedToCover;
            surplus += dailyDiff - usedToCover;
          } else {
            surplus += dailyDiff;
          }
        }
      });

      let totalDeficit = deficit;
      let extraDays = 0;
      if (totalDeficit > 0) {
        extraDays = Math.ceil(totalDeficit / dailyPlannedQty);
      }

      let totalSurplus = surplus;
      let reducedDays = 0;
      if (totalSurplus > 0) {
        reducedDays = Math.floor(totalSurplus / dailyPlannedQty);
      }

      const originalEndDate = new Date(allocation.endDate);
      const calculatedEndDate = new Date(originalEndDate);
      calculatedEndDate.setDate(
        originalEndDate.getDate() + extraDays - reducedDays
      );

      allocation.actualEndDate = calculatedEndDate;

      await project.save();

      res.status(201).json({
        message: "Daily tracking added successfully",
        allocation,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

partproject.get(
  "/projects/:projectId/subAssemblyListFirst/:partsListId/partsListItems/:partListItemId/allocations/:processId/allocations/:allocationId/dailyTracking",
  async (req, res) => {
    try {
      const {
        projectId,
        partsListId,
        partListItemId,
        processId,
        allocationId,
      } = req.params;

      // Find the project
      const project = await PartListProjectModel.findById(projectId);
      if (!project) return res.status(404).json({ error: "Project not found" });

      // Find the part list
      const partsList = project.subAssemblyListFirst.find(
        (p) => p._id.toString() === partsListId
      );
      if (!partsList)
        return res.status(404).json({ error: "Parts List not found" });

      // Find the part list item
      const partItem = partsList.partsListItems.find(
        (p) => p._id.toString() === partListItemId
      );
      if (!partItem)
        return res.status(404).json({ error: "Part List Item not found" });

      // Find the process
      const process = partItem.allocations.find(
        (p) => p._id.toString() === processId
      );
      if (!process) return res.status(404).json({ error: "Process not found" });

      // Find the allocation within the process
      const allocation = process.allocations.find(
        (a) => a._id.toString() === allocationId
      );
      if (!allocation)
        return res.status(404).json({ error: "Allocation not found" });

      // Return daily tracking data along with dailyPlannedQty and actualEndDate
      res.status(200).json({
        dailyTracking: allocation.dailyTracking,
        dailyPlannedQty: allocation.dailyPlannedQty,
        actualEndDate: allocation.actualEndDate,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// ********************************************
// assembly allocation code
partproject.post(
  "/projects/:projectId/assemblyList/:assemblyListId/partsListItems/:partsListItemsId/allocation",
  async (req, res) => {
    try {
      const { projectId, assemblyListId, partsListItemsId } = req.params;
      const { allocations } = req.body;

      if (!Array.isArray(allocations) || allocations.length === 0) {
        return res.status(400).json({ message: "Invalid allocation data" });
      }

      // Find the project that contains the given assemblyListId
      const project = await PartListProjectModel.findOne({ _id: projectId });

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Find the correct assembly list
      const assemblyList = project.assemblyList.find(
        (list) => list._id.toString() === assemblyListId
      );

      if (!assemblyList) {
        return res.status(404).json({ message: "Assembly List not found" });
      }

      // Find the correct part inside the assembly list
      const partItem = assemblyList.partsListItems.find(
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
          processId: alloc.processId, // ✅ Add this
          partsCodeId: alloc.partsCodeId,
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

partproject.get(
  "/projects/:projectId/assemblyList/:assemblyListId/partsListItems/:partsListItemsId/allocations",
  async (req, res) => {
    try {
      const { projectId, assemblyListId, partsListItemsId } = req.params;
      const project = await PartListProjectModel.findOne({ _id: projectId });
      if (!project)
        return res.status(404).json({ message: "Project not found" });

      const assemblyList = project.assemblyList.find(
        (list) => list._id.toString() === assemblyListId
      );
      if (!assemblyList)
        return res.status(404).json({ message: "Assembly List not found" });

      const partItem = assemblyList.partsListItems.find(
        (item) => item._id.toString() === partsListItemsId
      );
      if (!partItem)
        return res.status(404).json({ message: "Part List Item not found" });

      // console.log("Allocations found:", partItem.allocations);

      res.status(200).json({
        message: "Allocations retrieved successfully",
        data: partItem.allocations,
      });
    } catch (error) {
      console.error("Error fetching allocations:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

partproject.delete(
  "/projects/:projectId/assemblyList/:assemblyListId/partsListItems/:partsListItemsId/allocations",
  async (req, res) => {
    try {
      const { projectId, assemblyListId, partsListItemsId } = req.params;

      // Find the project
      const project = await PartListProjectModel.findOne({ _id: projectId });

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Find the correct assembly list
      const assemblyList = project.assemblyList.find(
        (list) => list._id.toString() === assemblyListId
      );

      if (!assemblyList) {
        return res.status(404).json({ message: "Assembly List not found" });
      }

      // Find the correct part inside the assembly list
      const partItem = assemblyList.partsListItems.find(
        (item) => item._id.toString() === partsListItemsId
      );

      if (!partItem) {
        return res.status(404).json({ message: "Part List Item not found" });
      }

      // Clear all allocations
      partItem.allocations = [];

      // Save the updated project
      await project.save();

      res.status(200).json({
        message: "All allocations deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting allocations:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);





partproject.post(
  "/projects/:projectId/partsLists/:partsListId/partsListItems/:partListItemId/allocations/:processId/allocations/:allocationId/dailyTracking",
  async (req, res) => {
    try {
      const {
        projectId,
        partsListId,
        partListItemId,
        processId,
        allocationId,
      } = req.params;
      const { date, planned, produced, operator, dailyStatus } = req.body;

      // Validate inputs
      if (!date || produced === undefined) {
        return res
          .status(400)
          .json({ error: "Date and produced quantity are required" });
      }

      const project = await PartListProjectModel.findById(projectId);
      if (!project) return res.status(404).json({ error: "Project not found" });

      // Find all related documents
      const partsList = project.partsLists.id(partsListId);
      if (!partsList)
        return res.status(404).json({ error: "Parts List not found" });

      const partItem = partsList.partsListItems.id(partListItemId);
      if (!partItem)
        return res.status(404).json({ error: "Part List Item not found" });

      const process = partItem.allocations.id(processId);
      if (!process) return res.status(404).json({ error: "Process not found" });

      const allocation = process.allocations.id(allocationId);
      if (!allocation)
        return res.status(404).json({ error: "Allocation not found" });

      // Calculate daily planned quantity
      const dailyPlannedQty = Math.floor(
        allocation.shiftTotalTime / allocation.perMachinetotalTime
      );
      allocation.dailyPlannedQty = dailyPlannedQty;

      // Add or update the daily tracking entry
      const existingEntryIndex = allocation.dailyTracking.findIndex(
        (e) => new Date(e.date).toISOString() === new Date(date).toISOString()
      );
      if (existingEntryIndex >= 0) {
        allocation.dailyTracking[existingEntryIndex] = {
          date,
          planned,
          produced,
          operator,
          dailyStatus,
        };
      } else {
        allocation.dailyTracking.push({
          date,
          planned,
          produced,
          operator,
          dailyStatus,
        });
      }

      // Sort entries by date
      allocation.dailyTracking.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      // NEW IMPROVED CALCULATION WITH WORKING DAYS CONSIDERATION
      const totalQuantity = allocation.plannedQuantity;
      let cumulativeProduced = 0;
      let workingDaysUsed = 0;
      let surplus = 0;

      // Function to check if a date is a working day (not Sunday)
      function isWorkingDay(date) {
        return new Date(date).getDay() !== 0; // 0 is Sunday
      }

      // Calculate cumulative production and working days used
      for (const entry of allocation.dailyTracking) {
        if (isWorkingDay(entry.date)) {
          cumulativeProduced += entry.produced;
          workingDaysUsed++;
          if (cumulativeProduced >= totalQuantity) {
            break;
          }
        }
      }

      // Calculate remaining quantity after all tracking entries
      const remainingQty = Math.max(0, totalQuantity - cumulativeProduced);
      
      // Calculate surplus if we produced more than total needed
      if (cumulativeProduced > totalQuantity) {
        surplus = cumulativeProduced - totalQuantity;
      }

      // Calculate days saved from surplus
      const daysSavedFromSurplus = Math.floor(surplus / dailyPlannedQty);

      // Calculate remaining working days needed for remaining quantity
      const remainingWorkingDaysNeeded = Math.ceil(remainingQty / dailyPlannedQty);

      // Total working days required is working days used plus remaining working days minus days saved from surplus
      const totalWorkingDaysRequired = Math.max(
        1,
        workingDaysUsed + remainingWorkingDaysNeeded - daysSavedFromSurplus
      );

      // Function to calculate end date considering working days
      function calculateEndDate(startDate, workingDaysNeeded) {
        let currentDate = new Date(startDate);
        let workingDaysCounted = 0;
        
        while (workingDaysCounted < workingDaysNeeded) {
          // If it's a Sunday, move to next day
          if (currentDate.getDay() === 0) {
            currentDate.setDate(currentDate.getDate() + 1);
            continue;
          }
          
          // If it's a working day, count it
          workingDaysCounted++;
          
          // Move to next day
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return currentDate;
      }

      // Calculate actual end date
      const startDate = new Date(allocation.startDate);
      const calculatedEndDate = calculateEndDate(startDate, totalWorkingDaysRequired);

      allocation.actualEndDate = calculatedEndDate;

      await project.save();

      res.status(201).json({
        message: "Daily tracking updated successfully",
        allocation,
        calculationDetails: {
          totalQuantity,
          dailyPlannedQty,
          cumulativeProduced,
          remainingQty,
          surplus,
          workingDaysUsed,
          daysSavedFromSurplus,
          remainingWorkingDaysNeeded,
          totalWorkingDaysRequired,
          calculatedEndDate: calculatedEndDate.toISOString().split("T")[0],
        },
      });
    } catch (error) {
      console.error("Error in daily tracking:", error);
      res.status(500).json({
        error: "Server error",
        details: error.message,
      });
    }
  }
);





partproject.post(
  "/projects/:projectId/assemblyList/:partsListId/partsListItems/:partListItemId/allocations/:processId/allocations/:allocationId/dailyTracking",
  async (req, res) => {
    try {
      const {
        projectId,
        partsListId,
        partListItemId,
        processId,
        allocationId,
      } = req.params;
      const { date, planned, produced, operator, dailyStatus } = req.body;

      const project = await PartListProjectModel.findById(projectId);
      if (!project) return res.status(404).json({ error: "Project not found" });

      const partsList = project.assemblyList.find(
        (p) => p._id.toString() === partsListId
      );
      if (!partsList)
        return res.status(404).json({ error: "Parts List not found" });

      const partItem = partsList.partsListItems.find(
        (p) => p._id.toString() === partListItemId
      );
      if (!partItem)
        return res.status(404).json({ error: "Part List Item not found" });

      const process = partItem.allocations.find(
        (p) => p._id.toString() === processId
      );
      if (!process) return res.status(404).json({ error: "Process not found" });

      const allocation = process.allocations.find(
        (a) => a._id.toString() === allocationId
      );
      if (!allocation)
        return res.status(404).json({ error: "Allocation not found" });

      // Calculate daily planned qty
      const shiftTotalTime = allocation.shiftTotalTime;
      const perMachinetotalTime = allocation.perMachinetotalTime;
      const plannedQuantity = allocation.plannedQuantity;
      const totalTimeRequired = plannedQuantity * perMachinetotalTime;

      const dailyPlannedQty =
        totalTimeRequired <= shiftTotalTime
          ? plannedQuantity
          : Math.floor(shiftTotalTime / perMachinetotalTime);

      allocation.dailyPlannedQty = dailyPlannedQty;

      // Add today's tracking
      allocation.dailyTracking.push({
        date,
        planned,
        produced,
        operator,
        dailyStatus,
      });

      // Sort tracking by date (safety)
      allocation.dailyTracking.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      // Re-calculate cumulative production
      let cumulativeProduced = 0;
      let cumulativePlanned = 0;
      let deficit = 0; // unproduced qty
      let surplus = 0; // overproduced qty
      allocation.dailyTracking.forEach((entry) => {
        cumulativeProduced += entry.produced;
        cumulativePlanned += entry.planned;

        const dailyDiff = entry.produced - entry.planned;
        if (dailyDiff < 0) {
          deficit += Math.abs(dailyDiff);
        } else if (dailyDiff > 0) {
          // if there was prior deficit, reduce it
          if (deficit > 0) {
            const usedToCover = Math.min(deficit, dailyDiff);
            deficit -= usedToCover;
            surplus += dailyDiff - usedToCover;
          } else {
            surplus += dailyDiff;
          }
        }
      });

      // Determine how many extra days required due to deficit
      let totalDeficit = deficit;
      let extraDays = 0;
      if (totalDeficit > 0) {
        extraDays = Math.ceil(totalDeficit / dailyPlannedQty);
      }

      // Determine how many days can be reduced due to surplus
      let totalSurplus = surplus;
      let reducedDays = 0;
      if (totalSurplus > 0) {
        reducedDays = Math.floor(totalSurplus / dailyPlannedQty);
      }

      // Calculate actualEndDate correctly
      const originalEndDate = new Date(allocation.endDate);
      const calculatedEndDate = new Date(originalEndDate);
      calculatedEndDate.setDate(
        originalEndDate.getDate() + extraDays - reducedDays
      );

      allocation.actualEndDate = calculatedEndDate;

      // Save project
      await project.save();

      res.status(201).json({
        message: "Daily tracking added successfully",
        allocation,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

partproject.get(
  "/projects/:projectId/assemblyList/:partsListId/partsListItems/:partListItemId/allocations/:processId/allocations/:allocationId/dailyTracking",
  async (req, res) => {
    try {
      const {
        projectId,
        partsListId,
        partListItemId,
        processId,
        allocationId,
      } = req.params;

      // Find the project
      const project = await PartListProjectModel.findById(projectId);
      if (!project) return res.status(404).json({ error: "Project not found" });

      // Find the part list
      const partsList = project.assemblyList.find(
        (p) => p._id.toString() === partsListId
      );
      if (!partsList)
        return res.status(404).json({ error: "Parts List not found" });

      // Find the part list item
      const partItem = partsList.partsListItems.find(
        (p) => p._id.toString() === partListItemId
      );
      if (!partItem)
        return res.status(404).json({ error: "Part List Item not found" });

      // Find the process
      const process = partItem.allocations.find(
        (p) => p._id.toString() === processId
      );
      if (!process) return res.status(404).json({ error: "Process not found" });

      // Find the allocation within the process
      const allocation = process.allocations.find(
        (a) => a._id.toString() === allocationId
      );
      if (!allocation)
        return res.status(404).json({ error: "Allocation not found" });

      // Return daily tracking data along with dailyPlannedQty and actualEndDate
      res.status(200).json({
        dailyTracking: allocation.dailyTracking,
        dailyPlannedQty: allocation.dailyPlannedQty,
        actualEndDate: allocation.actualEndDate,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// assembly ka sub assembly allocation code
partproject.post(
  "/projects/:projectId/assemblyList/:assemblyListId/subAssemblies/:subAssembliesId/partsListItems/:partsListItemsId/allocation",
  async (req, res) => {
    try {
      const { projectId, assemblyListId, subAssembliesId, partsListItemsId } =
        req.params;
      const { allocations } = req.body;

      if (!Array.isArray(allocations) || allocations.length === 0) {
        return res.status(400).json({ message: "Invalid allocation data" });
      }

      const project = await PartListProjectModel.findOne({ _id: projectId });
      if (!project)
        return res.status(404).json({ message: "Project not found" });

      const assemblyList = project.assemblyList.find(
        (list) => list._id.toString() === assemblyListId
      );
      if (!assemblyList)
        return res.status(404).json({ message: "Assembly List not found" });

      const subAssembly = assemblyList.subAssemblies.find(
        (sub) => sub._id.toString() === subAssembliesId
      );
      if (!subAssembly)
        return res.status(404).json({ message: "Sub Assembly not found" });

      const partItem = subAssembly.partsListItems.find(
        (item) => item._id.toString() === partsListItemsId
      );
      if (!partItem)
        return res.status(404).json({ message: "Part List Item not found" });

      allocations.forEach((alloc) => {
        partItem.allocations.push({
          partName: alloc.partName,
          processName: alloc.processName,
          processId: alloc.processId, // ✅ Add this
          partsCodeId: alloc.partsCodeId,
          allocations: alloc.allocations,
        });
      });

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

partproject.get(
  "/projects/:projectId/assemblyList/:assemblyListId/subAssemblies/:subAssembliesId/partsListItems/:partsListItemsId/allocations",
  async (req, res) => {
    try {
      const { projectId, assemblyListId, subAssembliesId, partsListItemsId } =
        req.params;

      const project = await PartListProjectModel.findOne({ _id: projectId });
      if (!project)
        return res.status(404).json({ message: "Project not found" });

      const assemblyList = project.assemblyList.find(
        (list) => list._id.toString() === assemblyListId
      );
      if (!assemblyList)
        return res.status(404).json({ message: "Assembly List not found" });

      const subAssembly = assemblyList.subAssemblies.find(
        (sub) => sub._id.toString() === subAssembliesId
      );
      if (!subAssembly)
        return res.status(404).json({ message: "Sub Assembly not found" });

      const partItem = subAssembly.partsListItems.find(
        (item) => item._id.toString() === partsListItemsId
      );
      if (!partItem)
        return res.status(404).json({ message: "Part List Item not found" });

      res.status(200).json({
        message: "Allocations retrieved successfully",
        data: partItem.allocations,
      });
    } catch (error) {
      console.error("Error fetching allocations:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

partproject.delete(
  "/projects/:projectId/assemblyList/:assemblyListId/subAssemblies/:subAssembliesId/partsListItems/:partsListItemsId/allocations",
  async (req, res) => {
    try {
      const { projectId, assemblyListId, subAssembliesId, partsListItemsId } =
        req.params;

      const project = await PartListProjectModel.findOne({ _id: projectId });
      if (!project)
        return res.status(404).json({ message: "Project not found" });

      const assemblyList = project.assemblyList.find(
        (list) => list._id.toString() === assemblyListId
      );
      if (!assemblyList)
        return res.status(404).json({ message: "Assembly List not found" });

      const subAssembly = assemblyList.subAssemblies.find(
        (sub) => sub._id.toString() === subAssembliesId
      );
      if (!subAssembly)
        return res.status(404).json({ message: "Sub Assembly not found" });

      const partItem = subAssembly.partsListItems.find(
        (item) => item._id.toString() === partsListItemsId
      );
      if (!partItem)
        return res.status(404).json({ message: "Part List Item not found" });

      partItem.allocations = [];
      await project.save();

      res.status(200).json({ message: "All allocations deleted successfully" });
    } catch (error) {
      console.error("Error deleting allocations:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

partproject.post(
  "/projects/:projectId/assemblyList/:partsListId/subAssemblies/:subAssembliesId/partsListItems/:partListItemId/allocations/:processId/allocations/:allocationId/dailyTracking",
  async (req, res) => {
    try {
      const {
        projectId,
        partsListId,
        subAssembliesId,
        partListItemId,
        processId,
        allocationId,
      } = req.params;
      const { date, planned, produced, operator, dailyStatus } = req.body;

      // Find the project
      const project = await PartListProjectModel.findById(projectId);
      if (!project) return res.status(404).json({ error: "Project not found" });

      // Find the parts list within the assembly list
      const partsList = project.assemblyList.find(
        (p) => p._id.toString() === partsListId
      );
      if (!partsList)
        return res.status(404).json({ error: "Parts List not found" });

      // Find the sub-assembly within the parts list
      const subAssembly = partsList.subAssemblies.find(
        (s) => s._id.toString() === subAssembliesId
      );
      if (!subAssembly)
        return res.status(404).json({ error: "Sub-Assembly not found" });

      // Find the part item within the sub-assembly
      const partItem = subAssembly.partsListItems.find(
        (p) => p._id.toString() === partListItemId
      );
      if (!partItem)
        return res.status(404).json({ error: "Part List Item not found" });

      // Find the process within the part item
      const process = partItem.allocations.find(
        (p) => p._id.toString() === processId
      );
      if (!process) return res.status(404).json({ error: "Process not found" });

      // Find the allocation within the process
      const allocation = process.allocations.find(
        (a) => a._id.toString() === allocationId
      );
      if (!allocation)
        return res.status(404).json({ error: "Allocation not found" });

      // Calculate daily planned qty
      const shiftTotalTime = allocation.shiftTotalTime;
      const perMachinetotalTime = allocation.perMachinetotalTime;
      const plannedQuantity = allocation.plannedQuantity;
      const totalTimeRequired = plannedQuantity * perMachinetotalTime;

      const dailyPlannedQty =
        totalTimeRequired <= shiftTotalTime
          ? plannedQuantity
          : Math.floor(shiftTotalTime / perMachinetotalTime);

      allocation.dailyPlannedQty = dailyPlannedQty;

      // Add today's tracking
      allocation.dailyTracking.push({
        date,
        planned,
        produced,
        operator,
        dailyStatus,
      });

      // Sort tracking by date (safety)
      allocation.dailyTracking.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      // Re-calculate cumulative production
      let cumulativeProduced = 0;
      let cumulativePlanned = 0;
      let deficit = 0; // unproduced qty
      let surplus = 0; // overproduced qty
      allocation.dailyTracking.forEach((entry) => {
        cumulativeProduced += entry.produced;
        cumulativePlanned += entry.planned;

        const dailyDiff = entry.produced - entry.planned;
        if (dailyDiff < 0) {
          deficit += Math.abs(dailyDiff);
        } else if (dailyDiff > 0) {
          // if there was prior deficit, reduce it
          if (deficit > 0) {
            const usedToCover = Math.min(deficit, dailyDiff);
            deficit -= usedToCover;
            surplus += dailyDiff - usedToCover;
          } else {
            surplus += dailyDiff;
          }
        }
      });

      // Determine how many extra days required due to deficit
      let totalDeficit = deficit;
      let extraDays = 0;
      if (totalDeficit > 0) {
        extraDays = Math.ceil(totalDeficit / dailyPlannedQty);
      }

      // Determine how many days can be reduced due to surplus
      let totalSurplus = surplus;
      let reducedDays = 0;
      if (totalSurplus > 0) {
        reducedDays = Math.floor(totalSurplus / dailyPlannedQty);
      }

      // Calculate actualEndDate correctly
      const originalEndDate = new Date(allocation.endDate);
      const calculatedEndDate = new Date(originalEndDate);
      calculatedEndDate.setDate(
        originalEndDate.getDate() + extraDays - reducedDays
      );

      allocation.actualEndDate = calculatedEndDate;

      // Save project
      await project.save();

      res.status(201).json({
        message: "Daily tracking added successfully",
        allocation,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

partproject.get(
  "/projects/:projectId/assemblyList/:partsListId/subAssemblies/:subAssembliesId/partsListItems/:partListItemId/allocations/:processId/allocations/:allocationId/dailyTracking",
  async (req, res) => {
    try {
      const {
        projectId,
        partsListId,
        subAssembliesId,
        partListItemId,
        processId,
        allocationId,
      } = req.params;

      // Find the project
      const project = await PartListProjectModel.findById(projectId);
      if (!project) return res.status(404).json({ error: "Project not found" });

      // Find the parts list within the assembly list
      const partsList = project.assemblyList.find(
        (p) => p._id.toString() === partsListId
      );
      if (!partsList)
        return res.status(404).json({ error: "Parts List not found" });

      // Find the sub-assembly within the parts list
      const subAssembly = partsList.subAssemblies.find(
        (s) => s._id.toString() === subAssembliesId
      );
      if (!subAssembly)
        return res.status(404).json({ error: "Sub-Assembly not found" });

      // Find the part item within the sub-assembly
      const partItem = subAssembly.partsListItems.find(
        (p) => p._id.toString() === partListItemId
      );
      if (!partItem)
        return res.status(404).json({ error: "Part List Item not found" });

      // Find the process within the part item
      const process = partItem.allocations.find(
        (p) => p._id.toString() === processId
      );
      if (!process) return res.status(404).json({ error: "Process not found" });

      // Find the allocation within the process
      const allocation = process.allocations.find(
        (a) => a._id.toString() === allocationId
      );
      if (!allocation)
        return res.status(404).json({ error: "Allocation not found" });

      // Return daily tracking data along with dailyPlannedQty and actualEndDate
      res.status(200).json({
        dailyTracking: allocation.dailyTracking,
        dailyPlannedQty: allocation.dailyPlannedQty,
        actualEndDate: allocation.actualEndDate,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// getiing all lists allocation data
partproject.get("/all-allocations", async (req, res) => {
  try {
    const projects = await PartListProjectModel.find({})
      .populate({
        path: "subAssemblyListFirst.partsListItems.allocations",
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

// special routes for filter in the plan page accordin to incharge under those operator
// partproject.get("/filtered-allocations", async (req, res) => {
//   try {
//     const allProjects = await PartListProjectModel.find({});
//     const allIncharges = await InchargeVariableModal.find({});

//     // Get all operator categoryIds from incharges
//     const inchargeOperatorIds = new Set();
//     allIncharges.forEach(incharge => {
//       incharge.operators.forEach(operator => {
//         inchargeOperatorIds.add(operator.categoryId);
//       });
//     });

//     // Structure the response similar to /all-allocations but filtered
//     const filteredData = allProjects.map(project => {
//       // Function to filter allocations based on operator
//       const filterAllocations = (items = []) => {
//         return items.map(part => {
//           const filteredAllocs = part.allocations?.filter(alloc => {
//             if (alloc.operator) {
//               const operatorMatch = alloc.operator.match(/^([^\s-]+)/);
//               return operatorMatch && inchargeOperatorIds.has(operatorMatch[1].trim());
//             }
//             return false;
//           });
          
//           // Only include parts that have matching allocations
//           return filteredAllocs?.length ? {
//             ...part.toObject(),
//             allocations: filteredAllocs
//           } : null;
//         }).filter(Boolean); // Remove null entries
//       };

//       // Process all allocation locations
//       const partsLists = project.partsLists?.map(pl => ({
//         ...pl.toObject(),
//         partsListItems: filterAllocations(pl.partsListItems)
//       })).filter(pl => pl.partsListItems.length);

//       const subAssemblyListFirst = project.subAssemblyListFirst?.map(sa => ({
//         ...sa.toObject(),
//         partsListItems: filterAllocations(sa.partsListItems)
//       })).filter(sa => sa.partsListItems.length);

//       const assemblyList = project.assemblyList?.map(al => {
//         const filteredSubAssemblies = al.subAssemblies?.map(sub => ({
//           ...sub.toObject(),
//           partsListItems: filterAllocations(sub.partsListItems)
//         })).filter(sub => sub.partsListItems.length);

//         return {
//           ...al.toObject(),
//           partsListItems: filterAllocations(al.partsListItems),
//           subAssemblies: filteredSubAssemblies
//         };
//       }).filter(al => al.partsListItems.length || al.subAssemblies?.length);

//       return {
//         projectName: project.projectName,
//         partsLists: partsLists,
//         subAssemblyListFirst: subAssemblyListFirst,
//         assemblyList: assemblyList
//       };
//     }).filter(project => 
//       project.partsLists?.length || 
//       project.subAssemblyListFirst?.length || 
//       project.assemblyList?.length
//     );

//     res.status(200).json({
//       message: "Filtered allocations retrieved successfully",
//       data: filteredData
//     });
//   } catch (error) {
//     console.error("Error filtering allocations:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });


// GET all daily tracking data from all projects
partproject.get("/daily-tracking", async (req, res) => {
  try {
    // Find all projects and project only the necessary fields
    const projects = await PartListProjectModel.find({})
      .lean();
 
    // Function to extract daily tracking from allocations
    const extractDailyTracking = (allocations, projectName) => {
      return allocations.flatMap(allocation =>
        allocation.allocations.flatMap(alloc =>
          alloc.dailyTracking.map(track => ({
            ...track,
            projectName: projectName,
            partName: allocation.partName,
            processName: allocation.processName,
            processId: allocation.processId,
            partsCodeId: allocation.partsCodeId,
            splitNumber: alloc.splitNumber,
            machineId: alloc.machineId,
            shift: alloc.shift,
            operator: alloc.operator
          }))
        )
      );
    };
 
    // Process all projects and collect all daily tracking
    const allDailyTracking = projects.flatMap(project => {
      const projectTracking = [];
     
      // Extract from parts lists
      if (project.partsLists) {
        project.partsLists.forEach(partsList => {
          partsList.partsListItems.forEach(part => {
            if (part.allocations) {
              projectTracking.push(
                ...extractDailyTracking(part.allocations, project.projectName)
              );
            }
          });
        });
      }
 
      // Extract from sub assemblies
      if (project.subAssemblyListFirst) {
        project.subAssemblyListFirst.forEach(subAssembly => {
          subAssembly.partsListItems.forEach(part => {
            if (part.allocations) {
              projectTracking.push(
                ...extractDailyTracking(part.allocations, project.projectName)
              );
            }
          });
        });
      }
 
      // Extract from assemblies
      if (project.assemblyList) {
        project.assemblyList.forEach(assembly => {
          assembly.partsListItems.forEach(part => {
            if (part.allocations) {
              projectTracking.push(
                ...extractDailyTracking(part.allocations, project.projectName)
              );
            }
          });
        });
      }
 
      return projectTracking;
    });
 
    res.json({
      count: allDailyTracking.length,
      dailyTracking: allDailyTracking
    });
  } catch (error) {
    console.error('Error fetching all daily tracking:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = partproject;
