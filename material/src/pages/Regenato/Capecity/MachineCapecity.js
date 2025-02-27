import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";

const MachineCapacity = () => {
  const [categories, setCategories] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [totalMachines, setTotalMachines] = useState(0);
  const [occupiedMachines, setOccupiedMachines] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [manufacturingRes, allocationsRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_BASE_URL}/api/manufacturing`).then(
          (res) => res.json()
        ),
        fetch(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/all-allocations`
        ).then((res) => res.json()),
      ]);

      let total = 0;
      let occupied = 0;

      manufacturingRes.forEach((category) => {
        total += category.subCategories.length;
      });

      allocationsRes.data.forEach((project) => {
        project.allocations.forEach((alloc) => {
          alloc.allocations.forEach((machineAlloc) => {
            occupied += 1;
          });
        });
      });

      setTotalMachines(total);
      setOccupiedMachines(occupied);
      setCategories(manufacturingRes);
      setAllocations(allocationsRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const getMachineAllocation = (subcategoryId, processName) => {
    for (let project of allocations) {
      for (let alloc of project.allocations) {
        if (
          alloc.processName === processName &&
          alloc.allocations.some((a) => a.machineId === subcategoryId)
        ) {
          return alloc.allocations.find((a) => a.machineId === subcategoryId);
        }
      }
    }
    return null;
  };

  const toggleModal = (machine) => {
    if (machine) {
      setSelectedMachine({
        ...machine,
        processName: machine.allocation?.processName,
        projectName: machine.allocation?.projectName,
        partName: machine.allocation?.partName,
        operator: machine.allocation?.operator,
        startDate: machine.allocation?.startDate,
        endDate: machine.allocation?.endDate,
      });
    }
    setModalOpen(!modalOpen);
  };

  if (loading) return <div>Loading...</div>;

  const availableMachines = totalMachines - occupiedMachines;

  return (
    <Container fluid>
      <h2 style={{ margin: "20px 0" }}>Machine Capacity</h2>
      <Card style={{ padding: "20px", marginBottom: "20px" }}>
        <CardBody>
          <h5>Factory Capacity Overview</h5>
          <h1>{totalMachines}</h1>
          <p>Total Machines</p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: "blue", fontSize: "20px" }}>
              {availableMachines} Available (
              {((availableMachines / totalMachines) * 100).toFixed(1)}%)
            </span>
            <span style={{ color: "red", fontSize: "20px" }}>
              {occupiedMachines} Occupied (
              {((occupiedMachines / totalMachines) * 100).toFixed(1)}%)
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: "10px",
              background: "#ddd",
              marginTop: "10px",
            }}
          >
            <div
              style={{
                width: `${(availableMachines / totalMachines) * 100}%`,
                height: "100%",
                background: "blue",
              }}
            ></div>
          </div>
        </CardBody>
      </Card>
      {categories.map((category) => (
        <div key={category._id} style={{ marginBottom: "20px" }}>
          <h5>{category.name}</h5>
          <Row>
            {category.subCategories.map((machine) => {
              const allocation = getMachineAllocation(
                machine.subcategoryId,
                category.name
              );
              const isOccupied = allocation !== null;
              return (
                <Col key={machine.subcategoryId}style={{display: "grid", gridTemplateColumns: "repeat(1, fr)"}}>
                  <Card
                    style={{
                      background: isOccupied ? "#FFCCCC" : "#CCDDFF",
                      textAlign: "center",
                      padding: "5px",
                      marginBottom: "10px",
                      cursor: isOccupied ? "pointer" : "default",
                    }}
                    onClick={() =>
                      isOccupied && toggleModal({ ...machine, allocation })
                    }
                  >
                    <CardBody>{machine.name}</CardBody>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      ))}

      {selectedMachine && (
        <Modal isOpen={modalOpen} toggle={toggleModal}>
          <ModalHeader toggle={toggleModal}>
            Machine Allocation Details
          </ModalHeader>
          <ModalBody>
            <p>
              <strong>Machine:</strong> {selectedMachine.name}
            </p>
              {/* <p>
              <strong>Process:</strong> {selectedMachine.processName || "N/A"}
            </p>
            <p>
              <strong>Project:</strong> {selectedMachine.projectName || "N/A"}
            </p>
            <p>
              <strong>Part Name:</strong> {selectedMachine.partName || "N/A"}
            </p> */}
            <p>
              <strong>Operator:</strong> {selectedMachine.operator || "N/A"}
            </p>
            <p>
              <strong>Start Date:</strong>{" "}
              {selectedMachine.startDate
                ? new Date(selectedMachine.startDate).toLocaleDateString()
                : "N/A"}
            </p>
            <p>
              <strong>End Date:</strong>{" "}
              {selectedMachine.endDate
                ? new Date(selectedMachine.endDate).toLocaleDateString()
                : "N/A"}
            </p>
          </ModalBody>
        </Modal>
      )}
    </Container>
  );
};

export default MachineCapacity;
