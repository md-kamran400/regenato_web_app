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

  const warehouseOptions = ["WH-F1", "WH-F2", "WH-F3", "WH-F4", "WH-F5"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/daily-tracking`
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

  // Get unique project names for filter dropdown
  const projectOptions = data?.dailyTracking
    ? [...new Set(data.dailyTracking.map(item => item.projectName))].filter(Boolean)
    : [];

  // Filter data based on warehouse, status, and project
  const filteredData = data?.dailyTracking?.filter(item => {
    // Get warehouse values (fall back to WH-F1/WH-F2 if not specified)
    const fromWH = item.fromWarehouse || "WH-F1";
    const toWH = item.toWarehouse || "WH-F2";
    
    // Warehouse filter logic - match either from or to warehouse
    const warehouseMatch = 
      warehouseFilter === "all" || 
      fromWH === warehouseFilter || 
      toWH === warehouseFilter;
    
    // Status filter logic
    const statusMatch = 
      statusFilter === "all" || 
      item.dailyStatus.toLowerCase() === statusFilter.toLowerCase();
    
    // Project filter logic
    const projectMatch = 
      projectFilter === "all" || 
      item.projectName === projectFilter;
    
    return warehouseMatch && statusMatch && projectMatch;
  }) || [];

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

  if (!data || !data.dailyTracking || data.dailyTracking.length === 0) {
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
              <Col md={4}>
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
                  {warehouseOptions.map(wh => (
                    <option key={wh} value={wh}>{wh}</option>
                  ))}
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
                  className="form-control-sm"
                >
                  <option value="all">All Projects</option>
                  {projectOptions.map(project => (
                    <option key={project} value={project}>{project}</option>
                  ))}
                </Input>
              </Col>
              <Col md={4}>
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
                  <option value="ahead">Ahead</option>
                  <option value="behind">Behind</option>
                  <option value="on track">On Track</option>
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
              <tr>
                <th>Project</th>
                <th>Part Name</th>
                <th>Process</th>
                <th>Operator</th>
                <th>Planned</th>
                <th>Produced</th>
                <th>From WH</th>
                <th>To WH</th>
                <th>Status</th>
                <th>Total Qty</th>
                <th>Remaining</th>
                <th>Machine</th>
                <th>Shift</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => {
                // Get warehouse values with fallbacks
                const fromWH = item.fromWarehouse || "WH-F1";
                const toWH = item.toWarehouse || "WH-F2";
                
                return (
                  <tr key={item._id || index}>
                    <td className="text-nowrap">{item.projectName}</td>
                    <td className="text-nowrap">{item.partName}</td>
                    <td className="text-nowrap">
                      {item.processName} ({item.processId})
                    </td>
                    <td>{item.operator}</td>
                    <td>{item.planned}</td>
                    <td>{item.produced}</td>
                    <td>{fromWH}</td>
                    <td>{toWH}</td>
                    <td>
                      <Badge color={getStatusBadgeColor(item.dailyStatus)} pill>
                        {item.dailyStatus}
                      </Badge>
                    </td>
                    <td>{item.wareHouseTotalQty}</td>
                    <td>{item.wareHouseremainingQty}</td>
                    <td>{item.machineId}</td>
                    <td>{item.shift}</td>
                  </tr>
                );
              })}
            </tbody>
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
  switch (status.toLowerCase()) {
    case "ahead":
      return "success";
    case "behind":
      return "danger";
    case "on track":
      return "warning";
    default:
      return "secondary";
  }
};

export default WareHouseAllocation;