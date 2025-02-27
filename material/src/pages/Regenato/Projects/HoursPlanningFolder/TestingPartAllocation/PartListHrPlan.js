import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Collapse,
  Table,
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { BsFillClockFill } from "react-icons/bs";
import { MdOutlineDelete } from "react-icons/md";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import axios from "axios";
import { ImPriceTag } from "react-icons/im";
import { MdInventory } from "react-icons/md";
import { toast } from "react-toastify";

import AllocatedPartListHrPlan from "./AllocatedPartListHrPlan";
export const PartListHrPlan = ({
  partName,
  manufacturingVariables,
  quantity,
  porjectID,
  partID,
  partListItemId,
}) => {
  const [machineOptions, setMachineOptions] = useState({});
  // const [isOpen, setIsOpen] = useState(true);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("actual");
  const [rows, setRows] = useState({});
  const [operators, setOperators] = useState([]);
  const [hasStartDate, setHasStartDate] = useState(false);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const openConfirmationModal = () => {
    setIsConfirmationModalOpen(true);
  };
  const [remainingQuantity, setRemainingQuantity] = useState(quantity);
  const [remainingQuantities, setRemainingQuantities] = useState({});
  const [isAutoSchedule, setIsAutoSchedule] = useState(false);

  useEffect(() => {
    const initialRows = manufacturingVariables.reduce((acc, man, index) => {
      acc[index] = [
        {
          plannedQuantity: isAutoSchedule ? quantity : "",
          plannedQtyTime: isAutoSchedule
            ? calculatePlannedMinutes(quantity * man.hours)
            : "",
          startDate: "",
          startTime: "",
          endDate: "",
          machineId: "",
          shift: "",
          processName: man.name,
        },
      ];
      return acc;
    }, {});

    setRows(initialRows);
  }, [manufacturingVariables, quantity, isAutoSchedule]);

  const handleQuantityChange = (index, rowIndex, value) => {
    setRows((prevRows) => {
      const updatedRows = { ...prevRows };
      const processRows = [...(updatedRows[index] || [])];
      const newQuantity =
        value === "" ? "" : Math.max(0, Math.min(quantity, Number(value)));

      processRows[rowIndex] = {
        ...processRows[rowIndex],
        plannedQuantity: newQuantity,
        plannedQtyTime: newQuantity
          ? calculatePlannedMinutes(
              newQuantity * manufacturingVariables[index].hours
            )
          : "",
      };

      updatedRows[index] = processRows;

      const usedQuantity = processRows.reduce(
        (sum, row) => sum + Number(row.plannedQuantity || 0),
        0
      );

      setRemainingQuantities((prev) => ({
        ...prev,
        [index]: Math.max(0, quantity - usedQuantity),
      }));

      return updatedRows;
    });
  };

  const updateRemainingQuantity = (processIndex) => {
    setRemainingQuantities((prev) => {
      const usedQuantity = rows[processIndex]?.reduce(
        (sum, row) => sum + Number(row.plannedQuantity || 0),
        0
      );
      return {
        ...prev,
        [processIndex]: Math.max(0, quantity - usedQuantity),
      };
    });
  };
  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/userVariable`
        );
        const data = await response.json();
        if (response.ok) setOperators(data);
      } catch (err) {
        console.error("Error fetching operators", err);
      }
    };
    fetchOperators();
  }, []);

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/shiftVariable`
        );
        const data = await response.json();
        if (response.ok) {
          const formattedShifts = data.map((shift) => ({
            name: shift.name,
            _id: shift._id,
            startTime: shift.StartTime, // Include start time
            TotalHours: parseFloat(shift.TotalHours) * 60,
          }));
          setShiftOptions(formattedShifts);
        }
      } catch (error) {
        console.error("Error fetching shifts:", error);
      }
    };

    fetchShifts();
  }, []);

  useEffect(() => {
    const fetchMachines = async () => {
      const machineData = {};
      for (const man of manufacturingVariables) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_BASE_URL}/api/manufacturing/category/${man.categoryId}`
          );

          // Use only available machines from the backend response
          machineData[man.categoryId] = response.data.subCategories;
        } catch (error) {
          console.error("Error fetching available machines:", error);
        }
      }
      setMachineOptions(machineData);
    };
    fetchMachines();
  }, [manufacturingVariables]);

  useEffect(() => {
    // Only initialize rows with empty data
    const initialRows = manufacturingVariables.reduce((acc, man, index) => {
      acc[index] = [
        {
          // partType: "Make",
          plannedQuantity: quantity,
          startDate: "",
          startTime: "",
          endDate: "",
          machineId: "",
          shift: "",
          plannedQtyTime: calculatePlannedMinutes(man.hours * quantity),
          processName: man.name,
        },
      ];
      return acc;
    }, {});

    setRows(initialRows);
  }, [manufacturingVariables, quantity]);

  const calculatePlannedMinutes = (hours) => {
    return Math.ceil(hours * 60);
  };

  const calculateEndDate = (startDate, plannedMinutes, shiftMinutes) => {
    console.log("calculateEndDate called with:", {
      startDate,
      plannedMinutes,
      shiftMinutes,
    });

    if (!startDate) return ""; // Ensure startDate is provided

    const parsedDate = new Date(startDate);
    if (isNaN(parsedDate.getTime())) return ""; // Ensure startDate is valid

    const totalDays = Math.ceil(plannedMinutes / (shiftMinutes || 480)); // Use shiftMinutes

    parsedDate.setDate(parsedDate.getDate() + totalDays - 1);

    console.log(`Selected shift: ${shiftMinutes}`);
    console.log(`Planned minutes: ${plannedMinutes}`);

    return parsedDate instanceof Date && !isNaN(parsedDate)
      ? parsedDate.toISOString().split("T")[0]
      : "";
  };

  const prefillData = (allRows, startDate) => {
    let currentDate = new Date(startDate);

    manufacturingVariables.forEach((man, index) => {
      if (!allRows[index]) return;

      allRows[index].forEach((row, rowIdx) => {
        const machineList = machineOptions[man.categoryId] || [];
        const firstMachine =
          machineList.length > 0 ? machineList[0].subcategoryId : "";

        const firstOperator =
          operators.find((op) => op.processName.includes(man.name)) || {};

        const firstShift = shiftOptions.length > 0 ? shiftOptions[0] : null;

        const processStartDate = currentDate.toISOString().split("T")[0];

        const plannedMinutes = calculatePlannedMinutes(man.hours * quantity);
        const processEndDate = calculateEndDate(
          processStartDate,
          plannedMinutes
        );

        allRows[index][rowIdx] = {
          ...row,
          startDate: processStartDate,
          endDate: processEndDate,
          machineId: firstMachine,
          operatorId: firstOperator._id || "",
          shift: firstShift ? firstShift.name : "",
          startTime: firstShift ? firstShift.startTime : "",
        };

        currentDate = new Date(processEndDate);
        currentDate.setDate(currentDate.getDate() + 1);
      });
    });

    console.log("Prefilled Data:", JSON.stringify(allRows, null, 2));
    return { ...allRows }; // Ensure state update
  };

  const handleStartDateChange = (index, rowIndex, date) => {
    if (index === 0) {
      setHasStartDate(!!date);
    }

    setRows((prevRows) => {
      const newRows = { ...prevRows };

      if (date) {
        if (isAutoSchedule && index === 0) {
          return prefillData(newRows, date);
        } else {
          newRows[index] = newRows[index].map((row, idx) => {
            if (idx === rowIndex) {
              return {
                ...row,
                startDate: date,
                endDate: calculateEndDate(date, row.plannedQtyTime),
              };
            }
            return row;
          });
        }
      } else {
        return manufacturingVariables.reduce((acc, man, idx) => {
          acc[idx] = [
            {
              partType: "Make",
              plannedQuantity: quantity,
              startDate: "",
              endDate: "",
              machineId: "",
              shift: "Shift A",
              plannedQtyTime: calculatePlannedMinutes(man.hours * quantity),
              operatorId: "",
              processName: man.name,
            },
          ];
          return acc;
        }, {});
      }
      return newRows;
    });
  };

  const addRow = (index) => {
    if (!hasStartDate) return;

    const currentRemaining = remainingQuantities[index];
    if (currentRemaining <= 0) {
      toast.warning("No remaining quantity available for this process");
      return;
    }

    setRows((prevRows) => ({
      ...prevRows,
      [index]: [
        ...(prevRows[index] || []),
        {
          partType: "Make",
          plannedQuantity: "",
          startDate: "",
          endDate: "",
          machineId: "",
          shift: "",
          plannedQtyTime: calculatePlannedMinutes(
            currentRemaining * manufacturingVariables[index].hours
          ),
          operatorId: "",
          processName: manufacturingVariables[index].name,
        },
      ],
    }));

    updateRemainingQuantity(index);
  };

  const deleteRow = (index, rowIndex) => {
    setRows((prevRows) => {
      const updatedRows = [...prevRows[index]];
      const deletedQuantity = updatedRows[rowIndex].plannedQuantity || 0; // Get the deleted quantity
      updatedRows.splice(rowIndex, 1);

      // If it's the last row, create a new one with full quantity
      if (updatedRows.length === 0) {
        updatedRows.push({
          partType: "Make",
          plannedQuantity: quantity,
          startDate: "",
          endDate: "",
          machineId: "",
          shift: "Shift A",
          plannedQtyTime: calculatePlannedMinutes(
            quantity * manufacturingVariables[index].hours
          ),
          operatorId: "",
          processName: manufacturingVariables[index].name,
        });
      }

      // Update remaining quantity after deletion
      setRemainingQuantities((prev) => ({
        ...prev,
        [index]: Math.min(quantity, prev[index] + deletedQuantity), // Add back the deleted quantity
      }));

      return { ...prevRows, [index]: updatedRows };
    });
  };
  const handleSubmit = async () => {
    console.log("Submitting allocations...");
    console.log("Rows before processing:", JSON.stringify(rows, null, 2));

    try {
      if (Object.keys(rows).length === 0) {
        alert("No allocations to submit.");
        return;
      }

      // Step 1: Group allocations by partName and processName
      const groupedAllocations = {};

      Object.keys(rows).forEach((index) => {
        // Reset order number counter for each process
        let orderCounter = 1;

        rows[index].forEach((row) => {
          if (
            row.plannedQuantity &&
            row.startDate &&
            row.endDate &&
            row.machineId &&
            row.shift &&
            row.operatorId
          ) {
            const key = `${partName}-${row.processName}`;

            if (!groupedAllocations[key]) {
              groupedAllocations[key] = {
                partName: partName,
                processName: row.processName,
                allocations: [],
              };
            }

            // Generate order number with padding
            const orderNumber = orderCounter.toString().padStart(3, "0");
            orderCounter++; // Increment counter for next row in this process

            groupedAllocations[key].allocations.push({
              orderNumber, // Add the generated order number
              plannedQuantity: row.plannedQuantity,
              startDate: new Date(row.startDate).toISOString(),
              startTime: row.startTime || "08:00 AM",
              endDate: new Date(row.endDate).toISOString(),
              machineId: row.machineId,
              shift: row.shift,
              plannedTime: row.plannedQtyTime,
              operator:
                operators.find((op) => op._id === row.operatorId)?.name ||
                "Unknown",
            });
          }
        });
      });

      const finalAllocations = Object.values(groupedAllocations);

      console.log(
        "Final Nested Allocations:",
        JSON.stringify(finalAllocations, null, 2)
      );

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/allocation`,
        { allocations: finalAllocations }
      );

      if (response.status === 201) {
        toast.success("Allocations successfully added!");
      } else {
        toast.error("Failed to add allocations.");
      }
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <div style={{ width: "100%", margin: "10px 0" }}>
      <Card>
        <CardHeader
          // onClick={toggle}
          style={{
            cursor: "pointer",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <BsFillClockFill
              size={20}
              style={{ marginRight: "10px", color: "#495057" }}
            />
            <span style={{ color: "#495057", fontSize: "15px" }}>
              ALLOCATION SUMMARY FOR {partName}
            </span>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Button
              color={isAutoSchedule ? "primary" : "secondary"}
              onClick={() => setIsAutoSchedule(!isAutoSchedule)}
            >
              {isAutoSchedule ? "Auto Schedule ✅" : "Auto Schedule"}
            </Button>
            <Button
              color={activeTab === "planned" ? "primary" : "secondary"}
              onClick={() => setActiveTab("planned")}
            >
              Planned
            </Button>
            <Button
              color={activeTab === "actual" ? "primary" : "secondary"}
              onClick={() => setActiveTab("actual")}
            >
              Actual
            </Button>
          </div>
        </CardHeader>
        {activeTab === "planned" && (
          <AllocatedPartListHrPlan
            porjectID={porjectID}
            partID={partID}
            partListItemId={partListItemId}
          />
        )}
        {activeTab === "actual" && (
          <Collapse isOpen={true}>
            <CardBody className="shadow-md">
              {manufacturingVariables.map((man, index) => (
                <Card key={index} className=" shadow-lg border-black">
                  <CardHeader
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: "#495057",
                        display: "inline-flex",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          // marginLeft: "10%",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        <ImPriceTag style={{ marginRight: "8px" }} />
                        {`${man.categoryId} - ${man.name}`}
                      </span>

                      <span
                        style={{
                          marginLeft: "10%",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        <MdInventory style={{ marginRight: "8px" }} />
                        Remaining Quantity: {remainingQuantities[index] || 0}
                      </span>
                    </span>

                    <Button
                      color="primary"
                      onClick={() => addRow(index)}
                      //   disabled={!hasStartDate}
                      disabled={
                        !hasStartDate || remainingQuantities[index] <= 0
                      }
                    >
                      Add Order
                    </Button>
                  </CardHeader>
                  <Table bordered responsive>
                    <thead>
                      <tr>
                        {/* <th style={{ width: "15%" }}>Part Type</th> */}
                        <th>Planned Quantity</th>
                        <th style={{ width: "10%" }}>Start Date</th>
                        <th style={{ width: "15%" }}>Start Time</th>
                        <th style={{ width: "8%" }}>End Date</th>
                        <th style={{ width: "25%" }}>Machine ID</th>
                        <th style={{ width: "20%" }}>Shift</th>
                        <th>Planned Qty Time</th>
                        <th style={{ width: "50%" }}>Operator</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows[index]?.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          <td>
                            {isAutoSchedule ? (
                              <Input
                                type="number"
                                value={row.plannedQuantity}
                                placeholder="Enter Value"
                                required
                                onChange={(e) => {
                                  const newValue =
                                    e.target.value === ""
                                      ? ""
                                      : Number(e.target.value);

                                  setRows((prevRows) => {
                                    const updatedRows = { ...prevRows };
                                    const processRows = [
                                      ...(updatedRows[index] || []),
                                    ];

                                    // Update the planned quantity safely
                                    processRows[rowIndex] = {
                                      ...processRows[rowIndex],
                                      plannedQuantity: newValue,
                                      plannedQtyTime: calculatePlannedMinutes(
                                        (newValue || 0) *
                                          manufacturingVariables[index].hours
                                      ),
                                    };

                                    // Update the rows state
                                    updatedRows[index] = processRows;

                                    // Compute remaining quantity **before** updating the state
                                    const usedQuantity = processRows.reduce(
                                      (sum, row) =>
                                        sum + Number(row.plannedQuantity || 0),
                                      0
                                    );

                                    setRemainingQuantities((prev) => ({
                                      ...prev,
                                      [index]: Math.max(
                                        0,
                                        quantity - usedQuantity
                                      ),
                                    }));

                                    return updatedRows;
                                  });
                                }}
                              />
                            ) : (
                              <Input
                                type="number"
                                placeholder="Enter QTY"
                                value={row.plannedQuantity}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    index,
                                    rowIndex,
                                    e.target.value
                                  )
                                }
                              />
                            )}
                          </td>

                          <td>
                            <Input
                              type="date"
                              value={row.startDate}
                              onChange={(e) =>
                                handleStartDateChange(
                                  index,
                                  rowIndex,
                                  e.target.value
                                )
                              }
                              // readOnly={index !== 0}
                            />
                          </td>

                          <td>
                            <Input
                              type="time"
                              value={row.startTime}
                              onChange={(e) => {
                                setRows((prevRows) => {
                                  const updatedRows = [...prevRows[index]];
                                  updatedRows[rowIndex].startTime =
                                    e.target.value;
                                  return { ...prevRows, [index]: updatedRows };
                                });
                              }}
                            />
                          </td>

                          <td>
                            <Input type="date" value={row.endDate} readOnly />
                          </td>

                          <td>
                            {/* <Autocomplete
                              options={machineOptions[man.categoryId] || []}
                              value={
                                machineOptions[man.categoryId]?.find(
                                  (machine) =>
                                    machine.subcategoryId === row.machineId
                                ) || null
                              }
                              getOptionLabel={(option) => ` ${option.name}`}
                              renderOption={(props, option) => {
                                const isDisabled = rows[index]?.some(
                                  (r) => r.machineId === option.subcategoryId
                                );
                                return (
                                  <li
                                    {...props}
                                    style={{
                                      color: isDisabled ? "gray" : "black",
                                      pointerEvents: isDisabled
                                        ? "none"
                                        : "auto",
                                    }}
                                  >
                                    - {option.name}
                                  </li>
                                );
                              }}
                              onChange={(event, newValue) => {
                                if (!hasStartDate && index !== 0) return;
                                setRows((prevRows) => {
                                  const updatedRows = [...prevRows[index]];
                                  updatedRows[rowIndex] = {
                                    ...updatedRows[rowIndex],
                                    machineId: newValue
                                      ? newValue.subcategoryId
                                      : "",
                                  };
                                  return { ...prevRows, [index]: updatedRows };
                                });
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Machine"
                                  variant="outlined"
                                  size="small"
                                />
                              )}
                              disableClearable={false}
                              disabled={!hasStartDate && index !== 0}
                            /> */}
                            <Autocomplete
                              options={machineOptions[man.categoryId] || []}
                              value={
                                machineOptions[man.categoryId]?.find(
                                  (machine) =>
                                    machine.subcategoryId === row.machineId
                                ) || null
                              }
                              getOptionLabel={(option) =>
                                `${option.name} ${
                                  option.isAvailable ? "" : "(Occupied)"
                                }`
                              }
                              renderOption={(props, option) => {
                                const isDisabled = !option.isAvailable;
                                return (
                                  <li
                                    {...props}
                                    style={{
                                      color: isDisabled ? "gray" : "black",
                                      pointerEvents: isDisabled
                                        ? "none"
                                        : "auto",
                                    }}
                                  >
                                    - {option.name}{" "}
                                    {isDisabled ? "(Occupied)" : ""}
                                  </li>
                                );
                              }}
                              onChange={(event, newValue) => {
                                if (!hasStartDate && index !== 0) return;
                                setRows((prevRows) => {
                                  const updatedRows = [...prevRows[index]];
                                  updatedRows[rowIndex] = {
                                    ...updatedRows[rowIndex],
                                    machineId: newValue
                                      ? newValue.subcategoryId
                                      : "",
                                  };
                                  return { ...prevRows, [index]: updatedRows };
                                });
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Machine"
                                  variant="outlined"
                                  size="small"
                                />
                              )}
                              disableClearable={false}
                              disabled={!hasStartDate && index !== 0}
                            />
                          </td>

                          <Autocomplete
                            options={shiftOptions || []}
                            value={
                              row.shift
                                ? shiftOptions.find(
                                    (option) => option.name === row.shift
                                  ) || null
                                : null
                            }
                            onChange={(event, newValue) => {
                              if (!newValue) return;
                              const isShiftAlreadyUsed = rows[index]?.some(
                                (r, idx) =>
                                  idx !== rowIndex && r.shift === newValue.name
                              );

                              if (isShiftAlreadyUsed) {
                                toast.warning(
                                  "This shift is already selected in another row."
                                );
                                return;
                              }

                              setRows((prevRows) => ({
                                ...prevRows,
                                [index]: prevRows[index].map((row, rowIdx) =>
                                  rowIdx === rowIndex
                                    ? {
                                        ...row,
                                        shift: newValue.name,
                                        startTime: newValue.startTime,
                                        shiftMinutes: newValue.TotalHours,
                                        endDate: calculateEndDate(
                                          row.startDate,
                                          row.plannedQtyTime,
                                          newValue.TotalHours
                                        ),
                                      }
                                    : row
                                ),
                              }));
                            }}
                            getOptionLabel={(option) => option.name}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Shift"
                                variant="outlined"
                                size="small"
                                placeholder="Select Shift" // Add placeholder for default label
                              />
                            )}
                            renderOption={(props, option) => {
                              // Disable the option if it's already selected in another row
                              const isDisabled = rows[index]?.some(
                                (r) => r.shift === option.name
                              );

                              return (
                                <li
                                  {...props}
                                  style={{
                                    color: isDisabled ? "gray" : "black",
                                    pointerEvents: isDisabled ? "none" : "auto",
                                  }}
                                >
                                  {option.name}
                                </li>
                              );
                            }}
                            disablePortal
                            autoHighlight
                            noOptionsText="No shifts available"
                            disabled={!hasStartDate && index !== 0}
                          />

                          <td>{row.plannedQtyTime} m</td>

                          <td>
                            <Autocomplete
                              options={operators.filter((operator) =>
                                operator.processName.includes(man.name)
                              )}
                              value={
                                operators.find(
                                  (op) => op._id === row.operatorId
                                ) || null
                              }
                              getOptionLabel={(option) => option.name}
                              renderOption={(props, option) => {
                                const isDisabled = rows[index]?.some(
                                  (r) => r.operatorId === option._id
                                );
                                return (
                                  <li
                                    {...props}
                                    style={{
                                      color: isDisabled ? "gray" : "black",
                                      pointerEvents: isDisabled
                                        ? "none"
                                        : "auto",
                                    }}
                                  >
                                    {option.name}
                                  </li>
                                );
                              }}
                              onChange={(event, newValue) => {
                                if (!hasStartDate && index !== 0) return;
                                setRows((prevRows) => {
                                  const updatedRows = [...prevRows[index]];
                                  updatedRows[rowIndex] = {
                                    ...updatedRows[rowIndex],
                                    operatorId: newValue ? newValue._id : "",
                                  };
                                  return { ...prevRows, [index]: updatedRows };
                                });
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Operator"
                                  variant="outlined"
                                  size="small"
                                />
                              )}
                              disableClearable={false}
                              disabled={!hasStartDate && index !== 0}
                            />
                          </td>
                          <td>
                            <span
                              onClick={() =>
                                hasStartDate && deleteRow(index, rowIndex)
                              }
                              style={{
                                color: "red",
                                cursor: hasStartDate
                                  ? "pointer"
                                  : "not-allowed",
                                opacity: hasStartDate ? 1 : 0.5,
                              }}
                            >
                              <MdOutlineDelete size={25} />
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card>
              ))}
              <CardBody className="d-flex justify-content-end align-items-center">
                <Button
                  color="success"
                  onClick={openConfirmationModal}
                  //   disabled={!hasStartDate}
                  disabled={!hasStartDate || remainingQuantities <= 0}
                >
                  Confirm Allocation
                </Button>
              </CardBody>
            </CardBody>
          </Collapse>
        )}
      </Card>

      <Modal
        isOpen={isConfirmationModalOpen}
        toggle={() => setIsConfirmationModalOpen(false)}
        style={{ maxWidth: "600px", margin: "auto", marginTop: "50px" }}
      >
        <ModalHeader toggle={() => setIsConfirmationModalOpen(false)}>
          Confirm Allocation
        </ModalHeader>
        <ModalBody>
          Are you sure you want to confirm the allocation? This action cannot be
          undone.
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={() => {
              handleSubmit();
              setIsConfirmationModalOpen(false);
            }}
          >
            Confirm
          </Button>
          <Button
            color="secondary"
            onClick={() => setIsConfirmationModalOpen(false)}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};
