import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Button,
  CardBody,
  Col,
  Container,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  Input,
} from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Link, useParams } from "react-router-dom";

const SingeProject = () => {
  const { _id } = useParams();
  const [modalAdd, setModalAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [partsData, setPartsData] = useState([]);
  const [partDetails, setPartDetails] = useState([]);
  const [listData, setListData] = useState([]);
  const [selectedPartData, setSelectedPartData] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [parts, setParts] = useState([]);
  const [manufacturingVariables, setManufacturingVariables] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [inputs, setInputs] = useState({
    machineHours: {},
    machineTbu: {},
    daysToWork: {},
  });
  const [calculatedValues, setCalculatedValues] = useState({});

  const toggleAddModal = () => {
    setModalAdd(!modalAdd);
  };

  useEffect(() => {
    const fetchParts = async () => {
      const response = await fetch("http://localhost:4040/api/parts");
      const data = await response.json();
      setParts(data);
    };

    const fetchManufacturingVariables = async () => {
      const response = await fetch("http://localhost:4040/api/manufacturing");
      const data = await response.json();
      setManufacturingVariables(data);
    };

    fetchParts();
    fetchManufacturingVariables();
  }, []);

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(`http://localhost:4040/api/projects/${_id}`);
      const data = await response.json();
      setPartDetails(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [_id]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:4040/api/parts");
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setListData(data);
      setPartsData(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAutocompleteChange = (event, newValue) => {
    setSelectedPartData(newValue);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (selectedPartData) {
      const payload = {
        partName: selectedPartData.partName,
        costPerUnit: selectedPartData.costPerUnit,
        timePerUnit: selectedPartData.timePerUnit,
        quantity: quantity,
      };

      try {
        const response = await fetch(
          `http://localhost:4040/api/projects/${_id}/allProjects`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) throw new Error("Failed to submit part data");

        await fetchProjectDetails();
        await fetchData();
        const newPart = await response.json();
        setListData((prevData) => [...prevData, newPart]);
        setModalAdd(false);
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const totalCost =
    partDetails.allProjects?.reduce(
      (total, item) => total + item.costPerUnit * item.quantity,
      0
    ) || 0;

  const totalMachiningHours = partDetails.allProjects?.reduce(
    (total, item) => total + Number(item.timePerUnit * item.quantity),
    0
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleRowClick = (process) => {
    setExpandedRows((prevExpandedRows) => ({
      ...prevExpandedRows,
      [process]: !prevExpandedRows[process],
    }));
  };

  const processPartsMap = parts.reduce((acc, part) => {
    const matchingPart = partDetails.allProjects?.find(
      (item) => item.partName === part.partName
    );

    if (matchingPart) {
      part.manufacturingVariables.forEach((variable) => {
        if (!acc[variable.name]) acc[variable.name] = [];

        const totalHours = matchingPart.quantity * variable.hours;

        acc[variable.name].push({
          partName: part.partName,
          hours: variable.hours,
          quantity: matchingPart.quantity,
          totalHours: totalHours,
        });
      });
    }

    return acc;
  }, {});

  const handleInputChange = (process, field, value) =>
    setInputs((prev) => ({
      ...prev,
      [field]: { ...prev[field], [process]: value },
    }));



const handleSave = (process) => {
  const { machineHours, machineTbu, daysToWork } = inputs;

  // Calculate available machine hours per month
  const availableMachineHoursPerMonth = (machineHours[process] || 0) * (machineTbu[process] || 0) * (daysToWork[process] || 0);
  
  // Update the calculated values state for the specific process
  setCalculatedValues((prev) => ({
    ...prev,
    [process]: availableMachineHoursPerMonth
  }));
};

const calculateMonthsRequired = (processName) => {
  const totalHours = processPartsMap[processName]?.reduce(
    (total, part) => total + part.totalHours,
    0
  ) || 0;

  const availableMachineHoursPerMonth = calculatedValues[processName] || 1; // Use calculated value; avoid division by zero

  return (totalHours / availableMachineHoursPerMonth).toFixed(2);
};

    
    

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Project Details" pageTitle="Project Details" />

          <div className="mb-4 pb-2 d-flex">
            <Button
              color="success"
              className="add-btn me-1"
              onClick={toggleAddModal}
            >
              <i className="ri-add-line align-bottom me-1"></i> Add Part
            </Button>
            <Link to="/projectinvoice">
              <Button
                style={{ backgroundColor: "#9C27B0" }}
                className="add-btn me-1"
              >
                <i className="ri-add-line align-bottom me-1"></i> Add BOM
              </Button>
            </Link>
          </div>

          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <div className="d-flex align-items-center mt-3">
                    <p className="fw-bold mb-0 me-2">Total Cost:</p>
                    <p className="fw-bold mb-0 me-2">{totalCost.toFixed(2)}</p>
                  </div>
                  <div className="d-flex align-items-center mt-3">
                    <p className="fw-bold mb-0 me-2">Total Machining Hours:</p>
                    <p className="fw-bold mb-0 me-2">{totalMachiningHours}</p>
                  </div>
                  <div className="table-responsive table-card mt-3 mb-1">
                    <table className="table align-middle table-nowrap">
                      <thead className="table-light">
                        <tr>
                          <th>Name</th>
                          <th>Cost Per Unit</th>
                          <th>Machining Hours</th>
                          <th>Quantity</th>
                          <th>Total Cost</th>
                          <th>Total Machining Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {partDetails.allProjects?.map((item) => (
                          <tr key={item._id}>
                            <td>{item.partName}</td>
                            <td>{item.costPerUnit}</td>
                            <td>{item.timePerUnit}</td>
                            <td>{item.quantity}</td>
                            <td>
                              {(item.costPerUnit * item.quantity).toFixed(2)}
                            </td>
                            <td>
                              {(item.timePerUnit * item.quantity).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="table-responsive table-card mt-3 mb-1">
                    <table className="table align-middle table-nowrap">
                      <thead className="table-light">
                        <tr>
                          <th>Process Breakdown</th>
                          <th>Required Machinewise Total Hours</th>
                          <th>Available machine hours per day</th>
                          <th>Number of Machines TBU</th>
                          <th>Number of Days to be worked</th>
                          <th>Available machine hours per month</th>
                          <th>Months Required to complete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {manufacturingVariables.map((variable) => (
                          <React.Fragment key={variable._id}>
                            <tr onClick={() => handleRowClick(variable.name)}>
                              <td>{variable.name}</td>
                              <td>
                                {/* Calculate total hours for each process */}
                                {(
                                  processPartsMap[variable.name]?.reduce(
                                    (total, part) => total + part.totalHours,
                                    0
                                  ) || 0
                                ).toFixed(2)}
                              </td>
                              <td>
                  <Input
                    type="number"
                    value={inputs.machineHours[variable.name] || ""}
                    onChange={(e) => handleInputChange(variable.name, "machineHours", e.target.value)}
                  />
                </td>
                <td>
                  <Input
                    type="number"
                    value={inputs.machineTbu[variable.name] || ""}
                    onChange={(e) => handleInputChange(variable.name, "machineTbu", e.target.value)}
                  />
                </td>
                <td>
                  <Input
                    type="number"
                    value={inputs.daysToWork[variable.name] || ""}
                    onChange={(e) => handleInputChange(variable.name, "daysToWork", e.target.value)}
                  />
                </td>
                <td>{calculatedValues[variable.name] || 0}</td>
                <td>{calculateMonthsRequired(variable.name)}</td>
                <td>
                  <Button color="success" onClick={() => handleSave(variable.name)}>
                    Save
                  </Button>
                </td>
                            </tr>
                            {expandedRows[variable.name] && (
                              <tr>
                                <td colSpan={2}>
                                  <div className="table-responsive">
                                    <table className="table align-middle table-nowrap">
                                      <thead className="table-light">
                                        <tr>
                                          <th>Part Name</th>
                                          <th>Quantity</th>
                                          <th>Hours</th>
                                          <th>Total Hours</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {processPartsMap[variable.name]?.map(
                                          (part) => (
                                            <tr key={part.partName}>
                                              <td>{part.partName}</td>
                                              <td>{part.quantity}</td>
                                              <td>{part.hours}</td>
                                              <td>{part.totalHours.toFixed(2)}</td>
                                            </tr>
                                          )
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>

        <Modal isOpen={modalAdd} toggle={toggleAddModal}>
          <ModalHeader toggle={toggleAddModal}>Add Part</ModalHeader>
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <Autocomplete
                options={parts}
                getOptionLabel={(option) => option.partName}
                onChange={handleAutocompleteChange}
                renderInput={(params) => (
                  <TextField {...params} label="Select Part" />
                )}
              />
              <TextField
                type="number"
                label="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                fullWidth
                required
              />
              <Button type="submit" color="primary">
                Add
              </Button>
            </form>
          </ModalBody>
        </Modal>
      </div>
    </React.Fragment>
  );
};
export default SingeProject;
