// import React, { useEffect, useState } from "react";
// import { MdOutlineDelete } from "react-icons/md";
// import {
//   Modal,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   Button,
//   Table,
//   Input,
//   Row,
//   Col,
// } from "reactstrap";

// const AllocationPlanningModal = ({
//   isOpen,
//   toggle,
//   projectName,
//   columnName,
//   name,
//   calculatedHours,
//   columnValue,
//   categoryId,
// }) => {
//   const processid = categoryId || "";
//   const initialPlannedQuantity = parseInt(columnValue);
//   const [manufacturingVariablesid, setManufacturingVariablesId] = useState([]);
//   const [rows, setRows] = useState([
//     {
//       plannedQuantity: 1,
//       startDate: "",
//       endDate: "",
//       machineId: "",
//       shift: "Shift A",
//       plannedTime: "02h",
//     },
//   ]);
//   const [remainingQuantity, setRemainingQuantity] = useState(
//     initialPlannedQuantity
//   );
//   console.log(processid);

//   useEffect(() => {
//     const fetchManufacturingVariables = async () => {
//       try {
//         const response = await fetch(
//           `http://localhost:4040/api/manufacturing/category/${processid}`
//         );
//         const data = await response.json();

//         if (response.ok) {
//           setManufacturingVariablesId(data.subCategories);
//         } else {
//           console.error("Failed to fetch subcategories");
//         }
//       } catch (err) {
//         console.error("Error fetching data");
//       }
//     };

//     fetchManufacturingVariables();
//   }, [processid]);
//   console.log(manufacturingVariablesid);

//   const addRow = () => {
//     setRows([
//       ...rows,
//       {
//         plannedQuantity: 1,
//         startDate: "",
//         endDate: "",
//         machineId: "",
//         shift: "Shift A",
//         plannedTime: "02h",
//       },
//     ]);
//   };

//   const updateRow = (index, field, value) => {
//     const updatedRows = [...rows];
//     updatedRows[index][field] = value;
//     setRows(updatedRows);

//     if (field === "plannedQuantity") {
//       const totalPlannedQuantity = updatedRows.reduce(
//         (sum, row) => sum + parseInt(row.plannedQuantity || 0),
//         0
//       );
//       setRemainingQuantity(initialPlannedQuantity - totalPlannedQuantity);
//     }
//   };

//   const isAllocationComplete = remainingQuantity === 0;

//   const sectionTitleStyle = {
//     fontSize: "1.1rem",
//     fontWeight: "600",
//     color: "#212529",
//     marginBottom: "1rem",
//   };

//   const labelStyle = {
//     fontSize: "0.9rem",
//     color: "#495057",
//     marginBottom: "0.3rem",
//     display: "block",
//   };

//   const valueStyle = {
//     fontSize: "0.9rem",
//     fontWeight: "600",
//     color: "#343a40",
//   };

//   return (
//     <Modal
//       isOpen={isOpen}
//       toggle={toggle}
//       style={{ maxWidth: "90vw", width: "90%" }}
//     >
//       <ModalHeader toggle={toggle}>Allocation Planning - {name}</ModalHeader>
//       <ModalBody>
//         <Row className="mb-4">
//           <Col md="6">
//             <span style={labelStyle}>Project Name:</span>
//             <span style={valueStyle}>Manufacturing Allocation</span>
//           </Col>
//           <Col md="6">
//             <span style={labelStyle}>Process Name:</span>
//             <span style={valueStyle}>
//               {columnName && columnName !== ""
//                 ? columnName.replace(/"/g, "") // Remove quotes if any
//                 : "N/A"}
//             </span>
//           </Col>
//         </Row>

//         <Row className="mb-4">
//           <Col>
//             <span style={labelStyle}>Planned Quantity:</span>
//             <span style={valueStyle}>{initialPlannedQuantity}</span>
//           </Col>
//           <Col>
//             <span style={labelStyle}>Remaining Quantity:</span>
//             <span style={valueStyle}>
//               {remainingQuantity ||
//                 (remainingQuantity === 0 ? 0 : initialPlannedQuantity)}
//             </span>
//           </Col>
//         </Row>

//         <Row className="d-flex justify-content-between align-items-center mb-3">
//           <Col>
//             <span style={sectionTitleStyle}>Machine-wise Allocation</span>
//           </Col>
//           <Col className="text-end">
//             <Button color="primary" onClick={addRow} className="mt-2">
//               Add Row
//             </Button>
//           </Col>
//         </Row>

//         <Table bordered responsive>
//           <thead>
//             <tr>
//               <th>Part Type</th>
//               <th>Planned Quantity</th>
//               <th style={{ width: "15%" }}>Start Date</th>
//               <th style={{ width: "15%" }}>End Date</th>
//               <th style={{ width: "15%" }}>Machine ID</th>
//               <th style={{ width: "15%" }}>Number of Shift</th>
//               <th style={{ width: "15%" }}>Planned Qty Time</th>
//               <th style={{ width: "15%" }}>Operator</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map((row, index) => (
//               <tr key={index}>
//                 <td>
//                   <Input
//                     type="select"
//                     style={{ padding: "10px", fontSize: "14px", width: "8rem" }}
//                     value={row.shift}
//                     onChange={(e) => updateRow(index, "shift", e.target.value)}
//                   >
//                     <option>Make</option>
//                     <option>Purchase</option>
//                   </Input>
//                 </td>
//                 <td>
//                   <Input
//                     type="number"
//                     value={row.plannedQuantity}
//                     onChange={(e) =>
//                       updateRow(index, "plannedQuantity", e.target.value)
//                     }
//                   />
//                 </td>
//                 <td>
//                   <Input
//                     type="date"
//                     style={{ padding: "10px", fontSize: "14px", width: "8rem" }}
//                     value={row.startDate}
//                     onChange={(e) =>
//                       updateRow(index, "startDate", e.target.value)
//                     }
//                   />
//                 </td>
//                 <td>
//                   <Input
//                     type="date"
//                     style={{ padding: "10px", fontSize: "14px", width: "8rem" }}
//                     value={row.endDate}
//                     onChange={(e) =>
//                       updateRow(index, "endDate", e.target.value)
//                     }
//                   />
//                 </td>
//                 <td>
//                   <Input
//                     type="select"
//                     style={{ padding: "10px", fontSize: "14px", width: "8rem" }}
//                     value={row.machineId}
//                     onChange={(e) =>
//                       updateRow(index, "machineId", e.target.value)
//                     }
//                   >
//                     {manufacturingVariablesid.length < 0 ? (
//                       <option value="">No machines available</option>
//                     ) : (
//                       <>
//                         <option value="">Machines</option>
//                         {manufacturingVariablesid.map((item) => (
//                           <option key={item._id} value={item.subcategoryId}>
//                             {`${item.subcategoryId} - ${item.name}`}
//                           </option>
//                         ))}
//                       </>
//                     )}
//                   </Input>
//                 </td>
//                 <td>
//                   <Input
//                     type="select"
//                     style={{ padding: "10px", fontSize: "14px", width: "8rem" }}
//                     value={row.shift}
//                     onChange={(e) => updateRow(index, "shift", e.target.value)}
//                   >
//                     <option>Shift A</option>
//                     <option>Shift B</option>
//                   </Input>
//                 </td>
//                 <td>
//                   <Input
//                     type="text"
//                     style={{ padding: "10px", fontSize: "14px", width: "8rem" }}
//                     value={row.plannedTime}
//                     onChange={(e) =>
//                       updateRow(index, "plannedTime", e.target.value)
//                     }
//                   />
//                 </td>
//                 <td>
//                   <Input
//                     type="select"
//                     style={{ padding: "10px", fontSize: "14px", width: "8rem" }}
//                     value={row.shift}
//                     onChange={(e) => updateRow(index, "shift", e.target.value)}
//                   >
//                     <option>Worker A</option>
//                     <option>Worker B</option>
//                   </Input>
//                 </td>

//                 <td>
//                   <span
//                     style={{
//                       color: "red",
//                       cursor: "pointer",
//                       marginLeft: "3px",
//                     }}
//                   >
//                     <MdOutlineDelete size={25} />
//                   </span>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </Table>
//       </ModalBody>
//       <ModalFooter>
//         <Button color="secondary" onClick={toggle}>
//           Close
//         </Button>
//         <Button
//           color="primary"
//           disabled={!isAllocationComplete}
//           title={isAllocationComplete ? "Complete allocation to enable" : ""}
//           onMouseOver={(e) =>
//             (e.currentTarget.title = !isAllocationComplete
//               ? "Complete allocation to enable"
//               : "")
//           }
//         >
//           Confirm Allocation
//         </Button>
//       </ModalFooter>
//     </Modal>
//   );
// };

// export default AllocationPlanningModal;

// =============================================================

// import React, { useEffect, useState } from "react";
// import { MdOutlineDelete } from "react-icons/md";
// import {
//   Modal,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   Button,
//   Table,
//   Input,
//   Row,
//   Col,
// } from "reactstrap";

// const AllocationPlanningModal = ({
//   isOpen,
//   toggle,
//   projectName,
//   columnName,
//   name,
//   calculatedHours,
//   columnValue,
//   categoryId,
// }) => {
//   const processid = categoryId || "";
//   const initialPlannedQuantity = parseInt(columnValue);
//   const [manufacturingVariablesid, setManufacturingVariablesId] = useState([]);
//   const [rows, setRows] = useState([
//     {
//       partType: "Make",
//       plannedQuantity: 1,
//       startDate: "",
//       endDate: "",
//       machineId: "",
//       shift: "Shift A",
//       plannedTime: "02",
//       operator: "",
//     },
//   ]);
//   const [remainingQuantity, setRemainingQuantity] = useState(
//     initialPlannedQuantity
//   );

//   useEffect(() => {
//     const fetchManufacturingVariables = async () => {
//       try {
//         const response = await fetch(
//           `http://localhost:4040/api/manufacturing/category/${processid}`
//         );
//         const data = await response.json();

//         if (response.ok) {
//           setManufacturingVariablesId(data.subCategories);
//         } else {
//           console.error("Failed to fetch subcategories");
//         }
//       } catch (err) {
//         console.error("Error fetching data");
//       }
//     };

//     fetchManufacturingVariables();
//   }, [processid]);

//   const addRow = () => {
//     setRows([
//       ...rows,
//       {
//         partType: "Make",
//         plannedQuantity: 1,
//         startDate: "",
//         endDate: "",
//         machineId: "",
//         shift: "Shift A",
//         plannedTime: "02",
//         operator: "",
//       },
//     ]);
//   };

//   const updateRow = (index, field, value) => {
//     const updatedRows = [...rows];
//     updatedRows[index][field] = value;
//     setRows(updatedRows);

//     if (field === "plannedQuantity") {
//       const totalPlannedQuantity = updatedRows.reduce(
//         (sum, row) => sum + parseInt(row.plannedQuantity || 0),
//         0
//       );
//       setRemainingQuantity(initialPlannedQuantity - totalPlannedQuantity);
//     }
//   };

//   const deleteRow = (index) => {
//     const updatedRows = rows.filter((_, rowIndex) => rowIndex !== index);
//     setRows(updatedRows);
//     const totalPlannedQuantity = updatedRows.reduce(
//       (sum, row) => sum + parseInt(row.plannedQuantity || 0),
//       0
//     );
//     setRemainingQuantity(initialPlannedQuantity - totalPlannedQuantity);
//   };

//   const isAllocationComplete = remainingQuantity === 0;

//   const usedMachines = rows.map((row) => row.machineId);

//   const handleSubmit = async () => {
//     // Validation
//     for (let row of rows) {
//       if (
//         !row.partType ||
//         !row.plannedQuantity ||
//         !row.startDate ||
//         !row.endDate ||
//         !row.machineId ||
//         !row.shift ||
//         !row.plannedTime ||
//         !row.operator
//       ) {
//         alert("Please fill out all fields in all rows.");
//         return;
//       }
//     }

//     const payload = {
//       projectName: "Manufacturing Allocation",
//       processName: columnName.replace(/"/g, ""),
//       initialPlannedQuantity,
//       remainingQuantity,
//       allocations: rows,
//     };

//     try {
//       const response = await fetch(
//         "http://localhost:4040/api/allocation/addallocations",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(payload),
//         }
//       );

//       if (response.ok) {
//         alert("Allocation saved successfully!");
//         toggle();
//       } else {
//         alert("Failed to save allocation.");
//       }
//     } catch (err) {
//       console.error("Error submitting allocation:", err);
//       alert("An error occurred while saving the allocation.");
//     }
//   };

//   const sectionTitleStyle = {
//     fontSize: "1.1rem",
//     fontWeight: "600",
//     color: "#212529",
//     marginBottom: "1rem",
//   };

//   const labelStyle = {
//     fontSize: "0.9rem",
//     color: "#495057",
//     marginBottom: "0.3rem",
//     display: "block",
//   };

//   const valueStyle = {
//     fontSize: "0.9rem",
//     fontWeight: "600",
//     color: "#343a40",
//   };

//   return (
//     <Modal
//       isOpen={isOpen}
//       toggle={toggle}
//       style={{ maxWidth: "90vw", width: "90%" }}
//     >
//       <ModalHeader toggle={toggle}>Allocation Planning - {name}</ModalHeader>
//       <ModalBody>
//         <Row className="mb-4">
//           <Col md="6">
//             <span style={labelStyle}>Project Name:</span>
//             <span style={valueStyle}>Manufacturing Allocation</span>
//           </Col>
//           <Col md="6">
//             <span style={labelStyle}>Process Name:</span>
//             <span style={valueStyle}>
//               {columnName && columnName !== ""
//                 ? columnName.replace(/"/g, "")
//                 : "N/A"}
//             </span>
//           </Col>
//         </Row>

//         <Row className="mb-4">
//           <Col>
//             <span style={labelStyle}>Planned Quantity:</span>
//             <span style={valueStyle}>{initialPlannedQuantity}</span>
//           </Col>
//           <Col>
//             <span style={labelStyle}>Remaining Quantity:</span>
//             <span style={valueStyle}>{remainingQuantity}</span>
//           </Col>
//         </Row>

//         <Row className="d-flex justify-content-between align-items-center mb-3">
//           <Col>
//             <span style={sectionTitleStyle}>Machine-wise Allocation</span>
//           </Col>
//           <Col className="text-end">
//             <Button color="primary" onClick={addRow} className="mt-2">
//               Add Row
//             </Button>
//           </Col>
//         </Row>

//         <Table bordered responsive>
//           <thead>
//             <tr>
//               <th>Part Type</th>
//               <th>Planned Quantity</th>
//               <th style={{ width: "15%" }}>Start Date</th>
//               <th style={{ width: "15%" }}>End Date</th>
//               <th style={{ width: "15%" }}>Machine ID</th>
//               <th style={{ width: "15%" }}>Number of Shift</th>
//               <th style={{ width: "15%" }}>Planned Qty Time</th>
//               <th style={{ width: "15%" }}>Operator</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map((row, index) => (
//               <tr key={index}>
//                 <td>
//                   <Input
//                     type="select"
//                     value={row.partType}
//                     onChange={(e) =>
//                       updateRow(index, "partType", e.target.value)
//                     }
//                   >
//                     <option>Make</option>
//                     <option>Purchase</option>
//                   </Input>
//                 </td>
//                 <td>
//                   <Input
//                     type="number"
//                     value={row.plannedQuantity}
//                     onChange={(e) =>
//                       updateRow(index, "plannedQuantity", e.target.value)
//                     }
//                   />
//                 </td>
//                 <td>
//                   <Input
//                     type="date"
//                     value={row.startDate}
//                     onChange={(e) =>
//                       updateRow(index, "startDate", e.target.value)
//                     }
//                   />
//                 </td>
//                 <td>
//                   <Input
//                     type="date"
//                     value={row.endDate}
//                     onChange={(e) =>
//                       updateRow(index, "endDate", e.target.value)
//                     }
//                   />
//                 </td>
//                 <td>
//                   <Input
//                     type="select"
//                     value={row.machineId}
//                     onChange={(e) =>
//                       updateRow(index, "machineId", e.target.value)
//                     }
//                   >
//                     <option value="">Select Machine</option>
//                     {manufacturingVariablesid
//                       .filter(
//                         (item) => !usedMachines.includes(item.subcategoryId)
//                       )
//                       .map((item) => (
//                         <option key={item._id} value={item.subcategoryId}>
//                           {`${item.subcategoryId} - ${item.name}`}
//                         </option>
//                       ))}
//                   </Input>
//                 </td>
//                 <td>
//                   <Input
//                     type="select"
//                     value={row.shift}
//                     onChange={(e) => updateRow(index, "shift", e.target.value)}
//                   >
//                     <option>Shift A</option>
//                     <option>Shift B</option>
//                   </Input>
//                 </td>
//                 <td>
//                   <Input
//                     type="text"
//                     value={row.plannedTime}
//                     onChange={(e) =>
//                       updateRow(index, "plannedTime", e.target.value)
//                     }
//                   />
//                 </td>
//                 <td>
//                   <Input
//                     type="select"
//                     value={row.operator}
//                     onChange={(e) =>
//                       updateRow(index, "operator", e.target.value)
//                     }
//                   >
//                     <option value="">Select Operator</option>
//                     <option>Worker A</option>
//                     <option>Worker B</option>
//                   </Input>
//                 </td>
//                 <td>
//                   <span
//                     style={{ color: "red", cursor: "pointer" }}
//                     onClick={() => deleteRow(index)}
//                   >
//                     <MdOutlineDelete size={25} />
//                   </span>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </Table>
//       </ModalBody>
//       <ModalFooter>
//         <Button color="secondary" onClick={toggle}>
//           Close
//         </Button>
//         <Button
//           color="primary"
//           disabled={!isAllocationComplete}
//           title={isAllocationComplete ? "Complete allocation to enable" : ""}
//           onClick={handleSubmit}
//         >
//           Confirm Allocation
//         </Button>
//       </ModalFooter>
//     </Modal>
//   );
// };

// export default AllocationPlanningModal;

// ===================================================

import React, { useEffect, useState } from "react";
import { MdOutlineDelete } from "react-icons/md";
import { toast } from "react-toastify";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Table,
  Input,
  Row,
  Col,
} from "reactstrap";

const AllocationPlanningModal = ({
  isOpen,
  toggle,
  projectName,
  columnName,
  name,
  calculatedHours,
  columnValue,
  categoryId,
}) => {
  const processid = categoryId || "";
  const initialPlannedQuantity = parseInt(columnValue);
  const [manufacturingVariablesid, setManufacturingVariablesId] = useState([]);
  const [rows, setRows] = useState([
    {
      partType: "",
      plannedQuantity: 1,
      startDate: "",
      endDate: "",
      machineId: "",
      shift: "Shift A",
      plannedTime: 0,
      operator: "Worker A",
    },
  ]);
  const [remainingQuantity, setRemainingQuantity] = useState(
    initialPlannedQuantity
  );
  const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [confirmData, setConfirmData] = useState([]);

  useEffect(() => {
    const fetchManufacturingVariables = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/manufacturing/category/${processid}`
        );
        const data = await response.json();

        if (response.ok) {
          setManufacturingVariablesId(data.subCategories);
        } else {
          console.error("Failed to fetch subcategories");
        }
      } catch (err) {
        console.error("Error fetching data");
      }
    };

    fetchManufacturingVariables();
  }, [processid]);

  const addRow = () => {
    setRows([
      ...rows,
      {
        partType: "",
        plannedQuantity: 0,
        startDate: "",
        endDate: "",
        machineId: "",
        shift: "Shift A",
        plannedTime: "",
        operator: "Worker A",
      },
    ]);
  };

  const updateRow = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);

    if (field === "plannedQuantity") {
      const totalPlannedQuantity = updatedRows.reduce(
        (sum, row) => sum + parseInt(row.plannedQuantity || 0),
        0
      );
      setRemainingQuantity(initialPlannedQuantity - totalPlannedQuantity);
    }
  };

  const removeRow = (index) => {
    const updatedRows = rows.filter((_, rowIndex) => rowIndex !== index);
    setRows(updatedRows);
  };

  const handleConfirm = () => {
    setConfirmData(rows);
    setConfirmationModalOpen(true);
  };

  const handleFinalConfirm = async () => {
    try {
      const payload = {
        projectName: name || "Unknown Project",
        processName: columnName || "Unknown Process",
        initialPlannedQuantity,
        remainingQuantity,
        allocations: confirmData,
      };

      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/allocation/addallocations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log("Data posted successfully");
        toast.success('Allocation created successfully')
        setRows([
          {
            partType: "",
            plannedQuantity: 1,
            startDate: "",
            endDate: "",
            machineId: "",
            shift: "Shift A",
            plannedTime: "02h",
            operator: "Worker A",
          },
        ]);
        setRemainingQuantity(initialPlannedQuantity);
        setConfirmationModalOpen(false);
        toggle();
      } else {
        console.error("Failed to post data");
      }
    } catch (err) {
      console.error("Error posting data", err);
    }
  };

  const isAllocationComplete = remainingQuantity === 0;
  const usedMachines = rows.map((row) => row.machineId);

  const sectionTitleStyle = {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#212529",
    marginBottom: "1rem",
  };

  const labelStyle = {
    fontSize: "0.9rem",
    color: "#495057",
    marginBottom: "0.3rem",
    display: "block",
  };

  const valueStyle = {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#343a40",
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        toggle={toggle}
        style={{ maxWidth: "90vw", width: "90%" }}
      >
        <ModalHeader toggle={toggle}>Allocation Planning - {name}</ModalHeader>
        <ModalBody>
          {/* <Row className="mb-4">
            <Col md="6">
              <span>Project Name:</span>
              <span>Manufacturing Allocation</span>
            </Col>
            <Col md="6">
              <span>Process Name:</span>
              <span>{columnName || "N/A"}</span>
            </Col>
          </Row>
          <Row className="mb-4">
            <Col>
              <span>Planned Quantity:</span>
              <span>{initialPlannedQuantity}</span>
            </Col>
            <Col>
              <span>Remaining Quantity:</span>
              <span>{remainingQuantity}</span>
            </Col>
          </Row>
          <Row className="d-flex justify-content-between align-items-center mb-3">
            <Col>Machine-wise Allocation</Col>
            <Col className="text-end">
              <Button color="primary" onClick={addRow} className="mt-2">
                Add Row
              </Button>
            </Col>
          </Row> */}
          <Row className="mb-4">
            <Col md="6">
              <span style={labelStyle}>Project Name:</span>
              <span style={valueStyle}>Manufacturing Allocation</span>
            </Col>
            <Col md="6">
              <span style={labelStyle}>Process Name:</span>
              <span style={valueStyle}>
                {columnName && columnName !== ""
                  ? columnName.replace(/"/g, "") // Remove quotes if any
                  : "N/A"}
              </span>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col>
              <span style={labelStyle}>Planned Quantity:</span>
              <span style={valueStyle}>{initialPlannedQuantity}</span>
            </Col>
            <Col>
              <span style={labelStyle}>Remaining Quantity:</span>
              <span style={valueStyle}>
                {remainingQuantity ||
                  (remainingQuantity === 0 ? 0 : initialPlannedQuantity)}
              </span>
            </Col>
          </Row>

          <Row className="d-flex justify-content-between align-items-center mb-3">
            <Col>
              <span style={sectionTitleStyle}>Machine-wise Allocation</span>
            </Col>
            <Col className="text-end">
              <Button color="primary" onClick={addRow} className="mt-2">
                Add Row
              </Button>
            </Col>
          </Row>

          <Table bordered responsive>
            <thead>
              <tr>
                <th style={{ width: "15%" }}>Part Type</th>
                <th>Planned Quantity</th>
                <th style={{ width: "15%" }}>Start Date</th>
                <th style={{ width: "15%" }}>End Date</th>
                <th style={{ width: "15%" }}>Machine ID</th>
                <th style={{ width: "15%" }}>Number of Shift</th>
                <th style={{ width: "10%" }}>Planned Qty Time</th>
                <th style={{ width: "15%" }}>Operator</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td>
                    <Input
                      type="select"
                      value={row.partType}
                      onChange={(e) =>
                        updateRow(index, "partType", e.target.value)
                      }
                    >
                      <option value="">Select Part</option>
                      <option value="Make">Make</option>
                      <option value="Purchase">Purchase</option>
                    </Input>
                  </td>
                  <td>
                    <Input
                      type="number"
                      value={row.plannedQuantity}
                      onChange={(e) =>
                        updateRow(index, "plannedQuantity", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <Input
                      type="date"
                      value={row.startDate}
                      onChange={(e) =>
                        updateRow(index, "startDate", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <Input
                      type="date"
                      value={row.endDate}
                      onChange={(e) =>
                        updateRow(index, "endDate", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <Input
                      type="select"
                      value={row.machineId}
                      onChange={(e) =>
                        updateRow(index, "machineId", e.target.value)
                      }
                    >
                      <option value=""> Machine</option>
                      {manufacturingVariablesid
                        .filter(
                          (item) => !usedMachines.includes(item.subcategoryId)
                        )
                        .map((item) => (
                          <option key={item._id} value={item.subcategoryId}>
                            {`${item.subcategoryId} - ${item.name}`}
                          </option>
                        ))}
                    </Input>
                  </td>
                  <td>
                    <Input
                      type="select"
                      value={row.shift}
                      onChange={(e) =>
                        updateRow(index, "shift", e.target.value)
                      }
                    >
                      <option>Shift A</option>
                      <option>Shift B</option>
                    </Input>
                  </td>
                  <td>
                    <Input
                      type="text"
                      value={row.plannedTime}
                      onChange={(e) =>
                        updateRow(index, "plannedTime", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <Input
                      type="select"
                      value={row.operator}
                      onChange={(e) =>
                        updateRow(index, "operator", e.target.value)
                      }
                      step={valueStyle}
                    >
                      <option>Worker A</option>
                      <option>Worker B</option>
                    </Input>
                  </td>
                  <td>
                    <span
                      onClick={() => removeRow(index)}
                      style={{ color: "red", cursor: "pointer" }}
                    >
                      <MdOutlineDelete size={25} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle}>
            Close
          </Button>
          <Button
            color="primary"
            disabled={!isAllocationComplete}
            onClick={handleConfirm}
          >
            Confirm Allocation
          </Button>
        </ModalFooter>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmationModalOpen}
        toggle={() => setConfirmationModalOpen(false)}
      >
        <ModalHeader>Confirm Allocation</ModalHeader>
        <ModalBody>
          <p>Please review the following allocations:</p>
          {confirmData.map((row, index) => (
            <div key={index} style={{ marginBottom: "1rem" }}>
              <h5>Allocation {index + 1}</h5>
              <p>Quantity: {row.plannedQuantity}</p>
              <p>
                Period: {row.startDate} to {row.endDate}
              </p>
              <p>Machine: {row.machineId}</p>
              <p>Shift: {row.shift}</p>
              <p>Time Required: {row.plannedTime}</p>
              <p>Operator: {row.operator}</p>
            </div>
          ))}
        </ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            onClick={() => setConfirmationModalOpen(false)}
          >
            Cancel
          </Button>
          <Button color="primary" onClick={handleFinalConfirm}>
            Confirm
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default AllocationPlanningModal;
