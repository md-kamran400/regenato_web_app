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
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

const AllocationPlanningModal = ({
  isOpen,
  toggle,
  projectName,
  columnName,
  name,
  calculatedHours,
  columnValue,
  categoryId,
  quantity,
  sourceType,
  projectId,
  partsListId,
  partsListItemsId,
  process_machineId,
}) => {
  const processid = categoryId || "";
  const initialPlannedQuantity = parseInt(quantity);
  const initialPlannedtotalQuantity = parseInt(columnValue);
  const [manufacturingVariablesid, setManufacturingVariablesId] = useState([]);
  const OneMachinetotalValue =
    initialPlannedtotalQuantity / initialPlannedQuantity;
  const [rows, setRows] = useState([
    {
      partType: "",
      plannedQuantity: 0,
      startDate: "",
      endDate: "",
      machineId: "",
      shift: "Shift A",
      plannedTime: 0,
      operator: "Worker A",
    },
  ]);
  const [remainingQuantity, setRemainingQuantity] = useState(quantity);
  const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [confirmData, setConfirmData] = useState([]);
  const [operators, setOperators] = useState([]);

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

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/userVariable`
        );
        const data = await response.json();

        if (response.ok) {
          // Filter based on columnName
          const filteredOperators = data.filter((operator) =>
            operator.processName.includes(columnName)
          );
          setOperators(filteredOperators);
        } else {
          console.error("Failed to fetch operators");
        }
      } catch (err) {
        console.error("Error fetching operators", err);
      }
    };

    fetchOperators();
  }, [columnName]);

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

  // console.log("sourceType ", sourceType);
  // console.log("projec id", projectId )
  // console.log("partsListId", partsListId);
  // console.log("partsListItemsId", partsListItemsId);
  // console.log("process_machineId", process_machineId);
  // console.log("processid", categoryId);

  const updateRow = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;

    if (field === "plannedQuantity") {
      const quantity = parseInt(value, 10) || 0;

      // Ensure planned quantity is valid
      if (isNaN(quantity) || quantity < 0) {
        console.error("Invalid plannedQuantity:", value);
        return;
      }

      // Automatically set startDate if not already set
      if (!updatedRows[index].startDate) {
        const today = new Date();
        updatedRows[index].startDate = today.toISOString().split("T")[0];
      }

      // Get start date as a Date object
      let currentDate = new Date(updatedRows[index].startDate);

      // Validate startDate
      if (isNaN(currentDate.getTime())) {
        console.error("Invalid startDate:", updatedRows[index].startDate);
        return;
      }

      // Calculate required time in minutes
      const calculatedTime = Math.round(quantity * OneMachinetotalValue);
      const workMinutesPerDay = 8 * 60; // 8 hours = 480 minutes

      let remainingMinutes = calculatedTime;

      // ✅ Correct endDate calculation (ensuring 600 min = 2 days, not 3)
      let workDays = 0;
      while (remainingMinutes > 0) {
        if (currentDate.getDay() !== 0) {
          // Skip Sundays
          remainingMinutes -= workMinutesPerDay;
          workDays++;
        }
        if (remainingMinutes > 0) {
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }

      // Format endDate as YYYY-MM-DD
      const formattedEndDate = currentDate.toISOString().split("T")[0];

      // Update row values
      updatedRows[index].plannedTime = calculatedTime;
      updatedRows[index].endDate = formattedEndDate;

      // Update remaining quantity
      const totalPlannedQuantity = updatedRows.reduce(
        (sum, row) => sum + parseInt(row.plannedQuantity || 0, 10),
        0
      );
      setRemainingQuantity(initialPlannedQuantity - totalPlannedQuantity);
    }

    setRows(updatedRows);
  };

  useEffect(() => {
    setRemainingQuantity();
  }, []);

  const removeRow = (index) => {
    const updatedRows = rows.filter((_, rowIndex) => rowIndex !== index);
    setRows(updatedRows);
  };

  const handleConfirm = () => {
    setConfirmData(rows);
    setConfirmationModalOpen(true);
  };

  const isFormValid = rows.every((row) => {
    if (row.partType === "Make") {
      return (
        row.partType &&
        row.plannedQuantity > 0 &&
        row.startDate &&
        row.endDate &&
        row.machineId &&
        row.shift &&
        row.plannedTime &&
        row.operator
      );
    } else if (row.partType === "Purchase") {
      return row.partType && row.plannedQuantity > 0;
    }
    return false;
  });

  // const handleFinalConfirm = async () => {
  //   try {
  //     const payload = {
  //       projectName: name || "Unknown Project",
  //       processName: columnName || "Unknown Process",
  //       initialPlannedQuantity,
  //       remainingQuantity,
  //       allocations: confirmData,
  //     };

  //     const response = await fetch(
  //       `${process.env.REACT_APP_BASE_URL}/api/allocation/addallocations`,
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(payload),
  //       }
  //     );

  //     if (response.ok) {
  //       console.log("Data posted successfully");
  //       toast.success("Allocation created successfully");
  //       setRows([
  //         {
  //           partType: "",
  //           plannedQuantity: 1,
  //           startDate: "",
  //           endDate: "",
  //           machineId: "",
  //           shift: "Shift A",
  //           plannedTime: "02h",
  //           operator: "Worker A",
  //         },
  //       ]);
  //       setRemainingQuantity(initialPlannedQuantity);
  //       setConfirmationModalOpen(false);
  //       toggle();
  //     } else {
  //       console.error("Failed to post data");
  //     }
  //   } catch (err) {
  //     console.error("Error posting data", err);
  //   }
  // };

  const handleFinalConfirm = async () => {
    try {
      const payload = {
        partName: name || "Unknown Project", // projectName => partName
        processName: columnName || "Unknown Process",
        initialPlannedQuantity,
        remainingQuantity,
        allocations: confirmData.map((allocation) => ({
          ...allocation,
          partsListId,
          partsListItemsId,
          process_machineId,
          sourceType,
        })),
      };

      //"/projects/:partsListId/partsLists/:partsListId/partsListItems/:partsListItemsId/allocation",
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${projectId}/partsLists/${partsListId}/partsListItems/${partsListItemsId}/allocation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        // console.log("Data posted successfully");
        toast.success("Allocation created successfully");
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
              <Button color="primary" onClick={addRow} className="mt-2 me-2">
                Add Row
              </Button>

              {/* <Button color="danger" onClick={toggle} className="mt-2">
                Cancel Allocation
              </Button> */}
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
                      disabled={row.partType === "Purchase"}
                      style={{
                        backgroundColor:
                          row.partType === "Purchase" ? "#e9ecef" : "white",
                      }}
                    />
                  </td>
                  <td>
                    <Input
                      type="date"
                      value={row.endDate}
                      onChange={(e) =>
                        updateRow(index, "endDate", e.target.value)
                      }
                      disabled={row.partType === "Purchase"}
                      style={{
                        backgroundColor:
                          row.partType === "Purchase" ? "#e9ecef" : "white",
                      }}
                    />
                  </td>
                  <td>
                    {/* <Input
                      type="select"
                      value={row.machineId}
                      onChange={(e) =>
                        updateRow(index, "machineId", e.target.value)
                      }
                      disabled={row.partType === "Purchase"}
                      style={{
                        backgroundColor:
                          row.partType === "Purchase" ? "#e9ecef" : "white",
                      }}
                    >
                      <option value="">Machine</option>
                      {manufacturingVariablesid.map((item) => {
                        const isSelected = usedMachines.includes(
                          item.subcategoryId
                        );
                        return (
                          <option
                            key={item._id}
                            value={item.subcategoryId}
                            disabled={isSelected} // Disable if already selected
                            style={{ color: isSelected ? "gray" : "black" }} // Style for disabled option
                          >
                            {`${item.subcategoryId} - ${item.name}`}
                          </option>
                        );
                      })}
                    </Input> */}
                    <Autocomplete
                      options={manufacturingVariablesid} // Use available machine options
                      getOptionLabel={(option) =>
                        `${option.subcategoryId} - ${option.name}`
                      } // Display in dropdown
                      value={
                        manufacturingVariablesid.find(
                          (m) => m.subcategoryId === row.machineId
                        ) || null
                      } // Show selected machine
                      onChange={(event, newValue) =>
                        updateRow(
                          index,
                          "machineId",
                          newValue ? newValue.subcategoryId : ""
                        )
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Machines"
                          variant="outlined"
                          size="small"
                        />
                      )}
                      disabled={row.partType === "Purchase"}
                      isOptionEqualToValue={(option, value) =>
                        option.subcategoryId === value.subcategoryId
                      }
                      getOptionDisabled={(option) =>
                        usedMachines.includes(option.subcategoryId)
                      } // Disable if already selected
                    />
                  </td>
                  <td>
                    <Input
                      type="select"
                      value={row.shift}
                      onChange={(e) =>
                        updateRow(index, "shift", e.target.value)
                      }
                      disabled={row.partType === "Purchase"}
                      style={{
                        backgroundColor:
                          row.partType === "Purchase" ? "#e9ecef" : "white",
                      }}
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
                      disabled={row.partType === "Purchase"}
                      style={{
                        backgroundColor:
                          row.partType === "Purchase" ? "#e9ecef" : "white",
                      }}
                      readOnly
                    />
                  </td>
                  <td>
                    {/* <Input
                      type="select"
                      value={row.operator}
                      onChange={(e) =>
                        updateRow(index, "operator", e.target.value)
                      }
                      step={valueStyle}
                      disabled={row.partType === "Purchase"}
                      style={{
                        backgroundColor:
                          row.partType === "Purchase" ? "#e9ecef" : "white",
                      }}
                    >
                      <option>Worker A</option>
                      <option>Worker B</option>
                    </Input> */}
                    {/* <Input
                      type="select"
                      value={row.operator}
                      onChange={(e) =>
                        updateRow(index, "operator", e.target.value)
                      }
                      disabled={row.partType === "Purchase"}
                      style={{
                        backgroundColor:
                          row.partType === "Purchase" ? "#e9ecef" : "white",
                      }}
                    >
                      <option value="">Select Operator</option>
                      {operators.map((operator) => (
                        <option key={operator._id} value={operator.name}>
                          {operator.name}
                        </option>
                      ))}
                    </Input> */}

                    <Autocomplete
                      options={operators} // List of operators from API
                      getOptionLabel={(option) => option.name} // Show only the name in dropdown
                      value={
                        operators.find((op) => op.name === row.operator) || null
                      } // Set selected value
                      onChange={(event, newValue) =>
                        updateRow(
                          index,
                          "operator",
                          newValue ? newValue.name : ""
                        )
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Operator"
                          variant="outlined"
                          size="small"
                        />
                      )}
                      disabled={row.partType === "Purchase"}
                    />
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
          {/* <Button color="secondary" onClick={toggle}>
            Close
          </Button> */}

          <Button
            color="primary"
            disabled={!isAllocationComplete || !isFormValid} // Button disabled if form is invalid
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
