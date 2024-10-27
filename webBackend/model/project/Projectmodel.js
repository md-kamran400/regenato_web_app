// model/project/Projectmodel.js
const mongoose = require('mongoose');

// Part schema nested inside Project schema
const poejectSchema = new mongoose.Schema({
  partName: String,
  costPerUnit: Number,
  timePerUnit: Number,
  quantity: Number,
  processes: [
    {
      subpartName: String,
      value: Number,
    },
  ],
});

// Project schema to store project details
const projectSchema = new mongoose.Schema({
  projectName: String,
  costPerUnit: Number,
  timePerUnit: Number,
  stockPoQty: Number,
  allProjects: [poejectSchema], 
});

const ProjectModal = mongoose.model('Project', projectSchema);
module.exports = ProjectModal;
