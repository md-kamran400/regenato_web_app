const express = require("express");
const externalApiRoutes = express.Router();
const ExternalApi = require("../../model/ExternalApiConfig");

// Save or update API URL
externalApiRoutes.put("/externalLink_update", async (req, res) => {
  try {
    const { key, url } = req.body;

    if (!key || !url) {
      return res.status(400).json({ error: "key and url required" });
    }

    // Update only if document exists
    const updated = await ExternalApi.findOneAndUpdate(
      { key },
      { url },
      { new: true } // return updated data
    );

    if (!updated) {
      return res.status(404).json({
        error: `No API config found for key '${key}'. Cannot update.`,
      });
    }

    res.json({
      success: true,
      message: "API URL updated",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get all URLs
externalApiRoutes.get("/externalLink_list", async (req, res) => {
  const data = await ExternalApi.find();
  res.json(data);
});

// Toggle Active / Inactive for an API
externalApiRoutes.post("/externalLink_toggle", async (req, res) => {
  try {
    const { key, active } = req.body;

    if (!key || typeof active !== "boolean") {
      return res.status(400).json({ error: "key and boolean active required" });
    }

    const updated = await ExternalApi.findOneAndUpdate(
      { key },
      { active },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "API key not found" });
    }

    res.json({
      success: true,
      message: `API '${key}' is now ${active ? "ACTIVE" : "INACTIVE"}`,
      data: updated
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = externalApiRoutes;
