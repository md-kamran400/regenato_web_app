const { Router } = require("express");
const mongoose = require("mongoose");
const ProjectModal = require("../../model/project/Projectmodel");

const ProjectRouter = Router();

// GET Route: Fetch all projects
ProjectRouter.get("/", async (req, res) => {
  try {
    const projects = await ProjectModal.find();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST Route: Create a new project
ProjectRouter.post("/", async (req, res) => {
  const { projectName, costPerUnit, timePerUnit, stockPoQty, allProjects } =
    req.body;

  const newProject = new ProjectModal({
    projectName,
    costPerUnit,
    timePerUnit,
    stockPoQty,
    allProjects,
  });

  try {
    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET Route: Retrieve a specific project
ProjectRouter.get("/:_id", async (req, res) => {
  try {
    const project = await ProjectModal.findById(req.params._id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST Route: Add a part to an existing project's allProjects array
// POST Route: Add a part to an existing project's allProjects array
ProjectRouter.post("/:_id/allProjects", async (req, res) => {
  console.log("Received data:", req.body);
  console.log("Project ID:", req.params._id);

  try {
    const project = await ProjectModal.findById(req.params._id);
    console.log("Found project:", project);

    if (!project) {
      console.log("Project not found");
      return res.status(404).json({ message: "Project not found" });
    }

    const newPart = {
      Uid: req.body.partId,
      partName: req.body.partName,
      costPerUnit: req.body.costPerUnit,
      timePerUnit: req.body.timePerUnit,
      quantity: req.body.quantity,
      rmVariables: req.body.rmVariables || [],
      manufacturingVariables: req.body.manufacturingVariables || [],
      shipmentVariables: req.body.shipmentVariables || [],
      overheadsAndProfits: req.body.overheadsAndProfits || [],
    };

    console.log("New part to add:", newPart);

    project.allProjects.push(newPart);

    const updatedProject = await project.save();
    console.log("Updated project:", updatedProject);

    res.status(200).json(updatedProject);
  } catch (error) {
    console.error("Error in route:", error);
    res.status(500).json({ message: error.message });
  }
});

// PUT Route: Update a part in the allProjects array
ProjectRouter.put("/:_id/allProjects/:id", async (req, res) => {
  const {
    partName,
    costPerUnit,
    timePerUnit,
    quantity,
    rmVariables,
    manufacturingVariables,
    shipmentVariables,
    overheadsAndProfits,
  } = req.body;

  try {
    const project = await ProjectModal.findById(req.params._id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const partIndex = project.allProjects.findIndex(
      (part) => part.id.toString() === req.params.id
    );

    if (partIndex === -1) {
      return res.status(404).json({ message: "Part not found" });
    }

    project.allProjects[partIndex] = {
      ...project.allProjects[partIndex],
      partName,
      costPerUnit,
      timePerUnit,
      quantity,
      rmVariables: rmVariables || project.allProjects[partIndex].rmVariables,
      manufacturingVariables:
        manufacturingVariables ||
        project.allProjects[partIndex].manufacturingVariables,
      shipmentVariables:
        shipmentVariables || project.allProjects[partIndex].shipmentVariables,
      overheadsAndProfits:
        overheadsAndProfits ||
        project.allProjects[partIndex].overheadsAndProfits,
    };

    const updatedProject = await project.save();
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE Route: Remove a part from the allProjects array
ProjectRouter.delete("/:_id/allProjects/:id", async (req, res) => {
  try {
    const project = await ProjectModal.findById(req.params._id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const partIndex = project.allProjects.findIndex(
      (part) => part.id.toString() === req.params.id
    );

    if (partIndex === -1) {
      return res.status(404).json({ message: "Part not found" });
    }

    project.allProjects.splice(partIndex, 1);

    const updatedProject = await project.save();
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET Route: Retrieve variables for a specific part
ProjectRouter.get("/:_id/allProjects/:id/variables", async (req, res) => {
  try {
    const project = await ProjectModal.findById(req.params._id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const part = project.allProjects.find(
      (part) => part.id.toString() === req.params.id
    );
    if (!part) {
      return res.status(404).json({ message: "Part not found" });
    }

    res.status(200).json({
      rmVariables: part.rmVariables,
      manufacturingVariables: part.manufacturingVariables,
      shipmentVariables: part.shipmentVariables,
      overheadsAndProfits: part.overheadsAndProfits,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET Route: Retrieve manufacturing variables for a specific part
ProjectRouter.get(
  "/:projectId/allProjects/:partId/manufacturingVariables",
  async (req, res) => {
    const { projectId, partId } = req.params;

    try {
      // Find the project by its ID
      const project = await ProjectModal.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Find the specific part in the allProjects array
      const part = project.allProjects.find(
        (part) => part._id.toString() === partId
      );
      if (!part) {
        return res.status(404).json({ message: "Part not found" });
      }

      // Return the manufacturing variables of the found part
      res.status(200).json(part.manufacturingVariables);
    } catch (error) {
      console.error("Error fetching manufacturing variables:", error);
      res.status(500).json({ message: "Internal server error", error });
    }
  }
);

// ProjectRouter.put("/:projectId/allProjects/:partId/manufacturingVariables/:variableId", async (req, res) => {
//   try {
//     const { projectId, partId, variableId } = req.params;
//     const { name, hours, hourlyRate, totalRate } = req.body;

//     // Validate required fields
//     if (!name || !hours || !hourlyRate || !totalRate) {
//       return res.status(400).json({ message: "Incomplete manufacturing variable data provided." });
//     }

//     // Update the manufacturing variable
//     const updateResult = await ProjectModal.findOneAndUpdate(
//       { _id: projectId, "allProjects._id": partId },
//       {
//         $set: {
//           "allProjects.$.manufacturingVariables.$[variable]": {
//             _id: variableId,
//             name,
//             hours,
//             hourlyRate,
//             totalRate,
//           },
//         },
//       },
//       {
//         arrayFilters: [{ "variable._id": variableId }],
//         new: true,
//       }
//     );

//     if (!updateResult) {
//       return res.status(404).json({ message: "Project or manufacturing variable not found." });
//     }

//     // Extract the updated manufacturing variable
//     const updatedVariable = updateResult.allProjects
//       .find((part) => part._id.toString() === partId)
//       ?.manufacturingVariables.find((variable) => variable._id.toString() === variableId);

//     if (!updatedVariable) {
//       return res.status(404).json({ message: "Manufacturing variable not found after update." });
//     }

//     res.status(200).json({
//       message: "Manufacturing variable updated successfully.",
//       updatedVariable,
//     });
//   } catch (error) {
//     console.error("Error updating manufacturing variable:", error.message);
//     res.status(500).json({
//       message: "Error updating manufacturing variable",
//       error: error.message,
//     });
//   }
// });


ProjectRouter.put("/:projectId/allProjects/:_id/manufacturingVariables/:variableId", async (req, res) => {
  try {
    const { projectId, _id, variableId } = req.params;

    const updatedProject = await ProjectModal.findOneAndUpdate(
      { _id: projectId, "allProjects._id": _id },
      {
        $set: {
          "allProjects.$[part].manufacturingVariables.$[variable]": req.body,
        },
      },
      {
        arrayFilters: [
          { "part._id": _id },
          { "variable._id": variableId },
        ],
        new: true,
      }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: "Project, part, or variable not found" });
    }

    res.status(200).json({ message: "Manufacturing variable updated successfully", updatedProject });
  } catch (error) {
    console.error("Error updating manufacturing variable:", error);
    res.status(500).json({ message: error.message });
  }
});






module.exports = { ProjectRouter };
