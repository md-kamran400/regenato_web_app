import React from "react";
import { Container, Row, Col, Card, CardBody } from "reactstrap";

const MachineCapecity = () => {
  const totalMachines = 136;
  const availableMachines = 59;
  const occupiedMachines = totalMachines - availableMachines;

  const categories = [
    {
      title: "VMC Imported (C1)",
      machines: [
        { id: "C1 001", occupied: true },
        { id: "C1 002", occupied: true },
        { id: "C1 003", occupied: false },
        { id: "C1 004", occupied: false },
        { id: "C1 005", occupied: true },
        { id: "C1 006", occupied: true },
        { id: "C1 007", occupied: false },
        { id: "C1 008", occupied: false },
      ],
    },
    {
      title: "VMC Local (C2)",
      machines: [
        { id: "C2 001", occupied: true },
        { id: "C2 002", occupied: true },
        { id: "C2 003", occupied: false },
        { id: "C2 004", occupied: false },
        { id: "C2 005", occupied: true },
        { id: "C2 006", occupied: false },
        { id: "C2 007", occupied: false },
        { id: "C2 008", occupied: true },
      ],
    },
  ];

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
              {availableMachines} Available ({((availableMachines / totalMachines) * 100).toFixed(1)}%)
            </span>
            <span style={{ color: "red", fontSize: "20px" }}>
              {occupiedMachines} Occupied ({((occupiedMachines / totalMachines) * 100).toFixed(1)}%)
            </span>
          </div>
          <div style={{ width: "100%", height: "10px", background: "#ddd", marginTop: "10px" }}>
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
      {categories.map((category, index) => (
        <div key={index} style={{ marginBottom: "20px" }}>
          <h5>{category.title}</h5>
          <Row>
            {category.machines.map((machine, idx) => (
              <Col key={idx} md="2" sm="4" xs="6">
                <Card
                  style={{
                    background: machine.occupied ? "#FFCCCC" : "#CCDDFF",
                    textAlign: "center",
                    padding: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <CardBody>{machine.id}</CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </Container>
  );
};

export default MachineCapecity;

// export default MachineCapecity;
