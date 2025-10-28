import React, { useState, useEffect } from "react";
import {
  Table,
  Spinner,
  Alert,
  Input,
  Row,
  Col,
  Pagination,
  PaginationItem,
  PaginationLink,
  Card,
  CardBody,
  CardHeader,
  Badge,
  ButtonGroup,
  Button,
} from "reactstrap";

const WareHouseAllocation = () => {
  const [data, setData] = useState(null);
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("all");
  const [warehouseData, setWarehouseData] = useState(new Map());

  // Fetch store data for adjustments
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/storesVariable`
        );
        if (response.ok) {
          const result = await response.json();
          setStoreData(result);
        }
      } catch (err) {
        console.error("Error fetching store data:", err);
      }
    };

    fetchStoreData();
  }, []);

  // Fetch warehouse data for mapping categoryId to warehouse names
  useEffect(() => {
    const fetchWarehouseData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/storesVariable`
        );
        if (response.ok) {
          const warehouses = await response.json();
          const warehouseMap = new Map();

          warehouses.forEach((warehouse) => {
            if (
              warehouse.categoryId &&
              warehouse.Name &&
              warehouse.Name.length > 0
            ) {
              // store plain warehouse name (without categoryId). We'll combine when rendering.
              warehouseMap.set(warehouse.categoryId, {
                name: warehouse.Name[0],
                location:
                  warehouse.location && warehouse.location.length > 0
                    ? warehouse.location[0]
                    : "N/A",
                quantity:
                  warehouse.quantity && warehouse.quantity.length > 0
                    ? warehouse.quantity[0]
                    : 0,
              });
            }
          });

          setWarehouseData(warehouseMap);
        }
      } catch (err) {
        console.error("Error fetching warehouse data:", err);
      }
    };

    fetchWarehouseData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/all-allocations`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Transform daily tracking data into inventory transactions
  // Transform daily tracking data into inventory transactions
  const transformToInventoryTransactions = (allocationsData) => {
    if (!allocationsData || !Array.isArray(allocationsData)) return [];

    const allTransactions = [];

    allocationsData.forEach((project) => {
      if (project.allocations && Array.isArray(project.allocations)) {
        let blnkTransferProcessed = false; // Flag to ensure BLNK transfer is only processed once per project

        project.allocations.forEach((allocation, allocationIndex) => {
          // allocation here is a part-level object now (contains allocations[] and jobWorkMovements[])
          const partLevelAllocations = allocation.allocations || [];

          // 1) Surface jobWorkMovements as inventory transactions
          if (
            allocation.jobWorkMovements &&
            Array.isArray(allocation.jobWorkMovements)
          ) {
            allocation.jobWorkMovements.forEach((move) => {
              const base = {
                timestamp: move.timestamp || new Date().toISOString(),
                project: project.projectName,
                partName: allocation.partName,
                process: "Job Work",
                machine: "--",
                operator: "--",
                partsCodeId: allocation.partsCodeId,
                source: "jobWork",
              };

              if (move.type === "issue") {
                allTransactions.push({
                  ...base,
                  warehouseId: move.warehouseId,
                  transactionType: "Out",
                  quantityChange: `(-${move.quantity || 0})`,
                  rawQuantity: -(Number(move.quantity) || 0),
                  dailyStatus: "Job-Work Issue",
                });
              } else if (move.type === "receipt") {
                allTransactions.push({
                  ...base,
                  warehouseId: move.warehouseId,
                  transactionType: "In",
                  quantityChange: `(+${move.quantity || 0})`,
                  rawQuantity: Number(move.quantity) || 0,
                  dailyStatus: "Job-Work Receipt",
                });
              } else if (move.type === "autoMove") {
                // Out from current (job-work) and In to next process
                if (move.fromWarehouseId) {
                  allTransactions.push({
                    ...base,
                    warehouseId: move.fromWarehouseId,
                    transactionType: "Out",
                    quantityChange: `(-${move.quantity || 0})`,
                    rawQuantity: -(Number(move.quantity) || 0),
                    dailyStatus: "Auto Move",
                  });
                }
                if (move.toWarehouseId) {
                  allTransactions.push({
                    ...base,
                    warehouseId: move.toWarehouseId,
                    transactionType: "In",
                    quantityChange: `(+${move.quantity || 0})`,
                    rawQuantity: Number(move.quantity) || 0,
                    dailyStatus: "Auto Move",
                  });
                }
              }
            });
          }

          if (partLevelAllocations && Array.isArray(partLevelAllocations)) {
            partLevelAllocations.forEach((alloc) => {
              // Handle BLNK transfer transactions for first process only (index 0) and only once
              if (
                alloc.blankStoreTransfer &&
                allocationIndex === 0 &&
                !blnkTransferProcessed
              ) {
                blnkTransferProcessed = true; // Mark as processed
                const transfer = alloc.blankStoreTransfer;

                // Only create transactions if blankStoreQty > 0
                if (transfer.blankStoreQty > 0) {
                  console.log("Creating BLNK transfer transactions:", transfer);

                  // Create IN transaction for first process warehouse (Row 2)
                  allTransactions.push({
                    warehouseId:
                      transfer.firstProcessWarehouseName ||
                      alloc.wareHouse ||
                      alloc.warehouseId,
                    transactionType: "In",
                    quantityChange: `(+${transfer.blankStoreQty}) (${transfer.firstProcessWarehouseQty})`,
                    timestamp: transfer.transferTimestamp,
                    project: project.projectName,
                    partName: allocation.partName,
                    process: allocation.processName,
                    machine: alloc.machineId || "--",
                    operator: alloc.operator || "--",
                    rawQuantity: transfer.blankStoreQty,
                    dailyStatus: "Allocated",
                    partsCodeId: allocation.partsCodeId,
                    source: "blankStoreTransfer",
                  });

                  // Create OUT transaction for BLNK warehouse (Row 1)
                  allTransactions.push({
                    warehouseId: transfer.blankStoreName || "BLNK",
                    transactionType: "Out",
                    quantityChange: `(-${transfer.blankStoreQty})`,
                    timestamp: transfer.transferTimestamp,
                    project: project.projectName,
                    partName: allocation.partName,
                    process: "--",
                    machine: "--",
                    operator: "--",
                    rawQuantity: -transfer.blankStoreQty,
                    dailyStatus: "Allocated",
                    partsCodeId: allocation.partsCodeId,
                    source: "blankStoreTransfer",
                  });

                  console.log(
                    "BLNK transfer transactions created successfully"
                  );
                }
              }

              if (alloc.dailyTracking && Array.isArray(alloc.dailyTracking)) {
                alloc.dailyTracking.forEach((tracking) => {
                  // Create OUT transaction for fromWarehouse (for produced quantity)
                  if (
                    tracking.fromWarehouse &&
                    tracking.fromWarehouse !== "N/A" &&
                    tracking.produced > 0
                  ) {
                    allTransactions.push({
                      warehouseId: tracking.fromWarehouse,
                      transactionType: "Out",
                      quantityChange: `(-${tracking.produced}) ${
                        tracking.fromWarehouseQty || 0
                      }`,
                      timestamp: tracking.date,
                      project: project.projectName,
                      partName: allocation.partName,
                      process: allocation.processName,
                      machine: tracking.machineId || alloc.machineId,
                      operator: tracking.operator || alloc.operator,
                      rawQuantity: -tracking.produced,
                      dailyStatus: tracking.dailyStatus,
                      partsCodeId: allocation.partsCodeId,
                      source: "dailyTracking",
                    });
                  }

                  // Create IN transaction for toWarehouse (for produced quantity)
                  if (
                    tracking.toWarehouse &&
                    tracking.toWarehouse !== "N/A" &&
                    tracking.produced > 0
                  ) {
                    allTransactions.push({
                      warehouseId: tracking.toWarehouse,
                      transactionType: "In",
                      quantityChange: `(+${tracking.produced}) ${
                        tracking.toWarehouseQty || 0
                      }`,
                      timestamp: tracking.date,
                      project: project.projectName,
                      partName: allocation.partName,
                      process: allocation.processName,
                      machine: tracking.machineId || alloc.machineId,
                      operator: tracking.operator || alloc.operator,
                      rawQuantity: tracking.produced,
                      dailyStatus: tracking.dailyStatus,
                      partsCodeId: allocation.partsCodeId,
                      source: "dailyTracking",
                    });
                  }

                  // Create REJECTION transactions if rejected quantity exists
                  if (
                    tracking.rejectedWarehouse &&
                    tracking.rejectedWarehouse !== "N/A" &&
                    tracking.rejectedWarehouseQuantity > 0
                  ) {
                    // OUT transaction from fromWarehouse for rejected quantity
                    allTransactions.push({
                      warehouseId: tracking.fromWarehouse,
                      transactionType: "Out",
                      quantityChange: `(-${
                        tracking.rejectedWarehouseQuantity
                      }) ${tracking.fromWarehouseQty || 0}`,
                      timestamp: tracking.date,
                      project: project.projectName,
                      partName: allocation.partName,
                      process: allocation.processName,
                      machine: tracking.machineId || alloc.machineId,
                      operator: tracking.operator || alloc.operator,
                      rawQuantity: -tracking.rejectedWarehouseQuantity,
                      dailyStatus: "Rejected",
                      partsCodeId: allocation.partsCodeId,
                      source: "dailyTracking",
                      remarks:
                        tracking.remarks || "Part rejected during production",
                    });

                    // IN transaction to rejected warehouse
                    allTransactions.push({
                      warehouseId:
                        tracking.rejectedWarehouseId &&
                        tracking.rejectedWarehouse
                          ? `${tracking.rejectedWarehouseId} - ${tracking.rejectedWarehouse}`
                          : tracking.rejectedWarehouse || "N/A",
                      transactionType: "In",
                      quantityChange: `(+${tracking.rejectedWarehouseQuantity})`,
                      timestamp: tracking.date,
                      project: project.projectName,
                      partName: allocation.partName,
                      process: allocation.processName,
                      machine: tracking.machineId || alloc.machineId,
                      operator: tracking.operator || alloc.operator,
                      rawQuantity: tracking.rejectedWarehouseQuantity,
                      dailyStatus: "Rejected",
                      partsCodeId: allocation.partsCodeId,
                      source: "dailyTracking",
                      remarks:
                        tracking.remarks || "Part rejected during production",
                    });
                  }
                });
              }
            });
          }
        });
      }
    });

    return allTransactions;
  };

  // Transform store data into adjustment transactions from transaction history
  const transformToAdjustmentTransactions = (storeData) => {
    if (!storeData || !Array.isArray(storeData)) return [];

    const adjustmentTransactions = [];

    storeData.forEach((store) => {
      // Check if there's transaction history
      if (store.transactionHistory && Array.isArray(store.transactionHistory)) {
        store.transactionHistory.forEach((transaction) => {
          const adjustmentSign = transaction.adjustmentType === "+" ? "+" : "-";
          const adjustmentColor =
            transaction.adjustmentType === "+" ? "success" : "danger";

          adjustmentTransactions.push({
            warehouseId: store.categoryId,
            transactionType: "Adjustment",
            quantityChange: `${transaction.previousQuantity} → ${transaction.newQuantity} (${adjustmentSign}${transaction.adjustmentQty})`,
            timestamp: transaction.timestamp,
            project: "--",
            partName: "--",
            process: "--",
            machine: "--",
            operator: transaction.operator || "--",
            rawQuantity:
              transaction.adjustmentType === "+"
                ? transaction.adjustmentQty
                : -transaction.adjustmentQty,
            dailyStatus: "Adjustment",
            partsCodeId: "--",
            source: "adjustment",
            adjustmentType: transaction.adjustmentType,
            adjustmentColor: adjustmentColor,
            reason: transaction.reason || "Manual Adjustment",
            previousQuantity: transaction.previousQuantity,
            newQuantity: transaction.newQuantity,
          });
        });
      }
    });

    return adjustmentTransactions;
  };

  // Process the data from all-allocations API and store data
  const inventoryTransactions = data?.data
    ? transformToInventoryTransactions(data.data)
    : [];
  const adjustmentTransactions = storeData
    ? transformToAdjustmentTransactions(storeData)
    : [];

  // Combine both types of transactions and filter out invalid ones
  const allTransactions = [
    ...inventoryTransactions,
    ...adjustmentTransactions,
  ].filter(
    (transaction) =>
      transaction &&
      transaction.warehouseId &&
      transaction.warehouseId !== "N/A" &&
      transaction.warehouseId !== "" &&
      transaction.rawQuantity !== undefined &&
      transaction.rawQuantity !== null
  );

  // Sort by source priority (BLNK transfer first), then timestamp, then transaction type
  // const sortedTransactions = allTransactions.sort((a, b) => {
  //   // First sort by source priority (blankStoreTransfer first)
  //   const sourceOrder = {
  //     blankStoreTransfer: 0,
  //     dailyTracking: 1,
  //     adjustment: 2,
  //   };
  //   const aSourceOrder = sourceOrder[a.source] || 3;
  //   const bSourceOrder = sourceOrder[b.source] || 3;

  //   if (aSourceOrder !== bSourceOrder) {
  //     return aSourceOrder - bSourceOrder;
  //   }

  //   // Then sort by timestamp (newest first)
  //   const timeComparison = new Date(b.timestamp) - new Date(a.timestamp);
  //   if (timeComparison !== 0) {
  //     return timeComparison;
  //   }

  //   // Finally sort by transaction type (OUT first, then IN)
  //   const typeOrder = { Out: 0, In: 1, Adjustment: 2 };
  //   const aOrder = typeOrder[a.transactionType] || 3;
  //   const bOrder = typeOrder[b.transactionType] || 3;

  //   return aOrder - bOrder;
  // });

    // ✅ Sort all transactions by timestamp (latest first)
    const sortedTransactions = allTransactions.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA; // latest first
    });


  // Limit transactions to prevent too many rows (keep only recent ones)
  const limitedTransactions = sortedTransactions.slice(0, 100); // Limit to 100 most recent transactions

  // Calculate warehouse summary when a specific warehouse is selected
  const calculateWarehouseSummary = () => {
    if (warehouseFilter === "all") return null;

    const warehouseTransactions = limitedTransactions.filter(
      (item) => item.warehouseId === warehouseFilter
    );

    let totalQuantity = 0;
    let warehouseName = warehouseFilter;
    let currentStoreQuantity = 0;

    // Get current quantity from warehouseData if available
    if (warehouseData.has(warehouseFilter)) {
      const warehouseInfo = warehouseData.get(warehouseFilter);
      warehouseName = warehouseInfo.name;
      currentStoreQuantity = warehouseInfo.quantity || 0;
    }

    // Calculate total from transactions
    warehouseTransactions.forEach((transaction) => {
      totalQuantity += transaction.rawQuantity || 0;
    });

    return {
      warehouseId: warehouseFilter,
      warehouseName: warehouseName,
      currentStoreQuantity: currentStoreQuantity,
      calculatedQuantity: totalQuantity,
      finalQuantity: currentStoreQuantity + totalQuantity,
    };
  };

  const warehouseSummary = calculateWarehouseSummary();

  // Get unique project names for filter dropdown
  // const projectOptions = limitedTransactions
  //   ? [...new Set(limitedTransactions.map((item) => item.project))].filter(
  //       Boolean
  //     )
  //   : [];

  // Exclude projects with "--" or "N/A" (used by Adjustment type)
const projectOptions = limitedTransactions
  ? [...new Set(
      limitedTransactions
        .map((item) => item.project)
        .filter((project) => project && project !== "--" && project !== "N/A")
    )]
  : [];


  // Get unique warehouse names for filter dropdown
  // Get unique warehouse names for filter dropdown
  const warehouseOptionsFromData = limitedTransactions
    ? Array.from(
        new Map(
          limitedTransactions
            .filter((item) => item.warehouseId && item.warehouseId !== "N/A")
            .map((item) => {
              // Normalize ID and name spacing
              const cleanId = item.warehouseId.trim();

              // If it contains " - ", extract the ID part before dash (e.g. "REJ - REJECTED" => "REJ")
              const idKey = cleanId.includes(" - ")
                ? cleanId.split(" - ")[0].trim()
                : cleanId;

              // Keep first unique entry for this ID
              return [idKey, cleanId];
            })
        ).values()
      ).sort()
    : [];

  // Get unique statuses for filter dropdown
  const statusOptions = limitedTransactions
    ? [...new Set(limitedTransactions.map((item) => item.dailyStatus))].filter(
        Boolean
      )
    : [];

  // Get unique transaction types for filter dropdown
  const transactionTypeOptions = limitedTransactions
    ? [
        ...new Set(limitedTransactions.map((item) => item.transactionType)),
      ].filter(Boolean)
    : [];

  // Filter data based on warehouse, status, project, and transaction type
  const filteredData = limitedTransactions.filter((item) => {
    // Warehouse filter logic
    const normalizeId = (value) => {
      if (!value) return "";
      // If it has " - ", take only the first part (e.g., "01 - General Warehouse" => "01")
      return value.split(" - ")[0].trim();
    };

    const warehouseMatch =
      warehouseFilter === "all" ||
      normalizeId(item.warehouseId) === normalizeId(warehouseFilter) ||
      (item.transactionType === "Adjustment" &&
        normalizeId(warehouseFilter) === normalizeId(item.warehouseId));

    // Status filter logic
    const statusMatch =
      statusFilter === "all" ||
      item.dailyStatus.toLowerCase() === statusFilter.toLowerCase();

    // Project filter logic
    const projectMatch =
      projectFilter === "all" || item.project === projectFilter;

    // Transaction type filter logic
    const transactionTypeMatch =
      transactionTypeFilter === "all" ||
      item.transactionType.toLowerCase() ===
        transactionTypeFilter.toLowerCase();

    return (
      warehouseMatch && statusMatch && projectMatch && transactionTypeMatch
    );
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Format date for display (25 Aug 2025 - 10:12 AM/PM)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en", { month: "short" });
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedHours = hours.toString().padStart(2, "0");

    return `${day} ${month} ${year} - ${formattedHours}:${minutes} ${ampm}`;
  };

  // Get badge color based on transaction type
  const getTransactionBadgeColor = (transactionType, adjustmentType) => {
    if (transactionType === "Adjustment") {
      return adjustmentType === "+" ? "success" : "danger";
    }

    switch (transactionType) {
      case "In":
        return "success";
      case "Out":
        return "warning";
      case "Adjustment":
        return "info";
      default:
        return "secondary";
    }
  };

  // Get quantity change color based on transaction type
  const getQuantityChangeColor = (transactionType, adjustmentType) => {
    if (transactionType === "Adjustment") {
      return adjustmentType === "+"
        ? "text-success fw-bold"
        : "text-danger fw-bold";
    }

    switch (transactionType) {
      case "In":
        return "text-success fw-bold";
      case "Out":
        return "text-danger fw-bold";
      default:
        return "text-muted";
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setWarehouseFilter("all");
    setProjectFilter("all");
    setStatusFilter("all");
    setTransactionTypeFilter("all");
    setCurrentPage(1);
  };

  console.log("Current inventory transactions:", currentItems);
  console.log("Total transactions found:", limitedTransactions.length);
  console.log(
    "BLNK transfer transactions:",
    limitedTransactions.filter((t) => t.source === "blankStoreTransfer")
  );

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner color="primary" className="mb-3" />
        <p className="text-muted">Loading inventory data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert color="danger" className="m-3">
        <h5 className="alert-heading">Error Loading Data</h5>
        {error}
      </Alert>
    );
  }

  if (!data || !data.data || sortedTransactions.length === 0) {
    return (
      <Alert color="info" className="m-3">
        <h5 className="alert-heading">No Data Available</h5>
        No warehouse allocation data available.
      </Alert>
    );
  }

  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="bg-white border-bottom-0 py-3">
        <Row className="align-items-center">
          <Col md={4}>
            <h4 className="mb-0 text-primary">
              <i className="ri-archive-line me-2"></i>
              Inventory Transactions
            </h4>
            <small className="text-muted">
              Track all warehouse movements and adjustments
            </small>
          </Col>
          <Col md={8}>
            <Row className="g-2">
              <Col md={4}>
                <Input
                  type="select"
                  value={warehouseFilter}
                  onChange={(e) => {
                    setWarehouseFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="form-control-sm border"
                >
                  <option value="all">All Warehouses</option>
                  {/* {warehouseOptionsFromData.map((wh) => (
                    <option key={wh} value={wh}>
                      {wh}
                    </option>
                  ))} */}

                  {warehouseOptionsFromData.map((wh) => {
                    const storeInfo = warehouseData.get(wh);

                    // Case 1: If value already contains " - " (like "CMILL - CNC MILLING"), keep as-is
                    if (wh.includes(" - ")) {
                      return (
                        <option key={wh} value={wh}>
                          {wh}
                        </option>
                      );
                    }

                    // Case 2: If found in storeVariable, show "ID - Name"
                    if (storeInfo && storeInfo.name) {
                      return (
                        <option key={wh} value={wh}>
                          {`${wh} - ${storeInfo.name}`}
                        </option>
                      );
                    }

                    // Case 3: Fallback (just ID)
                    return (
                      <option key={wh} value={wh}>
                        {wh}
                      </option>
                    );
                  })}

                  {/* {warehouseOptionsFromData.map((wh) => {
                    const shortName = wh.includes(" - ") ? wh.split(" - ")[0] : wh;
                    return (
                      <option key={wh} value={wh}>
                        {shortName}
                      </option>
                    );
                  })} */}
                </Input>
              </Col>
              <Col md={4}>
                <Input
                  type="select"
                  value={projectFilter}
                  onChange={(e) => {
                    setProjectFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="form-control-sm border"
                >
                  <option value="all">All Projects</option>
                  {projectOptions.map((project) => (
                    <option key={project} value={project}>
                      {project}
                    </option>
                  ))}
                </Input>
              </Col>
              
              <Col md={4}>
                <Input
                  type="select"
                  value={transactionTypeFilter}
                  onChange={(e) => {
                    setTransactionTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="form-control-sm border"
                >
                  <option value="all">All Transaction Types</option>
                  {transactionTypeOptions.map((type) => (
                    <option key={type} value={type.toLowerCase()}>
                      {type}
                    </option>
                  ))}
                </Input>
              </Col>
              {/* <Col md={2}>
                <Button
                  color="outline-secondary"
                  size="sm"
                  onClick={resetFilters}
                  className="w-100 border"
                >
                  <i className="ri-refresh-line me-1"></i>
                  Reset
                </Button>
              </Col> */}
            </Row>
          </Col>
        </Row>
      </CardHeader>

      <CardBody className="p-0">
        {/* Warehouse Summary Display */}
        {warehouseSummary && (
          <div className="bg-light border-bottom p-3">
            <Row className="align-items-center">
              <Col md={12}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="mb-1 text-primary">
                      <i className="ri-warehouse-line me-2"></i>
                      Warehouse Summary: {warehouseSummary.warehouseName}
                    </h6>
                    <small className="text-muted">
                      Warehouse ID: {warehouseSummary.warehouseId}
                    </small>
                  </div>
                  {/* <div className="text-end">
                    <div className="d-flex align-items-center gap-3">
                      <div className="text-center">
                        <small className="text-muted d-block">
                          Store Variable
                        </small>
                        <span className="fw-bold text-info">
                          {warehouseSummary.currentStoreQuantity}
                        </span>
                      </div> */}
                  {/* <div className="text-center">
                        <small className="text-muted d-block">
                          Transaction Net
                        </small>
                        <span
                          className={`fw-bold ${
                            warehouseSummary.calculatedQuantity >= 0
                              ? "text-success"
                              : "text-danger"
                          }`}
                        >
                          {warehouseSummary.calculatedQuantity >= 0 ? "+" : ""}
                          {warehouseSummary.calculatedQuantity}
                        </span>
                      </div> */}
                  {/* <div className="text-center">
                        <small className="text-muted d-block">Final Quantity</small>
                        <span className="fw-bold text-primary fs-5">
                          {warehouseSummary.finalQuantity}
                        </span>
                      </div> */}
                  {/* </div> */}
                  {/* </div> */}

                  {warehouseFilter !== "all" && filteredData.length > 0 && (
                    <tr className="bg-light fw-bold text-end">
                      <td colSpan="9" className="pe-4">
                        Total Quantity:{" "}
                        <span className="text-primary">
                          {filteredData
                            .reduce(
                              (sum, item) => sum + (item.rawQuantity || 0),
                              0
                            )
                            .toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  )}
                </div>
              </Col>
            </Row>
          </div>
        )}

        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Warehouse ID</th>
                <th>Transaction Type</th>
                <th>Quantity Change</th>
                <th>Timestamp</th>
                <th>Project</th>
                <th>Part Name</th>
                <th>Process</th>
                <th>Machine</th>
                <th className="pe-4">Operator</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => (
                <tr key={index} className="align-middle">
                  <td className="ps-4">
                    <span className="fw-semibold text-dark">
                      {item.transactionType === "Adjustment" &&
                      warehouseData.has(item.warehouseId)
                        ? `${item.warehouseId} - ${
                            warehouseData.get(item.warehouseId).name
                          }`
                        : item.warehouseId || "N/A"}
                    </span>
                  </td>

                  <td>
                    <Badge
                      color={getTransactionBadgeColor(
                        item.transactionType,
                        item.adjustmentType
                      )}
                      className="px-2 py-1"
                    >
                      <i
                        className={
                          item.transactionType === "In"
                            ? "ri-arrow-down-line me-1"
                            : item.transactionType === "Out"
                            ? "ri-arrow-up-line me-1"
                            : item.adjustmentType === "+"
                            ? "ri-add-line me-1"
                            : "ri-subtract-line me-1"
                        }
                      ></i>
                      {item.transactionType}
                    </Badge>
                  </td>
                  <td>
                    <span
                      className={getQuantityChangeColor(
                        item.transactionType,
                        item.adjustmentType
                      )}
                    >
                      {item.transactionType === "Adjustment"
                        ? `${item.adjustmentType || ""}${Math.abs(
                            item.rawQuantity || 0
                          )}`
                        : item.quantityChange.match(/[+-]?\d+/)?.[0] ||
                          item.quantityChange}
                    </span>
                  </td>

                  <td>
                    <small className="text-muted">
                      {formatDate(item.timestamp)}
                    </small>
                  </td>
                  <td>
                    <span
                      className={
                        item.project === "N/A"
                          ? "text-muted fst-italic"
                          : "text-dark"
                      }
                    >
                      {item.project || "--"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        item.partName === "N/A"
                          ? "text-muted fst-italic"
                          : "text-dark"
                      }
                    >
                      {item.partName || "--"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        item.process === "N/A"
                          ? "text-muted fst-italic"
                          : "text-dark"
                      }
                    >
                      {item.process || "--"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        item.machine === "N/A"
                          ? "text-muted fst-italic"
                          : "text-dark"
                      }
                    >
                      {item.machine || "--"}
                    </span>
                  </td>
                  <td className="pe-4">
                    <span
                      className={
                        item.operator === "N/A"
                          ? "text-muted fst-italic"
                          : "text-dark"
                      }
                    >
                      {item.operator || "--"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-5">
            <i className="ri-search-line display-4 text-muted mb-3"></i>
            <h5 className="text-muted">No transactions found</h5>
            <p className="text-muted">
              Try adjusting your filters to see more results
            </p>
          </div>
        )}

        {filteredData.length > itemsPerPage && (
          <div className="d-flex justify-content-between align-items-center px-4 py-3 border-top">
            <div className="text-muted">
              Showing <strong>{indexOfFirstItem + 1}</strong> to{" "}
              <strong>{Math.min(indexOfLastItem, filteredData.length)}</strong>{" "}
              of <strong>{filteredData.length}</strong> entries
            </div>

            <Pagination className="mb-0">
              <PaginationItem disabled={currentPage === 1}>
                <PaginationLink
                  previous
                  onClick={() => paginate(currentPage - 1)}
                >
                  <i className="ri-arrow-left-line"></i>
                </PaginationLink>
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
                  <PaginationItem active={number === currentPage} key={number}>
                    <PaginationLink onClick={() => paginate(number)}>
                      {number}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem disabled={currentPage === totalPages}>
                <PaginationLink next onClick={() => paginate(currentPage + 1)}>
                  <i className="ri-arrow-right-line"></i>
                </PaginationLink>
              </PaginationItem>
            </Pagination>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default WareHouseAllocation;
