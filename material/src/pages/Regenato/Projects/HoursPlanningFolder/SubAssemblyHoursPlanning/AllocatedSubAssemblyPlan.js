import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
  Alert,
  CardBody,
} from "reactstrap";

export const AllocatedSubAssemblyPlan = ({
  porjectID,
  subAssemblyListFirstId,
  partListItemId,
}) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailyTaskModal, setDailyTaskModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);

  useEffect(() => {
    const fetchAllocations = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/subAssemblyListFirst/${subAssemblyListFirstId}/partsListItems/${partListItemId}/allocation`
        );

        if (!response.data.data || response.data.data.length === 0) {
          setSections([]);
        } else {
          const formattedSections = response.data.data.map((item) => ({
            title: item.processName,
            data: item.allocations.map((allocation) => ({
              plannedQty: allocation.plannedQuantity,
              startDate: new Date(allocation.startDate).toLocaleDateString(),
              endDate: new Date(allocation.endDate).toLocaleDateString(),
              machineId: allocation.machineId,
              shift: allocation.shift,
              plannedTime: `${allocation.plannedTime} min`,
              operator: allocation.operator,
            })),
          }));
          setSections(formattedSections);
        }
      } catch (error) {
        setError("Failed to fetch allocations. Please try again later.");
        console.error("Error fetching allocations:", error);
      }
      setLoading(false);
    };

    fetchAllocations();
  }, [porjectID, subAssemblyListFirstId, partListItemId]);

  const openModal = (section) => {
    setSelectedSection(section);
    setDailyTaskModal(true);
  };

  return (
    <div style={{ width: "100%" }}>
      <Container fluid className="mt-4">
        {loading ? (
          <div className="text-center">
            <Spinner color="primary" />
            <p>Loading allocations...</p>
          </div>
        ) : error ? (
          <Alert color="danger">{error}</Alert>
        ) : sections.length === 0 ? (
          <div className="text-center">
            <Alert color="warning">No allocations available.</Alert>
          </div>
        ) : (
          sections.map((section, index) => (
            <div
              className="shadow-lg p-2"
              key={index}
              style={{ marginBottom: "30px" }}
            >
              <Row className="mb-3 d-flex justify-content-between align-items-center">
                <Col>
                  <h4
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "#495057",
                    }}
                  >
                    {section.title}
                  </h4>
                </Col>
                <Col className="text-end">
                  <Button
                    color="primary"
                    className="me-2"
                    onClick={() => openModal(section)}
                  >
                    Update Input
                  </Button>
                </Col>
              </Row>

              <Table bordered responsive>
                <thead>
                  <tr className="table-secondary">
                    <th>Planned Quantity</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Machine ID</th>
                    <th>Shift</th>
                    <th>Planned Time</th>
                    <th>Operator</th>
                  </tr>
                </thead>
                <tbody>
                  {section.data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td>{row.plannedQty}</td>
                      <td>{row.startDate}</td>
                      <td>{row.endDate}</td>
                      <td>{row.machineId}</td>
                      <td>{row.shift}</td>
                      <td>{row.plannedTime}</td>
                      <td>{row.operator}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ))
        )}
        <CardBody className="d-flex justify-content-end align-items-center">
          {/* <Button color="danger">Cancel Allocation</Button> */}
        </CardBody>
      </Container>

      {/* Modal for Updating Daily Task */}
      <Modal
        isOpen={dailyTaskModal}
        toggle={() => setDailyTaskModal(false)}
        style={{ maxWidth: "50vw" }}
      >
        <ModalHeader toggle={() => setDailyTaskModal(false)}>
          Update Input - {selectedSection?.title}
        </ModalHeader>
        <ModalBody>
          {selectedSection && selectedSection.data.length > 0 ? (
            <>
              <Row className="mb-3">
                <Col>
                  <span style={{ fontWeight: "bold" }}>Total Quantity: </span>
                  <span>{selectedSection.data[0].plannedQty}</span>
                </Col>
                <Col>
                  <span style={{ fontWeight: "bold" }}>Start Date: </span>
                  <span>{selectedSection.data[0].startDate}</span>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <span style={{ fontWeight: "bold" }}>Plan End Date: </span>
                  <span>{selectedSection.data[0].endDate}</span>
                </Col>
                <Col>
                  <span style={{ fontWeight: "bold" }}>Actual End Date: </span>
                  <span style={{ color: "red" }}>22/03/2025</span>
                </Col>
              </Row>
              <Table bordered>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Planned</th>
                    <th>Produced</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyTasks.map((task, index) => (
                    <tr key={index}>
                      <td>{task.date.toDateString()}</td>
                      <td>{task.planned}</td>
                      <td>
                        <Input type="number" defaultValue={task.produced} />
                      </td>
                      <td>{task.delay}</td>
                      <td>
                        <Button>Update</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          ) : (
            <Alert color="warning">No details available.</Alert>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setDailyTaskModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};
