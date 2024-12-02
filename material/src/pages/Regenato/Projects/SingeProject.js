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
  FormGroup,
  UncontrolledAccordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
} from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Link, useParams } from "react-router-dom";
import AdvanceTimeLine from "../Home/AdvanceTimeLine";
import "./project.css";
import { FiSettings } from "react-icons/fi";
import RawMaterial from "./ExpandFolders/RawMaterial";
import Manufacturing from "./ExpandFolders/Manufacturing";
import Shipment from "./ExpandFolders/Shipment";
import Overheads from "./ExpandFolders/Overheads";

const SingeProject = () => {
  const { _id } = useParams();
  const [modalAdd, setModalAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [partsData, setPartsData] = useState([]);
  const [partDetails, setPartDetails] = useState([]);
  const [listData, setListData] = useState([]);
  // Assuming parts array is populated
  const [quantity, setQuantity] = useState(0);
  const [parts, setParts] = useState([]);
  const [selectedPartData, setSelectedPartData] = useState(parts[0]);
  const [manufacturingVariables, setManufacturingVariables] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [costPerUnit, setCostPerUnit] = useState("");
  const [timePerUnit, setTimePerUnit] = useState("");
  const [detailedPartData, setDetailedPartData] = useState({});
  const [refetchManufacturing, setRefetchManufacturing] = useState(false);
  const [rawMaterialInput, setRawMaterialInput] = useState("");
  const [manufacturingInput, setManufacturingInput] = useState("");
  const [shipmentInput, setShipmentInput] = useState("");
  const [overheadsProfitInput, setOverheadsProfitInput] = useState("");
  const [projectName, setProjectName] = useState('');
  const [projectType, setprojectType] = useState('');
  const [partId, setPartId] = useState("");
  // ... other state declarations ...
  const [inputs, setInputs] = useState({
    machineHours: {},
    machineTbu: {},
    daysToWork: {},
  });
  const [calculatedValues, setCalculatedValues] = useState({});
  const [machinesTBU, setMachinesTBU] = useState({});

  const [showTable, setShowTable] = useState(() => {
    const storedValue = localStorage.getItem('showTable');
    return storedValue ? JSON.parse(storedValue) : false;
  });

  const [showAssemblyTable, setShowAssemblyTable] = useState(() => {
    const storedValue = localStorage.getItem('showAssemblyTable');
    return storedValue ? JSON.parse(storedValue) : false;
  });

  const [showSubAssemblyTable, setShowSubAssemblyTable] = useState(() => {
    const storedValue = localStorage.getItem('showSubAssemblyTable');
    return storedValue ? JSON.parse(storedValue) : false;
  });

  // ... other state declarations ...

  useEffect(() => {
    localStorage.setItem('showTable', JSON.stringify(showTable));
  }, [showTable]);

  useEffect(() => {
    localStorage.setItem('showAssemblyTable', JSON.stringify(showAssemblyTable));
  }, [showAssemblyTable]);

  useEffect(() => {
    localStorage.setItem('showSubAssemblyTable', JSON.stringify(showSubAssemblyTable));
  }, [showSubAssemblyTable]);

  const handleAddPartList = useCallback(() => {
    setShowTable(true);
  }, []);

  const handleAddAssembly = useCallback(() => {
    setShowAssemblyTable(true);
  }, []);

  const handleAddSubAssembly = useCallback(() => {
    setShowSubAssemblyTable(true);
  }, []);
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


  // const [projectName, setProjectName] = useState('');

  // ... (other state declarations)
  
  const fetchProjectDetails = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}`
      );
      const data = await response.json();
      setPartDetails(data);
      setProjectName(data.projectName || ''); // Store the project name
      setprojectType(data.projectType || ''); // Store the project name
      console.log(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [_id]);

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

  useEffect(() => {
    if (selectedPartData && selectedPartData.partName) {
      setDetailedPartData(selectedPartData);
    } else {
      setDetailedPartData({});
    }
  }, [selectedPartData]);

  const handleAutocompleteChange = (event, newValue) => {
    if (newValue) {
      const selectedPart = parts.find(
        (part) => part.partName === newValue.partName
      );
      if (selectedPart) {
        setSelectedPartData(selectedPart);
        setDetailedPartData({ ...selectedPart });
        setCostPerUnit(
          selectedPart.partsCalculations?.[0]?.AvgragecostPerUnit || ""
        );
        setTimePerUnit(
          selectedPart.partsCalculations?.[0]?.AvgragetimePerUnit || ""
        );
        setQuantity(1); // Reset quantity
        setPartId(selectedPart.id || ""); // Set the 'id' field
      } else {
        setSelectedPartData(null);
        setDetailedPartData({});
        setCostPerUnit("");
        setTimePerUnit("");
        setQuantity(0);
        setPartId("");
      }
    } else {
      setSelectedPartData(null);
      setDetailedPartData({});
      setCostPerUnit("");
      setTimePerUnit("");
      setQuantity(0);
      setPartId("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log("Handle Submit Triggered");

    const payload = {
      partName: selectedPartData.partName,
      partId,
      costPerUnit: Number(costPerUnit),
      timePerUnit: Number(timePerUnit),
      quantity: Number(quantity), // Use state value
      rmVariables: detailedPartData.rmVariables || [],
      manufacturingVariables: detailedPartData.manufacturingVariables || [],
      shipmentVariables: detailedPartData.shipmentVariables || [],
      overheadsAndProfits: detailedPartData.overheadsAndProfits || [],
    };

    console.log("Payload to be sent:", payload);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/allProjects`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error("Error from backend:", error);
        setError("Failed to add part. Please try again.");
        return;
      }

      const newPart = await response.json();
      console.log("New part added:", newPart);

      setListData((prevData) => [...prevData, newPart]);
      setModalAdd(false);
      await fetchProjectDetails(); // Refresh project details
    } catch (error) {
      console.error("Error submitting part:", error);
      setError("Failed to add part. Please try again.");
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

  const updateManufacturingVariable = (updatedVariable) => {
    setPartDetails((prevData) => {
      const updatedAllProjects = prevData.allProjects.map((project) => {
        if (project._id === updatedVariable.projectId) {
          return {
            ...project,
            manufacturingVariables: project.manufacturingVariables.map(
              (variable) => {
                if (variable._id === updatedVariable._id) {
                  return updatedVariable;
                }
                return variable;
              }
            ),
          };
        }
        return project;
      });
      return {
        ...prevData,
        allProjects: updatedAllProjects,
      };
    });
  };

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
      <div className="page-content" style={{marginTop: "-70px"}}>
  
        <Container fluid>
        

          <div className="project-header">
            {/* Left Section */}
            <div className="header-section left">
            <h2 className="project-name">PROJECT DETIALS</h2>
            <h4 className="">{projectName}</h4>
              <p className="po-id">PO ID: PO001</p>
              <p className="po-id">PO Type: {projectType}</p>
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

          <div className="button-group">
            <Button style={{color: "#9C27B0", color:"white"}} className="add-btn" onClick={handleAddPartList}>
              <i className="ri-add-line align-bottom me-1"></i> Add Part List
            </Button>
            <Button color="primary" className="add-btn" onClick={handleAddAssembly}>
              <i className="ri-add-line align-bottom me-1"></i> Add Assembly
            </Button>
            <Button color="danger" className="add-btn" onClick={handleAddSubAssembly}>
              <i className="ri-add-line align-bottom me-1"></i> Add Sub Assembly
            </Button>
          </div>
          {showTable && (
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
                          <th>Action</th>
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
                                {item.partName} ({item.Uid})
                              </td>
                              <td>
                                {item.costPerUnit !== undefined
                                  ? item.costPerUnit.toFixed(2)
                                  : "N/A"}
                              </td>
                              <td>
                                {item.timePerUnit !== undefined
                                  ? item.timePerUnit.toFixed(2)
                                  : "N/A"}
                              </td>
                              <td>
                                {item.quantity !== undefined
                                  ? item.quantity
                                  : "N/A"}
                              </td>
                              <td>
                                {(item.costPerUnit * item.quantity).toFixed(2)}
                              </td>
                              <td>
                                {(item.timePerUnit * item.quantity).toFixed(2)}
                              </td>
                              <td>🔧</td>
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
                                    <RawMaterial
                                      partName={item.partName}
                                      rmVariables={item.rmVariables || {}}
                                      projectId={_id}
                                      partId={item._id}
                                    />
                                    <Manufacturing
                                      partName={item.partName}
                                      manufacturingVariables={
                                        item.manufacturingVariables || []
                                      }
                                      projectId={_id}
                                      partId={item._id}
                                      onUpdateVariable={
                                        updateManufacturingVariable
                                      } // Pass updater function
                                    />

                                    <Shipment
                                      partName={item.partName}
                                      shipmentVariables={
                                        item.shipmentVariables || []
                                      }
                                      projectId={_id}
                                      partId={item._id}
                                    />
                                    <Overheads
                                      partName={item.partName}
                                      overheadsAndProfits={
                                        item.overheadsAndProfits
                                      }
                                    />
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
          )}

{showAssemblyTable && (
            <Row>
              <Col lg={12}>
                <Card>
                  <CardBody>
                    <h4>Assembly Table</h4>
                    <table className="project-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Cost</th>
                          <th>Quantity</th>
                          <th>Total Cost</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* ... Assembly items will go here ... */}
                      </tbody>
                    </table>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          )}

{showSubAssemblyTable && (
            <Row>
              <Col lg={12}>
                <Card>
                  <CardBody>
                    <h4>Sub Assembly Table</h4>
                    <table className="project-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Cost</th>
                          <th>Quantity</th>
                          <th>Total Cost</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* ... Sub Assembly items will go here ... */}
                      </tbody>
                    </table>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          )}

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
                    required
                  />
                )}
              />

              <div className="form-group">
                <Label for="partId" className="form-label">
                  Part ID
                </Label>
                <Input
                  className="form-control"
                  type="text"
                  id="partId"
                  value={partId}
                  onChange={(e) => setPartId(e.target.value)}
                  required
                />
              </div>

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
                  value={quantity.toString()}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    if (inputValue === "" || /^\d+$/.test(inputValue)) {
                      setQuantity(inputValue === "" ? 0 : parseInt(inputValue));
                    }
                  }}
                  required
                />
              </div>
              <UncontrolledAccordion defaultOpen="1">
                {/* Raw Materials Accordion */}
                <AccordionItem>
                  <AccordionHeader targetId="1">Raw Materials</AccordionHeader>
                  <AccordionBody
                    accordionId="1"
                    className="accordion-body-custom"
                  >
                    {detailedPartData.rmVariables?.map((rm, index) => (
                      <FormGroup key={rm._id} className="accordion-item-custom">
                        <Label className="accordion-label">{rm.name}</Label>
                        <Input
                          type="number"
                          className="accordion-input"
                          value={rm.netWeight || ""}
                          onChange={(e) =>
                            setDetailedPartData((prev) => ({
                              ...prev,
                              rmVariables: prev.rmVariables.map((item, idx) =>
                                idx === index
                                  ? { ...item, netWeight: e.target.value }
                                  : item
                              ),
                            }))
                          }
                          placeholder="Enter net weight"
                        />
                        <Input
                          type="number"
                          className="accordion-input"
                          value={rm.pricePerKg || ""}
                          onChange={(e) =>
                            setDetailedPartData((prev) => ({
                              ...prev,
                              rmVariables: prev.rmVariables.map((item, idx) =>
                                idx === index
                                  ? { ...item, pricePerKg: e.target.value }
                                  : item
                              ),
                            }))
                          }
                          placeholder="Enter price per kg"
                        />
                        <p className="accordion-total-rate">
                          Total Rate: {rm.totalRate}
                        </p>
                      </FormGroup>
                    ))}
                  </AccordionBody>
                </AccordionItem>

                {/* Manufacturing Variable Accordion */}
                <AccordionItem>
                  <AccordionHeader targetId="2">
                    Manufacturing Variable
                  </AccordionHeader>
                  <AccordionBody accordionId="2">
                    {detailedPartData.manufacturingVariables?.map(
                      (man, index) => (
                        <FormGroup
                          key={man._id}
                          className="accordion-item-custom"
                        >
                          <Label className="accordion-label">{man.name}</Label>
                          <Input
                            type="number"
                            className="accordion-input"
                            value={man.hours || ""}
                            onChange={(e) =>
                              setDetailedPartData((prev) => ({
                                ...prev,
                                manufacturingVariables:
                                  prev.manufacturingVariables.map((item, idx) =>
                                    idx === index
                                      ? { ...item, hours: e.target.value }
                                      : item
                                  ),
                              }))
                            }
                            placeholder="Enter hours"
                          />
                          <Input
                            type="number"
                            className="accordion-input"
                            value={man.hourlyRate || ""}
                            onChange={(e) =>
                              setDetailedPartData((prev) => ({
                                ...prev,
                                manufacturingVariables:
                                  prev.manufacturingVariables.map((item, idx) =>
                                    idx === index
                                      ? { ...item, hourlyRate: e.target.value }
                                      : item
                                  ),
                              }))
                            }
                            placeholder="Enter hourly rate"
                          />
                          <p className="accordion-total-rate">
                            Total Rate: {man.totalRate}
                          </p>
                        </FormGroup>
                      )
                    )}
                  </AccordionBody>
                </AccordionItem>

                {/* Shipment Variable Accordion */}
                <AccordionItem>
                  <AccordionHeader targetId="3">
                    Shipment Variable
                  </AccordionHeader>
                  <AccordionBody accordionId="3">
                    {detailedPartData.shipmentVariables?.map((ship, index) => (
                      <FormGroup
                        key={ship._id}
                        className="accordion-item-custom"
                      >
                        <Label className="accordion-label">{ship.name}</Label>
                        <Input
                          type="number"
                          className="accordion-input"
                          value={ship.hourlyRate || ""}
                          onChange={(e) =>
                            setDetailedPartData((prev) => ({
                              ...prev,
                              shipmentVariables: prev.shipmentVariables.map(
                                (item, idx) =>
                                  idx === index
                                    ? { ...item, hourlyRate: e.target.value }
                                    : item
                              ),
                            }))
                          }
                          placeholder="Enter hourly rate"
                        />
                        <p className="accordion-total-rate">
                          Total Rate: {ship.hourlyRate}
                        </p>
                      </FormGroup>
                    ))}
                  </AccordionBody>
                </AccordionItem>

                {/* Overheads and Profit Accordion */}
                <AccordionItem>
                  <AccordionHeader targetId="4">
                    Overheads and Profit
                  </AccordionHeader>
                  <AccordionBody accordionId="4">
                    {detailedPartData.overheadsAndProfits?.map(
                      (overhead, index) => (
                        <FormGroup
                          key={overhead._id}
                          className="accordion-item-custom"
                        >
                          <Label className="accordion-label">
                            {overhead.name}
                          </Label>
                          <Input
                            type="number"
                            className="accordion-input"
                            value={overhead.percentage || ""}
                            onChange={(e) =>
                              setDetailedPartData((prev) => ({
                                ...prev,
                                overheadsAndProfits:
                                  prev.overheadsAndProfits.map((item, idx) =>
                                    idx === index
                                      ? { ...item, percentage: e.target.value }
                                      : item
                                  ),
                              }))
                            }
                            placeholder="Enter percentage"
                          />
                          <p className="accordion-total-rate">
                            Total Rate: {overhead.totalRate}
                          </p>
                        </FormGroup>
                      )
                    )}
                  </AccordionBody>
                </AccordionItem>
              </UncontrolledAccordion>

              <Button
                type="submit"
                color="primary"
                disabled={
                  !selectedPartData || !costPerUnit || !timePerUnit || !quantity
                }
              >
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
