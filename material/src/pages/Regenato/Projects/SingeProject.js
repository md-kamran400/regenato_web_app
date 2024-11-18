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

        // Autofill input fields
        setCostPerUnit(calculations.AvgragecostPerUnit || "");
        setTimePerUnit(calculations.AvgragetimePerUnit || "");
      }
    } else {
      setSelectedPartData(null);
      setCostPerUnit("");
      setTimePerUnit("");
    }
  };

  const partTotals = listData.reduce((acc, part) => {
    if (!part.id) return acc; // Skip if no ID

    const rmVariables = part.rmVariables || [];
    const manufacturingVariables = part.manufacturingVariables || [];
    const shipmentVariables = part.shipmentVariables || [];
    const overheadsAndProfits = part.overheadsAndProfits || [];

    const rmTotal = rmVariables.reduce(
      (sum, item) => sum + Number(item.totalRate || 0),
      0
    );
    const manufacturingTotal = manufacturingVariables.reduce(
      (sum, item) => sum + Number(item.totalRate || 0),
      0
    );
    const shipmentTotal = shipmentVariables.reduce(
      (sum, item) => sum + Number(item.hourlyRate || 0),
      0
    );
    const overheadsTotal = overheadsAndProfits.reduce(
      (sum, item) => sum + Number(item.totalRate || 0),
      0
    );

    acc[part.id] = {
      costPerUnitAvg:
        rmTotal + manufacturingTotal + shipmentTotal + overheadsTotal,
    };

    return acc;
  }, {});

  console.log("Part Totals:", partTotals);

  // const handleSubmit = async (event) => {
  //   event.preventDefault();
  //   if (selectedPartData) {
  //     const payload = {
  //       partName: selectedPartData.partName,
  //       costPerUnit: selectedPartData.costPerUnit,
  //       timePerUnit: selectedPartData.timePerUnit,
  //       quantity: quantity,
  //     };

  //     try {
  //       const response = await fetch(
  //         `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/allProjects`,
  //         {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify(payload),
  //         }
  //       );

  //       if (!response.ok) throw new Error("Failed to submit part data");

  //       await fetchProjectDetails();
  //       await fetchData();
  //       const newPart = await response.json();
  //       setListData((prevData) => [...prevData, newPart]);
  //       setModalAdd(false);
  //     } catch (error) {
  //       setError(error.message);
  //     }
  //   }
  // };
  // new function

  const updateTableDisplay = (newPart) => {
    setPartsData((prevData) => {
      const updatedData = prevData.map((item) =>
        item._id === newPart._id
          ? { ...item, processes: newPart.processes }
          : item
      );
      return updatedData;
    });
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
    const availableMachineHoursPerMonth =
      (machineHours[process] || 0) *
      (machineTbu[process] || 0) *
      (daysToWork[process] || 0);

    // Update the calculated values state for the specific process
    setCalculatedValues((prev) => ({
      ...prev,
      [process]: availableMachineHoursPerMonth,
    }));
  };

  // Function to calculate months required to complete each process
  const calculateMonthsRequired = (requiredHours, availableHours) => {
    if (availableHours <= 0) return 0;
    return (requiredHours / availableHours).toFixed(2);
  };

  // Toggle function for expanding/collapsing the row
  const handleRowClickParts = (rowId) => {
    setExpandedRowId(expandedRowId === rowId ? null : rowId);
  };

  console.log(
    "Is partsData.rmVariables an array:",
    Array.isArray(partsData.rmVariables)
  );

  return (
    <React.Fragment>
      <div className="page-content" style={{marginTop: "-60px"}}>
        <Container fluid >
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
                              style={{ cursor: "pointer" }}
                              onClick={() => handleRowClickParts(item._id)}
                            >
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

                            {expandedRowId === item._id && (
                              <React.Fragment>
                                {/* RM Variables */}
                                <tr>
                                  <td colSpan={8}>
                                    <div className="table-responsive table-card mt-3 mb-1">
                                      <h5>Raw Materials</h5>
                                      <table className="table align-middle table-nowrap">
                                        <thead className="table-light">
                                          <tr>
                                            <th>Name</th>
                                            <th>Net Weight</th>
                                            <th>Price Per Kg</th>
                                            <th>Total Rate</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {(
                                            item.processes[0]?.rmVariables || []
                                          ).map((rm) => (
                                            <tr key={rm.name}>
                                              <td>{rm.name}</td>
                                              <td>{rm.netWeight}</td>
                                              <td>{rm.pricePerKg}</td>
                                              <td>{rm.totalRate}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </td>
                                </tr>

                                {/* Manufacturing Variables */}
                                <tr>
                                  <td colSpan={8}>
                                    <div className="table-responsive table-card mt-3 mb-1">
                                      <h5>Manufacturing Variables</h5>
                                      <table className="table align-middle table-nowrap">
                                        <thead className="table-light">
                                          <tr>
                                            <th>Name</th>
                                            <th>Hours</th>
                                            <th>Hourly Rate</th>
                                            <th>Total Rate</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {(
                                            item.processes[0]
                                              ?.manufacturingVariables || []
                                          ).map((manufacturing) => (
                                            <tr key={manufacturing.name}>
                                              <td>{manufacturing.name}</td>
                                              <td>{manufacturing.hours}</td>
                                              <td>
                                                {manufacturing.hourlyRate}
                                              </td>
                                              <td>{manufacturing.totalRate}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </td>
                                </tr>

                                {/* Shipment Variables */}
                                <tr>
                                  <td colSpan={8}>
                                    <div className="table-responsive table-card mt-3 mb-1">
                                      <h5>Shipment Variables</h5>
                                      <table className="table align-middle table-nowrap">
                                        <thead className="table-light">
                                          <tr>
                                            <th>Name</th>
                                            <th>Cost</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {(
                                            item.processes[0]
                                              ?.shipmentVariables || []
                                          ).map((shipment) => (
                                            <tr key={shipment.name}>
                                              <td>{shipment.name}</td>
                                              <td>{shipment.cost}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </td>
                                </tr>

                                {/* Overheads And Profits */}
                                <tr>
                                  <td colSpan={8}>
                                    <div className="table-responsive table-card mt-3 mb-1">
                                      <h5>Overheads And Profits</h5>
                                      <table className="table align-middle table-nowrap">
                                        <thead className="table-light">
                                          <tr>
                                            <th>Name</th>
                                            <th>Percentage</th>
                                            <th>Total Rate</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {(
                                            item.processes[0]
                                              ?.overheadsAndProfits || []
                                          ).map((overhead) => (
                                            <tr key={overhead.name}>
                                              <td>{overhead.name}</td>
                                              <td>{overhead.percentage}%</td>
                                              <td>{overhead.totalRate}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </td>
                                </tr>
                              </React.Fragment>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="table-responsive table-card mt-3 mb-1">
                    <table className="table align-middle table-nowrap">
                      <thead className="table-light">
                        <tr>
                          <th>Process Breakdown</th>
                          <th>Required Hours</th>
                          <th>Available Hours</th>
                          <th>Machines Used</th>
                          <th>Working Days</th>
                          <th>Available Hours</th>
                          <th>Months Required</th>
                        </tr>
                      </thead>
                      <tbody>
                        {manufacturingVariables
                          .filter(
                            (variable) =>
                              processPartsMap[variable.name]?.length > 0
                          )
                          .map((variable) => (
                            <React.Fragment key={variable._id}>
                              <tr>
                                <td
                                  onClick={() => handleRowClick(variable.name)}
                                  style={{ cursor: "pointer" }}
                                >
                                  {variable.name}
                                </td>
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
                                    value={
                                      inputs.machineHours[variable.name] || ""
                                    }
                                    onChange={(e) =>
                                      handleInputChange(
                                        variable.name,
                                        "machineHours",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <Input
                                    type="number"
                                    value={
                                      inputs.machineTbu[variable.name] || ""
                                    }
                                    onChange={(e) =>
                                      handleInputChange(
                                        variable.name,
                                        "machineTbu",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <Input
                                    type="number"
                                    value={
                                      inputs.daysToWork[variable.name] || ""
                                    }
                                    onChange={(e) =>
                                      handleInputChange(
                                        variable.name,
                                        "daysToWork",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td>{calculatedValues[variable.name] || 0}</td>
                                <td>
                                  {calculateMonthsRequired(
                                    processPartsMap[variable.name]?.reduce(
                                      (total, part) => total + part.totalHours,
                                      0
                                    ),
                                    calculatedValues[variable.name]
                                  )}
                                </td>
                                <td>
                                  <Button
                                    color="success"
                                    onClick={() => handleSave(variable.name)}
                                  >
                                    Save
                                  </Button>
                                </td>
                              </tr>
                              {expandedRows[variable.name] && (
                                <tr>
                                  <td colSpan={8}>
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
                                                <td>
                                                  {part.totalHours.toFixed(2)}
                                                </td>
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

            <Col lg={12}>
              <Card>
                <CardHeader>
                  <h4 className="card-title mb-0">
                    Advanced Timeline (Multiple Range)
                  </h4>
                </CardHeader>
                <CardBody>
                  <AdvanceTimeLine dataColors='["--vz-primary", "--vz-success", "--vz-warning"]' />
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

              <div className="mb-3">
                <Label for="costPerUnit" className="form-label">
                  Cost Per Unit
                </Label>
                <Input
                  className="form-control"
                  type="number"
                  id="costPerUnit"
                  value={costPerUnit}
                  onChange={(e) => setCostPerUnit(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <Label for="timePerUnit" className="form-label">
                  Time Per Unit
                </Label>
                <Input
                  className="form-control"
                  type="number"
                  id="timePerUnit"
                  value={timePerUnit}
                  onChange={(e) => setTimePerUnit(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
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
