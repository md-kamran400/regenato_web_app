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
  CardHeader,
  Label,
} from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Link, useParams } from "react-router-dom";
import AdvanceTimeLine from "../Home/AdvanceTimeLine";
import "./project.css";
import { FiSettings } from "react-icons/fi";

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
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [costPerUnit, setCostPerUnit] = useState("");
  const [timePerUnit, setTimePerUnit] = useState("");
  const [detailedPartData, setDetailedPartData] = useState({});
  const [inputs, setInputs] = useState({
    machineHours: {},
    machineTbu: {},
    daysToWork: {},
  });
  const [calculatedValues, setCalculatedValues] = useState({});
  const [machinesTBU, setMachinesTBU] = useState({});
  const toggleAddModal = () => {
    setModalAdd(!modalAdd);
  };

  useEffect(() => {
    const fetchParts = async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/parts`
      );
      const data = await response.json();
      setParts(data);
    };

    const fetchManufacturingVariables = async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/manufacturing`
      );
      const data = await response.json();
      setManufacturingVariables(data);

      setMachinesTBU((prev) => ({
        ...prev,
        ...data.reduce((acc, item) => ({ ...acc, [item.name]: 6 }), {}),
      }));
    };

    fetchParts();
    fetchManufacturingVariables();
  }, []);

  const fetchProjectDetails = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}`
      );
      const data = await response.json();
      setPartDetails(data);
      console.log(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    fetchProjectDetails();
  }, [_id]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/parts`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setListData(data);
      setPartsData(data);
      console.log(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchDetailedPartData = useCallback(async (partName) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/parts`
      );
      const data = await response.json();
      const partData = data.find((part) => part.partName === partName);
      if (partData) {
        setDetailedPartData(partData);
      } else {
        setDetailedPartData({});
      }
    } catch (error) {
      console.error("Error fetching detailed part data:", error);
      setDetailedPartData({});
    }
  }, []);

  useEffect(() => {
    if (selectedPartData && selectedPartData.partName) {
      fetchDetailedPartData(selectedPartData.partName);
    } else {
      setDetailedPartData({});
    }
  }, [selectedPartData, fetchDetailedPartData]);

  const handleRMInputChange = (e, name) => {
    const value = parseFloat(e.target.value) || 0;
    setDetailedPartData((prev) => ({
      ...prev,
      rmVariables: prev.rmVariables.map((rm) =>
        rm.name === name ? { ...rm, netWeight: value } : rm
      ),
    }));
  };

  const handleManufacturingInputChange = (e, name) => {
    const value = parseFloat(e.target.value) || 0;
    setDetailedPartData((prev) => ({
      ...prev,
      manufacturingVariables: prev.manufacturingVariables.map((man) =>
        man.name === name ? { ...man, hours: value } : man
      ),
    }));
  };

  const handleShipmentInputChange = (e, name) => {
    const value = parseFloat(e.target.value) || 0;
    setDetailedPartData((prev) => ({
      ...prev,
      shipmentVariables: prev.shipmentVariables.map((ship) =>
        ship.name === name ? { ...ship, hourlyRate: value } : ship
      ),
    }));
  };

  const handleOverheadInputChange = (e, name) => {
    const value = parseFloat(e.target.value) || 0;
    setDetailedPartData((prev) => ({
      ...prev,
      overheadsAndProfits: prev.overheadsAndProfits.map((overhead) =>
        overhead.name === name ? { ...overhead, percentage: value } : overhead
      ),
    }));
  };

  const handleAutocompleteChange = (event, newValue) => {
    if (newValue) {
      const selectedPart = parts.find(
        (part) => part.partName === newValue.partName
      );
      if (selectedPart) {
        const calculations = selectedPart.partsCalculations[0] || {};
        setSelectedPartData({
          partName: selectedPart.partName,
          AvgragecostPerUnit: calculations.AvgragecostPerUnit || 0,
          AvgragetimePerUnit: calculations.AvgragetimePerUnit || 0,
        });
        setCostPerUnit(calculations.AvgragecostPerUnit || "");
        setTimePerUnit(calculations.AvgragetimePerUnit || "");
        fetchDetailedPartData(selectedPart.partName);
      }
    } else {
      setSelectedPartData(null);
      setCostPerUnit("");
      setTimePerUnit("");
      setDetailedPartData({});
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (selectedPartData) {
      const payload = {
        partName: selectedPartData.partName,
        AvgragecostPerUnit: selectedPartData.AvgragecostPerUnit,
        AvgragetimePerUnit: selectedPartData.AvgragetimePerUnit,
        quantity: quantity || 1, // Default to 1 if not specified
      };
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/allProjects`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) throw new Error("Failed to submit part data");

        const newPart = await response.json();
        console.log("New part:", newPart);

        setListData((prevData) => [...prevData, newPart]); // Update list data
        setModalAdd(false);
        await fetchProjectDetails(); // Refresh project details
      } catch (error) {
        console.error("Error submitting part:", error);
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

  // Toggle function for expanding/collapsing the row
  const handleRowClickParts = async (rowId, partName) => {
    setExpandedRowId(expandedRowId === rowId ? null : rowId);

    const matchingPart = parts.find((part) => part.partName === partName);
    if (matchingPart) {
      await fetchDetailedPartData(partName); // Fetch data for the selected part
    } else {
      console.error("Part not found in parts list.");
      setDetailedPartData({}); // Clear data if not found
    }
  };

  console.log(
    "Is partsData.rmVariables an array:",
    Array.isArray(partsData.rmVariables)
  );

  const handleInputChange = (e, section, index, key) => {
    const updatedValue = e.target.value;
    setDetailedPartData((prevState) => {
      const updatedSection = [...prevState[section]];
      updatedSection[index][key] = updatedValue;
      return { ...prevState, [section]: updatedSection };
    });
  };

  console.log(detailedPartData);
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Project Details" pageTitle="Project Details" />

          <div className="project-header">
            {/* Left Section */}
            <div className="header-section left">
              <h2 className="project-name">Production Order 001</h2>
              <p className="po-id">PO ID: PO001</p>
            </div>

            {/* Center Section */}
            <div className="header-section center">
              <div className="stats-container">
                <div className="stat-item">
                  <p className="stat-label">Total Cost:</p>
                  <p className="stat-value">{totalCost.toFixed(2)}</p>
                </div>
                <div className="stat-item">
                  <p className="stat-label">
                    <span className="icon">&#128339;</span> Total Machining
                    Hours:
                  </p>
                  <p className="stat-value">{totalMachiningHours}</p>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="header-section right">
              <span className="status-badge">In Progress</span>
            </div>
          </div>
          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <div className="button-group">
                    <Button
                      color="success"
                      className="add-btn"
                      onClick={toggleAddModal}
                    >
                      <i className="ri-add-line align-bottom me-1"></i> Add Part
                    </Button>
                    <Link to="/projectinvoice">
                      <Button className="add-btn bom-button">
                        <i className="ri-add-line align-bottom me-1"></i> Add
                        BOM
                      </Button>
                    </Link>
                  </div>

                  <div className="table-wrapper">
                    <table className="project-table">
                      <thead>
                        <tr>
                          <th onClick={() => handleRowClickParts("name")}>
                            Name
                          </th>
                          <th>Cost Per Unit</th>
                          <th>Machining Hours</th>
                          <th>Quantity</th>
                          <th>Total Cost</th>
                          <th>Total Machining Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {partDetails.allProjects?.map((item) => (
                          <React.Fragment key={item._id}>
                            <tr
                              onClick={() =>
                                handleRowClickParts(item._id, item.partName)
                              }
                              className={
                                expandedRowId === item._id ? "expanded" : ""
                              }
                            >
                              <td className="parent_partName">
                                {item.partName}
                              </td>
                              <td>{item.costPerUnit.toFixed(2)}</td>
                              <td>{item.timePerUnit.toFixed(2)}</td>
                              <td>{item.quantity}</td>
                              <td>
                                {(item.costPerUnit * item.quantity).toFixed(2)}
                              </td>
                              <td>
                                {(item.timePerUnit * item.quantity).toFixed(2)}
                              </td>
                            </tr>
                            {expandedRowId === item._id && (
                              <tr className="details-row">
                                <td colSpan={6}>
                                  <div className="details-box">
                                    <h5
                                      className="mb-3 d-flex align-items-center"
                                      style={{
                                        fontWeight: "bold",
                                        color: "#333",
                                      }}
                                    >
                                      <FiSettings
                                        style={{
                                          fontSize: "1.2rem",
                                          marginRight: "10px",
                                          color: "#2563eb",
                                          fontWeight: "bold",
                                        }}
                                      />
                                      {item.partName}
                                    </h5>
                                    {/* Raw Materials Section */}
                                    <div className="section raw-materials">
                                      <h5>📦 Raw Materials</h5>
                                      {detailedPartData.rmVariables?.map(
                                        (rm, index) => (
                                          <div
                                            key={index}
                                            className="input-row"
                                          >
                                            <p>{rm.name}</p>
                                            <span className="input-price">
                                              Net Weight:{" "}
                                              <input
                                                type="number"
                                                value={rm.netWeight}
                                                onChange={(e) =>
                                                  handleRMInputChange(
                                                    e,
                                                    "rawMaterials",
                                                    index,
                                                    "netWeight"
                                                  )
                                                }
                                              />
                                            </span>
                                            <span className="input-price">
                                              ₹
                                              <input
                                                type="number"
                                                value={rm.pricePerKg || 0}
                                                onChange={(e) =>
                                                  handleRMInputChange(
                                                    e,
                                                    "rawMaterials",
                                                    index,
                                                    "pricePerKg"
                                                  )
                                                }
                                              />
                                              /kg
                                            </span>
                                            <span className="input-price">
                                              Total: ₹ {rm.totalRate}
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>

                                    {/* Manufacturing Section */}
                                    <div className="section manufacturing">
                                      <h5>
                                        <i className="icon">🔧</i> Manufacturing
                                      </h5>
                                      {detailedPartData.manufacturingVariables?.map(
                                        (man, index) => (
                                          <div
                                            key={index}
                                            className="input-row"
                                          >
                                            <p>{man.name}</p>
                                            <span className="input-price">
                                              Hours:{" "}
                                              <input
                                                type="number"
                                                value={man.hours || 0}
                                                onChange={(e) =>
                                                  handleManufacturingInputChange(
                                                    e,
                                                    "manufacturing",
                                                    index,
                                                    "hours"
                                                  )
                                                }
                                              />
                                            </span>
                                            <span className="input-price">
                                              Rate: ₹
                                              <input
                                                type="number"
                                                value={man.hourlyRate || 0}
                                                onChange={(e) =>
                                                  handleManufacturingInputChange(
                                                    e,
                                                    "manufacturing",
                                                    index,
                                                    "hourlyRate"
                                                  )
                                                }
                                              />
                                              /hr
                                            </span>
                                            <span className="input-price">
                                              Total: ₹{man.totalRate}
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                    {/* Shipment Section */}
                                    <div className="section shipping">
                                      <h5>
                                        <i className="icon">🚚</i> Shipment
                                      </h5>
                                      {detailedPartData.shipmentVariables?.map(
                                        (ship, index) => (
                                          <div
                                            key={index}
                                            className="input-row"
                                          >
                                            <p>{ship.name}</p>
                                            <span className="input-price">
                                              ₹{ship.hourlyRate}
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>

                                    {/* Overheads and Profit Section */}
                                    <div className="section overheads">
                                      <h5>
                                        <i className="icon">💰</i> Overheads &
                                        Profit
                                      </h5>
                                      {detailedPartData.overheadsAndProfits?.map(
                                        (overhead, index) => (
                                          <div
                                            key={index}
                                            className="input-row"
                                          >
                                            <p>{overhead.name}</p>
                                            <span className="input-price">
                                              %
                                              <input
                                                type="number"
                                                value={overhead.percentage || 0}
                                                onChange={(e) =>
                                                  handleOverheadInputChange(
                                                    e,
                                                    "overheads",
                                                    index,
                                                    "totalRate"
                                                  )
                                                }
                                              />
                                            </span>
                                            <span className="input-price">
                                              Total: ₹{overhead.totalRate}
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>
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
                getOptionLabel={(option) => option.partName || ""}
                onChange={handleAutocompleteChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Part"
                    variant="outlined"
                  />
                )}
              />

              <div className="form-group">
                <Label for="costPerUnit" className="form-label">
                  Cost Per Unit
                </Label>
                <Input
                  className="form-control"
                  type="number"
                  id="costPerUnit"
                  value={Number(costPerUnit).toFixed(2) || "0.00"}
                  onChange={(e) => setCostPerUnit(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <Label for="timePerUnit" className="form-label">
                  Time Per Unit
                </Label>
                <Input
                  className="form-control"
                  type="number"
                  id="timePerUnit"
                  value={Number(timePerUnit).toFixed(2) || "0.00"}
                  onChange={(e) => setTimePerUnit(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <Label for="quantity" className="form-label">
                  Quantity
                </Label>
                <Input
                  className="form-control"
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
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
