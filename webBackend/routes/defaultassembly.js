require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const assemblyListProject = express.Router();
const PartListProjectModel = require("../model/project/PartListProjectModel");
const ManufacturingModel = require("../model/manufacturingmodel");
const axios = require("axios");
const InchargeVariableModal = require("../model/inchargeVariable");

// for assmebly
assemblyListProject.get(
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

// Route to add a new Assembly Part List item
assemblyListProject.post(
  "/projects/:projectId/assemblyPartsLists",
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const {
        assemblyListName = "Unnamed Assembly Part List",
        partsListItems = [],
      } = req.body;
 
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ error: "Invalid project ID format" });
      }
 
      const project = await PartListProjectModel.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
 
      // Process each part item with status logic
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
          statusClass: "badge bg-info text-white",
        };
 
        if (item.isManuallyCompleted) {
          baseItem.status = "Completed";
          baseItem.statusClass = "badge bg-success text-white";
        }
 
        return baseItem;
      });
 
      const newAssemblyPartList = {
        assemblyListName,
        partsListItems: processedItems,
      };
 
      project.assemblyList.push(newAssemblyPartList);
      await project.save();
 
      res.status(201).json({
        status: "success",
        message: "New assembly part list added successfully",
        data: newAssemblyPartList,
      });
    } catch (error) {
      console.error("POST /assemblyPartsLists error:", error.message);
      res.status(500).json({ error: error.message });
    }
  }
);

// Route to get all Assembly Part List items
assemblyListProject.get(
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

      res.status(200).json({
        status: "success",
        message: "Assembly part lists retrieved successfully",
        data: project.assemblyPartsLists,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// edit the name for awsmebly
assemblyListProject.put(
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

assemblyListProject.delete(
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
assemblyListProject.post(
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
assemblyListProject.delete(
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
assemblyListProject.put(
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
assemblyListProject.put(
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
assemblyListProject.put(
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
assemblyListProject.put(
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

assemblyListProject.post(
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

// edit put reiqest for the assmebly sub assmebly
assemblyListProject.put(
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

assemblyListProject.post(
  "/projects/:projectId/assemblyList",
  async (req, res) => {
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
  }
);

// UPDATE quantity inside partsListItems in subAssemblyList
assemblyListProject.put(
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

assemblyListProject.put(
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

assemblyListProject.put(
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

assemblyListProject.put(
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

assemblyListProject.put(
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

assemblyListProject.put(
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
// delet for sub asmebly parts lists items
assemblyListProject.delete(
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

// ********************************************
// assembly allocation code
assemblyListProject.post(
  "/projects/:projectId/assemblyList/:assemblyListId/partsListItems/:partsListItemsId/allocation",
  async (req, res) => {
    try {
      const { projectId, assemblyListId, partsListItemsId } = req.params;
      const { allocations } = req.body;

      if (!Array.isArray(allocations) || allocations.length === 0) {
        return res.status(400).json({ message: "Invalid allocation data" });
      }

      const project = await PartListProjectModel.findOne({ _id: projectId });
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const assemblyList = project.assemblyList.find(
        (list) => list._id.toString() === assemblyListId
      );
      if (!assemblyList) {
        return res.status(404).json({ message: "Assembly List not found" });
      }

      const partItem = assemblyList.partsListItems.find(
        (item) => item._id.toString() === partsListItemsId
      );
      if (!partItem) {
        return res.status(404).json({ message: "Part List Item not found" });
      }

      // Clear existing allocations first
      partItem.allocations = [];

      // Add new allocations with calculated dailyPlannedQty
      allocations.forEach((alloc) => {
        const newAllocation = {
          partName: alloc.partName,
          processName: alloc.processName,
          processId: alloc.processId,
          partsCodeId: alloc.partsCodeId,
          allocations: alloc.allocations.map((a) => {
            const shiftTotalTime = a.shiftTotalTime || 510; // Default 8.5 hours
            const perMachinetotalTime = a.perMachinetotalTime || 1;
            const dailyPlannedQty = Math.floor(shiftTotalTime / perMachinetotalTime);

            return {
              ...a,
              dailyPlannedQty,
              dailyTracking: [],
            };
          }),
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
          statusClass: status.class,
        },
      });
    } catch (error) {
      console.error("Error adding allocations:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);


assemblyListProject.get(
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

assemblyListProject.delete(
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

      // Update status
      partItem.status = "Not Allocated";
      partItem.statusClass = "badge bg-info text-white";

      // Let Mongoose know a nested array has been modified
      project.markModified("assemblyList");

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


assemblyListProject.post(
  "/projects/:projectId/assemblyList/:assemblyListId/partsListItems/:partListItemId/allocations/:processId/allocations/:allocationId/dailyTracking",
  async (req, res) => {
    try {
      const {
        projectId,
        assemblyListId, // ✅ corrected param
        partListItemId,
        processId,
        allocationId,
      } = req.params;

      const { date, produced, operator } = req.body;

      // Validate inputs
      if (!date || isNaN(new Date(date))) {
        return res.status(400).json({
          status: "error",
          message: "Invalid date provided",
        });
      }

      if (isNaN(produced)) {
        return res.status(400).json({
          status: "error",
          message: "Produced quantity must be a number",
        });
      }

      // Fetch project
      const project = await PartListProjectModel.findById(projectId);
      if (!project) {
        return res.status(404).json({
          status: "error",
          message: "Project not found",
        });
      }

      // Fetch assembly list
      const assemblyList = project.assemblyList.id(assemblyListId);
      if (!assemblyList) {
        return res.status(404).json({
          status: "error",
          message: "Assembly list not found",
        });
      }

      // Find part item
      const partItem = assemblyList.partsListItems.id(partListItemId);
      if (!partItem) {
        return res.status(404).json({
          status: "error",
          message: "Part list item not found",
        });
      }

      const process = partItem.allocations.id(processId);
      if (!process) {
        return res.status(404).json({
          status: "error",
          message: "Process not found",
        });
      }

      const allocation = process.allocations.id(allocationId);
      if (!allocation) {
        return res.status(404).json({
          status: "error",
          message: "Allocation not found",
        });
      }

      // Calculate or retrieve daily planned quantity
      let dailyPlannedQty = allocation.dailyPlannedQty;
      if (!dailyPlannedQty) {
        const shiftTotalTime = allocation.shiftTotalTime || 510;
        const perMachineTotalTime = allocation.perMachinetotalTime || 1;
        dailyPlannedQty = Math.floor(shiftTotalTime / perMachineTotalTime);
        allocation.dailyPlannedQty = dailyPlannedQty;
      }

      // Determine daily status
      const producedQty = Number(produced);
      let calculatedStatus = "On Track";
      if (producedQty > dailyPlannedQty) {
        calculatedStatus = "Ahead";
      } else if (producedQty < dailyPlannedQty) {
        calculatedStatus = "Delayed";
      }

      const newTrackingEntry = {
        date: new Date(date),
        planned: dailyPlannedQty,
        produced: producedQty,
        operator: operator || allocation.operator || "",
        dailyStatus: calculatedStatus,
      };

      // Replace or add tracking entry
      const existingTrackingIndex = allocation.dailyTracking.findIndex(
        (track) =>
          new Date(track.date).toDateString() === new Date(date).toDateString()
      );

      if (existingTrackingIndex >= 0) {
        allocation.dailyTracking[existingTrackingIndex] = newTrackingEntry;
      } else {
        allocation.dailyTracking.push(newTrackingEntry);
      }

      allocation.dailyTracking.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Recalculate cumulative metrics
      let cumulativeProduced = 0;
      allocation.dailyTracking.forEach((entry) => {
        cumulativeProduced += entry.produced || 0;
      });

      // Set actual end date if completed
      let actualEndDate = new Date(allocation.endDate);
      if (cumulativeProduced >= allocation.plannedQuantity) {
        actualEndDate = new Date(
          allocation.dailyTracking[allocation.dailyTracking.length - 1].date
        );
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


assemblyListProject.get(
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

assemblyListProject.put('/projects/:projectId/assemblyList/:listId/items/:itemId/complete', async (req, res) => {
  try {
    const project = await PartListProjectModel.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const partsList = project.assemblyList.id(req.params.listId);
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

// assembly ka sub assembly allocation code
assemblyListProject.post(
  "/projects/:projectId/assemblyList/:assemblyListId/subAssemblies/:subAssembliesId/partsListItems/:partsListItemsId/allocation",
  async (req, res) => {
    try {
      const { projectId, assemblyListId, subAssembliesId, partsListItemsId } = req.params;
      const { allocations } = req.body;

      if (!Array.isArray(allocations) || allocations.length === 0) {
        return res.status(400).json({ message: "Invalid allocation data" });
      }

      const project = await PartListProjectModel.findOne({ _id: projectId });
      if (!project) return res.status(404).json({ message: "Project not found" });

      const assemblyList = project.assemblyList.find(
        (list) => list._id.toString() === assemblyListId
      );
      if (!assemblyList) return res.status(404).json({ message: "Assembly List not found" });

      const subAssembly = assemblyList.subAssemblies.find(
        (sub) => sub._id.toString() === subAssembliesId
      );
      if (!subAssembly) return res.status(404).json({ message: "Sub Assembly not found" });

      const partItem = subAssembly.partsListItems.find(
        (item) => item._id.toString() === partsListItemsId
      );
      if (!partItem) return res.status(404).json({ message: "Part List Item not found" });

      // Clear existing allocations first
      partItem.allocations = [];

      // Add new allocations with calculated dailyPlannedQty
      allocations.forEach((alloc) => {
        const newAllocation = {
          partName: alloc.partName,
          processName: alloc.processName,
          processId: alloc.processId,
          partsCodeId: alloc.partsCodeId,
          allocations: alloc.allocations.map((a) => {
            const shiftTotalTime = a.shiftTotalTime || 510; // 8.5 hours in minutes
            const perMachinetotalTime = a.perMachinetotalTime || 1;
            const dailyPlannedQty = Math.floor(shiftTotalTime / perMachinetotalTime);

            return {
              ...a,
              dailyPlannedQty,
              dailyTracking: [],
            };
          }),
        };
        partItem.allocations.push(newAllocation);
      });

      // Calculate and update status
      const status = partItem.calculateStatus();
      partItem.status = status.text;
      partItem.statusClass = status.class;

      await project.save();

      res.status(201).json({
        message: "Allocations added successfully",
        data: {
          ...partItem.toObject(),
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

assemblyListProject.get(
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

assemblyListProject.delete(
  "/projects/:projectId/assemblyList/:assemblyListId/subAssemblies/:subAssembliesId/partsListItems/:partsListItemsId/allocations",
  async (req, res) => {
    try {
      const { projectId, assemblyListId, subAssembliesId, partsListItemsId } = req.params;

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

      // Clear allocations
      partItem.allocations = [];

      // Update status
      partItem.status = "Not Allocated";
      partItem.statusClass = "badge bg-info text-white";

      // Let Mongoose know the deeply nested field was modified
      project.markModified("assemblyList");

      await project.save();

      res.status(200).json({ message: "All allocations deleted successfully" });
    } catch (error) {
      console.error("Error deleting allocations:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);


assemblyListProject.post(
  "/projects/:projectId/assemblyList/:assemblyListId/subAssemblies/:subAssemblyId/partsListItems/:partListItemId/allocations/:processId/allocations/:allocationId/dailyTracking",
  async (req, res) => {
    try {
      const {
        projectId,
        assemblyListId,
        subAssemblyId,
        partListItemId,
        processId,
        allocationId,
      } = req.params;

      const { date, produced, operator } = req.body;

      // Validate inputs
      if (!date || isNaN(new Date(date))) {
        return res.status(400).json({
          status: "error",
          message: "Invalid date provided",
        });
      }

      if (isNaN(produced)) {
        return res.status(400).json({
          status: "error",
          message: "Produced quantity must be a number",
        });
      }

      const project = await PartListProjectModel.findById(projectId);
      if (!project) {
        return res.status(404).json({
          status: "error",
          message: "Project not found",
        });
      }

      const assembly = project.assemblyList.id(assemblyListId);
      if (!assembly) {
        return res.status(404).json({
          status: "error",
          message: "Assembly list not found",
        });
      }

      const subAssembly = assembly.subAssemblies.id(subAssemblyId);
      if (!subAssembly) {
        return res.status(404).json({
          status: "error",
          message: "Sub-assembly not found",
        });
      }

      const partItem = subAssembly.partsListItems.id(partListItemId);
      if (!partItem) {
        return res.status(404).json({
          status: "error",
          message: "Part list item not found",
        });
      }

      const process = partItem.allocations.id(processId);
      if (!process) {
        return res.status(404).json({
          status: "error",
          message: "Process not found",
        });
      }

      const allocation = process.allocations.id(allocationId);
      if (!allocation) {
        return res.status(404).json({
          status: "error",
          message: "Allocation not found",
        });
      }

      // Calculate or use existing dailyPlannedQty
      let dailyPlannedQty = allocation.dailyPlannedQty;
      if (!dailyPlannedQty) {
        const shiftTotalTime = allocation.shiftTotalTime || 510;
        const perMachineTotalTime = allocation.perMachinetotalTime || 1;
        dailyPlannedQty = Math.floor(shiftTotalTime / perMachineTotalTime);
        allocation.dailyPlannedQty = dailyPlannedQty;
      }

      // Determine tracking status
      const producedQty = Number(produced);
      let calculatedStatus = "On Track";
      if (producedQty > dailyPlannedQty) {
        calculatedStatus = "Ahead";
      } else if (producedQty < dailyPlannedQty) {
        calculatedStatus = "Delayed";
      }

      const newTrackingEntry = {
        date: new Date(date),
        planned: dailyPlannedQty,
        produced: producedQty,
        operator: operator || allocation.operator || "",
        dailyStatus: calculatedStatus,
      };

      // Replace or add today's tracking entry
      const existingTrackingIndex = allocation.dailyTracking.findIndex(
        (track) =>
          new Date(track.date).toDateString() === new Date(date).toDateString()
      );

      if (existingTrackingIndex >= 0) {
        allocation.dailyTracking[existingTrackingIndex] = newTrackingEntry;
      } else {
        allocation.dailyTracking.push(newTrackingEntry);
      }

      // Sort by date
      allocation.dailyTracking.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Recalculate cumulative produced
      const cumulativeProduced = allocation.dailyTracking.reduce(
        (sum, entry) => sum + (entry.produced || 0),
        0
      );

      // Set actual end date if production is complete
      let actualEndDate = new Date(allocation.endDate);
      if (cumulativeProduced >= allocation.plannedQuantity) {
        actualEndDate = new Date(
          allocation.dailyTracking[allocation.dailyTracking.length - 1].date
        );
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

assemblyListProject.get(
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

assemblyListProject.put('/projects/:projectId/assemblyList/:listId/subAssemblies/:subAssembliesId/items/:itemId/complete', async (req, res) => {
  try {
    const project = await PartListProjectModel.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const partsList = project.assemblyList.id(req.params.listId);
    if (!partsList) {
      return res.status(404).json({ message: 'Parts list not found' });
    }

    // Find the correct subAssembly
    const subAssembly = partsList.subAssemblies.find(
      (sub) => sub._id.toString() === req.params.subAssembliesId
    );
    if (!subAssembly) {
      return res.status(404).json({ message: 'Sub-Assembly not found' });
    }

    // Find the correct partsListItem within the subAssembly
    const partsListItem = subAssembly.partsListItems.find(
      (item) => item._id.toString() === req.params.itemId
    );
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

module.exports = assemblyListProject;
