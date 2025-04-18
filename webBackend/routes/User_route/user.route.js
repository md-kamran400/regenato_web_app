const express = require("express");
const UserRouter = express.Router();
const mongoose = require("mongoose");
const UserModal = require("../../model/UserModal/usermodal");
const jwt = require("jsonwebtoken");

// Sign Up Route
UserRouter.post("/signup", async (req, res) => {
  const { name, email, password, role, employeeId } = req.body;

  try {
    // Check if user already exists by employeeId or email
    let existingUser = await UserModal.findOne({ 
      $or: [{ email }, { employeeId }] 
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email or employee ID" });
    }

    const newUser = new UserModal({
      name,
      email,
      password, // Note: In production, you should hash this password
      role,
      employeeId,
    });
    await newUser.save();

    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Route - Now using employeeId instead of email
UserRouter.post("/login", async (req, res) => {
  const { employeeId, password } = req.body;
  try {
    const user = await UserModal.findOne({ employeeId });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Direct password comparison (in production, use bcrypt)
    if (password !== user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        name: user.name,
        employeeId: user.employeeId 
      }, 
      "regnato_web",
      { expiresIn: '8h' }
    );

    res.json({ 
      token, 
      user: {
        name: user.name,
        role: user.role,
        employeeId: user.employeeId,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Logout Route
UserRouter.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});

// Get All Users
UserRouter.get("/users", async (req, res) => {
  try {
    const users = await UserModal.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update User
UserRouter.put("/users/:id", async (req, res) => {
  try {
    const updatedUser = await UserModal.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete User
UserRouter.delete("/users/:id", async (req, res) => {
  try {
    await UserModal.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = UserRouter;
