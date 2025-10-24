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
  const transformToInventoryTransactions = (allocationsData) => {
    if (!allocationsData || !Array.isArray(allocationsData)) return [];

    const allTransactions = [];

    allocationsData.forEach((project) => {
      if (project.allocations && Array.isArray(project.allocations)) {
        project.allocations.forEach((allocation) => {
          if (allocation.allocations && Array.isArray(allocation.allocations)) {
            allocation.allocations.forEach((alloc) => {
              if (alloc.dailyTracking && Array.isArray(alloc.dailyTracking)) {
                alloc.dailyTracking.forEach((tracking) => {
                  // Create OUT transaction for fromWarehouse
                  if (
                    tracking.fromWarehouse &&
                    tracking.fromWarehouse !== "N/A"
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

                  // Create IN transaction for toWarehouse
                  if (tracking.toWarehouse && tracking.toWarehouse !== "N/A") {
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

  // Combine both types of transactions
  const allTransactions = [...inventoryTransactions, ...adjustmentTransactions];

  // Sort by timestamp (newest first)
  const sortedTransactions = allTransactions.sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  // Get unique project names for filter dropdown
  const projectOptions = sortedTransactions
    ? [...new Set(sortedTransactions.map((item) => item.project))].filter(
        Boolean
      )
    : [];

  // Get unique warehouse names for filter dropdown
  const warehouseOptionsFromData = sortedTransactions
    ? [...new Set(sortedTransactions.map((item) => item.warehouseId))]
        .filter(Boolean)
        .sort()
    : [];

  // Get unique statuses for filter dropdown
  const statusOptions = sortedTransactions
    ? [...new Set(sortedTransactions.map((item) => item.dailyStatus))].filter(
        Boolean
      )
    : [];

  // Get unique transaction types for filter dropdown
  const transactionTypeOptions = sortedTransactions
    ? [
        ...new Set(sortedTransactions.map((item) => item.transactionType)),
      ].filter(Boolean)
    : [];

  // Filter data based on warehouse, status, project, and transaction type
  const filteredData = sortedTransactions.filter((item) => {
    // Warehouse filter logic
    const warehouseMatch =
      warehouseFilter === "all" || item.warehouseId === warehouseFilter;

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
              <Col md={3}>
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
                  {warehouseOptionsFromData.map((wh) => (
                    <option key={wh} value={wh}>
                      {wh}
                    </option>
                  ))}
                </Input>
              </Col>
              <Col md={3}>
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
              <Col md={3}>
                <Input
                  type="select"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="form-control-sm border"
                >
                  <option value="all">All Statuses</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status.toLowerCase()}>
                      {status}
                    </option>
                  ))}
                </Input>
              </Col>
              <Col md={3}>
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
                      {item.warehouseId || "N/A"}
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
                      {item.quantityChange}
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
