require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const partproject = express.Router();
const PartListProjectModel = require("../model/project/PartListProjectModel");
const ManufacturingModel = require("../model/manufacturingmodel");
const axios = require("axios");
const InchargeVariableModal = require("../model/inchargeVariable");
const baseUrl = process.env.BASE_URL || "http://0.0.0.0:4040";
// ============================================PROJECT CODE START ===============================
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
 
    let totalProjectCost = 0;
    let totalProjectHours = 0;
    const machineHours = {};
 
    // Helper to accumulate cost, time, and machine hours
    const accumulateMetrics = (items) => {
      items.forEach((item) => {
        const itemTotalCost = item.costPerUnit * item.quantity;
        const itemTotalHours = item.timePerUnit * item.quantity;
 
        totalProjectCost += itemTotalCost;
        totalProjectHours += itemTotalHours;
 
        item.manufacturingVariables.forEach((machine) => {
          const machineName = machine.name;
          const totalHours = machine.hours * item.quantity;
          machineHours[machineName] = (machineHours[machineName] || 0) + totalHours;
        });
      });
    };
 
    // partsLists
    project.partsLists?.forEach((partsList) => {
      accumulateMetrics(partsList.partsListItems);
    });
 
    // subAssemblyListFirst
    project.subAssemblyListFirst?.forEach((subAssembly) => {
      accumulateMetrics(subAssembly.partsListItems);
    });
 
    // assemblyList and its subAssemblies
    project.assemblyList?.forEach((assembly) => {
      accumulateMetrics(assembly.partsListItems);
      assembly.subAssemblies?.forEach((subAssembly) => {
        accumulateMetrics(subAssembly.partsListItems);
      });
    });
 
    // Save computed values
    project.costPerUnit = totalProjectCost;
    project.timePerUnit = totalProjectHours;
    project.machineHours = machineHours;
 
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

// ============================================PROJECT CODE START ===============================

// Status calculation function
const getStatus = (allocations) => {
  if (!allocations || allocations.length === 0)
    return {
      text: "Not Allocated",
      class: "badge bg-info text-white",
    };

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

      // Prepare items and push them after setting status
      const itemsWithStatus = itemsToAdd.map((item) => {
        const baseItem = {
          partsCodeId: item.partsCodeId,
          partName: item.partName,
          codeName: item.codeName || "",
          costPerUnit: Number(item.costPerUnit || 0),
          timePerUnit: Number(item.timePerUnit || 0),
          quantity: Number(item.quantity || 0),
          rmVariables: item.rmVariables || [],
          manufacturingVariables: item.manufacturingVariables || [],
          shipmentVariables: item.shipmentVariables || [],
          overheadsAndProfits: item.overheadsAndProfits || [],
          status: "Not Allocated", // default, will be overwritten
          statusClass: "badge bg-info text-black", // default, will be overwritten
        };

        // Use Mongoose to get a subdocument instance for status calculation
        const tempItem = partsList.partsListItems.create(baseItem);
        const status = tempItem.calculateStatus();

        return {
          ...baseItem,
          status: status.text,
          statusClass: status.class,
        };
      });

      // Push all processed items
      partsList.partsListItems.push(...itemsWithStatus);

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

partproject.get(
  "/projects/:projectId/partsLists/:listId/items",
  async (req, res) => {
    try {
      const { projectId, listId } = req.params;
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



// ============************** allocation code ****************===========================

partproject.post(
  "/projects/:projectId/partsLists/:partsListId/partsListItems/:partsListItemsId/allocation",
  async (req, res) => {
    try {
      const { projectId, partsListId, partsListItemsId } = req.params;
      const { allocations } = req.body;

      if (!Array.isArray(allocations) || allocations.length === 0) {
        return res.status(400).json({ message: "Invalid allocation data" });
      }

      const project = await PartListProjectModel.findOne({ _id: projectId });
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const partsList = project.partsLists.find(
        (list) => list._id.toString() === partsListId
      );
      if (!partsList) {
        return res.status(404).json({ message: "Parts List not found" });
      }

      const partItem = partsList.partsListItems.find(
        (item) => item._id.toString() === partsListItemsId
      );
      if (!partItem) {
        return res.status(404).json({ message: "Part List Item not found" });
      }

      // Clear existing allocations first
      partItem.allocations = [];

      // Add new allocations with properly calculated dailyPlannedQty
      allocations.forEach((alloc) => {
        const newAllocation = {
          partName: alloc.partName,
          processName: alloc.processName,
          processId: alloc.processId,
          partsCodeId: alloc.partsCodeId,
          allocations: alloc.allocations.map(a => {
            // Calculate daily planned quantity
            const shiftTotalTime = a.shiftTotalTime || 510; // Default 8.5 hours in minutes
            const perMachinetotalTime = a.perMachinetotalTime || 1; // Prevent division by zero
            const dailyPlannedQty = Math.floor(shiftTotalTime / perMachinetotalTime);
            
            return {
              ...a,
              dailyPlannedQty: dailyPlannedQty,
              dailyTracking: []
            }
          })
        };
        partItem.allocations.push(newAllocation);
      });

      // Calculate and update status
      const status = partItem.calculateStatus();
      partItem.status = status.text;
      partItem.statusClass = status.class;

      // Save the updated project
      await project.save();

      res.status(201).json({
        message: "Allocations added successfully",
        data: {
          ...partItem.toObject(),
          status: status.text,
          statusClass: status.class
        }
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

        // Update status
      partItem.status = "Not Allocated";
      partItem.statusClass = "badge bg-info text-white";

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

      if (!date || produced === undefined) {
        return res
          .status(400)
          .json({ error: "Date and produced quantity are required" });
      }

      const project = await PartListProjectModel.findById(projectId);
      if (!project) return res.status(404).json({ error: "Project not found" });

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

      // Validate and calculate daily planned quantity with proper safeguards
      const shiftTotalTime = allocation.shiftTotalTime || 510; // Default to 8.5 hours in minutes (510 minutes)
      const perMachinetotalTime = allocation.perMachinetotalTime || 1; // Prevent division by zero
      const plannedQuantity = allocation.plannedQuantity || 0;

      let dailyPlannedQty;
      if (perMachinetotalTime <= 0) {
        // If invalid time per unit, fallback to planned quantity
        dailyPlannedQty = plannedQuantity;
      } else {
        // Calculate based on shift time and time per unit
        dailyPlannedQty = Math.floor(shiftTotalTime / perMachinetotalTime);
      }

      // Ensure we have at least 1 as minimum value
      dailyPlannedQty = Math.max(1, dailyPlannedQty);
      allocation.dailyPlannedQty = dailyPlannedQty;

      // Add or update daily tracking
      const existingEntryIndex = allocation.dailyTracking.findIndex(
        (e) => new Date(e.date).toISOString() === new Date(date).toISOString()
      );

      const trackingEntry = {
        date,
        planned: dailyPlannedQty, // Use the calculated value
        produced: Number(produced),
        operator,
        dailyStatus: dailyStatus || 
          (produced > dailyPlannedQty ? "Ahead" : 
           produced < dailyPlannedQty ? "Delayed" : "On Track")
      };

      if (existingEntryIndex >= 0) {
        allocation.dailyTracking[existingEntryIndex] = trackingEntry;
      } else {
        allocation.dailyTracking.push(trackingEntry);
      }

      // Sort tracking entries by date
      allocation.dailyTracking.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      // Fetch holidays
      const holidaysResponse = await axios.get(
        `${baseUrl}/api/eventScheduler/events`
      );
      const holidays = holidaysResponse.data
        .filter((event) => event.eventName === "HOLIDAY")
        .flatMap((event) => {
          const start = new Date(event.startDate);
          const end = new Date(event.endDate);
          let current = new Date(start);
          const dates = [];
          while (current <= end) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
          }
          return dates;
        });

      const isWorkingDay = (date) => {
        const dateObj = new Date(date);
        if (dateObj.getDay() === 0) return false; // Sunday
        const dateStr = dateObj.toISOString().split("T")[0];
        return !holidays.some(
          (holiday) =>
            new Date(holiday).toISOString().split("T")[0] === dateStr
        );
      };

      // Calculate production progress
      const totalProduced = allocation.dailyTracking.reduce(
        (sum, entry) => sum + entry.produced,
        0
      );
      const remainingQuantity = Math.max(0, plannedQuantity - totalProduced);

      // Calculate actual end date
      let currentDate = new Date();
      if (remainingQuantity > 0) {
        let workingDaysNeeded = Math.ceil(remainingQuantity / dailyPlannedQty);
        let addedDays = 0;
        
        while (addedDays < workingDaysNeeded) {
          currentDate.setDate(currentDate.getDate() + 1);
          if (isWorkingDay(currentDate)) {
            addedDays++;
          }
        }
      }

      allocation.actualEndDate = currentDate;

      // Save with validation
      try {
        await project.save();
      } catch (saveError) {
        console.error("Validation error on save:", saveError);
        return res.status(400).json({
          error: "Validation failed",
          details: saveError.message,
          allocation: {
            shiftTotalTime: allocation.shiftTotalTime,
            perMachinetotalTime: allocation.perMachinetotalTime,
            dailyPlannedQty: allocation.dailyPlannedQty
          }
        });
      }

      res.status(201).json({
        message: "Daily tracking updated successfully",
        data: {
          dailyPlannedQty,
          totalProduced,
          remainingQuantity,
          actualEndDate: allocation.actualEndDate
        },
        allocation
      });
    } catch (error) {
      console.error("Error in daily tracking:", error);
      res.status(500).json({
        error: "Server error",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined
      });
    }
  }
);


// partproject.post(
//   "/projects/:projectId/partsLists/:partsListId/partsListItems/:partListItemId/allocations/:processId/allocations/:allocationId/dailyTracking",
//   async (req, res) => {
//     try {
//       const {
//         projectId,
//         partsListId,
//         partListItemId,
//         processId,
//         allocationId,
//       } = req.params;
//       const { date, planned, produced, operator, dailyStatus } = req.body;

//       if (!date || produced === undefined) {
//         return res
//           .status(400)
//           .json({ error: "Date and produced quantity are required" });
//       }

//       const project = await PartListProjectModel.findById(projectId);
//       if (!project) return res.status(404).json({ error: "Project not found" });

//       const partsList = project.partsLists.id(partsListId);
//       if (!partsList)
//         return res.status(404).json({ error: "Parts List not found" });

//       const partItem = partsList.partsListItems.id(partListItemId);
//       if (!partItem)
//         return res.status(404).json({ error: "Part List Item not found" });

//       const process = partItem.allocations.id(processId);
//       if (!process) return res.status(404).json({ error: "Process not found" });

//       const allocation = process.allocations.id(allocationId);
//       if (!allocation)
//         return res.status(404).json({ error: "Allocation not found" });

//       // Calculate daily planned quantity
//       const dailyPlannedQty = Math.floor(
//         allocation.shiftTotalTime / allocation.perMachinetotalTime
//       );
//       allocation.dailyPlannedQty = dailyPlannedQty;

//       // Add or update daily tracking
//       const existingEntryIndex = allocation.dailyTracking.findIndex(
//         (e) => new Date(e.date).toISOString() === new Date(date).toISOString()
//       );

//       if (existingEntryIndex >= 0) {
//         allocation.dailyTracking[existingEntryIndex] = {
//           date,
//           planned,
//           produced,
//           operator,
//           dailyStatus,
//         };
//       } else {
//         allocation.dailyTracking.push({
//           date,
//           planned,
//           produced,
//           operator,
//           dailyStatus,
//         });
//       }

//       // Sort tracking entries by date
//       allocation.dailyTracking.sort(
//         (a, b) => new Date(a.date) - new Date(b.date)
//       );

//       // Fetch holidays
//       const holidaysResponse = await axios.get(
//         `${baseUrl}/api/eventScheduler/events`
//       );
//       const holidays = holidaysResponse.data
//         .filter((event) => event.eventName === "HOLIDAY")
//         .flatMap((event) => {
//           const start = new Date(event.startDate);
//           const end = new Date(event.endDate);
//           let current = new Date(start);
//           const dates = [];
//           while (current <= end) {
//             dates.push(new Date(current));
//             current.setDate(current.getDate() + 1);
//           }
//           return dates;
//         });

//       const isWorkingDay = (date) => {
//         const dateObj = new Date(date);
//         if (dateObj.getDay() === 0) return false; // Sunday
//         const dateStr = dateObj.toISOString().split("T")[0];
//         return !holidays.some(
//           (holiday) =>
//             new Date(holiday).toISOString().split("T")[0] === dateStr
//         );
//       };

//       // Production quantities
//       const totalQuantity = allocation.plannedQuantity;
//       const totalProduced = allocation.dailyTracking.reduce(
//         (sum, entry) => sum + entry.produced,
//         0
//       );
//       const remainingQuantity = Math.max(0, totalQuantity - totalProduced);

//       const safeDailyPlannedQty =
//         allocation.dailyPlannedQty > 0 ? allocation.dailyPlannedQty : 1;

//       const extraDaysNeeded = Math.ceil(remainingQuantity / safeDailyPlannedQty);

//       // Start from last production entry or today
//       let currentDate = new Date(
//         allocation.dailyTracking.length > 0
//           ? allocation.dailyTracking[allocation.dailyTracking.length - 1].date
//           : allocation.endDate || allocation.startDate
//       );

//       let addedDays = 0;
//       while (addedDays < extraDaysNeeded) {
//         currentDate.setDate(currentDate.getDate() + 1);
//         if (isWorkingDay(currentDate)) {
//           addedDays++;
//         }
//       }

//       allocation.actualEndDate = currentDate;

//       await project.save();

//       res.status(201).json({
//         message: "Daily tracking updated successfully",
//         allocation,
//         calculationDetails: {
//           totalQuantity,
//           dailyPlannedQty: safeDailyPlannedQty,
//           totalProduced,
//           remainingQuantity,
//           extraDaysNeeded,
//           actualEndDate: currentDate.toISOString().split("T")[0],
//         },
//       });
//     } catch (error) {
//       console.error("Error in daily tracking:", error);
//       res.status(500).json({
//         error: "Server error",
//         details: error.message,
//       });
//     }
//   }
// );


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

partproject.put('/projects/:projectId/partsLists/:listId/items/:itemId/complete', async (req, res) => {
  try {
    const project = await PartListProjectModel.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const partsList = project.partsLists.id(req.params.listId);
    if (!partsList) {
      return res.status(404).json({ message: 'Parts list not found' });
    }

    const partsListItem = partsList.partsListItems.id(req.params.itemId);
    if (!partsListItem) {
      return res.status(404).json({ message: 'Parts list item not found' });
    }

    // Set a flag to skip status calculation in pre-save hook
    partsListItem._skipStatusCalculation = true;

    // Update status directly and set a flag to prevent recalculation
    partsListItem.status = "Completed";
    partsListItem.statusClass = "badge bg-success text-white";
    partsListItem.isManuallyCompleted = true; // Add this new flag

    // Mark all allocations as completed with current date
    const now = new Date();
    partsListItem.allocations.forEach(allocation => {
      allocation.allocations.forEach(alloc => {
        if (!alloc.actualEndDate) {
          alloc.actualEndDate = now;
        }
        // Ensure all daily tracking entries are marked as completed
        if (alloc.dailyTracking && alloc.dailyTracking.length > 0) {
          alloc.dailyTracking.forEach(track => {
            if (track.dailyStatus !== "Completed") {
              track.dailyStatus = "Completed";
            }
          });
        }
      });
    });

    await project.save();

    // Return the updated document without the flag
    const updatedItem = partsListItem.toObject();
    delete updatedItem._skipStatusCalculation;

    res.status(200).json({
      message: 'Allocation marked as completed',
      data: updatedItem
    });
  } catch (error) {
    console.error('Error completing allocation:', error);
    res.status(500).json({ message: 'Error completing allocation', error: error.message });
  }
});

// ============================= end of allocation ====================================

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

partproject.get("/daily-tracking", async (req, res) => {
  try {
    // Find all projects and project only the necessary fields
    const projects = await PartListProjectModel.find({}).lean();

    // Function to extract daily tracking from allocations
    const extractDailyTracking = (allocations, projectName) => {
      return allocations.flatMap((allocation) =>
        allocation.allocations.flatMap((alloc) =>
          alloc.dailyTracking.map((track) => ({
            ...track,
            projectName: projectName,
            partName: allocation.partName,
            processName: allocation.processName,
            processId: allocation.processId,
            partsCodeId: allocation.partsCodeId,
            splitNumber: alloc.splitNumber,
            machineId: alloc.machineId,
            shift: alloc.shift,
            operator: alloc.operator,
          }))
        )
      );
    };

    // Process all projects and collect all daily tracking
    const allDailyTracking = projects.flatMap((project) => {
      const projectTracking = [];

      // Extract from parts lists
      if (project.partsLists) {
        project.partsLists.forEach((partsList) => {
          partsList.partsListItems.forEach((part) => {
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
        project.subAssemblyListFirst.forEach((subAssembly) => {
          subAssembly.partsListItems.forEach((part) => {
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
        project.assemblyList.forEach((assembly) => {
          assembly.partsListItems.forEach((part) => {
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
      dailyTracking: allDailyTracking,
    });
  } catch (error) {
    console.error("Error fetching all daily tracking:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = partproject;
