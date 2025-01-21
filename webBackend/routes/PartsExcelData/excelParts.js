const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const xlsx = require("xlsx");
const fs = require("fs");
const PartRoutes = express();

const ExcelpartSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    partName: { type: String },
    clientNumber: { type: String },
    codeName: { type: String },
    partType: { type: String, enum: ["Make", "Purchase"] },
    costPerUnit: { type: Number },
    timePerUnit: { type: Number },
    stockPOQty: { type: Number },
    totalCost: { type: Number },
    totalQuantity: { type: Number },
    generalVariables: [
      {
        categoryId: String,
        name: String,
        value: String,
      },
    ],
    rmVariables: [
      {
        categoryId: String,
        name: String,
        netWeight: Number,
        pricePerKg: Number,
        totalRate: Number,
      },
    ],
    manufacturingVariables: [
      {
        categoryId: String,
        name: String,
        times: String,
        hours: Number,
        hourlyRate: Number,
        totalRate: Number,
      },
    ],
    shipmentVariables: [
      {
        categoryId: String,
        name: String,
        hourlyRate: Number,
      },
    ],
    overheadsAndProfits: [
      {
        categoryId: String,
        name: String,
        percentage: Number,
        totalRate: Number,
      },
    ],
    index: { type: Number },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { strict: false }
);
const ExcelPartsModel = mongoose.model("ExcelPart", ExcelpartSchema);

// Multer Configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Helper Functions
function parseExcel(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = xlsx.utils.sheet_to_json(sheet);

  // Track existing IDs to ensure uniqueness
  const idSet = new Set();
  const partsData = jsonData
    .filter((row) => row["Part ID"]) // Remove rows where ID is null or undefined
    .map((row) => {
      if (idSet.has(row["Part ID"])) {
        console.warn(`Duplicate ID found and skipped: ${row["Part ID"]}`);
        return null;
      }
      idSet.add(row["Part ID"]);
      return {
        id: row["Part ID"],
        partName: row["Part Name"],
        clientNumber: row["Client Number"],
        codeName: row["Code Name"],
        partType: row["Part Type"],
        costPerUnit: row["Cost Per Unit"],
        timePerUnit: row["Time Per Unit"],
        stockPOQty: row["Stock PO Qty"],
        totalCost: row["Total Cost"],
        totalQuantity: row["Total Quantity"],
        generalVariables: parseArrayData(row, "General Variables"),
        rmVariables: parseArrayData(row, "RM Variables"),
        manufacturingVariables: parseArrayData(row, "Manufacturing Variables"),
        shipmentVariables: parseArrayData(row, "Shipment Variables"),
        overheadsAndProfits: parseArrayData(row, "Overheads and Profits"),
      };
    })
    .filter((data) => data !== null); // Remove skipped rows

  return partsData;
}

function parseArrayData(row, prefix) {
  const items = [];
  let index = 1;
  while (row[`${prefix} Category ID ${index}`]) {
    const item = {
      categoryId: row[`${prefix} Category ID ${index}`],
      name: row[`${prefix} Name ${index}`],
    };

    // Add keys based on prefix type
    if (prefix === "General Variables") {
      item.value = row[`${prefix} Value ${index}`] || null;
    } else if (prefix === "RM Variables") {
      item.netWeight = parseFloat(row[`${prefix} Net Weight ${index}`]) || null;
      item.pricePerKg =
        parseFloat(row[`${prefix} Price Per Kg ${index}`]) || null;
      item.totalRate = parseFloat(row[`${prefix} Total Rate ${index}`]) || null;
    } else if (prefix === "Manufacturing Variables") {
      item.times = row[`${prefix} Times ${index}`] || null;
      item.hours = parseFloat(row[`${prefix} Hours ${index}`]) || null;
      item.hourlyRate =
        parseFloat(row[`${prefix} Hourly Rate ${index}`]) || null;
      item.totalRate = parseFloat(row[`${prefix} Total Rate ${index}`]) || null;
    } else if (prefix === "Shipment Variables") {
      item.hourlyRate =
        parseFloat(row[`${prefix} Hourly Rate ${index}`]) || null;
    } else if (prefix === "Overheads and Profits") {
      item.percentage =
        parseFloat(row[`${prefix} Percentage ${index}`]) || null;
      item.totalRate = parseFloat(row[`${prefix} Total Rate ${index}`]) || null;
    }

    items.push(item);
    index++;
  }
  return items;
}



PartRoutes.post(
  "/uploadparts",
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).send({ error: "File upload failed." });
      } else if (err) {
        return res
          .status(500)
          .send({ error: "An error occurred during upload." });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send("No file uploaded.");
      }

      // Save the file temporarily
      // const tempFilePath = `./uploads/${req.file.originalname}`;
      const tempFilePath = `./upload/${req.file.originalname}`;

      fs.writeFileSync(tempFilePath, req.file.buffer);

      // Parse Excel file
      const partsData = parseExcel(tempFilePath);

      // Remove the temporary file
      fs.unlinkSync(tempFilePath);

      // Save parts data to the database
      await ExcelPartsModel.insertMany(partsData);

      res.status(201).send({ message: "Parts data uploaded successfully." });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send({ error: "An error occurred while processing the file." });
    }
  }
);

module.exports = PartRoutes;
