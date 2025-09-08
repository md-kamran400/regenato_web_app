// routes/variableRoutes/goodsReceipt.route.js
const express = require("express");
const axios = require("axios");

const stagingRoutes = express.Router();

stagingRoutes.get("/GetGoodsReceipt", async (req, res) => {
  try {
    const response = await axios.get(
      "http://182.77.56.228:85/GoodsReceipt/GetGoodsReceipt",
      {
        timeout: 10000,
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching GoodsReceipt:", error.message);
    res.status(500).json({ error: "Failed to fetch data from external API" });
  }
});

stagingRoutes.get("/Production/Product", async (req, res) => {
  try {
    const response = await axios.get(
      "http://182.77.56.228:90/Production/Product",
      {
        timeout: 10000,
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching GoodsReceipt:", error.message);
    res.status(500).json({ error: "Failed to fetch data from external API" });
  }
});

// http://182.77.56.228:90/Inventory/PostInventory
stagingRoutes.post("/Inventory/PostInventory", async (req, res) => {
  try {
    const response = await axios.post(
      "http://182.77.56.228:90/Inventory/PostInventory",
      req.body,
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error("Error posting inventory:", error.message);
    res.status(500).json({ error: "Failed to post inventory data" });
  }
});


stagingRoutes.get("/ClsIncoming", async (req, res) => {
  try {
    const response = await axios.get(
      "http://182.77.56.228:85/api/ClsIncoming",
      {
        timeout: 10000,
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching GoodsReceipt:", error.message);
    res.status(500).json({ error: "Failed to fetch data from external API" });
  }
});

// 

stagingRoutes.get("/GetGoodsReceiptByPart", async (req, res) => {
  try {
    const { partsCodeId } = req.query;
    if (!partsCodeId) {
      return res
        .status(400)
        .json({ error: "partsCodeId query param is required" });
    }
    const response = await axios.get(
      "http://182.77.56.228:85/GoodsReceipt/GetGoodsReceipt",
      {
        timeout: 10000,
      }
    );
    const data = response.data;
    // Find the first item where Itemcode matches partsCodeId (case-insensitive, trimmed)
    const match = data.find(
      (item) =>
        String(item.Itemcode).trim().toLowerCase() ===
        String(partsCodeId).trim().toLowerCase()
    );
    if (!match) {
      return res.status(404).json({
        error: "No matching Itemcode found for partsCodeId",
        quantity: 0,
      });
    }
    res.json({ quantity: match.Quantity, item: match });
  } catch (error) {
    console.error("Error fetching filtered GoodsReceipt:", error.message);
    res.status(500).json({ error: "Failed to fetch data from external API" });
  }
});

module.exports = stagingRoutes;
