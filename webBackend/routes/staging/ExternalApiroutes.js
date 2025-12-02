const express = require("express");
const externalApiRoutes = express.Router();
const ExternalApi = require("../../model/ExternalApiConfig");

// Save or update API URL
externalApiRoutes.post("/externalLink_update", async (req, res) => {
  try {
    const { key, url } = req.body;

    if (!key || !url)
      return res.status(400).json({ error: "key and url required" });

    await ExternalApi.findOneAndUpdate(
      { key },
      { url },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: "API URL updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all URLs
externalApiRoutes.get("/externalLink_list", async (req, res) => {
  const data = await ExternalApi.find();
  res.json(data);
});

module.exports = externalApiRoutes;
