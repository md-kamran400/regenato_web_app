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

// assembly ka sub assembly allocation code
assemblyListProject.post(
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

assemblyListProject.post(
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
module.exports = assemblyListProject;
