require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const partproject = express.Router();
const PartListProjectModel = require("../model/project/PartListProjectModel");
const ManufacturingModel = require("../model/manufacturingmodel");
const axios = require("axios");
const InchargeVariableModal = require("../model/inchargeVariable");
const path = require("path");
const fs = require("fs");
const baseUrl = process.env.BASE_URL || "http://0.0.0.0:4040";

// Define the directory for storing images
const imageUploadDir = path.join(__dirname, "../Images");

// Ensure the directory exists
if (!fs.existsSync(imageUploadDir)) {
  fs.mkdirSync(imageUploadDir, { recursive: true });
}
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

partproject.post("/production_part", async (req, res) => {
  try {
    const {
      projectName,
      projectType,
      selectedPartId,
      selectedPartName,
      partQuantity,
    } = req.body;

    // Validate required fields
    if (!selectedPartId || !selectedPartName || !partQuantity) {
      return res
        .status(400)
        .json({ error: "Part selection and quantity are required" });
    }

    // Fetch the complete part data from the parts API
    const partResponse = await fetch(
      `${process.env.BASE_URL}/api/parts/${selectedPartId}`
    );
    if (!partResponse.ok) {
      throw new Error("Failed to fetch part details");
    }
    const partData = await partResponse.json();

    // Create the initial part object with all the part data
    const initialPart = {
      partsCodeId: selectedPartId,
      partName: selectedPartName,
      quantity: Number(partQuantity),
      status: "Not Allocated",
      statusClass: "badge bg-info text-black",
      isManuallyCompleted: false,
      // Copy all part properties
      ...partData,
      // Ensure these are numbers
      costPerUnit: Number(partData.costPerUnit) || 0,
      timePerUnit: Number(partData.timePerUnit) || 0,
      // Ensure arrays exist
      rmVariables: partData.rmVariables || [],
      manufacturingVariables: partData.manufacturingVariables || [],
      shipmentVariables: partData.shipmentVariables || [],
      overheadsAndProfits: partData.overheadsAndProfits || [],
    };

    // Creating a new project with a parts list and the initial part
    const newProject = new PartListProjectModel({
      projectName,
      projectType,
      costPerUnit: 0, // Will be calculated
      timePerUnit: 0, // Will be calculated
      stockPoQty: 0,
      partsLists: [
        {
          partsListName: `${projectName}-Parts`,
          partsListItems: [initialPart],
        },
      ],
      machineHours: {}, // Will be calculated
    });

    // First save to get the _id
    await newProject.save();

    // Now calculate the totals
    let totalProjectCost = 0;
    let totalProjectHours = 0;
    const machineHours = {};

    // Calculate costs and hours for all parts
    newProject.partsLists.forEach((partsList) => {
      partsList.partsListItems.forEach((part) => {
        // Calculate part total cost (including quantity)
        const partTotalCost = (part.costPerUnit || 0) * (part.quantity || 0);
        const partTotalHours = (part.timePerUnit || 0) * (part.quantity || 0);

        totalProjectCost += partTotalCost;
        totalProjectHours += partTotalHours;

        // Calculate machine hours
        if (
          part.manufacturingVariables &&
          part.manufacturingVariables.length > 0
        ) {
          part.manufacturingVariables.forEach((machine) => {
            const machineName = machine.name;
            const hours = (machine.hours || 0) * (part.quantity || 0);
            machineHours[machineName] =
              (machineHours[machineName] || 0) + hours;
          });
        }
      });
    });

    // Update project with calculated totals
    newProject.costPerUnit = totalProjectCost;
    newProject.timePerUnit = totalProjectHours;
    newProject.machineHours = machineHours;

    // Save the updated project with calculated values
    await newProject.save();

    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

partproject.get("/projects", async (req, res) => {
  try {
    // Get filter from query params if exists
    const { filterType } = req.query;
    const query = filterType ? { projectType: filterType } : {};

    // Fetch projects with only necessary fields
    const projects = await PartListProjectModel.find(query)
      .select('projectName createdAt projectType costPerUnit timePerUnit machineHours partsLists subAssemblyListFirst assemblyList')
      .lean(); // Use lean() for faster plain JS objects

    // Process calculations in memory without saving
    const processedProjects = projects.map(project => {
      let totalProjectCost = 0;
      let totalProjectHours = 0;
      const machineHours = {};

      // Helper function to process parts list items
      const processItems = (items) => {
        items.forEach(item => {
          const costPerUnit = Number(item.costPerUnit) || 0;
          const timePerUnit = Number(item.timePerUnit) || 0;
          const quantity = Number(item.quantity) || 0;

          const itemTotalCost = costPerUnit * quantity;
          const itemTotalHours = timePerUnit * quantity;

          totalProjectCost += itemTotalCost;
          totalProjectHours += itemTotalHours;

          // Process manufacturing variables if they exist
          if (Array.isArray(item.manufacturingVariables)) {
            item.manufacturingVariables.forEach(machine => {
              const machineName = machine.name;
              const machineHoursVal = Number(machine.hours) || 0;
              const totalHours = machineHoursVal * quantity;
              machineHours[machineName] = (machineHours[machineName] || 0) + totalHours;
            });
          }
        });
      };

      // Process all parts lists
      if (project.partsLists) {
        project.partsLists.forEach(partsList => {
          if (partsList.partsListItems) {
            processItems(partsList.partsListItems);
          }
        });
      }

      // Process sub assemblies if they exist
      if (project.subAssemblyListFirst) {
        project.subAssemblyListFirst.forEach(subAssembly => {
          if (subAssembly.partsListItems) {
            processItems(subAssembly.partsListItems);
          }
        });
      }

      // Process assemblies if they exist
      if (project.assemblyList) {
        project.assemblyList.forEach(assembly => {
          if (assembly.partsListItems) {
            processItems(assembly.partsListItems);
          }
          if (assembly.subAssemblies) {
            assembly.subAssemblies.forEach(subAssembly => {
              if (subAssembly.partsListItems) {
                processItems(subAssembly.partsListItems);
              }
            });
          }
        });
      }

      // Return the project with calculated values (without saving to DB)
      return {
        ...project,
        costPerUnit: totalProjectCost,
        timePerUnit: totalProjectHours,
        machineHours: machineHours
      };
    });

    res.status(200).json(processedProjects);
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
          machineHours[machineName] =
            (machineHours[machineName] || 0) + totalHours;
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
          statusClass: "badge bg-info text-black",
          image: item.image || null,
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

partproject.get(
  "/projects/:projectId/partsLists/:listId/items/:itemId/image",
  async (req, res) => {
    try {
      const { projectId, listId, itemId } = req.params;
      const project = await PartListProjectModel.findById(projectId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const partsList = project.partsLists.id(listId);
      if (!partsList) {
        return res.status(404).json({ message: "Parts list not found" });
      }

      const item = partsList.partsListItems.id(itemId);
      if (!item || !item.image) {
        return res.status(404).json({ message: "Image not found" });
      }

      // Remove leading slash and get just the filename
      const imageFileName = item.image.split("/").pop();
      const imagePath = path.join(imageUploadDir, imageFileName);

      // console.log("Looking for image at:", imagePath);

      if (!fs.existsSync(imagePath)) {
        console.log("Image file not found at path:", imagePath);
        return res.status(404).json({
          message: "Image file not found",
          path: imagePath,
          filename: imageFileName,
        });
      }

      // Determine the content type based on file extension
      const ext = path.extname(imageFileName).toLowerCase();
      let contentType = "image/jpeg"; // default
      if (ext === ".png") contentType = "image/png";
      else if (ext === ".gif") contentType = "image/gif";
      else if (ext === ".webp") contentType = "image/webp";

      // Set proper headers
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "no-cache");

      // Stream the file instead of sending it all at once
      const fileStream = fs.createReadStream(imagePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Error serving image:", error);
      res
        .status(500)
        .json({ message: "Error serving image", error: error.message });
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

// partproject.post(
//   "/projects/:projectId/partsLists/:partsListId/partsListItems/:partsListItemsId/allocation",
//   async (req, res) => {
//     try {
//       const { projectId, partsListId, partsListItemsId } = req.params;
//       const { allocations } = req.body;

//       if (!Array.isArray(allocations) || allocations.length === 0) {
//         return res.status(400).json({ message: "Invalid allocation data" });
//       }

//       const project = await PartListProjectModel.findById(projectId);
//       if (!project) {
//         return res.status(404).json({ message: "Project not found" });
//       }

//       const partsList = project.partsLists.find(
//         (list) => list._id.toString() === partsListId
//       );
//       if (!partsList) {
//         return res.status(404).json({ message: "Parts List not found" });
//       }

//       const partItem = partsList.partsListItems.find(
//         (item) => item._id.toString() === partsListItemsId
//       );
//       if (!partItem) {
//         return res.status(404).json({ message: "Part List Item not found" });
//       }

//       // Clear existing allocations
//       partItem.allocations = [];

//       // Add all allocations in the same order
//       allocations.forEach((alloc) => {
//         const newAllocation = {
//           partName: alloc.partName,
//           processName: alloc.processName,
//           processId: alloc.processId,
//           partsCodeId: alloc.partsCodeId,
//           allocations: alloc.allocations.map((a) => {
//             const shiftTotalTime = a.shiftTotalTime || 510;
//             const perMachinetotalTime = a.perMachinetotalTime || 1;
//             const dailyPlannedQty = Math.floor(
//               shiftTotalTime / perMachinetotalTime
//             );

//             return {
//               ...a,
//               dailyPlannedQty,
//               dailyTracking: [],
//             };
//           }),
//         };
//         partItem.allocations.push(newAllocation);
//       });

//       // Update status
//       const status = partItem.calculateStatus();
//       partItem.status = status.text;
//       partItem.statusClass = status.class;

//       await project.save();

//       res.status(201).json({
//         message: "Allocations added successfully",
//         data: {
//           allocations: partItem.allocations,
//           status: status.text,
//           statusClass: status.class,
//         },
//       });
//     } catch (error) {
//       console.error("Error adding allocations:", error);
//       res.status(500).json({ message: "Server error", error: error.message });
//     }
//   }
// );

partproject.post(
  "/projects/:projectId/partsLists/:partsListId/partsListItems/:partsListItemsId/allocation",
  async (req, res) => {
    try {
      const { projectId, partsListId, partsListItemsId } = req.params;
      const { allocations } = req.body;

      if (!Array.isArray(allocations) || allocations.length === 0) {
        return res.status(400).json({ message: "Invalid allocation data" });
      }

      const project = await PartListProjectModel.findById(projectId);
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

      // Clear existing allocations
      partItem.allocations = [];

      // Add all allocations in the same order
      allocations.forEach((alloc) => {
        const newAllocation = {
          partName: alloc.partName,
          processName: alloc.processName,
          processId: alloc.processId,
          partsCodeId: alloc.partsCodeId,
          allocations: alloc.allocations.map((a) => {
            const shiftTotalTime = a.shiftTotalTime || 510; // Default to 8.5 hours in minutes
            const perMachinetotalTime = a.perMachinetotalTime || 1; // Prevent division by zero
            const plannedQuantity = a.plannedQuantity || 0;

            // Calculate daily planned quantity considering total quantity
            let dailyPlannedQty;
            if (perMachinetotalTime <= 0) {
              dailyPlannedQty = plannedQuantity; // Fallback if invalid time per unit
            } else {
              const totalTimeRequired = plannedQuantity * perMachinetotalTime;
              dailyPlannedQty =
                totalTimeRequired <= shiftTotalTime
                  ? plannedQuantity // Can complete in one day
                  : Math.floor(shiftTotalTime / perMachinetotalTime); // Daily capacity
            }

            return {
              ...a,
              dailyPlannedQty,
              dailyTracking: [],
            };
          }),
        };
        partItem.allocations.push(newAllocation);
      });

      // Update status
      const status = partItem.calculateStatus();
      partItem.status = status.text;
      partItem.statusClass = status.class;

      await project.save();

      res.status(201).json({
        message: "Allocations added successfully",
        data: {
          allocations: partItem.allocations,
          status: status.text,
          statusClass: status.class,
        },
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

      // Reset status to "Not Allocated"
      partItem.status = "Not Allocated";
      partItem.statusClass = "badge bg-info text-white";
      partItem.isManuallyCompleted = false; // Also reset this flag

      // Save the updated project
      await project.save();

      res.status(200).json({
        message: "All allocations deleted successfully",
        data: {
          status: partItem.status,
          statusClass: partItem.statusClass,
        },
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

      // Return allocations in the exact stored order
      res.status(200).json({
        message: "Allocations retrieved successfully",
        data: (partItem.allocations || []).map((allocation) => ({
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
//       const {
//         date,
//         planned,
//         produced,
//         operator,
//         dailyStatus,
//         wareHouseTotalQty,
//         wareHouseremainingQty,
//       } = req.body;

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

//       // Calculate daily planned quantity considering total quantity
//       const shiftTotalTime = allocation.shiftTotalTime || 510;
//       const perMachinetotalTime = allocation.perMachinetotalTime || 1;
//       const plannedQuantity = allocation.plannedQuantity || 0;

//       let dailyPlannedQty;
//       if (perMachinetotalTime <= 0) {
//         dailyPlannedQty = plannedQuantity;
//       } else {
//         const totalTimeRequired = plannedQuantity * perMachinetotalTime;
//         dailyPlannedQty =
//           totalTimeRequired <= shiftTotalTime
//             ? plannedQuantity
//             : Math.floor(shiftTotalTime / perMachinetotalTime);
//       }

//       dailyPlannedQty = Math.max(1, dailyPlannedQty);
//       allocation.dailyPlannedQty = dailyPlannedQty;

//       // Add or update daily tracking with warehouse quantities
//       const existingEntryIndex = allocation.dailyTracking.findIndex(
//         (e) => new Date(e.date).toISOString() === new Date(date).toISOString()
//       );

//       const trackingEntry = {
//         date,
//         planned: dailyPlannedQty,
//         produced: Number(produced),
//         operator,
//         dailyStatus:
//           dailyStatus ||
//           (produced > dailyPlannedQty
//             ? "Ahead"
//             : produced < dailyPlannedQty
//             ? "Delayed"
//             : "On Track"),
//         wareHouseTotalQty: Number(wareHouseTotalQty) || 0,
//         wareHouseremainingQty: Number(wareHouseremainingQty) || 0,
//       };

//       if (existingEntryIndex >= 0) {
//         allocation.dailyTracking[existingEntryIndex] = trackingEntry;
//       } else {
//         allocation.dailyTracking.push(trackingEntry);
//       }

//       allocation.dailyTracking.sort(
//         (a, b) => new Date(a.date) - new Date(b.date)
//       );

//       // Calculate total produced and remaining quantity
//       const totalProduced = allocation.dailyTracking.reduce(
//         (sum, entry) => sum + entry.produced,
//         0
//       );
//       const remainingQuantity = Math.max(0, plannedQuantity - totalProduced);

//       // Update actual end date if production is complete
//       if (remainingQuantity <= 0) {
//         allocation.actualEndDate = new Date(date);
//       }

//       await project.save();

//       res.status(201).json({
//         message: "Daily tracking updated successfully",
//         data: {
//           dailyPlannedQty,
//           totalProduced,
//           remainingQuantity,
//           actualEndDate: allocation.actualEndDate,
//           wareHouseTotalQty: trackingEntry.wareHouseTotalQty,
//           wareHouseremainingQty: trackingEntry.wareHouseremainingQty,
//         },
//         allocation,
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
      const {
        date,
        planned,
        produced,
        operator,
        dailyStatus,
        wareHouseTotalQty,
        wareHouseremainingQty,
      } = req.body;

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

      // Calculate daily planned quantity considering total quantity
      const shiftTotalTime = allocation.shiftTotalTime || 510;
      const perMachinetotalTime = allocation.perMachinetotalTime || 1;
      const plannedQuantity = allocation.plannedQuantity || 0;

      let dailyPlannedQty;
      if (perMachinetotalTime <= 0) {
        dailyPlannedQty = plannedQuantity;
      } else {
        const totalTimeRequired = plannedQuantity * perMachinetotalTime;
        dailyPlannedQty = totalTimeRequired <= shiftTotalTime
          ? plannedQuantity
          : Math.floor(shiftTotalTime / perMachinetotalTime);
      }

      dailyPlannedQty = Math.max(1, dailyPlannedQty);
      allocation.dailyPlannedQty = dailyPlannedQty;

      // Add or update daily tracking with warehouse quantities
      const existingEntryIndex = allocation.dailyTracking.findIndex(
        (e) => new Date(e.date).toISOString() === new Date(date).toISOString()
      );

      const trackingEntry = {
        date,
        planned: dailyPlannedQty,
        produced: Number(produced),
        operator,
        dailyStatus:
          dailyStatus ||
          (produced > dailyPlannedQty
            ? "Ahead"
            : produced < dailyPlannedQty
            ? "Delayed"
            : "On Track"),
        wareHouseTotalQty: Number(wareHouseTotalQty) || 0,
        wareHouseremainingQty: Number(wareHouseremainingQty) || 0,
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

      // Calculate total produced and remaining quantity
      const totalProduced = allocation.dailyTracking.reduce(
        (sum, entry) => sum + entry.produced,
        0
      );
      const remainingQuantity = Math.max(0, plannedQuantity - totalProduced);

      // Get holidays for working day calculation
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

      // Function to check if a date is a working day
      const isWorkingDay = (date) => {
        const dateObj = new Date(date);
        if (dateObj.getDay() === 0) return false; // Sunday
        const dateStr = dateObj.toISOString().split('T')[0];
        return !holidays.some(
          (holiday) => new Date(holiday).toISOString().split('T')[0] === dateStr
        );
      };

      // Calculate actual end date based on production progress
      let actualEndDate = allocation.endDate; // Default to planned end date

      if (remainingQuantity <= 0) {
        // If production is complete, use the last production date
        const productionDates = allocation.dailyTracking
          .filter(entry => entry.produced > 0)
          .map(entry => new Date(entry.date));
        
        if (productionDates.length > 0) {
          actualEndDate = new Date(Math.max(...productionDates));
        }
      } else {
        // If production is ongoing, estimate end date based on remaining work
        let currentDate = new Date(date);
        let remainingQty = remainingQuantity;
        let workingDaysAdded = 0;

        while (remainingQty > 0) {
          currentDate.setDate(currentDate.getDate() + 1);
          if (isWorkingDay(currentDate)) {
            remainingQty -= dailyPlannedQty;
            workingDaysAdded++;
          }
        }

        actualEndDate = currentDate;
      }

      allocation.actualEndDate = actualEndDate;

      await project.save();

      res.status(201).json({
        message: "Daily tracking updated successfully",
        data: {
          dailyPlannedQty,
          totalProduced,
          remainingQuantity,
          actualEndDate: allocation.actualEndDate,
          wareHouseTotalQty: trackingEntry.wareHouseTotalQty,
          wareHouseremainingQty: trackingEntry.wareHouseremainingQty,
        },
        allocation,
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

partproject.put(
  "/projects/:projectId/partsLists/:listId/items/:itemId/complete-allocatoin",
  async (req, res) => {
    try {
      const { projectId, listId, itemId } = req.params;
      const { processId, trackingId } = req.body;

      const project = await PartListProjectModel.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const partsList = project.partsLists.id(listId);
      if (!partsList) {
        return res.status(404).json({ message: "Parts list not found" });
      }

      const partsListItem = partsList.partsListItems.id(itemId);
      if (!partsListItem) {
        return res.status(404).json({ message: "Parts list item not found" });
      }

      // If processId and trackingId are provided, complete only that specific process
      if (processId && trackingId) {
        const process = partsListItem.allocations.id(processId);
        if (!process) {
          return res.status(404).json({ message: "Process not found" });
        }

        const allocation = process.allocations.id(trackingId);
        if (!allocation) {
          return res.status(404).json({ message: "Allocation not found" });
        }

        // Mark this specific allocation as completed
        allocation.actualEndDate = new Date();
        if (allocation.dailyTracking && allocation.dailyTracking.length > 0) {
          allocation.dailyTracking.forEach((track) => {
            track.dailyStatus = "Completed";
          });
        }
      } else {
        // Complete all allocations
        partsListItem.status = "Completed";
        partsListItem.statusClass = "badge bg-success text-white";
        partsListItem.isManuallyCompleted = true;

        const now = new Date();
        partsListItem.allocations.forEach((allocation) => {
          allocation.allocations.forEach((alloc) => {
            if (!alloc.actualEndDate) {
              alloc.actualEndDate = now;
            }
            if (alloc.dailyTracking && alloc.dailyTracking.length > 0) {
              alloc.dailyTracking.forEach((track) => {
                track.dailyStatus = "Completed";
              });
            }
          });
        });
      }

      await project.save();

      res.status(200).json({
        message: "Process completed successfully",
        data: partsListItem,
      });
    } catch (error) {
      console.error("Error completing process:", error);
      res
        .status(500)
        .json({ message: "Error completing process", error: error.message });
    }
  }
);

// cretae for complete process
// Route to complete a specific process
partproject.put(
  "/projects/:projectId/partsLists/:listId/items/:itemId/complete-process",
  async (req, res) => {
    try {
      const { projectId, listId, itemId } = req.params;
      const { processId, trackingId } = req.body;

      // Validate required parameters
      if (!processId || !trackingId) {
        return res.status(400).json({
          message: "processId and trackingId are required in request body",
        });
      }

      // Find the project
      const project = await PartListProjectModel.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Find the parts list
      const partsList = project.partsLists.id(listId);
      if (!partsList) {
        return res.status(404).json({ message: "Parts list not found" });
      }

      // Find the part item
      const partItem = partsList.partsListItems.id(itemId);
      if (!partItem) {
        return res.status(404).json({ message: "Part list item not found" });
      }

      // Find the process
      const process = partItem.allocations.id(processId);
      if (!process) {
        return res.status(404).json({ message: "Process not found" });
      }

      // Find the specific allocation/tracking
      const allocation = process.allocations.id(trackingId);
      if (!allocation) {
        return res.status(404).json({ message: "Allocation not found" });
      }

      // Mark the process as completed
      allocation.isProcessCompleted = true;
      allocation.actualEndDate = new Date();

      // Update all daily tracking entries to "Completed" status
      if (allocation.dailyTracking && allocation.dailyTracking.length > 0) {
        allocation.dailyTracking.forEach((track) => {
          track.dailyStatus = "Completed";
        });
      }

      // Calculate and update the part item status
      const status = partItem.calculateStatus();
      partItem.status = status.text;
      partItem.statusClass = status.class;

      // Save the changes
      await project.save();

      res.status(200).json({
        message: "Process completed successfully",
        data: {
          processId: process._id,
          trackingId: allocation._id,
          isProcessCompleted: allocation.isProcessCompleted,
          actualEndDate: allocation.actualEndDate,
          partStatus: partItem.status,
        },
      });
    } catch (error) {
      console.error("Error completing process:", error);
      res.status(500).json({
        message: "Error completing process",
        error: error.message,
      });
    }
  }
);

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