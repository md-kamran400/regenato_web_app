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

import { AllocatedAssembly_subAssembly } from "./AllocatedAssembly_subAssembly";

export const Assembly_SubAssemblyHoursPlanning = ({
  partName,
  manufacturingVariables,
  quantity,
  porjectID,
  AssemblyListId,
  subAssembliesId,
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
  const openConfirmationModal = () => {
    setIsConfirmationModalOpen(true);
  };
  const [remainingQuantity, setRemainingQuantity] = useState(quantity);
  const [remainingQuantities, setRemainingQuantities] = useState({});
  const [isAutoSchedule, setIsAutoSchedule] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventDates, setEventDates] = useState([]);
  const [isDataAllocated, setIsDataAllocated] = useState(false);
  const [allocatedMachines, setAllocatedMachines] = useState({});
  const [operatorAllocations, setOperatorAllocations] = useState({});

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
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/assemblyList/${AssemblyListId}/subAssemblies/${subAssembliesId}/partsListItems/${partListItemId}/allocations`
        );
        if (response.data.data.length > 0) {
          setIsDataAllocated(true);
          setActiveTab("planned");
        }
      } catch (error) {
        console.error("Error fetching allocated data:", error);
      }
    };

    fetchAllocatedData();
  }, [porjectID, AssemblyListId, partListItemId]);

  useEffect(() => {
    const fetchAllocations = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/all-allocations`
        );
        if (response.data && response.data.data) {
          const machineAllocations = {};
          const operatorAllocations = {};

          response.data.data.forEach((project) => {
            project.allocations.forEach((process) => {
              process.allocations.forEach((alloc) => {
                // Process machine allocations
                if (alloc.machineId) {
                  if (!machineAllocations[alloc.machineId]) {
                    machineAllocations[alloc.machineId] = [];
                  }
                  machineAllocations[alloc.machineId].push({
                    startDate: new Date(alloc.startDate),
                    endDate: new Date(alloc.endDate),
                  });
                }

                // Process operator allocations
                if (alloc.operator) {
                  if (!operatorAllocations[alloc.operator]) {
                    operatorAllocations[alloc.operator] = [];
                  }
                  operatorAllocations[alloc.operator].push({
                    startDate: new Date(alloc.startDate),
                    endDate: new Date(alloc.endDate),
                  });
                }
              });
            });
          });

          setAllocatedMachines(machineAllocations);
          setOperatorAllocations(operatorAllocations);
        }
      } catch (error) {
        console.error("Error fetching allocations:", error);
      }
    };

    fetchAllocations();
  }, []);

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

  const isMachineOnDowntimeDuringPeriod = (machine, startDate, endDate) => {
    if (!machine?.downtimeHistory?.length || !startDate || !endDate) {
      return { isDowntime: false, downtimeMinutes: 0 };
    }

    const now = new Date();
    const periodStart = new Date(startDate);
    const periodEnd = new Date(endDate);

    // Find active downtimes that overlap with the selected period
    const activeDowntimes = machine.downtimeHistory.filter((downtime) => {
      if (downtime.isCompleted) return false;

      const dtStart = new Date(downtime.startTime);
      const dtEnd = new Date(downtime.endTime);

      return dtStart < periodEnd && dtEnd > periodStart && dtEnd > now;
    });

    if (activeDowntimes.length === 0) {
      return { isDowntime: false, downtimeMinutes: 0 };
    }

    // Calculate total downtime minutes within the selected period
    let totalMinutes = 0;
    activeDowntimes.forEach((downtime) => {
      const dtStart = new Date(
        Math.max(new Date(downtime.startTime), periodStart)
      );
      const dtEnd = new Date(Math.min(new Date(downtime.endTime), periodEnd));
      totalMinutes += Math.ceil((dtEnd - dtStart) / (1000 * 60));
    });

    return {
      isDowntime: true,
      downtimeMinutes: totalMinutes,
      downtimeReason: activeDowntimes[0]?.reason || "Maintenance",
    };
  };

  const calculateEndDateWithDowntime = (
    startDate,
    plannedMinutes,
    shiftMinutes = 480,
    machine
  ) => {
    if (!startDate || !plannedMinutes) return "";

    let parsedDate = new Date(startDate);
    if (isNaN(parsedDate.getTime())) return "";

    let remainingMinutes = plannedMinutes;
    let currentDate = new Date(parsedDate);
    let daysAdded = 0;

    while (remainingMinutes > 0) {
      // Skip non-working days (Sundays and holidays)
      while (
        getDay(currentDate) === 0 ||
        eventDates.some((d) => isSameDay(d, currentDate))
      ) {
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Check if machine has downtime on this day
      const downtimeOnDay = machine?.downtimeHistory?.find((downtime) => {
        const downtimeStart = new Date(downtime.startTime);
        const downtimeEnd = new Date(downtime.endTime);
        return (
          !downtime.isCompleted &&
          isSameDay(downtimeStart, currentDate) &&
          downtimeEnd > downtimeStart
        );
      });

      if (downtimeOnDay) {
        // Calculate downtime duration in minutes
        const downtimeStart = new Date(downtimeOnDay.startTime);
        const downtimeEnd = new Date(downtimeOnDay.endTime);
        const downtimeMinutes = Math.ceil(
          (downtimeEnd - downtimeStart) / (1000 * 60)
        );

        // Add downtime minutes to remaining work
        remainingMinutes += downtimeMinutes;
      }

      // Subtract a day's worth of work
      const minutesToDeduct = Math.min(remainingMinutes, shiftMinutes);
      remainingMinutes -= minutesToDeduct;

      // Move to next day if there's still work remaining
      if (remainingMinutes > 0) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return currentDate.toISOString().split("T")[0];
  };

  const isOperatorAvailable = (operatorName, startDate, endDate) => {
    if (!operatorAllocations[operatorName]) return true; // If no allocations, operator is available

    const parsedStart = new Date(startDate);
    const parsedEnd = new Date(endDate);

    return !operatorAllocations[operatorName].some(
      (alloc) =>
        (parsedStart >= alloc.startDate && parsedStart <= alloc.endDate) ||
        (parsedEnd >= alloc.startDate && parsedEnd <= alloc.endDate) ||
        (parsedStart <= alloc.startDate && parsedEnd >= alloc.endDate)
    );
  };

  const isOperatorOnLeave = (operator, startDate, endDate) => {
    if (!operator.leavePeriod || operator.leavePeriod.length === 0)
      return false;

    const parsedStart = startDate ? new Date(startDate) : null;
    const parsedEnd = endDate ? new Date(endDate) : null;

    if (!parsedStart || !parsedEnd) return false;

    return operator.leavePeriod.some((leave) => {
      const leaveStart = new Date(leave.startDate);
      const leaveEnd = new Date(leave.endDate);

      return (
        (parsedStart >= leaveStart && parsedStart <= leaveEnd) ||
        (parsedEnd >= leaveStart && parsedEnd <= leaveEnd) ||
        (parsedStart <= leaveStart && parsedEnd >= leaveEnd)
      );
    });
  };

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

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/userVariable`
        );
        const data = await response.json();
        setOperators(data);
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
    if (!startDate) return "";

    let parsedDate = new Date(startDate);
    if (isNaN(parsedDate.getTime())) return "";

    let remainingMinutes = plannedMinutes;
    let totalShiftMinutes = shiftMinutes || 480;

    while (remainingMinutes > 0) {
      parsedDate.setDate(parsedDate.getDate() + 1);
      while (
        getDay(parsedDate) === 0 ||
        eventDates.some((d) => isSameDay(d, parsedDate))
      ) {
        parsedDate.setDate(parsedDate.getDate() + 1);
      }
      remainingMinutes -= totalShiftMinutes;

      if (remainingMinutes > 0) {
        parsedDate.setDate(parsedDate.getDate() + 1);
      }
    }

    if (parsedDate < new Date(startDate)) {
      parsedDate = new Date(startDate);
    }

    return parsedDate.toISOString().split("T")[0];
  };

  const prefillData = (allRows, startDate) => {
    let currentDate = new Date(startDate);

    manufacturingVariables.forEach((man, index) => {
      if (!allRows[index]) return;

      allRows[index].forEach((row, rowIdx) => {
        const machineList = machineOptions[man.categoryId] || [];
        const firstAvailableMachine = machineList.find((machine) =>
          isMachineAvailable(
            machine.subcategoryId,
            currentDate,
            calculateEndDate(currentDate, row.plannedQtyTime)
          )
        );

        const firstMachine = firstAvailableMachine
          ? firstAvailableMachine.subcategoryId
          : "";

        const firstOperator = operators.find((op) =>
          isOperatorAvailable(
            op.name,
            currentDate,
            calculateEndDate(currentDate, row.plannedQtyTime)
          )
        );

        const firstShift = shiftOptions.length > 0 ? shiftOptions[0] : null;

        const processStartDate = currentDate.toISOString().split("T")[0];
        const plannedMinutes = calculatePlannedMinutes(man.hours * quantity);
        const processEndDate = calculateEndDate(
          processStartDate,
          plannedMinutes,
          firstShift?.TotalHours
        );

        allRows[index][rowIdx] = {
          ...row,
          startDate: processStartDate,
          endDate: processEndDate,
          machineId: firstMachine,
          operatorId: firstOperator ? firstOperator._id : "",
          shift: firstShift ? firstShift.name : "",
          startTime: firstShift ? firstShift.startTime : "",
        };

        currentDate = new Date(processEndDate);
        currentDate.setDate(currentDate.getDate() + 1);

        while (
          getDay(currentDate) === 0 ||
          eventDates.some((d) => isSameDay(d, currentDate))
        ) {
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });
    });

    return { ...allRows };
  };

  const formatDate = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`; // Format: YYYY-MM-DD
  };

  const getNextWorkingDay = (date) => {
    let nextDay = new Date(date);
    while (isHighlightedOrDisabled(nextDay)) {
      nextDay.setDate(nextDay.getDate() + 1);
    }
    return nextDay;
  };

  const calculateStartAndEndDates = (
    inputStartDate,
    plannedMinutes,
    shiftMinutes = 480
  ) => {
    let parsedStartDate = new Date(inputStartDate);
    let remainingMinutes = plannedMinutes;
    let totalShiftMinutes = shiftMinutes;
    let currentDate = new Date(parsedStartDate);

    // Skip holidays or Sundays initially
    while (
      getDay(currentDate) === 0 ||
      eventDates.some((d) => isSameDay(d, currentDate))
    ) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Keep track of start date
    const startDate = new Date(currentDate);

    // Loop to calculate how many days needed
    while (remainingMinutes > 0) {
      // If it's a working day
      if (
        getDay(currentDate) !== 0 &&
        !eventDates.some((d) => isSameDay(d, currentDate))
      ) {
        remainingMinutes -= totalShiftMinutes;
      }

      // If remaining minutes still left, go to next day
      if (remainingMinutes > 0) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // Final end date
    const endDate = new Date(currentDate);

    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    };
  };

  const handleStartDateChange = (index, rowIndex, date) => {
    if (!date) return;

    const nextWorkingDay = getNextWorkingDay(date);

    if (index === 0) {
      setHasStartDate(!!nextWorkingDay);
    }

    setRows((prevRows) => {
      const newRows = { ...prevRows };

      // === AUTO SCHEDULE MODE ===
      if (isAutoSchedule && index === 0) {
        let currentDate = new Date(nextWorkingDay);

        manufacturingVariables.forEach((man, processIndex) => {
          const shift = shiftOptions.length > 0 ? shiftOptions[0] : null;

          newRows[processIndex] = newRows[processIndex].map((row) => {
            const { startDate, endDate } = calculateStartAndEndDates(
              currentDate,
              row.plannedQtyTime,
              shift?.TotalHours
            );

            // 👉 Auto-pick Machine
            const machineList = machineOptions[man.categoryId] || [];
            const firstAvailableMachine = machineList.find((machine) =>
              isMachineAvailable(machine.subcategoryId, startDate, endDate)
            );

            const machineId = firstAvailableMachine
              ? firstAvailableMachine.subcategoryId
              : "";

            // 👉 Auto-pick Operator
            const firstOperator = operators.find((op) =>
              isOperatorAvailable(op.name, startDate, endDate)
            );

            // Prepare for next process
            currentDate = new Date(endDate);
            currentDate.setDate(currentDate.getDate() + 1);
            currentDate = getNextWorkingDay(currentDate);

            return {
              ...row,
              startDate,
              endDate,
              shift: shift?.name || "",
              startTime: shift?.startTime || "",
              machineId: machineId,
              operatorId: firstOperator ? firstOperator._id : "",
            };
          });
        });

        return newRows;
      }
      // === MANUAL MODE ===
      else {
        const shift = shiftOptions.find(
          (option) => option.name === newRows[index][rowIndex].shift
        );

        newRows[index] = newRows[index].map((row, idx) => {
          if (idx === rowIndex) {
            const { startDate, endDate } = calculateStartAndEndDates(
              nextWorkingDay,
              row.plannedQtyTime,
              shift?.TotalHours
            );

            return {
              ...row,
              startDate,
              endDate,
              // MachineId and OperatorId remain as they are (empty)
              // So user picks manually
            };
          }
          return row;
        });
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

  const isAllFieldsFilled = () => {
    return Object.keys(rows).every((index) => {
      return rows[index].every((row) => {
        return (
          row.plannedQuantity &&
          row.startDate &&
          row.endDate &&
          row.machineId &&
          row.shift &&
          row.operatorId
        );
      });
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
        const man = manufacturingVariables[index]; // Get the manufacturing variable for this process
        let orderCounter = 1;

        rows[index].forEach((row, rowIndex) => {
          console.log(`Processing row ${rowIndex} in process ${index}:`, row);

          // Check if all required fields are present
          if (
            row.plannedQuantity &&
            row.startDate &&
            row.endDate &&
            row.machineId &&
            row.shift &&
            row.operatorId
          ) {
            const key = `${partName}-${man.categoryId}-${man.name}`; // Include both categoryId and name in key

            if (!groupedAllocations[key]) {
              groupedAllocations[key] = {
                partName: partName,
                processName: `${man.categoryId} - ${man.name}`, // Combine categoryId and name
                processId: man.categoryId, // Add processId here
                allocations: [],
              };
            }

            // Generate order number with padding
            const splitNumber = orderCounter.toString().padStart(3, "0");
            orderCounter++;
            const selectedShift = shiftOptions.find(
              (shift) => shift.name === row.shift
            );

            groupedAllocations[key].allocations.push({
              splitNumber,
              AllocationPartType: "Part",
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
              shiftTotalTime: selectedShift ? selectedShift.TotalHours : 0,
              perMachinetotalTime: Math.ceil(man.hours * 60),
              processId: man.categoryId, // Add processId to each allocation as well
            });
          } else {
            console.warn(
              `Skipping row ${rowIndex} in process ${index} due to missing or invalid fields:`,
              row
            );
          }
        });
      });

      // Convert groupedAllocations object to an array
      const finalAllocations = Object.values(groupedAllocations);

      console.log(
        "Final Nested Allocations:",
        JSON.stringify(finalAllocations, null, 2)
      );

      if (finalAllocations.length === 0) {
        toast.error(
          "No valid allocations to submit. Please check your inputs."
        );
        return;
      }

      // Send the grouped allocations to the backend
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/assemblyList/${AssemblyListId}/subAssemblies/${subAssembliesId}/partsListItems/${partListItemId}/allocation`,
        { allocations: finalAllocations }
      );

      if (response.status === 201) {
        toast.success("Allocations successfully added!");
        setIsDataAllocated(true);
      } else {
        toast.error("Failed to add allocations.");
      }
    } catch (error) {
      console.error("Error submitting allocations:", error);
      toast.error("An error occurred while submitting allocations.");
    }
  };

  const handleDeleteSuccess = () => {
    setIsDataAllocated(false);
  };

  // Add this function in your component
  const calculateEndTime = (startTime, plannedMinutes) => {
    if (!startTime || !plannedMinutes) return "";

    // Parse the start time (format: "HH:MM")
    const [hours, minutes] = startTime.split(":").map(Number);

    // Create a date object (we just need it for calculations)
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    // Add the planned minutes
    date.setMinutes(date.getMinutes() + plannedMinutes);

    // Format back to HH:MM
    const endHours = String(date.getHours()).padStart(2, "0");
    const endMinutes = String(date.getMinutes()).padStart(2, "0");

    return `${endHours}:${endMinutes}`;
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
          <AllocatedAssembly_subAssembly
            porjectID={porjectID}
            AssemblyListId={AssemblyListId}
            subAssembliesId={subAssembliesId}
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
                  <Table bordered>
                    <thead>
                      <tr>
                        <th>Planned QTY</th>
                        <th>Planned Time</th>
                        <th style={{ width: "20%" }}>Shift</th>
                        <th style={{ width: "10%" }}>Start Time</th>
                        <th style={{ width: "10%" }}>Start Date</th>
                        <th>End Time</th>
                        <th style={{ width: "8%" }}>End Date</th>
                        <th style={{ width: "25%" }}>Machine ID</th>
                        <th style={{ width: "25%" }}>Operator</th>
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
                                onWheel={(e) => e.target.blur()}
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "ArrowUp" ||
                                    e.key === "ArrowDown"
                                  ) {
                                    e.preventDefault();
                                  }
                                }}
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
                          <td>{row.plannedQtyTime} m</td>
                          <td>
                            <Autocomplete
                              options={shiftOptions || []}
                              value={
                                shiftOptions.find(
                                  (option) => option.name === row.shift
                                ) || null
                              }
                              onChange={(event, newValue) => {
                                if (!newValue) return;

                                setRows((prevRows) => ({
                                  ...prevRows,
                                  [index]: prevRows[index].map(
                                    (row, rowIdx) => {
                                      if (rowIdx === rowIndex) {
                                        let updatedEndDate = row.endDate;
                                        // Only recalculate if startDate exists
                                        if (row.startDate) {
                                          const recalculated =
                                            calculateStartAndEndDates(
                                              row.startDate,
                                              row.plannedQtyTime,
                                              newValue.TotalHours
                                            );
                                          updatedEndDate = recalculated.endDate;
                                        }
                                        return {
                                          ...row,
                                          shift: newValue.name,
                                          startTime: newValue.startTime,
                                          shiftMinutes: newValue.TotalHours,
                                          endDate: updatedEndDate,
                                        };
                                      }
                                      return row;
                                    }
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

                          <td style={{ width: "180px" }}>
                            <DatePicker
                              selected={
                                row.startDate ? new Date(row.startDate) : null
                              }
                              onChange={(date) => {
                                if (!date) return;

                                // Perform machine availability check
                                const isAvailable = isMachineAvailable(
                                  row.machineId,
                                  date,
                                  row.endDate
                                );

                                if (isAvailable) {
                                  handleStartDateChange(index, rowIndex, date);
                                } else {
                                  toast.error(
                                    "This machine is occupied during the selected dates."
                                  );
                                }
                              }}
                              dayClassName={(date) =>
                                isMachineAvailable(
                                  row.machineId,
                                  date,
                                  row.endDate
                                )
                                  ? ""
                                  : "highlighted-date"
                              }
                              renderDayContents={renderDayContents}
                              customInput={<CustomInput />}
                              dateFormat="dd-MM-yyyy"
                              wrapperClassName="small-datepicker"
                            />

                            <style>{`
                              .highlighted-date {
                                background-color: #f06548 !important;
                                color: black !important;
                                border-radius: 50%;
                              }
                              .grayed-out-date {
                                color: #ccc !important;
                              }
                              .small-datepicker input {
                                width: 130px !important;
                                font-size: 15px !important;
                                padding: 7px !important;

                              }
                            `}</style>
                          </td>
                          <td>
                            <Input
                              type="time"
                              value={calculateEndTime(
                                row.startTime,
                                row.plannedQtyTime
                              )}
                              readOnly
                              style={{
                                cursor: "not-allowed",
                                backgroundColor: "#f8f9fa",
                              }}
                            />
                          </td>
                          <td style={{ width: "180px" }}>
                            <DatePicker
                              selected={
                                row.endDate ? new Date(row.endDate) : null
                              }
                              onChange={() => {}} // Empty function to prevent changes
                              dayClassName={(date) =>
                                isMachineAvailable(
                                  row.machineId,
                                  row.startDate,
                                  date
                                )
                                  ? ""
                                  : "highlighted-date"
                              }
                              renderDayContents={renderDayContents}
                              customInput={<CustomInput />}
                              dateFormat="dd-MM-yyyy"
                              wrapperClassName="small-datepicker"
                              disabled
                              readOnly
                            />

                            <style>{`
                              .highlighted-date {
                                background-color: #f06548 !important;
                                color: black !important;
                                border-radius: 50%;
                              }
                              .grayed-out-date {
                                color: #ccc !important;
                              }
                              .small-datepicker input {
                                width: 130px !important;
                                font-size: 15px !important;
                                padding: 7px !important;
                               
                                cursor: not-allowed;
                              }
                              .react-datepicker-wrapper {
                                opacity: 1; /* Ensure it doesn't look faded */
                              }
                                  `}</style>
                          </td>

                          <td>
                            <Autocomplete
                              sx={{ width: 180, margin: "auto" }}
                              componentsProps={{
                                paper: {
                                  sx: {
                                    width: 350,
                                    left: "15% !important",
                                    transform: "translateX(-15%) !important",
                                  },
                                },
                              }}
                              options={machineOptions[man.categoryId] || []}
                              value={
                                machineOptions[man.categoryId]?.find(
                                  (machine) =>
                                    machine.subcategoryId === row.machineId
                                ) || null
                              }
                              getOptionLabel={(option) => {
                                const downtimeInfo =
                                  isMachineOnDowntimeDuringPeriod(
                                    option,
                                    row.startDate,
                                    row.endDate
                                  );

                                // Always show downtime status in the label
                                return downtimeInfo.isDowntime
                                  ? `${option.name} (Downtime: ${downtimeInfo.downtimeMinutes}min)`
                                  : `${option.name} (Available)`;
                              }}
                              renderOption={(props, option) => {
                                const downtimeInfo =
                                  isMachineOnDowntimeDuringPeriod(
                                    option,
                                    row.startDate,
                                    row.endDate
                                  );

                                return (
                                  <li
                                    {...props}
                                    style={{
                                      color: downtimeInfo.isDowntime
                                        ? "orange"
                                        : "black",
                                      backgroundColor: "white",
                                      display: "flex",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <div>
                                      <span style={{ fontWeight: "bold" }}>
                                        {option.name}
                                      </span>
                                      {downtimeInfo.isDowntime ? (
                                        <span
                                          style={{
                                            color: "orange",
                                            marginLeft: "8px",
                                          }}
                                        >
                                          Downtime:{" "}
                                          {downtimeInfo.downtimeMinutes}min
                                        </span>
                                      ) : (
                                        <span
                                          style={{
                                            color: "green",
                                            marginLeft: "8px",
                                          }}
                                        >
                                          Available
                                        </span>
                                      )}
                                    </div>
                                    {downtimeInfo.downtimeReason && (
                                      <div
                                        style={{
                                          fontSize: "0.8em",
                                          color: "#666",
                                        }}
                                      >
                                        {downtimeInfo.downtimeReason}
                                      </div>
                                    )}
                                  </li>
                                );
                              }}
                              // Modify the onChange handler to account for downtime
                              onChange={(event, newValue) => {
                                if (!hasStartDate) return;

                                setRows((prevRows) => {
                                  const updatedRows = [...prevRows[index]];
                                  updatedRows[rowIndex] = {
                                    ...updatedRows[rowIndex],
                                    machineId: newValue
                                      ? newValue.subcategoryId
                                      : "",
                                  };

                                  if (
                                    newValue &&
                                    updatedRows[rowIndex].startDate
                                  ) {
                                    const shift = shiftOptions.find(
                                      (option) =>
                                        option.name ===
                                        updatedRows[rowIndex].shift
                                    );

                                    // Always calculate end date with downtime (even if no current downtime)
                                    updatedRows[rowIndex].endDate =
                                      calculateEndDateWithDowntime(
                                        updatedRows[rowIndex].startDate,
                                        updatedRows[rowIndex].plannedQtyTime,
                                        shift?.TotalHours,
                                        newValue
                                      );
                                  }

                                  return {
                                    ...prevRows,
                                    [index]: updatedRows,
                                  };
                                });
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Machine"
                                  variant="outlined"
                                  size="small"
                                  InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                      <>
                                        {machineOptions[man.categoryId]?.find(
                                          (m) =>
                                            m.subcategoryId === row.machineId
                                        )?.status === "downtime" && (
                                          <span
                                            style={{
                                              color: "orange",
                                              marginRight: "8px",
                                            }}
                                          >
                                            ⚠️
                                          </span>
                                        )}
                                        {params.InputProps.startAdornment}
                                      </>
                                    ),
                                  }}
                                />
                              )}
                              noOptionsText="No machines available"
                              disabled={!hasStartDate}
                            />
                          </td>

                          <td>
                            <Autocomplete
                              sx={{ width: 180, margin: "auto" }}
                              componentsProps={{
                                paper: {
                                  sx: {
                                    width: 250,
                                    left: "15% !important",
                                    transform: "translateX(-15%) !important",
                                  },
                                },
                              }}
                              options={operators}
                              value={
                                operators.find(
                                  (op) => op._id === row.operatorId
                                ) || null
                              }
                              getOptionLabel={(option) => {
                                const isOnLeave = isOperatorOnLeave(
                                  option,
                                  row.startDate,
                                  row.endDate
                                );
                                const isAllocated = !isOperatorAvailable(
                                  option.name,
                                  row.startDate,
                                  row.endDate
                                );

                                let status = "";
                                if (isOnLeave) {
                                  // Calculate leave duration in days
                                  const leaveDuration = option.leavePeriod?.[0]
                                    ? Math.ceil(
                                        new Date(
                                          option.leavePeriod[0].endDate
                                        ) -
                                          new Date(
                                            option.leavePeriod[0].startDate
                                          )
                                      ) /
                                        (1000 * 60 * 60 * 24) +
                                      1
                                    : 0;
                                  status = ` (On Leave ${leaveDuration}d)`;
                                } else if (isAllocated) {
                                  status = " (Allocated)";
                                }

                                return `${option.name}${status}`;
                              }}
                              renderOption={(props, option) => {
                                const isOnLeave = isOperatorOnLeave(
                                  option,
                                  row.startDate,
                                  row.endDate
                                );
                                const isAllocated = !isOperatorAvailable(
                                  option.name,
                                  row.startDate,
                                  row.endDate
                                );

                                const isDisabled = isAllocated && !isOnLeave;
                                const leaveDuration = option.leavePeriod?.[0]
                                  ? Math.ceil(
                                      new Date(option.leavePeriod[0].endDate) -
                                        new Date(
                                          option.leavePeriod[0].startDate
                                        )
                                    ) /
                                      (1000 * 60 * 60 * 24) +
                                    1
                                  : 0;

                                return (
                                  <li
                                    {...props}
                                    style={{
                                      color: isDisabled ? "gray" : "black",
                                      backgroundColor: isDisabled
                                        ? "#f5f5f5"
                                        : "white",
                                      pointerEvents: isDisabled
                                        ? "none"
                                        : "auto",
                                      display: "flex",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <div>
                                      {option.name}
                                      <span style={{ color: "red" }}>
                                        {isOnLeave &&
                                          ` - On Leave ${leaveDuration}d`}
                                        {isAllocated &&
                                          !isOnLeave &&
                                          " (Allocated)"}
                                      </span>
                                    </div>
                                  </li>
                                );
                              }}
                              onChange={(event, newValue) => {
                                if (!hasStartDate) return;

                                if (
                                  newValue &&
                                  !isOperatorAvailable(
                                    newValue.name,
                                    row.startDate,
                                    row.endDate
                                  ) &&
                                  !isOperatorOnLeave(
                                    newValue,
                                    row.startDate,
                                    row.endDate
                                  )
                                ) {
                                  toast.error(
                                    "This operator is allocated during the selected dates."
                                  );
                                  return;
                                }

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
