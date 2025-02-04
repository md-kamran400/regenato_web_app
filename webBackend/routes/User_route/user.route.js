const express = require("express");
const UserRouter = express.Router();
const mongoose = require("mongoose");
const UserModal = require("../../model/UserModal/usermodal");
const jwt = require("jsonwebtoken");

// sign up route
UserRouter.post("/signup", async (req, res) => {
  const { name, email, password, role, employeeId } = req.body;

  try {
    // Check if user already exists
    let existingUser = await UserModal.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create new user
    const newUser = new UserModal({
      name,
      email,
      password,
      role,
      employeeId,
    });

    // Save the new user to the database
    await newUser.save();

    // Send a success response without JWT
    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Route
UserRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModal.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
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
