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
import {
  format,
  parseISO,
  isWithinInterval,
  isAfter,
  isBefore,
} from "date-fns";

const OperatorCapacity = () => {
  const navigate = useNavigate();
  const [operators, setOperators] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [filteredAllocations, setFilteredAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [totalOperators, setTotalOperators] = useState(0);
  const [occupiedOperators, setOccupiedOperators] = useState(0);
  const [onLeaveOperators, setOnLeaveOperators] = useState(0);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [operatorAllocations, setOperatorAllocations] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (allocations.length > 0 && operators.length > 0) {
      filterAllocationsByDate();
    }
  }, [allocations, operators, startDate, endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch data from API endpoints
      const [operatorsRes, allocationsRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_BASE_URL}/api/userVariable`).then(
          (res) => res.json()
        ),
        fetch(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/all-allocations`
        ).then((res) => res.json()),
      ]);

      setTotalOperators(operatorsRes.length);
      setOperators(operatorsRes);

      // Process allocations to flatten the structure
      const processedAllocations = allocationsRes.data.flatMap((project) =>
        project.allocations.flatMap((alloc) =>
          alloc.allocations.map((operatorAlloc) => ({
            ...operatorAlloc,
            projectName: project.projectName,
            partName: alloc.partName,
            processName: alloc.processName,
          }))
        )
      );

      setAllocations(processedAllocations);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const filterAllocationsByDate = () => {
    // Filter allocations by date range
    const filtered = allocations.filter((alloc) => {
      const allocStart = parseISO(alloc.startDate);
      const allocEnd = parseISO(alloc.endDate);

      return (
        isWithinInterval(allocStart, { start: startDate, end: endDate }) ||
        isWithinInterval(allocEnd, { start: startDate, end: endDate }) ||
        (isBefore(allocStart, startDate) && isAfter(allocEnd, endDate))
      );
    });

    setFilteredAllocations(filtered);

    // Calculate operator statuses
    const operatorStatus = {};
    const now = new Date();

    operators.forEach((operator) => {
      // Check if operator is on leave during the selected period
      const isOnLeave = operator.leavePeriod?.some((leave) => {
        const leaveStart = parseISO(leave.startDate);
        const leaveEnd = parseISO(leave.endDate);
        return (
          isWithinInterval(leaveStart, { start: startDate, end: endDate }) ||
          isWithinInterval(leaveEnd, { start: startDate, end: endDate }) ||
          (isBefore(leaveStart, startDate) && isAfter(leaveEnd, endDate))
        );
      });

      if (isOnLeave) {
        operatorStatus[operator._id] = "On Leave";
        return;
      }

      // Check if operator has allocations in this period
      const hasAllocations = filtered.some(
        (alloc) => alloc.operator === operator.name
      );

      operatorStatus[operator._id] = hasAllocations ? "Occupied" : "Available";
    });

    // Count statuses
    const occupiedCount = Object.values(operatorStatus).filter(
      (status) => status === "Occupied"
    ).length;
    const leaveCount = Object.values(operatorStatus).filter(
      (status) => status === "On Leave"
    ).length;

    setOccupiedOperators(occupiedCount);
    setOnLeaveOperators(leaveCount);
  };

  const getOperatorAllocations = (operatorName) => {
    return filteredAllocations.filter(
      (alloc) => alloc.operator === operatorName
    );
  };

  const toggleModal = (operator) => {
    const allocations = getOperatorAllocations(operator?.name);
    setOperatorAllocations(allocations);
    setSelectedOperator(operator);
    setModalOpen(!modalOpen);
  };

  const handleViewPlan = (allocationId) => {
    navigate(`/regenato-planPage/${allocationId}`);
  };

  const getOperatorStatus = (operator) => {
    // Check if operator is on leave during the selected period
    const isOnLeave = operator.leavePeriod?.some((leave) => {
      const leaveStart = parseISO(leave.startDate);
      const leaveEnd = parseISO(leave.endDate);
      return (
        isWithinInterval(leaveStart, { start: startDate, end: endDate }) ||
        isWithinInterval(leaveEnd, { start: startDate, end: endDate }) ||
        (isBefore(leaveStart, startDate) && isAfter(leaveEnd, endDate))
      );
    });

    if (isOnLeave) return "On Leave";

    // Check if operator has allocations in this period
    const hasAllocations = filteredAllocations.some(
      (alloc) => alloc.operator === operator.name
    );

    return hasAllocations ? "Occupied" : "Available";
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

  const availableOperators =
    totalOperators - occupiedOperators - onLeaveOperators;
  const availablePercentage = (
    (availableOperators / totalOperators) *
    100
  ).toFixed(1);
  const occupiedPercentage = (
    (occupiedOperators / totalOperators) *
    100
  ).toFixed(1);
  const leavePercentage = ((onLeaveOperators / totalOperators) * 100).toFixed(
    1
  );

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Operator Capacity</h2>
      </div>

      <Card className="shadow-sm mb-4">
        <CardBody>
          <div className="d-flex flex-wrap gap-3 mb-3">
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
              <Progress bar color="warning" value={leavePercentage}>
                {leavePercentage}%
              </Progress>
            </Progress>

            <div className="d-flex justify-content-between flex-wrap">
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
              <div>
                <Badge color="warning" className="me-2">
                  On Leave
                </Badge>
                <span>
                  {onLeaveOperators} ({leavePercentage}%)
                </span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="shadow-sm mb-4">
        <CardBody>
          <h5 className="mb-3">Operators</h5>
          <Row xs={1} sm={2} md={3} lg={4} className="g-3">
            {operators.map((operator) => {
              const status = getOperatorStatus(operator);
              const statusColor =
                status === "Available"
                  ? "success"
                  : status === "Occupied"
                  ? "danger"
                  : "warning";
              const cardBorder =
                status === "Available"
                  ? "border-success"
                  : status === "Occupied"
                  ? "border-danger"
                  : "border-warning";
              const cardBackground =
                status === "Available"
                  ? "#EEFFEE"
                  : status === "Occupied"
                  ? "#FFEEEE"
                  : "#FFF8E1";

              return (
                <Col key={operator._id}>
                  <Card
                    className={`h-100 ${cardBorder}`}
                    style={{
                      background: cardBackground,
                      cursor: status === "Occupied" ? "pointer" : "default",
                    }}
                    onClick={() =>
                      status === "Occupied" && toggleModal(operator)
                    }
                  >
                    <CardBody className="p-2 text-center">
                      <div className="fw-bold mb-1">
                        {operator.name} ({operator.categoryId})
                      </div>
                      <div className="mb-1">
                        <Badge color={statusColor} pill>
                          {status}
                        </Badge>
                      </div>
                      <div className="mt-2 small">
                        Processes: {operator.processName.join(", ")}
                      </div>
                      {status === "On Leave" &&
                        operator.leavePeriod?.length > 0 && (
                          <div className="mt-2 small">
                            Leave:{" "}
                            {format(
                              parseISO(operator.leavePeriod[0].startDate),
                              "dd-MM-yyyy"
                            )}{" "}
                            to{" "}
                            {format(
                              parseISO(operator.leavePeriod[0].endDate),
                              "dd-MM-yyyy"
                            )}
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

      {selectedOperator && (
        <Modal isOpen={modalOpen} toggle={() => toggleModal(null)} size="xl">
          <ModalHeader toggle={() => toggleModal(null)}>
            Operator Allocation Details - {selectedOperator.name} (
            {selectedOperator.categoryId})
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
              <p className="mb-2">
                <strong>Status:</strong>{" "}
                <Badge
                  color={
                    getOperatorStatus(selectedOperator) === "Available"
                      ? "success"
                      : getOperatorStatus(selectedOperator) === "Occupied"
                      ? "danger"
                      : "warning"
                  }
                >
                  {getOperatorStatus(selectedOperator)}
                </Badge>
              </p>
              <p className="mb-0">
                <strong>Processes:</strong>{" "}
                {selectedOperator.processName.join(", ")}
              </p>
            </div>

            <div className="mb-4">
              <h5 className="border-bottom pb-2">Allocation Details</h5>
              {operatorAllocations.length > 0 ? (
                <div className="table-responsive">
                  <Table bordered hover className="mb-0">
                    <thead>
                      <tr>
                        <th>Project Name</th>
                        <th>Part Name</th>
                        <th>Process</th>
                        <th>Machine</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Shift</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {operatorAllocations.map((alloc, index) => (
                        <tr key={index}>
                          <td>{alloc.projectName}</td>
                          <td>{alloc.partName}</td>
                          <td>{alloc.processName}</td>
                          <td>{alloc.machineId}</td>
                          <td>
                            {format(parseISO(alloc.startDate), "dd-MM-yyyy")}
                          </td>
                          <td>
                            {format(parseISO(alloc.endDate), "dd-MM-yyyy")}
                          </td>
                          <td>{alloc.shift}</td>
                          <td>
                            <Button
                              color="primary"
                              size="sm"
                              onClick={() => handleViewPlan(alloc._id)}
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
                <div className="alert alert-info">
                  No allocations found for this operator in the selected date
                  range.
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => toggleModal(null)}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </Container>
  );
};

export default OperatorCapacity;
