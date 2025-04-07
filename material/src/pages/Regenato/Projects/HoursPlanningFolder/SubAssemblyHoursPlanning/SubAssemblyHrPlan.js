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
  const openConfirmationModal = () => {
    setIsConfirmationModalOpen(true);
  };
  const [remainingQuantity, setRemainingQuantity] = useState(quantity);
  const [remainingQuantities, setRemainingQuantities] = useState({});
  const [isAutoSchedule, setIsAutoSchedule] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventDates, setEventDates] = useState([]);
  const [isDataAllocated, setIsDataAllocated] = useState(true);
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
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/subAssemblyListFirst/${subAssemblyListFirstId}/partsListItems/${partListItemId}/allocation`
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
  }, [porjectID, subAssemblyListFirstId, partListItemId]);

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

  // const calculateEndDateWithDowntime = (
  //   startDate,
  //   plannedMinutes,
  //   shiftMinutes = 480,
  //   machine
  // ) => {
  //   if (!startDate || !plannedMinutes) return "";

  //   let parsedDate = new Date(startDate);
  //   if (isNaN(parsedDate.getTime())) return "";

  //   let remainingMinutes = plannedMinutes;
  //   let currentDate = new Date(parsedDate);
  //   let totalDowntimeAdded = 0;

  //   // First, find all downtime periods that overlap with our scheduling window
  //   const relevantDowntimes =
  //     machine?.downtimeHistory?.filter((downtime) => {
  //       if (downtime.isCompleted) return false;

  //       const downtimeStart = new Date(downtime.startTime);
  //       const downtimeEnd = new Date(downtime.endTime);

  //       // Check if downtime overlaps with our scheduling period
  //       return (
  //         (downtimeStart <= currentDate && downtimeEnd >= currentDate) || // Downtime encompasses current date
  //         downtimeStart >= currentDate // Downtime starts in the future
  //       );
  //     }) || [];

  //   // Sort downtimes by start time
  //   relevantDowntimes.sort(
  //     (a, b) => new Date(a.startTime) - new Date(b.startTime)
  //   );

  //   while (remainingMinutes > 0) {
  //     // Skip non-working days (Sundays and holidays)
  //     while (
  //       getDay(currentDate) === 0 ||
  //       eventDates.some((d) => isSameDay(d, currentDate))
  //     ) {
  //       currentDate.setDate(currentDate.getDate() + 1);
  //     }

  //     // Check for downtime on this day
  //     const todaysDowntime = relevantDowntimes.find((downtime) => {
  //       const downtimeStart = new Date(downtime.startTime);
  //       return isSameDay(downtimeStart, currentDate);
  //     });

  //     if (todaysDowntime) {
  //       // Calculate downtime duration in minutes
  //       const downtimeStart = new Date(todaysDowntime.startTime);
  //       const downtimeEnd = new Date(todaysDowntime.endTime);
  //       const downtimeMinutes = Math.ceil(
  //         (downtimeEnd - downtimeStart) / (1000 * 60)
  //       );

  //       // Add downtime to the total work needed
  //       remainingMinutes += downtimeMinutes;
  //       totalDowntimeAdded += downtimeMinutes;
  //     }

  //     // Subtract a day's worth of work
  //     const minutesToDeduct = Math.min(remainingMinutes, shiftMinutes);
  //     remainingMinutes -= minutesToDeduct;

  //     // Move to next day if there's still work remaining
  //     if (remainingMinutes > 0) {
  //       currentDate.setDate(currentDate.getDate() + 1);
  //     }
  //   }

  //   // Update the row with total downtime added
  //   setRows((prevRows) => {
  //     const updatedRows = { ...prevRows };
  //     if (updatedRows[index]?.[rowIndex]) {
  //       updatedRows[index][rowIndex] = {
  //         ...updatedRows[index][rowIndex],
  //         totalDowntimeAdded,
  //       };
  //     }
  //     return updatedRows;
  //   });

  //   return currentDate.toISOString().split("T")[0];
  // };

  // Helper functions for machine status

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

  // useEffect(() => {
  //   const initialRows = manufacturingVariables.reduce((acc, man, index) => {
  //     acc[index] = [
  //       {
  //         plannedQuantity: isAutoSchedule ? quantity : "",
  //         plannedQtyTime: isAutoSchedule
  //           ? calculatePlannedMinutes(quantity * man.hours)
  //           : "",
  //         startDate: "",
  //         startTime: "",
  //         endDate: "",
  //         machineId: "",
  //         shift: "",
  //         processName: man.name,
  //       },
  //     ];
  //     return acc;
  //   }, {});

  //   setRows(initialRows);
  // }, [manufacturingVariables, quantity, isAutoSchedule]);

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

  useEffect(() => {
    const fetchMachines = async () => {
      const machineData = {};
      for (const man of manufacturingVariables) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_BASE_URL}/api/manufacturing/category/${man.categoryId}`
          );

          // Add status information to each machine
          machineData[man.categoryId] = response.data.subCategories.map(
            (machine) => ({
              ...machine,
              isAvailable:
                machine.status === "available" &&
                (!machine.unavailableUntil ||
                  new Date(machine.unavailableUntil) <= new Date()),
            })
          );
        } catch (error) {
          console.error("Error fetching available machines:", error);
        }
      }
      setMachineOptions(machineData);
    };
    fetchMachines();
  }, [manufacturingVariables]);

  console.log("Machine Options:", machineOptions);

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

  const calculateEndDate = (startDate, plannedMinutes, shiftMinutes = 480) => {
    if (!startDate || !plannedMinutes) return "";

    let parsedDate = new Date(startDate);
    if (isNaN(parsedDate.getTime())) return "";

    // Calculate total number of full working days needed
    let totalDays = Math.ceil(plannedMinutes / shiftMinutes);
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

  const calculateStartAndEndDates = (
    inputStartDate,
    plannedMinutes,
    shiftMinutes = 1440
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
  const calculateEndDateWithDowntime = (
    startDate,
    plannedMinutes,
    shiftMinutes = 480,
    machine,
    currentIndex,
    currentRowIndex
  ) => {
    if (!startDate || !plannedMinutes) return "";

    const parsedDate = new Date(startDate);
    if (isNaN(parsedDate.getTime())) return "";

    let remainingMinutes = plannedMinutes;
    let currentDate = new Date(parsedDate);
    let totalDowntimeAdded = 0;

    while (remainingMinutes > 0) {
      // Skip non-working days
      while (
        getDay(currentDate) === 0 ||
        eventDates.some((d) => isSameDay(d, currentDate))
      ) {
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Check for machine downtime
      if (machine) {
        const downtimeInfo = isMachineOnDowntimeDuringPeriod(
          machine,
          currentDate,
          new Date(currentDate.getTime() + shiftMinutes * 60000)
        );

        if (downtimeInfo.isDowntime) {
          remainingMinutes += downtimeInfo.downtimeMinutes;
          totalDowntimeAdded += downtimeInfo.downtimeMinutes;
        }
      }

      const minutesToDeduct = Math.min(remainingMinutes, shiftMinutes);
      remainingMinutes -= minutesToDeduct;

      if (remainingMinutes > 0) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // Update the row with downtime information
    setRows((prevRows) => {
      const updatedRows = { ...prevRows };
      if (updatedRows[currentIndex]?.[currentRowIndex]) {
        updatedRows[currentIndex][currentRowIndex] = {
          ...updatedRows[currentIndex][currentRowIndex],
          totalDowntimeAdded,
        };
      }
      return updatedRows;
    });

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
              processId: man.categoryId, //Add processId to each allocation as well
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
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/subAssemblyListFirst/${subAssemblyListFirstId}/partsListItems/${partListItemId}/allocation`,
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
                        <th>Plan Qty</th>
                        <th>Plan Qty Time</th>
                        <th style={{ width: "20%" }}>Shift</th>
                        <th style={{ width: "15%" }}>Start Time</th>
                        <th style={{ width: "10%" }}>Start Date</th>
                        <th>End Time</th>
                        <th style={{ width: "8%" }}>End Date</th>
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
                          <td>{row.plannedQtyTime} m</td>
                          <td>
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
                                    calculateEndDateWithDowntime(
                                      date,
                                      row.plannedQtyTime,
                                      shiftOptions.find(
                                        (s) => s.name === row.shift
                                      )?.TotalHours,
                                      machine,
                                      index,
                                      rowIndex
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
                            <Autocomplete
                              sx={{
                                width: 150,
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
                              options={machineOptions[man.categoryId] || []}
                              value={
                                machineOptions[man.categoryId]?.find(
                                  (machine) =>
                                    machine.subcategoryId === row.machineId
                                ) || null
                              }
                              // In your Autocomplete onChange handler for machines:
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

                                    // Recalculate end date with downtime
                                    updatedRows[rowIndex].endDate =
                                      calculateEndDateWithDowntime(
                                        updatedRows[rowIndex].startDate,
                                        updatedRows[rowIndex].plannedQtyTime,
                                        shift?.TotalHours,
                                        newValue
                                      );

                                    // Show notification if machine has downtime
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
                                return `${option.name} (${status.status})`;
                              }}
                              renderOption={(props, option) => {
                                const status = getMachineStatus(
                                  option,
                                  row.startDate,
                                  row.endDate,
                                  allocatedMachines
                                );
                                const isDisabled = status.isAllocated; // Only disable if allocated, not for downtime

                                return (
                                  <li
                                    {...props}
                                    style={{
                                      backgroundColor: isDisabled
                                        ? "#fff9f9"
                                        : "white",
                                      padding: "10px 16px",
                                      borderBottom: "1px solid #f0f0f0",
                                      cursor: isDisabled
                                        ? "not-allowed"
                                        : "pointer",
                                      opacity: isDisabled ? 0.8 : 1,
                                      ...props.style,
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      {/* Status Icon */}
                                      <div
                                        style={{
                                          width: 24,
                                          height: 24,
                                          borderRadius: "50%",
                                          backgroundColor:
                                            status.isAllocated &&
                                            status.isDowntime
                                              ? "#d32f2f"
                                              : status.isDowntime
                                              ? "#f44336"
                                              : status.isAllocated
                                              ? "#ff9800"
                                              : "#4caf50",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          marginRight: 12,
                                          flexShrink: 0,
                                        }}
                                      >
                                        {status.isAllocated &&
                                        status.isDowntime ? (
                                          <span
                                            style={{
                                              color: "white",
                                              fontSize: 12,
                                            }}
                                          >
                                            !
                                          </span>
                                        ) : (
                                          <span
                                            style={{
                                              color: "white",
                                              fontSize: 12,
                                            }}
                                          >
                                            {status.isDowntime
                                              ? "D"
                                              : status.isAllocated
                                              ? "O"
                                              : "A"}
                                          </span>
                                        )}
                                      </div>

                                      <div style={{ flexGrow: 1 }}>
                                        <div
                                          style={{
                                            fontWeight: 500,
                                            color: isDisabled ? "#555" : "#222",
                                          }}
                                        >
                                          {option.name}
                                          <span
                                            style={{
                                              marginLeft: 8,
                                              fontSize: "0.75rem",
                                              color:
                                                status.isAllocated &&
                                                status.isDowntime
                                                  ? "#d32f2f"
                                                  : status.isDowntime
                                                  ? "#f44336"
                                                  : status.isAllocated
                                                  ? "#ff9800"
                                                  : "#4caf50",
                                              fontWeight: 600,
                                            }}
                                          >
                                            {status.status}
                                          </span>
                                        </div>

                                        {/* Detailed Status Information */}
                                        <div
                                          style={{
                                            fontSize: "0.75rem",
                                            color: "#666",
                                            marginTop: 4,
                                          }}
                                        >
                                          {status.isDowntime && (
                                            <div>
                                              <span>Downtime: </span>
                                              <span style={{ fontWeight: 500 }}>
                                                {formatDowntime(
                                                  status.downtimeMinutes
                                                )}
                                              </span>
                                              {status.downtimeReason && (
                                                <span>
                                                  {" "}
                                                  ({status.downtimeReason})
                                                </span>
                                              )}
                                            </div>
                                          )}
                                          {status.isAllocated && (
                                            <div>
                                              <span>Allocated: </span>
                                              <span style={{ fontWeight: 500 }}>
                                                {allocatedMachines[
                                                  option.subcategoryId
                                                ]?.[0]?.startDate
                                                  ? formatDate(
                                                      new Date(
                                                        allocatedMachines[
                                                          option.subcategoryId
                                                        ][0].startDate
                                                      )
                                                    )
                                                  : "Unknown period"}
                                              </span>
                                            </div>
                                          )}
                                          {!isDisabled && (
                                            <div style={{ color: "#4caf50" }}>
                                              Available for selection
                                            </div>
                                          )}
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
                                  No machines available in this category
                                </div>
                              }
                              loadingText={
                                <div
                                  style={{
                                    padding: 12,
                                    color: "#666",
                                    textAlign: "center",
                                  }}
                                >
                                  Loading machines...
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
                                      padding: "10px 16px",
                                      borderBottom: "1px solid #f0f0f0",
                                      cursor: "pointer",
                                      backgroundColor: isOnLeave
                                        ? "#fff0f0"
                                        : isAllocated
                                        ? "#fff9e6"
                                        : "white",
                                      ...props.style,
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
                                            : isAllocated
                                            ? "#ffc107"
                                            : "#4caf50",
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
                                          {isOnLeave
                                            ? "✈"
                                            : isAllocated
                                            ? "⏳"
                                            : "👤"}
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
                                              color: "#666",
                                            }}
                                          >
                                            {isOnLeave &&
                                              `On Leave (${leaveDuration}d)`}
                                            {isAllocated &&
                                              !isOnLeave &&
                                              "Allocated"}
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
                              }}
                              onChange={(event, newValue) => {
                                if (!hasStartDate) return;

                                if (
                                  newValue &&
                                  !isOperatorAvailable(
                                    newValue.name,
                                    row.startDate,
                                    row.endDate
                                  )
                                ) {
                                  toast.error(
                                    "This operator is allocated during the selected dates."
                                  );
                                  return;
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
