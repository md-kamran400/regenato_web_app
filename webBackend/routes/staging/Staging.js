// // routes/variableRoutes/goodsReceipt.route.js
// const express = require("express");
// const axios = require("axios");

// const stagingRoutes = express.Router();

// // http://182.77.56.228:90/GoodsReceipt/GetGoodsReceipt
// stagingRoutes.get("/GoodsReceipt/GetGoodsReceipt", async (req, res) => {
//   try {
//     const response = await axios.get(
//       "http://182.77.56.228:90/GoodsReceipt/GetGoodsReceipt",
//       {
//         timeout: 10000,
//       }
//     );
//     res.json(response.data);
//   } catch (error) {
//     console.error("Error fetching GoodsReceipt:", error.message);
//     res.status(500).json({ error: "Failed to fetch data from external API" });
//   }
// });

// // http://182.77.56.228:90/GoodsIssue/GetGoodsIssue
// stagingRoutes.get("/GoodsIssue/GetGoodsIssue", async (req, res) => {
//   try {
//     const response = await axios.get(
//       "http://182.77.56.228:90/GoodsIssue/GetGoodsIssue",
//       {
//         timeout: 10000,
//       }
//     );
//     res.json(response.data);
//   } catch (error) {
//     console.error("Error fetching GoodsReceipt:", error.message);
//     res.status(500).json({ error: "Failed to fetch data from external API" });
//   }
// });

// stagingRoutes.get("/Production/Productt", async (req, res) => {
//   try {
//     const response = await axios.get(
//       "http://182.77.56.228:90/Production/Product",
//       {
//         timeout: 10000,
//       }
//     );

//     const raw = Array.isArray(response.data) ? response.data : [];

//     // Optional query params: years=2025,2026 and series=2526 (defaults to 2526)
//     const seriesParam = String(req.query.series || "2526").trim();
//     const yearsParam = String(req.query.years || "").trim();
//     const allowedYears = new Set(
//       yearsParam
//         ? yearsParam
//             .split(",")
//             .map((y) => Number(String(y).trim()))
//             .filter((n) => !Number.isNaN(n))
//         : []
//     );

//     const filtered = raw.filter((item) => {
//       const series = String(item?.Series ?? "").trim();
//       if (seriesParam && series !== seriesParam) return false;

//       if (allowedYears.size > 0) {
//         const dateStr = String(item?.postingdate ?? "").trim();
//         const parsedYear =
//           dateStr && !Number.isNaN(Date.parse(dateStr))
//             ? new Date(dateStr).getFullYear()
//             : Number((dateStr.match(/^(\d{4})/) || [])[1]);
//         if (!allowedYears.has(parsedYear)) return false;
//       }

//       return true;
//     });

//     res.json(filtered);
//   } catch (error) {
//     console.error("Error fetching GoodsReceipt:", error.message);
//     res.status(500).json({ error: "Failed to fetch data from external API" });
//   }
// });

// // http://182.77.56.228:90/Production/Product

// stagingRoutes.post("/Production/Productt", async (req, res) => {
//   try {
//     const response = await axios.post(
//       "http://182.77.56.228:90/Production/Product",
//       req.body,
//       {
//         timeout: 10000,
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       }
//     );
    
//     res.json(response.data);
//   } catch (error) {
//     console.error("Error posting inventory:", error.message);
//     res.status(500).json({ error: "Failed to post inventory data" });
//   }
// });

// // http://182.77.56.228:90/Inventory/PostInventory
// stagingRoutes.post("/Inventory/PostInventory", async (req, res) => {
//   try {
//     const response = await axios.post(
//       "http://182.77.56.228:90/Inventory/PostInventory",
//       req.body,
//       {
//         timeout: 10000,
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       }
//     );
    
//     res.json(response.data);
//   } catch (error) {
//     console.error("Error posting inventory:", error.message);
//     res.status(500).json({ error: "Failed to post inventory data" });
//   }
// });


// stagingRoutes.get("/ClsIncoming", async (req, res) => {
//   try {
//     const response = await axios.get(
//       "http://182.77.56.228:85/api/ClsIncoming",
//       {
//         timeout: 10000,
//       }
//     );
//     res.json(response.data);
//   } catch (error) {
//     console.error("Error fetching GoodsReceipt:", error.message);
//     res.status(500).json({ error: "Failed to fetch data from external API" });
//   }
// });

// stagingRoutes.get("/GetGoodsReceiptByPart", async (req, res) => {
//   try {
//     const { partsCodeId } = req.query;
//     if (!partsCodeId) {
//       return res
//         .status(400)
//         .json({ error: "partsCodeId query param is required" });
//     }
//     const response = await axios.get(
//       "http://182.77.56.228:85/GoodsReceipt/GetGoodsReceipt",
//       {
//         timeout: 10000,
//       }
//     );
//     const data = response.data;
//     // Find the first item where Itemcode matches partsCodeId (case-insensitive, trimmed)
//     const match = data.find(
//       (item) =>
//         String(item.Itemcode).trim().toLowerCase() ===
//         String(partsCodeId).trim().toLowerCase()
//     );
//     if (!match) {
//       return res.status(404).json({
//         error: "No matching Itemcode found for partsCodeId",
//         quantity: 0,
//       });
//     }
//     res.json({ quantity: match.Quantity, item: match });
//   } catch (error) {
//     console.error("Error fetching filtered GoodsReceipt:", error.message);
//     res.status(500).json({ error: "Failed to fetch data from external API" });
//   }
// });

// module.exports = stagingRoutes;




const express = require("express");
const axios = require("axios");
const ExternalApi = require("../../model/ExternalApiConfig");
const StoreVariableModal = require("../../model/storemodel");

const stagingRoutes = express.Router();

// Helper to get URL from DB
async function getApiUrl(key) {
  const config = await ExternalApi.findOne({ key });

  if (!config) throw new Error(`API URL not found for key '${key}'`);

  // If API is inactive → THROW ERROR so frontend fallback can run
  if (!config.active) {
    throw new Error(`API '${key}' is disabled`);
  }

  return config.url;
}


async function resolveApi(key) {
  const config = await ExternalApi.findOne({ key });

  if (!config) throw new Error(`Config for ${key} not found`);

  // Toggle Active -> Use Primary URL
  if (config.active) {
    return { url: config.url, isAlternate: false };
  }

  // Toggle OFF but no alternate configured
  if (!config.alternateUrlKey) {
    throw new Error(`API '${key}' is disabled and no alternate API found`);
  }

  // Fetch alternate config
  const altConfig = await ExternalApi.findOne({ key: config.alternateUrlKey });
  if (!altConfig) {
    throw new Error(`Alternate config '${config.alternateUrlKey}' not found`);
  }

  return { url: altConfig.url, isAlternate: true };
}


// GOODS RECEIPT
stagingRoutes.get("/GoodsReceipt/GetGoodsReceipt", async (req, res) => {
  try {
    const url = await getApiUrl("goodsReceipt");
    const response = await axios.get(url, { timeout: 10000 });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GOODS ISSUE
stagingRoutes.get("/GoodsIssue/GetGoodsIssue", async (req, res) => {
  try {
    const url = await getApiUrl("goodsIssue");
    const response = await axios.get(url, { timeout: 10000 });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PRODUCTION PRODUCT (GET)
stagingRoutes.get("/Production/Product", async (req, res) => {
  try {
    const url = await getApiUrl("productionProduct");
    const response = await axios.get(url, { timeout: 10000 });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PRODUCTION PRODUCT (POST)
stagingRoutes.post("/Production/Product", async (req, res) => {
  try {
    const url = await getApiUrl("productionProduct");
    const response = await axios.post(url, req.body, { timeout: 10000 });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST INVENTORY
stagingRoutes.post("/Inventory/PostInventory", async (req, res) => {
  try {
    const url = await getApiUrl("inventoryPost");
    const response = await axios.post(url, req.body, { timeout: 10000 });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CLS INCOMING
stagingRoutes.get("/ClsIncoming", async (req, res) => {
  try {
    const url = await getApiUrl("clsIncoming");
    const response = await axios.get(url, { timeout: 10000 });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// stagingRoutes.get("/ClsIncoming", async (req, res) => {
//   try {
//     const { url, isAlternate } = await resolveApi("clsIncoming");

//     if (isAlternate) {
//       // Using alternate API → directly call local handler
//       return stagingRoutes.handleBlnk(req, res);
//     }

//     const response = await axios.get(url);
//     res.json(response.data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


stagingRoutes.handleBlnk = async (req, res) => {
  try {
    const categoryId = "BLNK";
    const storeVariable = await StoreVariableModal.findOne({ categoryId });

    if (!storeVariable) {
      return res.status(404).json({ error: "BLNK category not found" });
    }

    const onhand = storeVariable.quantity.reduce((sum, q) => sum + q, 0);

    const response = [
      {
        _id: storeVariable._id,
        categoryId: storeVariable.categoryId,
        name: storeVariable.Name,
        onhand,
        quantity: storeVariable.quantity,
        location: storeVariable.location,
        transactionHistory: storeVariable.transactionHistory,
      }
    ];

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

stagingRoutes.get("/onhand-blnk", stagingRoutes.handleBlnk);


// stagingRoutes.get("/onhand-blnk", async (req, res) => {
//   try {
//     // Hardcoded categoryId = BLNK
//     const categoryId = "BLNK";

//     // Find the BLNK document
//     const storeVariable = await StoreVariableModal.findOne({ categoryId });

//     if (!storeVariable) {
//       return res.status(404).json({ error: "BLNK category not found" });
//     }

//     // Calculate onhand (sum of quantity array)
//     const onhand = storeVariable.quantity.reduce((sum, q) => sum + q, 0);

//     // Prepare final array response
//     const response = [
//       {
//         _id: storeVariable._id,
//         categoryId: storeVariable.categoryId,
//         name: storeVariable.Name,
//         onhand,
//         quantity: storeVariable.quantity,
//         location: storeVariable.location,
//         transactionHistory: storeVariable.transactionHistory,
//       }
//     ];

//     res.json(response);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });




module.exports = stagingRoutes;
