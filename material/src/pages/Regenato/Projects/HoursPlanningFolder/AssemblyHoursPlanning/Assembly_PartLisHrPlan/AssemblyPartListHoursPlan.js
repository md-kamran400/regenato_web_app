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
// import AllocatedPartListHrPlan from "./AllocatedPartListHrPlan";
import { toast } from "react-toastify";
// import { AllocatedSubAssemblyPlan } from "./AllocatedSubAssemblyPlan";

export const AssemblyPartListHoursPlan = ({
  partName,
  manufacturingVariables,
  quantity,
  porjectID,
  AssemblyListId,
  partListItemId,
//   porjectID={_id}
//   AssemblyListId={assemblypartsListId}
//   partListItemId={item._id}
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
            totalMinutes: parseFloat(shift.TotalHours) * 60,
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
          machineData[man.categoryId] = response.data.subCategories;
        } catch (error) {
          console.error("Error fetching machines:", error);
        }
      }
      setMachineOptions(machineData);
    };
    fetchMachines();
  }, [manufacturingVariables]);

  console.log(manufacturingVariables);

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
          shift: "Shift A",
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

  // const calculateEndDate = (startDate, plannedMinutes) => {
  //   if (!startDate) return "";

  //   const minutesPerDay = 480; // 8 hours per day
  //   const daysNeeded = Math.ceil(plannedMinutes / minutesPerDay);

  //   const endDate = new Date(startDate);
  //   endDate.setDate(endDate.getDate() + daysNeeded - 1);

  //   return endDate.toISOString().split("T")[0];
  // };
  const calculateEndDate = (startDate, plannedMinutes, shiftMinutes) => {
    if (!startDate) return ""; // Ensure startDate is provided

    const parsedDate = new Date(startDate);
    if (isNaN(parsedDate.getTime())) return ""; // Ensure startDate is valid

    const totalDays = Math.ceil(plannedMinutes / (shiftMinutes || 480)); // Default to 480 min if shiftMinutes is missing
    parsedDate.setDate(parsedDate.getDate() + totalDays - 1);

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
      // Only handle start date change for first process
      setHasStartDate(!!date);

      setRows((prevRows) => {
        const newRows = { ...prevRows };
        if (date) {
          // If start date is set, prefill all data
          return prefillData(newRows, date);
        } else {
          // If start date is cleared, reset all data
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
      });
    }
  };

  // const toggle = () => setIsOpen(!isOpen);

  const addRow = (index) => {
    if (!hasStartDate) return; // Prevent adding rows before start date is set

    setRows((prevRows) => ({
      ...prevRows,
      [index]: [
        ...(prevRows[index] || []),
        {
          partType: "Make",
          plannedQuantity: quantity,
          startDate: "",
          endDate: "",
          machineId: "",
          shift: "Shift A",
          plannedQtyTime: calculatePlannedMinutes(
            manufacturingVariables[index].hours * quantity
          ),
          operatorId: "",
          processName: manufacturingVariables[index].name,
        },
      ],
    }));
  };

  const deleteRow = (index, rowIndex) => {
    setRows((prevRows) => {
      const updatedRows = [...prevRows[index]];
      updatedRows.splice(rowIndex, 1);
      return {
        ...prevRows,
        [index]: updatedRows.length
          ? updatedRows
          : [
              {
                partType: "Make",
                plannedQuantity: quantity,
                startDate: "",
                endDate: "",
                machineId: "",
                shift: "Shift A",
                plannedQtyTime: calculatePlannedMinutes(
                  manufacturingVariables[index].hours * quantity
                ),
                operatorId: "",
                processName: manufacturingVariables[index].name,
              },
            ],
      };
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
            groupedAllocations[key].allocations.push({
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

      // Step 2: Convert object to an array
      const finalAllocations = Object.values(groupedAllocations);

      console.log(
        "Final Nested Allocations:",
        JSON.stringify(finalAllocations, null, 2)
      );

      // Step 3: API Call"/projects/:projectId/assemblyList/:assemblyListId/partsListItems/:partsListItemsId/allocation",
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/assemblyList/${AssemblyListId}/partsListItems/${partListItemId}/allocation`,
        { allocations: finalAllocations } // Send nested data
      );
      if (response.status === 201) {
        // alert("Allocations successfully added!");
        toast.success("Allocations successfully added!");
      } else {
        // alert("Failed to add allocations.");
        toast.error("Failed to add allocations.");
      }
    } catch (error) {
      // console.error("Error submitting allocations:", error);
      // alert("An error occurred while submitting the allocations.");
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
        {/* {activeTab === "planned" && (
          <AllocatedSubAssemblyPlan
            porjectID={porjectID}
            subAssemblyListFirstId={subAssemblyListFirstId}
            partListItemId={partListItemId}
          />
        )} */}
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
                      }}
                    >
                      {`${man.categoryId} - ${man.name}`}
                    </span>
                    <Button
                      color="primary"
                      onClick={() => addRow(index)}
                      disabled={!hasStartDate}
                    >
                      Add Row
                    </Button>
                  </CardHeader>
                  <Table bordered responsive>
                    <thead>
                      <tr>
                        {/* <th style={{ width: "15%" }}>Part Type</th> */}
                        <th>Planned Quantity</th>
                        <th style={{ width: "15%" }}>Start Date</th>
                        <th style={{ width: "15%" }}>Start Time</th>
                        <th style={{ width: "15%" }}>End Date</th>
                        <th style={{ width: "25%" }}>Machine ID</th>
                        <th style={{ width: "15%" }}>Shifts</th>
                        <th>Planned Qty Time</th>
                        <th style={{ width: "30%" }}>Operator</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows[index]?.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {/* <td>
                          <Input 
                            type="select" 
                            value={row.partType}
                            disabled={!hasStartDate && index !== 0}
                          >
                            <option>Select Part</option>
                            <option value="Make">Make</option>
                            <option value="Purchase">Purchase</option>
                          </Input>
                        </td> */}
                          <td>
                            <Input
                              type="number"
                              min="0"
                              value={row.plannedQuantity}
                            />
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
                              value={row.startTime || ""}
                              // readOnly
                            />
                          </td>

                          <td>
                            <Input type="date" value={row.endDate} />
                          </td>
                          {/* <td>
                            <Input
                              type="time"
                              value={selectedShift?.startTime || ""}
                              onChange={(e) => {
                                setSelectedShift((prev) =>
                                  prev
                                    ? { ...prev, startTime: e.target.value }
                                    : null
                                );
                              }}
                            />
                          </td> */}
                          <td>
                            <Autocomplete
                              options={machineOptions[man.categoryId] || []}
                              value={
                                machineOptions[man.categoryId]?.find(
                                  (machine) =>
                                    machine.subcategoryId === row.machineId
                                ) || null
                              }
                              getOptionLabel={(option) =>
                                `${option.subcategoryId} - ${option.name}`
                              }
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
                                    {option.subcategoryId} - {option.name}
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

                          <td>
                            <Autocomplete
                              options={shiftOptions || []}
                              value={
                                shiftOptions.find(
                                  (option) => option.name === row.shift
                                ) || null
                              } // Find the matching shift
                              onChange={(event, newValue) => {
                                if (!newValue) return; // Skip if nothing is selected

                                const existingSelection = rows[index]?.find(
                                  (item) => item.shift === newValue.name
                                );

                                if (existingSelection) {
                                  return;
                                }

                                setRows((prevRows) => ({
                                  ...prevRows,
                                  [index]: prevRows[index].map((row, rowIdx) =>
                                    rowIdx === rowIndex
                                      ? {
                                          ...row,
                                          shift: newValue.name, // Store shift name
                                          startTime: newValue.startTime, // Store start time
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
                                />
                              )}
                              disablePortal
                              autoHighlight
                              noOptionsText="No shifts available"
                              disabled={!hasStartDate && index !== 0}
                            />
                          </td>

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
                  disabled={!hasStartDate}
                >
                  Confirm Allocation
                </Button>
                {/* <Button color="success" onClick={handleSubmit}>
                  Confirm Allocation
                </Button> */}
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
