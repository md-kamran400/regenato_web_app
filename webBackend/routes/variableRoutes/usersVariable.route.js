const { Router } = require("express");
const userVariableModal = require("../../model/userVariableModal");
const userVariableRouter = Router();
const axios = require("axios");

userVariableRouter.post("/", async (req, res) => {
  try {
    // Check if the categoryId already exists
    const existingShipment = await userVariableModal.findOne({
      categoryId: req.body.categoryId,
    });

    if (existingShipment) {
      return res.status(409).json({
        error: "Category ID already exists",
        message: "Please choose a different Category ID",
      });
    }

    let Shipment = new userVariableModal(req.body);
    await Shipment.save();

    res.status(201).json({
      msg: "Shipment Variable Added",
      addShipment: Shipment,
      message: "New shipment variable created successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      // MongoDB duplicate key error
      return res.status(409).json({
        error: "Duplicate Category ID",
        message: "Category ID already exists. Please choose a different one.",
      });
    }
    res.status(400).json({ error: error.message });
  }
});


// GET request to retrieve all Shipment data (already existing)
// userVariableRouter.get("/", async (req, res) => {
//   try {
//     const allShipment = await userVariableModal.find();
//     res.status(200).json(allShipment);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// GET request to retrieve all Shipment data (already existing)
// Modified GET endpoint in your backend
userVariableRouter.get("/", async (req, res) => {
  try {
    // First fetch incharge data
    const inchargeResponse = await axios.get('http://0.0.0.0:4040/api/inchargeVariable');
    const inchargeData = inchargeResponse.data;

    // Extract all operator categoryIds
    const operatorCategoryIds = inchargeData.flatMap(incharge => 
      incharge.operators.map(operator => operator.categoryId)
    );

    // Get unique categoryIds
    const uniqueCategoryIds = [...new Set(operatorCategoryIds)];

    // Find users whose categoryId is in the operators list
    const filteredUsers = await userVariableModal.find({
      categoryId: { $in: uniqueCategoryIds }
    });

    res.status(200).json(filteredUsers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
userVariableRouter.get("/:id", async (req, res) => {
  try {
    const userVariable = await userVariableModal.findById(req.params.id);
    if (!userVariable) {
      return res.status(404).json({ message: "User variable not found" });
    }
    res.json(userVariable);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// PUT request to update a Shipment entry by ID
userVariableRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedShipment = await userVariableModal.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedShipment) {
      return res.status(404).json({ msg: "Shipment entry not found" });
    }

    res.status(200).json({ msg: "Shipment entry updated", updatedShipment });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE request to remove a Shipment entry by ID
userVariableRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedShipment = await userVariableModal.findByIdAndDelete(id);

    if (!deletedShipment) {
      return res.status(404).json({ msg: "Shipment entry not found" });
    }

    res.status(200).json({ msg: "Shipment entry deleted", deletedShipment });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ================== USER LEAVE CODE START HERE ======================
// POST request to create a new user variable userVariableModal
// // POST request to create a new user variable
// userVariableRouter.post("/:id/leave", async (req, res) => {
//   try {
//     const { startDate, endDate, reason } = req.body;
//     const userId = req.params.id;

//     if (!startDate || !endDate || !reason) {
//       return res
//         .status(400)
//         .json({
//           error: "All fields are required (startDate, endDate, reason)",
//         });
//     }

//     const user = await userVariableModal.findById(userId);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Add leave to the existing leavePeriod array
//     user.leavePeriod.push({ startDate, endDate, reason });

//     // Update status
//     user.status = new Date(endDate) >= new Date() ? "On Leave" : "Active";

//     await user.save();
//     res.status(200).json({ msg: "Leave added successfully", user });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// POST request to create a new leave for a user
userVariableRouter.post("/:id/leave", async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;
    const userId = req.params.id;

    if (!startDate || !endDate || !reason) {
      return res.status(400).json({
        error: "All fields are required (startDate, endDate, reason)",
      });
    }

    const user = await userVariableModal.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Add leave to the existing leavePeriod array
    user.leavePeriod.push({ startDate, endDate, reason });

    // Update status
    user.status = new Date(endDate) >= new Date() ? "On Leave" : "Active";

    await user.save();
    res.status(200).json({ msg: "Leave added successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE request to delete a specific leave for a user
userVariableRouter.delete("/:id/leave/:index", async (req, res) => {
  try {
    const { id, index } = req.params;
    const user = await userVariableModal.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (index < 0 || index >= user.leavePeriod.length) {
      return res.status(400).json({ error: "Invalid leave index" });
    }

    user.leavePeriod.splice(index, 1);

    // Update status based on the latest leave
    if (user.leavePeriod.length > 0) {
      const latestLeave = user.leavePeriod[user.leavePeriod.length - 1];
      user.status = new Date(latestLeave.endDate) >= new Date() ? "On Leave" : "Active";
    } else {
      user.status = "Active";
    }

    await user.save();
    res.status(200).json({ msg: "Leave deleted successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all user variables
userVariableRouter.get("/leave", async (req, res) => {
  try {
    const allUsers = await userVariableModal.find();
    res.status(200).json(allUsers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET a single user variable by ID
userVariableRouter.get("/leave/:id", async (req, res) => {
  try {
    const user = await userVariableModal.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User variable not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});



module.exports = { userVariableRouter };
