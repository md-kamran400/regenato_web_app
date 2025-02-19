import React, { useState } from "react";
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
  Input,
  CardBody,
} from "reactstrap";

const AllocatedPartListHrPlan = () => {
  // Modal state
  const [dailyTaskModal, setDailyTaskModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);

  // Sample data for multiple sections
  const sections = [
    {
      title: "C1 - VMC Imported",
      data: [
        {
          plannedQty: 200,
          startDate: "19/02/2025",
          endDate: "21/02/2025",
          machineId: "C1-01 - VMC 1",
          shift: "Shift A",
          plannedTime: "1000 m",
          operator: "Michael Brown",
        },
      ],
    },
    {
      title: "C2 - VMC Local",
      data: [
        {
          plannedQty: 150,
          startDate: "22/02/2025",
          endDate: "07/03/2025",
          machineId: "01-A - tesing 87",
          shift: "Shift A",
          plannedTime: "6500 m",
          operator: "Michael Brown",
        },
      ],
    },
    {
      title: "C4 - Grinding Final",
      data: [
        {
          plannedQty: 100,
          startDate: "08/03/2025",
          endDate: "13/03/2025",
          machineId: "G001 - TETT",
          shift: "Shift A",
          plannedTime: "2501 m",
          operator: "Michael Brown",
        },
      ],
    },
    {
      title: "C6 - Drill/Tap",
      data: [
        {
          plannedQty: 250,
          startDate: "14/03/2025",
          endDate: "15/03/2025",
          machineId: "D01 - test/Tap",
          shift: "Shift A",
          plannedTime: "500 m",
          operator: "Kamraan",
        },
      ],
    },
  ];

  // Dummy task data
  const dailyTasks = [
    { date: new Date(), planned: 50, produced: 50, delay: "On Track" },
    {
      date: new Date(new Date().setDate(new Date().getDate() + 1)),
      planned: 60,
      produced: 55,
      delay: "Slight Delay",
    },
  ];

  console.log(dailyTasks);

  // Function to open the modal
  const openModal = (section) => {
    setSelectedSection(section);
    setDailyTaskModal(true);
  };

  return (
    <div style={{ width: "100%", padding: "10px" }}>
      <Container fluid className="mt-4">
        {sections.map((section, index) => (
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
        ))}
        <CardBody className="d-flex justify-content-end align-items-center">
          <Button color="danger">Cancel Allocation</Button>
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
          {selectedSection && (
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
                  <span style={{color:'red'}}>22/03/2025</span>
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

export default AllocatedPartListHrPlan;
