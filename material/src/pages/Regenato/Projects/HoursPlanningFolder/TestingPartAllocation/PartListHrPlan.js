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
import {
  FaWarehouse,
  FaBoxes,
  FaStoreAlt,
  FaClipboardList,
  FaCheckCircle,
  FaThumbsUp,
} from "react-icons/fa";
// import { FiInfoCircle } from 'react-icons/fi';
import { FiInfo } from "react-icons/fi";
import {
  FiSettings,
  FiPackage,
  FiPlus,
  FiTrash2,
  FiBox,
  FiClock,
  FiCalendar,
  FiAlertTriangle,
  FiCpu,
  FiHome,
  FiUser,
} from "react-icons/fi";
export const PartListHrPlan = ({
  partName,
  manufacturingVariables,
  quantity,
  porjectID,
  partID,
  partListItemId,
  partManufacturingVariables,
  partsCodeId,
  onUpdateAllocaitonStatus,
}) => {
  const userRole = localStorage.getItem("userRole");
  const [machineOptions, setMachineOptions] = useState({});
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("actual");
  const [rows, setRows] = useState({});
  const [operators, setOperators] = useState([]);
  const [leaveData, setLeaveData] = useState({});
  const [hasStartDate, setHasStartDate] = useState(false);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [processGapMinutes, setProcessGapMinutes] = useState(1);
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
  const [blankStoreQty, setBlankStoreQty] = useState(100); // Hardcoded value for Quantity in Blank Store
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BASE_URL}/api/eventScheduler/events`)
      .then((response) => response.json())
      .then((data) => {
        let allDates = [];

        data.forEach((event) => {
          let currentDate = new Date(event.startDate);
          const endDate = new Date(event.endDate);

          while (currentDate <= endDate) {
            allDates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
          }
        });

        setEventDates(allDates);
      })
      .catch((error) => console.error("Error fetching events:", error));
  }, []);

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/shiftVariable`
        );
        const data = await response.json();
        if (response.ok) {
          const formattedShifts = data.map((shift) => {
            const start = new Date(`2000-01-01T${shift.StartTime}:00`);
            const end = new Date(`2000-01-01T${shift.EndTime}:00`);
            const launchStart = new Date(
              `2000-01-01T${shift.LaunchStartTime}:00`
            );
            const launchEnd = new Date(`2000-01-01T${shift.LaunchEndTime}:00`);

            const totalShiftMinutes = (end - start) / (1000 * 60);
            const breakMinutes = (launchEnd - launchStart) / (1000 * 60);
            const workingMinutes = totalShiftMinutes - breakMinutes;

            return {
              name: shift.name,
              _id: shift._id,
              startTime: shift.StartTime,
              endTime: shift.EndTime,
              breakStartTime: shift.LaunchStartTime,
              breakEndTime: shift.LaunchEndTime,
              totalShiftMinutes,
              workingMinutes,
              breakMinutes,
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
          console.log(response)
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
          const operatorAllocations = {};
          const machineAllocations = {};
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
                    projectName: project.projectName,
                    partName: process.partName,
                    processName: process.processName,
                    operator: alloc.operator,
                  });
                }
                // Process operator allocations using operatorId instead of name
                if (alloc.operator) {
                  const operator = operators.find(
                    (op) =>
                      op.name === alloc.operator ||
                      `${op.categoryId} - ${op.name}` === alloc.operator
                  );
                  if (operator) {
                    const operatorId = operator._id;
                    if (!operatorAllocations[operatorId]) {
                      operatorAllocations[operatorId] = [];
                    }
                    operatorAllocations[operatorId].push({
                      startDate: new Date(alloc.startDate),
                      endDate: new Date(alloc.endDate),
                      projectName: project.projectName,
                      partName: process.partName,
                      processName: process.processName,
                    });
                  }
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
  }, [operators]); // Add operators as dependency

  const isMachineAvailable = (machineId, startDate, endDate) => {
    if (!allocatedMachines[machineId]) {
      return {
        available: true,
        status: "Available",
        conflictingAllocation: null,
      };
    }

    const parsedStart = new Date(startDate);
    const parsedEnd = new Date(endDate);

    const conflictingAllocation = allocatedMachines[machineId].find((alloc) => {
      const allocStart = new Date(alloc.startDate);
      const allocEnd = new Date(alloc.endDate);

      return (
        (parsedStart >= allocStart && parsedStart <= allocEnd) ||
        (parsedEnd >= allocStart && parsedEnd <= allocEnd) ||
        (parsedStart <= allocStart && parsedEnd >= allocEnd)
      );
    });

    return {
      available: !conflictingAllocation,
      status: conflictingAllocation ? "Occupied" : "Available",
      conflictingAllocation: conflictingAllocation || null,
    };
  };

  const isMachineOnDowntimeDuringPeriod = (machine, startDate, endDate) => {
    if (!machine?.downtimeHistory?.length) {
      return { isDowntime: false, downtimeMinutes: 0 };
    }

    const relevantDowntimes = machine.downtimeHistory.filter((downtime) => {
      const downtimeStart = new Date(downtime.startTime);
      const downtimeEnd = new Date(downtime.endTime);
      const requestStart = startDate ? new Date(startDate) : new Date();
      const requestEnd = endDate ? new Date(endDate) : new Date(downtimeEnd);

      return (
        downtimeStart <= requestEnd &&
        downtimeEnd >= requestStart &&
        !downtime.isCompleted
      );
    });

    if (relevantDowntimes.length === 0) {
      return { isDowntime: false, downtimeMinutes: 0 };
    }

    let totalDowntimeMinutes = 0;
    const workingDayMinutes = 510;

    relevantDowntimes.forEach((downtime) => {
      const downtimeStart = new Date(downtime.startTime);
      const downtimeEnd = new Date(downtime.endTime);
      const requestStart = startDate ? new Date(startDate) : new Date();
      const requestEnd = endDate ? new Date(endDate) : new Date(downtimeEnd);

      const overlapStart = new Date(Math.max(downtimeStart, requestStart));
      const overlapEnd = new Date(Math.min(downtimeEnd, requestEnd));

      const totalMinutes = (overlapEnd - overlapStart) / (1000 * 60);

      if (totalMinutes > workingDayMinutes) {
        const fullDays = Math.floor(totalMinutes / (24 * 60));
        totalDowntimeMinutes += fullDays * workingDayMinutes;

        const remainingMinutes = totalMinutes % (24 * 60);
        totalDowntimeMinutes += Math.min(remainingMinutes, workingDayMinutes);
      } else {
        totalDowntimeMinutes += totalMinutes;
      }
    });

    const latestDowntimeEnd = new Date(
      Math.max(...relevantDowntimes.map((d) => new Date(d.endTime).getTime()))
    );

    return {
      isDowntime: true,
      downtimeMinutes: totalDowntimeMinutes,
      downtimeReason: relevantDowntimes[0].reason,
      downtimeEnd: isNaN(latestDowntimeEnd.getTime())
        ? null
        : latestDowntimeEnd,
    };
  };

  const getMachineStatus = (machine, startDate, endDate) => {
    if (!machine) {
      return {
        status: "Unknown",
        isDowntime: false,
        isAllocated: false,
        isOccupiedWithDowntime: false,
        conflictingAllocation: null,
      };
    }

    const downtimeInfo = isMachineOnDowntimeDuringPeriod(
      machine,
      startDate,
      endDate
    );
    const availabilityInfo = isMachineAvailable(
      machine.subcategoryId,
      startDate,
      endDate
    );

    const downtimeWorkingDays = downtimeInfo.isDowntime
      ? Math.ceil(downtimeInfo.downtimeMinutes / 510)
      : 0;

    if (downtimeInfo.isDowntime && !availabilityInfo.available) {
      return {
        status: `Occupied with Downtime (${downtimeWorkingDays}d)`,
        isDowntime: true,
        isAllocated: true,
        isOccupiedWithDowntime: true,
        downtimeMinutes: downtimeInfo.downtimeMinutes,
        downtimeReason: downtimeInfo.downtimeReason,
        downtimeEnd: downtimeInfo.downtimeEnd,
        conflictingAllocation: availabilityInfo.conflictingAllocation,
      };
    }

    if (downtimeInfo.isDowntime) {
      return {
        status: `Downtime (${downtimeWorkingDays}d)`,
        isDowntime: true,
        isAllocated: false,
        isOccupiedWithDowntime: false,
        downtimeMinutes: downtimeInfo.downtimeMinutes,
        downtimeReason: downtimeInfo.downtimeReason,
        downtimeEnd: downtimeInfo.downtimeEnd,
        conflictingAllocation: null,
      };
    }

    if (!availabilityInfo.available) {
      return {
        status: "Occupied",
        isDowntime: false,
        isAllocated: true,
        isOccupiedWithDowntime: false,
        downtimeMinutes: 0,
        conflictingAllocation: availabilityInfo.conflictingAllocation,
      };
    }

    return {
      status: "Available",
      isDowntime: false,
      isAllocated: false,
      isOccupiedWithDowntime: false,
      downtimeMinutes: 0,
      conflictingAllocation: null,
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

  const isOperatorAvailable = (operatorId, startDate, endDate) => {
    if (!startDate || !endDate) {
      return {
        available: true,
        status: "Available",
        allocation: null,
      };
    }

    // Convert dates to Date objects if they aren't already
    const parsedStart = new Date(startDate);
    const parsedEnd = new Date(endDate);

    // Set hours to start of day for proper date comparison
    parsedStart.setHours(0, 0, 0, 0);
    parsedEnd.setHours(0, 0, 0, 0);

    // Find the operator
    const operator = operators.find((op) => op._id === operatorId);
    if (!operator) {
      return {
        available: true,
        status: "Available",
        allocation: null,
      };
    }

    // Check if operator is on leave
    if (isOperatorOnLeave(operator, parsedStart, parsedEnd)) {
      return {
        available: false,
        status: "On Leave",
        allocation: null,
      };
    }

    // Check if operator has any allocations
    if (
      !operatorAllocations[operatorId] ||
      operatorAllocations[operatorId].length === 0
    ) {
      return {
        available: true,
        status: "Available",
        allocation: null,
      };
    }

    // Find conflicting allocation
    const conflictingAllocation = operatorAllocations[operatorId].find(
      (alloc) => {
        const allocStart = new Date(alloc.startDate);
        const allocEnd = new Date(alloc.endDate);

        // Set hours to start of day for proper date comparison
        allocStart.setHours(0, 0, 0, 0);
        allocEnd.setHours(0, 0, 0, 0);

        return (
          (parsedStart >= allocStart && parsedStart <= allocEnd) ||
          (parsedEnd >= allocStart && parsedEnd <= allocEnd) ||
          (parsedStart <= allocStart && parsedEnd >= allocEnd)
        );
      }
    );

    return {
      available: !conflictingAllocation,
      status: conflictingAllocation ? "Occupied" : "Available",
      allocation: conflictingAllocation || null,
    };
  };

  const isOperatorOnLeave = (operator, startDate, endDate) => {
    if (!operator?.leavePeriod || operator.leavePeriod.length === 0) {
      return false;
    }

    const parsedStart = startDate ? new Date(startDate) : null;
    const parsedEnd = endDate ? new Date(endDate) : null;

    if (!parsedStart || !parsedEnd) return false;

    // Set hours to start of day for proper date comparison
    parsedStart.setHours(0, 0, 0, 0);
    parsedEnd.setHours(0, 0, 0, 0);

    return operator.leavePeriod.some((leave) => {
      const leaveStart = new Date(leave.startDate);
      const leaveEnd = new Date(leave.endDate);

      // Set hours to start of day for proper date comparison
      leaveStart.setHours(0, 0, 0, 0);
      leaveEnd.setHours(0, 0, 0, 0);

      return (
        (parsedStart >= leaveStart && parsedStart <= leaveEnd) ||
        (parsedEnd >= leaveStart && parsedEnd <= leaveEnd) ||
        (parsedStart <= leaveStart && parsedEnd >= leaveEnd)
      );
    });
  };

  const isHighlightedOrDisabled = (date) => {
    return (
      eventDates.some((eventDate) => isSameDay(eventDate, date)) ||
      getDay(date) === 0
    );
  };

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
      const processInfo = getProcessSpecialDayInfo(man.name, man.categoryId);
      acc[index] = [
        {
          plannedQuantity: isAutoSchedule ? quantity : "",
          plannedQtyTime: isAutoSchedule
            ? processInfo?.isSpecialday
              ? processInfo.SpecialDayTotalMinutes
              : calculatePlannedMinutes(
                  quantity * man.hours,
                  man.name,
                  man.categoryId
                )
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

  const handleQuantityChange = (index, rowIndex, value) => {
    setRows((prevRows) => {
      const updatedRows = { ...prevRows };
      const processRows = [...(updatedRows[index] || [])];
      const newQuantity =
        value === "" ? "" : Math.max(0, Math.min(quantity, Number(value)));

      const processInfo = getProcessSpecialDayInfo(
        manufacturingVariables[index].name,
        manufacturingVariables[index].categoryId
      );

      processRows[rowIndex] = {
        ...processRows[rowIndex],
        plannedQuantity: newQuantity,
        plannedQtyTime: processInfo?.isSpecialday
          ? processInfo.SpecialDayTotalMinutes
          : calculatePlannedMinutes(
              newQuantity * manufacturingVariables[index].hours,
              manufacturingVariables[index].name,
              manufacturingVariables[index].categoryId
            ),
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
          if (Array.isArray(data) && data.length > 0) {
            setOperators(data);
          } else {
            console.warn("No operators found in API response.");
            setOperators([]);
          }
        }
      } catch (err) {
        console.error("Error fetching operators", err);
      }
    };

    fetchOperators();
  }, []);

  const getFilteredMachines = (man, machines) => {
    const processData = partManufacturingVariables?.find(
      (mv) => mv.name === man.name
    );

    if (processData?.SubMachineName) {
      return machines.filter(
        (machine) => machine.name === processData.SubMachineName
      );
    }
    return machines;
  };

  useEffect(() => {
    const fetchMachines = async () => {
      const machineData = {};
      for (const man of manufacturingVariables) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_BASE_URL}/api/manufacturing/category/${man.categoryId}`
          );

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
      console.log("spectillsjfslj", machineData);
    };
    fetchMachines();
  }, [manufacturingVariables, partManufacturingVariables]);

  useEffect(() => {
    const initialRows = manufacturingVariables.reduce((acc, man, index) => {
      acc[index] = [
        {
          plannedQuantity: isAutoSchedule ? quantity : "",
          plannedQtyTime: isAutoSchedule
            ? calculatePlannedMinutes(
                quantity * man.hours,
                man.name,
                man.categoryId
              )
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

  const calculatePlannedMinutes = (hours, processName, categoryId) => {
    const processInfo = getProcessSpecialDayInfo(processName, categoryId);

    if (processInfo?.isSpecialday) {
      // For special day processes, return SpecialDayTotalMinutes directly without any multiplication
      return processInfo.SpecialDayTotalMinutes;
    }
    // For regular processes, multiply hours by 60 to convert to minutes
    return Math.round(hours * 60);
  };

  const calculateEndDate = (startDate, plannedMinutes, shift) => {
    if (!startDate || !plannedMinutes) return "";

    let parsedDate = new Date(startDate);
    if (isNaN(parsedDate.getTime())) return "";

    const workingMinutesPerDay = shift?.workingMinutes || 450;

    let totalDays = Math.ceil(plannedMinutes / workingMinutesPerDay);
    let currentDate = new Date(parsedDate);
    let daysAdded = 0;

    while (daysAdded < totalDays) {
      while (
        getDay(currentDate) === 0 ||
        eventDates.some((d) => isSameDay(d, currentDate))
      ) {
        currentDate.setDate(currentDate.getDate() + 1);
      }

      daysAdded++;

      if (daysAdded <= totalDays) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return currentDate.toISOString().split("T")[0];
  };

  const formatDate = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const calculateStartAndEndDates = (inputStartDate, plannedMinutes, shift) => {
    let parsedStartDate = new Date(inputStartDate);
    let remainingMinutes = plannedMinutes;
    let workingMinutesPerDay = shift?.workingMinutes || 450;
    let currentDate = new Date(parsedStartDate);

    while (
      getDay(currentDate) === 0 ||
      eventDates.some((d) => isSameDay(d, currentDate))
    ) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const startDate = new Date(currentDate);

    while (remainingMinutes > 0) {
      if (
        getDay(currentDate) !== 0 &&
        !eventDates.some((d) => isSameDay(d, currentDate))
      ) {
        remainingMinutes -= workingMinutesPerDay;
      }

      if (remainingMinutes > 0) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    const endDate = new Date(currentDate);

    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    };
  };

  const handleStartDateChange = (index, rowIndex, date) => {
    if (!date) return;

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

      if (isAutoSchedule && index === 0) {
        let currentDate = new Date(nextWorkingDay);
        let previousEndTime = null;
        let previousEndDate = null;
        let usedOperators = new Set(); // Track used operators

        manufacturingVariables.forEach((man, processIndex) => {
          const shift = shiftOptions.length > 0 ? shiftOptions[0] : null;
          const machineList = machineOptions[man.categoryId] || [];
          const processInfo = getProcessSpecialDayInfo(
            man.name,
            man.categoryId
          );

          newRows[processIndex] = newRows[processIndex].map((row) => {
            let firstAvailableMachine = null;
            let daysAddedForDowntime = 0;

            firstAvailableMachine = machineList.find((machine) => {
              const shift = shiftOptions.length > 0 ? shiftOptions[0] : null;
              const endDateEstimate = calculateEndDateWithDowntime(
                currentDate,
                row.plannedQtyTime,
                shift,
                machine,
                index,
                rowIndex
              );

              const availability = isMachineAvailable(
                machine.subcategoryId,
                currentDate,
                endDateEstimate
              );

              if (!availability.available) return false;

              const downtimeInfo = isMachineOnDowntimeDuringPeriod(
                machine,
                currentDate,
                null
              );

              return !downtimeInfo.isDowntime;
            });

            if (!firstAvailableMachine) {
              let earliestEndMachine = null;
              let earliestEndDate = null;

              machineList.forEach((machine) => {
                const availability = isMachineAvailable(
                  machine.subcategoryId,
                  currentDate,
                  null
                );

                if (!availability.available) return;

                const downtimeInfo = isMachineOnDowntimeDuringPeriod(
                  machine,
                  currentDate,
                  null
                );

                if (downtimeInfo.isDowntime && downtimeInfo.downtimeEnd) {
                  if (
                    !earliestEndDate ||
                    downtimeInfo.downtimeEnd < earliestEndDate
                  ) {
                    earliestEndDate = downtimeInfo.downtimeEnd;
                    earliestEndMachine = machine;
                  }
                }
              });

              firstAvailableMachine = earliestEndMachine;
            }

            let startDate = currentDate;
            let endDate = currentDate;

            if (firstAvailableMachine) {
              const downtimeInfo = isMachineOnDowntimeDuringPeriod(
                firstAvailableMachine,
                startDate,
                null
              );

              if (downtimeInfo.isDowntime && downtimeInfo.downtimeEnd) {
                startDate = new Date(downtimeInfo.downtimeEnd);
                startDate.setDate(startDate.getDate() + 1);
                startDate = getNextWorkingDay(startDate);
              }

              // Handle special day process
              if (processInfo?.isSpecialday) {
                // Convert minutes to days (1440 minutes = 1 day)
                const daysNeeded = Math.ceil(row.plannedQtyTime / 1440);
                endDate = new Date(startDate);
                // For 1440 minutes, end date should be next day
                if (row.plannedQtyTime === 1440) {
                  endDate.setDate(endDate.getDate() + 1);
                } else {
                  endDate.setDate(endDate.getDate() + daysNeeded - 1);
                }
              } else {
                endDate = calculateEndDateWithDowntime(
                  startDate,
                  row.plannedQtyTime,
                  shift,
                  firstAvailableMachine,
                  index,
                  rowIndex
                );
              }
            } else {
              const { startDate: calcStart, endDate: calcEnd } =
                calculateStartAndEndDates(
                  currentDate,
                  row.plannedQtyTime,
                  shift?.TotalHours
                );
              startDate = new Date(calcStart);
              endDate = new Date(calcEnd);
            }

            // Calculate start time based on previous process end time
            let startTime = shift?.startTime || "09:00";
            if (processIndex > 0 && previousEndTime) {
              // Add gap minutes to previous end time
              const [prevHours, prevMinutes] = previousEndTime
                .split(":")
                .map(Number);
              const totalMinutes =
                prevHours * 60 + prevMinutes + processGapMinutes;
              const newHours = Math.floor(totalMinutes / 60);
              const newMinutes = totalMinutes % 60;
              startTime = `${String(newHours).padStart(2, "0")}:${String(
                newMinutes
              ).padStart(2, "0")}`;

              // Use the same date as previous process end date if possible
              if (previousEndDate) {
                startDate = new Date(previousEndDate);
              }
            }

            // Find available operators that haven't been used yet
            const availableOperators = operators.filter((operator) => {
              const isOnLeave = isOperatorOnLeave(operator, startDate, endDate);
              const { available } = isOperatorAvailable(
                operator._id,
                startDate,
                endDate
              );
              return (
                !isOnLeave && available && !usedOperators.has(operator._id)
              );
            });

            // Select the first available operator
            const selectedOperator = availableOperators[0];
            if (selectedOperator) {
              usedOperators.add(selectedOperator._id);
            }

            // Calculate end time based on start time and planned minutes
            const endTime = calculateEndTime(
              startTime,
              row.plannedQtyTime,
              shift
            );
            previousEndTime = endTime;
            previousEndDate = endDate;

            currentDate = new Date(endDate);

            return {
              ...row,
              startDate: formatDateUTC(startDate),
              endDate: formatDateUTC(endDate),
              shift: shift?.name || "",
              startTime: startTime,
              endTime: endTime,
              machineId: firstAvailableMachine
                ? firstAvailableMachine.subcategoryId
                : "",
              operatorId: selectedOperator ? selectedOperator._id : "",
            };
          });
        });

        return newRows;
      } else {
        const shift = shiftOptions.find(
          (option) => option.name === currentRow.shift
        );

        // For non-auto schedule, calculate start time based on previous process
        let startTime = shift?.startTime || "09:00";
        let startDate = nextWorkingDay;

        if (index > 0) {
          const previousProcess = newRows[index - 1]?.[0];
          if (previousProcess?.endTime) {
            const [prevHours, prevMinutes] = previousProcess.endTime
              .split(":")
              .map(Number);
            const totalMinutes =
              prevHours * 60 + prevMinutes + processGapMinutes;
            const newHours = Math.floor(totalMinutes / 60);
            const newMinutes = totalMinutes % 60;
            startTime = `${String(newHours).padStart(2, "0")}:${String(
              newMinutes
            ).padStart(2, "0")}`;

            // Use the same date as previous process end date
            if (previousProcess.endDate) {
              startDate = new Date(previousProcess.endDate);
            }
          }
        }

        // Handle special day process
        const processInfo = getProcessSpecialDayInfo(
          manufacturingVariables[index].name,
          manufacturingVariables[index].categoryId
        );

        let endDate;
        if (processInfo?.isSpecialday) {
          // Convert minutes to days (1440 minutes = 1 day)
          const daysNeeded = Math.ceil(currentRow.plannedQtyTime / 1440);
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + daysNeeded - 1);
        } else {
          endDate = calculateEndDateWithDowntime(
            startDate,
            currentRow.plannedQtyTime,
            shift,
            machineOptions[manufacturingVariables[index].categoryId]?.find(
              (m) => m.subcategoryId === currentRow.machineId
            ),
            index,
            rowIndex
          );
        }

        newRows[index][rowIndex] = {
          ...currentRow,
          startDate: formatDateUTC(startDate),
          startTime: startTime,
          endDate: formatDateUTC(endDate),
        };

        const currentMachine = machineOptions[
          manufacturingVariables[index].categoryId
        ]?.find((m) => m.subcategoryId === currentRow.machineId);

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

  const formatDateUTC = (date) => {
    const d = new Date(date);
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
      .toISOString()
      .split("T")[0];
  };

  const getNextWorkingDay = (date) => {
    let nextDay = new Date(date);
    while (
      getDay(nextDay) === 0 ||
      eventDates.some((d) => isSameDay(d, nextDay))
    ) {
      nextDay.setDate(nextDay.getDate() + 1);
    }
    return new Date(
      Date.UTC(nextDay.getFullYear(), nextDay.getMonth(), nextDay.getDate())
    );
  };

  const formatDateWithoutTimezone = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();

    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const calculateEndDateWithDowntime = (
    startDate,
    plannedMinutes,
    shift,
    machine,
    processIndex,
    rowIndex
  ) => {
    if (!startDate || !plannedMinutes) return "";

    const parsedDate = new Date(startDate);
    if (isNaN(parsedDate.getTime())) return "";

    const processInfo = manufacturingVariables[processIndex];
    const specialDayInfo = getProcessSpecialDayInfo(
      processInfo.name,
      processInfo.categoryId
    );

    let currentDate = new Date(parsedDate);
    let endDate = new Date(currentDate);

    // Special handling for special day processes
    if (specialDayInfo?.isSpecialday) {
      // For special day processes, we treat each day as a full working day (1440 minutes)
      const daysNeeded = Math.ceil(plannedMinutes / 1440);

      // Start with the next working day
      let currentDay = getNextWorkingDay(new Date(currentDate));
      let daysAdded = 0;

      // Add the required number of working days
      while (daysAdded < daysNeeded) {
        // Skip to next working day if current day is Sunday or event date
        while (
          getDay(currentDay) === 0 ||
          eventDates.some((d) => isSameDay(d, currentDay))
        ) {
          currentDay.setDate(currentDay.getDate() + 1);
        }

        daysAdded++;
        if (daysAdded < daysNeeded) {
          currentDay.setDate(currentDay.getDate() + 1);
        }
      }

      // Final check to ensure we're not ending on a Sunday or event date
      while (
        getDay(currentDay) === 0 ||
        eventDates.some((d) => isSameDay(d, currentDay))
      ) {
        currentDay.setDate(currentDay.getDate() + 1);
      }

      return formatDateUTC(currentDay);
    }

    // Regular process logic
    const workingMinutesPerDay = shift?.workingMinutes || 510;
    let remainingMinutes = plannedMinutes;
    let totalDowntimeAdded = 0;

    if (machine) {
      const downtimeInfo = isMachineOnDowntimeDuringPeriod(
        machine,
        currentDate,
        null
      );
      if (downtimeInfo.isDowntime && downtimeInfo.downtimeEnd) {
        currentDate = new Date(downtimeInfo.downtimeEnd);
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate = getNextWorkingDay(currentDate);
      }
    }

    const workingDaysNeeded = Math.ceil(
      remainingMinutes / workingMinutesPerDay
    );
    let daysAdded = 0;
    endDate = new Date(currentDate);

    while (daysAdded < workingDaysNeeded) {
      while (
        getDay(endDate) === 0 ||
        eventDates.some((d) => isSameDay(d, endDate))
      ) {
        endDate.setDate(endDate.getDate() + 1);
      }

      if (machine) {
        const dayStart = new Date(endDate);
        const dayEnd = new Date(endDate);
        dayEnd.setHours(23, 59, 59, 999);
        const downtimeInfo = isMachineOnDowntimeDuringPeriod(
          machine,
          dayStart,
          dayEnd
        );

        if (downtimeInfo.isDowntime) {
          totalDowntimeAdded += downtimeInfo.downtimeMinutes;
          endDate.setDate(endDate.getDate() + 1);
          continue;
        }
      }

      daysAdded++;
      if (daysAdded < workingDaysNeeded) {
        endDate.setDate(endDate.getDate() + 1);
      }
    }

    while (
      getDay(endDate) === 0 ||
      eventDates.some((d) => isSameDay(d, endDate))
    ) {
      endDate.setDate(endDate.getDate() + 1);
    }

    if (totalDowntimeAdded > 0) {
      setRows((prevRows) => {
        const updatedRows = [...prevRows[processIndex]];
        updatedRows[rowIndex] = {
          ...updatedRows[rowIndex],
          totalDowntimeAdded,
        };
        return { ...prevRows, [processIndex]: updatedRows };
      });
    }

    return formatDateUTC(endDate);
  };

  const addRow = (index) => {
    if (!hasStartDate) return;

    const currentRemaining = remainingQuantities[index];
    if (currentRemaining <= 0) {
      toast.warning("No remaining quantity available for this process");
      return;
    }

    const processInfo = getProcessSpecialDayInfo(
      manufacturingVariables[index].name,
      manufacturingVariables[index].categoryId
    );

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
            processInfo?.isSpecialday
              ? 0
              : currentRemaining * manufacturingVariables[index].hours,
            manufacturingVariables[index].name,
            manufacturingVariables[index].categoryId
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

    const selectedMachinesInProcess = rows[processIndex]
      ? rows[processIndex]
          .filter((_, idx) => idx !== rowIndex)
          .map((row) => row.machineId)
          .filter(Boolean)
      : [];

    return allMachines.filter(
      (machine) => !selectedMachinesInProcess.includes(machine.subcategoryId)
    );
  };

  const getAvailableOperatorsForRow = (processIndex, rowIndex) => {
    const selectedOperatorsInProcess = rows[processIndex]
      ? rows[processIndex]
          .filter((_, idx) => idx !== rowIndex)
          .map((row) => row.operatorId)
          .filter(Boolean)
      : [];

    return operators.filter(
      (operator) => !selectedOperatorsInProcess.includes(operator._id)
    );
  };

  const deleteRow = (index, rowIndex) => {
    setRows((prevRows) => {
      const updatedRows = [...prevRows[index]];
      const deletedQuantity = updatedRows[rowIndex].plannedQuantity || 0;
      updatedRows.splice(rowIndex, 1);

      if (updatedRows.length === 0) {
        updatedRows.push({
          partType: "Make",
          plannedQuantity: quantity,
          startDate: "",
          endDate: "",
          machineId: "",
          shift: "Shift A",
          plannedQtyTime: calculatePlannedMinutes(
            quantity * manufacturingVariables[index].hours,
            manufacturingVariables[index].name,
            manufacturingVariables[index].categoryId
          ),
          operatorId: "",
          processName: manufacturingVariables[index].name,
        });
      }

      setRemainingQuantities((prev) => ({
        ...prev,
        [index]: Math.min(quantity, prev[index] + deletedQuantity),
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

      const groupedAllocations = {};

      Object.keys(rows).forEach((index) => {
        const man = manufacturingVariables[index];
        let orderCounter = 1;

        rows[index].forEach((row, rowIndex) => {
          console.log(`Processing row ${rowIndex} in process ${index}:`, row);

          if (
            row.plannedQuantity &&
            row.startDate &&
            row.endDate &&
            row.machineId &&
            row.shift &&
            row.operatorId
          ) {
            const key = `${partName}-${man.categoryId}-${man.name}`;

            if (!groupedAllocations[key]) {
              groupedAllocations[key] = {
                partName: partName,
                processName: `${man.categoryId} - ${man.name}`,
                processId: man.categoryId,
                partsCodeId: partsCodeId,
                allocations: [],
              };
            }

            const splitNumber = orderCounter.toString().padStart(3, "0");
            orderCounter++;
            const selectedShift = shiftOptions.find(
              (shift) => shift.name === row.shift
            );

            // Get the machine to access its warehouse
            const machine = machineOptions[man.categoryId]?.find(
              (m) => m.subcategoryId === row.machineId
            );

            groupedAllocations[key].allocations.push({
              splitNumber,
              AllocationPartType: "Part",
              plannedQuantity: row.plannedQuantity,
              startDate: new Date(row.startDate).toISOString(),
              startTime: row.startTime || "08:00 AM",
              endDate: new Date(row.endDate).toISOString(),
              endTime: calculateEndTime(
                row.startTime,
                row.plannedQtyTime,
                shiftOptions.find((s) => s.name === row.shift)
              ),
              machineId: row.machineId,
              wareHouse: machine?.wareHouse || "N/A", // Add warehouse here
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

      // Rest of the handleSubmit function remains the same...
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

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/allocation`,
        { allocations: finalAllocations }
      );

      if (response.status === 201) {
        toast.success("Allocations successfully added!");
        setIsDataAllocated(true);
        setActiveTab("planned");

        if (onUpdateAllocaitonStatus) {
          onUpdateAllocaitonStatus(response.data);
        }
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
    if (!startTime || !plannedMinutes || !shift) return "00:00";

    const [startHour, startMin] = startTime.split(":").map(Number);
    const shiftStart = new Date();
    shiftStart.setHours(startHour, startMin, 0, 0);

    // Get process info to check if it's a special day
    const processInfo = manufacturingVariables.find(
      (mv) => mv.name === shift.processName
    );
    const specialDayInfo = getProcessSpecialDayInfo(
      processInfo?.name,
      processInfo?.categoryId
    );

    // Special handling for special day processes
    if (specialDayInfo?.isSpecialday) {
      const endTime = new Date(shiftStart);

      // For special day processes, we use a fixed 8-hour working day
      const workingMinutesPerDay = 480; // 8 hours

      // If it's exactly 1440 minutes (1 day), set end time to next day's start time
      if (plannedMinutes === 1440) {
        // Set end time to the same time as start time (for next day)
        return startTime;
      }

      // For other durations, calculate based on 8-hour working day
      const daysNeeded = Math.ceil(plannedMinutes / workingMinutesPerDay);

      // For single day allocations
      if (daysNeeded === 1) {
        endTime.setMinutes(endTime.getMinutes() + plannedMinutes);
        // Cap at 5:30 PM
        if (
          endTime.getHours() > 17 ||
          (endTime.getHours() === 17 && endTime.getMinutes() > 30)
        ) {
          endTime.setHours(17, 30, 0, 0);
        }
        return formatTime(endTime);
      }

      // For multiple days, calculate the end time on the last day
      const remainingMinutes =
        plannedMinutes % workingMinutesPerDay || workingMinutesPerDay;
      endTime.setMinutes(endTime.getMinutes() + remainingMinutes);
      // Cap at 5:30 PM
      if (
        endTime.getHours() > 17 ||
        (endTime.getHours() === 17 && endTime.getMinutes() > 30)
      ) {
        endTime.setHours(17, 30, 0, 0);
      }
      return formatTime(endTime);
    }

    // Regular process logic
    const shiftEnd = new Date(shiftStart);
    const [shiftEndHour, shiftEndMin] = shift.endTime.split(":").map(Number);
    shiftEnd.setHours(shiftEndHour, shiftEndMin, 0, 0);

    const breakStart = new Date(shiftStart);
    const breakEnd = new Date(shiftStart);
    if (shift.breakStartTime && shift.breakEndTime) {
      const [breakStartHour, breakStartMin] = shift.breakStartTime
        .split(":")
        .map(Number);
      const [breakEndHour, breakEndMin] = shift.breakEndTime
        .split(":")
        .map(Number);
      breakStart.setHours(breakStartHour, breakStartMin, 0, 0);
      breakEnd.setHours(breakEndHour, breakEndMin, 0, 0);
    }

    let current = new Date(shiftStart);
    let minutesLeft = plannedMinutes;

    const calculateWorkMinutes = (start, end) =>
      start >= end ? 0 : Math.floor((end - start) / (1000 * 60));

    if (breakStart > current && breakEnd > current) {
      const beforeBreak = calculateWorkMinutes(current, breakStart);
      if (minutesLeft <= beforeBreak) {
        current.setMinutes(current.getMinutes() + minutesLeft);
        return formatTime(current);
      } else {
        minutesLeft -= beforeBreak;
        current = new Date(breakEnd);
      }
    }

    const remainingShift = calculateWorkMinutes(current, shiftEnd);
    if (minutesLeft <= remainingShift) {
      current.setMinutes(current.getMinutes() + minutesLeft);
      return formatTime(current);
    }

    minutesLeft -= remainingShift;

    // Advance to next working day recursively
    const nextDay = getNextWorkingDay(
      new Date(current.setDate(current.getDate() + 1))
    );
    nextDay.setHours(
      parseInt(shift.startTime.split(":")[0]),
      parseInt(shift.startTime.split(":")[1]),
      0,
      0
    );

    return calculateEndTime(formatTime(nextDay), minutesLeft, shift);
  };

  const formatTime = (date) =>
    `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}`;

  const handleTimeChange = (index, rowIndex, newStartTime) => {
    const row = rows[index][rowIndex];
    const shift = shiftOptions.find((s) => s.name === row.shift);

    if (!shift || !row.startDate || !row.plannedQtyTime) {
      setRows((prevRows) => {
        const updatedRows = [...prevRows[index]];
        updatedRows[rowIndex] = {
          ...updatedRows[rowIndex],
          startTime: newStartTime,
        };
        return {
          ...prevRows,
          [index]: updatedRows,
        };
      });
      return;
    }

    // Parse shift times
    const [shiftStartHour, shiftStartMin] = shift.startTime
      .split(":")
      .map(Number);
    const [shiftEndHour, shiftEndMin] = shift.endTime.split(":").map(Number);
    const [startHour, startMin] = newStartTime.split(":").map(Number);

    // Check if selected time is within shift boundaries
    const selectedTime = startHour * 60 + startMin;
    const shiftStartMinutes = shiftStartHour * 60 + shiftStartMin;
    const shiftEndMinutes = shiftEndHour * 60 + shiftEndMin;

    if (selectedTime < shiftStartMinutes || selectedTime > shiftEndMinutes) {
      toast.error(
        `Please select a time between ${shift.startTime} and ${shift.endTime}`
      );
      return;
    }

    // Check if this time respects the gap from previous process
    if (index > 0) {
      const previousProcess = rows[index - 1]?.[0];
      if (previousProcess?.endTime) {
        const [prevHours, prevMinutes] = previousProcess.endTime
          .split(":")
          .map(Number);
        const prevTotalMinutes = prevHours * 60 + prevMinutes;
        const newTotalMinutes = startHour * 60 + startMin;

        if (newTotalMinutes < prevTotalMinutes + processGapMinutes) {
          toast.error(
            `Start time must be at least ${processGapMinutes} minutes after the previous process end time (${previousProcess.endTime})`
          );
          return;
        }
      }
    }

    const startDate = new Date(row.startDate);
    startDate.setHours(startHour, startMin, 0, 0);

    let current = new Date(startDate);
    let minutesLeft = row.plannedQtyTime;
    let currentDay = new Date(startDate);
    let endTime = "";
    let endDate = new Date(startDate);

    const calculateWorkMinutes = (start, end) => {
      if (start >= end) return 0;
      return Math.floor((end - start) / (1000 * 60));
    };

    // Handle break time if exists
    let breakStart = null;
    let breakEnd = null;
    if (shift.breakStartTime && shift.breakEndTime) {
      const [breakStartHour, breakStartMin] = shift.breakStartTime
        .split(":")
        .map(Number);
      const [breakEndHour, breakEndMin] = shift.breakEndTime
        .split(":")
        .map(Number);

      breakStart = new Date(startDate);
      breakStart.setHours(breakStartHour, breakStartMin, 0, 0);

      breakEnd = new Date(startDate);
      breakEnd.setHours(breakEndHour, breakEndMin, 0, 0);
    }

    // Calculate end time considering shift boundaries
    while (minutesLeft > 0) {
      const shiftEnd = new Date(current);
      shiftEnd.setHours(shiftEndHour, shiftEndMin, 0, 0);

      // If we're in break time, skip to after break
      if (
        breakStart &&
        breakEnd &&
        current >= breakStart &&
        current < breakEnd
      ) {
        current = new Date(breakEnd);
        continue;
      }

      // Calculate available minutes until next break or shift end
      let availableUntil =
        breakStart && current < breakStart ? breakStart : shiftEnd;
      const availableMinutes = calculateWorkMinutes(current, availableUntil);

      if (minutesLeft <= availableMinutes) {
        endTime = formatTime(
          new Date(current.getTime() + minutesLeft * 60 * 1000)
        );
        endDate = new Date(currentDay);
        minutesLeft = 0;
      } else {
        minutesLeft -= availableMinutes;
        current = new Date(availableUntil);

        // Only move to next day if we've reached shift end
        if (current >= shiftEnd) {
          currentDay.setDate(currentDay.getDate() + 1);
          currentDay = getNextWorkingDay(currentDay);
          current = new Date(currentDay);
          current.setHours(shiftStartHour, shiftStartMin, 0, 0);
        }
      }
    }

    setRows((prevRows) => {
      const updatedRows = [...prevRows[index]];
      updatedRows[rowIndex] = {
        ...updatedRows[rowIndex],
        startTime: newStartTime,
        endDate: formatDateUTC(endDate),
        endTime: endTime,
      };

      // Update subsequent processes to maintain gap
      if (index < manufacturingVariables.length - 1) {
        const nextProcessIndex = index + 1;
        const nextProcess = prevRows[nextProcessIndex]?.[0];
        if (nextProcess) {
          const [endHours, endMinutes] = endTime.split(":").map(Number);
          const nextStartTotalMinutes =
            endHours * 60 + endMinutes + processGapMinutes;
          const nextStartHours = Math.floor(nextStartTotalMinutes / 60);
          const nextStartMinutes = nextStartTotalMinutes % 60;
          const nextStartTime = `${String(nextStartHours).padStart(
            2,
            "0"
          )}:${String(nextStartMinutes).padStart(2, "0")}`;

          // Set the next process start date to be the same as current process end date
          prevRows[nextProcessIndex][0] = {
            ...nextProcess,
            startTime: nextStartTime,
            startDate: formatDateUTC(endDate), // Use the same date as current process end date
          };
        }
      }

      return { ...prevRows, [index]: updatedRows };
    });
  };

  const getProcessSpecialDayInfo = (processName, categoryId) => {
    const processInfo = partManufacturingVariables?.find(
      (mv) => mv.name === processName && mv.categoryId === categoryId
    );
    return processInfo || null;
  };

  const openApproveModal = () => {
    if (typeof quantity !== "number" || isNaN(quantity)) {
      toast.error("Invalid quantity from props.");
      return;
    }
    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0.");
      return;
    }
    if (blankStoreQty <= 0) {
      toast.error("Quantity in Blank Store must be greater than 0.");
      return;
    }
    if (quantity > blankStoreQty) {
      toast.error(
        `Cannot approve: Required quantity (${quantity}) exceeds Quantity in Blank Store (${blankStoreQty}).`
      );
      return;
    }
    setIsApproveModalOpen(true);
  };

  const handleApprove = () => {
    toast.success("Approved! You can now confirm allocation.");
    setIsApproved(true);
    setIsApproveModalOpen(false);
  };

  return (
    <div style={{ width: "100%", margin: "auto" }}>
      <Card>
        <CardHeader
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

          {userRole === "admin" && !isDataAllocated && (
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span style={{ fontSize: "14px", color: "#495057" }}>
                  Next Process Interval (minutes):
                </span>
                <Input
                  type="number"
                  min="1"
                  max="9999"
                  value={processGapMinutes}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value >= 1 && value <= 9999) {
                      setProcessGapMinutes(value);
                    }
                  }}
                  style={{ width: "100px" }}
                />
              </div>
              <Button
                color={isAutoSchedule ? "primary" : "secondary"}
                onClick={() => setIsAutoSchedule(!isAutoSchedule)}
              >
                {isAutoSchedule ? "Auto Schedule ✅" : "Auto Schedule"}
              </Button>
            </div>
          )}
        </CardHeader>

        {!isDataAllocated && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              padding: "20px",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              background: "linear-gradient(145deg, #f8fafc, #f1f5f9)",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              transition: "all 0.3s ease",
              ":hover": {
                boxShadow:
                  "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              },
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <FaWarehouse style={{ color: "#4f46e5", fontSize: "24px" }} />
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  margin: 0,
                  color: "#1e293b",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                Staging
                {/* <FiInfo
                  style={{ cursor: "pointer" }}
                  title="This is where you verify quantities before allocation"
                /> */}
              </h2>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px",
                background: "#ffffff",
                borderRadius: "8px",
                borderLeft: "4px solid #4f46e5",
              }}
            >
              <FaBoxes style={{ color: "#64748b" }} />
              <div
                style={{ fontSize: "15px", fontWeight: 800, color: "#334155" }}
              >
                {partName} -{" "}
                <span style={{ color: "#4f46e5" }}>{partsCodeId}</span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                padding: "16px",
                background: "#ffffff",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    minWidth: "200px",
                    fontSize: "14px",
                    fontWeight: 800,
                    color: "#475569",
                  }}
                >
                  <FaStoreAlt style={{ color: "#f59e0b" }} />
                  <span>Quantity in Blank Store:</span>
                </div>
                <Input
                  type="number"
                  value={blankStoreQty}
                  min={0}
                  style={{
                    width: "120px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    fontWeight: 600,
                    ":focus": {
                      borderColor: "#4f46e5",
                      boxShadow: "0 0 0 2px rgba(79, 70, 229, 0.2)",
                    },
                  }}
                  onChange={(e) => {
                    setBlankStoreQty(Number(e.target.value));
                    setIsApproved(false);
                  }}
                  disabled={isApproved}
                />
                <Button
                  color={isApproved ? "success" : "primary"}
                  onClick={openApproveModal}
                  disabled={isApproved}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontWeight: 600,
                    padding: "8px 16px",
                    borderRadius: "6px",
                    transition: "all 0.2s ease",
                    ":hover": {
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  {isApproved ? (
                    <>
                      <FaCheckCircle /> Approved
                    </>
                  ) : (
                    <>
                      <FaThumbsUp /> Approve
                    </>
                  )}
                </Button>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 12px",
                  background: "#f8fafc",
                  borderRadius: "6px",
                }}
              >
                <FaClipboardList style={{ color: "#64748b" }} />
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 800,
                    color: "#475569",
                  }}
                >
                  Required Quantity:{" "}
                  <span style={{ color: "#4f46e5", fontWeight: 900 }}>
                    {quantity}
                  </span>
                </div>
              </div>

              {isApproved && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 12px",
                    background: "#ecfdf5",
                    borderRadius: "6px",
                    borderLeft: "4px solid #10b981",
                    marginTop: "8px",
                  }}
                >
                  <FaCheckCircle style={{ color: "#10b981" }} />
                  <span style={{ color: "#065f46", fontWeight: 600 }}>
                    Ready for allocation
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "planned" && (
          <AllocatedPartListHrPlan
            porjectID={porjectID}
            partID={partID}
            partListItemId={partListItemId}
            onDeleteSuccess={handleDeleteSuccess}
            onUpdateAllocaitonStatus={onUpdateAllocaitonStatus}
            partManufacturingVariables={partManufacturingVariables}
          />
        )}
        {activeTab === "actual" && !isDataAllocated && (
          <Collapse isOpen={true}>
            <CardBody className="shadow-md">
              <div>{/* need some more adjustment */}</div>
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
                      disabled={
                        !hasStartDate || remainingQuantities[index] <= 0
                      }
                    >
                      Add Row
                    </Button>
                  </CardHeader>
                  {/* <Table bordered responsive>
                    <thead>
                      <tr>
                        <th>Plan Qty</th>
                        <th>Plan Qty Time</th>
                        <th style={{ width: "20%" }}>Shift</th>
                        <th style={{ width: "10%" }}>Start Date</th>
                        <th style={{ width: "15%" }}>Start Time</th>
                        <th style={{ width: "8%" }}>End Date</th>
                        <th>End Time</th>
                        <th style={{ width: "25%" }}>Machine ID</th>
                        <th style={{ width: "15%" }}>Warehouse</th>
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

                                    const usedQuantityExcludingCurrent =
                                      processRows.reduce((sum, r, i) => {
                                        return i === rowIndex
                                          ? sum
                                          : sum +
                                              Number(r.plannedQuantity || 0);
                                      }, 0);

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
                                          manufacturingVariables[index].hours,
                                        manufacturingVariables[index].name,
                                        manufacturingVariables[index].categoryId
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
                            {row.plannedQtyTime
                              ? `${row.plannedQtyTime} m`
                              : ""}
                          </td>
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
                                ) ||
                                (isAutoSchedule && shiftOptions.length > 0
                                  ? shiftOptions[0]
                                  : null)
                              }
                              onChange={(event, newValue) => {
                                if (!newValue) return;

                                setRows((prevRows) => ({
                                  ...prevRows,
                                  [index]: prevRows[index].map(
                                    (row, rowIdx) => {
                                      if (rowIdx === rowIndex) {
                                        let updatedEndDate = row.endDate;
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
                                      ),
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
                              value={row.startTime}
                              min={
                                row.shift
                                  ? shiftOptions.find(
                                      (s) => s.name === row.shift
                                    )?.startTime
                                  : "00:00"
                              }
                              max={
                                row.shift
                                  ? shiftOptions.find(
                                      (s) => s.name === row.shift
                                    )?.endTime
                                  : "23:59"
                              }
                              onChange={(e) =>
                                handleTimeChange(
                                  index,
                                  rowIndex,
                                  e.target.value
                                )
                              }
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
                                onChange={() => {}}
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
                            <Input
                              type="time"
                              value={
                                row.endTime ||
                                calculateEndTime(
                                  row.startTime,
                                  row.plannedQtyTime,
                                  shiftOptions.find((s) => s.name === row.shift)
                                )
                              }
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
                              getOptionLabel={(option) =>
                                option
                                  ? `${option.subcategoryId} - ${option.name}`
                                  : ""
                              }
                              onChange={(event, newValue) => {
                                if (!hasStartDate) return;

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

                                if (newValue) {
                                  const status = getMachineStatus(
                                    newValue,
                                    row.startDate,
                                    row.endDate
                                  );

                                  if (status.isDowntime) {
                                    toast.warning(
                                      `Warning: This machine is in downtime until ${
                                        status.downtimeEnd
                                          ? new Date(
                                              status.downtimeEnd
                                            ).toLocaleDateString()
                                          : "unknown"
                                      } (Reason: ${status.downtimeReason})`
                                    );
                                  }

                                  if (
                                    status.isAllocated &&
                                    !status.isDowntime
                                  ) {
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
                                    warehouse: newValue
                                      ? newValue.wareHouse
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
                                        shift,
                                        newValue,
                                        index,
                                        rowIndex
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

                                  return {
                                    ...prevRows,
                                    [index]: updatedRows,
                                  };
                                });
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder="Select Machine"
                                  size="small"
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
                            {machineOptions[man.categoryId]?.find(
                              (machine) =>
                                machine.subcategoryId === row.machineId
                            )?.wareHouse || "-"}
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
                                // Handle case where option might be null
                                if (!option) return "";

                                const isOnLeave = isOperatorOnLeave(
                                  option,
                                  row.startDate,
                                  row.endDate
                                );
                                const { status } = isOperatorAvailable(
                                  option._id,
                                  row.startDate,
                                  row.endDate
                                );
                                return `${option.name}${
                                  isOnLeave
                                    ? " (On Leave)"
                                    : status === "Occupied"
                                    ? " (Occupied)"
                                    : ""
                                }`;
                              }}
                              renderOption={(props, option) => {
                                const isOnLeave = isOperatorOnLeave(
                                  option,
                                  row.startDate,
                                  row.endDate
                                );
                                const { status, allocation } =
                                  isOperatorAvailable(
                                    option._id,
                                    row.startDate,
                                    row.endDate
                                  );
                                // Only disable if operator is occupied, not if on leave
                                const isDisabled = status === "Occupied";

                                // Find the relevant leave period that overlaps with the selected dates
                                const relevantLeavePeriod =
                                  option.leavePeriod?.find((leave) => {
                                    const leaveStart = new Date(
                                      leave.startDate
                                    );
                                    const leaveEnd = new Date(leave.endDate);
                                    const selectedStart = row.startDate
                                      ? new Date(row.startDate)
                                      : null;
                                    const selectedEnd = row.endDate
                                      ? new Date(row.endDate)
                                      : null;

                                    if (!selectedStart || !selectedEnd)
                                      return false;

                                    return (
                                      (selectedStart >= leaveStart &&
                                        selectedStart <= leaveEnd) ||
                                      (selectedEnd >= leaveStart &&
                                        selectedEnd <= leaveEnd) ||
                                      (selectedStart <= leaveStart &&
                                        selectedEnd >= leaveEnd)
                                    );
                                  });

                                return (
                                  <li
                                    {...props}
                                    style={{
                                      padding: "10px 16px",
                                      backgroundColor: isOnLeave
                                        ? "#fff0f0"
                                        : status === "Occupied"
                                        ? "#fff9e6"
                                        : "white",
                                      color: isDisabled ? "#999" : "#212529",
                                      cursor: isDisabled
                                        ? "not-allowed"
                                        : "pointer",
                                      opacity: isDisabled ? 0.7 : 1,
                                      pointerEvents: isDisabled
                                        ? "none"
                                        : "auto",
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
                                            : status === "Occupied"
                                            ? "#ffc107"
                                            : "#28a745",
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
                                            : status === "Occupied"
                                            ? "⏳"
                                            : "👤"}
                                        </span>
                                      </div>
                                      <div style={{ flexGrow: 1 }}>
                                        <div style={{ fontWeight: 500 }}>
                                          {option.name}
                                          <span
                                            style={{
                                              marginLeft: 8,
                                              fontSize: "0.75rem",
                                              color: isOnLeave
                                                ? "#ff6b6b"
                                                : status === "Occupied"
                                                ? "#ffc107"
                                                : "#28a745",
                                            }}
                                          >
                                            {isOnLeave
                                              ? "On Leave"
                                              : status === "Occupied"
                                              ? "Occupied"
                                              : "Available"}
                                          </span>
                                        </div>
                                        {isOnLeave && relevantLeavePeriod && (
                                          <div
                                            style={{
                                              fontSize: "0.75rem",
                                              color: "#666",
                                              marginTop: 4,
                                            }}
                                          >
                                            Leave Period:{" "}
                                            {formatDate(
                                              new Date(
                                                relevantLeavePeriod.startDate
                                              )
                                            )}{" "}
                                            -{" "}
                                            {formatDate(
                                              new Date(
                                                relevantLeavePeriod.endDate
                                              )
                                            )}
                                          </div>
                                        )}
                                        {status === "Occupied" &&
                                          allocation && (
                                            <div
                                              style={{
                                                fontSize: "0.75rem",
                                                color: "#666",
                                                marginTop: 4,
                                              }}
                                            >
                                              Occupied from{" "}
                                              {formatDate(
                                                new Date(allocation.startDate)
                                              )}{" "}
                                              to{" "}
                                              {formatDate(
                                                new Date(allocation.endDate)
                                              )}
                                            </div>
                                          )}
                                      </div>
                                    </div>
                                  </li>
                                );
                              }}
                              onChange={(event, newValue) => {
                                if (!hasStartDate || !newValue) return;

                                const { status } = isOperatorAvailable(
                                  newValue._id,
                                  row.startDate,
                                  row.endDate
                                );

                                if (status === "Occupied") {
                                  event.preventDefault();
                                  toast.error(
                                    `${newValue.name} is already occupied during the selected dates`
                                  );
                                  return;
                                }

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

                                // Show warning if operator is on leave
                                const isOnLeave = isOperatorOnLeave(
                                  newValue,
                                  row.startDate,
                                  row.endDate
                                );
                                if (isOnLeave) {
                                  toast.warning(
                                    `${newValue.name} is on leave during the selected dates. Please confirm if you want to proceed.`
                                  );
                                }

                                setRows((prevRows) => ({
                                  ...prevRows,
                                  [index]: prevRows[index].map((r, idx) => {
                                    if (idx === rowIndex) {
                                      return {
                                        ...r,
                                        operatorId: newValue._id,
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
                                              backgroundColor: "#28a745",
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
                                  {operators.length === 0
                                    ? "No operators available"
                                    : "No matching operators found"}
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
                              isOptionEqualToValue={(option, value) =>
                                option._id === value._id
                              }
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
                  </Table> */}

                  <Table bordered responsive style={{ marginBottom: "2rem" }}>
                    <thead>
                      <tr>
                        <th
                          style={{
                            width: "25%",
                            backgroundColor: "#f8f9fa",
                            borderTopLeftRadius: "8px",
                            borderBottom: "2px solid #e2e8f0",
                          }}
                        >
                          Process
                        </th>
                        <th
                          style={{
                            backgroundColor: "#f8f9fa",
                            borderTopRightRadius: "8px",
                            borderBottom: "2px solid #e2e8f0",
                          }}
                        >
                          Allocation Details
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows[index]?.map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          style={{
                            borderBottom: "2px solid #e2e8f0",
                            backgroundColor:
                              rowIndex % 2 === 0 ? "#ffffff" : "#f8fafc",
                            transition: "background-color 0.2s ease",
                          }}
                        >
                          <td
                            style={{
                              verticalAlign: "top",
                              padding: "1.25rem",
                              borderRight: "1px solid #e2e8f0",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "1rem",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.75rem",
                                }}
                              >
                                <div
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "8px",
                                    backgroundColor: "#4f46e510",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <FiSettings size={20} color="#4f46e5" />
                                </div>
                                <div>
                                  <div
                                    style={{
                                      fontWeight: "600",
                                      fontSize: "0.95rem",
                                      color: "#1e293b",
                                    }}
                                  >
                                    {`${man.categoryId} - ${man.name}`}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "0.8rem",
                                      color: "#64748b",
                                      marginTop: "0.25rem",
                                    }}
                                  >
                                    Process {index + 1}
                                  </div>
                                </div>
                              </div>

                              {rowIndex === 0 && (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    padding: "0.75rem",
                                    backgroundColor: "#f1f5f9",
                                    borderRadius: "8px",
                                    borderLeft: "3px solid #4f46e5",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "32px",
                                      height: "32px",
                                      borderRadius: "6px",
                                      backgroundColor: "#4f46e510",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <FiPackage size={16} color="#4f46e5" />
                                  </div>
                                  <div style={{ fontSize: "0.85rem" }}>
                                    <div
                                      style={{
                                        fontWeight: 600,
                                        color: "#334155",
                                      }}
                                    >
                                      Quantity Status
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        gap: "0.5rem",
                                        marginTop: "0.25rem",
                                      }}
                                    >
                                      <span
                                        style={{
                                          color: "#4f46e5",
                                          fontWeight: 700,
                                        }}
                                      >
                                        {remainingQuantities[index] || 0}
                                      </span>
                                      <span style={{ color: "#64748b" }}>
                                        remaining of
                                      </span>
                                      <span
                                        style={{
                                          color: "#4f46e5",
                                          fontWeight: 700,
                                        }}
                                      >
                                        {quantity}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div
                                style={{
                                  display: "flex",
                                  gap: "0.75rem",
                                  marginTop: "0.5rem",
                                }}
                              >
                                <Button
                                  color="primary"
                                  size="sm"
                                  onClick={() => addRow(index)}
                                  disabled={
                                    !hasStartDate ||
                                    remainingQuantities[index] <= 0
                                  }
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    fontSize: "0.8rem",
                                    fontWeight: 500,
                                    borderRadius: "6px",
                                    padding: "0.5rem 0.75rem",
                                    flex: 1,
                                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                    transition: "all 0.2s ease",
                                  }}
                                >
                                  <FiPlus size={16} />
                                  Add Row
                                </Button>
                                <Button
                                  color="danger"
                                  size="sm"
                                  onClick={() =>
                                    hasStartDate && deleteRow(index, rowIndex)
                                  }
                                  disabled={!hasStartDate}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    fontSize: "0.8rem",
                                    fontWeight: 500,
                                    borderRadius: "6px",
                                    padding: "0.5rem 0.75rem",
                                    flex: 1,
                                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                    transition: "all 0.2s ease",
                                  }}
                                >
                                  <FiTrash2 size={16} />
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "1.25rem" }}>
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(auto-fill, minmax(240px, 1fr))",
                                gap: "1.25rem",
                                padding: "0.5rem 0",
                              }}
                            >
                              {/* Plan Quantity */}
                              <div
                                style={{
                                  backgroundColor: "#ffffff",
                                  borderRadius: "8px",
                                  padding: "1rem",
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                  border: "1px solid #e2e8f0",
                                }}
                              >
                                <label
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                    color: "#334155",
                                    marginBottom: "0.75rem",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "28px",
                                      height: "28px",
                                      borderRadius: "6px",
                                      backgroundColor: "#3b82f610",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <FiBox size={16} color="#3b82f6" />
                                  </div>
                                  Plan Quantity
                                </label>
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

                                        const usedQuantityExcludingCurrent =
                                          processRows.reduce((sum, r, i) => {
                                            return i === rowIndex
                                              ? sum
                                              : sum +
                                                  Number(
                                                    r.plannedQuantity || 0
                                                  );
                                          }, 0);

                                        const maxAllowed =
                                          quantity -
                                          usedQuantityExcludingCurrent;
                                        const safeValue = Math.min(
                                          Number(newValue),
                                          maxAllowed
                                        );

                                        processRows[rowIndex] = {
                                          ...processRows[rowIndex],
                                          plannedQuantity: safeValue,
                                          plannedQtyTime:
                                            calculatePlannedMinutes(
                                              (safeValue || 0) *
                                                manufacturingVariables[index]
                                                  .hours,
                                              manufacturingVariables[index]
                                                .name,
                                              manufacturingVariables[index]
                                                .categoryId
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
                                    style={{
                                      width: "100%",
                                      padding: "0.5rem 0.75rem",
                                      fontSize: "0.875rem",
                                      border: "1px solid #e2e8f0",
                                      borderRadius: "6px",
                                      transition: "all 0.2s ease",
                                      ":focus": {
                                        borderColor: "#3b82f6",
                                        boxShadow:
                                          "0 0 0 2px rgba(59, 130, 246, 0.2)",
                                      },
                                    }}
                                  />
                                ) : (
                                  <Input
                                    type="number"
                                    value={row.plannedQuantity}
                                    onChange={(e) =>
                                      handleQuantityChange(
                                        index,
                                        rowIndex,
                                        e.target.value
                                      )
                                    }
                                    style={{
                                      width: "100%",
                                      padding: "0.5rem 0.75rem",
                                      fontSize: "0.875rem",
                                      border: "1px solid #e2e8f0",
                                      borderRadius: "6px",
                                      transition: "all 0.2s ease",
                                      ":focus": {
                                        borderColor: "#3b82f6",
                                        boxShadow:
                                          "0 0 0 2px rgba(59, 130, 246, 0.2)",
                                      },
                                    }}
                                  />
                                )}
                              </div>

                              {/* Plan Quantity Time */}
                              <div
                                style={{
                                  backgroundColor: "#ffffff",
                                  borderRadius: "8px",
                                  padding: "1rem",
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                  border: "1px solid #e2e8f0",
                                }}
                              >
                                <label
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                    color: "#334155",
                                    marginBottom: "0.75rem",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "28px",
                                      height: "28px",
                                      borderRadius: "6px",
                                      backgroundColor: "#10b98110",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <FiClock size={16} color="#10b981" />
                                  </div>
                                  Plan Time (min)
                                </label>
                                <Input
                                  type="text"
                                  value={
                                    row.plannedQtyTime
                                      ? `${row.plannedQtyTime} m`
                                      : ""
                                  }
                                  readOnly
                                  style={{
                                    width: "100%",
                                    padding: "0.5rem 0.75rem",
                                    fontSize: "0.875rem",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "6px",
                                    backgroundColor: "#f8fafc",
                                    cursor: "not-allowed",
                                  }}
                                />
                              </div>

                              {/* Shift */}
                              <div
                                style={{
                                  backgroundColor: "#ffffff",
                                  borderRadius: "8px",
                                  padding: "1rem",
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                  border: "1px solid #e2e8f0",
                                }}
                              >
                                <label
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                    color: "#334155",
                                    marginBottom: "0.75rem",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "28px",
                                      height: "28px",
                                      borderRadius: "6px",
                                      backgroundColor: "#f59e0b10",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <FiCalendar size={16} color="#f59e0b" />
                                  </div>
                                  Shift
                                </label>
                                <Autocomplete
                                  sx={{
                                    width: "100%",
                                    "& .MuiOutlinedInput-root": {
                                      padding: "6px !important",
                                      fontSize: "0.875rem",
                                    },
                                  }}
                                  options={shiftOptions || []}
                                  value={
                                    shiftOptions.find(
                                      (option) => option.name === row.shift
                                    ) ||
                                    (isAutoSchedule && shiftOptions.length > 0
                                      ? shiftOptions[0]
                                      : null)
                                  }
                                  onChange={(event, newValue) => {
                                    if (!newValue) return;

                                    setRows((prevRows) => ({
                                      ...prevRows,
                                      [index]: prevRows[index].map(
                                        (row, rowIdx) => {
                                          if (rowIdx === rowIndex) {
                                            let updatedEndDate = row.endDate;
                                            if (row.startDate) {
                                              const recalculated =
                                                calculateStartAndEndDates(
                                                  row.startDate,
                                                  row.plannedQtyTime,
                                                  newValue.TotalHours
                                                );
                                              updatedEndDate =
                                                recalculated.endDate;
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
                                      label="Select Shift"
                                      variant="outlined"
                                      size="small"
                                      placeholder="Select Shift"
                                    />
                                  )}
                                  disabled={!hasStartDate && index !== 0}
                                />
                              </div>

                              {/* Start Date */}
                              <div
                                style={{
                                  backgroundColor: "#ffffff",
                                  borderRadius: "8px",
                                  padding: "1rem",
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                  border: "1px solid #e2e8f0",
                                }}
                              >
                                <label
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                    color: "#334155",
                                    marginBottom: "0.75rem",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "28px",
                                      height: "28px",
                                      borderRadius: "6px",
                                      backgroundColor: "#8b5cf610",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <FiCalendar size={16} color="#8b5cf6" />
                                  </div>
                                  Start Date
                                </label>
                                <div style={{ position: "relative" }}>
                                  <DatePicker
                                    selected={
                                      row.startDate
                                        ? new Date(row.startDate + "T00:00:00")
                                        : null
                                    }
                                    onChange={(date) => {
                                      if (!date) return;

                                      const utcDate = new Date(
                                        Date.UTC(
                                          date.getFullYear(),
                                          date.getMonth(),
                                          date.getDate()
                                        )
                                      );

                                      handleStartDateChange(
                                        index,
                                        rowIndex,
                                        utcDate
                                      );
                                    }}
                                    filterDate={(date) => {
                                      return (
                                        date >=
                                        new Date(
                                          new Date().setHours(0, 0, 0, 0)
                                        )
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
                                            ),
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
                                </div>
                              </div>

                              {/* Start Time */}
                              <div
                                style={{
                                  backgroundColor: "#ffffff",
                                  borderRadius: "8px",
                                  padding: "1rem",
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                  border: "1px solid #e2e8f0",
                                }}
                              >
                                <label
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                    color: "#334155",
                                    marginBottom: "0.75rem",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "28px",
                                      height: "28px",
                                      borderRadius: "6px",
                                      backgroundColor: "#ec489910",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <FiClock size={16} color="#ec4899" />
                                  </div>
                                  Start Time
                                </label>
                                <div style={{ position: "relative" }}>
                                  <Input
                                    type="time"
                                    value={row.startTime}
                                    min={
                                      row.shift
                                        ? shiftOptions.find(
                                            (s) => s.name === row.shift
                                          )?.startTime
                                        : "00:00"
                                    }
                                    max={
                                      row.shift
                                        ? shiftOptions.find(
                                            (s) => s.name === row.shift
                                          )?.endTime
                                        : "23:59"
                                    }
                                    onChange={(e) =>
                                      handleTimeChange(
                                        index,
                                        rowIndex,
                                        e.target.value
                                      )
                                    }
                                    style={{
                                      width: "100%",
                                      padding: "0.5rem 0.75rem",
                                      fontSize: "0.875rem",
                                      border: "1px solid #e2e8f0",
                                      borderRadius: "6px",
                                      transition: "all 0.2s ease",
                                      ":focus": {
                                        borderColor: "#ec4899",
                                        boxShadow:
                                          "0 0 0 2px rgba(236, 72, 153, 0.2)",
                                      },
                                    }}
                                  />
                                </div>
                              </div>

                              {/* End Date */}
                              <div
                                style={{
                                  backgroundColor: "#ffffff",
                                  borderRadius: "8px",
                                  padding: "1rem",
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                  border: "1px solid #e2e8f0",
                                }}
                              >
                                <label
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                    color: "#334155",
                                    marginBottom: "0.75rem",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "28px",
                                      height: "28px",
                                      borderRadius: "6px",
                                      backgroundColor: "#14b8a610",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <FiCalendar size={16} color="#14b8a6" />
                                  </div>
                                  End Date
                                </label>
                                <div style={{ position: "relative" }}>
                                  <DatePicker
                                    selected={
                                      row.endDate ? new Date(row.endDate) : null
                                    }
                                    onChange={() => {}}
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
                                        fontSize: "0.75rem",
                                        color: "#dc3545",
                                        marginTop: "0.5rem",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.25rem",
                                        padding: "0.25rem 0.5rem",
                                        backgroundColor: "#fee2e2",
                                        borderRadius: "4px",
                                      }}
                                    >
                                      <FiAlertTriangle size={12} />
                                      <span>
                                        +{row.totalDowntimeAdded}m downtime
                                        added
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* End Time */}
                              <div
                                style={{
                                  backgroundColor: "#ffffff",
                                  borderRadius: "8px",
                                  padding: "1rem",
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                  border: "1px solid #e2e8f0",
                                }}
                              >
                                <label
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                    color: "#334155",
                                    marginBottom: "0.75rem",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "28px",
                                      height: "28px",
                                      borderRadius: "6px",
                                      backgroundColor: "#0ea5e910",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <FiClock size={16} color="#0ea5e9" />
                                  </div>
                                  End Time
                                </label>
                                <div style={{ position: "relative" }}>
                                  <Input
                                    type="time"
                                    value={
                                      row.endTime ||
                                      calculateEndTime(
                                        row.startTime,
                                        row.plannedQtyTime,
                                        shiftOptions.find(
                                          (s) => s.name === row.shift
                                        )
                                      )
                                    }
                                    readOnly
                                    style={{
                                      width: "100%",
                                      padding: "0.5rem 0.75rem",
                                      fontSize: "0.875rem",
                                      border: "1px solid #e2e8f0",
                                      borderRadius: "6px",
                                      backgroundColor: "#f8fafc",
                                      cursor: "not-allowed",
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Machine */}
                              <div
                                style={{
                                  backgroundColor: "#ffffff",
                                  borderRadius: "8px",
                                  padding: "1rem",
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                  border: "1px solid #e2e8f0",
                                }}
                              >
                                <label
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                    color: "#334155",
                                    marginBottom: "0.75rem",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "28px",
                                      height: "28px",
                                      borderRadius: "6px",
                                      backgroundColor: "#6366f110",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <FiCpu size={16} color="#6366f1" />
                                  </div>
                                  Machine
                                </label>
                                <Autocomplete
                                  sx={{
                                    width: "100%",
                                    "& .MuiOutlinedInput-root": {
                                      padding: "6px !important",
                                      fontSize: "0.875rem",
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
                                  getOptionLabel={(option) =>
                                    option
                                      ? `${option.subcategoryId} - ${option.name}`
                                      : ""
                                  }
                                  onChange={(event, newValue) => {
                                    if (!hasStartDate) return;

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

                                    if (newValue) {
                                      const status = getMachineStatus(
                                        newValue,
                                        row.startDate,
                                        row.endDate
                                      );

                                      if (status.isDowntime) {
                                        toast.warning(
                                          `Warning: This machine is in downtime until ${
                                            status.downtimeEnd
                                              ? new Date(
                                                  status.downtimeEnd
                                                ).toLocaleDateString()
                                              : "unknown"
                                          } (Reason: ${status.downtimeReason})`
                                        );
                                      }

                                      if (
                                        status.isAllocated &&
                                        !status.isDowntime
                                      ) {
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
                                        warehouse: newValue
                                          ? newValue.wareHouse
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
                                            updatedRows[rowIndex]
                                              .plannedQtyTime,
                                            shift,
                                            newValue,
                                            index,
                                            rowIndex
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

                                      return {
                                        ...prevRows,
                                        [index]: updatedRows,
                                      };
                                    });
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      placeholder="Select Machine"
                                      size="small"
                                    />
                                  )}
                                  disabled={!hasStartDate}
                                />
                              </div>

                              {/* Warehouse */}
                              <div
                                style={{
                                  backgroundColor: "#ffffff",
                                  borderRadius: "8px",
                                  padding: "1rem",
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                  border: "1px solid #e2e8f0",
                                }}
                              >
                                <label
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                    color: "#334155",
                                    marginBottom: "0.75rem",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "28px",
                                      height: "28px",
                                      borderRadius: "6px",
                                      backgroundColor: "#f9731610",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <FiHome size={16} color="#f97316" />
                                  </div>
                                  Warehouse
                                </label>
                                <Input
                                  type="text"
                                  value={
                                    machineOptions[man.categoryId]?.find(
                                      (machine) =>
                                        machine.subcategoryId === row.machineId
                                    )?.wareHouse || "-"
                                  }
                                  readOnly
                                  style={{
                                    width: "100%",
                                    padding: "0.5rem 0.75rem",
                                    fontSize: "0.875rem",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "6px",
                                    backgroundColor: "#f8fafc",
                                    cursor: "not-allowed",
                                  }}
                                />
                              </div>

                              {/* Operator */}
                              <div
                                style={{
                                  backgroundColor: "#ffffff",
                                  borderRadius: "8px",
                                  padding: "1rem",
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                  border: "1px solid #e2e8f0",
                                }}
                              >
                                <label
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                    color: "#334155",
                                    marginBottom: "0.75rem",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "28px",
                                      height: "28px",
                                      borderRadius: "6px",
                                      backgroundColor: "#06b6d410",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <FiUser size={16} color="#06b6d4" />
                                  </div>
                                  Operator
                                </label>
                                <Autocomplete
                                  sx={{
                                    width: "100%",
                                    "& .MuiOutlinedInput-root": {
                                      padding: "6px !important",
                                      fontSize: "0.875rem",
                                    },
                                  }}
                                  options={operators}
                                  value={
                                    operators.find(
                                      (op) => op._id === row.operatorId
                                    ) || null
                                  }
                                  getOptionLabel={(option) => {
                                    if (!option) return "";
                                    const isOnLeave = isOperatorOnLeave(
                                      option,
                                      row.startDate,
                                      row.endDate
                                    );
                                    const { status } = isOperatorAvailable(
                                      option._id,
                                      row.startDate,
                                      row.endDate
                                    );
                                    return `${option.name}${
                                      isOnLeave
                                        ? " (On Leave)"
                                        : status === "Occupied"
                                        ? " (Occupied)"
                                        : ""
                                    }`;
                                  }}
                                  onChange={(event, newValue) => {
                                    if (!hasStartDate || !newValue) return;

                                    const { status } = isOperatorAvailable(
                                      newValue._id,
                                      row.startDate,
                                      row.endDate
                                    );

                                    if (status === "Occupied") {
                                      event.preventDefault();
                                      toast.error(
                                        `${newValue.name} is already occupied during the selected dates`
                                      );
                                      return;
                                    }

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

                                    const isOnLeave = isOperatorOnLeave(
                                      newValue,
                                      row.startDate,
                                      row.endDate
                                    );
                                    if (isOnLeave) {
                                      toast.warning(
                                        `${newValue.name} is on leave during the selected dates. Please confirm if you want to proceed.`
                                      );
                                    }

                                    setRows((prevRows) => ({
                                      ...prevRows,
                                      [index]: prevRows[index].map((r, idx) => {
                                        if (idx === rowIndex) {
                                          return {
                                            ...r,
                                            operatorId: newValue._id,
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
                                    />
                                  )}
                                  disabled={!hasStartDate}
                                />
                              </div>
                            </div>
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
                    !isApproved || // Only enable if approved
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

      {/* Approve Confirmation Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        toggle={() => setIsApproveModalOpen(false)}
        style={{ maxWidth: "600px", margin: "auto", marginTop: "50px" }}
      >
        <ModalHeader toggle={() => setIsApproveModalOpen(false)}>
          Confirm Approval
        </ModalHeader>
        <ModalBody>
          <p>Are you sure you want to approve this allocation?</p>
          <p>
            <strong>Required Quantity:</strong> {quantity}
          </p>
          <p>
            <strong>Blank Store Quantity:</strong> {blankStoreQty}
          </p>
          {quantity <= blankStoreQty ? (
            <p style={{ color: "green" }}>
              The required quantity is available in blank store.
            </p>
          ) : (
            <p style={{ color: "red" }}>
              Warning: Required quantity exceeds blank store quantity!
            </p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={handleApprove}
            disabled={quantity > blankStoreQty}
          >
            Confirm Approval
          </Button>
          <Button
            color="secondary"
            onClick={() => setIsApproveModalOpen(false)}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default PartListHrPlan;

<style jsx>{`
  .form-group {
    margin-bottom: 0;
  }
  .form-label {
    display: flex;
    align-items: center;
    font-size: 0.85rem;
    font-weight: 500;
    margin-bottom: 4px;
    color: #495057;
  }
  .form-control {
    width: 100%;
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #495057;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }
  .form-control:focus {
    color: #495057;
    background-color: #fff;
    border-color: #80bdff;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
  .highlighted-date {
    background-color: #f06548 !important;
    color: black !important;
    border-radius: 50%;
  }
  .small-datepicker input {
    width: 100% !important;
    font-size: 0.875rem !important;
    padding: 0.375rem 0.75rem !important;
    cursor: not-allowed;
  }
`}</style>;
