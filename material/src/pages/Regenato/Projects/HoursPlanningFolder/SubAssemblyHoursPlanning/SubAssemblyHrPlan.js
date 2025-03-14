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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isSameDay, parseISO, getDay, isSameMonth } from "date-fns";

import { AllocatedSubAssemblyPlan } from "./AllocatedSubAssemblyPlan";
export const SubAssemblyHrPlan = ({
  partName,
  manufacturingVariables,
  quantity,
  porjectID,
  subAssemblyListFirstId,
  partListItemId,
}) => {
  const [machineOptions, setMachineOptions] = useState({});
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("actual");
  const [rows, setRows] = useState({});
  const [operators, setOperators] = useState([]);
  const [leaveData, setLeaveData] = useState({});
  const [hasStartDate, setHasStartDate] = useState(false);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [remainingQuantity, setRemainingQuantity] = useState(quantity);
  const [remainingQuantities, setRemainingQuantities] = useState({});
  const [isAutoSchedule, setIsAutoSchedule] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventDates, setEventDates] = useState([]);
  const [isDataAllocated, setIsDataAllocated] = useState(false);
    const [allocatedMachines, setAllocatedMachines] = useState({});

  const openConfirmationModal = () => {
    setIsConfirmationModalOpen(true);
  };
  useEffect(() => {
    fetch(`${process.env.REACT_APP_BASE_URL}/api/eventScheduler/events`)
      .then((response) => response.json())
      .then((data) => {
        let allDates = [];

        data.forEach((event) => {
          let currentDate = new Date(event.startDate);
          const endDate = new Date(event.endDate);

          while (currentDate <= endDate) {
            allDates.push(new Date(currentDate)); // Add each date to the list
            currentDate.setDate(currentDate.getDate() + 1); // Move to next day
          }
        });

        setEventDates(allDates);
      })
      .catch((error) => console.error("Error fetching events:", error));
  }, []);

  useEffect(() => {
    const fetchAllocatedData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/subAssemblyListFirst/${subAssemblyListFirstId}/partsListItems/${partListItemId}/allocation`
        );
        if (response.data.data.length > 0) {
          setIsDataAllocated(true);
        }
      } catch (error) {
        console.error("Error fetching allocated data:", error);
      }
    };

    fetchAllocatedData();
  }, [porjectID, subAssemblyListFirstId, partListItemId]);

  // Function to check if the date is an event date or a Sunday
  const isHighlightedOrDisabled = (date) => {
    return (
      eventDates.some((eventDate) => isSameDay(eventDate, date)) ||
      getDay(date) === 0
    );
  };

  // Custom input component to make it look like a standard date input
  const CustomInput = React.forwardRef(({ value, onClick }, ref) => (
    <input
      type="text"
      value={value}
      onClick={onClick}
      ref={ref}
      readOnly
      placeholder="DD-MM-YY"
      style={{
        padding: "8px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        cursor: "pointer",
      }}
    />
  ));

  // Custom render function for day contents
  const renderDayContents = (day, date) => {
    const isCurrentMonth = isSameMonth(date, selectedDate || new Date());
    const isHighlighted = isHighlightedOrDisabled(date);

    let className = "";
    if (!isCurrentMonth) {
      className = "grayed-out-date";
    } else if (isHighlighted) {
      className = "highlighted-date";
    }

    return <div className={className}>{day}</div>;
  };

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
  // useEffect(() => {
  //   const fetchOperators = async () => {
  //     try {
  //       const response = await fetch(
  //         `${process.env.REACT_APP_BASE_URL}/api/userVariable`
  //       );
  //       const data = await response.json();
  //       if (response.ok) {
  //         setOperators(data); // ✅ Store operators as an array

  //         // Store leave periods separately
  //         const leaveMap = {};
  //         data.forEach((user) => {
  //           if (user.leavePeriod && user.leavePeriod.length > 0) {
  //             leaveMap[user._id] = user.leavePeriod;
  //           }
  //         });
  //         setLeaveData(leaveMap);
  //       }
  //     } catch (err) {
  //       console.error("Error fetching operators", err);
  //     }
  //   };
  //   fetchOperators();
  // }, []);

  // useEffect(() => {
  //   const fetchOperators = async () => {
  //     try {
  //       const response = await fetch(
  //         `${process.env.REACT_APP_BASE_URL}/api/userVariable`
  //       );
  //       const data = await response.json();

  //       if (response.ok) {
  //         // Filter out users who are on leave
  //         const activeOperators = data.filter(
  //           (user) => !user.leavePeriod || user.leavePeriod.length === 0
  //         );

  //         // Set operators as an array
  //         setOperators(activeOperators);

  //         // Store leave periods separately
  //         const leaveMap = {};
  //         data.forEach((user) => {
  //           if (user.leavePeriod && user.leavePeriod.length > 0) {
  //             leaveMap[user._id] = user.leavePeriod;
  //           }
  //         });
  //         setLeaveData(leaveMap);
  //       }
  //     } catch (err) {
  //       console.error("Error fetching operators", err);
  //     }
  //   };

  //   fetchOperators();
  // }, []);

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/userVariable`
        );
        const data = await response.json();

        if (response.ok) {
          // ✅ Ensure operators are only set when data is available
          if (Array.isArray(data) && data.length > 0) {
            // ✅ Exclude leave users when setting operators
            const activeOperators = data.filter(
              (user) => !user.leavePeriod || user.leavePeriod.length === 0
            );

            setOperators(activeOperators);
          } else {
            console.warn("No operators found in API response.");
            setOperators([]); // Set empty array to avoid undefined issues
          }
        }
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

  // const calculateEndDate = (startDate, plannedMinutes, shiftMinutes) => {
  //   console.log("calculateEndDate called with:", {
  //     startDate,
  //     plannedMinutes,
  //     shiftMinutes,
  //   });

  //   if (!startDate) return ""; // Ensure startDate is provided

  //   const parsedDate = new Date(startDate);
  //   if (isNaN(parsedDate.getTime())) return ""; // Ensure startDate is valid

  //   const totalDays = Math.ceil(plannedMinutes / (shiftMinutes || 480)); // Use shiftMinutes

  //   parsedDate.setDate(parsedDate.getDate() + totalDays - 1);

  //   console.log(`Selected shift: ${shiftMinutes}`);
  //   console.log(`Planned minutes: ${plannedMinutes}`);

  //   return parsedDate instanceof Date && !isNaN(parsedDate)
  //     ? parsedDate.toISOString().split("T")[0]
  //     : "";
  // };

  const calculateEndDate = (startDate, plannedMinutes, shiftMinutes) => {
    if (!startDate) return ""; // Ensure startDate is provided

    let parsedDate = new Date(startDate);
    if (isNaN(parsedDate.getTime())) return ""; // Ensure startDate is valid

    let remainingMinutes = plannedMinutes;
    let totalShiftMinutes = shiftMinutes || 480; // Default to 8-hour shift if not provided

    while (remainingMinutes > 0) {
      // Skip Sundays and holidays
      while (
        getDay(parsedDate) === 0 ||
        eventDates.some((d) => isSameDay(d, parsedDate))
      ) {
        parsedDate.setDate(parsedDate.getDate() + 1);
      }

      // If remaining minutes are less than the shift minutes, we don't need to move to the next day
      if (remainingMinutes <= totalShiftMinutes) {
        break;
      }

      // Subtract the shift minutes and move to the next day
      remainingMinutes -= totalShiftMinutes;
      parsedDate.setDate(parsedDate.getDate() + 1);
    }

    return parsedDate.toISOString().split("T")[0];
  };

  const isMachineAvailable = (machineId, startDate, endDate) => {
    if (!allocatedMachines[machineId]) return true; // If no allocations, machine is available

    const parsedStart = new Date(startDate);
    const parsedEnd = new Date(endDate);

    return !allocatedMachines[machineId].some(
      (alloc) =>
        (parsedStart >= alloc.startDate && parsedStart <= alloc.endDate) ||
        (parsedEnd >= alloc.startDate && parsedEnd <= alloc.endDate) ||
        (parsedStart <= alloc.startDate && parsedEnd >= alloc.endDate)
    );
  };

  // const prefillData = (allRows, startDate) => {
  //   let currentDate = new Date(startDate);

  //   manufacturingVariables.forEach((man, index) => {
  //     if (!allRows[index]) return;

  //     allRows[index].forEach((row, rowIdx) => {
  //       const machineList = machineOptions[man.categoryId] || [];
  //       const firstMachine =
  //         machineList.length > 0 ? machineList[0].subcategoryId : "";

  //       const firstOperator =
  //         operators.find((op) => op.processName.includes(man.name)) || {};

  //       const firstShift = shiftOptions.length > 0 ? shiftOptions[0] : null;

  //       const processStartDate = currentDate.toISOString().split("T")[0];

  //       const plannedMinutes = calculatePlannedMinutes(man.hours * quantity);
  //       const processEndDate = calculateEndDate(
  //         processStartDate,
  //         plannedMinutes
  //       );

  //       allRows[index][rowIdx] = {
  //         ...row,
  //         startDate: processStartDate,
  //         endDate: processEndDate,
  //         machineId: firstMachine,
  //         operatorId: firstOperator._id || "",
  //         shift: firstShift ? firstShift.name : "",
  //         startTime: firstShift ? firstShift.startTime : "",
  //       };

  //       currentDate = new Date(processEndDate);
  //       currentDate.setDate(currentDate.getDate() + 1);
  //     });
  //   });

  //   console.log("Prefilled Data:", JSON.stringify(allRows, null, 2));
  //   return { ...allRows }; // Ensure state update
  // };

  // const handleStartDateChange = (index, rowIndex, date) => {
  //   if (index === 0) {
  //     setHasStartDate(!!date);
  //   }

  //   setRows((prevRows) => {
  //     const newRows = { ...prevRows };

  //     if (date) {
  //       if (isAutoSchedule && index === 0) {
  //         return prefillData(newRows, date);
  //       } else {
  //         newRows[index] = newRows[index].map((row, idx) => {
  //           if (idx === rowIndex) {
  //             return {
  //               ...row,
  //               startDate: date,
  //               endDate: calculateEndDate(date, row.plannedQtyTime),
  //             };
  //           }
  //           return row;
  //         });
  //       }
  //     } else {
  //       return manufacturingVariables.reduce((acc, man, idx) => {
  //         acc[idx] = [
  //           {
  //             partType: "Make",
  //             plannedQuantity: quantity,
  //             startDate: "",
  //             endDate: "",
  //             machineId: "",
  //             shift: "Shift A",
  //             plannedQtyTime: calculatePlannedMinutes(man.hours * quantity),
  //             operatorId: "",
  //             processName: man.name,
  //           },
  //         ];
  //         return acc;
  //       }, {});
  //     }
  //     return newRows;
  //   });
  // };

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
          plannedMinutes,
          firstShift ? firstShift.TotalHours : 480
        );

        allRows[index][rowIdx] = {
          ...row,
          startDate: processStartDate,
          endDate: processEndDate,
          machineId: firstMachine,
          operatorId: firstOperator._id || "",
          shift: firstShift ? firstShift.name : "",
          startTime: firstShift ? firstShift.startTime : "",
          shiftMinutes: firstShift ? firstShift.TotalHours : 480,
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
                endDate: calculateEndDate(
                  date,
                  row.plannedQtyTime,
                  row.shiftMinutes
                ),
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

  // const handleSubmit = async () => {
  //   console.log("Submitting allocations...");
  //   console.log("Rows before processing:", JSON.stringify(rows, null, 2));

  //   try {
  //     if (Object.keys(rows).length === 0) {
  //       alert("No allocations to submit.");
  //       return;
  //     }

  //     // Step 1: Group allocations by partName and processName
  //     const groupedAllocations = {};

  //     Object.keys(rows).forEach((index) => {
  //       // Reset order number counter for each process
  //       let orderCounter = 1;

  //       rows[index].forEach((row) => {
  //         if (
  //           row.plannedQuantity &&
  //           row.startDate &&
  //           row.endDate &&
  //           row.machineId &&
  //           row.shift &&
  //           row.operatorId
  //         ) {
  //           const key = `${partName}-${row.processName}`;

  //           if (!groupedAllocations[key]) {
  //             groupedAllocations[key] = {
  //               partName: partName,
  //               processName: row.processName,
  //               allocations: [],
  //             };
  //           }

  //           // Generate order number with padding
  //           const splitNumber = orderCounter.toString().padStart(3, "0");
  //           orderCounter++; // Increment counter for next row in this process

  //           groupedAllocations[key].allocations.push({
  //             splitNumber, // Add the generated order number
  //             plannedQuantity: row.plannedQuantity,
  //             startDate: new Date(row.startDate).toISOString(),
  //             startTime: row.startTime || "08:00 AM",
  //             endDate: new Date(row.endDate).toISOString(),
  //             machineId: row.machineId,
  //             shift: row.shift,
  //             plannedTime: row.plannedQtyTime,
  //             operator:
  //               operators.find((op) => op._id === row.operatorId)?.name ||
  //               "Unknown",
  //           });
  //         }
  //       });
  //     });

  //     const finalAllocations = Object.values(groupedAllocations);

  //     console.log(
  //       "Final Nested Allocations:",
  //       JSON.stringify(finalAllocations, null, 2)
  //     );

  //     const response = await axios.post(
  //       `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/subAssemblyListFirst/${subAssemblyListFirstId}/partsListItems/${partListItemId}/allocation`,
  //       { allocations: finalAllocations }
  //     );

  //     if (response.status === 201) {
  //       toast.success("Allocations successfully added!");
  //       setIsDataAllocated(true); // Update the state to reflect that data is allocated
  //     } else {
  //       toast.error("Failed to add allocations.");
  //     }
  //   } catch (error) {
  //     toast.error(error);
  //   }
  // };

  const handleSubmit = async () => {
    console.log("Submitting allocations...");
    console.log("Rows before processing:", JSON.stringify(rows, null, 2));

    try {
      if (Object.keys(rows).length === 0) {
        alert("No allocations to submit.");
        return;
      }

      // Check if all required fields are filled in for each row
      const areAllFieldsFilled = Object.keys(rows).every((index) =>
        rows[index].every(
          (row) =>
            row.plannedQuantity &&
            row.startDate &&
            row.endDate &&
            row.machineId &&
            row.shift &&
            row.operatorId
        )
      );

      if (!areAllFieldsFilled) {
        toast.error("Please fill in all required fields for each row.");
        return;
      }

      // Check if remaining quantity is zero for all processes
      const isRemainingQuantityZero = Object.keys(remainingQuantities).every(
        (key) => remainingQuantities[key] === 0
      );

      if (!isRemainingQuantityZero) {
        toast.error(
          "Cannot confirm allocation until remaining quantity is zero for all processes."
        );
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
            const splitNumber = orderCounter.toString().padStart(3, "0");
            orderCounter++; // Increment counter for next row in this process

            groupedAllocations[key].allocations.push({
              splitNumber, // Add the generated order number
              AllocationPartType: "Sub Assembly",
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
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/subAssemblyListFirst/${subAssemblyListFirstId}/partsListItems/${partListItemId}/allocation`,
        { allocations: finalAllocations }
      );

      if (response.status === 201) {
        toast.success("Allocations successfully added!");
        setIsDataAllocated(true); // Update the state to reflect that data is allocated
      } else {
        toast.error("Failed to add allocations.");
      }
    } catch (error) {
      toast.error(error);
    }
  };

  const handleDeleteSuccess = () => {
    setIsDataAllocated(false); // Update the state to reflect that data is deleted
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
              disabled={isDataAllocated}
            >
              {isAutoSchedule ? "Auto Schedule ✅" : "Auto Schedule"}
            </Button>
            <Button
              color={activeTab === "planned" ? "primary" : "secondary"}
              onClick={() => setActiveTab("planned")}
            >
              Planned
            </Button>
            {/* <Button
              color={activeTab === "actual" ? "primary" : "secondary"}
              onClick={() => setActiveTab("actual")}
            >
              Actual
            </Button> */}
            <Button
              color={activeTab === "actual" ? "primary" : "secondary"}
              onClick={() => setActiveTab("actual")}
              disabled={isDataAllocated}
            >
              Actual
            </Button>
          </div>
        </CardHeader>

        {activeTab === "planned" && (
          <AllocatedSubAssemblyPlan
            porjectID={porjectID}
            subAssemblyListFirstId={subAssemblyListFirstId}
            partListItemId={partListItemId}
            onDeleteSuccess={handleDeleteSuccess}
          />
        )}
        {activeTab === "actual" && !isDataAllocated && (
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
                      Add Row
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
                            <DatePicker
                              selected={
                                row.startDate ? new Date(row.startDate) : null
                              }
                              onChange={(date) =>
                                handleStartDateChange(index, rowIndex, date)
                              }
                              dayClassName={(date) =>
                                isHighlightedOrDisabled(date)
                                  ? "highlighted-date"
                                  : ""
                              }
                              renderDayContents={renderDayContents}
                              customInput={<CustomInput />}
                              dateFormat="dd-MM-yyyy"
                            />

                            <style>{`
                                .highlighted-date {
                                  background-color: #f06548 !important;
                                  color: black !important;
                                  border-radius: 50%;
                                }
                                .grayed-out-date {
                                   color: #ccc !important;
                                  //  disabled
                                  // display:none
                                }
                              `}</style>
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
                            <Autocomplete
                              options={
                                machineOptions[man.categoryId]?.filter(
                                  (machine) =>
                                    isMachineAvailable(
                                      machine.subcategoryId,
                                      row.startDate,
                                      row.endDate
                                    )
                                ) || []
                              }
                              value={
                                machineOptions[man.categoryId]?.find(
                                  (machine) =>
                                    machine.subcategoryId === row.machineId
                                ) || null
                              }
                              getOptionLabel={(option) =>
                                `${option.name} ${
                                  isMachineAvailable(
                                    option.subcategoryId,
                                    row.startDate,
                                    row.endDate
                                  )
                                    ? ""
                                    : "(Occupied)"
                                }`
                              }
                              renderOption={(props, option) => {
                                const isDisabled = !isMachineAvailable(
                                  option.subcategoryId,
                                  row.startDate,
                                  row.endDate
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
                                    {option.name}{" "}
                                    {isDisabled ? "(Occupied)" : ""}
                                  </li>
                                );
                              }}
                              onChange={(event, newValue) => {
                                if (!hasStartDate) return;

                                // Check if the machine is already selected in the same row
                                const isMachineAlreadyUsedInRow = rows[
                                  index
                                ]?.some(
                                  (r, idx) =>
                                    idx !== rowIndex &&
                                    r.machineId === newValue.subcategoryId
                                );

                                if (isMachineAlreadyUsedInRow) {
                                  toast.warning(
                                    "This machine is already selected in another row."
                                  );
                                  return;
                                }

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
                            />
                          </td>

                          <Autocomplete
                            options={shiftOptions || []}
                            value={
                              shiftOptions.find(
                                (option) => option.name === row.shift
                              ) || null
                            }
                            onChange={(event, newValue) => {
                              if (!newValue) return;

                              // No uniqueness check for shift (allow multiple selections)
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
                                placeholder="Select Shift"
                              />
                            )}
                            disablePortal
                            autoHighlight
                            noOptionsText="No shifts available"
                            disabled={!hasStartDate && index !== 0}
                          />

                          <td>{row.plannedQtyTime} m</td>

                          <td>
                            {/* <Autocomplete
                              options={operators}
                              value={
                                operators.find(
                                  (op) => op._id === row.operatorId
                                ) || null
                              }
                              getOptionLabel={(option) => option.name || ""}
                              renderOption={(props, option) => (
                                <li
                                  {...props}
                                  style={{
                                    color: option.leave ? "gray" : "black",
                                  }}
                                >
                                  {option.name} {option.leave ? "(leave)" : ""}
                                </li>
                              )}
                              onChange={(event, newValue) => {
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
                            /> */}
                            <Autocomplete
                              options={operators}
                              value={
                                operators.find(
                                  (op) => op._id === row.operatorId
                                ) || null
                              }
                              getOptionLabel={(option) => option.name || ""}
                              renderOption={(props, option) => {
                                // Check if the operator is already assigned in an overlapping date range
                                const isOperatorAlreadySelected = rows[
                                  index
                                ]?.some(
                                  (r) =>
                                    r.operatorId === option._id &&
                                    new Date(r.startDate) <=
                                      new Date(rows[index][rowIndex].endDate) &&
                                    new Date(r.endDate) >=
                                      new Date(rows[index][rowIndex].startDate)
                                );

                                return (
                                  <li
                                    {...props}
                                    style={{
                                      color: isOperatorAlreadySelected
                                        ? "lightgray"
                                        : "black",
                                      pointerEvents: isOperatorAlreadySelected
                                        ? "none"
                                        : "auto",
                                    }}
                                  >
                                    {option.name}{" "}
                                    {isOperatorAlreadySelected
                                      ? "(Already Selected)"
                                      : ""}
                                  </li>
                                );
                              }}
                              onChange={(event, newValue) => {
                                if (!newValue) return;

                                const newOperatorId = newValue._id;
                                const newStartDate = new Date(
                                  rows[index][rowIndex].startDate
                                );
                                const newEndDate = new Date(
                                  rows[index][rowIndex].endDate
                                );

                                // Check if the operator is already selected in an overlapping date range
                                const isOperatorAlreadySelected = rows[
                                  index
                                ]?.some(
                                  (r, idx) =>
                                    idx !== rowIndex &&
                                    r.operatorId === newOperatorId &&
                                    newStartDate <= new Date(r.endDate) &&
                                    newEndDate >= new Date(r.startDate)
                                );

                                if (isOperatorAlreadySelected) {
                                  toast.warning(
                                    "This operator is already assigned within this date range."
                                  );
                                  return;
                                }

                                // Proceed with setting the operator if validation passes
                                setRows((prevRows) => {
                                  const updatedRows = [...prevRows[index]];
                                  updatedRows[rowIndex] = {
                                    ...updatedRows[rowIndex],
                                    operatorId: newOperatorId,
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
                  disabled={
                    !hasStartDate ||
                    !Object.keys(remainingQuantities).every(
                      (key) => remainingQuantities[key] === 0
                    ) ||
                    !Object.keys(rows).every((index) =>
                      rows[index].every(
                        (row) =>
                          row.plannedQuantity &&
                          row.startDate &&
                          row.endDate &&
                          row.machineId &&
                          row.shift &&
                          row.operatorId
                      )
                    )
                  }
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
