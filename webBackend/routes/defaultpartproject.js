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
// Special-Day sync in-memory job store
const specialDayJobs = new Map();
// job shape: {
//   partsCodeId: string,
//   currentWarehouseId: string,
//   nextWarehouseId: string,
//   lastSyncedQuantity: number
// }

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
      postingdate,
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
    // selectedPartId now carries ItemCode (external id), not Mongo _id
    // Use search endpoint and pick exact id match
    const searchUrl = `${
      process.env.BASE_URL
    }/api/parts?search=${encodeURIComponent(selectedPartId)}`;
    const partResponse = await fetch(searchUrl);
    if (!partResponse.ok) {
      throw new Error("Failed to fetch part details");
    }
    const partList = await partResponse.json();
    const partData = Array.isArray(partList?.data)
      ? partList.data.find(
          (p) =>
            String(p.id || "")
              .trim()
              .toLowerCase() ===
            String(selectedPartId || "")
              .trim()
              .toLowerCase()
        )
      : null;
    if (!partData) {
      throw new Error("Failed to fetch part details");
    }

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
      postingdate,
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

// production_with_parts

partproject.post("/production_with_parts", async (req, res) => {
  try {
    const {
      projectName,
      projectType,
      postingdate,
      selectedPartId,
      selectedPartName,
      partQuantity,
    } = req.body;

    // ✅ Validate inputs
    if (!projectName || !projectType) {
      return res
        .status(400)
        .json({ error: "Project name and type are required" });
    }
    if (!selectedPartId || !selectedPartName || !partQuantity) {
      return res
        .status(400)
        .json({ error: "Part selection and quantity are required" });
    }

    // ✅ Fetch complete part details from parts API
    const searchUrl = `${
      process.env.BASE_URL
    }/api/parts?search=${encodeURIComponent(selectedPartId)}`;
    const partResponse = await fetch(searchUrl);
    if (!partResponse.ok) throw new Error("Failed to fetch part details");
    const partList = await partResponse.json();
    const partData = Array.isArray(partList?.data)
      ? partList.data.find(
          (p) =>
            String(p.id || "")
              .trim()
              .toLowerCase() ===
            String(selectedPartId || "")
              .trim()
              .toLowerCase()
        )
      : null;
    if (!partData) throw new Error("Part not found in master list");

    // ✅ Build part object
    const partItem = {
      partsCodeId: selectedPartId,
      partName: selectedPartName,
      quantity: Number(partQuantity),
      status: "Not Allocated",
      statusClass: "badge bg-info text-black",
      isManuallyCompleted: false,
      ...partData,
      costPerUnit: Number(partData.costPerUnit) || 0,
      timePerUnit: Number(partData.timePerUnit) || 0,
      rmVariables: partData.rmVariables || [],
      manufacturingVariables: partData.manufacturingVariables || [],
      shipmentVariables: partData.shipmentVariables || [],
      overheadsAndProfits: partData.overheadsAndProfits || [],
    };

    // ✅ Create project with partsList
    const newProject = new PartListProjectModel({
      projectName,
      projectType,
      postingdate,
      costPerUnit: 0,
      timePerUnit: 0,
      stockPoQty: 0,
      partsLists: [
        {
          partsListName: `${projectName}-Parts`,
          partsListItems: [partItem],
        },
      ],
      machineHours: {},
    });

    // Save first to get _id
    await newProject.save();

    // ✅ Calculate totals
    let totalProjectCost = 0;
    let totalProjectHours = 0;
    const machineHours = {};

    newProject.partsLists.forEach((partsList) => {
      partsList.partsListItems.forEach((part) => {
        const partTotalCost = (part.costPerUnit || 0) * (part.quantity || 0);
        const partTotalHours = (part.timePerUnit || 0) * (part.quantity || 0);

        totalProjectCost += partTotalCost;
        totalProjectHours += partTotalHours;

        if (Array.isArray(part.manufacturingVariables)) {
          part.manufacturingVariables.forEach((machine) => {
            const machineName = machine.name;
            const hours = (machine.hours || 0) * (part.quantity || 0);
            machineHours[machineName] =
              (machineHours[machineName] || 0) + hours;
          });
        }
      });
    });

    newProject.costPerUnit = totalProjectCost;
    newProject.timePerUnit = totalProjectHours;
    newProject.machineHours = machineHours;

    await newProject.save();

    res.status(201).json(newProject);
  } catch (error) {
    console.error("Error in /production_with_parts:", error);
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
      .select(
        "projectName createdAt projectType costPerUnit timePerUnit machineHours partsLists subAssemblyListFirst assemblyList"
      )
      .lean(); // Use lean() for faster plain JS objects

    // Process calculations in memory without saving
    const processedProjects = projects.map((project) => {
      let totalProjectCost = 0;
      let totalProjectHours = 0;
      const machineHours = {};

      // Helper function to process parts list items
      const processItems = (items) => {
        items.forEach((item) => {
          const costPerUnit = Number(item.costPerUnit) || 0;
          const timePerUnit = Number(item.timePerUnit) || 0;
          const quantity = Number(item.quantity) || 0;

          const itemTotalCost = costPerUnit * quantity;
          const itemTotalHours = timePerUnit * quantity;

          totalProjectCost += itemTotalCost;
          totalProjectHours += itemTotalHours;

          // Process manufacturing variables if they exist
          if (Array.isArray(item.manufacturingVariables)) {
            item.manufacturingVariables.forEach((machine) => {
              const machineName = machine.name;
              const machineHoursVal = Number(machine.hours) || 0;
              const totalHours = machineHoursVal * quantity;
              machineHours[machineName] =
                (machineHours[machineName] || 0) + totalHours;
            });
          }
        });
      };

      // Process all parts lists
      if (project.partsLists) {
        project.partsLists.forEach((partsList) => {
          if (partsList.partsListItems) {
            processItems(partsList.partsListItems);
          }
        });
      }

      // Process sub assemblies if they exist
      if (project.subAssemblyListFirst) {
        project.subAssemblyListFirst.forEach((subAssembly) => {
          if (subAssembly.partsListItems) {
            processItems(subAssembly.partsListItems);
          }
        });
      }

      // Process assemblies if they exist
      if (project.assemblyList) {
        project.assemblyList.forEach((assembly) => {
          if (assembly.partsListItems) {
            processItems(assembly.partsListItems);
          }
          if (assembly.subAssemblies) {
            assembly.subAssemblies.forEach((subAssembly) => {
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
        machineHours: machineHours,
      };
    });

    // ✅ Send response with total project count and data
    res.status(200).json({
      totalProjects: processedProjects.length,
      data: processedProjects,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// partproject.get("/projectss", async (req, res) => {
//   try {
//     const { filterType, page = 1, limit = 20, search } = req.query;

//     // Build query
//     const query = {};
//     if (filterType) query.projectType = filterType;
//     if (search) query.projectName = { $regex: search, $options: "i" };

//     // Pagination setup
//     const pageNum = Math.max(1, parseInt(page));
//     const limitNum = Math.max(1, parseInt(limit));
//     const skip = (pageNum - 1) * limitNum;

//     // Get total count for pagination
//     const totalCount = await PartListProjectModel.countDocuments(query);

//     // Fetch projects (for current page)
//     const projects = await PartListProjectModel.find(query)
//       .select(
//         "projectName createdAt projectType costPerUnit timePerUnit machineHours partsLists subAssemblyListFirst assemblyList"
//       )
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limitNum)
//       .lean();

//     // 🧮 Process calculations
//     const processedProjects = projects.map((project) => {
//       let totalProjectCost = 0;
//       let totalProjectHours = 0;
//       const machineHours = {};

//       const processItems = (items) => {
//         items.forEach((item) => {
//           const costPerUnit = Number(item.costPerUnit) || 0;
//           const timePerUnit = Number(item.timePerUnit) || 0;
//           const quantity = Number(item.quantity) || 0;

//           totalProjectCost += costPerUnit * quantity;
//           totalProjectHours += timePerUnit * quantity;

//           if (Array.isArray(item.manufacturingVariables)) {
//             item.manufacturingVariables.forEach((machine) => {
//               const machineName = machine.name;
//               const machineHoursVal = Number(machine.hours) || 0;
//               const totalHours = machineHoursVal * quantity;
//               machineHours[machineName] =
//                 (machineHours[machineName] || 0) + totalHours;
//             });
//           }
//         });
//       };

//       if (project.partsLists) {
//         project.partsLists.forEach((partsList) => {
//           if (partsList.partsListItems) processItems(partsList.partsListItems);
//         });
//       }

//       if (project.subAssemblyListFirst) {
//         project.subAssemblyListFirst.forEach((subAssembly) => {
//           if (subAssembly.partsListItems) processItems(subAssembly.partsListItems);
//         });
//       }

//       if (project.assemblyList) {
//         project.assemblyList.forEach((assembly) => {
//           if (assembly.partsListItems) processItems(assembly.partsListItems);
//           if (assembly.subAssemblies) {
//             assembly.subAssemblies.forEach((subAssembly) => {
//               if (subAssembly.partsListItems) processItems(subAssembly.partsListItems);
//             });
//           }
//         });
//       }

//       return {
//         ...project,
//         costPerUnit: totalProjectCost,
//         timePerUnit: totalProjectHours,
//         machineHours: machineHours,
//       };
//     });

//     // 🧩 Find duplicates in the entire collection (not just paginated data)
//     const duplicateNames = await PartListProjectModel.aggregate([
//       {
//         $group: {
//           _id: "$projectName",
//           count: { $sum: 1 },
//         },
//       },
//       {
//         $match: {
//           count: { $gt: 1 },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           projectName: "$_id",
//           count: 1,
//         },
//       },
//     ]);

//     // 📨 Return full response
//     res.status(200).json({
//       success: true,
//       data: processedProjects,
//       pagination: {
//         currentPage: pageNum,
//         totalPages: Math.ceil(totalCount / limitNum),
//         totalItems: totalCount,
//         itemsPerPage: limitNum,
//         hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
//         hasPrevPage: pageNum > 1,
//       },
//       duplicates: duplicateNames.length
//         ? {
//             totalDuplicates: duplicateNames.length,
//             details: duplicateNames,
//           }
//         : null,
//     });
//   } catch (error) {
//     console.error("Error in /projects route:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   }
// });

partproject.get("/projectss", async (req, res) => {
  try {
    const {
      filterType,
      page = 1,
      limit = 20,
      search,
      excludeExisting,
    } = req.query;

    // Build query for projects table itself
    const query = {};
    if (filterType) query.projectType = filterType;
    if (search) query.projectName = { $regex: search, $options: "i" };

    // If excludeExisting=true, filter out projects that already exist
    if (excludeExisting === "true") {
      const existingNames = await PartListProjectModel.distinct("projectName");
      if (existingNames.length > 0) {
        query.projectName = { ...query.projectName, $nin: existingNames };
      }
    }

    // Pagination setup
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await PartListProjectModel.countDocuments(query);

    const projects = await PartListProjectModel.find(query)
      .select(
        "projectName createdAt projectType costPerUnit timePerUnit machineHours partsLists subAssemblyListFirst assemblyList"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const processedProjects = projects.map((project) => {
      let totalProjectCost = 0;
      let totalProjectHours = 0;
      const machineHours = {};

      const processItems = (items) => {
        items.forEach((item) => {
          const costPerUnit = Number(item.costPerUnit) || 0;
          const timePerUnit = Number(item.timePerUnit) || 0;
          const quantity = Number(item.quantity) || 0;

          totalProjectCost += costPerUnit * quantity;
          totalProjectHours += timePerUnit * quantity;

          if (Array.isArray(item.manufacturingVariables)) {
            item.manufacturingVariables.forEach((machine) => {
              const machineName = machine.name;
              const machineHoursVal = Number(machine.hours) || 0;
              const totalHours = machineHoursVal * quantity;
              machineHours[machineName] =
                (machineHours[machineName] || 0) + totalHours;
            });
          }
        });
      };

      if (project.partsLists) {
        project.partsLists.forEach((pl) => {
          if (pl.partsListItems) processItems(pl.partsListItems);
        });
      }
      if (project.subAssemblyListFirst) {
        project.subAssemblyListFirst.forEach((sa) => {
          if (sa.partsListItems) processItems(sa.partsListItems);
        });
      }
      if (project.assemblyList) {
        project.assemblyList.forEach((assembly) => {
          if (assembly.partsListItems) processItems(assembly.partsListItems);
          if (assembly.subAssemblies) {
            assembly.subAssemblies.forEach((subAssembly) => {
              if (subAssembly.partsListItems)
                processItems(subAssembly.partsListItems);
            });
          }
        });
      }

      return {
        ...project,
        costPerUnit: totalProjectCost,
        timePerUnit: totalProjectHours,
        machineHours,
      };
    });

    res.status(200).json({
      success: true,
      data: processedProjects,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalItems: totalCount,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Error in /projects route:", error);
    res.status(500).json({ success: false, error: error.message });
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
      postingdate: originalProject.postingdate,
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
      allocations.forEach((alloc, allocationIndex) => {
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

            // Create BLNK transfer data for first process only (index 0)
            let blankStoreTransfer = null;
            if (allocationIndex === 0) {
              blankStoreTransfer = {
                blankStoreName: "BLNK",
                blankStoreQty: plannedQuantity, // Set to required quantity
                firstProcessWarehouseName: a.wareHouse || a.warehouseId,
                firstProcessWarehouseQty: 0, // Will be updated when warehouse quantity is fetched
                transferTimestamp: new Date().toISOString(),
              };
            }

            return {
              ...a,
              dailyPlannedQty,
              dailyTracking: [],
              remaining: 0, // Initialize remaining to plannedQuantity for first process
              // Include BLNK transfer data for first process
              ...(blankStoreTransfer && { blankStoreTransfer }),
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

      // Fetch warehouse quantity for this part with dual validation
      try {
        if (partItem.partsCodeId) {
          // console.log(`Fetching warehouse quantity for part with partsCodeId: ${partItem.partsCodeId}`);
          const goodsReceiptRes = await axios.get(
            `${baseUrl}/api/GetGoodsReceipt`,
            { timeout: 10000 }
          );

          // console.log(`Received ${goodsReceiptRes.data.length} items from GetGoodsReceipt API`);

          // Process each allocation to find and store matching warehouse quantity
          const updatedAllocations = await Promise.all(
            partItem.allocations.map(async (allocation, allocationIndex) => {
              let warehouseQuantity = 0;

              if (allocation.warehouseId) {
                // Find matching item with dual validation:
                // 1. Itemcode matches partsCodeId
                // 2. WhsCode matches warehouseId
                const match = goodsReceiptRes.data.find(
                  (item) =>
                    String(item.Itemcode).trim().toLowerCase() ===
                      String(partItem.partsCodeId).trim().toLowerCase() &&
                    String(item.WhsCode).trim().toLowerCase() ===
                      String(allocation.warehouseId).trim().toLowerCase()
                );

                if (match) {
                  warehouseQuantity = match.Quantity;
                  console.log(
                    `✅ Found matching warehouse quantity: ${warehouseQuantity}`
                  );

                  // Update the allocation's warehouseQuantity in the database
                  allocation.warehouseQuantity = warehouseQuantity;

                  // Update blankStoreTransfer for first process (index 0)
                  if (allocationIndex === 0 && allocation.blankStoreTransfer) {
                    allocation.blankStoreTransfer.firstProcessWarehouseQty =
                      warehouseQuantity;
                  }
                }
              }

              return allocation;
            })
          );

          // Save the updated allocations with warehouse quantities
          await project.save();

          // Return the updated allocations
          res.status(200).json({
            message: "Allocations retrieved successfully",
            data: partItem.allocations,
          });
        } else {
          console.log(`⚠️ No partsCodeId found for part item`);
          res.status(200).json({
            message: "Allocations retrieved successfully",
            data: partItem.allocations,
          });
        }
      } catch (err) {
        console.error("Error fetching warehouse quantity:", err.message);
        res.status(200).json({
          message: "Allocations retrieved successfully",
          data: partItem.allocations,
        });
      }
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
//         projectName,
//         partName,
//         processName,
//         fromWarehouse,
//         fromWarehouseQty,
//         fromWarehouseRemainingQty,
//         toWarehouse,
//         toWarehouseQty,
//         toWarehouseRemainingQty,
//         remaining,
//         machineId,
//         shift,
//         partsCodeId,
//         actualEndTime: requestedActualEndTime,

//         // ✅ Newly added fields
//         rejectedWarehouse,
//         rejectedWarehouseId,
//         rejectedWarehouseQuantity,
//         remarks,
//       } = req.body;

//       if (!date || produced === undefined) {
//         return res
//           .status(400)
//           .json({ error: "Date and produced quantity are required" });
//       }

//       // Fetch project
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

//       // === Calculate daily planned quantity ===
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

//       // === Check if entry for same date exists ===
//       const existingEntryIndex = allocation.dailyTracking.findIndex(
//         (e) => new Date(e.date).toISOString() === new Date(date).toISOString()
//       );

//       // === Build tracking entry ===
//       const trackingEntry = {
//         date,
//         planned: dailyPlannedQty,
//         produced: Number(produced),
//         operator: operator || allocation.operator,
//         dailyStatus:
//           dailyStatus ||
//           (produced > dailyPlannedQty
//             ? "Ahead"
//             : produced < dailyPlannedQty
//             ? "Delayed"
//             : "On Track"),
//         wareHouseTotalQty: Number(wareHouseTotalQty) || 0,
//         wareHouseremainingQty: Number(wareHouseremainingQty) || 0,

//         projectName: projectName || project.projectName,
//         partName: partName || partItem.partName,
//         processName: processName || process.processName,
//         fromWarehouse: fromWarehouse || allocation.fromWarehouse,
//         fromWarehouseQty: Number(fromWarehouseQty) || 0,
//         fromWarehouseRemainingQty: Number(fromWarehouseRemainingQty) || 0,
//         toWarehouse: toWarehouse || allocation.wareHouse,
//         toWarehouseQty: Number(toWarehouseQty) || 0,
//         toWarehouseRemainingQty: Number(toWarehouseRemainingQty) || 0,
//         remaining: Number(remaining) || 0,
//         machineId: machineId || allocation.machineId,
//         shift: shift || allocation.shift,
//         partsCodeId: partsCodeId || partItem.partsCodeId,

//         // ✅ Add newly added fields
//         rejectedWarehouse: rejectedWarehouse || "",
//         rejectedWarehouseId: rejectedWarehouseId || "",
//         rejectedWarehouseQuantity: Number(rejectedWarehouseQuantity) || 0,
//         remarks: remarks || "",
//       };

//       // === Push or update ===
//       if (existingEntryIndex >= 0) {
//         allocation.dailyTracking[existingEntryIndex] = trackingEntry;
//       } else {
//         allocation.dailyTracking.push(trackingEntry);
//       }

//       allocation.dailyTracking.sort(
//         (a, b) => new Date(a.date) - new Date(b.date)
//       );

//       // === Totals & Remaining ===
//       const totalProduced = allocation.dailyTracking.reduce(
//         (sum, entry) => sum + entry.produced,
//         0
//       );
//       const remainingQuantity = Math.max(0, plannedQuantity - totalProduced);

//       // === Calculate Actual End Date & Time ===
//       let actualEndDate = allocation.endDate;
//       let actualEndTime = allocation.endTime;

//       if (remainingQuantity <= 0) {
//         const productionDates = allocation.dailyTracking
//           .filter((entry) => entry.produced > 0)
//           .map((entry) => new Date(entry.date));

//         if (productionDates.length > 0) {
//           const lastProductionDate = new Date(Math.max(...productionDates));
//           actualEndDate = lastProductionDate;
//           actualEndTime = requestedActualEndTime || allocation.endTime;
//         }
//       } else {
//         actualEndTime = requestedActualEndTime || allocation.endTime;
//         actualEndDate = allocation.endDate;
//       }

//       allocation.actualEndDate = actualEndDate;
//       allocation.actualEndTime = actualEndTime;

//       await project.save();

//       res.status(201).json({
//         message: "Daily tracking updated successfully",
//         data: {
//           dailyPlannedQty,
//           totalProduced,
//           remainingQuantity,
//           actualEndDate: allocation.actualEndDate,
//           actualEndTime: allocation.actualEndTime,
//           wareHouseTotalQty: trackingEntry.wareHouseTotalQty,
//           wareHouseremainingQty: trackingEntry.wareHouseremainingQty,
//           rejectedWarehouse: trackingEntry.rejectedWarehouse,
//           rejectedWarehouseId: trackingEntry.rejectedWarehouseId,
//           rejectedWarehouseQuantity:
//             trackingEntry.rejectedWarehouseQuantity || 0,
//           remarks: trackingEntry.remarks || "",
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
        projectName,
        partName,
        processName,
        fromWarehouse,
        fromWarehouseQty,
        fromWarehouseRemainingQty,
        toWarehouse,
        toWarehouseQty,
        toWarehouseRemainingQty,
        remaining,
        machineId,
        shift,
        partsCodeId,
        actualEndTime: requestedActualEndTime,

        // ✅ Newly added fields
        rejectedWarehouse,
        rejectedWarehouseId,
        rejectedWarehouseQuantity,
        remarks,
      } = req.body;

      if (!date || produced === undefined) {
        return res
          .status(400)
          .json({ error: "Date and produced quantity are required" });
      }

      // Fetch project
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

      // === Calculate daily planned quantity ===
      const shiftTotalTime = allocation.shiftTotalTime || 510;
      const perMachinetotalTime = allocation.perMachinetotalTime || 1;
      const plannedQuantity = allocation.plannedQuantity || 0;

      let dailyPlannedQty;
      if (perMachinetotalTime <= 0) {
        dailyPlannedQty = plannedQuantity;
      } else {
        const totalTimeRequired = plannedQuantity * perMachinetotalTime;
        dailyPlannedQty =
          totalTimeRequired <= shiftTotalTime
            ? plannedQuantity
            : Math.floor(shiftTotalTime / perMachinetotalTime);
      }

      dailyPlannedQty = Math.max(1, dailyPlannedQty);
      allocation.dailyPlannedQty = dailyPlannedQty;

      // === Check if entry for same date exists ===
      const existingEntryIndex = allocation.dailyTracking.findIndex(
        (e) => new Date(e.date).toISOString() === new Date(date).toISOString()
      );

      // === Build tracking entry ===
      const trackingEntry = {
        date,
        planned: dailyPlannedQty,
        produced: Number(produced) || 0,
        operator: operator || allocation.operator,
        dailyStatus:
          dailyStatus ||
          (produced > dailyPlannedQty
            ? "Ahead"
            : produced < dailyPlannedQty
            ? "Delayed"
            : "On Track"),
        wareHouseTotalQty: Number(wareHouseTotalQty) || 0,
        wareHouseremainingQty: Number(wareHouseremainingQty) || 0,

        projectName: projectName || project.projectName,
        partName: partName || partItem.partName,
        processName: processName || process.processName,
        fromWarehouse: fromWarehouse || allocation.fromWarehouse,
        fromWarehouseQty: Number(fromWarehouseQty) || 0,
        fromWarehouseRemainingQty: Number(fromWarehouseRemainingQty) || 0,
        toWarehouse: toWarehouse || allocation.wareHouse,
        toWarehouseQty: Number(toWarehouseQty) || 0,
        toWarehouseRemainingQty: Number(toWarehouseRemainingQty) || 0,
        remaining: Number(remaining) || 0,
        machineId: machineId || allocation.machineId,
        shift: shift || allocation.shift,
        partsCodeId: partsCodeId || partItem.partsCodeId,

        // ✅ Add newly added fields (ensure numeric default)
        rejectedWarehouse: rejectedWarehouse || "",
        rejectedWarehouseId: rejectedWarehouseId || "",
        rejectedWarehouseQuantity: Number(rejectedWarehouseQuantity) || 0,
        remarks: remarks || "",
      };

      // === Push or update ===
      if (existingEntryIndex >= 0) {
        allocation.dailyTracking[existingEntryIndex] = trackingEntry;
      } else {
        allocation.dailyTracking.push(trackingEntry);
      }

      allocation.dailyTracking.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      // === Totals & Remaining ===
      // IMPORTANT: include both produced and rejection when summing 'consumed' qty
      const totalProduced = allocation.dailyTracking.reduce((sum, entry) => {
        const p = Number(entry.produced) || 0;
        const r = Number(entry.rejectedWarehouseQuantity) || 0;
        return sum + p + r;
      }, 0);

      // === Calculate Actual Planned Quantity for Current Process ===
      // For first process: use plannedQuantity
      // For subsequent processes: use previous process's produced quantity (not including rejection)
      let actualPlannedForCurrentProcess = plannedQuantity;
      
      // Find the current process index in the allocations array
      const currentProcessIndex = partItem.allocations.findIndex(
        (p) => p._id.toString() === processId
      );
      
      // If this is not the first process, get previous process's produced quantity
      if (currentProcessIndex > 0) {
        const previousProcess = partItem.allocations[currentProcessIndex - 1];
        if (previousProcess && previousProcess.allocations && previousProcess.allocations.length > 0) {
          // Get the first allocation from previous process (usually there's one per process)
          const previousAllocation = previousProcess.allocations[0];
          if (previousAllocation && previousAllocation.dailyTracking && previousAllocation.dailyTracking.length > 0) {
            // Sum only produced (not rejection) from previous process
            const previousProduced = previousAllocation.dailyTracking.reduce(
              (sum, entry) => sum + (Number(entry.produced) || 0),
              0
            );
            actualPlannedForCurrentProcess = previousProduced;
          } else {
            // If previous process has no daily tracking yet, use its plannedQuantity
            actualPlannedForCurrentProcess = previousAllocation?.plannedQuantity || 0;
          }
        }
      }

      // Calculate remaining: actualPlanned - (produced + rejected)
      const remainingQuantity = Math.max(0, actualPlannedForCurrentProcess - totalProduced);
      
      // Store remaining in the allocation document
      allocation.remaining = remainingQuantity;

      // === Calculate Actual End Date & Time ===
      let actualEndDate = allocation.endDate;
      let actualEndTime = allocation.endTime;

      if (remainingQuantity <= 0) {
        const productionDates = allocation.dailyTracking
          .filter((entry) => (Number(entry.produced) || 0) > 0)
          .map((entry) => new Date(entry.date));

        if (productionDates.length > 0) {
          const lastProductionDate = new Date(Math.max(...productionDates));
          actualEndDate = lastProductionDate;
          actualEndTime = requestedActualEndTime || allocation.endTime;
        }
      } else {
        actualEndTime = requestedActualEndTime || allocation.endTime;
        actualEndDate = allocation.endDate;
      }

      allocation.actualEndDate = actualEndDate;
      allocation.actualEndTime = actualEndTime;

      await project.save();

      res.status(201).json({
        message: "Daily tracking updated successfully",
        data: {
          dailyPlannedQty,
          totalProduced, // now includes rejection
          remainingQuantity,
          remaining: allocation.remaining, // Return stored remaining value
          actualPlannedForCurrentProcess,
          actualEndDate: allocation.actualEndDate,
          actualEndTime: allocation.actualEndTime,
          wareHouseTotalQty: trackingEntry.wareHouseTotalQty,
          wareHouseremainingQty: trackingEntry.wareHouseremainingQty,
          rejectedWarehouse: trackingEntry.rejectedWarehouse,
          rejectedWarehouseId: trackingEntry.rejectedWarehouseId,
          rejectedWarehouseQuantity:
            trackingEntry.rejectedWarehouseQuantity || 0,
          remarks: trackingEntry.remarks || "",
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
        actualEndTime: allocation.actualEndTime,
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

        // Check if remaining is 0 for this allocation
        if (allocation.remaining !== undefined && allocation.remaining > 0) {
          return res.status(400).json({ 
            message: `Cannot complete allocation. Remaining quantity is ${allocation.remaining}. All remaining quantities must be 0 to complete.` 
          });
        }

        // Mark this specific allocation as completed
        allocation.actualEndDate = new Date();
        if (allocation.dailyTracking && allocation.dailyTracking.length > 0) {
          allocation.dailyTracking.forEach((track) => {
            track.dailyStatus = "Completed";
          });
        }
      } else {
        // Complete all allocations - Check if all processes have remaining = 0
        let allRemainingZero = true;
        const processesWithRemaining = [];

        partsListItem.allocations.forEach((process) => {
          process.allocations.forEach((alloc) => {
            // Ensure remaining is calculated and stored
            if (alloc.remaining === undefined || alloc.remaining > 0) {
              allRemainingZero = false;
              processesWithRemaining.push({
                processName: process.processName,
                remaining: alloc.remaining || 0
              });
            }
          });
        });

        if (!allRemainingZero) {
          return res.status(400).json({ 
            message: "Cannot complete allocation. All processes must have remaining quantity = 0.",
            details: processesWithRemaining
          });
        }

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

// partproject.get("/all-allocations", async (req, res) => {
//   try {
//     // Optimize the query by selecting only necessary fields and reducing populate operations
//     const projects = await PartListProjectModel.find({})
//       .select("projectName createdAt partsLists subAssemblyListFirst assemblyList")
//       .populate({
//         path: "partsLists.partsListItems.allocations",
//         select: "machineId startDate endDate actualEndDate partName"
//       })
//       .populate({
//         path: "subAssemblyListFirst.partsListItems.allocations",
//         select: "machineId startDate endDate actualEndDate partName"
//       })
//       .populate({
//         path: "assemblyList.partsListItems.allocations",
//         select: "machineId startDate endDate actualEndDate partName"
//       })
//       .populate({
//         path: "assemblyList.subAssemblies.partsListItems.allocations",
//         select: "machineId startDate endDate actualEndDate partName"
//       });

//     // Extract allocations with projectName
//     const allocationData = projects.map((project) => ({
//       projectName: project.projectName,
//       createdAt: project.createdAt,
//       allocations: [
//         ...project.partsLists.flatMap((pl) =>
//           pl.partsListItems.flatMap((p) => p.allocations)
//         ),
//         ...project.subAssemblyListFirst.flatMap((sa) =>
//           sa.partsListItems.flatMap((p) => p.allocations)
//         ),
//         ...project.assemblyList.flatMap((al) => [
//           ...al.partsListItems.flatMap((p) => p.allocations),
//           ...al.subAssemblies.flatMap((sub) =>
//             sub.partsListItems.flatMap((p) => p.allocations)
//           ),
//         ]),
//       ].flat(), // Flatten all allocations into a single array
//     }));

//     return res.status(200).json({
//       message: "All allocations retrieved successfully",
//       data: allocationData,
//     });
//   } catch (error) {
//     console.error("Error fetching allocations:", error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// });

partproject.get("/all-allocations", async (req, res) => {
  try {
    // Fetch projects sorted by newest first
    const projects = await PartListProjectModel.find({})
      .sort({ createdAt: -1 }) // ✅ Sort by createdAt descending
      .select(
        "projectName createdAt partsLists subAssemblyListFirst assemblyList"
      )
      .populate({
        path: "partsLists.partsListItems.allocations",
        select: "machineId startDate endDate actualEndDate partName",
      })
      .populate({
        path: "subAssemblyListFirst.partsListItems.allocations",
        select: "machineId startDate endDate actualEndDate partName",
      })
      .populate({
        path: "assemblyList.partsListItems.allocations",
        select: "machineId startDate endDate actualEndDate partName",
      })
      .populate({
        path: "assemblyList.subAssemblies.partsListItems.allocations",
        select: "machineId startDate endDate actualEndDate partName",
      });

    // Extract allocations with projectName and include jobWorkMovements per part
    const allocationData = projects.map((project) => ({
      projectName: project.projectName,
      createdAt: project.createdAt,
      allocations: [
        ...project.partsLists.flatMap((pl) =>
          pl.partsListItems.flatMap((p) => ({
            ...p.toObject(),
          }))
        ),
        ...project.subAssemblyListFirst.flatMap((sa) =>
          sa.partsListItems.flatMap((p) => ({
            ...p.toObject(),
          }))
        ),
        ...project.assemblyList.flatMap((al) => [
          ...al.partsListItems.flatMap((p) => ({
            ...p.toObject(),
          })),
          ...al.subAssemblies.flatMap((sub) =>
            sub.partsListItems.flatMap((p) => ({
              ...p.toObject(),
            }))
          ),
        ]),
      ]
        .flat()
        .map((partObj) => ({
          partName: partObj.partName,
          partsCodeId: partObj.partsCodeId,
          allocations: partObj.allocations || [],
          jobWorkMovements: partObj.jobWorkMovements || [],
        })),
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
    const projects = await PartListProjectModel.find();

    let allDailyTracking = [];

    projects.forEach((project) => {
      project.partsLists.forEach((partsList) => {
        partsList.partsListItems.forEach((part) => {
          part.allocations.forEach((allocation) => {
            if (
              allocation.dailyTracking &&
              allocation.dailyTracking.length > 0
            ) {
              allDailyTracking = allDailyTracking.concat(
                allocation.dailyTracking
              );
            }
          });
        });
      });
    });

    res.status(200).json(allDailyTracking);
  } catch (error) {
    console.error("Error fetching daily tracking:", error);
    res.status(500).json({ message: "Server Error", error });
  }
});

// Add this new route after the existing daily tracking route
partproject.put(
  "/projects/:projectId/partsLists/:partsListId/partsListItems/:partListItemId/update-warehouse-quantity",
  async (req, res) => {
    try {
      const { projectId, partsListId, partListItemId } = req.params;
      const { warehouseId, quantityToReduce } = req.body;

      if (!warehouseId || quantityToReduce === undefined) {
        return res.status(400).json({
          success: false,
          error: "warehouseId and quantityToReduce are required",
        });
      }

      const StoreVariableModal = require("../model/storemodel");
      const storeVariable = await StoreVariableModal.findOne({
        categoryId: warehouseId,
      });

      if (!storeVariable) {
        return res
          .status(404)
          .json({ success: false, error: "Warehouse not found" });
      }

      if (storeVariable.quantity && storeVariable.quantity.length > 0) {
        const currentQuantity = Number(storeVariable.quantity[0] || 0);
        const reduceBy = Number(quantityToReduce || 0);
        const newQuantity = Math.max(0, currentQuantity - reduceBy);
        storeVariable.quantity[0] = newQuantity;

        await storeVariable.save();

        res.status(200).json({
          success: true,
          message: "Warehouse quantity updated successfully",
          data: {
            warehouseId,
            previousQuantity: currentQuantity,
            newQuantity: newQuantity,
            reducedBy: reduceBy,
          },
        });
      } else {
        res.status(400).json({
          success: false,
          error: "No quantity data found for this warehouse",
        });
      }
    } catch (error) {
      console.error("Error updating warehouse quantity:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
        details: error.message,
      });
    }
  }
);

// New: transfer quantity between two warehouses (decrement TO warehouse, increment FROM warehouse)
partproject.put(
  "/projects/:projectId/partsLists/:partsListId/partsListItems/:partListItemId/transfer-warehouse-quantity",
  async (req, res) => {
    try {
      const { projectId, partsListId, partListItemId } = req.params;
      const {
        fromWarehouseId,
        toWarehouseId,
        quantity,
        isRejectionTransfer = false,
      } = req.body;

      if (!toWarehouseId || quantity === undefined) {
        return res.status(400).json({
          success: false,
          error: "toWarehouseId and quantity are required.",
        });
      }

      const StoreVariableModal = require("../model/storemodel");

      // Fetch both warehouses
      let [toWarehouse, fromWarehouse] = await Promise.all([
        StoreVariableModal.findOne({ categoryId: toWarehouseId }),
        fromWarehouseId
          ? StoreVariableModal.findOne({ categoryId: fromWarehouseId })
          : Promise.resolve(null),
      ]);

      if (!toWarehouse) {
        return res
          .status(404)
          .json({ success: false, error: "To warehouse not found" });
      }

      const qty = Number(quantity || 0);
      let toPrev, toNew, fromPrev, fromNew;

      if (isRejectionTransfer) {
        // 🔄 REJECTION TRANSFER: Decrement FROM, Increment TO (Rejection)
        if (fromWarehouse) {
          if (
            !Array.isArray(fromWarehouse.quantity) ||
            fromWarehouse.quantity.length === 0
          ) {
            fromWarehouse.quantity = [0];
          }
          fromPrev = Number(fromWarehouse.quantity[0] || 0);
          fromNew = Math.max(0, fromPrev - qty);
          fromWarehouse.quantity[0] = fromNew;
        }

        // Increment rejection warehouse
        if (
          !Array.isArray(toWarehouse.quantity) ||
          toWarehouse.quantity.length === 0
        ) {
          toWarehouse.quantity = [0];
        }
        toPrev = Number(toWarehouse.quantity[0] || 0);
        toNew = toPrev + qty;
        toWarehouse.quantity[0] = toNew;
      } else {
        // 🔄 NORMAL TRANSFER: Decrement FROM, Increment TO
        if (fromWarehouse) {
          if (
            !Array.isArray(fromWarehouse.quantity) ||
            fromWarehouse.quantity.length === 0
          ) {
            fromWarehouse.quantity = [0];
          }
          fromPrev = Number(fromWarehouse.quantity[0] || 0);
          fromNew = Math.max(0, fromPrev - qty);
          fromWarehouse.quantity[0] = fromNew;
        }

        // Increment to warehouse
        if (
          !Array.isArray(toWarehouse.quantity) ||
          toWarehouse.quantity.length === 0
        ) {
          toWarehouse.quantity = [0];
        }
        toPrev = Number(toWarehouse.quantity[0] || 0);
        toNew = toPrev + qty;
        toWarehouse.quantity[0] = toNew;
      }

      // Save changes
      await Promise.all([
        toWarehouse.save(),
        fromWarehouse ? fromWarehouse.save() : Promise.resolve(),
      ]);

      return res.status(200).json({
        success: true,
        message: isRejectionTransfer
          ? "Rejection transfer completed"
          : "Transfer completed",
        data: {
          toWarehouse: {
            id: toWarehouseId,
            previousQuantity: toPrev,
            newQuantity: toNew,
          },
          fromWarehouse: fromWarehouseId
            ? {
                id: fromWarehouseId,
                previousQuantity: fromPrev,
                newQuantity: fromNew,
              }
            : null,
          transferred: qty,
          isRejectionTransfer,
        },
      });
    } catch (error) {
      console.error("Error transferring warehouse quantity:", error);
      return res.status(500).json({
        success: false,
        error: "Server error",
        details: error.message,
      });
    }
  }
);

// Increment-only endpoint for adding quantity to a single warehouse (used by special-day receipt)
partproject.put(
  "/projects/:projectId/partsLists/:partsListId/partsListItems/:partListItemId/increment-warehouse-quantity",
  async (req, res) => {
    try {
      const { projectId, partsListId, partListItemId } = req.params;
      const { warehouseId, quantityToAdd } = req.body;

      if (!warehouseId || quantityToAdd === undefined) {
        return res.status(400).json({
          success: false,
          error: "warehouseId and quantityToAdd are required",
        });
      }

      const StoreVariableModal = require("../model/storemodel");
      let storeVariable = await StoreVariableModal.findOne({
        categoryId: warehouseId,
      });
      // If the warehouse does not exist yet, create a minimal record so we can increment it
      if (!storeVariable) {
        try {
          storeVariable = new StoreVariableModal({
            categoryId: warehouseId,
            Name: [warehouseId],
            location: [""],
            quantity: [0],
          });
          await storeVariable.save();
        } catch (e) {
          return res
            .status(404)
            .json({ success: false, error: "Warehouse not found" });
        }
      }

      if (
        !Array.isArray(storeVariable.quantity) ||
        storeVariable.quantity.length === 0
      ) {
        storeVariable.quantity = [0];
      }
      const currentQuantity = Number(storeVariable.quantity[0] || 0);
      const addBy = Number(quantityToAdd || 0);
      const newQuantity = currentQuantity + addBy;
      storeVariable.quantity[0] = newQuantity;

      await storeVariable.save();

      res.status(200).json({
        success: true,
        message: "Warehouse quantity incremented successfully",
        data: {
          warehouseId,
          previousQuantity: currentQuantity,
          newQuantity,
          addedBy: addBy,
        },
      });
    } catch (error) {
      console.error("Error incrementing warehouse quantity:", error);
      return res.status(500).json({
        success: false,
        error: "Server error",
        details: error.message,
      });
    }
  }
);

// Manual trigger: register/execute special-day sync for a part and its next process warehouse
partproject.post(
  "/projects/:projectId/partsLists/:partsListId/partsListItems/:partListItemId/special-day-sync",
  async (req, res) => {
    try {
      const { projectId, partsListId, partListItemId } = req.params;
      const { partsCodeId, currentWarehouseId, nextWarehouseId, productionNo } =
        req.body;

      if (!partsCodeId || !currentWarehouseId || !nextWarehouseId) {
        return res.status(400).json({
          success: false,
          error:
            "partsCodeId, currentWarehouseId, nextWarehouseId are required",
        });
      }

      const jobKey = `${partsCodeId}|${currentWarehouseId}|${nextWarehouseId}`;
      if (!specialDayJobs.has(jobKey)) {
        specialDayJobs.set(jobKey, {
          partsCodeId,
          currentWarehouseId,
          nextWarehouseId,
          lastSyncedQuantity: 0,
          projectId,
          partsListId,
          partListItemId,
          productionNo,
        });
      } else {
        // enrich existing job with missing identifiers for scheduler to act
        const existing = specialDayJobs.get(jobKey) || {};
        specialDayJobs.set(jobKey, {
          ...existing,
          partsCodeId,
          currentWarehouseId,
          nextWarehouseId,
          projectId,
          partsListId,
          partListItemId,
          productionNo,
          lastSyncedQuantity: existing.lastSyncedQuantity || 0,
        });
      }

      // Attempt an immediate sync once
      const goodsIssueUrl = `${baseUrl}/api/GoodsIssue/GetGoodsIssue`;
      const goodsReceiptUrl = `${baseUrl}/api/GoodsReceipt/GetGoodsReceipt`;

      const [issueRes, receiptRes] = await Promise.all([
        axios.get(goodsIssueUrl, { timeout: 15000 }),
        axios.get(goodsReceiptUrl, { timeout: 15000 }),
      ]);

      const issueQty = (issueRes.data || [])
        .filter(
          (x) =>
            String(x.Itemcode).trim().toLowerCase() ===
              String(partsCodeId).trim().toLowerCase() &&
            String(x.ProductionNo || "")
              .trim()
              .toLowerCase() ===
              String(productionNo || "")
                .trim()
                .toLowerCase()
        )
        .reduce((sum, x) => sum + Number(x.Quantity || 0), 0);

      const receiptQty = (receiptRes.data || [])
        .filter(
          (x) =>
            String(x.Itemcode).trim().toLowerCase() ===
              String(partsCodeId).trim().toLowerCase() &&
            String(x.ProductionNo || "")
              .trim()
              .toLowerCase() ===
              String(productionNo || "")
                .trim()
                .toLowerCase()
        )
        .reduce((sum, x) => sum + Number(x.Quantity || 0), 0);

      // Received that can be moved to next process = min(issue, receipt) - lastSynced
      const job = specialDayJobs.get(jobKey);
      const eligible = Math.max(
        0,
        Math.min(issueQty, receiptQty) - (job.lastSyncedQuantity || 0)
      );

      if (eligible > 0) {
        // Increment next process warehouse by eligible quantity
        await axios.put(
          `${
            process.env.BASE_URL || "http://0.0.0.0:4040"
          }/api/defpartproject/projects/${projectId}/partsLists/${partsListId}/partsListItems/${partListItemId}/increment-warehouse-quantity`,
          { warehouseId: nextWarehouseId, quantityToAdd: eligible },
          { timeout: 15000 }
        );

        // Fetch project/part to log job-work movement entries
        let partName = "";
        try {
          const projectDoc = await PartListProjectModel.findById(projectId);
          const partsListDoc = projectDoc?.partsLists?.id(partsListId);
          const partItemDoc = partsListDoc?.partsListItems?.id(partListItemId);
          partName = partItemDoc?.partName || "";

          if (partItemDoc) {
            // Store latest issue/receipt snapshot
            partItemDoc.jobWorkMovements = partItemDoc.jobWorkMovements || [];
            partItemDoc.jobWorkMovements.push(
              {
                type: "issue",
                productionNo: productionNo || "",
                partsCodeId: partsCodeId,
                warehouseId: currentWarehouseId,
                quantity: Number(issueQty) || 0,
                note: "Job-work issue snapshot",
              },
              {
                type: "receipt",
                productionNo: productionNo || "",
                partsCodeId: partsCodeId,
                warehouseId: currentWarehouseId,
                quantity: Number(receiptQty) || 0,
                note: "Job-work receipt snapshot",
              },
              {
                type: "autoMove",
                productionNo: productionNo || "",
                partsCodeId: partsCodeId,
                fromWarehouseId: currentWarehouseId,
                toWarehouseId: nextWarehouseId,
                quantity: Number(eligible) || 0,
                note: "Auto move from job-work to next process on receipt",
              }
            );
            await projectDoc.save();
          }
        } catch (e) {}

        // Post inventory movements to both routes
        const inventoryData = {
          DocDate: new Date(),
          ItemCode: partsCodeId,
          Dscription: partName,
          Quantity: Number(eligible),
          WhsCode: nextWarehouseId,
          FromWhsCod: currentWarehouseId,
        };
        try {
          await Promise.all([
            axios.post(
              `${
                process.env.BASE_URL || "http://0.0.0.0:4040"
              }/api/Inventory/PostInventory`,
              inventoryData,
              { timeout: 15000 }
            ),
            axios.post(
              `${
                process.env.BASE_URL || "http://0.0.0.0:4040"
              }/api/InventoryVaraible/PostInventoryVaraibleVaraible`,
              inventoryData,
              { timeout: 15000 }
            ),
          ]);
        } catch (invErr) {
          console.error(
            "Special-day inventory post failed:",
            invErr?.message || invErr
          );
        }

        job.lastSyncedQuantity = (job.lastSyncedQuantity || 0) + eligible;
        specialDayJobs.set(jobKey, job);
      }

      return res.status(200).json({
        success: true,
        message: "Special-day sync executed",
        data: { issued: issueQty, received: receiptQty, moved: eligible },
      });
    } catch (error) {
      console.error("Error in special-day sync:", error);
      return res.status(500).json({
        success: false,
        error: "Server error",
        details: error.message,
      });
    }
  }
);

// Background scheduler every 10 minutes to auto-sync all registered special-day jobs
setInterval(async () => {
  if (specialDayJobs.size === 0) return;
  for (const [jobKey, job] of specialDayJobs.entries()) {
    try {
      const {
        partsCodeId,
        currentWarehouseId,
        nextWarehouseId,
        projectId,
        partsListId,
        partListItemId,
        productionNo,
      } = job;
      const goodsIssueUrl = `${baseUrl}/api/GoodsIssue/GetGoodsIssue`;
      const goodsReceiptUrl = `${baseUrl}/api/GoodsReceipt/GetGoodsReceipt`;
      const [issueRes, receiptRes] = await Promise.all([
        axios.get(goodsIssueUrl, { timeout: 15000 }),
        axios.get(goodsReceiptUrl, { timeout: 15000 }),
      ]);
      const issueQty = (issueRes.data || [])
        .filter(
          (x) =>
            String(x.Itemcode).trim().toLowerCase() ===
            String(partsCodeId).trim().toLowerCase()
        )
        .reduce((sum, x) => sum + Number(x.Quantity || 0), 0);
      const receiptQty = (receiptRes.data || [])
        .filter(
          (x) =>
            String(x.Itemcode).trim().toLowerCase() ===
            String(partsCodeId).trim().toLowerCase()
        )
        .reduce((sum, x) => sum + Number(x.Quantity || 0), 0);
      const eligible = Math.max(
        0,
        Math.min(issueQty, receiptQty) - (job.lastSyncedQuantity || 0)
      );
      if (
        eligible > 0 &&
        projectId &&
        partsListId &&
        partListItemId &&
        nextWarehouseId
      ) {
        try {
          // Increment next process warehouse by eligible quantity
          await axios.put(
            `${
              process.env.BASE_URL || "http://0.0.0.0:4040"
            }/api/defpartproject/projects/${projectId}/partsLists/${partsListId}/partsListItems/${partListItemId}/increment-warehouse-quantity`,
            { warehouseId: nextWarehouseId, quantityToAdd: eligible },
            { timeout: 15000 }
          );

          // Try to get the part name for description and log movement
          let partName = "";
          try {
            const PartListProjectModel = require("../model/project/PartListProjectModel");
            const projectDoc = await PartListProjectModel.findById(projectId);
            const partsList = projectDoc?.partsLists?.id(partsListId);
            const partItem = partsList?.partsListItems?.id(partListItemId);
            partName = partItem?.partName || "";

            if (partItem) {
              partItem.jobWorkMovements = partItem.jobWorkMovements || [];
              partItem.jobWorkMovements.push({
                type: "autoMove",
                productionNo: productionNo || "",
                partsCodeId: partsCodeId,
                fromWarehouseId: currentWarehouseId,
                toWarehouseId: nextWarehouseId,
                quantity: Number(eligible) || 0,
                note: "Scheduler auto move from job-work to next process",
              });
              await projectDoc.save();
            }
          } catch (e) {}

          // Post inventory movements to both routes
          const inventoryData = {
            DocDate: new Date(),
            ItemCode: partsCodeId,
            Dscription: partName,
            Quantity: Number(eligible),
            WhsCode: nextWarehouseId,
            FromWhsCod: currentWarehouseId,
          };
          try {
            await Promise.all([
              axios.post(
                `${
                  process.env.BASE_URL || "http://0.0.0.0:4040"
                }/api/Inventory/PostInventory`,
                inventoryData,
                { timeout: 15000 }
              ),
              axios.post(
                `${
                  process.env.BASE_URL || "http://0.0.0.0:4040"
                }/api/InventoryVaraible/PostInventoryVaraibleVaraible`,
                inventoryData,
                { timeout: 15000 }
              ),
            ]);
          } catch (invErr) {
            console.error(
              "Special-day inventory post failed:",
              invErr?.message || invErr
            );
          }

          job.lastSyncedQuantity = (job.lastSyncedQuantity || 0) + eligible;
          specialDayJobs.set(jobKey, job);
        } catch (e) {
          console.error(
            "Special-day scheduler quantity push failed:",
            e?.message || e
          );
        }
      } else if (eligible > 0) {
        // No context to push quantities, at least update lastSynced to avoid reprocessing same amount
        job.lastSyncedQuantity = (job.lastSyncedQuantity || 0) + eligible;
        specialDayJobs.set(jobKey, job);
      }
    } catch (err) {
      console.error("Special-day scheduler error:", err.message);
    }
  }
}, 1 * 60 * 1000);

module.exports = partproject;
