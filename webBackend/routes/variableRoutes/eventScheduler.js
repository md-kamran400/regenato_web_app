// const express = require("express");
// const mongoose = require("mongoose");
// const EventScheduler = require("../../model/eventSchedulermodel"); // Adjust the path as needed

// const eventRoutes = express.Router();

// // Create an event
// eventRoutes.post("/events", async (req, res) => {
//   try {
//     const { eventName, startDate, endDate } = req.body;
//     const newEvent = new EventScheduler({ eventName, startDate, endDate });
//     await newEvent.save();
//     res.status(201).json(newEvent);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to create event" });
//   }
// });

// // Get all events
// eventRoutes.get("/events", async (req, res) => {
//   try {
//     const events = await EventScheduler.find();
//     res.json(events);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to retrieve events" });
//   }
// });

// // Get a single event by ID
// eventRoutes.get("/events/:id", async (req, res) => {
//   try {
//     const event = await EventScheduler.findById(req.params.id);
//     if (!event) {
//       return res.status(404).json({ error: "Event not found" });
//     }
//     res.json(event);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to retrieve event" });
//   }
// });

// // Update an event by ID
// eventRoutes.put("/events/:id", async (req, res) => {
//   try {
//     const updatedEvent = await EventScheduler.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );
//     if (!updatedEvent) {
//       return res.status(404).json({ error: "Event not found" });
//     }
//     res.json(updatedEvent);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to update event" });
//   }
// });

// // Delete an event by ID
// eventRoutes.delete("/events/:id", async (req, res) => {
//   try {
//     const deletedEvent = await EventScheduler.findByIdAndDelete(req.params.id);
//     if (!deletedEvent) {
//       return res.status(404).json({ error: "Event not found" });
//     }
//     res.json({ message: "Event deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to delete event" });
//   }
// });

// module.exports = eventRoutes;

const express = require("express");
const mongoose = require("mongoose");
const EventScheduler = require("../../model/eventSchedulermodel"); 
const moment = require("moment");

const eventRoutes = express.Router();

// Create an event
eventRoutes.post("/events", async (req, res) => {
  try {
    const { eventName, startDate, endDate } = req.body;

    // Parse the dates as UTC
    const startDateUTC = moment.utc(startDate).toDate();
    const endDateUTC = moment.utc(endDate).toDate();

    const newEvent = new EventScheduler({
      eventName,
      startDate: startDateUTC,
      endDate: endDateUTC,
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: "Failed to create event" });
  }
});

// Get all events
eventRoutes.get("/events", async (req, res) => {
  try {
    const events = await EventScheduler.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve events" });
  }
});

// Get a single event by ID
eventRoutes.get("/events/:id", async (req, res) => {
  try {
    const event = await EventScheduler.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve event" });
  }
});

// Update an event by ID
eventRoutes.put("/events/:id", async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    // Parse the dates as UTC if they are provided
    const updateData = { ...req.body };
    if (startDate) updateData.startDate = moment.utc(startDate).toDate();
    if (endDate) updateData.endDate = moment.utc(endDate).toDate();

    const updatedEvent = await EventScheduler.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: "Failed to update event" });
  }
});

// Delete an event by ID
eventRoutes.delete("/events/:id", async (req, res) => {
  try {
    const deletedEvent = await EventScheduler.findByIdAndDelete(req.params.id);
    if (!deletedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete event" });
  }
});

module.exports = eventRoutes;
