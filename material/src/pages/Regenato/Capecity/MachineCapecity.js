import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Modal,
  ModalHeader,
  ModalBody,
  Badge,
  Button,
  Progress,
  ModalFooter,
  Table,
  Spinner,
  Alert,
} from "reactstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parseISO, isWithinInterval, startOfDay, endOfDay, isSameDay } from "date-fns";

const MachineCapacity = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [filteredAllocations, setFilteredAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [totalMachines, setTotalMachines] = useState(0);
  const [occupiedMachines, setOccupiedMachines] = useState(0);
  
  // Set default dates to today
  const today = new Date();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  
  const [categoryStats, setCategoryStats] = useState({});
  const [machineAllocations, setMachineAllocations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (allocations.length > 0 && categories.length > 0) {
      filterAllocationsByDate();
      calculateCategoryStats();
    }
  }, [allocations, categories, startDate, endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [manufacturingRes, allocationsRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_BASE_URL}/api/manufacturing`).then(res => {
          if (!res.ok) throw new Error(`Manufacturing API failed: ${res.status}`);
          return res.json();
        }),
        fetch(`${process.env.REACT_APP_BASE_URL}/api/defpartproject/all-allocations`).then(res => {
          if (!res.ok) throw new Error(`Allocations API failed: ${res.status}`);
          return res.json();
        }),
      ]);

      console.log("Manufacturing Data:", manufacturingRes);
      console.log("Allocations Data:", allocationsRes.data);

      // Process allocations data to flatten the structure
      const processedAllocations = Array.isArray(allocationsRes.data) 
        ? allocationsRes.data.map((project) => ({
            ...project,
            allocations: project.allocations?.map((alloc) => ({
              ...alloc,
              allocations: alloc.allocations?.map((processAlloc) => ({
                ...processAlloc,
                allocations: processAlloc.allocations?.map((machineAlloc) => ({
                  ...machineAlloc,
                  projectName: project.projectName,
                  partName: alloc.partName,
                  processName: processAlloc.processName,
                })) || [],
              })) || [],
            })) || [],
          }))
        : [];

      console.log("Processed Allocations:", processedAllocations);

      // Calculate total machines
      const totalMachineCount = manufacturingRes.reduce((total, category) => 
        total + (category.subCategories?.length || 0), 0
      );

      setCategories(Array.isArray(manufacturingRes) ? manufacturingRes : []);
      setAllocations(processedAllocations);
      setTotalMachines(totalMachineCount);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(`Failed to load data: ${error.message}`);
      setLoading(false);
    }
  };

  // Check if machine is occupied on selected date range
  const isMachineOccupied = useCallback((machineId) => {
    if (!machineId || filteredAllocations.length === 0) return false;

    console.log(`Checking occupancy for machine: ${machineId}`);

    for (const project of filteredAllocations) {
      for (const alloc of project.allocations || []) {
        for (const processAlloc of alloc.allocations || []) {
          for (const machineAlloc of processAlloc.allocations || []) {
            if (machineAlloc.machineId === machineId) {
              console.log(`Machine ${machineId} is OCCUPIED with allocation:`, machineAlloc);
              return true;
            }
          }
        }
      }
    }
    
    console.log(`Machine ${machineId} is AVAILABLE`);
    return false;
  }, [filteredAllocations]);

  // Get detailed allocations for a specific machine
  const getMachineAllocations = useCallback((machineId) => {
    if (!machineId) return [];
    
    const allAllocations = [];

    console.log(`Getting allocations for machine: ${machineId}`);

    filteredAllocations.forEach((project) => {
      project.allocations?.forEach((alloc) => {
        alloc.allocations?.forEach((processAlloc) => {
          processAlloc.allocations?.forEach((machineAlloc) => {
            if (machineAlloc.machineId === machineId) {
              
              // Check if allocation falls within selected date range
              try {
                const allocStart = parseISO(machineAlloc.startDate);
                const allocEnd = parseISO(machineAlloc.endDate);
                const selectedStart = startOfDay(startDate);
                const selectedEnd = endOfDay(endDate);

                const isOverlapping = 
                  (allocStart <= selectedEnd && allocEnd >= selectedStart);

                console.log(`Machine allocation date check:`, {
                  machine: machineId,
                  allocStart: format(allocStart, "dd-MM-yyyy"),
                  allocEnd: format(allocEnd, "dd-MM-yyyy"),
                  selectedStart: format(selectedStart, "dd-MM-yyyy"),
                  selectedEnd: format(selectedEnd, "dd-MM-yyyy"),
                  isOverlapping
                });

                if (isOverlapping) {
                  allAllocations.push({
                    ...machineAlloc,
                    projectName: project.projectName || 'Unknown Project',
                    partName: alloc.partName || 'Unknown Part',
                    processName: processAlloc.processName || 'Unknown Process',
                  });
                }
              } catch (error) {
                console.error('Error parsing machine allocation dates:', error);
              }
            }
          });
        });
      });
    });

    console.log(`Found ${allAllocations.length} allocations for machine ${machineId}:`, allAllocations);
    return allAllocations;
  }, [filteredAllocations, startDate, endDate]);

  const filterAllocationsByDate = useCallback(() => {
    if (!startDate || !endDate || allocations.length === 0) {
      setFilteredAllocations(allocations);
      return;
    }

    const selectedStart = startOfDay(startDate);
    const selectedEnd = endOfDay(endDate);

    console.log(`Filtering machine allocations from ${format(selectedStart, "dd-MM-yyyy")} to ${format(selectedEnd, "dd-MM-yyyy")}`);

    const filtered = allocations
      .map((project) => ({
        ...project,
        allocations: project.allocations
          ?.map((alloc) => ({
            ...alloc,
            allocations: alloc.allocations
              ?.map((processAlloc) => ({
                ...processAlloc,
                allocations: processAlloc.allocations?.filter((machineAlloc) => {
                  if (!machineAlloc.startDate || !machineAlloc.endDate) return false;

                  try {
                    const allocStart = parseISO(machineAlloc.startDate);
                    const allocEnd = parseISO(machineAlloc.endDate);

                    const isOverlapping = 
                      (allocStart <= selectedEnd && allocEnd >= selectedStart);

                    console.log(`Machine date filter check:`, {
                      project: project.projectName,
                      machine: machineAlloc.machineId,
                      allocStart: format(allocStart, "dd-MM-yyyy"),
                      allocEnd: format(allocEnd, "dd-MM-yyyy"),
                      isOverlapping
                    });

                    return isOverlapping;
                  } catch (error) {
                    console.error('Error parsing machine allocation dates:', error);
                    return false;
                  }
                }) || [],
              }))
              ?.filter((processAlloc) => processAlloc.allocations.length > 0) || [],
          }))
          ?.filter((alloc) => alloc.allocations.length > 0) || [],
      }))
      ?.filter((project) => project.allocations.length > 0);

    console.log("Filtered machine allocations:", filtered);
    setFilteredAllocations(filtered);
  }, [allocations, startDate, endDate]);

  const calculateCategoryStats = useCallback(() => {
    const stats = {};
    
    // Initialize category stats
    categories.forEach((category) => {
      stats[category._id] = {
        total: category.subCategories?.length || 0,
        occupied: 0,
        name: category.name,
      };
    });

    console.log("Calculating machine category stats...");

    // Count occupied machines per category
    categories.forEach((category) => {
      let occupiedCount = 0;
      
      category.subCategories?.forEach((machine) => {
        if (isMachineOccupied(machine.subcategoryId)) {
          occupiedCount++;
        }
      });
      
      stats[category._id].occupied = occupiedCount;
    });

    console.log("Machine category stats:", stats);
    setCategoryStats(stats);

    // Calculate overall occupied machines
    const occupiedCount = categories.reduce((total, category) => {
      return total + (category.subCategories?.filter(machine => 
        isMachineOccupied(machine.subcategoryId)
      ).length || 0);
    }, 0);
    
    console.log(`Total occupied machines: ${occupiedCount}`);
    setOccupiedMachines(occupiedCount);
  }, [categories, isMachineOccupied]);

  const toggleModal = (machine) => {
    if (machine) {
      const allAllocations = getMachineAllocations(machine.subcategoryId);
      setMachineAllocations(allAllocations);
      setSelectedMachine({ 
        ...machine, 
        allocations: allAllocations 
      });
    } else {
      setSelectedMachine(null);
      setMachineAllocations([]);
    }
    setModalOpen(!modalOpen);
  };

  const handleViewPlan = (allocationId) => {
    if (allocationId) {
      navigate(`/regenato-planPage/${allocationId}`);
    }
  };

  const handleDateChange = (date, isStartDate) => {
    if (isStartDate) {
      setStartDate(date);
      if (date > endDate) {
        setEndDate(date);
      }
    } else {
      setEndDate(date);
      if (date < startDate) {
        setStartDate(date);
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="text-center">
          <Spinner color="primary" size="lg" />
          <div className="mt-2">Loading Machine Capacity...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <Alert color="danger">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          <Button color="primary" onClick={fetchData}>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  const availableMachines = totalMachines - occupiedMachines;
  const availablePercentage = totalMachines > 0 ? (availableMachines / totalMachines) * 100 : 0;
  const occupiedPercentage = totalMachines > 0 ? (occupiedMachines / totalMachines) * 100 : 0;

  console.log("Final Machine Stats:", {
    totalMachines,
    occupiedMachines,
    availableMachines,
    availablePercentage,
    occupiedPercentage
  });

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Machine Capacity</h2>
        <Badge color="info" className="fs-6">
          Last Updated: {format(new Date(), "PPpp")}
        </Badge>
      </div>

      {/* Date Selection Card */}
      <Card className="shadow-sm mb-4">
        <CardBody>
          <h5 className="mb-3">Select Date Range</h5>
          <div className="d-flex flex-wrap gap-3 mb-3">
            <div className="flex-grow-1" style={{ minWidth: "200px" }}>
              <label className="form-label fw-bold">Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => handleDateChange(date, true)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="dd-MM-yyyy"
                className="form-control"
                isClearable
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
              />
            </div>
            <div className="flex-grow-1" style={{ minWidth: "200px" }}>
              <label className="form-label fw-bold">End Date</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => handleDateChange(date, false)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                dateFormat="dd-MM-yyyy"
                className="form-control"
                isClearable
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
              />
            </div>
          </div>

          <Alert color="info" className="mb-0">
            <strong>Selected Date Range:</strong>{" "}
            {format(startDate, "dd-MM-yyyy")} to {format(endDate, "dd-MM-yyyy")}
            {isSameDay(startDate, endDate) && " (Single Day)"}
          </Alert>
        </CardBody>
      </Card>

      {/* Overall Capacity Overview */}
      <Card className="shadow-sm mb-4">
        <CardBody>
          <h5 className="mb-3">Factory Capacity Overview</h5>
          <div className="row text-center mb-4">
            <div className="col-md-4">
              <div className="border rounded p-3 bg-light">
                <h3 className="text-primary mb-1">{totalMachines}</h3>
                <div className="text-muted">Total Machines</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="border rounded p-3 bg-light">
                <h3 className="text-success mb-1">{availableMachines}</h3>
                <div className="text-muted">Available Machines</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="border rounded p-3 bg-light">
                <h3 className="text-danger mb-1">{occupiedMachines}</h3>
                <div className="text-muted">Occupied Machines</div>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <Progress multi className="mb-2" style={{ height: "25px" }}>
              <Progress 
                bar 
                color="success" 
                value={availablePercentage}
                style={{ fontSize: "14px", fontWeight: "bold" }}
              >
                {availablePercentage.toFixed(1)}% Available
              </Progress>
              <Progress 
                bar 
                color="danger" 
                value={occupiedPercentage}
                style={{ fontSize: "14px", fontWeight: "bold" }}
              >
                {occupiedPercentage.toFixed(1)}% Occupied
              </Progress>
            </Progress>
          </div>
        </CardBody>
      </Card>

      {/* Category-wise Machine Breakdown */}
      {categories.map((category) => {
        const stats = categoryStats[category._id] || { total: 0, occupied: 0, name: category.name };
        const availableCategoryMachines = stats.total - stats.occupied;
        const categoryOccupiedPercentage = stats.total > 0 ? (stats.occupied / stats.total) * 100 : 0;
        const categoryAvailablePercentage = stats.total > 0 ? (availableCategoryMachines / stats.total) * 100 : 0;

        if (!category.subCategories || category.subCategories.length === 0) return null;

        return (
          <Card key={category._id} className="shadow-sm mb-4">
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 text-primary">{category.name}</h5>
                <div className="d-flex align-items-center gap-3">
                  <div className="text-center">
                    <Badge color="primary" className="fs-6">Total</Badge>
                    <div className="fw-bold fs-5">{stats.total}</div>
                  </div>
                  <div className="text-center">
                    <Badge color="success" className="fs-6">Available</Badge>
                    <div className="fw-bold fs-5">{availableCategoryMachines}</div>
                  </div>
                  <div className="text-center">
                    <Badge color="danger" className="fs-6">Occupied</Badge>
                    <div className="fw-bold fs-5">
                      {stats.occupied} ({categoryOccupiedPercentage.toFixed(1)}%)
                    </div>
                  </div>
                </div>
              </div>

              <Progress multi className="mb-3" style={{ height: "12px" }}>
                <Progress bar color="success" value={categoryAvailablePercentage} />
                <Progress bar color="danger" value={categoryOccupiedPercentage} />
              </Progress>

              <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-3">
                {category.subCategories.map((machine) => {
                  const isOccupied = isMachineOccupied(machine.subcategoryId);
                  const machineAllocs = getMachineAllocations(machine.subcategoryId);

                  return (
                    <Col key={machine.subcategoryId}>
                      <Card
                        className={`h-100 transition-all ${isOccupied ? 'border-danger' : 'border-success'} ${
                          isOccupied ? 'hover-shadow' : ''
                        }`}
                        style={{
                          background: isOccupied ? '#fff5f5' : '#f0fff4',
                          cursor: isOccupied ? 'pointer' : 'default',
                          transition: 'all 0.2s ease-in-out',
                        }}
                        onClick={() => isOccupied && toggleModal(machine)}
                        onMouseEnter={(e) => {
                          if (isOccupied) e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          if (isOccupied) e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <CardBody className="p-3 text-center">
                          <div className="fw-bold mb-1 text-truncate" title={machine.name}>
                            {machine.name}
                          </div>
                          <div className="small text-muted mb-2 text-truncate" title={machine.subcategoryId}>
                            ID: {machine.subcategoryId}
                          </div>
                          {isOccupied ? (
                            <>
                              <Badge color="danger" pill className="mb-2">
                                Occupied ({machineAllocs.length} tasks)
                              </Badge>
                              <div className="small text-muted">
                                Click for details
                              </div>
                            </>
                          ) : (
                            <Badge color="success" pill>
                              Available
                            </Badge>
                          )}
                          {machine.status && machine.status !== "available" && (
                            <div className="small mt-2">
                              <Badge 
                                color={
                                  machine.status === "maintenance" ? "warning" : 
                                  machine.status === "broken" ? "danger" : "secondary"
                                } 
                                pill
                              >
                                {machine.status}
                              </Badge>
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </CardBody>
          </Card>
        );
      })}

      {/* Machine Details Modal */}
      <Modal isOpen={modalOpen} toggle={toggleModal} size="xl" scrollable>
        <ModalHeader toggle={toggleModal} className="border-bottom-0">
          <div>
            <h4 className="mb-1">Machine Allocation Details</h4>
            <div className="text-muted">
              {selectedMachine?.name} - {selectedMachine?.subcategoryId}
            </div>
          </div>
        </ModalHeader>
        <ModalBody>
          {selectedMachine && (
            <>
              <div className="mb-4 p-3 bg-light rounded">
                <h6 className="border-bottom pb-2 mb-3">Machine Information</h6>
                <div className="row">
                  <div className="col-md-6">
                    <strong>Machine ID:</strong> {selectedMachine.subcategoryId}
                  </div>
                  <div className="col-md-6">
                    <strong>Machine Name:</strong> {selectedMachine.name}
                  </div>
                  <div className="col-md-6 mt-2">
                    <strong>Warehouse:</strong> {selectedMachine.wareHouse || 'N/A'}
                  </div>
                  <div className="col-md-6 mt-2">
                    <strong>Current Status:</strong>{" "}
                    <Badge color={machineAllocations.length > 0 ? "danger" : "success"} pill>
                      {machineAllocations.length > 0 ? "Occupied" : "Available"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h6 className="border-bottom pb-2 mb-3">
                  Allocation Details ({machineAllocations.length} tasks)
                </h6>
                {machineAllocations.length > 0 ? (
                  <div className="table-responsive">
                    <Table bordered hover striped>
                      <thead className="table-dark">
                        <tr>
                          <th>Production Order</th>
                          <th>Part Name</th>
                          <th>Process</th>
                          <th>Operator</th>
                          <th>Start Date</th>
                          <th>End Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {machineAllocations.map((allocation, index) => (
                          <tr key={index}>
                            <td className="fw-bold">{allocation.projectName}</td>
                            <td>{allocation.partName}</td>
                            <td>
                              <Badge color="info" className="text-truncate" style={{ maxWidth: "120px" }}>
                                {allocation.processName}
                              </Badge>
                            </td>
                            <td>
                              <Badge color="primary">{allocation.operator || 'N/A'}</Badge>
                            </td>
                            <td>
                              {format(parseISO(allocation.startDate), "dd-MM-yyyy")}
                            </td>
                            <td>
                              {format(parseISO(allocation.endDate), "dd-MM-yyyy")}
                            </td>
                            <td>
                              <Button
                                color="primary"
                                size="sm"
                                onClick={() => handleViewPlan(allocation._id)}
                                disabled={!allocation._id}
                              >
                                View Plan
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <Alert color="info" className="text-center">
                    No allocations found for this machine in the selected date range.
                  </Alert>
                )}
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter className="border-top-0">
          <Button color="secondary" onClick={toggleModal}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Empty State */}
      {categories.length === 0 && !loading && (
        <Card className="shadow-sm">
          <CardBody className="text-center py-5">
            <h5 className="text-muted">No Machine Data Available</h5>
            <p className="text-muted mb-3">
              There are no machines or categories configured in the system.
            </p>
            <Button color="primary" onClick={fetchData}>
              Refresh Data
            </Button>
          </CardBody>
        </Card>
      )}
    </Container>
  );
};

export default MachineCapacity;