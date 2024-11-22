// import React, { useCallback, useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { Card, CardBody, Col, CardHeader, Button, Row ,  Modal,
//   ModalBody,
//   ModalFooter,
//   ModalHeader,} from "reactstrap";

// const PartsList = () => {
//   const { _id } = useParams();
//   const [loading, setLoading] = useState(true);
//   const [modal_add_machine, setmodal_add_machine] = useState(false)
//   const [error, setError] = useState(null);
//   const [partDetails, setPartDetails] = useState([]); // Local state to store project list
//   const [manufacturingVariables, setManufacturingVariables] = useState([]);
//   const [partsData, setPartsData] = useState({});
//   const [expandedRows, setExpandedRows] = useState({});
//   const [parts, setParts] = useState([]);
//   const [machinesTBU, setMachinesTBU] = useState({});

//   const tog_add_machine = () => {
//     setmodal_add_machine(!modal_add_machine)
//   };

//   const fetchProjectDetails = useCallback(async () => {
//     try {
//       const response = await fetch(
//         `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}`
//       );
//       const data = await response.json();
//       setPartDetails(data);
//     } catch (error) {
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [_id]);

//   useEffect(() => {
//     fetchProjectDetails();
//   }, [fetchProjectDetails]);

//   useEffect(() => {
//     const fetchParts = async () => {
//       const response = await fetch(
//         `${process.env.REACT_APP_BASE_URL}/api/parts`
//       );
//       const data = await response.json();
//       setParts(data);
//     };

//     const fetchManufacturingVariables = async () => {
//       const response = await fetch(
//         `${process.env.REACT_APP_BASE_URL}/api/manufacturing`
//       );
//       const data = await response.json();
//       setManufacturingVariables(data);

//       setMachinesTBU((prev) => ({
//         ...prev,
//         ...data.reduce((acc, item) => ({ ...acc, [item.name]: 6 }), {}),
//       }));
//     };

//     fetchParts();
//     fetchManufacturingVariables();
//   }, []);

//   const processPartsMap = parts.reduce((acc, part) => {
//     const matchingPart = partDetails.allProjects?.find(
//       (item) => item.partName === part.partName
//     );

//     if (matchingPart) {
//       part.manufacturingVariables.forEach((variable) => {
//         if (!acc[variable.name]) acc[variable.name] = [];

//         const totalHours = matchingPart.quantity * variable.hours;

//         acc[variable.name].push({
//           partName: part.partName,
//           hours: variable.hours,
//           quantity: matchingPart.quantity,
//           totalHours: totalHours,
//         });
//       });
//     }

//     return acc;
//   }, {});

//   return (
//     <div>
//       <Row lg={12}>
//         <Col>
//           <Card>
//             <CardHeader>
//               <h4 className="card-title mb-0">Parts List</h4>
//               <div className="d-flex justify-content-sm-start mt-2">
//                 <div className="search-box">
//                   <input
//                     type="text"
//                     className="form-control"
//                     placeholder="Search..."
//                   />
//                   <i className="ri-search-line search-icon"></i>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardBody>
//               <div
//                 className="table-responsive table-card mb-1"
//                 style={{
//                   maxHeight: "300px", // Set a fixed height
//                   overflowY: "auto", // Enable vertical scrolling
//                 }}
//               >
//                 <table className="table align-middle table-nowrap">
//                   <thead
//                     className="table-light"
//                     style={{ position: "sticky", top: 0, zIndex: 1 }}
//                   >
//                     <tr>
//                       <th>Part Name</th>
//                       <th>Required</th>
//                       <th>Produced</th>
//                       <th>Daily Production</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {!loading &&
//                     !error &&
//                     partDetails.allProjects?.length > 0 ? (
//                       partDetails.allProjects.map((item) => (
//                         <tr key={item._id}>
//                           <td>{item.partName || "N/A"}</td>
//                           <td>{item.quantity || 0}</td>
//                           <td>0</td>
//                           <td>
//                             <Button>Update</Button>
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan="4" className="text-center">
//                           {loading
//                             ? "Loading..."
//                             : error
//                             ? error
//                             : "No parts available"}
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </CardBody>
//           </Card>
//         </Col>

//         <Col lg={4}>
//           <Card>
//             <CardHeader>
//               <h4 className="card-title mb-0">Machine Allocation</h4>
//               <div className="d-flex justify-content-sm-start mt-2">
//                 <div className="search-box ">
//                   <input
//                     type="text"
//                     className="form-control"
//                     placeholder="Filter Machines..."
//                   />
//                   <i className="ri-search-line search-icon"></i>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardBody>
//               <div className="table-responsive table-card mb-1">
//                 <table className="table align-middle table-nowrap">
//                   <thead className="table-light">
//                     <tr>
//                       <th>Process</th>
//                       <th>Assign</th>
//                       {/* <th>Select</th> */}
//                     </tr>
//                   </thead>
//                   <tbody>
// {manufacturingVariables
//   .filter(
//     (variable) => processPartsMap[variable.name]?.length > 0
//   )
//   .map((variable) => (
//     <React.Fragment key={variable._id}>
//       <tr>
//         <td
//           onClick={() => handleRowClick(variable.name)}
//           style={{ cursor: "pointer" }}
//         >
//           {variable.name}
//         </td>
//         <td><Button onClick={tog_add_machine} className="bg-success">Assign</Button></td>
//       </tr>
//     </React.Fragment>
//   ))}
//                   </tbody>
//                 </table>
//               </div>
//             </CardBody>
//           </Card>
//         </Col>

//         <Col lg={4}>
//           <Card>
//             <CardHeader>
//               <h4 className="card-title mb-0">Operator Assignment</h4>
//               <div className="d-flex justify-content-sm-start mt-2">
//                 <div className="search-box ">
//                   <input
//                     type="text"
//                     className="form-control"
//                     placeholder="Filter Operators..."
//                   />
//                   <i className="ri-search-line search-icon"></i>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardBody>
//               <div className="table-responsive table-card mb-1">
//                 <table className="table align-middle table-nowrap">
//                   <thead className="table-light">
//                     <tr>
//                       <th>Name</th>
//                       <th>Person ID</th>
//                       <th>Skill Set</th>
//                       <th>Assign</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     <tr>
//                       <td>Jhon Doe</td>
//                       <td>P001</td>
//                       <td>VMC Local, Lathe</td>
//                       <td>
//                         <td>
//                           <Button className="bg-info">Assign</Button>
//                         </td>
//                       </td>
//                     </tr>
//                     <tr>
//                       <td>Jane Smith</td>
//                       <td>P002</td>
//                       <td>Milling, Lathe</td>
//                       <td>
//                         <td>
//                           <Button className="bg-info">Assign</Button>
//                         </td>
//                       </td>
//                     </tr>
//                     <tr>
//                       <td>Bob Johnson</td>
//                       <td>P003</td>
//                       <td>VMC Local, Milling</td>
//                       <td>
//                         <td>
//                           <Button className="bg-info">Assign</Button>
//                         </td>
//                       </td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//             </CardBody>
//           </Card>
//         </Col>
//       </Row>
//       <Modal isOpen={modal_add_machine} toggle={tog_add_machine}>
//         <ModalHeader toggle={tog_add_machine}>Add Machine Allocation</ModalHeader>
//         <ModalBody>
//           <form >
//             <div className="mb-3">
//               <label htmlFor="partname" className="form-label">
//                 Part Name
//               </label>
//               <input type="text" className="form-control" placeholder="Part Name" name="partname" />
//               </div>
//               <div className="mb-3">
//               <label htmlFor="machining-hours" className="form-label">
//                 Machining Hours
//               </label>
//               <input type="text" className="form-control" placeholder="Machining Hours" name="machining-hours" />
//               </div>
//             <div className="mb-3">
//               <label htmlFor="netWeight" className="form-label">
//                  select
//               </label>
//               <select className="form-select" aria-label=".form-select-sm example">
//                     <option >Select</option>
//                     <option defaultValue="1">Lathe 01</option>
//                     <option defaultValue="2">Lathe 02</option>
//                     <option defaultValue="3">Lathe 03</option>
//                     <option defaultValue="4">Lathe 04</option>
//                     <option defaultValue="5">Lathe 05</option>
//               </select>
//             </div>
//             <ModalFooter>
//               <Button type="submit" className="bg-success">
//                 Add
//               </Button>
//               <Button type="button" color="secondary" >
//                 Cancel
//               </Button>
//             </ModalFooter>
//           </form>
//         </ModalBody>
//       </Modal>
//     </div>

//   );
// };

// export default PartsList;

// import React, { useCallback, useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { Card, CardBody, Col, CardHeader, Button, Row ,  Modal,
//   ModalBody,
//   ModalFooter,
//   ModalHeader,} from "reactstrap";

// const PartsList = () => {
// const { _id } = useParams();
// const [loading, setLoading] = useState(true);
// const [modal_add_machine, setmodal_add_machine] = useState(false)
// const [error, setError] = useState(null);
// const [partDetails, setPartDetails] = useState([]); // Local state to store project list
// const [manufacturingVariables, setManufacturingVariables] = useState([]);
// const [partsData, setPartsData] = useState({});
// const [expandedRows, setExpandedRows] = useState({});
// const [parts, setParts] = useState([]);
// const [machinesTBU, setMachinesTBU] = useState({});

//   const tog_add_machine = () => {
//     setmodal_add_machine(!modal_add_machine)
//   };

// const fetchProjectDetails = useCallback(async () => {
//   try {
//     const response = await fetch(
//       `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}`
//     );
//     const data = await response.json();
//     setPartDetails(data);
//   } catch (error) {
//     setError(error.message);
//   } finally {
//     setLoading(false);
//   }
// }, [_id]);

// useEffect(() => {
//   fetchProjectDetails();
// }, [fetchProjectDetails]);

// useEffect(() => {
//   const fetchParts = async () => {
//     const response = await fetch(
//       `${process.env.REACT_APP_BASE_URL}/api/parts`
//     );
//     const data = await response.json();
//     setParts(data);
//   };

//   const fetchManufacturingVariables = async () => {
//     const response = await fetch(
//       `${process.env.REACT_APP_BASE_URL}/api/manufacturing`
//     );
//     const data = await response.json();
//     setManufacturingVariables(data);

//     setMachinesTBU((prev) => ({
//       ...prev,
//       ...data.reduce((acc, item) => ({ ...acc, [item.name]: 6 }), {}),
//     }));
//   };

//   fetchParts();
//   fetchManufacturingVariables();
// }, []);

// const processPartsMap = parts.reduce((acc, part) => {
//   const matchingPart = partDetails.allProjects?.find(
//     (item) => item.partName === part.partName
//   );

//   if (matchingPart) {
//     part.manufacturingVariables.forEach((variable) => {
//       if (!acc[variable.name]) acc[variable.name] = [];

//       const totalHours = matchingPart.quantity * variable.hours;

//       acc[variable.name].push({
//         partName: part.partName,
//         hours: variable.hours,
//         quantity: matchingPart.quantity,
//         totalHours: totalHours,
//       });
//     });
//   }

//   return acc;
// }, {});

//   return (
//     <div className="bg-white">
//       <Row lg={12} className="mt-2 p-2">
//         <Col>
//             <CardBody>
//                <div className="table-responsive table-card mb-1 p-2">
//                  <table className="table align-middle table-nowrap">
//                    <thead className="table-light">
//                      <tr>
//                        <th>Name</th>
//                        <th>Drawing Number</th>
//                        <th>Quantity</th>
//                        <th>Cost per Unit</th>
//                        <th>Total Cost</th>
//                        <th>Hours per Unit</th>
//                        <th>Total Hours</th>
//                        <th>Action</th>
//                      </tr>
//                    </thead>
//                    <tbody>
//                     {!loading &&
//                     !error &&
//                     partDetails.allProjects?.length > 0 ? (
//                       partDetails.allProjects.map((item) => (
//                         <tr key={item._id}>
//                           <td>{item.partName || "N/A"}</td>
//                           <td>0</td>
//                           <td>{item.quantity || 0}</td>
//                           <td>0</td>
//                           <td>0</td>
//                           <td>0</td>
//                           <td>0</td>
//                           <td><Button>Update</Button></td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan="4" className="text-center">
//                           {loading
//                             ? "Loading..."
//                             : error
//                             ? error
//                             : "No parts available"}
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                  </table>
//                </div>
//              </CardBody>

//         </Col>
//       </Row>

//     </div>

//   );
// };

// export default PartsList;

// <Modal isOpen={modal_add_machine} toggle={tog_add_machine}>
// <ModalHeader toggle={tog_add_machine}>Add Machine Allocation</ModalHeader>
// <ModalBody>
//   <form >
//     <div className="mb-3">
//       <label htmlFor="partname" className="form-label">
//         Part Name
//       </label>
//       <input type="text" className="form-control" placeholder="Part Name" name="partname" />
//       </div>
//       <div className="mb-3">
//       <label htmlFor="machining-hours" className="form-label">
//         Machining Hours
//       </label>
//       <input type="text" className="form-control" placeholder="Machining Hours" name="machining-hours" />
//       </div>
//     <div className="mb-3">
//       <label htmlFor="netWeight" className="form-label">
//          select
//       </label>
//       <select className="form-select" aria-label=".form-select-sm example">
//             <option >Select</option>
//             <option defaultValue="1">Lathe 01</option>
//             <option defaultValue="2">Lathe 02</option>
//             <option defaultValue="3">Lathe 03</option>
//             <option defaultValue="4">Lathe 04</option>
//             <option defaultValue="5">Lathe 05</option>
//       </select>
//     </div>
//     <ModalFooter>
//       <Button type="submit" className="bg-success">
//         Add
//       </Button>
//       <Button type="button" color="secondary" >
//         Cancel
//       </Button>
//     </ModalFooter>
//   </form>
// </ModalBody>
// </Modal>

import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CardBody,
  Col,
  Button,
  Row,
  Collapse,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import { FiSettings } from "react-icons/fi";

const PartsList = () => {
  const { _id } = useParams();
  const [loading, setLoading] = useState(true);
  const [modal_add_machine, setmodal_add_machine] = useState(false);
  const [error, setError] = useState(null);
  const [partDetails, setPartDetails] = useState([]); // Local state to store project list
  const [manufacturingVariables, setManufacturingVariables] = useState([]);
  const [partsData, setPartsData] = useState({});
  const [expandedRows, setExpandedRows] = useState({});
  const [parts, setParts] = useState([]);
  const [machinesTBU, setMachinesTBU] = useState({});
  const [selectedMachines, setSelectedMachines] = useState({}); // State to store selected machines
  const [allocationStatus, setAllocationStatus] = useState({}); // State for tracking allocation per process

  const handleSelectChange = (event, variableName) => {
    setSelectedMachines((prev) => ({
      ...prev,
      [variableName]: event.target.value, // Update selected machine for a specific process
    }));
  };

  const handleAllocateClick = (variableName) => {
    setAllocationStatus((prev) => ({
      ...prev,
      [variableName]: true, // Mark this process as allocated
    }));
  };

  const fetchProjectDetails = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}`
      );
      const data = await response.json();
      setPartDetails(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [_id]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

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
          hourlyRate: variable.hourlyRate, // Include hourlyRate here
        });
      });
    }

    return acc;
  }, {});

  const toggleRow = (partName) => {
    setExpandedRows((prev) => ({
      ...prev,
      [partName]: !prev[partName],
    }));
  };

  return (
    <div className="bg-light" style={{ padding: "20px", borderRadius: "10px" }}>
      <Row lg={12} className="mt-3">
        <Col>
          <CardBody>
            <div className="table-responsive table-card mb-4">
              <table className="table table-hover align-middle">
                <thead style={{ backgroundColor: "#f1f5f9", color: "#334155" }}>
                  <tr>
                    <th>Name</th>
                    <th>Drawing Number</th>
                    <th>Quantity</th>
                    <th>Cost per Unit</th>
                    <th>Total Cost</th>
                    <th>Hours per Unit</th>
                    <th>Total Hours</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && !error && partDetails.allProjects?.length > 0 ? (
                    partDetails.allProjects.map((item) => (
                      <React.Fragment key={item._id}>
                        {/* Main Row */}
                        <tr
                          style={{
                            fontWeight: "bold",
                            color: "#333",
                            backgroundColor: "#eaf4ff",
                          }}
                        >
                          <td
                            style={{ cursor: "pointer", color: "#2563eb" }}
                            onClick={() => toggleRow(item.partName)}
                          >
                            {item.partName || "N/A"}
                          </td>
                          <td>0</td>
                          <td>{item.quantity || 0}</td>
                          <td>{item.costPerUnit.toFixed(2)}</td>
                          <td>{item.quantity * item.costPerUnit}</td>
                          <td>{item.timePerUnit.toFixed(2)}</td>
                          <td>{item.quantity * item.timePerUnit}</td>
                          <td>
                            <Button
                              style={{
                                backgroundColor: "#10b981",
                                border: "none",
                                color: "#fff",
                              }}
                            >
                              Update
                            </Button>
                          </td>
                        </tr>
                        {/* Expandable Row */}
                        <tr>
                          <td colSpan="8" className="p-0">
                            <Collapse isOpen={!!expandedRows[item.partName]}>
                              <div
                                className="p-4 border-top"
                                style={{
                                  backgroundColor: "#f8f9fa",
                                  borderRadius: "5px",
                                  boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.1)",
                                }}
                              >
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
                                  {item.partName} Processes
                                </h5>
                                {manufacturingVariables
                                  .filter(
                                    (variable) =>
                                      processPartsMap[variable.name]?.length > 0
                                  )
                                  .map((variable) => (
                                    <React.Fragment key={variable._id}>
                                      <div
                                        className="p-4 rounded mb-4"
                                        style={{
                                          backgroundColor: "#ffffff",
                                          boxShadow:
                                            "0px 4px 8px rgba(0, 0, 0, 0.1)",
                                        }}
                                      >
                                        <div className="mb-3">
                                          <div className="d-flex align-items-center justify-content-between">
                                            <h6
                                              style={{
                                                fontWeight: "bold",
                                                color: "#475569",
                                              }}
                                            >
                                              {variable.name}
                                            </h6>
                                            <p
                                              className="mb-0"
                                              style={{
                                                fontWeight: "600",
                                                color: "#10b981",
                                              }}
                                            >
                                              2400 ₹
                                            </p>
                                          </div>
                                          <p>
                                            Estimated time:{" "}
                                            {processPartsMap[variable.name]
                                              .map(
                                                (part) =>
                                                  part.hours * item.quantity
                                              )
                                              .join(", ")}{" "}
                                            hours
                                          </p>
                                          <p>
                                            Rate: ₹{" "}
                                            {processPartsMap[variable.name]
                                              .map(
                                                (part) =>
                                                  part.hourlyRate *
                                                  item.quantity
                                              )
                                              .join(", ")}
                                          </p>

                                          <FormGroup>
                                            <Label
                                              for="assignMachine"
                                              style={{
                                                fontWeight: "bold",
                                                color: "#475569",
                                              }}
                                            >
                                              Assign Machine
                                            </Label>
                                            <select
                                              className="form-select"
                                              onChange={(e) =>
                                                handleSelectChange(
                                                  e,
                                                  variable.name
                                                )
                                              }
                                              value={
                                                selectedMachines[
                                                  variable.name
                                                ] || ""
                                              }
                                              style={{ borderColor: "#d1d5db" }}
                                            >
                                              <option value="">
                                                Select a Machine
                                              </option>
                                              <option value="Machine A">
                                                Machine A
                                              </option>
                                              <option value="Machine B">
                                                Machine B
                                              </option>
                                              <option value="Machine C">
                                                Machine C
                                              </option>
                                            </select>
                                            {selectedMachines[
                                              variable.name
                                            ] && (
                                              <div className="d-flex align-items-center justify-content-between mt-3">
                                                <h6
                                                  className="mb-0"
                                                  style={{
                                                    fontWeight: "bold",
                                                    color: "#475569",
                                                  }}
                                                >
                                                  {
                                                    selectedMachines[
                                                      variable.name
                                                    ]
                                                  }
                                                </h6>
                                                <Button
                                                  className={`${
                                                    allocationStatus[
                                                      variable.name
                                                    ]
                                                      ? "bg-success text-white border-0"
                                                      : "btn-outline-success"
                                                  }`}
                                                  onClick={() =>
                                                    handleAllocateClick(
                                                      variable.name
                                                    )
                                                  }
                                                  disabled={
                                                    allocationStatus[
                                                      variable.name
                                                    ]
                                                  }
                                                >
                                                  {allocationStatus[
                                                    variable.name
                                                  ]
                                                    ? "Allocated"
                                                    : "Allocate"}
                                                </Button>
                                              </div>
                                            )}
                                          </FormGroup>

                                          <FormGroup>
                                            <Label
                                              for="assignMachine"
                                              style={{
                                                fontWeight: "bold",
                                                color: "#475569",
                                              }}
                                            >
                                              Assign Operator
                                            </Label>
                                            <select
                                              id="assignOperator"
                                              className="form-select"
                                              style={{ borderColor: "#d1d5db" }}
                                            >
                                              <option value="">
                                                Select an Operator
                                              </option>
                                              <option value="Operator 1">
                                                Operator 1
                                              </option>
                                              <option value="Operator 2">
                                                Operator 2
                                              </option>
                                              <option value="Operator 3">
                                                Operator 3
                                              </option>
                                              <option value="Operator 4">
                                                Operator 4
                                              </option>
                                              <option value="Operator 5">
                                                Operator 5
                                              </option>
                                              <option value="Operator 6">
                                                Operator 6
                                              </option>
                                              <option value="Operator 7">
                                                Operator 7
                                              </option>
                                              <option value="Operator 8">
                                                Operator 8
                                              </option>
                                              <option value="Operator 9">
                                                Operator 9
                                              </option>
                                              <option value="Operator 10">
                                                Operator 10
                                              </option>
                                            </select>
                                          </FormGroup>
                                        </div>
                                      </div>
                                    </React.Fragment>
                                  ))}
                              </div>
                            </Collapse>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">
                        {loading
                          ? "Loading..."
                          : error
                          ? error
                          : "No parts available"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Col>
      </Row>
    </div>
  );
};

export default PartsList;
