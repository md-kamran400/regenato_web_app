// const axios = require("axios");
// const fetch = require("node-fetch");

// class AutoSyncService {
//   constructor() {
//     this.isRunning = false;
//     this.lastSyncTime = null;
//     this.syncInterval = 10 * 60 * 1000; // ✅ 10 minutes in milliseconds
//     this.intervalId = null;
//     this.baseUrl = process.env.BASE_URL || "http://localhost:4040";
//     this.externalApiUrl = "http://182.77.56.228:90";
//   }

//   /** Start the auto-sync service */
//   start() {
//     if (this.isRunning) {
//       console.log("Auto-sync service is already running");
//       return;
//     }

//     console.log("✅ Starting auto-sync service (2025–2026 filter)...");
//     this.isRunning = true;

//     // Run immediately
//     this.performSync();

//     // Then run every 10 minutes
//     this.intervalId = setInterval(() => {
//       this.performSync();
//     }, this.syncInterval);
//   }

//   /** Stop the auto-sync service */
//   stop() {
//     if (!this.isRunning) {
//       console.log("Auto-sync service is not running");
//       return;
//     }

//     console.log("🛑 Stopping auto-sync service...");
//     this.isRunning = false;

//     if (this.intervalId) {
//       clearInterval(this.intervalId);
//       this.intervalId = null;
//     }
//   }

//   /** Perform the sync operation */
//   async performSync() {
//     try {
//       console.log(
//         `[${new Date().toISOString()}] 🔄 Starting auto-sync for 2025–2026 production data...`
//       );

//       // Fetch production data from external API
//       const productionData = await this.fetchProductionData();
//       if (!productionData || productionData.length === 0) {
//         console.log("No valid 2025–2026 production data found");
//         return;
//       }

//       console.log(`Fetched ${productionData.length} items from Production API`);

//       // Get existing parts and projects
//       const [existingParts, existingProjects] = await Promise.all([
//         this.fetchExistingParts(),
//         this.fetchExistingProjects(),
//       ]);

//       console.log(
//         `Found ${existingParts.length} existing parts and ${existingProjects.length} existing projects`
//       );

//       // Find new parts and POs to create
//       const newParts = this.findNewParts(productionData, existingParts);
//       const newPOs = this.findNewPOs(
//         productionData,
//         existingParts,
//         existingProjects
//       );

//       // Create new parts in bulk
//       if (newParts.length > 0) {
//         console.log(`🧩 Creating ${newParts.length} new parts in bulk...`);
//         await this.createNewPartsBulk(newParts);
//       } else {
//         console.log("No new parts to create");
//       }

//       // Create new POs in bulk
//       if (newPOs.length > 0) {
//         console.log(`📦 Creating ${newPOs.length} new POs in bulk...`);
//         await this.createNewPOsBulk(newPOs, existingParts);
//       } else {
//         console.log("No new POs to create");
//       }

//       this.lastSyncTime = new Date();
//       console.log(
//         `[${new Date().toISOString()}] ✅ Auto-sync completed — ${
//           newParts.length
//         } parts and ${newPOs.length} POs created`
//       );
//     } catch (error) {
//       console.error(
//         `[${new Date().toISOString()}] ❌ Auto-sync error:`,
//         error.message
//       );
//     }
//   }

//   /** Fetch only 2025–2026 production data */
//   async fetchProductionData() {
//     try {
//       const response = await axios.get(
//         `${this.externalApiUrl}/Production/Product`,
//         { timeout: 10000 }
//       );

//       const allData = Array.isArray(response.data) ? response.data : [];
//       console.log(`Fetched ${allData.length} total production items`);

//       // ✅ Filter only for 2025 and 2026 postingdate
//       const filteredData = allData.filter((item) => {
//         if (!item.postingdate) return false;
//         const year = new Date(item.postingdate).getFullYear();
//         return year === 2025 || year === 2026;
//       });

//       console.log(
//         `Filtered ${filteredData.length} items with postingdate in 2025–2026`
//       );
//       return filteredData;
//     } catch (error) {
//       console.error("Error fetching production data:", error.message);
//       return [];
//     }
//   }

//   /** Fetch existing parts from local API */
//   async fetchExistingParts() {
//     try {
//       const response = await fetch(`${this.baseUrl}/api/parts?limit=100000`);
//       if (!response.ok) throw new Error("Failed to fetch parts");
//       const data = await response.json();
//       return Array.isArray(data)
//         ? data
//         : Array.isArray(data?.data)
//         ? data.data
//         : [];
//     } catch (error) {
//       console.error("Error fetching existing parts:", error.message);
//       return [];
//     }
//   }

//   /** Fetch existing projects from local API */
//   async fetchExistingProjects() {
//     try {
//       const response = await fetch(
//         `${this.baseUrl}/api/defpartproject/projects`
//       );
//       if (!response.ok) throw new Error("Failed to fetch projects");
//       const data = await response.json();
//       return Array.isArray(data) ? data : [];
//     } catch (error) {
//       console.error("Error fetching existing projects:", error.message);
//       return [];
//     }
//   }

//   /** Find new parts (avoid duplicates) */
//   findNewParts(productionData, existingParts) {
//     const existingPartIds = new Set(
//       existingParts.map((part) =>
//         String(part.id || "")
//           .trim()
//           .toLowerCase()
//       )
//     );

//     const newParts = [];
//     const seenItemCodes = new Set();

//     for (const prod of productionData) {
//       const itemCode = String(prod.ItemCode || "")
//         .trim()
//         .toLowerCase();
//       if (!itemCode) continue;

//       if (!existingPartIds.has(itemCode) && !seenItemCodes.has(itemCode)) {
//         seenItemCodes.add(itemCode);
//         newParts.push(prod);
//       }
//     }

//     console.log(
//       `Found ${newParts.length} new parts (excluding duplicates from DB)`
//     );
//     return newParts;
//   }

//   /** Find new POs (avoid duplicates) */
//   findNewPOs(productionData, existingParts, existingProjects) {
//     const existingPartIds = new Set(
//       existingParts.map((part) =>
//         String(part.id || "")
//           .trim()
//           .toLowerCase()
//       )
//     );

//     const existingProjectDocNums = new Set(
//       existingProjects.map((project) =>
//         String(project.projectName || project.DocNum || "")
//           .trim()
//           .toLowerCase()
//       )
//     );

//     const newPOs = [];
//     const seenDocNums = new Set();

//     for (const prod of productionData) {
//       const itemCode = String(prod.ItemCode || "")
//         .trim()
//         .toLowerCase();
//       const docNum = String(prod.DocNum || "")
//         .trim()
//         .toLowerCase();

//       if (
//         itemCode &&
//         docNum &&
//         existingPartIds.has(itemCode) &&
//         !existingProjectDocNums.has(docNum) && // ✅ Avoid duplicates
//         !seenDocNums.has(docNum)
//       ) {
//         seenDocNums.add(docNum);
//         newPOs.push(prod);
//       }
//     }

//     console.log(
//       `Found ${newPOs.length} new POs (excluding already existing ones)`
//     );
//     return newPOs;
//   }

//   /** Bulk create new parts */
//   async createNewPartsBulk(newParts) {
//     const requests = newParts.map((prod) => {
//       const payload = {
//         id: prod.ItemCode || "",
//         partName: prod.ProdName || "",
//         clientNumber: "",
//         codeName: "",
//         partType: "Make",
//         costPerUnit: 0,
//         timePerUnit: 0,
//         stockPOQty: 0,
//         totalCost: 0,
//         totalQuantity: 0,
//       };

//       return fetch(`${this.baseUrl}/api/parts`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//     });

//     const results = await Promise.allSettled(requests);
//     let successCount = 0;
//     let duplicateCount = 0;
//     let errorCount = 0;

//     for (const result of results) {
//       if (result.status === "fulfilled" && result.value.ok) {
//         successCount++;
//       } else if (result.status === "fulfilled" && !result.value.ok) {
//         try {
//           const error = await result.value.json();
//           if (error.message?.includes("duplicate key error")) {
//             duplicateCount++;
//           } else {
//             errorCount++;
//           }
//         } catch (_) {
//           errorCount++;
//         }
//       } else {
//         errorCount++;
//       }
//     }

//     console.log(
//       `✅ Parts creation done: ${successCount} created, ${duplicateCount} duplicates, ${errorCount} errors`
//     );
//   }

//   /** Bulk create new POs */
//   async createNewPOsBulk(newPOs, existingParts) {
//     const partMap = new Map(
//       existingParts.map((part) => [
//         String(part.id || "")
//           .trim()
//           .toLowerCase(),
//         part,
//       ])
//     );

//     const requests = newPOs.map((prod) => {
//       const itemCode = String(prod.ItemCode || "")
//         .trim()
//         .toLowerCase();
//       const matchedPart = partMap.get(itemCode);
//       if (!matchedPart || !matchedPart._id)
//         return Promise.resolve({ ok: false, _skipped: true });

//       const payload = {
//         projectName: String(prod.DocNum || ""),
//         projectType: "External PO",
//         selectedPartId: matchedPart.id,
//         selectedPartName: prod.ProdName || matchedPart.partName || "",
//         partQuantity: prod.PlannedQty || 0,
//       };

//       return fetch(`${this.baseUrl}/api/defpartproject/production_part`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//     });

//     const results = await Promise.allSettled(requests);
//     let successCount = 0;
//     let skippedCount = 0;
//     let errorCount = 0;

//     for (const result of results) {
//       if (result.status === "fulfilled") {
//         if (result.value._skipped) skippedCount++;
//         else if (result.value.ok) successCount++;
//         else errorCount++;
//       } else {
//         errorCount++;
//       }
//     }

//     console.log(
//       `✅ PO creation done: ${successCount} created, ${skippedCount} skipped, ${errorCount} errors`
//     );
//   }

//   /** Get service status */
//   getStatus() {
//     return {
//       isRunning: this.isRunning,
//       lastSyncTime: this.lastSyncTime,
//       syncInterval: this.syncInterval,
//     };
//   }
// }

// const autoSyncService = new AutoSyncService();
// module.exports = autoSyncService;
