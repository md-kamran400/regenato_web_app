// project.route.js

const express = require("express");
const { Router } = express;
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
  const {
    projectName,
    costPerUnit,
    timePerUnit,
    stockPoQty,
    projectType,
    partsLists,
  } = req.body;

  const newProject = new ProjectModal({
    projectName,
    costPerUnit,
    timePerUnit,
    stockPoQty,
    projectType,
    partsLists,
  });

  try {
    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE - Delete a part
ProjectRouter.delete("/:_id", async (req, res) => {
  try {
    const deletedPart = await ProjectModal.findByIdAndDelete(req.params._id);
    if (!deletedPart) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json({ message: "projects deleted successfully" });
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
      (part) => part.Uid.toString() === req.params.id
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
      (part) => part.Uid.toString() === req.params.id
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
      (part) => part.Uid.toString() === req.params.id
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

// POST Route: Add a new parts list to an existing project
// In project.route.js

ProjectRouter.post("/:_id/partsLists", async (req, res) => {
  const { _id } = req.params;
  const { partsListName } = req.body;

  try {
    const project = await ProjectModal.findById(_id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const newPartsList = {
      partsListName,
      partsListItems: [],
    };

    project.partsLists.push(newPartsList);
    const updatedProject = await project.save();
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT Route: Update a parts list in the partsLists array
ProjectRouter.put("/:_id/partsLists/:index", async (req, res) => {
  const { index } = req.params;
  const { partsListName, partsListItems } = req.body;

  try {
    const project = await ProjectModal.findById(req.params._id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (index >= project.partsLists.length) {
      return res.status(404).json({ message: "Parts list not found" });
    }

    project.partsLists[index] = {
      partsListName,
      partsListItems,
    };

    const updatedProject = await project.save();
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE Route: Remove a parts list from the partsLists array
ProjectRouter.delete("/:_id/partsLists/:index", async (req, res) => {
  const { index } = req.params;

  try {
    const project = await ProjectModal.findById(req.params._id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (index >= project.partsLists.length) {
      return res.status(404).json({ message: "Parts list not found" });
    }

    project.partsLists.splice(index, 1);

    const updatedProject = await project.save();
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET Route: Retrieve a specific parts list
// ProjectRouter.get("/:_id/partsLists/:index", async (req, res) => {
//   const { index } = req.params;

//   try {
//     const project = await ProjectModal.findById(req.params._id);
//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }

//     if (index >= project.partsLists.length) {
//       return res.status(404).json({ message: "Parts list not found" });
//     }

//     res.status(200).json(project.partsLists[index]);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// POST Route: Add a new part to a specific parts list
ProjectRouter.post("/:_id/partsLists/:listId/items", async (req, res) => {
  try {
    const project = await ProjectModal.findById(req.params._id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const partsList = project.partsLists.id(req.params.listId);
    if (!partsList) {
      return res.status(404).json({ message: "Parts list not found" });
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

    partsList.partsListItems.push(newPart);

    const updatedProject = await project.save();
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT Route: Update a part in a parts list by its _id
ProjectRouter.put(
  "/:_id/partsLists/:listId/items/:itemId",
  async (req, res) => {
    try {
      const project = await ProjectModal.findById(req.params._id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const partsList = project.partsLists.id(req.params.listId);
      if (!partsList) {
        return res.status(404).json({ message: "Parts list not found" });
      }

      const part = partsList.partsListItems.id(req.params.itemId);
      if (!part) {
        return res.status(404).json({ message: "Part not found" });
      }

      Object.assign(part, req.body);

      const updatedProject = await project.save();
      res.status(200).json(updatedProject);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// DELETE Route: Remove a part from a parts list by its _id
ProjectRouter.delete(
  "/:_id/partsLists/:listId/items/:itemId",
  async (req, res) => {
    try {
      const project = await ProjectModal.findById(req.params._id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const partsList = project.partsLists.id(req.params.listId);
      if (!partsList) {
        return res.status(404).json({ message: "Parts list not found" });
      }

      const part = partsList.partsListItems.id(req.params.itemId);
      if (!part) {
        return res.status(404).json({ message: "Part not found" });
      }

      part.remove();

      const updatedProject = await project.save();
      res.status(200).json(updatedProject);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// GET Route: Retrieve parts list items for a specific parts list
ProjectRouter.get("/:_id/partsLists/:listId/items", async (req, res) => {
  try {
    const { _id, listId } = req.params;
    const project = await ProjectModal.findById(_id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const partsList = project.partsLists.id(listId);
    if (!partsList) {
      return res.status(404).json({ message: "Parts list not found" });
    }

    res.status(200).json(partsList.partsListItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// post for outer sub assmebly list
ProjectRouter.post("/:_id/subAssemblyListFirst", async (req, res) => {
  const { _id } = req.params;
  const { subAssemblyListName } = req.body;

  try {
    const project = await ProjectModal.findById(_id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const newPartsList = {
      subAssemblyListName,
      partsListItems: [],
    };

    project.subAssemblyListFirst.push(newPartsList);
    const updatedProject = await project.save();
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

ProjectRouter.post(
  "/:_id/subAssemblyListFirst/:listId/items",
  async (req, res) => {
    try {
      const project = await ProjectModal.findById(req.params._id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const partsList = project.subAssemblyListFirst.id(req.params.listId);
      if (!partsList) {
        return res.status(404).json({ message: "Parts list not found" });
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

      partsList.partsListItems.push(newPart);

      const updatedProject = await project.save();
      res.status(200).json(updatedProject);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// get for sub assembly list first component
ProjectRouter.get(
  "/:_id/subAssemblyListFirst/:listId/items",
  async (req, res) => {
    try {
      const project = await ProjectModal.findById(req.params._id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const partsList = project.subAssemblyListFirst.id(req.params.listId);
      if (!partsList) {
        return res.status(404).json({ message: "Sub-assembly list not found" });
      }

      const items = partsList.partsListItems;
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// POST Route: Duplicate a sub-assembly parts list
ProjectRouter.post(
  "/:_id/subAssemblyListFirst/:listId/duplicate",
  async (req, res) => {
    const { _id, listId } = req.params;

    try {
      const project = await ProjectModal.findById(_id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const subAssemblyList = project.subAssemblyListFirst.id(listId);
      if (!subAssemblyList) {
        return res.status(404).json({ message: "Sub-assembly list not found" });
      }

      const newSubAssemblyList = {
        subAssemblyListName: `${subAssemblyList.subAssemblyListName} (Copy)`,
        partsListItems: [...subAssemblyList.partsListItems], // Ensure deep cloning
      };

      project.subAssemblyListFirst.push(newSubAssemblyList);
      await project.save();
      res.status(200).json(newSubAssemblyList);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// asembly operation start from here
// POST Route: Add a new parts list to an existing project
// In project.route.js

ProjectRouter.post("/:_id/assemblyPartsLists", async (req, res) => {
  const { _id } = req.params;
  const { assemblyListName } = req.body;

  try {
    const project = await ProjectModal.findById(_id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const newPartsList = {
      assemblyListName,
      partsListItems: [],
    };

    project.assemblyPartsLists.push(newPartsList);
    const updatedProject = await project.save();
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT Route: Update a parts list in the assemblyPartsLists array
ProjectRouter.put("/:_id/assemblyPartsLists/:index", async (req, res) => {
  const { index } = req.params;
  const { assemblyListName, partsListItems } = req.body;

  try {
    const project = await ProjectModal.findById(req.params._id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (index >= project.assemblyPartsLists.length) {
      return res.status(404).json({ message: "Parts list not found" });
    }

    project.assemblyPartsLists[index] = {
      assemblyListName,
      partsListItems,
    };

    const updatedProject = await project.save();
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE Route: Remove a parts list from the assemblyPartsLists array
ProjectRouter.delete("/:_id/assemblyPartsLists/:index", async (req, res) => {
  const { index } = req.params;

  try {
    const project = await ProjectModal.findById(req.params._id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (index >= project.assemblyPartsLists.length) {
      return res.status(404).json({ message: "Parts list not found" });
    }

    project.assemblyPartsLists.splice(index, 1);

    const updatedProject = await project.save();
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST Route: Add a new part to a specific parts list
ProjectRouter.post(
  "/:_id/assemblyPartsLists/:listId/items",
  async (req, res) => {
    try {
      const project = await ProjectModal.findById(req.params._id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const partsList = project.assemblyPartsLists.id(req.params.listId);
      if (!partsList) {
        return res.status(404).json({ message: "Parts list not found" });
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

      partsList.partsListItems.push(newPart);

      const updatedProject = await project.save();
      res.status(200).json(updatedProject);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// PUT Route: Update a part in a parts list by its _id
ProjectRouter.put(
  "/:_id/assemblyPartsLists/:listId/items/:itemId",
  async (req, res) => {
    try {
      const project = await ProjectModal.findById(req.params._id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const partsList = project.assemblyPartsLists.id(req.params.listId);
      if (!partsList) {
        return res.status(404).json({ message: "Parts list not found" });
      }

      const part = partsList.partsListItems.id(req.params.itemId);
      if (!part) {
        return res.status(404).json({ message: "Part not found" });
      }

      Object.assign(part, req.body);

      const updatedProject = await project.save();
      res.status(200).json(updatedProject);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// DELETE Route: Remove a part from a parts list by its _id
ProjectRouter.delete(
  "/:_id/assemblyPartsLists/:listId/items/:itemId",
  async (req, res) => {
    try {
      const project = await ProjectModal.findById(req.params._id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const partsList = project.assemblyPartsLists.id(req.params.listId);
      if (!partsList) {
        return res.status(404).json({ message: "Parts list not found" });
      }

      const part = partsList.partsListItems.id(req.params.itemId);
      if (!part) {
        return res.status(404).json({ message: "Part not found" });
      }

      part.remove();

      const updatedProject = await project.save();
      res.status(200).json(updatedProject);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// GET Route: Retrieve parts lists for a project
ProjectRouter.get("/:_id/partsLists", async (req, res) => {
  try {
    const project = await ProjectModal.findById(req.params._id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(project.partsLists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST Route: Duplicate a parts list
ProjectRouter.post("/:_id/partsLists/:listId/duplicate", async (req, res) => {
  const { _id, listId } = req.params;

  try {
    const project = await ProjectModal.findById(_id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const partsList = project.partsLists.id(listId);
    if (!partsList) {
      return res.status(404).json({ message: "Parts list not found" });
    }

    const newPartsList = {
      partsListName: `${partsList.partsListName} (Copy)`,
      partsListItems: [...partsList.partsListItems],
    };

    project.partsLists.push(newPartsList);
    const updatedProject = await project.save();
    res.status(200).json(newPartsList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// sub Assembly route
// Add this after the existing assemblyPartsLists routes

// Sub Assembly Routes

// POST Route: Add a new sub-assembly parts list to an existing project
// In project.route.js

// POST Route: Add a new sub-assembly parts list to an existing project
ProjectRouter.post(
  "/:_id/assemblyPartsLists/:listId/subAssemblyPartsLists",
  async (req, res) => {
    const { _id, listId } = req.params;
    const { subAssemblyListName } = req.body;

    try {
      const project = await ProjectModal.findById(_id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const assemblyList = project.assemblyPartsLists.id(listId);
      if (!assemblyList) {
        return res.status(404).json({ message: "Assembly list not found" });
      }

      const newSubAssemblyList = {
        subAssemblyListName,
        partsListItems: [],
      };

      assemblyList.subAssemblyPartsLists.push(newSubAssemblyList);
      const updatedProject = await project.save();
      res.status(200).json(updatedProject);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// POST Route: Add a new part to a specific sub-assembly parts list
ProjectRouter.post(
  "/:_id/assemblyPartsLists/:listId/subAssemblyPartsLists/:subListId/items",
  async (req, res) => {
    try {
      const { _id, listId, subListId } = req.params;
      const project = await ProjectModal.findById(_id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const assemblyList = project.assemblyPartsLists.id(listId);
      if (!assemblyList) {
        return res.status(404).json({ message: "Assembly list not found" });
      }

      const subAssemblyList = assemblyList.subAssemblyPartsLists.id(subListId);
      if (!subAssemblyList) {
        return res.status(404).json({ message: "Sub-assembly list not found" });
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

      subAssemblyList.partsListItems.push(newPart);
      const updatedProject = await project.save();
      res.status(200).json(updatedProject);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

ProjectRouter.get(
  "/:_id/assemblyPartsLists/:listId/subAssemblyPartsLists/:subListId/items",
  async (req, res) => {
    try {
      const { _id, listId, subListId } = req.params;
      const project = await ProjectModal.findById(_id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const assemblyList = project.assemblyPartsLists.id(listId);
      if (!assemblyList) {
        return res.status(404).json({ message: "Assembly list not found" });
      }

      const subAssemblyList = assemblyList.subAssemblyPartsLists.id(subListId);
      if (!subAssemblyList) {
        return res.status(404).json({ message: "Sub-assembly list not found" });
      }

      const items = subAssemblyList.partsListItems;
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// POST Route: Duplicate an assembly list
// POST Route: Duplicate an assembly list
// ProjectRouter.post("/:_id/assemblyPartsLists/:listId/duplicate", async (req, res) => {
//   const { _id, listId } = req.params;

//   try {
//     const project = await ProjectModal.findById(_id);
//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }

//     const assemblyList = project.assemblyPartsLists.id(listId);
//     if (!assemblyList) {
//       return res.status(404).json({ message: "Assembly list not found" });
//     }

//     const newAssemblyList = {
//       assemblyListName: `${assemblyList.assemblyListName} (Copy)`,
//       subAssemblyPartsLists: [...assemblyList.subAssemblyPartsLists],
//       assemblyMultyPartsList: [...assemblyList.assemblyMultyPartsList]
//     };

//     project.assemblyPartsLists.push(newAssemblyList);
//     const updatedProject = await project.save();
//     res.status(200).json(newAssemblyList);
//   } catch (error) {
//     console.error("Error duplicating assembly list:", error);
//     res.status(500).json({ message: error.message });
//   }
// })
//
// ;

// project.route.js

// POST Route: Duplicate an assembly list
// ProjectRouter.post(
//   "/:_id/assemblyPartsLists/:listId/duplicate",
//   async (req, res) => {
//     const { _id, listId } = req.params;

//     try {
//       const project = await ProjectModal.findById(_id);
//       if (!project) {
//         return res.status(404).json({ message: "Project not found" });
//       }

//       const assemblyList = project.assemblyPartsLists.id(listId);
//       if (!assemblyList) {
//         return res.status(404).json({ message: "Assembly list not found" });
//       }

//       const newAssemblyList = {
//         assemblyListName: `${assemblyList.assemblyListName} (Copy)`,
//         partsListItems: [...assemblyList.partsListItems],
//         subAssemblyPartsLists: [...assemblyList.subAssemblyPartsLists],
//         assemblyMultyPartsList: [...assemblyList.assemblyMultyPartsList],
//       };

//       project.assemblyPartsLists.push(newAssemblyList);
//       const updatedProject = await project.save();
//       res.status(200).json(newAssemblyList);
//     } catch (error) {
//       console.error("Error duplicating assembly list:", error);
//       res
//         .status(500)
//         .json({
//           message: "Failed to duplicate assembly list",
//           error: error.message,
//         });
//     }
//   }
// );

ProjectRouter.post(
  "/:_id/assemblyPartsLists/:listId/duplicate",
  async (req, res) => {
    const { _id, listId } = req.params;

    try {
      const project = await ProjectModal.findById(_id);
      if (!project) {
        console.error(`Project not found for ID: ${_id}`);
        return res.status(404).json({ message: "Project not found" });
      }

      const assemblyList = project.assemblyPartsLists.id(listId);
      if (!assemblyList) {
        console.error(`Assembly List not found for ID: ${listId}`);
        return res.status(404).json({ message: "Assembly list not found" });
      }

      // Sanitize and deep clone nested properties
      const sanitize = (data) =>
        data.map((item) =>
          Object.fromEntries(
            Object.entries(item).map(([key, value]) => [key, value ?? null])
          )
        );

      const newAssemblyList = {
        assemblyListName: `${
          assemblyList.assemblyListName
        } (Copy ${Date.now()})`,
        partsListItems: sanitize(assemblyList.partsListItems || []),
        subAssemblyPartsLists: sanitize(
          assemblyList.subAssemblyPartsLists || []
        ),
        assemblyMultyPartsList: sanitize(
          assemblyList.assemblyMultyPartsList || []
        ),
      };

      project.assemblyPartsLists.push(newAssemblyList);
      const updatedProject = await project.save();

      res.status(200).json({
        message: "Assembly duplicated successfully",
        newAssemblyList,
        updatedAssemblyLists: project.assemblyPartsLists,
      });
    } catch (error) {
      console.error(
        `Error duplicating assembly list for Project ID ${_id}, Assembly List ID ${listId}:`,
        error.message
      );
      res.status(500).json({
        message: "Failed to duplicate assembly list",
        error: error.message,
      });
    }
  }
);

// POST Route: Add a new part to a specific sub-assembly parts list
ProjectRouter.post(
  "/:_id/assemblyPartsLists/:listId/subAssemblyPartsLists/:subListId/items",
  async (req, res) => {
    try {
      const { _id, listId, subListId } = req.params;
      const project = await ProjectModal.findById(_id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const assemblyList = project.assemblyPartsLists.id(listId);
      if (!assemblyList) {
        return res.status(404).json({ message: "Assembly list not found" });
      }

      const subAssemblyList = assemblyList.subAssemblyPartsLists.id(subListId);
      if (!subAssemblyList) {
        return res.status(404).json({ message: "Sub-assembly list not found" });
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

      subAssemblyList.partsListItems.push(newPart);
      const updatedProject = await project.save();
      res.status(200).json(updatedProject);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// GET Route: Retrieve sub-assembly parts lists for a specific assembly list
ProjectRouter.get(
  "/:_id/assemblyPartsLists/:listId/subAssemblyPartsLists",
  async (req, res) => {
    const { _id, listId } = req.params;

    try {
      const project = await ProjectModal.findById(_id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const assemblyList = project.assemblyPartsLists.id(listId);
      if (!assemblyList) {
        return res.status(404).json({ message: "Assembly list not found" });
      }

      res.status(200).json(assemblyList.subAssemblyPartsLists);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// PUT Route: Update a sub-assembly parts list in the subAssemblyPartsLists array
ProjectRouter.put("/:_id/subAssemblyPartsLists/:index", async (req, res) => {
  const { index } = req.params;
  const { subAssemblyListName, partsListItems } = req.body;

  try {
    const project = await ProjectModal.findById(req.params._id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (index >= project.subAssemblyPartsLists.length) {
      return res
        .status(404)
        .json({ message: "Sub-assembly parts list not found" });
    }

    project.subAssemblyPartsLists[index] = {
      subAssemblyListName,
      partsListItems,
    };

    const updatedProject = await project.save();
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE Route: Remove a sub-assembly parts list from the subAssemblyPartsLists array
ProjectRouter.delete("/:_id/subAssemblyPartsLists/:index", async (req, res) => {
  const { index } = req.params;

  try {
    const project = await ProjectModal.findById(req.params._id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (index >= project.subAssemblyPartsLists.length) {
      return res
        .status(404)
        .json({ message: "Sub-assembly parts list not found" });
    }

    project.subAssemblyPartsLists.splice(index, 1);

    const updatedProject = await project.save();
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET Route: Retrieve a specific sub-assembly parts list
ProjectRouter.get("/:_id/subAssemblyPartsLists/:index", async (req, res) => {
  const { index } = req.params;

  try {
    const project = await ProjectModal.findById(req.params._id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (index >= project.subAssemblyPartsLists.length) {
      return res
        .status(404)
        .json({ message: "Sub-assembly parts list not found" });
    }

    res.status(200).json(project.subAssemblyPartsLists[index]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST Route: Add a new part to a specific sub-assembly parts list
ProjectRouter.post(
  "/:_id/subAssemblyPartsLists/:listId/items",
  async (req, res) => {
    try {
      const project = await ProjectModal.findById(req.params._id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const partsList = project.subAssemblyPartsLists.id(req.params.listId);
      if (!partsList) {
        return res
          .status(404)
          .json({ message: "Sub-assembly parts list not found" });
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

      partsList.partsListItems.push(newPart);

      const updatedProject = await project.save();
      res.status(200).json(updatedProject);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// PUT Route: Update a part in a sub-assembly parts list by its _id
ProjectRouter.put(
  "/:_id/subAssemblyPartsLists/:listId/items/:itemId",
  async (req, res) => {
    try {
      const project = await ProjectModal.findById(req.params._id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const partsList = project.subAssemblyPartsLists.id(req.params.listId);
      if (!partsList) {
        return res
          .status(404)
          .json({ message: "Sub-assembly parts list not found" });
      }

      const part = partsList.partsListItems.id(req.params.itemId);
      if (!part) {
        return res.status(404).json({ message: "Part not found" });
      }

      Object.assign(part, req.body);

      const updatedProject = await project.save();
      res.status(200).json(updatedProject);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// DELETE Route: Remove a part from a sub-assembly parts list by its _id
ProjectRouter.delete(
  "/:_id/subAssemblyPartsLists/:listId/items/:itemId",
  async (req, res) => {
    try {
      const project = await ProjectModal.findById(req.params._id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const partsList = project.subAssemblyPartsLists.id(req.params.listId);
      if (!partsList) {
        return res
          .status(404)
          .json({ message: "Sub-assembly parts list not found" });
      }

      const part = partsList.partsListItems.id(req.params.itemId);
      if (!part) {
        return res.status(404).json({ message: "Part not found" });
      }

      part.remove();

      const updatedProject = await project.save();
      res.status(200).json(updatedProject);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// GET Route: Retrieve sub-assembly parts lists for a project
ProjectRouter.get("/:_id/subAssemblyPartsLists", async (req, res) => {
  try {
    const project = await ProjectModal.findById(req.params._id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(project.subAssemblyPartsLists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET Route: Retrieve assembly parts lists for a project
ProjectRouter.get("/:_id/assemblyPartsLists", async (req, res) => {
  try {
    const project = await ProjectModal.findById(req.params._id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(project.assemblyPartsLists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Add this route after line 299 in your project.route.js file

ProjectRouter.get(
  "/:_id/assemblyPartsLists/:listId/items",
  async (req, res) => {
    try {
      console.log("Request Params:", req.params);
      const project = await ProjectModal.findById(req.params._id);

      if (!project) {
        console.log("Project not found");
        return res.status(404).json({ message: "Project not found" });
      }

      console.log("Project found:", project);

      const partsList = project.assemblyPartsLists.id(req.params.listId);
      if (!partsList) {
        console.log(`Parts list with ID ${req.params.listId} not found`);
        return res.status(404).json({ message: "Parts list not found" });
      }

      console.log("Parts List found:", partsList);

      const item = partsList.partsListItems.id(req.params.itemId);
      if (!item) {
        console.log(
          `Item with ID ${req.params.itemId} not found in parts list ${req.params.listId}`
        );
        return res.status(404).json({
          message: `Item ${req.params.itemId} not found in parts list ${req.params.listId}`,
        });
      }

      console.log("Item found:", item);

      res.status(200).json(item);
    } catch (error) {
      console.error("Error:", error.message);
      res.status(500).json({ message: error.message });
    }
  }
);

// route for mutly assmebly
// POST Route: Add a new sub-assembly parts list to an existing project
ProjectRouter.post(
  "/:_id/assemblyPartsLists/:listId/assemblyMultyPartsList",
  async (req, res) => {
    const { _id, listId } = req.params;
    const { assemblyMultyPartsListName } = req.body;

    try {
      const project = await ProjectModal.findById(_id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const assemblyList = project.assemblyPartsLists.id(listId);
      if (!assemblyList) {
        return res.status(404).json({ message: "Assembly list not found" });
      }

      const newAssemblyMultyPartsList = {
        assemblyMultyPartsListName,
        partsListItems: [],
      };

      assemblyList.assemblyMultyPartsList.push(newAssemblyMultyPartsList);
      const updatedProject = await project.save();

      res.status(200).json(newAssemblyMultyPartsList);
    } catch (error) {
      console.error("Error adding new assembly list:", error);
      res.status(500).json({ message: "Failed to add new assembly list" });
    }
  }
);

// POST Route: Add a new part to a specific sub-assembly parts list
ProjectRouter.post(
  "/:_id/assemblyPartsLists/:listId/assemblyMultyPartsList/:subListId/items",
  async (req, res) => {
    try {
      const { _id, listId, subListId } = req.params;
      const project = await ProjectModal.findById(_id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const assemblyList = project.assemblyPartsLists.id(listId);
      if (!assemblyList) {
        return res.status(404).json({ message: "Assembly list not found" });
      }

      const subPartsASsmeblyList =
        assemblyList.assemblyMultyPartsList.id(subListId);
      if (!subPartsASsmeblyList) {
        return res.status(404).json({ message: "Sub-assembly list not found" });
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

      subPartsASsmeblyList.partsListItems.push(newPart);
      const updatedProject = await project.save();
      res.status(200).json(updatedProject);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

ProjectRouter.get(
  "/:_id/assemblyPartsLists/:listId/assemblyMultyPartsList",
  async (req, res) => {
    const { _id, listId } = req.params;

    try {
      const project = await ProjectModal.findById(_id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const assemblyList = project.assemblyPartsLists.id(listId);
      if (!assemblyList) {
        return res.status(404).json({ message: "Assembly list not found" });
      }

      const assemblyMultyPartsLists = assemblyList.assemblyMultyPartsList;

      res.status(200).json(assemblyMultyPartsLists);
    } catch (error) {
      console.error("Error fetching assembly multi-part lists:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch assembly multi-part lists" });
    }
  }
);

ProjectRouter.get(
  "/:_id/assemblyPartsLists/:listId/assemblyMultyPartsList/:subListId/items",
  async (req, res) => {
    try {
      const { _id, listId, subListId } = req.params;
      const project = await ProjectModal.findById(_id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const assemblyList = project.assemblyPartsLists.id(listId);
      if (!assemblyList) {
        return res.status(404).json({ message: "Assembly list not found" });
      }

      const subPartsASsmeblyList =
        assemblyList.assemblyMultyPartsList.id(subListId);
      if (!subPartsASsmeblyList) {
        return res.status(404).json({ message: "Sub-assembly list not found" });
      }

      const items = subPartsASsmeblyList.partsListItems;
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);




// duplicate for multy part list and sub assmebly part list
ProjectRouter.get(
  "/:_id/assemblyPartsLists/:assemblyId/subAssemblyPartsLists",
  async (req, res) => {
    const { _id, assemblyId } = req.params;

    try {
      const project = await ProjectModal.findById(_id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const assembly = project.assemblyPartsLists.id(assemblyId);
      if (!assembly) {
        return res.status(404).json({ message: "Assembly not found" });
      }

      const subAssemblyPartsLists = assembly.subAssemblyPartsLists;
      res.status(200).json(subAssemblyPartsLists);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// POST Route: Duplicate a sub-assembly parts list
ProjectRouter.post(
  "/:_id/assemblyPartsLists/:assemblyId/subAssemblyPartsLists/:subListId/duplicate",
  async (req, res) => {
    const { _id, assemblyId, subListId } = req.params;
    try {
      const project = await ProjectModal.findById(_id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      const assembly = project.assemblyPartsLists.id(assemblyId);
      if (!assembly) {
        return res.status(404).json({ message: "Assembly not found" });
      }
      const subAssemblyList = assembly.subAssemblyPartsLists.id(subListId);
      if (!subAssemblyList) {
        return res.status(404).json({ message: "Sub-assembly not found" });
      }

      const newSubAssemblyList = {
        subAssemblyListName: `${subAssemblyList.subAssemblyListName} (Copy)`,
        partsListItems: [...subAssemblyList.partsListItems],
      };

      assembly.subAssemblyPartsLists.push(newSubAssemblyList);
      await project.save();

      res.status(200).json(newSubAssemblyList);
    } catch (error) {
      console.error("Error duplicating sub-assembly:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// POST Route: Duplicate an assembly multi parts list
ProjectRouter.post(
  "/:_id/assemblyPartsLists/:assemblyId/assemblyMultyPartsList/:multiListId/duplicate",
  async (req, res) => {
    const { _id, assemblyId, multiListId } = req.params;

    try {
      const project = await ProjectModal.findById(_id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const assembly = project.assemblyPartsLists.id(assemblyId);
      if (!assembly) {
        return res.status(404).json({ message: "Assembly not found" });
      }

      const assemblyMultyList = assembly.assemblyMultyPartsList.id(multiListId);
      if (!assemblyMultyList) {
        return res
          .status(404)
          .json({ message: "Assembly multi parts list not found" });
      }

      const newAssemblyMultyList = {
        assemblyMultyPartsListName: `${assemblyMultyList.assemblyMultyPartsListName} (Copy)`,
        partsListItems: [...assemblyMultyList.partsListItems],
      };

      assembly.assemblyMultyPartsList.push(newAssemblyMultyList);
      await project.save();
      res.status(200).json(newAssemblyMultyList);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = { ProjectRouter };
