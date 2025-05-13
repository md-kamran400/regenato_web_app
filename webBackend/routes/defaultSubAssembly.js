require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const subAssemblyproject = express.Router();
const PartListProjectModel = require("../model/project/PartListProjectModel");
const ManufacturingModel = require("../model/manufacturingmodel");
const axios = require("axios");
const InchargeVariableModal = require("../model/inchargeVariable");

subAssemblyproject.get(
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

subAssemblyproject.get(
  "/projects/:projectId/subAssemblyListFirst/:listId/items",
  async (req, res) => {
     try {
      const { projectId, listId } = req.params;
      const project = await PartListProjectModel.findById(projectId);

      if (!project) {
        return res
          .status(404)
          .json({ status: "error", message: "Project not found" });
      }

      const partsList = project.subAssemblyListFirst.id(listId);
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


//add sub

subAssemblyproject.post(
  "/projects/:_id/subAssemblyListFirst",
  async (req, res) => {
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

      // Process items without creating a temporary subdocument
      const processedItems = partsListItems.map((item) => {
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
          status: "Not Allocated",
          statusClass: "badge bg-info text-black",
        };

        // Create a plain object with the status calculation logic
        const status = {
          text: "Not Allocated",
          class: "badge bg-info text-white"
        };

        if (item.isManuallyCompleted) {
          status.text = "Completed";
          status.class = "badge bg-success text-white";
        }

        return {
          ...baseItem,
          status: status.text,
          statusClass: status.class,
        };
      });

      const newSubAssemblyList = {
        subAssemblyName,
        SubAssemblyNumber,
        costPerUnit,
        timePerUnit,
        partsListItems: processedItems,
      };

      project.subAssemblyListFirst.push(newSubAssemblyList);
      const updatedProject = await project.save();

      res.status(200).json(updatedProject);
    } catch (error) {
      console.error("POST /subAssemblyListFirst error:", error.message);
      res.status(500).json({ message: error.message });
    }
  }
);



subAssemblyproject.delete(
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

subAssemblyproject.post(
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
subAssemblyproject.put(
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
subAssemblyproject.put(
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

// Add this new route after the existing POST route
subAssemblyproject.put(
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

// delete for parts
subAssemblyproject.delete(
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

// Add this new route after the existing routes
subAssemblyproject.put(
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
subAssemblyproject.put(
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
subAssemblyproject.put(
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

// *********************subassembly allocation code***********************
// subAssemblyproject.post(
//   "/projects/:projectId/subAssemblyListFirst/:subAssemblyListFirstId/partsListItems/:partsListItemsId/allocation",
//   async (req, res) => {
//     try {
//       const { projectId, subAssemblyListFirstId, partsListItemsId } =
//         req.params;
//       const { allocations } = req.body;

//       if (!Array.isArray(allocations) || allocations.length === 0) {
//         return res.status(400).json({ message: "Invalid allocation data" });
//       }

//       // Find the project that contains the given subAssemblyListFirstId
//       const project = await PartListProjectModel.findOne({ _id: projectId });

//       if (!project) {
//         return res.status(404).json({ message: "Project not found" });
//       }

//       // Find the correct subAssemblyListFirst
//       const subAssemblyListFirst = project.subAssemblyListFirst.find(
//         (list) => list._id.toString() === subAssemblyListFirstId
//       );

//       if (!subAssemblyListFirst) {
//         return res
//           .status(404)
//           .json({ message: "Sub Assembly List First not found" });
//       }

//       // Find the correct part inside the subAssemblyListFirst
//       const partItem = subAssemblyListFirst.partsListItems.find(
//         (item) => item._id.toString() === partsListItemsId
//       );

//       if (!partItem) {
//         return res.status(404).json({ message: "Part List Item not found" });
//       }

//       // Append new allocations
//       allocations.forEach((alloc) => {
//         partItem.allocations.push({
//           partName: alloc.partName,
//           processName: alloc.processName,
//           processId: alloc.processId, // ✅ Add this
//           partsCodeId: alloc.partsCodeId,
//           allocations: alloc.allocations,
//         });
//       });

//       // Save the updated project
//       await project.save();

//       res.status(201).json({
//         message: "Allocations added successfully",
//         data: partItem.allocations,
//       });
//     } catch (error) {
//       console.error("Error adding allocations:", error);
//       res.status(500).json({ message: "Server error", error: error.message });
//     }
//   }
// );

subAssemblyproject.post(
  "/projects/:projectId/subAssemblyListFirst/:subAssemblyListFirstId/partsListItems/:partsListItemsId/allocation",
  async (req, res) => {
    try {
      const { projectId, subAssemblyListFirstId, partsListItemsId } = req.params;
      const { allocations } = req.body;

      if (!Array.isArray(allocations) || allocations.length === 0) {
        return res.status(400).json({ message: "Invalid allocation data" });
      }

      const project = await PartListProjectModel.findOne({ _id: projectId });
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const subAssemblyListFirst = project.subAssemblyListFirst.find(
        (list) => list._id.toString() === subAssemblyListFirstId
      );
      if (!subAssemblyListFirst) {
        return res.status(404).json({ message: "Parts List not found" });
      }

      const partItem = subAssemblyListFirst.partsListItems.find(
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

subAssemblyproject.get(
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

subAssemblyproject.delete(
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



subAssemblyproject.post(
  "/projects/:projectId/subAssemblyListFirst/:subAssemblyListFirstId/partsListItems/:partListItemId/allocations/:processId/allocations/:allocationId/dailyTracking",
  async (req, res) => {
    try {
      const {
        projectId,
        subAssemblyListFirstId, // ✅ corrected
        partListItemId,
        processId,
        allocationId,
      } = req.params;

      const { date, produced, operator } = req.body;

      // Input validation
      if (!date || isNaN(new Date(date))) {
        return res.status(400).json({ status: "error", message: "Invalid date provided" });
      }

      if (isNaN(produced)) {
        return res.status(400).json({ status: "error", message: "Produced quantity must be a number" });
      }

      // Fetch project
      const project = await PartListProjectModel.findById(projectId);
      if (!project) {
        return res.status(404).json({ status: "error", message: "Project not found" });
      }

      // Fetch subAssemblyListFirst
      const subAssemblyList = project.subAssemblyListFirst.id(subAssemblyListFirstId);
      if (!subAssemblyList) {
        return res.status(404).json({ status: "error", message: "Sub-assembly list not found" });
      }

      const partItem = subAssemblyList.partsListItems.id(partListItemId);
      if (!partItem) {
        return res.status(404).json({ status: "error", message: "Part list item not found" });
      }

      const process = partItem.allocations.id(processId);
      if (!process) {
        return res.status(404).json({ status: "error", message: "Process not found" });
      }

      const allocation = process.allocations.id(allocationId);
      if (!allocation) {
        return res.status(404).json({ status: "error", message: "Allocation not found" });
      }

      // Calculate or retrieve daily planned quantity
      let dailyPlannedQty = allocation.dailyPlannedQty;
      if (!dailyPlannedQty) {
        const shiftTotalTime = allocation.shiftTotalTime || 510;
        const perMachineTotalTime = allocation.perMachinetotalTime || 1;
        dailyPlannedQty = Math.floor(shiftTotalTime / perMachineTotalTime);
        allocation.dailyPlannedQty = dailyPlannedQty;
      }

      // Determine tracking status
      let calculatedStatus = "On Track";
      const producedQty = Number(produced);
      if (producedQty > dailyPlannedQty) calculatedStatus = "Ahead";
      else if (producedQty < dailyPlannedQty) calculatedStatus = "Delayed";

      const newTrackingEntry = {
        date: new Date(date),
        planned: dailyPlannedQty,
        produced: producedQty,
        operator: operator || allocation.operator || "",
        dailyStatus: calculatedStatus,
      };

      const existingTrackingIndex = allocation.dailyTracking.findIndex(
        (track) => new Date(track.date).toDateString() === new Date(date).toDateString()
      );

      if (existingTrackingIndex >= 0) {
        allocation.dailyTracking[existingTrackingIndex] = newTrackingEntry;
      } else {
        allocation.dailyTracking.push(newTrackingEntry);
      }

      allocation.dailyTracking.sort((a, b) => new Date(a.date) - new Date(b.date));

      const cumulativeProduced = allocation.dailyTracking.reduce(
        (sum, entry) => sum + (entry.produced || 0),
        0
      );

      let actualEndDate = new Date(allocation.endDate);
      if (cumulativeProduced >= allocation.plannedQuantity) {
        actualEndDate = new Date(allocation.dailyTracking[allocation.dailyTracking.length - 1].date);
      }

      allocation.actualEndDate = actualEndDate;

      await project.save();

      res.status(200).json({
        status: "success",
        message: "Daily tracking updated successfully",
        data: {
          _id: allocation._id,
          dailyPlannedQty: allocation.dailyPlannedQty,
          plannedQuantity: allocation.plannedQuantity,
          dailyTracking: allocation.dailyTracking,
          actualEndDate: allocation.actualEndDate,
          status: allocation.status,
          metrics: {
            cumulativeProduced,
            remainingQuantity: Math.max(0, allocation.plannedQuantity - cumulativeProduced),
            completionPercentage:
              allocation.plannedQuantity > 0
                ? Math.min(100, (cumulativeProduced / allocation.plannedQuantity) * 100)
                : 0,
          },
        },
      });
    } catch (error) {
      console.error("Error updating daily tracking:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to update daily tracking",
        error: error.message,
      });
    }
  }
);

subAssemblyproject.get(
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

///projects/:projectId/subAssemblyListFirst/:listId/items
subAssemblyproject.put('/projects/:projectId/subAssemblyListFirst/:listId/items/:itemId/complete', async (req, res) => {
  try {
    const project = await PartListProjectModel.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const partsList = project.subAssemblyListFirst.id(req.params.listId);
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
module.exports = subAssemblyproject;
