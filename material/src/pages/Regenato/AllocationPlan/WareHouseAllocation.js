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
  Badge
} from "reactstrap";

const WareHouseAllocation = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [warehouseData, setWarehouseData] = useState(new Map());

  const warehouseOptions = ["WH-F1", "WH-F2", "WH-F3", "WH-F4", "WH-F5"];

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
          warehouses.forEach(warehouse => {
            if (warehouse.categoryId && warehouse.Name && warehouse.Name.length > 0) {
              warehouseMap.set(warehouse.categoryId, {
                name: warehouse.Name[0],
                location: warehouse.location && warehouse.location.length > 0 ? warehouse.location[0] : 'N/A',
                quantity: warehouse.quantity && warehouse.quantity.length > 0 ? warehouse.quantity[0] : 0
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

  // Extract daily tracking data from allocations structure
  const extractDailyTrackingData = (allocationsData) => {
    if (!allocationsData || !Array.isArray(allocationsData)) return [];
    
    const allDailyTracking = [];
    
    allocationsData.forEach(project => {
      if (project.allocations && Array.isArray(project.allocations)) {
        project.allocations.forEach(allocation => {
          if (allocation.allocations && Array.isArray(allocation.allocations)) {
            allocation.allocations.forEach(alloc => {
              if (alloc.dailyTracking && Array.isArray(alloc.dailyTracking)) {
                alloc.dailyTracking.forEach(tracking => {
                  allDailyTracking.push({
                    ...tracking,
                    projectName: project.projectName,
                    partName: allocation.partName,
                    processName: allocation.processName,
                    processId: allocation.processId,
                    partsCodeId: allocation.partsCodeId,
                    machineId: alloc.machineId,
                    shift: alloc.shift,
                    operator: alloc.operator,
                    planned: alloc.dailyPlannedQty || 0,
                    // Map warehouse data
                    fromWarehouse: tracking.fromWarehouse || alloc.wareHouse,
                    fromWarehouseId: alloc.warehouseId,
                    fromWarehouseQty: tracking.fromWarehouseQty || alloc.fromWarehouseQuantity || 0,
                    fromWarehouseRemainingQty: tracking.fromWarehouseRemainingQty || 0,
                    toWarehouse: tracking.toWarehouse || 'N/A',
                    toWarehouseQty: tracking.toWarehouseQty || 0,
                    toWarehouseRemainingQty: tracking.toWarehouseRemainingQty || 0,
                    remaining: tracking.remaining || 0,
                    wareHouseTotalQty: tracking.wareHouseTotalQty || 0,
                    wareHouseremainingQty: tracking.wareHouseremainingQty || 0
                  });
                });
              }
            });
          }
        });
      }
    });
    
    return allDailyTracking;
  };

  // Process the data from all-allocations API
  const dailyTrackingData = data?.data ? extractDailyTrackingData(data.data) : [];

  // Get unique project names for filter dropdown
  const projectOptions = dailyTrackingData
    ? [...new Set(dailyTrackingData.map(item => item.projectName))].filter(Boolean)
    : [];

  // Get unique warehouse names for filter dropdown
  const warehouseOptionsFromData = dailyTrackingData
    ? [...new Set(dailyTrackingData.flatMap(item => [
        item.fromWarehouse, 
        item.toWarehouse
      ]).filter(Boolean))].sort()
    : [];

  // Get unique statuses for filter dropdown
  const statusOptions = dailyTrackingData
    ? [...new Set(dailyTrackingData.map(item => item.dailyStatus))].filter(Boolean)
    : [];

  // Helper function to get warehouse name from categoryId
  const getWarehouseName = (categoryId) => {
    if (!categoryId) return 'N/A';
    const warehouse = warehouseData.get(categoryId);
    return warehouse ? warehouse.name : categoryId;
  };

  // Helper function to get warehouse quantity from categoryId
  const getWarehouseQuantity = (categoryId) => {
    if (!categoryId) return 0;
    const warehouse = warehouseData.get(categoryId);
    return warehouse ? warehouse.quantity : 0;
  };

  // Process and enrich the data
  const processedData = dailyTrackingData?.map(item => {
    // Prefer explicitly posted names/ids; fall back to lookup by id
    const fromWarehouseId = item.fromWarehouseId || item.fromWarehouse; // supports older payloads
    const toWarehouseId = item.toWarehouseId || item.toWarehouse;

    const fromWHName = item.fromWarehouse || getWarehouseName(fromWarehouseId);
    const toWHName = item.toWarehouse || getWarehouseName(toWarehouseId);

    const fromWHQuantity =
      typeof item.fromWarehouseQty === 'number'
        ? item.fromWarehouseQty
        : getWarehouseQuantity(fromWarehouseId);
    const toWHQuantity =
      typeof item.toWarehouseQty === 'number'
        ? item.toWarehouseQty
        : getWarehouseQuantity(toWarehouseId);

    const fromWHRemaining =
      typeof item.fromWarehouseRemainingQty === 'number'
        ? item.fromWarehouseRemainingQty
        : Math.max(0, (fromWHQuantity || 0) - (item.produced || 0));
    const toWHRemaining =
      typeof item.toWarehouseRemainingQty === 'number'
        ? item.toWarehouseRemainingQty
        : (toWHQuantity || 0) + (item.produced || 0);

    return {
      ...item,
      fromWarehouseId,
      toWarehouseId,
      fromWarehouseName: fromWHName,
      toWarehouseName: toWHName,
      fromWarehouseQuantity: fromWHQuantity,
      toWarehouseQuantity: toWHQuantity,
      fromWarehouseRemainingQty: fromWHRemaining,
      toWarehouseRemainingQty: toWHRemaining,
      remainingQuantity: Math.max(0, (item.wareHouseTotalQty || 0) - (item.produced || 0))
    };
  }) || [];

  // Filter data based on warehouse, status, and project
  const filteredData = processedData.filter(item => {
    // Warehouse filter logic - match either from or to warehouse
    const warehouseMatch = 
      warehouseFilter === "all" || 
      item.fromWarehouseName === warehouseFilter || 
      item.toWarehouseName === warehouseFilter;
    
    // Status filter logic
    const statusMatch = 
      statusFilter === "all" || 
      item.dailyStatus.toLowerCase() === statusFilter.toLowerCase();
    
    // Project filter logic
    const projectMatch = 
      projectFilter === "all" || 
      item.projectName === projectFilter;
    
    return warehouseMatch && statusMatch && projectMatch;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  console.log('Current items from all-allocations API:', currentItems)
  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner color="primary" />
        <p>Loading warehouse data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert color="danger" className="m-3">
        Error loading data: {error}
      </Alert>
    );
  }

  if (!data || !data.data || dailyTrackingData.length === 0) {
    return (
      <Alert color="info" className="m-3">
        No warehouse allocation data available.
      </Alert>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-white border-bottom-0">
        <Row className="align-items-center">
          <Col md={4}>
            <h4 className="mb-0">Inventory Plan</h4>
          </Col>
          <Col md={8}>
            <Row>
              <Col md={4} className="g-2">
                <Input
                  type="select"
                  value={warehouseFilter}
                  onChange={(e) => {
                    setWarehouseFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="form-control-sm"
                >
                  <option value="all">All Warehouses</option>
                  {warehouseOptionsFromData.map(wh => (
                    <option key={wh} value={wh}>{wh}</option>
                  ))}
                </Input>
              </Col>
              <Col md={4} className="g-2">
                <Input
                  type="select"
                  value={projectFilter}
                  onChange={(e) => {
                    setProjectFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="form-control-sm"
                >
                  <option value="all">All Projects</option>
                  {projectOptions.map(project => (
                    <option key={project} value={project}>{project}</option>
                  ))}
                </Input>
              </Col>
              <Col md={4} className="g-2">
                <Input
                  type="select"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="form-control-sm"
                >
                  <option value="all">All Statuses</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status.toLowerCase()}>
                      {status}
                    </option>
                  ))}
                </Input>
              </Col>
            </Row>
          </Col>
        </Row>
      </CardHeader>
      <CardBody>
        <div className="table-responsive">
          <Table striped hover className="mb-0">
            <thead>
              {/* <tr>
                <th>Project</th>
                <th>Part Name</th>
                <th>Process</th>
                <th>Operator</th>
                <th>Planned</th>
                <th>Produced</th>
                <th>From WH</th>
                <th>From WH Qty</th>
                <th>From WH Remaining Qty</th>
                <th>To WH</th>
                <th>To WH Qty</th>
                <th>To WH Remaining Qty</th>
                <th>Status</th>
                <th>Remaining</th>
                <th>Machine</th>
                <th>Shift</th>
                <th>Date</th>
              </tr> */}

              <tr>
                <th>Warehouse ID</th>
                <th>Transaction Type</th>
                <th>Quantity Change</th>
                <th>Timestamp</th>
                <th>Project</th>
                <th>Part Name</th>
                <th>Process</th>
                <th>Machine</th>
                <th>Operator</th>
               
              </tr>
            </thead>
            {/* <tbody>
              {currentItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.projectName || 'N/A'}</td>
                  <td>{item.partName || 'N/A'}</td>
                  <td>{item.processName || 'N/A'}</td>
                  <td>{item.operator || 'N/A'}</td>
                  <td>{item.planned || 0}</td>
                  <td>{item.produced || 0}</td>
                  <td>{(item.fromWarehouse ?? item.fromWarehouseName) || 'N/A'}</td>
                  <td>{(item.fromWarehouseQty ?? item.fromWarehouseQuantity) ?? 0}</td>
                  <td>{item.fromWarehouseRemainingQty ?? 0}</td>
                  <td>{(item.toWarehouse ?? item.toWarehouseName) || 'N/A'}</td>
                  <td>{(item.toWarehouseQty ?? item.toWarehouseQuantity) ?? 0}</td>
                  <td>{item.toWarehouseRemainingQty ?? 0}</td>
                  <td>
                    <Badge color={getStatusBadgeColor(item.dailyStatus)}>
                      {item.dailyStatus || 'Not Started'}
                    </Badge>
                  </td>
                  <td>{item.remaining || 0}</td> //it's already commented out
                  <td>{item.machineId || 'N/A'}</td>
                  <td>{item.shift || 'N/A'}</td>
                  <td>{item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody> */}
          </Table>
        </div>

        {filteredData.length > itemsPerPage && (
          <div className="d-flex justify-content-center mt-3">
            <Pagination>
              <PaginationItem disabled={currentPage === 1}>
                <PaginationLink previous onClick={() => paginate(currentPage - 1)} />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <PaginationItem active={number === currentPage} key={number}>
                  <PaginationLink onClick={() => paginate(number)}>
                    {number}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem disabled={currentPage === totalPages}>
                <PaginationLink next onClick={() => paginate(currentPage + 1)} />
              </PaginationItem>
            </Pagination>
          </div>
        )}

        <div className="text-muted text-center mt-2">
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
        </div>
      </CardBody>
    </Card>
  );
};

// Helper function to determine badge color based on status
const getStatusBadgeColor = (status) => {
  if (!status) return "secondary";
  
  switch (status.toLowerCase()) {
    case "ahead":
      return "success";
    case "behind":
    case "delayed":
      return "danger";
    case "on track":
      return "primary";
    case "not started":
      return "secondary";
    default:
      return "info";
  }
};

export default WareHouseAllocation;