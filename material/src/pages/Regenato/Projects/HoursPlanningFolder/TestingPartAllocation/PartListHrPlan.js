import React, { useEffect, useState, useMemo } from "react";
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

import { AllocatedPartListHrPlan } from "./AllocatedPartListHrPlan";

export const PartListHrPlan = ({
  partName,
  partId,
  manufacturingVariables,
  quantity,
  porjectID,
  partID,
  partListItemId,
  partManufacturingVariables,
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
  const [isAutoSchedule, setIsAutoSchedule] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventDates, setEventDates] = useState([]);
  const [isDataAllocated, setIsDataAllocated] = useState(false);
  const [allocatedMachines, setAllocatedMachines] = useState({});
  const [operatorAllocations, setOperatorAllocations] = useState({});

  console.log(partId);

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

  // Modify the shift data processing to include break duration
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/shiftVariable`
        );
        const data = await response.json();
        if (response.ok) {
          const formattedShifts = data.map((shift) => {
            // Calculate total working minutes (subtract break time)
            const start = new Date(`2000-01-01T${shift.StartTime}:00`);
            const end = new Date(`2000-01-01T${shift.EndTime}:00`);
            const launchStart = new Date(
              `2000-01-01T${shift.LaunchStartTime}:00`
            );
            const launchEnd = new Date(`2000-01-01T${shift.LaunchEndTime}:00`);

            // Total shift duration in minutes
            const totalShiftMinutes = (end - start) / (1000 * 60);
            // Break duration in minutes
            const breakMinutes = (launchEnd - launchStart) / (1000 * 60);
            // Actual working minutes
            const workingMinutes = totalShiftMinutes - breakMinutes;

            return {
              name: shift.name,
              _id: shift._id,
              startTime: shift.StartTime,
              endTime: shift.EndTime,
              breakStartTime: shift.LaunchStartTime,
              breakEndTime: shift.LaunchEndTime,
              totalShiftMinutes, // Total shift duration including breaks
              workingMinutes, // Actual working minutes (excluding breaks)
              breakMinutes, // Break duration
            };
          });
          setShiftOptions(formattedShifts);
        }
      } catch (error) {
        console.error("Error fetching shifts:", error);
      }
    };

    fetchShifts();
  }, []);

  useEffect(() => {
    const fetchAllocatedData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/allocation`
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
  }, [porjectID, partID, partListItemId]);

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
    if (!allocatedMachines[machineId])
      return { available: true, status: "Available" };

    const parsedStart = new Date(startDate);
    const parsedEnd = new Date(endDate);

    const isOccupied = allocatedMachines[machineId].some(
      (alloc) =>
        (parsedStart >= alloc.startDate && parsedStart <= alloc.endDate) ||
        (parsedEnd >= alloc.startDate && parsedEnd <= alloc.endDate) ||
        (parsedStart <= alloc.startDate && parsedEnd >= alloc.endDate)
    );

    return {
      available: !isOccupied,
      status: isOccupied ? "Occupied" : "Available",
    };
  };

  const isMachineOnDowntimeDuringPeriod = (machine, startDate, endDate) => {
    if (!machine?.downtimeHistory?.length) {
      return { isDowntime: false, downtimeMinutes: 0 };
    }

    // Find only active (not completed) downtimes
    const activeDowntimes = machine.downtimeHistory.filter(
      (downtime) =>
        !downtime.isCompleted && new Date(downtime.endTime) > new Date()
    );

    if (activeDowntimes.length === 0) {
      return { isDowntime: false, downtimeMinutes: 0 };
    }

    // If no dates provided, just return that machine is in downtime
    if (!startDate || !endDate) {
      const now = new Date();
      const earliestEnd = new Date(
        Math.min(...activeDowntimes.map((d) => new Date(d.endTime).getTime()))
      );
      const minutesRemaining = Math.ceil((earliestEnd - now) / (1000 * 60));
      return {
        isDowntime: true,
        downtimeMinutes: minutesRemaining,
        downtimeReason: activeDowntimes[0].reason, // Show first reason
      };
    }

    // Check if downtime overlaps with selected period
    const selectedStart = new Date(startDate);
    const selectedEnd = new Date(endDate);

    const overlappingDowntime = activeDowntimes.find((downtime) => {
      const downtimeStart = new Date(downtime.startTime);
      const downtimeEnd = new Date(downtime.endTime);
      return (
        (downtimeStart <= selectedEnd && downtimeEnd >= selectedStart) ||
        (selectedStart <= downtimeEnd && selectedEnd >= downtimeStart)
      );
    });

    if (!overlappingDowntime) {
      return { isDowntime: false, downtimeMinutes: 0 };
    }

    // Calculate remaining minutes
    const now = new Date();
    const downtimeEnd = new Date(overlappingDowntime.endTime);
    const downtimeMinutes = Math.ceil((downtimeEnd - now) / (1000 * 60));

    return {
      isDowntime: true,
      downtimeMinutes,
      downtimeReason: overlappingDowntime.reason,
    };
  };

  const getMachineStatus = (machine, startDate, endDate, allocatedMachines) => {
    const downtimeInfo = isMachineOnDowntimeDuringPeriod(
      machine,
      startDate,
      endDate
    );
    const availabilityInfo = isMachineAvailable(
      machine.subcategoryId,
      startDate,
      endDate,
      allocatedMachines
    );

    if (downtimeInfo.isDowntime && !availabilityInfo.available) {
      return {
        status: "Downtime & Occupied",
        isDowntime: true,
        isAllocated: true,
        downtimeMinutes: downtimeInfo.downtimeMinutes,
        downtimeReason: downtimeInfo.downtimeReason,
      };
    }
    if (downtimeInfo.isDowntime) {
      return {
        status: `Downtime (${formatDowntime(downtimeInfo.downtimeMinutes)})`,
        isDowntime: true,
        isAllocated: false,
        downtimeMinutes: downtimeInfo.downtimeMinutes,
        downtimeReason: downtimeInfo.downtimeReason,
      };
    }
    if (!availabilityInfo.available) {
      return {
        status: "Occupied",
        isDowntime: false,
        isAllocated: true,
        downtimeMinutes: 0,
      };
    }
    return {
      status: "Available",
      isDowntime: false,
      isAllocated: false,
      downtimeMinutes: 0,
    };
  };

  const formatDowntime = (minutes) => {
    if (minutes >= 1440)
      return `${Math.floor(minutes / 1440)}d ${Math.floor(
        (minutes % 1440) / 60
      )}h`;
    if (minutes >= 60) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  // const formatDate = (date) => {
  //   return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  // };

  const isOperatorAvailable = (operatorName, startDate, endDate) => {
    // If no dates selected, consider available
    if (!startDate || !endDate) return true;

    if (!operatorAllocations[operatorName]) return true;

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

  console.log(operators);

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
          endTime: "", // Added endTime
          machineId: "",
          shift: "",
          processName: man.name,
        },
      ];
      return acc;
    }, {});
    setRows(initialRows);
  }, [manufacturingVariables, quantity, isAutoSchedule, shiftOptions]);

  // const handleQuantityChange = (index, rowIndex, value) => {
  //   setRows((prevRows) => {
  //     const updatedRows = { ...prevRows };
  //     const processRows = [...(updatedRows[index] || [])];
  //     const newQuantity =
  //       value === "" ? "" : Math.max(0, Math.min(quantity, Number(value)));

  //     processRows[rowIndex] = {
  //       ...processRows[rowIndex],
  //       plannedQuantity: newQuantity,
  //       plannedQtyTime: newQuantity
  //         ? calculatePlannedMinutes(
  //             newQuantity * manufacturingVariables[index].hours
  //           )
  //         : "",
  //     };

  //     updatedRows[index] = processRows;

  //     const usedQuantity = processRows.reduce(
  //       (sum, row) => sum + Number(row.plannedQuantity || 0),
  //       0
  //     );

  //     setRemainingQuantities((prev) => ({
  //       ...prev,
  //       [index]: Math.max(0, quantity - usedQuantity),
  //     }));

  //     return updatedRows;
  //   });
  // };

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

        if (response.ok) {
          // ✅ Ensure operators are only set when data is available
          if (Array.isArray(data) && data.length > 0) {
            // ✅ Exclude leave users when setting operators
            // const activeOperators = data.filter(
            //   (user) => !user.leavePeriod || user.leavePeriod.length === 0
            // );
            setOperators(data);
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

  const getFilteredMachines = (man, machines) => {
    // Find if this process has a SubMachineName defined
    const processData = partManufacturingVariables?.find(
      (mv) => mv.name === man.name
    );

    if (processData?.SubMachineName) {
      // Filter machines to only include those that match SubMachineName
      return machines.filter(
        (machine) => machine.name === processData.SubMachineName
      );
    }
    // If no SubMachineName defined, return all machines
    return machines;
  };

  // Modify the machineOptions useEffect to use the filtered machines
  useEffect(() => {
    const fetchMachines = async () => {
      const machineData = {};
      for (const man of manufacturingVariables) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_BASE_URL}/api/manufacturing/category/${man.categoryId}`
          );

          // Filter machines based on SubMachineName if it exists
          const filteredMachines = getFilteredMachines(
            man,
            response.data.subCategories
          );

          machineData[man.categoryId] = filteredMachines.map((machine) => ({
            ...machine,
            isAvailable:
              machine.status === "available" &&
              (!machine.unavailableUntil ||
                new Date(machine.unavailableUntil) <= new Date()),
          }));
        } catch (error) {
          console.error("Error fetching available machines:", error);
        }
      }
      setMachineOptions(machineData);
    };
    fetchMachines();
  }, [manufacturingVariables, partManufacturingVariables]);

  console.log("Machine Options:", machineOptions);

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
          endTime: "",
          machineId: "",
          shift: "",
          processName: man.name,
        },
      ];
      return acc;
    }, {});
    setRows(initialRows);
  }, [manufacturingVariables, quantity, isAutoSchedule]);

  const calculatePlannedMinutes = (hours) => {
    return Math.ceil(hours * 60);
  };

  const calculateEndDate = (startDate, plannedMinutes, shift) => {
    if (!startDate || !plannedMinutes) return "";

    let parsedDate = new Date(startDate);
    if (isNaN(parsedDate.getTime())) return "";

    // Use working minutes from shift (excluding breaks)
    const workingMinutesPerDay = shift?.workingMinutes || 450; // Default to 7.5 hours if no shift

    // Calculate total number of full working days needed
    let totalDays = Math.ceil(plannedMinutes / workingMinutesPerDay);
    let currentDate = new Date(parsedDate);
    let daysAdded = 0;

    while (daysAdded < totalDays) {
      // Skip non-working days (Sundays and holidays)
      while (
        getDay(currentDate) === 0 ||
        eventDates.some((d) => isSameDay(d, currentDate))
      ) {
        currentDate.setDate(currentDate.getDate() + 1);
      }

      daysAdded++;

      // If there are still days to add, move to the next day
      if (daysAdded <= totalDays) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return currentDate.toISOString().split("T")[0];
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

  // const getNextWorkingDay = (date) => {
  //   let nextDay = new Date(date);
  //   while (isHighlightedOrDisabled(nextDay)) {
  //     nextDay.setDate(nextDay.getDate() + 1);
  //   }
  //   return nextDay;
  // };

  const calculateStartAndEndDates = (inputStartDate, plannedMinutes, shift) => {
    let parsedStartDate = new Date(inputStartDate);
    let remainingMinutes = plannedMinutes;
    let workingMinutesPerDay = shift?.workingMinutes || 450; // Default to 7.5 hours
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
        remainingMinutes -= workingMinutesPerDay;
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

    // Fix for timezone issue - create date without time component
    const adjustedDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );

    const nextWorkingDay = getNextWorkingDay(adjustedDate);

    if (index === 0) {
      setHasStartDate(!!nextWorkingDay);
    }

    setRows((prevRows) => {
      const newRows = { ...prevRows };
      const currentRow = newRows[index][rowIndex];
      const currentMachine = machineOptions[
        manufacturingVariables[index].categoryId
      ]?.find((m) => m.subcategoryId === currentRow.machineId);

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
          (option) => option.name === currentRow.shift
        );

        newRows[index][rowIndex] = {
          ...currentRow,
          startDate: formatDateUTC(nextWorkingDay), // Use UTC formatting
          endDate: calculateEndDateWithDowntime(
            nextWorkingDay,
            currentRow.plannedQtyTime,
            shift?.TotalHours,
            currentMachine,
            index,
            rowIndex
          ),
        };

        // Show downtime notification if applicable
        if (currentMachine) {
          const downtimeInfo = isMachineOnDowntimeDuringPeriod(
            currentMachine,
            newRows[index][rowIndex].startDate,
            newRows[index][rowIndex].endDate
          );

          if (downtimeInfo.isDowntime) {
            toast.info(
              `Downtime detected: ${formatDowntime(
                downtimeInfo.downtimeMinutes
              )} added. End date adjusted.`
            );
          }
        }
      }

      return newRows;
    });
  };

  // Helper function to format dates in UTC
  const formatDateUTC = (date) => {
    const d = new Date(date);
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
      .toISOString()
      .split("T")[0];
  };

  // Updated getNextWorkingDay to handle UTC dates
  const getNextWorkingDay = (date) => {
    let nextDay = new Date(date);
    while (isHighlightedOrDisabled(nextDay)) {
      nextDay.setDate(nextDay.getDate() + 1);
    }
    return new Date(
      Date.UTC(nextDay.getFullYear(), nextDay.getMonth(), nextDay.getDate())
    );
  };

  // Helper function to properly format dates without timezone issues
  const formatDateWithoutTimezone = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Updated calculateEndDateWithDowntime with proper index handling
  // const calculateEndDateWithDowntime = (
  //   startDate,
  //   plannedMinutes,
  //   shift,
  //   machine,
  //   currentIndex,
  //   currentRowIndex
  // ) => {
  //   if (!startDate || !plannedMinutes) return "";

  //   const parsedDate = new Date(startDate);
  //   if (isNaN(parsedDate.getTime())) return "";

  //   let remainingMinutes = plannedMinutes;
  //   let currentDate = new Date(parsedDate);
  //   let totalDowntimeAdded = 0;
  //   const workingMinutesPerDay = shift?.workingMinutes || 450; // Default to 7.5 hours

  //   while (remainingMinutes > 0) {
  //     // Skip non-working days
  //     while (
  //       getDay(currentDate) === 0 ||
  //       eventDates.some((d) => isSameDay(d, currentDate))
  //     ) {
  //       currentDate.setDate(currentDate.getDate() + 1);
  //     }

  //     // Check for machine downtime
  //     if (machine) {
  //       const downtimeInfo = isMachineOnDowntimeDuringPeriod(
  //         machine,
  //         currentDate,
  //         new Date(currentDate.getTime() + workingMinutesPerDay * 60000)
  //       );

  //       if (downtimeInfo.isDowntime) {
  //         remainingMinutes += downtimeInfo.downtimeMinutes;
  //         totalDowntimeAdded += downtimeInfo.downtimeMinutes;
  //       }
  //     }

  //     const minutesToDeduct = Math.min(remainingMinutes, workingMinutesPerDay);
  //     remainingMinutes -= minutesToDeduct;

  //     if (remainingMinutes > 0) {
  //       currentDate.setDate(currentDate.getDate() + 1);
  //     }
  //   }

  //   // Update the row with downtime information
  //   setRows((prevRows) => {
  //     const updatedRows = { ...prevRows };
  //     if (updatedRows[currentIndex]?.[currentRowIndex]) {
  //       updatedRows[currentIndex][currentRowIndex] = {
  //         ...updatedRows[currentIndex][currentRowIndex],
  //         totalDowntimeAdded,
  //       };
  //     }
  //     return updatedRows;
  //   });

  //   return formatDateUTC(currentDate);
  // };

  const calculateEndDateWithDowntime = (
    startDate,
    plannedMinutes,
    shift,
    machine
  ) => {
    if (!startDate || !plannedMinutes) return "";

    const parsedDate = new Date(startDate);
    if (isNaN(parsedDate.getTime())) return "";

    let remainingMinutes = plannedMinutes;
    let currentDate = new Date(parsedDate);
    let totalDowntimeAdded = 0;
    const workingMinutesPerDay = shift?.workingMinutes || 450;

    while (remainingMinutes > 0) {
      // Skip non-working days
      while (
        getDay(currentDate) === 0 ||
        eventDates.some((d) => isSameDay(d, currentDate))
      ) {
        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (machine) {
        const downtimeInfo = isMachineOnDowntimeDuringPeriod(
          machine,
          currentDate,
          new Date(currentDate.getTime() + workingMinutesPerDay * 60000)
        );

        if (downtimeInfo.isDowntime) {
          remainingMinutes += downtimeInfo.downtimeMinutes;
          totalDowntimeAdded += downtimeInfo.downtimeMinutes;
        }
      }

      const minutesToDeduct = Math.min(remainingMinutes, workingMinutesPerDay);
      remainingMinutes -= minutesToDeduct;

      if (remainingMinutes > 0) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return formatDateUTC(currentDate);
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
          machineId: "", // Clear machine selection for new row
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

  const getAvailableMachinesForRow = (processIndex, rowIndex) => {
    const allMachines =
      machineOptions[manufacturingVariables[processIndex].categoryId] || [];

    // Get all selected machines in the current process except for the current row
    const selectedMachinesInProcess = rows[processIndex]
      ? rows[processIndex]
          .filter((_, idx) => idx !== rowIndex) // Exclude current row
          .map((row) => row.machineId)
          .filter(Boolean) // Remove empty/null values
      : [];

    // Filter out machines that are already selected
    return allMachines.filter(
      (machine) => !selectedMachinesInProcess.includes(machine.subcategoryId)
    );
  };

  const getAvailableOperatorsForRow = (processIndex, rowIndex) => {
    // Get all selected operators in the current process except for the current row
    const selectedOperatorsInProcess = rows[processIndex]
      ? rows[processIndex]
          .filter((_, idx) => idx !== rowIndex)
          .map((row) => row.operatorId)
          .filter(Boolean)
      : [];

    // Filter out operators that are already selected
    return operators.filter(
      (operator) => !selectedOperatorsInProcess.includes(operator._id)
    );
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
        const man = manufacturingVariables[index]; /// Get the manufacturing variable for this process
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

            // groupedAllocations[key].allocations.push({
            //   splitNumber,
            //   AllocationPartType: "Part",
            //   plannedQuantity: row.plannedQuantity,
            //   startDate: new Date(row.startDate).toISOString(),
            //   startTime: row.startTime || "08:00 AM",
            //   endDate: new Date(row.endDate).toISOString(),
            //   machineId: row.machineId,
            //   shift: row.shift,
            //   plannedTime: row.plannedQtyTime,
            //   operator:
            //     operators.find((op) => op._id === row.operatorId)?.name ||
            //     "Unknown",
            //   shiftTotalTime: selectedShift ? selectedShift.TotalHours : 0,
            //   perMachinetotalTime: Math.ceil(man.hours * 60),
            //   processId: man.categoryId, //Add processId to each allocation as well
            // });

            groupedAllocations[key].allocations.push({
              splitNumber,
              AllocationPartType: "Part",
              plannedQuantity: row.plannedQuantity,
              startDate: new Date(row.startDate).toISOString(),
              startTime: row.startTime || "08:00 AM",
              endDate: new Date(row.endDate).toISOString(),
              endTime: calculateEndTime(
                // Add the calculated end time
                row.startTime,
                row.plannedQtyTime,
                shiftOptions.find((s) => s.name === row.shift)
              ),
              machineId: row.machineId,
              shift: row.shift,
              plannedTime: row.plannedQtyTime,
              operator:
                operators.find((op) => op._id === row.operatorId)?.name ||
                "Unknown",
              shiftTotalTime: selectedShift ? selectedShift.TotalHours : 0,
              perMachinetotalTime: Math.ceil(man.hours * 60),
              processId: man.categoryId,
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
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/allocation`,
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

  const calculateEndTime = (startTime, plannedMinutes, shift) => {
    if (!startTime || !plannedMinutes || !shift) return "17:00"; // Default end time if data missing

    try {
      // Parse the start time (format: "HH:MM")
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      let currentTime = new Date();
      currentTime.setHours(startHours, startMinutes, 0, 0);

      // Calculate working minutes per day (excluding breaks)
      const workingMinutesPerDay = shift.workingMinutes || 450; // Default to 7.5 hours

      // Calculate how many full days of work are needed
      const fullDays = Math.floor(plannedMinutes / workingMinutesPerDay);
      let remainingMinutes = plannedMinutes % workingMinutesPerDay;

      // If no remaining minutes but we have full days, use full shift end time
      if (remainingMinutes === 0 && fullDays > 0) {
        const [shiftEndHour, shiftEndMinute] = shift.endTime
          .split(":")
          .map(Number);
        return `${String(shiftEndHour).padStart(2, "0")}:${String(
          shiftEndMinute
        ).padStart(2, "0")}`;
      }

      // For multi-day production, we'll start at shift start time on the last day
      if (fullDays > 0) {
        // Reset to shift start time for the final day
        currentTime.setHours(startHours, startMinutes, 0, 0);
      }

      // Handle breaks if they exist
      if (shift.breakStartTime && shift.breakEndTime) {
        const [breakStartHour, breakStartMinute] = shift.breakStartTime
          .split(":")
          .map(Number);
        const [breakEndHour, breakEndMinute] = shift.breakEndTime
          .split(":")
          .map(Number);

        const breakStart = new Date(currentTime);
        breakStart.setHours(breakStartHour, breakStartMinute, 0, 0);

        const breakEnd = new Date(currentTime);
        breakEnd.setHours(breakEndHour, breakEndMinute, 0, 0);

        // Check if remaining work crosses break time
        const minutesUntilBreak = (breakStart - currentTime) / (1000 * 60);

        if (remainingMinutes <= minutesUntilBreak) {
          // Can finish before break
          currentTime.setMinutes(currentTime.getMinutes() + remainingMinutes);
        } else {
          // Need to work after break
          // Work until break starts
          const workBeforeBreak = minutesUntilBreak;
          currentTime = new Date(breakEnd);
          remainingMinutes -= workBeforeBreak;
          currentTime.setMinutes(currentTime.getMinutes() + remainingMinutes);
        }
      } else {
        // No break information, just add the minutes directly
        currentTime.setMinutes(currentTime.getMinutes() + remainingMinutes);
      }

      // Format back to HH:MM
      const endHours = String(currentTime.getHours()).padStart(2, "0");
      const endMinutes = String(currentTime.getMinutes()).padStart(2, "0");

      return `${endHours}:${endMinutes}`;
    } catch (error) {
      console.error("Error calculating end time:", error);
      return "17:00"; // Fallback end time
    }
  };

  return (
    <div style={{ width: "100%", margin: "auto" }}>
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
          <AllocatedPartListHrPlan
            porjectID={porjectID}
            partID={partID}
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
                        <th>Plan Qty</th>
                        <th>Plan Qty Time</th>
                        <th style={{ width: "20%" }}>Shift</th>
                        <th style={{ width: "10%" }}>Start Date</th>
                        <th style={{ width: "15%" }}>Start Time</th>
                        <th style={{ width: "8%" }}>End Date</th>
                        <th>End Time</th>

                        <th style={{ width: "25%" }}>Machine ID</th>
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

                                    // Calculate total used quantity excluding the current row
                                    const usedQuantityExcludingCurrent =
                                      processRows.reduce((sum, r, i) => {
                                        return i === rowIndex
                                          ? sum
                                          : sum +
                                              Number(r.plannedQuantity || 0);
                                      }, 0);

                                    // Ensure new planned quantity does not exceed available quantity
                                    const maxAllowed =
                                      quantity - usedQuantityExcludingCurrent;
                                    const safeValue = Math.min(
                                      Number(newValue),
                                      maxAllowed
                                    );

                                    processRows[rowIndex] = {
                                      ...processRows[rowIndex],
                                      plannedQuantity: safeValue,
                                      plannedQtyTime: calculatePlannedMinutes(
                                        (safeValue || 0) *
                                          manufacturingVariables[index].hours
                                      ),
                                    };

                                    updatedRows[index] = processRows;

                                    const totalUsedQuantity =
                                      processRows.reduce(
                                        (sum, row) =>
                                          sum +
                                          Number(row.plannedQuantity || 0),
                                        0
                                      );

                                    setRemainingQuantities((prev) => ({
                                      ...prev,
                                      [index]: Math.max(
                                        0,
                                        quantity - totalUsedQuantity
                                      ),
                                    }));

                                    return updatedRows;
                                  });
                                }}
                              />
                            ) : (
                              <Input
                                type="number"
                                // placeholder="QTY"
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
                          <td>{row.plannedQtyTime} m</td>
                          <td>
                            {/* <Autocomplete
                              sx={{
                                width: 130,
                                margin: "auto",
                                "& .MuiOutlinedInput-root": {
                                  padding: "6px !important",
                                  fontSize: "0.875rem",
                                },
                              }}
                              componentsProps={{
                                paper: {
                                  sx: {
                                    width: 380,
                                    boxShadow:
                                      "0px 4px 20px rgba(0, 0, 0, 0.15)",
                                    borderRadius: "8px",
                                    marginTop: "4px",
                                  },
                                },
                              }}
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
                            /> */}
                            <Autocomplete
                              sx={{
                                width: 130,
                                margin: "auto",
                                "& .MuiOutlinedInput-root": {
                                  padding: "6px !important",
                                  fontSize: "0.875rem",
                                },
                              }}
                              componentsProps={{
                                paper: {
                                  sx: {
                                    width: 380,
                                    boxShadow:
                                      "0px 4px 20px rgba(0, 0, 0, 0.15)",
                                    borderRadius: "8px",
                                    marginTop: "4px",
                                  },
                                },
                              }}
                              options={shiftOptions || []}
                              value={
                                shiftOptions.find(
                                  (option) => option.name === row.shift
                                ) ||
                                (shiftOptions.length > 0
                                  ? shiftOptions[0]
                                  : null) // Default to first shift if none selected
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
                          <td style={{ width: "180px" }}>
                            <DatePicker
                              selected={
                                row.startDate
                                  ? new Date(row.startDate + "T00:00:00")
                                  : null
                              }
                              onChange={(date) => {
                                if (!date) return;

                                // Create date without timezone issues
                                const utcDate = new Date(
                                  Date.UTC(
                                    date.getFullYear(),
                                    date.getMonth(),
                                    date.getDate()
                                  )
                                );

                                handleStartDateChange(index, rowIndex, utcDate);
                              }}
                              filterDate={(date) => {
                                // Only allow future or today's dates
                                return (
                                  date >=
                                  new Date(new Date().setHours(0, 0, 0, 0))
                                );
                              }}
                              dayClassName={(date) => {
                                const machine = machineOptions[
                                  manufacturingVariables[index].categoryId
                                ]?.find(
                                  (m) => m.subcategoryId === row.machineId
                                );

                                if (machine) {
                                  const availability = isMachineAvailable(
                                    machine.subcategoryId,
                                    date,
                                    // calculateEndDateWithDowntime(
                                    //   date,
                                    //   row.plannedQtyTime,
                                    //   shiftOptions.find(
                                    //     (s) => s.name === row.shift
                                    //   )?.TotalHours,
                                    //   machine,
                                    //   index,
                                    //   rowIndex
                                    // )
                                    calculateEndDateWithDowntime(
                                      date,
                                      row.plannedQtyTime,
                                      shiftOptions.find(
                                        (s) => s.name === row.shift
                                      ),
                                      machine
                                    )
                                  );
                                  return availability.available
                                    ? ""
                                    : "highlighted-date";
                                }
                                return "";
                              }}
                              renderDayContents={renderDayContents}
                              customInput={<CustomInput />}
                              dateFormat="dd-MM-yyyy"
                              wrapperClassName="small-datepicker"
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
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
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
                              {row.totalDowntimeAdded > 0 && (
                                <div
                                  style={{
                                    fontSize: "0.8rem",
                                    color: "#ff6b6b",
                                    marginTop: "4px",
                                  }}
                                >
                                  +{row.totalDowntimeAdded} min downtime
                                </div>
                              )}
                            </div>

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
                                opacity: 1;
                              }
                            `}</style>
                          </td>

                          <td>
                            {/* <Input
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
                            /> */}
                            {/* // When displaying end time in your table: */}
                            <Input
                              type="time"
                              value={calculateEndTime(
                                row.startTime,
                                row.plannedQtyTime,
                                shiftOptions.find((s) => s.name === row.shift)
                              )}
                              readOnly
                            />
                          </td>

                          <td>
                            <Autocomplete
                              sx={{
                                width: 150,
                                margin: "auto",
                                "& .MuiOutlinedInput-root": {
                                  padding: "6px !important",
                                  fontSize: "0.875rem",
                                },
                                // Add styles for disabled options
                                "& .MuiAutocomplete-option[aria-disabled='true']":
                                  {
                                    opacity: 0.5,
                                    cursor: "not-allowed",
                                  },
                              }}
                              componentsProps={{
                                paper: {
                                  sx: {
                                    width: 380,
                                    boxShadow:
                                      "0px 4px 20px rgba(0, 0, 0, 0.15)",
                                    borderRadius: "8px",
                                    marginTop: "4px",
                                  },
                                },
                              }}
                              options={getAvailableMachinesForRow(
                                index,
                                rowIndex
                              )}
                              value={
                                machineOptions[man.categoryId]?.find(
                                  (machine) =>
                                    machine.subcategoryId === row.machineId
                                ) || null
                              }
                              onChange={(event, newValue) => {
                                if (!hasStartDate) return;

                                // Check if machine is already selected in another row
                                const isAlreadySelected = rows[index].some(
                                  (r, idx) =>
                                    idx !== rowIndex &&
                                    r.machineId === newValue?.subcategoryId
                                );

                                if (isAlreadySelected) {
                                  toast.error(
                                    "This machine is already selected in another row for this process"
                                  );
                                  return;
                                }

                                // Check if machine is occupied
                                if (newValue) {
                                  const status = getMachineStatus(
                                    newValue,
                                    row.startDate,
                                    row.endDate,
                                    allocatedMachines
                                  );
                                  if (status.isAllocated) {
                                    toast.error(
                                      "This machine is occupied during the selected time period"
                                    );
                                    return;
                                  }
                                }

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

                                    updatedRows[rowIndex].endDate =
                                      calculateEndDateWithDowntime(
                                        updatedRows[rowIndex].startDate,
                                        updatedRows[rowIndex].plannedQtyTime,
                                        shift?.TotalHours,
                                        newValue
                                      );

                                    const downtimeInfo =
                                      isMachineOnDowntimeDuringPeriod(
                                        newValue,
                                        updatedRows[rowIndex].startDate,
                                        updatedRows[rowIndex].endDate
                                      );

                                    if (downtimeInfo.isDowntime) {
                                      toast.info(
                                        `Machine has ${downtimeInfo.downtimeMinutes} minutes of downtime. End date extended to ${updatedRows[rowIndex].endDate}.`
                                      );
                                    }
                                  }

                                  return { ...prevRows, [index]: updatedRows };
                                });
                              }}
                              getOptionLabel={(option) => {
                                const status = getMachineStatus(
                                  option,
                                  row.startDate,
                                  row.endDate,
                                  allocatedMachines
                                );
                                return `${option.name}`;
                              }}
                              renderOption={(props, option) => {
                                const status = getMachineStatus(
                                  option,
                                  row.startDate,
                                  row.endDate,
                                  allocatedMachines
                                );
                                const isDisabled = status.isAllocated;

                                // Don't render the option at all if it's disabled
                                if (isDisabled) {
                                  return (
                                    <li
                                      {...props}
                                      style={{
                                        padding: "10px 16px",
                                        backgroundColor: "#f5f5f5",
                                        color: "#999",
                                        cursor: "not-allowed",
                                        opacity: 0.7,
                                        pointerEvents: "none",
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                        }}
                                      >
                                        <div
                                          style={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: "50%",
                                            backgroundColor: "#ff9800",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginRight: 12,
                                          }}
                                        >
                                          <span
                                            style={{
                                              color: "white",
                                              fontSize: 12,
                                            }}
                                          >
                                            O
                                          </span>
                                        </div>
                                        <div>
                                          <div style={{ fontWeight: 500 }}>
                                            {option.name}
                                          </div>
                                          <div
                                            style={{
                                              fontSize: "0.75rem",
                                              color: "#666",
                                            }}
                                          >
                                            Occupied - Not Available
                                          </div>
                                        </div>
                                      </div>
                                    </li>
                                  );
                                }

                                return (
                                  <li
                                    {...props}
                                    style={{
                                      padding: "10px 16px",
                                      borderBottom: "1px solid #f0f0f0",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      <div
                                        style={{
                                          width: 24,
                                          height: 24,
                                          borderRadius: "50%",
                                          backgroundColor: status.isDowntime
                                            ? "#f44336"
                                            : "#4caf50",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          marginRight: 12,
                                        }}
                                      >
                                        <span
                                          style={{
                                            color: "white",
                                            fontSize: 12,
                                          }}
                                        >
                                          {status.isDowntime ? "D" : "A"}
                                        </span>
                                      </div>
                                      <div>
                                        <div style={{ fontWeight: 500 }}>
                                          {option.name}
                                        </div>
                                        <div
                                          style={{
                                            fontSize: "0.75rem",
                                            color: "#666",
                                          }}
                                        >
                                          {status.isDowntime
                                            ? `Downtime: ${formatDowntime(
                                                status.downtimeMinutes
                                              )}`
                                            : "Available"}
                                        </div>
                                      </div>
                                    </div>
                                  </li>
                                );
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Select Machine"
                                  variant="outlined"
                                  size="small"
                                  InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                      <>
                                        {row.machineId && (
                                          <div
                                            style={{
                                              width: 12,
                                              height: 12,
                                              borderRadius: "50%",
                                              backgroundColor: "#4caf50",
                                              marginRight: 8,
                                            }}
                                          />
                                        )}
                                        {params.InputProps.startAdornment}
                                      </>
                                    ),
                                  }}
                                  placeholder="Search machines..."
                                />
                              )}
                              noOptionsText={
                                <div
                                  style={{
                                    padding: 12,
                                    color: "#666",
                                    textAlign: "center",
                                  }}
                                >
                                  {machineOptions[man.categoryId]?.length === 0
                                    ? "No machines available for this process"
                                    : "No matching machines found"}
                                </div>
                              }
                              disabled={!hasStartDate}
                              isOptionEqualToValue={(option, value) =>
                                option.subcategoryId === value.subcategoryId
                              }
                              filterOptions={(options, state) => {
                                return options.filter(
                                  (option) =>
                                    option.name
                                      .toLowerCase()
                                      .includes(
                                        state.inputValue.toLowerCase()
                                      ) ||
                                    option.subcategoryId
                                      .toLowerCase()
                                      .includes(state.inputValue.toLowerCase())
                                );
                              }}
                            />
                          </td>
                          <td>
                            <Autocomplete
                              sx={{
                                width: 150,
                                margin: "auto",
                                "& .MuiOutlinedInput-root": {
                                  padding: "6px !important",
                                  fontSize: "0.875rem",
                                },
                                // Add styles for disabled options
                                "& .MuiAutocomplete-option[aria-disabled='true']":
                                  {
                                    opacity: 0.5,
                                    cursor: "not-allowed",
                                  },
                              }}
                              componentsProps={{
                                paper: {
                                  sx: {
                                    width: 380,
                                    boxShadow:
                                      "0px 4px 20px rgba(0, 0, 0, 0.15)",
                                    borderRadius: "8px",
                                    marginTop: "4px",
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
                                return `${option.name}${
                                  isOnLeave
                                    ? " (On Leave)"
                                    : isAllocated
                                    ? " (Allocated)"
                                    : ""
                                }`;
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
                                const isDisabled = isOnLeave || isAllocated;
                                const leaveDuration = option.leavePeriod?.[0]
                                  ? Math.ceil(
                                      (new Date(option.leavePeriod[0].endDate) -
                                        new Date(
                                          option.leavePeriod[0].startDate
                                        )) /
                                        (1000 * 60 * 60 * 24)
                                    ) + 1
                                  : 0;

                                // Don't render clickable option if operator is unavailable
                                if (isDisabled) {
                                  return (
                                    <li
                                      {...props}
                                      style={{
                                        padding: "10px 16px",
                                        backgroundColor: isOnLeave
                                          ? "#fff0f0"
                                          : "#fff9e6",
                                        color: "#999",
                                        cursor: "not-allowed",
                                        opacity: 0.7,
                                        pointerEvents: "none",
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                        }}
                                      >
                                        <div
                                          style={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: "50%",
                                            backgroundColor: isOnLeave
                                              ? "#ff6b6b"
                                              : "#ffc107",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginRight: 12,
                                            flexShrink: 0,
                                          }}
                                        >
                                          <span
                                            style={{
                                              color: "white",
                                              fontSize: 12,
                                            }}
                                          >
                                            {isOnLeave ? "✈" : "⏳"}
                                          </span>
                                        </div>
                                        <div style={{ flexGrow: 1 }}>
                                          <div
                                            style={{
                                              fontWeight: 500,
                                              color: "#666",
                                            }}
                                          >
                                            {option.name}
                                            <span
                                              style={{
                                                marginLeft: 8,
                                                fontSize: "0.75rem",
                                                color: "#666",
                                              }}
                                            >
                                              {isOnLeave
                                                ? `On Leave (${leaveDuration}d)`
                                                : "Allocated"}
                                            </span>
                                          </div>
                                          {option.leavePeriod?.[0] && (
                                            <div
                                              style={{
                                                fontSize: "0.75rem",
                                                color: "#666",
                                                marginTop: 4,
                                              }}
                                            >
                                              {formatDate(
                                                new Date(
                                                  option.leavePeriod[0].startDate
                                                )
                                              )}{" "}
                                              -{" "}
                                              {formatDate(
                                                new Date(
                                                  option.leavePeriod[0].endDate
                                                )
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </li>
                                  );
                                }

                                return (
                                  <li
                                    {...props}
                                    style={{
                                      padding: "10px 16px",
                                      borderBottom: "1px solid #f0f0f0",
                                      cursor: "pointer",
                                      backgroundColor: "white",
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      <div
                                        style={{
                                          width: 24,
                                          height: 24,
                                          borderRadius: "50%",
                                          backgroundColor: "#4caf50",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          marginRight: 12,
                                          flexShrink: 0,
                                        }}
                                      >
                                        <span
                                          style={{
                                            color: "white",
                                            fontSize: 12,
                                          }}
                                        >
                                          👤
                                        </span>
                                      </div>
                                      <div style={{ flexGrow: 1 }}>
                                        <div
                                          style={{
                                            fontWeight: 500,
                                            color: "#222",
                                          }}
                                        >
                                          {option.name}
                                          <span
                                            style={{
                                              marginLeft: 8,
                                              fontSize: "0.75rem",
                                              color: "#4caf50",
                                            }}
                                          >
                                            Available
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </li>
                                );
                              }}
                              onChange={(event, newValue) => {
                                if (!hasStartDate) return;

                                // Check if operator is available
                                if (newValue) {
                                  const isOnLeave = isOperatorOnLeave(
                                    newValue,
                                    row.startDate,
                                    row.endDate
                                  );
                                  const isAllocated = !isOperatorAvailable(
                                    newValue.name,
                                    row.startDate,
                                    row.endDate
                                  );

                                  if (isOnLeave) {
                                    toast.error(
                                      `${newValue.name} is on leave during the selected dates`
                                    );
                                    return;
                                  }

                                  if (isAllocated) {
                                    toast.error(
                                      `${newValue.name} is already allocated during the selected dates`
                                    );
                                    return;
                                  }

                                  // Check if operator is already selected in another row
                                  const isAlreadySelected = rows[index].some(
                                    (r, idx) =>
                                      idx !== rowIndex &&
                                      r.operatorId === newValue._id
                                  );

                                  if (isAlreadySelected) {
                                    toast.error(
                                      `${newValue.name} is already assigned to another row in this process`
                                    );
                                    return;
                                  }
                                }

                                setRows((prevRows) => ({
                                  ...prevRows,
                                  [index]: prevRows[index].map((r, idx) => {
                                    if (idx === rowIndex) {
                                      return {
                                        ...r,
                                        operatorId: newValue
                                          ? newValue._id
                                          : "",
                                      };
                                    }
                                    return r;
                                  }),
                                }));
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Select Operator"
                                  variant="outlined"
                                  size="small"
                                  placeholder="Search operators..."
                                  InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                      <>
                                        {row.operatorId && (
                                          <div
                                            style={{
                                              width: 12,
                                              height: 12,
                                              borderRadius: "50%",
                                              backgroundColor: "#4caf50",
                                              marginRight: 8,
                                            }}
                                          />
                                        )}
                                        {params.InputProps.startAdornment}
                                      </>
                                    ),
                                  }}
                                />
                              )}
                              noOptionsText={
                                <div
                                  style={{
                                    padding: 12,
                                    color: "#666",
                                    textAlign: "center",
                                  }}
                                >
                                  No operators available
                                </div>
                              }
                              disabled={!hasStartDate}
                              filterOptions={(options, state) => {
                                return options.filter((option) =>
                                  option.name
                                    .toLowerCase()
                                    .includes(state.inputValue.toLowerCase())
                                );
                              }}
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
