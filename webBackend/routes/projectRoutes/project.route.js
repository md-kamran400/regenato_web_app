// routes/project/ProjectRouter.js
const { Router } = require("express");
const ProjectModal = require("../../model/project/Projectmodel");
const ProjectRouter = Router();

// GET Route: Fetch all projects
ProjectRouter.get('/', async (req, res) => {
    try {
      const projects = await ProjectModal.find();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

// POST Route: Create a new project
ProjectRouter.post('/', async (req, res) => {
    const { projectName, costPerUnit, timePerUnit, stockPoQty, allProjects } = req.body;
    
    // Create a new project instance
    const newProject = new ProjectModal({
        projectName,
        costPerUnit,
        timePerUnit,
        stockPoQty,
        allProjects,
    });

    try {
        // Save the project to the database
        const savedProject = await newProject.save();
        res.status(201).json(savedProject); // Return the saved project
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// GET - Retrieve a specific part
ProjectRouter.get("/:_id", async (req, res) => {
    try {
      const project = await ProjectModal.findById(req.params._id);
      if (!project) {
        return res.status(404).json({ message: "project not found" });
      }
      res.status(200).json(project);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


  
// POST Route: Add a part to an existing project's allProjects array
ProjectRouter.post('/:_id/allProjects', async (req, res) => {
  const { partName, costPerUnit, timePerUnit,quantity, processes } = req.body;

  try {
      // Find the project by ID
      const project = await ProjectModal.findById(req.params._id);
      if (!project) {
          return res.status(404).json({ message: "Project not found" });
      }

      // Create a new part object
      const newPart = {
          partName,
          costPerUnit,
          timePerUnit,
          quantity,
          processes
      };

      // Push the new part into the project's allProjects array
      project.allProjects.push(newPart);

      // Save the updated project
      const updatedProject = await project.save();
      res.status(200).json(updatedProject); // Return the updated project with the new part
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

// Update or Put Request Route: Update a part to an existing project's allProjects array
// PUT Route: Update a part in the existing project's allProjects array
ProjectRouter.put('/:_id/allProjects/:partId', async (req, res) => {
  const { partName, costPerUnit, timePerUnit,quantity, processes } = req.body;

  try {
    // Find the project by ID
    const project = await ProjectModal.findById(req.params._id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Find the part to be updated by partId
    const partIndex = project.allProjects.findIndex(part => part._id.toString() === req.params.partId);

    if (partIndex === -1) {
      return res.status(404).json({ message: "Part not found" });
    }

    // Update the part with new values
    project.allProjects[partIndex] = {
      ...project.allProjects[partIndex], // Keep existing fields that are not being updated
      partName,
      costPerUnit,
      timePerUnit,
      quantity,
      processes
    };

    // Save the updated project
    const updatedProject = await project.save();
    res.status(200).json(updatedProject); // Return the updated project
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = { ProjectRouter };
