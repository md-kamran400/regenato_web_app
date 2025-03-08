// const mongoose = require("mongoose");

// const userVariableSchema = mongoose.Schema({
//   categoryId: { type: String, required: true, unique: true },
//   name: String,
//   processName: [{ type: String }], // Allow multiple names
// });

// const userVariableModel = mongoose.model("usersVariable", userVariableSchema);

// module.exports = userVariableModel;

const mongoose = require("mongoose");

const userVariableSchema = mongoose.Schema({
  categoryId: { type: String, required: true, unique: true },
  name: String,
  processName: [{ type: String }], // Allow multiple process names
  leavePeriod: [
    {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      reason: { type: String, required: true }, // Reason for leave
    },
  ],
  status: {
    type: String,
    enum: ["On Leave", "Active"],
    default: "Active",
  },
});

// Middleware to auto-update the status based on leave end date
userVariableSchema.pre("save", function (next) {
  if (this.leavePeriod.length > 0) {
    const latestLeave = this.leavePeriod[this.leavePeriod.length - 1];
    if (latestLeave.endDate && new Date(latestLeave.endDate) < new Date()) {
      this.status = "Active";
    } else {
      this.status = "On Leave";
    }
  }
  next();
});

const userVariableModel = mongoose.model("usersVariable", userVariableSchema);

module.exports = userVariableModel;
