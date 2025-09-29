const axios = require("axios");
const fetch = require("node-fetch");

class AutoSyncService {
  constructor() {
    this.isRunning = false;
    this.lastSyncTime = null;
    this.syncInterval = 3 * 60 * 1000; // 3 minutes in milliseconds
    this.intervalId = null;
    this.baseUrl = process.env.BASE_URL || "http://localhost:4040";
    this.externalApiUrl = "http://182.77.56.228:90";
  }

  /**
   * Start the auto-sync service
   */
  start() {
    if (this.isRunning) {
      console.log("Auto-sync service is already running");
      return;
    }

    console.log("Starting auto-sync service for 2526 series...");
    this.isRunning = true;

    // Run immediately on start
    this.performSync();

    // Then run every 3 minutes
    this.intervalId = setInterval(() => {
      this.performSync();
    }, this.syncInterval);
  }

  /**
   * Stop the auto-sync service
   */
  stop() {
    if (!this.isRunning) {
      console.log("Auto-sync service is not running");
      return;
    }

    console.log("Stopping auto-sync service...");
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Perform the sync operation
   */
  async performSync() {
    try {
      console.log(
        `[${new Date().toISOString()}] Starting auto-sync for 2526 series...`
      );

      // Fetch production data from external API (2526 series only)
      const productionData = await this.fetchProductionData();
      if (!productionData || productionData.length === 0) {
        console.log("No 2526 series production data found");
        return;
      }

      console.log(`Fetched ${productionData.length} items from 2526 series`);

      // Get existing parts and projects
      const [existingParts, existingProjects] = await Promise.all([
        this.fetchExistingParts(),
        this.fetchExistingProjects(),
      ]);

      console.log(
        `Found ${existingParts.length} existing parts and ${existingProjects.length} existing projects`
      );

      // Find new parts that need to be created (bulk)
      const newParts = this.findNewParts(productionData, existingParts);

      // Find new POs that need to be created (bulk)
      const newPOs = this.findNewPOs(
        productionData,
        existingParts,
        existingProjects
      );

      // Create new parts in bulk
      if (newParts.length > 0) {
        console.log(`Creating ${newParts.length} new parts in bulk...`);
        await this.createNewPartsBulk(newParts);
      } else {
        console.log("No new parts to create");
      }

      // Create new POs in bulk
      if (newPOs.length > 0) {
        console.log(`Creating ${newPOs.length} new POs in bulk...`);
        await this.createNewPOsBulk(newPOs, existingParts);
      } else {
        console.log("No new POs to create");
      }

      this.lastSyncTime = new Date();
      console.log(
        `[${new Date().toISOString()}] Auto-sync completed. Created ${
          newParts.length
        } parts and ${newPOs.length} POs`
      );
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Auto-sync error:`,
        error.message
      );
    }
  }

  /**
   * Fetch production data from external API and filter for 2526 series only
   */
  async fetchProductionData() {
    try {
      // Fetch all production data first
      const response = await axios.get(
        `${this.externalApiUrl}/Production/Product`,
        { timeout: 10000 }
      );

      const allData = Array.isArray(response.data) ? response.data : [];
      console.log(`Fetched ${allData.length} total production items`);

      // Manually filter for 2526 series only
      const filteredData = allData.filter((item) => {
        const series = String(item.Series || "").trim();
        return series === "2526";
      });

      console.log(`Filtered ${filteredData.length} items with Series: 2526`);
      return filteredData;
    } catch (error) {
      console.error("Error fetching production data:", error.message);
      return [];
    }
  }

  /**
   * Fetch existing parts from our API
   */
  async fetchExistingParts() {
    try {
      const response = await fetch(`${this.baseUrl}/api/parts?limit=100000`);
      if (!response.ok) {
        throw new Error("Failed to fetch parts");
      }
      const data = await response.json();
      return Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];
    } catch (error) {
      console.error("Error fetching existing parts:", error.message);
      return [];
    }
  }

  /**
   * Fetch existing projects from our API
   */
  async fetchExistingProjects() {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/defpartproject/projects`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching existing projects:", error.message);
      return [];
    }
  }

  /**
   * Find new parts that need to be created (filter unique data)
   */
  findNewParts(productionData, existingParts) {
    // Create sets for quick lookup of existing parts
    const existingPartIds = new Set(
      existingParts.map((part) =>
        String(part.id || "")
          .trim()
          .toLowerCase()
      )
    );

    // Filter unique new parts that don't exist in our parts API
    const newParts = [];
    const seenItemCodes = new Set();

    for (const prod of productionData) {
      const itemCode = String(prod.ItemCode || "")
        .trim()
        .toLowerCase();
      const docNum = String(prod.DocNum || "")
        .trim()
        .toLowerCase();

      // Only process 2526 series data that doesn't exist and is unique
      if (
        itemCode &&
        docNum &&
        !existingPartIds.has(itemCode) &&
        !seenItemCodes.has(itemCode)
      ) {
        seenItemCodes.add(itemCode);
        newParts.push(prod);
      }
    }

    console.log(
      `Found ${newParts.length} new parts to create from ${productionData.length} total 2526 series items`
    );
    return newParts;
  }

  /**
   * Find new POs that need to be created (filter unique data)
   */
  findNewPOs(productionData, existingParts, existingProjects) {
    const existingPartIds = new Set(
      existingParts.map((part) =>
        String(part.id || "")
          .trim()
          .toLowerCase()
      )
    );

    const existingProjectNames = new Set(
      existingProjects.map((project) =>
        String(project.projectName || "")
          .trim()
          .toLowerCase()
      )
    );

    // Filter unique new POs
    const newPOs = [];
    const seenDocNums = new Set();

    for (const prod of productionData) {
      const itemCode = String(prod.ItemCode || "")
        .trim()
        .toLowerCase();
      const docNum = String(prod.DocNum || "")
        .trim()
        .toLowerCase();

      // PO can be created if:
      // 1. Part exists in our system (ItemCode matches existing part)
      // 2. PO doesn't exist yet (DocNum not in existing projects)
      // 3. It's unique (not already processed)
      if (
        itemCode &&
        docNum &&
        existingPartIds.has(itemCode) &&
        !existingProjectNames.has(docNum) &&
        !seenDocNums.has(docNum)
      ) {
        seenDocNums.add(docNum);
        newPOs.push(prod);
      }
    }

    console.log(
      `Found ${newPOs.length} new POs to create from ${productionData.length} total 2526 series items`
    );
    return newPOs;
  }

  /**
   * Create new parts in bulk
   */
  async createNewPartsBulk(newParts) {
    console.log(`Creating ${newParts.length} new parts in bulk...`);

    const requests = newParts.map((prod) => {
      const payload = {
        id: prod.ItemCode || "",
        partName: prod.ProdName || "",
        clientNumber: "",
        codeName: "",
        partType: "Make",
        costPerUnit: 0,
        timePerUnit: 0,
        stockPOQty: 0,
        totalCost: 0,
        totalQuantity: 0,
      };

      return fetch(`${this.baseUrl}/api/parts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    });

    const results = await Promise.allSettled(requests);
    let successCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;

    for (const result of results) {
      if (result.status === "fulfilled" && result.value.ok) {
        successCount++;
      } else if (result.status === "fulfilled" && !result.value.ok) {
        try {
          const error = await result.value.json();
          if (error.message && error.message.includes("duplicate key error")) {
            duplicateCount++;
          } else {
            errorCount++;
          }
        } catch (_) {
          errorCount++;
        }
      } else {
        errorCount++;
      }
    }

    console.log(
      `✅ Bulk parts creation completed: ${successCount} created, ${duplicateCount} duplicates, ${errorCount} errors`
    );
  }

  /**
   * Create new POs in bulk
   */
  async createNewPOsBulk(newPOs, existingParts) {
    console.log(`Creating ${newPOs.length} new POs in bulk...`);

    // Create a map for quick part lookup
    const partMap = new Map(
      existingParts.map((part) => [
        String(part.id || "")
          .trim()
          .toLowerCase(),
        part,
      ])
    );

    const requests = newPOs.map((prod) => {
      const itemCode = String(prod.ItemCode || "")
        .trim()
        .toLowerCase();
      const matchedPart = partMap.get(itemCode);

      if (!matchedPart || !matchedPart._id) {
        return Promise.resolve({ ok: false, _skipped: true });
      }

      const payload = {
        projectName: String(prod.DocNum || ""),
        projectType: "External PO",
        selectedPartId: matchedPart.id,
        selectedPartName: prod.ProdName || matchedPart.partName || "",
        partQuantity: prod.PlannedQty || 0,
      };

      return fetch(`${this.baseUrl}/api/defpartproject/production_part`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    });

    const results = await Promise.allSettled(requests);
    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const result of results) {
      if (result.status === "fulfilled") {
        if (result.value._skipped) {
          skippedCount++;
        } else if (result.value.ok) {
          successCount++;
        } else {
          errorCount++;
        }
      } else {
        errorCount++;
      }
    }

    console.log(
      `✅ Bulk POs creation completed: ${successCount} created, ${skippedCount} skipped, ${errorCount} errors`
    );
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastSyncTime: this.lastSyncTime,
      syncInterval: this.syncInterval,
    };
  }
}

// Create singleton instance
const autoSyncService = new AutoSyncService();

module.exports = autoSyncService;
