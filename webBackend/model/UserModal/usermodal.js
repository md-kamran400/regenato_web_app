const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["production", "admin", "finance"],
    required: true,
  },
  employeeId: { type: String, required: true, unique: true },
});

const userModel = mongoose.model("users", userSchema); // Collection name: users

module.exports = userModel;
