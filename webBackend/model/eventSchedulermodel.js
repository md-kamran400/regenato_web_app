const mongoose = require("mongoose");

const eventSchedulerSchema = mongoose.Schema({
  eventName: String,
  startDate: Date,
  endDate: Date,
});

const eventSchedulerModel = mongoose.model(
  "eventscheduler",
  eventSchedulerSchema
);

module.exports = eventSchedulerModel;
