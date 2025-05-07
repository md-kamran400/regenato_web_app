import React, { useEffect, useState } from "react";
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
} from "reactstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, isWithinInterval, parseISO } from "date-fns";

const OperatorCapacity = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [operators, setOperators] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [filteredAllocations, setFilteredAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [totalOperators, setTotalOperators] = useState(0);
  const [occupiedOperators, setOccupiedOperators] = useState(0);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [categoryStats, setCategoryStats] = useState({});
  const [operatorAllocations, setOperatorAllocations] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (allocations.length > 0 && operators.length > 0) {
      filterAllocationsByDate();
      calculateCategoryStats();
    }
  }, [allocations, operators, startDate, endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all required data
      const [manufacturingRes, allocationsRes, operatorsRes] =
        await Promise.all([
          fetch(`${process.env.REACT_APP_BASE_URL}/api/manufacturing`).then(
            (res) => res.json()
          ),
          fetch(
            `${process.env.REACT_APP_BASE_URL}/api/defpartproject/all-allocations`
          ).then((res) => res.json()),
          fetch(`${process.env.REACT_APP_BASE_URL}/api/userVariable`).then(
            (res) => res.json()
          ),
        ]);

      // Process allocations data
      const processedAllocations = allocationsRes.data.map((project) => {
        return {
          ...project,
          allocations: project.allocations.map((alloc) => {
            return {
              ...alloc,
              allocations: alloc.allocations.map((machineAlloc) => {
                return {
                  ...machineAlloc,
                  projectName: project.projectName,
                  partName: alloc.partName,
                  processName: alloc.processName,
                };
              }),
            };
          }),
        };
      });

      // Convert single operator response to array if needed
      const operatorsData = Array.isArray(operatorsRes)
        ? operatorsRes
        : [operatorsRes];

      setCategories(manufacturingRes);
      setOperators(operatorsData);
      setAllocations(processedAllocations);
      setFilteredAllocations(processedAllocations);
      setTotalOperators(operatorsData.length);

      // Calculate initial occupied operators
      const occupiedOperatorNames = new Set();
      processedAllocations.forEach((project) => {
        project.allocations.forEach((alloc) => {
          alloc.allocations.forEach((machineAlloc) => {
            if (machineAlloc.operator) {
              occupiedOperatorNames.add(machineAlloc.operator);
            }
          });
        });
      });
      setOccupiedOperators(occupiedOperatorNames.size);
      console.log(occupiedOperatorNames);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const calculateCategoryStats = () => {
    const stats = {};
    const operatorCategoryMap = {}; // Track which operators belong to which categories
    const operatorOccupiedMap = {}; // Track which operators are occupied in any category

    // Initialize category stats
    categories.forEach((category) => {
      stats[category._id] = {
        total: 0,
        occupied: 0,
        name: category.name,
      };
    });

    // First pass: count total operators per category and build operator-category map
    operators.forEach((operator) => {
      if (Array.isArray(operator.processName)) {
        operator.processName.forEach((procName) => {
          const category = categories.find((cat) => cat.name === procName);
          if (category) {
            stats[category._id].total += 1;
            if (!operatorCategoryMap[operator.name]) {
              operatorCategoryMap[operator.name] = new Set();
            }
            operatorCategoryMap[operator.name].add(category._id);
          }
        });
      }
    });

    // Second pass: identify occupied operators across all categories
    filteredAllocations.forEach((project) => {
      project.allocations.forEach((alloc) => {
        alloc.allocations.forEach((machineAlloc) => {
          if (!machineAlloc.operator) return;

          const [opId, opName] = machineAlloc.operator.split(" - ");
          const operatorName = opName || opId;
          operatorOccupiedMap[operatorName] = true;
        });
      });
    });

    // Third pass: count occupied operators per category
    Object.keys(operatorOccupiedMap).forEach((operatorName) => {
      if (operatorCategoryMap[operatorName]) {
        operatorCategoryMap[operatorName].forEach((categoryId) => {
          stats[categoryId].occupied += 1;
        });
      }
    });

    setCategoryStats(stats);
  };

  const filterAllocationsByDate = () => {
    // If dates are the same or not properly set, show all data
    if (!startDate || !endDate || startDate.getTime() === endDate.getTime()) {
      setFilteredAllocations(allocations);

      // Recalculate occupied operators
      const occupiedOperatorNames = new Set();
      allocations.forEach((project) => {
        project.allocations.forEach((alloc) => {
          alloc.allocations.forEach((machineAlloc) => {
            if (machineAlloc.operator) {
              occupiedOperatorNames.add(machineAlloc.operator);
            }
          });
        });
      });
      setOccupiedOperators(occupiedOperatorNames.size);
      return;
    }

    const filtered = allocations
      .map((project) => {
        return {
          ...project,
          allocations: project.allocations
            .map((alloc) => {
              return {
                ...alloc,
                allocations: alloc.allocations.filter((machineAlloc) => {
                  const allocStartDate = parseISO(machineAlloc.startDate);
                  const allocEndDate = parseISO(machineAlloc.endDate);

                  return (
                    (allocStartDate >= startDate &&
                      allocStartDate <= endDate) ||
                    (allocEndDate >= startDate && allocEndDate <= endDate) ||
                    (allocStartDate <= startDate && allocEndDate >= endDate)
                  );
                }),
              };
            })
            .filter((alloc) => alloc.allocations.length > 0),
        };
      })
      .filter((project) => project.allocations.length > 0);

    setFilteredAllocations(filtered);

    // Count occupied operators
    const occupiedOperatorNames = new Set();
    filtered.forEach((project) => {
      project.allocations.forEach((alloc) => {
        alloc.allocations.forEach((machineAlloc) => {
          if (machineAlloc.operator) {
            occupiedOperatorNames.add(machineAlloc.operator);
          }
        });
      });
    });

    setOccupiedOperators(occupiedOperatorNames.size);
  };

  const getOperatorAllocations = (operatorName, checkOccupied = false) => {
    const allAllocations = [];
    const sourceData = checkOccupied ? allocations : filteredAllocations;

    sourceData.forEach((project) => {
      project.allocations.forEach((alloc) => {
        alloc.allocations.forEach((machineAlloc) => {
          if (!machineAlloc.operator) return;

          const [opId, opName] = machineAlloc.operator.split(" - ");

          if (opId === operatorName || opName === operatorName) {
            const isWithinRange =
              !startDate ||
              !endDate ||
              startDate.getTime() === endDate.getTime() ||
              (parseISO(machineAlloc.startDate) <= endDate &&
                parseISO(machineAlloc.endDate) >= startDate);

            if (checkOccupied || isWithinRange) {
              allAllocations.push({
                ...machineAlloc,
                projectName: project.projectName,
                partName: alloc.partName,
                processName: alloc.processName,
              });
            }
          }
        });
      });
    });

    return allAllocations;
  };

  const toggleModal = (operator) => {
    if (operator) {
      const allAllocations = getOperatorAllocations(operator.name);
      setOperatorAllocations(allAllocations);
      setSelectedOperator({ ...operator, allocations: allAllocations });
    }
    setModalOpen(!modalOpen);
  };

  const handleViewPlan = (allocationId) => {
    navigate(`/regenato-planPage/${allocationId}`);
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const availableOperators = totalOperators - occupiedOperators;
  const availablePercentage = (
    (availableOperators / totalOperators) *
    100
  ).toFixed(1);
  const occupiedPercentage = (
    (occupiedOperators / totalOperators) *
    100
  ).toFixed(1);

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Operator Capacity</h2>
      </div>

      <Card className="shadow-sm mb-4">
        <CardBody>
          <div className="d-flex flex-wrap gap-3 mb-3 date-picker-container">
            <div>
              <label className="form-label">Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="dd-MM-yyyy"
                className="form-control"
              />
            </div>
            <div>
              <label className="form-label">End Date</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                dateFormat="dd-MM-yyyy"
                className="form-control"
              />
            </div>
          </div>

          <div className="alert alert-info mb-3">
            <strong>Selected Date Range:</strong>{" "}
            {format(startDate, "dd-MM-yyyy")} - {format(endDate, "dd-MM-yyyy")}
          </div>
        </CardBody>
      </Card>

      <Card className="shadow-sm mb-4">
        <CardBody>
          <h5 className="mb-3">Operator Capacity Overview</h5>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h2 className="mb-0">{totalOperators}</h2>
            <span className="text-muted">Total Operators</span>
          </div>

          <div className="mb-3">
            <Progress multi className="mb-2" style={{ height: "20px" }}>
              <Progress bar color="success" value={availablePercentage}>
                {availablePercentage}%
              </Progress>
              <Progress bar color="danger" value={occupiedPercentage}>
                {occupiedPercentage}%
              </Progress>
            </Progress>

            <div className="d-flex justify-content-between">
              <div>
                <Badge color="success" className="me-2">
                  Available
                </Badge>
                <span>
                  {availableOperators} ({availablePercentage}%)
                </span>
              </div>
              <div>
                <Badge color="danger" className="me-2">
                  Occupied
                </Badge>
                <span>
                  {occupiedOperators} ({occupiedPercentage}%)
                </span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {categories.map((category) => {
        const stats = categoryStats[category._id] || { total: 0, occupied: 0 };
        const availableCategoryOperators = stats.total - stats.occupied;
        const categoryOccupiedPercentage =
          stats.total > 0 ? (stats.occupied / stats.total) * 100 : 0;

        // Get operators for this process category
        const categoryOperators = operators.filter(
          (operator) =>
            operator.processName && operator.processName.includes(category.name)
        );

        if (categoryOperators.length === 0) return null;

        return (
          <Card key={category._id} className="shadow-sm mb-4">
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">{category.name}</h5>
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <Badge color="primary" className="me-2">
                      Total
                    </Badge>
                    <span>{stats.total}</span>
                  </div>
                  <div className="me-3">
                    <Badge color="success" className="me-2">
                      Available
                    </Badge>
                    <span>{availableCategoryOperators}</span>
                  </div>
                  <div>
                    <Badge color="danger" className="me-2">
                      Occupied
                    </Badge>
                    <span>
                      {stats.occupied} ({categoryOccupiedPercentage.toFixed(1)}
                      %)
                    </span>
                  </div>
                </div>
              </div>

              <Progress multi className="mb-3" style={{ height: "10px" }}>
                <Progress
                  bar
                  color="success"
                  value={
                    stats.total > 0
                      ? (availableCategoryOperators / stats.total) * 100
                      : 0
                  }
                />
                <Progress
                  bar
                  color="danger"
                  value={categoryOccupiedPercentage}
                />
              </Progress>

              <Row xs={2} sm={3} md={4} lg={6} className="g-3">
                {categoryOperators.map((operator) => {
                  const allocations = getOperatorAllocations(operator.name);
                  const isOccupied = allocations.length > 0;

                  return (
                    <Col key={operator._id}>
                      <Card
                        className={`h-100 ${
                          isOccupied ? "border-danger" : "border-success"
                        }`}
                        style={{
                          background: isOccupied ? "#FFEEEE" : "#EEFFEE",
                          cursor: isOccupied ? "pointer" : "default",
                        }}
                        onClick={() => isOccupied && toggleModal(operator)}
                      >
                        <CardBody className="p-2 text-center">
                          <div className="fw-bold mb-1">{operator.name}</div>
                          <div className="small text-muted mb-1">
                            {operator.categoryId}
                          </div>
                          {isOccupied ? (
                            <Badge color="danger" pill>
                              Occupied
                            </Badge>
                          ) : (
                            <Badge color="success" pill>
                              Available
                            </Badge>
                          )}
                          {operator.status === "On Leave" && (
                            <div className="small mt-1">
                              <Badge color="warning" pill>
                                On Leave
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

      {selectedOperator && (
        <Modal isOpen={modalOpen} toggle={toggleModal} size="xl">
          <ModalHeader toggle={toggleModal}>
            <h3>Operator Allocation Details - {selectedOperator.name}</h3>
          </ModalHeader>
          <ModalBody>
            <div className="mb-4">
              <h5 className="border-bottom pb-2">Operator Information</h5>
              <p className="mb-2">
                <strong>Operator ID:</strong> {selectedOperator.categoryId}
              </p>
              <p className="mb-2">
                <strong>Operator Name:</strong> {selectedOperator.name}
              </p>
              <p className="mb-0">
                <strong>Status:</strong>{" "}
                <Badge
                  color={
                    selectedOperator.status === "Active"
                      ? "success"
                      : selectedOperator.status === "On Leave"
                      ? "warning"
                      : "secondary"
                  }
                  pill
                >
                  {selectedOperator.status}
                </Badge>
              </p>
            </div>

            <div className="mb-4">
              <h5 className="border-bottom pb-2">Allocation Details</h5>
              <div className="table-responsive">
                <Table bordered hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Production Order Name</th>
                      <th>Part Name</th>
                      <th>Process</th>
                      <th>Machine</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operatorAllocations.map((allocation, index) => (
                      <tr key={index}>
                        <td>{allocation.projectName}</td>
                        <td>{allocation.partName}</td>
                        <td>{allocation.processName}</td>
                        <td>{allocation.machineId}</td>
                        <td>
                          {format(
                            new Date(allocation.startDate),
                            "MMM dd, yyyy"
                          )}
                        </td>
                        <td>
                          {format(new Date(allocation.endDate), "MMM dd, yyyy")}
                        </td>
                        <td>
                          <Button
                            color="primary"
                            size="sm"
                            onClick={() => handleViewPlan(allocation._id)}
                          >
                            View Plan
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button onClick={toggleModal}>Close</Button>
          </ModalFooter>
        </Modal>
      )}
    </Container>
  );
};

export default OperatorCapacity;
