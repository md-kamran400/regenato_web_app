import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
  Alert,
  CardBody,
} from "reactstrap";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "../TestingPartAllocation/AllocatedPartListHrPlan.css";
import moment from "moment";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { CiCircleInfo } from "react-icons/ci";
import { FaArrowUp, FaArrowDown, FaWarehouse } from "react-icons/fa";
import {
  FiSettings,
  FiPackage,
  FiBox,
  FiCalendar,
  FiClock,
  FiCpu,
  FiUser,
  FiEdit,
  FiCheck,
  FiCheckCircle,
} from "react-icons/fi";
export const AllocatedPartListHrPlan = ({
  porjectID,
  partID,
  partListItemId,
  onDeleteSuccess,
  onUpdateAllocaitonStatus,
  partManufacturingVariables,
  // partsCodeId
}) => {
  const userRole = localStorage.getItem("userRole");
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailyTaskModal, setDailyTaskModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [dailyTracking, setDailyTracking] = useState([
    {
      date: "",
      planned: 0,
      produced: 0,
      dailyStatus: "On Track",
      operator: "",
    },
  ]);
  const [warehouseQuantities, setWarehouseQuantities] = useState({
    total: 200,
    remaining: 200,
  });
  const [completeConfirmationModal, setCompleteConfirmationModal] =
    useState(false);
  const [updateConfirmationModal, setUpdateConfirmationModal] = useState(false);
  const [completeProcess, setCompleteProcess] = useState(false);
  const [completingAllocation, setCompletingAllocation] = useState(false);
  const [completingprocess, setCompletingprocess] = useState(false);
  const [existingDailyTracking, setExistingDailyTracking] = useState([]);
  const [actulEndDateData, setactulEndDateData] = useState([]);
  const [addRowModal, setAddRowModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDateBlocked, setIsDateBlocked] = useState(false);
  const [highlightDates, setHighlightDates] = useState([]);
  const [goodsReceiptData, setGoodsReceiptData] = useState([]);

  const [disableDates, setDisableDates] = useState([]);
  const [warehouseChanges, setWarehouseChanges] = useState({
    fromWarehouseChange: 0,
    toWarehouseChange: 0,
  });
  const [warehouseData, setWarehouseData] = useState(null);

    useEffect(() => {
    if (selectedSection?.data?.[0]?.wareHouse) {
      // Example: "01 - General Warehouse"
      const wareHouseName = selectedSection.data[0].wareHouse;
      const categoryId = wareHouseName.split(" - ")[0]; // take "01"

      console.log("Fetching warehouse data for categoryId:", categoryId);
      axios
        .get(`${process.env.REACT_APP_BASE_URL}/api/storesVariable/category/${categoryId}`)
        .then((res) => {
          console.log("Warehouse data received:", res.data);
          setWarehouseData(res.data);
        })
        .catch((err) => {
          console.error("Error fetching warehouse data:", err);
          // Set default warehouse data if fetch fails
          setWarehouseData({
            categoryId: categoryId,
            Name: [wareHouseName],
            location: ["Unknown"],
            quantity: [0]
          });
        });
    }
  }, [selectedSection]);

  useEffect(() => {
    const disableDatesArray = [];
    if (highlightDates.length > 0) {
      highlightDates.forEach((dateString) => {
        disableDatesArray.push(new Date(dateString));
      });
    }
    setDisableDates(disableDatesArray);
  }, [highlightDates]);

  useEffect(() => {
    const fetchHighlightDates = async () => {
      try {
        // Fetch all events (including holidays)
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/eventScheduler/events`
        );
        const dates = [];
        response.data.forEach((event) => {
          const start = new Date(event.startDate);
          const end = new Date(event.endDate);
          let current = new Date(start);
          while (current <= end) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
          }
        });
        // Filter out holiday dates (events with eventName === "HOLIDAY")
        const holidayDates = response.data
          .filter((event) => event.eventName === "HOLIDAY")
          .flatMap((event) => {
            const start = new Date(event.startDate);
            const end = new Date(event.endDate);
            let current = new Date(start);
            const dates = [];
            while (current <= end) {
              dates.push(new Date(current));
              current.setDate(current.getDate() + 1);
            }
            return dates;
          });
        // Combine all dates and holiday dates
        const combinedDates = [...dates, ...holidayDates];
        // console.log("Highlight Dates:", combinedDates); // Debugging: Log the combined dates
        setHighlightDates(combinedDates);
      } catch (error) {
        console.error("Error fetching highlight dates:", error);
      }
    };
    fetchHighlightDates();
  }, []);

  // Fetch goods receipt data when component mounts
  useEffect(() => {
    fetchGoodsReceiptData();
  }, []);

  // Function to refresh warehouse data
  const refreshWarehouseData = async () => {
    if (selectedSection?.data?.[0]?.wareHouse) {
      const wareHouseName = selectedSection.data[0].wareHouse;
      const categoryId = wareHouseName.split(" - ")[0];
      
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/storesVariable/category/${categoryId}`
        );
        setWarehouseData(response.data);
        toast.success("Warehouse data refreshed successfully!");
      } catch (error) {
        console.error("Error refreshing warehouse data:", error);
        toast.error("Failed to refresh warehouse data");
      }
    }
  };

  // Function to check if warehouse quantity is sufficient
  const isWarehouseQuantitySufficient = (requiredQuantity) => {
    const availableQuantity = warehouseData?.quantity?.[0] || 0;
    return availableQuantity >= requiredQuantity;
  };

  // Function to get warehouse quantity warning
  const getWarehouseQuantityWarning = () => {
    const availableQuantity = warehouseData?.quantity?.[0] || 0;
    const producedQuantity = dailyTracking[0]?.produced || 0;
    
    if (availableQuantity === 0) {
      return { type: "error", message: "Warehouse is empty!" };
    } else if (availableQuantity < producedQuantity) {
      return { type: "warning", message: `Insufficient warehouse quantity. Available: ${availableQuantity}, Required: ${producedQuantity}` };
    } else if (availableQuantity <= 10) {
      return { type: "warning", message: "Warehouse quantity is running low!" };
    }
    return null;
  };

  const getExcludedDates = () => {
    if (
      !selectedSection?.data[0]?.startDate ||
      !actulEndDateData.actualEndDate
    ) {
      return [];
    }

    const startDate = new Date(selectedSection.data[0].startDate);
    const endDate = new Date(actulEndDateData.actualEndDate);
    const excludedDates = [];
    let current = new Date(startDate);

    while (current <= endDate) {
      excludedDates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return excludedDates;
  };

  useEffect(() => {
    // Update the fetchAllocations function to properly calculate dailyPlannedQty
    const fetchAllocations = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/allocation`
        );

        if (!response.data.data || response.data.data.length === 0) {
          setSections([]);
        } else {
          const formattedSections = response.data.data.map((item) => {
            // Find if this process is a special day process
            const processInfo = partManufacturingVariables?.find(
              (mv) => mv.categoryId === item.processId
            );

            return {
              allocationId: item._id,
              title: item.processName,
              isSpecialDay: processInfo?.isSpecialday || false,
              data: item.allocations.map((allocation) => {
                // Ensure we have valid values for calculation
                const shiftTotalTime = allocation.shiftTotalTime || 510; // Default to 8.5 hours in minutes if not set
                const perMachinetotalTime = allocation.perMachinetotalTime || 1; // Prevent division by zero
                const plannedQuantity = allocation.plannedQuantity || 0;

                // Calculate daily planned quantity
                let dailyPlannedQty;
                if (perMachinetotalTime <= 0) {
                  dailyPlannedQty = plannedQuantity; // Fallback if invalid time per unit
                } else {
                  const totalTimeRequired =
                    plannedQuantity * perMachinetotalTime;
                  dailyPlannedQty =
                    totalTimeRequired <= shiftTotalTime
                      ? plannedQuantity // Can complete in one day
                      : Math.floor(shiftTotalTime / perMachinetotalTime); // Daily capacity
                }

                return {
                  trackingId: allocation._id,
                  plannedQty: allocation.plannedQuantity,
                  startDate: moment(allocation.startDate).format("DD MMM YYYY"),
                  endDate: moment(allocation.endDate).format("DD MMM YYYY"),
                  machineId: allocation.machineId,
                  wareHouse: allocation?.wareHouse || "N/A", //warehouseId
                  warehouseId: allocation?.warehouseId || "N/A", //warehouseId
                  shift: allocation.shift,
                  plannedTime: `${allocation.plannedTime} min`,
                  operator: allocation.operator,
                  actualEndDate: allocation.actualEndDate || allocation.endDate,
                  dailyPlannedQty: dailyPlannedQty, // Use the calculated value
                  shiftTotalTime: allocation.shiftTotalTime,
                  perMachinetotalTime: allocation.perMachinetotalTime,
                  isProcessCompleted: allocation.isProcessCompleted || false,
                  warehouseQuantity: allocation.warehouseQuantity || 0, // Add warehouse quantity from allocation
                  partsCodeId: item.partsCodeId || null, // Add partsCodeId from the item
                };
              }),
            };
          });
          // Filter out consecutive duplicates by processName (title)
          const filteredSections = [];
          let lastTitle = null;
          for (const section of formattedSections) {
            if (section.title !== lastTitle) {
              filteredSections.push(section);
              lastTitle = section.title;
            }
          }
          setSections(filteredSections);
          // console.log(setSections);
        }
      } catch (error) {
        setError("Failed to fetch allocations. Please try again later.");
        console.error("Error fetching allocations:", error);
      }
      setLoading(false);
    };

    fetchAllocations();
  }, [porjectID, partID, partListItemId, partManufacturingVariables]);

  const handleCancelAllocation = async () => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/allocation`
      );
      if (response.status === 200) {
        toast.success("Allocation successfully canceled!");
        setSections([]);
        onDeleteSuccess();
        onUpdateAllocaitonStatus();
      }
    } catch (error) {
      toast.error("Failed to cancel allocation.");
      console.error("Error canceling allocation:", error);
    }
    setDeleteConfirmationModal(false);
  };

  const openModal = async (section, row) => {
    setSelectedSection({
      ...section,
      data: [row], // Pass the specific row data
    });

    // Calculate remaining quantity based on previous processes
    const currentIndex = sections.findIndex(
      (s) => s.allocationId === section.allocationId
    );
    let currentTotal = 200; // Start with initial total

    // Sum up planned quantities from previous processes
    for (let i = 0; i < currentIndex; i++) {
      const prevSection = sections[i];
      if (prevSection.data && prevSection.data.length > 0) {
        currentTotal -= prevSection.data[0].dailyPlannedQty || 0;
      }
    }

    setWarehouseQuantities({
      total: currentTotal,
      remaining: currentTotal - (row.dailyPlannedQty || 0),
    });

    setDailyTracking([
      {
        date: "",
        planned: Number(row.dailyPlannedQty) || 0, // Ensure planned is correctly set
        produced: 0,
        dailyStatus: "On Track",
        operator: row.operator || "",
      },
    ]);

    setDailyTaskModal(true);

    // Fetch existing daily tracking data
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/allocations/${section.allocationId}/allocations/${row.trackingId}/dailyTracking`
      );
      setExistingDailyTracking(response.data.dailyTracking || []);

      // Update the actualEndDateData state with the fetched data
      setactulEndDateData(response.data); //actual end date
    } catch (error) {
      console.error("Error fetching daily tracking data:", error);
    }
  };

  const openAddRowModal = () => {
    setAddRowModal(true);
  };

  const closeAddRowModal = () => {
    setAddRowModal(false);
  };

  const handleDailyTrackingChange = (index, field, value) => {
    if (field === "produced") {
      const remainingQty = calculateRemainingQuantity();
      const numericValue = Number(value) || 0;
      const availableWarehouseQty = warehouseData?.quantity?.[0] || 0;

      if (numericValue > remainingQty) {
        toast.error(
          `Produced quantity cannot exceed remaining quantity (${remainingQty})`
        );
        return;
      }

      // Check if produced quantity exceeds available warehouse quantity
      if (numericValue > availableWarehouseQty) {
        toast.error(
          `Produced quantity cannot exceed available warehouse quantity (${availableWarehouseQty})`
        );
        return;
      }

      // Calculate warehouse changes
      setWarehouseChanges({
        fromWarehouseChange: -numericValue,
        toWarehouseChange: numericValue,
      });
    }

    setDailyTracking((prev) => {
      const updated = [...prev];

      if (!updated[index]) {
        console.warn(`Index ${index} is undefined`);
        return prev;
      }

      updated[index][field] = value;

      if (field === "produced") {
        const produced = Number(value) || 0;
        const planned =
          Number(updated[index].planned) ||
          Number(selectedSection?.data[0]?.dailyPlannedQty) ||
          0;

        if (produced === planned) {
          updated[index].dailyStatus = "On Track";
        } else if (produced > planned) {
          updated[index].dailyStatus = "Ahead";
        } else {
          updated[index].dailyStatus = "Delayed";
        }
      }

      return updated;
    });
  };

  const calculateRemainingQuantity = () => {
    if (!selectedSection || !selectedSection.data[0]) return 0;

    const totalQuantity = selectedSection.data[0].plannedQty;
    const totalProduced = existingDailyTracking.reduce(
      (sum, task) => sum + task.produced,
      0
    );

    return totalQuantity - totalProduced;
  };

  const submitDailyTracking = async () => {
    setIsUpdating(true);
    try {
      if (!selectedSection || !selectedSection.data.length) {
        toast.error("No allocation selected.");
        return;
      }

      const allocationId = selectedSection.allocationId;
      const trackingId = selectedSection.data[0]?.trackingId;

      if (!allocationId || !trackingId) {
        toast.error("Allocation or Tracking ID is missing.");
        return;
      }

      const trackingData = {
        ...dailyTracking[0],
        wareHouseTotalQty: warehouseQuantities.total,
        wareHouseremainingQty: warehouseQuantities.remaining,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/allocations/${allocationId}/allocations/${trackingId}/dailyTracking`,
        trackingData
      );

      // Update warehouse quantity after successful daily tracking update
      if (dailyTracking[0]?.produced > 0 && selectedSection?.data[0]?.warehouseId) {
        try {
          const warehouseUpdateResponse = await axios.put(
            `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/update-warehouse-quantity`,
            {
              warehouseId: selectedSection.data[0].warehouseId,
              quantityToReduce: dailyTracking[0].produced
            }
          );

          // Update local warehouse data state
          if (warehouseUpdateResponse.data.success) {
            setWarehouseData(prevData => ({
              ...prevData,
              quantity: [warehouseUpdateResponse.data.data.newQuantity]
            }));
            
            toast.success(`Warehouse quantity updated: ${warehouseUpdateResponse.data.data.previousQuantity} → ${warehouseUpdateResponse.data.data.newQuantity}`);
          }
        } catch (warehouseError) {
          console.error("Error updating warehouse quantity:", warehouseError);
          toast.warning("Daily tracking updated but warehouse quantity update failed.");
        }
      }

      if (onUpdateAllocaitonStatus) {
        onUpdateAllocaitonStatus(response.data);
      }

      toast.success("Daily Tracking Updated Successfully!");

      const updatedResponse = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/allocations/${allocationId}/allocations/${trackingId}/dailyTracking`
      );

      setExistingDailyTracking(updatedResponse.data.dailyTracking || []);
      setactulEndDateData(updatedResponse.data);

      // Reset the form
      setDailyTracking([
        {
          date: "",
          planned: selectedSection.data[0].dailyPlannedQty || 0,
          produced: 0,
          dailyStatus: "On Track",
          operator: selectedSection.data[0].operator || "",
        },
      ]);

      closeAddRowModal();
    } catch (error) {
      toast.error("Failed to update daily tracking.");
      console.error("Error updating daily tracking:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const closeDailyTaskModal = () => {
    setDailyTaskModal(false);
    setDailyTracking([
      {
        date: "",
        planned: selectedSection?.data[0]?.dailyPlannedQty || 0,
        produced: 0,
        dailyStatus: "On Track",
        operator: selectedSection?.data[0]?.operator || "",
      },
    ]);
  };

  const hasTrackingForToday = () => {
    if (!existingDailyTracking || existingDailyTracking.length === 0)
      return false;

    const today = moment().startOf("day"); // Get today's date at midnight
    return existingDailyTracking.some((task) =>
      moment(task.date).startOf("day").isSame(today)
    );
  };

  // Update the getWorkingDaysDifference function
  const getWorkingDaysDifference = (startDate, endDate, holidays = []) => {
    let diff = 0;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Determine direction of comparison
    const direction = start < end ? 1 : -1;
    let current = new Date(start);

    while (direction > 0 ? current <= end : current >= end) {
      const day = current.getDay();
      const isHoliday = holidays.some((holiday) =>
        isSameDay(new Date(holiday), current)
      );

      // Only count if it's a working day (not Sunday and not holiday)
      if (day !== 0 && !isHoliday) {
        diff += direction;
      }
      current.setDate(current.getDate() + direction);
    }

    return diff;
  };

  // Update the isWorkingDayFrontend function
  const isWorkingDayFrontend = (date, holidays = []) => {
    const localDate = new Date(date);
    const day = localDate.getDay(); // 0 = Sunday
    const dateStr = localDate.toLocaleDateString("en-CA"); // YYYY-MM-DD

    const isSunday = day === 0;
    const isHoliday = holidays.some(
      (holiday) => new Date(holiday).toLocaleDateString("en-CA") === dateStr
    );

    if (isSunday || isHoliday) {
      return "highlighted-date";
    }

    return undefined;
  };

  function isSameDay(date1, date2) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  // Add this function to handle completing the allocation
  //'/projects/:projectId/partsLists/:listId/items/:itemId/complete'
  //'/projects/:projectId/subAssemblyListFirst/:listId/items/:itemId/complete'
  const handleCompleteAllocation = async () => {
    setCompletingAllocation(true);
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/items/${partListItemId}/complete-allocatoin`,
        {
          forceStatus: true, // Add this flag to ensure status is set
        }
      );

      if (response.status === 200) {
        toast.success("Allocation marked as completed!");
        // onUpdateAllocaitonStatus(response.data)
        // Verify the status in the response
        if (response.data.data.status === "Completed") {
          if (onUpdateAllocaitonStatus) {
            onUpdateAllocaitonStatus();
          }
        } else {
          toast.warning(
            "Status wasn't updated as expected. Please refresh the page."
          );
        }
      }
    } catch (error) {
      toast.error("Failed to complete allocation.");
      console.error("Error completing allocation:", error);
    } finally {
      setCompletingAllocation(false);
      setCompleteConfirmationModal(false);
    }
  };

  // Function to fetch goods receipt data
  const fetchGoodsReceiptData = async () => {
    try {
      console.log("Fetching goods receipt data...");
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/GetGoodsReceipt`
      );
      console.log("Goods receipt data received:", response.data);
      setGoodsReceiptData(response.data || []);
    } catch (error) {
      console.error("Error fetching goods receipt data:", error);
      setGoodsReceiptData([]);
    }
  };

  // Function to get matching warehouse quantity
  const getMatchingWarehouseQuantity = (partsCodeId, warehouseId) => {
    if (!goodsReceiptData || goodsReceiptData.length === 0) {
      console.log("No goods receipt data available");
      return null;
    }

    console.log("Searching for:", { partsCodeId, warehouseId });
    console.log("Available goods receipt data:", goodsReceiptData);

    const matchingItem = goodsReceiptData.find(
      (item) => item.Itemcode === partsCodeId && item.WhsCode === warehouseId
    );

    if (matchingItem) {
      console.log("Found matching item:", matchingItem);
      return matchingItem.Quantity;
    } else {
      console.log("No matching item found");
      return null;
    }
  };

  // Add this function to check if all processes are completed
  const isAllocationCompleted = () => {
    if (sections.length === 0) return false;

    return sections.every((section) => {
      return section.data.every((row) => {
        const totalProduced = existingDailyTracking.reduce(
          (sum, task) => sum + task.produced,
          0
        );
        return totalProduced >= row.plannedQty;
      });
    });
  };

  // Add new function to check remaining quantity for a specific process
  const hasRemainingQuantity = (section, row) => {
    const totalProduced = existingDailyTracking.reduce(
      (sum, task) => sum + task.produced,
      0
    );
    return totalProduced < row.plannedQty;
  };

  // Add this function to handle completing the allocation
  const handleCompleteProcess = async () => {
    setCompletingprocess(true);
    try {
      if (!selectedSection) {
        toast.error("No process selected for completion");
        return;
      }

      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/items/${partListItemId}/complete-process`,
        {
          processId: selectedSection.allocationId,
          trackingId: selectedSection.data[0]?.trackingId,
        }
      );

      if (response.status === 200) {
        toast.success("Process marked as completed!");

        // Close the modal first
        setCompleteProcess(false);
        setSelectedSection(null);

        // Trigger a re-fetch of the allocations to ensure we have the latest data
        const updatedResponse = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/allocation`
        );

        if (updatedResponse.data.data) {
          const formattedSections = updatedResponse.data.data.map((item) => {
            const processInfo = partManufacturingVariables?.find(
              (mv) => mv.categoryId === item.processId
            );

            return {
              allocationId: item._id,
              title: item.processName,
              isSpecialDay: processInfo?.isSpecialday || false,
              data: item.allocations.map((allocation) => {
                // Ensure we have valid values for calculation
                const shiftTotalTime = allocation.shiftTotalTime || 510;
                const perMachinetotalTime = allocation.perMachinetotalTime || 1;
                const plannedQuantity = allocation.plannedQuantity || 0;

                // Calculate daily planned quantity
                let dailyPlannedQty;
                if (perMachinetotalTime <= 0) {
                  dailyPlannedQty = plannedQuantity;
                } else {
                  const totalTimeRequired =
                    plannedQuantity * perMachinetotalTime;
                  dailyPlannedQty =
                    totalTimeRequired <= shiftTotalTime
                      ? plannedQuantity
                      : Math.floor(shiftTotalTime / perMachinetotalTime);
                }

                return {
                  trackingId: allocation._id,
                  plannedQty: allocation.plannedQuantity,
                  startDate: moment(allocation.startDate).format("DD MMM YYYY"),
                  endDate: moment(allocation.endDate).format("DD MMM YYYY"),
                  machineId: allocation.machineId,
                  wareHouse: allocation?.wareHouse || "N/A",
                  warehouseId: allocation?.warehouseId || "N/A",
                  shift: allocation.shift,
                  plannedTime: `${allocation.plannedTime} min`,
                  operator: allocation.operator,
                  actualEndDate: allocation.actualEndDate || allocation.endDate,
                  dailyPlannedQty: dailyPlannedQty,
                  shiftTotalTime: allocation.shiftTotalTime,
                  perMachinetotalTime: allocation.perMachinetotalTime,
                  isProcessCompleted: allocation.isProcessCompleted || false,
                  warehouseQuantity: allocation.warehouseQuantity || 0,
                  partsCodeId: item.partsCodeId || null,
                };
              }),
            };
          });
          setSections(formattedSections);
        }

        if (onUpdateAllocaitonStatus) {
          onUpdateAllocaitonStatus();
        }
      }
    } catch (error) {
      toast.error("Failed to complete process.");
      console.error("Error completing process:", error);
    } finally {
      setCompletingprocess(false);
    }
  };

  // Helper to get the part code (Itemcode) for the selected part
  const getSelectedPartCode = () => {
    // Try to get from selectedSection, fallback to partManufacturingVariables
    return (
      selectedSection?.data?.[0]?.machineId ||
      selectedSection?.data?.[0]?.partCode ||
      null
    );
  };

  return (
    <div style={{ width: "100%" }}>
      <Container fluid className="mt-4">
        {loading ? (
          <div className="text-center">
            <Spinner color="primary" />
            <p>Loading allocations...</p>
          </div>
        ) : error ? (
          <Alert color="danger">{error}</Alert>
        ) : sections.length === 0 ? (
          <div className="text-center">
            <Alert color="warning">No allocations available.</Alert>
          </div>
        ) : (
          sections.map((section, index) => (
            <div
              className="shadow-lg p-2"
              key={index}
              style={{ marginBottom: "30px" }}
            >
              <div className="table-responsive">
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
                    <tr
                      key={index}
                      style={{
                        borderBottom: "2px solid #e2e8f0",
                        backgroundColor:
                          index % 2 === 0 ? "#ffffff" : "#f8fafc",
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
                                {section.title}
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
                                style={{ fontWeight: 600, color: "#334155" }}
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
                                  {section.data[0]?.plannedQty || 0}
                                </span>
                                <span style={{ color: "#64748b" }}>
                                  planned
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "1.25rem" }}>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr",
                            gap: "1.25rem",
                            padding: "0.5rem 0",
                            "@media (min-width: 992px)": {
                              // Adjust breakpoint as needed
                              gridTemplateColumns:
                                "repeat(auto-fill, minmax(300px, 1fr))",
                            },
                          }}
                        >
                          {section.data.map((row, rowIndex) => (
                            <div
                              key={rowIndex}
                              style={{
                                width: "60rem",
                              }}
                            >
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns:
                                    "1fr 3px 1fr 3px 1fr 3px 1fr",
                                  gap: "1rem",
                                }}
                              >
                                {/* First Column */}
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "1rem",
                                  }}
                                >
                                  {/* Planned Quantity */}
                                  <div
                                    style={{
                                      backgroundColor: "#FAFFFF",
                                      borderRadius: "8px",
                                      padding: "1.5rem",
                                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
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
                                        marginBottom: "0.5rem",
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
                                      Planned Quantity
                                    </label>
                                    <div
                                      style={{
                                        fontSize: "0.875rem",
                                        padding: "0.5rem",
                                        backgroundColor: "#f8fafc",
                                        borderRadius: "6px",
                                      }}
                                    >
                                      {row.plannedQty}
                                    </div>
                                  </div>

                                  {/* Dates */}
                                  <div
                                    style={{
                                      backgroundColor: "#FAFFFF",
                                      borderRadius: "8px",
                                      padding: "1.5rem",
                                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
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
                                        marginBottom: "0.5rem",
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
                                      Dates
                                    </label>
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "0.5rem",
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                        }}
                                      >
                                        <span
                                          style={{
                                            fontSize: "0.8rem",
                                            color: "#64748b",
                                          }}
                                        >
                                          Start:
                                        </span>
                                        <span
                                          style={{
                                            fontWeight: 500,
                                            fontSize: "0.875rem",
                                          }}
                                        >
                                          {moment(row.startDate).format(
                                            "DD MMM YYYY"
                                          )}
                                        </span>
                                      </div>
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                        }}
                                      >
                                        <span
                                          style={{
                                            fontSize: "0.8rem",
                                            color: "#64748b",
                                          }}
                                        >
                                          End:
                                        </span>
                                        <span
                                          style={{
                                            fontWeight: 500,
                                            fontSize: "0.875rem",
                                          }}
                                        >
                                          {moment(row.endDate).format(
                                            "DD MMM YYYY"
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* First Vertical Divider - Made bolder */}
                                <div
                                  style={{
                                    backgroundColor: "#cbd5e1",
                                    width: "3px",
                                    borderRadius: "3px",
                                  }}
                                />

                                {/* Second Column */}
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "1rem",
                                  }}
                                >
                                  {/* Machine */}
                                  <div
                                    style={{
                                      backgroundColor: "#FAFFFF",
                                      borderRadius: "8px",
                                      padding: "1.5rem",
                                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
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
                                        marginBottom: "0.5rem",
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
                                    <div
                                      style={{
                                        fontSize: "0.875rem",
                                        padding: "0.5rem",
                                        backgroundColor: "#f8fafc",
                                        borderRadius: "6px",
                                      }}
                                    >
                                      {row.machineId}
                                    </div>
                                  </div>

                                  {/* Shift */}
                                  <div
                                    style={{
                                      backgroundColor: "#FAFFFF",
                                      borderRadius: "8px",
                                      padding: "1.5rem",
                                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
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
                                        marginBottom: "0.5rem",
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
                                        <FiClock size={16} color="#f59e0b" />
                                      </div>
                                      Shift
                                    </label>
                                    <div
                                      style={{
                                        fontSize: "0.875rem",
                                        padding: "0.5rem",
                                        backgroundColor: "#f8fafc",
                                        borderRadius: "6px",
                                      }}
                                    >
                                      {row.shift}
                                    </div>
                                  </div>
                                </div>

                                {/* Second Vertical Divider - Made bolder */}
                                <div
                                  style={{
                                    backgroundColor: "#cbd5e1",
                                    width: "3px",
                                    borderRadius: "3px",
                                  }}
                                />

                                {/* Third Column */}
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "1rem",
                                  }}
                                >
                                  {/* Planned Time */}
                                  <div
                                    style={{
                                      backgroundColor: "#FAFFFF",
                                      borderRadius: "8px",
                                      padding: "1.5rem",
                                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
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
                                        marginBottom: "0.5rem",
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
                                      Planned Time
                                    </label>
                                    <div
                                      style={{
                                        fontSize: "0.875rem",
                                        padding: "0.5rem",
                                        backgroundColor: "#f8fafc",
                                        borderRadius: "6px",
                                      }}
                                    >
                                      {row.plannedTime}
                                    </div>
                                  </div>

                                  {/* Operator */}
                                  <div
                                    style={{
                                      backgroundColor: "#FAFFFF",
                                      borderRadius: "8px",
                                      padding: "1.5rem",
                                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
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
                                        marginBottom: "0.5rem",
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
                                    <div
                                      style={{
                                        fontSize: "0.875rem",
                                        padding: "0.5rem",
                                        backgroundColor: "f8fafc",
                                        borderRadius: "6px",
                                      }}
                                    >
                                      {row.operator}
                                    </div>
                                  </div>
                                </div>

                                {/* Third Vertical Divider - Made bolder */}
                                <div
                                  style={{
                                    backgroundColor: "#cbd5e1",
                                    width: "3px",
                                    borderRadius: "3px",
                                  }}
                                />

                                {/* Fourth Column */}
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "1rem",
                                  }}
                                >
                                  {/* Warehouse */}
                                  <div
                                    style={{
                                      backgroundColor: "#FAFFFF",
                                      borderRadius: "8px",
                                      padding: "1.5rem",
                                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
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
                                        marginBottom: "0.5rem",
                                      }}
                                    >
                                      <div
                                        style={{
                                          width: "28px",
                                          height: "28px",
                                          borderRadius: "6px",
                                          backgroundColor: "#4f46e510",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}
                                      >
                                        <FaWarehouse
                                          size={16}
                                          color="#4f46e5"
                                        />
                                      </div>
                                      Warehouse
                                    </label>
                                    <div
                                      style={{
                                        fontSize: "0.875rem",
                                        padding: "0.5rem",
                                        backgroundColor: "#f8fafc",
                                        borderRadius: "6px",
                                      }}
                                    >
                                      {`${row.wareHouse} `}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Action Button - Right aligned with normal width */}
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                  marginTop: "1.5rem",
                                }}
                              >
                                {section.isSpecialDay ? (
                                  <Button
                                    color={
                                      row.isProcessCompleted
                                        ? "secondary"
                                        : "success"
                                    }
                                    onClick={() => {
                                      if (!row.isProcessCompleted) {
                                        setSelectedSection({
                                          ...section,
                                          data: [row],
                                        });
                                        setCompleteProcess(true);
                                      }
                                    }}
                                    disabled={row.isProcessCompleted}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: "0.5rem",
                                      borderRadius: "6px",
                                      padding: "0.5rem 1rem",
                                      fontSize: "0.875rem",
                                      fontWeight: 500,
                                      width: "auto",
                                    }}
                                  >
                                    {row.isProcessCompleted ? (
                                      <>
                                        <FiCheckCircle size={16} />
                                        Completed
                                      </>
                                    ) : (
                                      <>
                                        <FiCheck size={16} />
                                        Complete Process
                                      </>
                                    )}
                                  </Button>
                                ) : (
                                  <Button
                                    color="primary"
                                    onClick={() => openModal(section, row)}
                                    disabled={
                                      !hasRemainingQuantity(section, row)
                                    }
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: "0.5rem",
                                      borderRadius: "6px",
                                      padding: "0.5rem 1rem",
                                      fontSize: "0.875rem",
                                      fontWeight: 500,
                                      maxWidth: "150px",
                                    }}
                                  >
                                    <FiEdit size={16} />
                                    Update Input
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </div>
          ))
        )}
        <div className="d-flex justify-content-end">
          <CardBody className="d-flex justify-content-end align-items-center">
            {userRole === "admin" && (
              <>
                <Button
                  color="success"
                  onClick={() => setCompleteConfirmationModal(true)}
                  disabled={sections.length === 0 || !isAllocationCompleted()}
                  style={{ marginRight: "10px", maxWidth: "30%" }}
                >
                  Complete Allocation
                </Button>
                <Button
                  color="danger"
                  onClick={() => setDeleteConfirmationModal(true)}
                  disabled={sections.length === 0}
                  style={{ maxWidth: "30%" }}
                >
                  Cancel Allocation
                </Button>
              </>
            )}
          </CardBody>

          {/* <CardBody className="d-flex justify-content-start align-items-center">
            {userRole === "admin" && (
              <Button color="success">Complete Allocation</Button>
            )}
          </CardBody> */}
        </div>
      </Container>

      {/* Modal for Updating Daily Task */}
      <Modal
        isOpen={dailyTaskModal}
        toggle={closeDailyTaskModal}
        style={{
          maxWidth: "80vw",
          width: "100%",
          margin: "auto",
        }}
      >
        <ModalHeader toggle={() => setDailyTaskModal(false)}>
          Update Input
        </ModalHeader>

        <Container
          style={{
            backgroundColor: "#f5f5f5",
            padding: "20px",
            borderRadius: "8px",
            marginTop: "10px",
          }}
        >
          <h4
            style={{
              fontWeight: "600",
              marginBottom: "20px",
              fontSize: "18px",
              color: "#2d3748",
            }}
          >
            Machine Information
          </h4>

          <Row>
            <Col md={6}>
              <h5
                style={{
                  fontWeight: "500",
                  fontSize: "15px",
                  color: "#4a5568",
                  marginBottom: "8px",
                }}
              >
                Process
              </h5>
              <div style={{ fontSize: "14px" }}>
                {selectedSection?.title || "N/A"} - (Machine ID:{" "}
                {selectedSection?.data?.[0]?.machineId || "N/A"})
              </div>
            </Col>

            <Col md={6}>
              <h5
                style={{
                  fontWeight: "500",
                  fontSize: "15px",
                  color: "#4a5568",
                  marginBottom: "8px",
                }}
              >
                Operator
              </h5>
              <p style={{ fontSize: "14px", marginBottom: 0 }}>
                {selectedSection?.data?.[0]?.operator || "N/A"}
              </p>
            </Col>
          </Row>
        </Container>

        {selectedSection?.data?.[0] && (
          <Container
            style={{
              backgroundColor: "#eff6ff",
              padding: "20px",
              borderRadius: "8px",
              marginTop: "15px",
            }}
          >
            <h4
              style={{
                fontWeight: "600",
                marginBottom: "20px",
                fontSize: "18px",
                color: "#2d3748",
              }}
            >
              Production Plan
            </h4>

            <Row className="mb-3">
              <Col md={3}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <h5
                    style={{
                      fontWeight: "500",
                      fontSize: "15px",
                      color: "#4a5568",
                      marginBottom: "8px",
                    }}
                  >
                    Total Quantity
                  </h5>
                  <span style={{ fontSize: "14px" }}>
                    {selectedSection?.data?.[0]?.plannedQty || "N/A"}
                  </span>
                </div>
              </Col>
              <Col md={3}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <h5
                    style={{
                      fontWeight: "500",
                      fontSize: "15px",
                      color: "#4a5568",
                      marginBottom: "8px",
                    }}
                  >
                    Daily Planned Quantity
                  </h5>
                  <span style={{ fontSize: "14px" }}>
                    {selectedSection?.data?.[0]?.dailyPlannedQty || "N/A"}
                  </span>
                </div>
              </Col>
              <Col md={3}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <h5
                    style={{
                      fontWeight: "500",
                      fontSize: "15px",
                      color: "#4a5568",
                      marginBottom: "8px",
                    }}
                  >
                    Remaining Quantity
                  </h5>
                  <span style={{ fontSize: "14px" }}>
                    {calculateRemainingQuantity()}
                  </span>
                </div>
              </Col>
              <Col md={3}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <h5
                    style={{
                      fontWeight: "500",
                      fontSize: "15px",
                      color: "#4a5568",
                      marginBottom: "8px",
                    }}
                  >
                    Start Date
                  </h5>
                  <span style={{ fontSize: "14px" }}>
                    {selectedSection?.data?.[0]?.startDate
                      ? moment(selectedSection.data[0].startDate).format(
                          "DD MMM YYYY"
                        )
                      : "N/A"}
                  </span>
                </div>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={3}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <h5
                    style={{
                      fontWeight: "500",
                      fontSize: "15px",
                      color: "#4a5568",
                      marginBottom: "8px",
                    }}
                  >
                    Plan End Date
                  </h5>
                  <span style={{ fontSize: "14px" }}>
                    {selectedSection?.data?.[0]?.endDate
                      ? moment(selectedSection.data[0].endDate).format(
                          "DD MMM YYYY"
                        )
                      : "N/A"}
                  </span>
                </div>
              </Col>
              <Col md={3}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <h5
                    style={{
                      fontWeight: "500",
                      fontSize: "15px",
                      color: "#4a5568",
                      marginBottom: "8px",
                    }}
                  >
                    Actual End Date
                  </h5>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: (() => {
                        if (!actulEndDateData.actualEndDate) return "#2d3748";

                        const actualEndDate = new Date(
                          actulEndDateData.actualEndDate
                        );
                        const plannedEndDate = new Date(
                          selectedSection?.data?.[0]?.endDate
                        );

                        if (
                          actualEndDate.getTime() === plannedEndDate.getTime()
                        ) {
                          return "#2d3748";
                        } else if (actualEndDate > plannedEndDate) {
                          return "#e53e3e"; // Red for delayed
                        } else {
                          return "#38a169"; // Green for completed early
                        }
                      })(),
                    }}
                  >
                    {actulEndDateData.actualEndDate
                      ? moment(actulEndDateData.actualEndDate).format(
                          "DD MMM YYYY"
                        )
                      : moment(selectedSection?.data?.[0]?.endDate).format(
                          "DD MMM YYYY"
                        )}
                  </span>
                </div>
              </Col>
              <Col md={3}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <h5
                    style={{
                      fontWeight: "500",
                      fontSize: "15px",
                      color: "#4a5568",
                      marginBottom: "8px",
                    }}
                  >
                    Tentative Days
                  </h5>
                  <span style={{ fontSize: "14px" }}>
                    {actulEndDateData.actualEndDate ? (
                      <span
                        className={
                          getWorkingDaysDifference(
                            new Date(selectedSection?.data?.[0]?.endDate),
                            new Date(actulEndDateData.actualEndDate),
                            highlightDates
                          ) < 0
                            ? "text-success" // Red for negative numbers
                            : "text-danger" // Green for positive numbers
                        }
                      >
                        {getWorkingDaysDifference(
                          new Date(selectedSection?.data?.[0]?.endDate),
                          new Date(actulEndDateData.actualEndDate),
                          highlightDates
                        )}
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </span>
                </div>
              </Col>
              <Col md={3}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <h5
                    style={{
                      fontWeight: "500",
                      fontSize: "15px",
                      color: "#4a5568",
                      marginBottom: "8px",
                    }}
                  >
                    Total Produced
                  </h5>
                  <span style={{ fontSize: "14px" }}>
                    {existingDailyTracking.reduce(
                      (sum, task) => sum + task.produced,
                      0
                    )}{" "}
                    / {selectedSection?.data?.[0]?.plannedQty || "N/A"}
                  </span>
                </div>
              </Col>
            </Row>
          </Container>
        )}

        <Container fluid className="mt-2 px-0">
          <Row className="mx-0">
            <Col md={6} className="px-1">
              <Container
                style={{
                  backgroundColor: "#fefce8",
                  padding: "20px",
                  borderRadius: "8px",
                  marginTop: "10px",
                  height: "100%",
                  width: "95%",
                }}
              >
                <h4
                  style={{
                    fontWeight: "600",
                    marginBottom: "20px",
                    fontSize: "18px",
                    color: "#2d3748",
                  }}
                >
                  From Warehouse
                  <Button
                    color="link"
                    size="sm"
                    onClick={refreshWarehouseData}
                    style={{
                      float: "right",
                      padding: "0",
                      margin: "0",
                      color: "#4f46e5",
                      textDecoration: "none"
                    }}
                  >
                    <i className="ri-refresh-line"></i>
                  </Button>
                </h4>

                <Row>
                  <Col md={6}>
                    <h5
                      style={{
                        fontWeight: "500",
                        fontSize: "15px",
                        color: "#4a5568",
                        marginBottom: "8px",
                      }}
                    >
                      Warehouse Name
                    </h5>
                    <div style={{ fontSize: "14px" }}>
                      {selectedSection?.data[0]?.wareHouse || "N/A"}
                      {/* {selectedSection?.data[0]?.warehouseId || "N/A"} */}
                    </div>
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col md={6}>
                    <h5
                      style={{
                        fontWeight: "500",
                        fontSize: "15px",
                        color: "#4a5568",
                        marginBottom: "8px",
                      }}
                    >
                      Total Quantity in Warehouse
                    </h5>
                    <p style={{ fontSize: "14px", marginBottom: 0 }}>
                       {warehouseData?.quantity?.[0] ?? "N/A"}
                    </p>
                  </Col>
                </Row>
              </Container>
            </Col>

            <Col md={6} className="px-2">
              <Container
                style={{
                  backgroundColor: "#f0fdf4",
                  padding: "20px",
                  borderRadius: "8px",
                  marginTop: "10px",
                  height: "100%",
                  width: "95%",
                }}
              >
                <h4
                  style={{
                    fontWeight: "600",
                    marginBottom: "20px",
                    fontSize: "18px",
                    color: "#2d3748",
                  }}
                >
                  To Warehouse
                </h4>

                <Row>
                  <Col md={6}>
                    <h5
                      style={{
                        fontWeight: "500",
                        fontSize: "15px",
                        color: "#4a5568",
                        marginBottom: "8px",
                      }}
                    >
                      Warehouse Name
                    </h5>
                    <div style={{ fontSize: "14px" }}>{"WareHouse-Floor2"}</div>
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col md={6}>
                    <h5
                      style={{
                        fontWeight: "500",
                        fontSize: "15px",
                        color: "#4a5568",
                        marginBottom: "8px",
                      }}
                    >
                      Total Quantity in Warehouse
                    </h5>
                    <p style={{ fontSize: "14px", marginBottom: 0 }}>200</p>
                  </Col>
                </Row>
              </Container>
            </Col>
          </Row>
        </Container>
        <ModalBody className="mt-3 p-1">
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 style={{ margin: 0 }}>Previous Tracking Data</h5>
              {selectedSection && (
                <Button
                  color="primary"
                  onClick={openAddRowModal}
                  disabled={
                    calculateRemainingQuantity() <= 0 || hasTrackingForToday()
                  }
                  style={{ maxWidth: "30%" }}
                >
                  Add Daily Input
                </Button>
              )}
            </div>

            <div className="table-responsive">
              <table className="table table-striped vertical-lines horizontals-lines">
                <thead style={{ backgroundColor: "#f3f4f6" }}>
                  <tr>
                    <th>Date</th>
                    <th>Planned</th>
                    <th>Produced</th>
                    <th>Warehouse Total</th>
                    <th>Warehouse Remaining</th>
                    <th>Status</th>
                    <th>Operator</th>
                  </tr>
                </thead>
                <tbody>
                  {!existingDailyTracking.length ? (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No daily tracking data available
                      </td>
                    </tr>
                  ) : (
                    existingDailyTracking.map((task, index) => (
                      <tr key={index}>
                        <td>{moment(task.date).format("DD MMM YYYY")}</td>
                        <td>{task.planned}</td>
                        <td>{task.produced}</td>
                        <td>{task.wareHouseTotalQty || "N/A"}</td>
                        <td>{task.wareHouseremainingQty || "N/A"}</td>
                        <td>
                          {task.dailyStatus === "On Track" ? (
                            <span
                              className="badge bg-primary text-white"
                              style={{ fontSize: "13px" }}
                            >
                              On Track
                            </span>
                          ) : task.dailyStatus === "Delayed" ? (
                            <span
                              className="badge bg-danger text-white"
                              style={{ fontSize: "13px" }}
                            >
                              Delayed
                            </span>
                          ) : task.dailyStatus === "Ahead" ? (
                            <span
                              className="badge bg-success text-white"
                              style={{ fontSize: "13px" }}
                            >
                              Ahead
                            </span>
                          ) : task.dailyStatus === "Not Started" ||
                            task.produced == null ||
                            task.produced === 0 ? (
                            <span
                              className="badge bg-secondary text-white"
                              style={{ fontSize: "13px" }}
                            >
                              Not Started
                            </span>
                          ) : null}
                        </td>
                        <td>{task.operator}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </ModalBody>
      </Modal>

      {/* Modal for Delete Confirmation */}
      <Modal
        isOpen={deleteConfirmationModal}
        toggle={() => setDeleteConfirmationModal(false)}
      >
        <ModalHeader toggle={() => setDeleteConfirmationModal(false)}>
          Confirm Deletion
        </ModalHeader>
        <ModalBody>
          Are you sure you want to delete this allocation? This action cannot be
          undone.
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={handleCancelAllocation}>
            Delete
          </Button>
          <Button
            color="secondary"
            onClick={() => setDeleteConfirmationModal(false)}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* daily trackin modal */}
      <Modal
        isOpen={addRowModal}
        toggle={closeAddRowModal}
        style={{
          maxWidth: "80vw",
          width: "100%",
          margin: "auto",
        }}
      >
        <ModalHeader toggle={closeAddRowModal}>Add Input</ModalHeader>
        <ModalBody>
          <form>
            <Container fluid className="mt-2 px-0">
              <Row className="mx-0">
                {/* Date Picker Column */}
                <Col md={6} className="px-2">
                  <div
                    className="form-group"
                    style={{
                      backgroundColor: "#fff",
                      padding: "10px",
                      borderRadius: "8px",
                      marginTop: "10px",
                      height: "75%",
                      width: "100%",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <label
                      style={{
                        fontWeight: "600",
                        marginBottom: "20px",
                        fontSize: "18px",
                        color: "#2d3748",
                        display: "block",
                      }}
                    >
                      Date
                    </label>
                    {/* Removed width:50px wrapper */}
                    <DatePicker
                      selected={
                        dailyTracking[0].date
                          ? new Date(dailyTracking[0].date)
                          : ""
                      }
                      onChange={(date) =>
                        handleDailyTrackingChange(0, "date", date)
                      }
                      className="form-control"
                      dateFormat="dd-MM-yyyy"
                      placeholderText="DD-MM-YYYY"
                      minDate={new Date()}
                      maxDate={new Date()}
                      filterDate={(date) => {
                        const isHoliday = highlightDates.some(
                          (d) => d.toDateString() === date.toDateString()
                        );
                        const isSunday = date.getDay() === 0;
                        const isToday =
                          new Date().toDateString() === date.toDateString();
                        return !isHoliday && !isSunday && isToday;
                      }}
                      dayClassName={(date) => {
                        const isHighlighted = highlightDates.some(
                          (d) => d.toDateString() === date.toDateString()
                        );
                        const isSunday = date.getDay() === 0;
                        if (isHighlighted || isSunday) {
                          return "highlighted-date";
                        }
                        return undefined;
                      }}
                    />
                  </div>
                </Col>

                {/* Process Information Column */}
                <Col md={6} className="px-2">
                  <div
                    style={{
                      backgroundColor: "#fff",
                      padding: "20px",
                      borderRadius: "8px",
                      marginTop: "10px",
                      height: "75%",
                      width: "100%",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <h4
                      style={{
                        fontWeight: "600",
                        marginBottom: "20px",
                        fontSize: "18px",
                        color: "#2d3748",
                      }}
                    >
                      Process
                    </h4>
                    <div>
                      <div style={{ fontSize: "14px" }}>
                        {selectedSection?.title || "N/A"} - (Machine ID:{" "}
                        {selectedSection?.data?.[0]?.machineId || "N/A"})
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Container>

            <div
              className="form-row mt-1"
              style={{ display: "flex", gap: "20px" }}
            >
              {/* Left side - Produced Quantity */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    border: "2px solid #d6e9ff",
                    backgroundColor: "#eff6ff",
                    padding: "16px",
                    borderRadius: "5px",
                    height: "90%",
                  }}
                >
                  <p
                    style={{
                      marginBottom: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <IoIosCheckmarkCircleOutline size={20} color="#4154e0" />
                    <span
                      style={{
                        fontWeight: "800",
                        fontSize: "18px",
                        color: "#4154e0",
                      }}
                    >
                      Produced Quantity
                    </span>
                  </p>
                  <input
                    type="number"
                    className="form-control"
                    value={
                      dailyTracking.length > 0 ? dailyTracking[0].produced : ""
                    }
                    placeholder="Enter Produced Quantity"
                    max={Math.min(calculateRemainingQuantity(), warehouseData?.quantity?.[0] || 0)}
                    onChange={(e) =>
                      handleDailyTrackingChange(0, "produced", e.target.value)
                    }
                    onWheel={(e) => e.target.blur()}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                        e.preventDefault();
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "2px solid #bfdbfe",
                      borderRadius: "4px",
                      backgroundColor: "#ffffff",
                      marginBottom: "12px",
                      boxSizing: "border-box",
                      fontWeight: "bold",
                      fontSize: "16px",
                      color: "#1e3a8a",
                    }}
                  />
                  <p
                    style={{
                      margin: "0",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "#64748b",
                      fontSize: "14px",
                    }}
                  >
                    <CiCircleInfo size={18} color="#64748b" />
                    Max allowed: {Math.min(calculateRemainingQuantity(), warehouseData?.quantity?.[0] || 0)} units
                  </p>
                </div>
              </div>

              {/* Right side - Status and Operator */}
              <div
                style={{
                  width: "50%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1px",
                  height: "60%",
                }}
              >
                {/* Status */}
                {/* {dailyTracking.length > 0 &&
                  dailyTracking[0].produced !== undefined &&
                  dailyTracking[0].planned !== undefined && (
                    <div className="form-group">
                      <label>Status</label>
                      <div
                        className="form-control"
                        style={{
                          backgroundColor: "#f8f9fa",
                          border: "1px solid #ced4da",
                          padding: "0.375rem 0.75rem",
                          borderRadius: "0.25rem",
                          color: "#495057",
                          height: "42px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {(() => {
                          const produced =
                            Number(dailyTracking[0].produced) || 0;
                          const planned = Number(dailyTracking[0].planned) || 0;

                          if (produced === 0) {
                            return (
                              <span className="text-danger">
                                Please Enter Produced Quantity
                              </span>
                            );
                          }

                          if (Number(produced) === Number(planned)) {
                            return (
                              <span className="text-primary">On Track</span>
                            );
                          } else if (produced > planned) {
                            return <span className="text-success">Ahead</span>;
                          } else if (produced < planned) {
                            return <span className="text-danger">Delayed</span>;
                          }

                          return null;
                        })()}
                      </div>
                    </div>
                  )} */}
                <Row>
                  <Col xs={12} sm={12} md={6} lg={12}>
                    {/* Status */}
                    {dailyTracking.length > 0 &&
                      dailyTracking[0].produced !== undefined &&
                      dailyTracking[0].planned !== undefined && (
                        <div className="form-group">
                          <label>Status</label>
                          <div
                            className="form-control"
                            style={{
                              backgroundColor: "#f8f9fa",
                              border: "1px solid #ced4da",
                              padding: "0.375rem 0.75rem",
                              borderRadius: "0.25rem",
                              color: "#495057",
                              height: "42px",
                              display: "flex",
                              alignItems: "center",
                              whiteSpace: "nowrap", // prevent text wrap
                              overflow: "hidden", // hide overflow
                              textOverflow: "ellipsis", // add ... for long text
                            }}
                          >
                            {(() => {
                              const produced =
                                Number(dailyTracking[0].produced) || 0;
                              const planned =
                                Number(dailyTracking[0].planned) || 0;

                              if (produced === 0) {
                                return (
                                  <span className="text-danger">
                                    Please Enter Produced Quantity
                                  </span>
                                );
                              }

                              if (produced === planned) {
                                return (
                                  <span className="text-primary">On Track</span>
                                );
                              } else if (produced > planned) {
                                return (
                                  <span className="text-success">Ahead</span>
                                );
                              } else {
                                return (
                                  <span className="text-danger">Delayed</span>
                                );
                              }
                            })()}
                          </div>
                        </div>
                      )}
                  </Col>
                </Row>

                {/* Operator */}
                <div className="form-group">
                  <label>Operator</label>
                  <input
                    type="text"
                    className="form-control"
                    value={
                      dailyTracking[0]?.operator ||
                      selectedSection?.data[0]?.operator ||
                      ""
                    }
                    readOnly
                    style={{ height: "42px" }}
                  />
                </div>
              </div>
            </div>

            {selectedSection?.data?.[0] && (
              <Container
                style={{
                  backgroundColor: "#eff6ff",
                  padding: "20px",
                  borderRadius: "8px",
                  marginTop: "15px",
                }}
              >
                <h4
                  style={{
                    fontWeight: "600",
                    marginBottom: "20px",
                    fontSize: "18px",
                    color: "#2d3748",
                  }}
                >
                  Production Plan
                </h4>

                <Row className="mb-3">
                  <Col md={3}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <h5
                        style={{
                          fontWeight: "500",
                          fontSize: "15px",
                          color: "#4a5568",
                          marginBottom: "8px",
                        }}
                      >
                        Total Quantity
                      </h5>
                      <span style={{ fontSize: "14px" }}>
                        {selectedSection?.data?.[0]?.plannedQty || "N/A"}
                      </span>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <h5
                        style={{
                          fontWeight: "500",
                          fontSize: "15px",
                          color: "#4a5568",
                          marginBottom: "8px",
                        }}
                      >
                        Daily Planned Quantity
                      </h5>
                      <span style={{ fontSize: "14px" }}>
                        {selectedSection?.data?.[0]?.dailyPlannedQty || "N/A"}
                      </span>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <h5
                        style={{
                          fontWeight: "500",
                          fontSize: "15px",
                          color: "#4a5568",
                          marginBottom: "8px",
                        }}
                      >
                        Remaining Quantity
                      </h5>
                      <span style={{ fontSize: "14px" }}>
                        {calculateRemainingQuantity()}
                      </span>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <h5
                        style={{
                          fontWeight: "500",
                          fontSize: "15px",
                          color: "#4a5568",
                          marginBottom: "8px",
                        }}
                      >
                        Start Date
                      </h5>
                      <span style={{ fontSize: "14px" }}>
                        {selectedSection?.data?.[0]?.startDate
                          ? moment(selectedSection.data[0].startDate).format(
                              "DD MMM YYYY"
                            )
                          : "N/A"}
                      </span>
                    </div>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={3}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <h5
                        style={{
                          fontWeight: "500",
                          fontSize: "15px",
                          color: "#4a5568",
                          marginBottom: "8px",
                        }}
                      >
                        Plan End Date
                      </h5>
                      <span style={{ fontSize: "14px" }}>
                        {selectedSection?.data?.[0]?.endDate
                          ? moment(selectedSection.data[0].endDate).format(
                              "DD MMM YYYY"
                            )
                          : "N/A"}
                      </span>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <h5
                        style={{
                          fontWeight: "500",
                          fontSize: "15px",
                          color: "#4a5568",
                          marginBottom: "8px",
                        }}
                      >
                        Actual End Date
                      </h5>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "bold",
                          color: (() => {
                            if (!actulEndDateData.actualEndDate)
                              return "#2d3748";

                            const actualEndDate = new Date(
                              actulEndDateData.actualEndDate
                            );
                            const plannedEndDate = new Date(
                              selectedSection?.data?.[0]?.endDate
                            );

                            if (
                              actualEndDate.getTime() ===
                              plannedEndDate.getTime()
                            ) {
                              return "#2d3748";
                            } else if (actualEndDate > plannedEndDate) {
                              return "#e53e3e"; // Red for delayed
                            } else {
                              return "#38a169"; // Green for completed early
                            }
                          })(),
                        }}
                      >
                        {actulEndDateData.actualEndDate
                          ? moment(actulEndDateData.actualEndDate).format(
                              "DD MMM YYYY"
                            )
                          : moment(selectedSection?.data?.[0]?.endDate).format(
                              "DD MMM YYYY"
                            )}
                      </span>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <h5
                        style={{
                          fontWeight: "500",
                          fontSize: "15px",
                          color: "#4a5568",
                          marginBottom: "8px",
                        }}
                      >
                        Tentative Days
                      </h5>
                      <span style={{ fontSize: "14px" }}>
                        {actulEndDateData.actualEndDate ? (
                          <span
                            className={
                              getWorkingDaysDifference(
                                new Date(selectedSection?.data?.[0]?.endDate),
                                new Date(actulEndDateData.actualEndDate),
                                highlightDates
                              ) < 0
                                ? "text-danger" // Red for negative numbers
                                : "text-success" // Green for positive numbers
                            }
                          >
                            {getWorkingDaysDifference(
                              new Date(selectedSection?.data?.[0]?.endDate),
                              new Date(actulEndDateData.actualEndDate),
                              highlightDates
                            )}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </span>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <h5
                        style={{
                          fontWeight: "500",
                          fontSize: "15px",
                          color: "#4a5568",
                          marginBottom: "8px",
                        }}
                      >
                        Total Produced
                      </h5>
                      <span style={{ fontSize: "14px" }}>
                        {existingDailyTracking.reduce(
                          (sum, task) => sum + task.produced,
                          0
                        )}{" "}
                        / {selectedSection?.data?.[0]?.plannedQty || "N/A"}
                      </span>
                    </div>
                  </Col>
                </Row>
              </Container>
            )}

            <Container fluid className="mt-2 px-0">
              <Row className="mx-0">
                <Col md={6} className="px-2">
                  <Container
                    style={{
                      backgroundColor: "#fefce8",
                      padding: "20px",
                      borderRadius: "8px",
                      marginTop: "10px",
                      height: "100%",
                      width: "100%",
                      border: "2px solid #facc15",
                    }}
                  >
                    <h4
                      style={{
                        fontWeight: "600",
                        marginBottom: "20px",
                        fontSize: "18px",
                        color: "#2d3748",
                      }}
                    >
                      From Warehouse
                      <Button
                        color="link"
                        size="sm"
                        onClick={refreshWarehouseData}
                        style={{
                          float: "right",
                          padding: "0",
                          margin: "0",
                          color: "#4f46e5",
                          textDecoration: "none"
                        }}
                      >
                        <i className="ri-refresh-line"></i>
                      </Button>
                    </h4>

                    <Row>
                      <Col md={6}>
                        <h5
                          style={{
                            fontWeight: "500",
                            fontSize: "15px",
                            color: "#4a5568",
                            marginBottom: "8px",
                          }}
                        >
                          Warehouse Name
                        </h5>
                        <div style={{ fontSize: "14px" }}>
                          {selectedSection?.data[0]?.wareHouse || "N/A"}
                        </div>
                      </Col>
                    </Row>
                    <Row className="mt-4">
                      <Col md={12}>
                        <div>
                          <h5
                            style={{
                              fontWeight: "500",
                              fontSize: "15px",
                              color: "#4a5568",
                              marginBottom: "8px",
                            }}
                          >
                            Total Quantity in Warehouse
                          </h5>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <p
                              style={{
                                fontSize: "14px",
                                marginBottom: 0,
                                fontWeight: "bold",
                                color: "red",
                              }}
                            >
                              {warehouseData?.quantity?.[0] ?? "N/A"}
                            </p>
                            {dailyTracking[0]?.produced > 0 && (
                              <FaArrowDown color="red" />
                            )}
                          </div>
                          {dailyTracking[0]?.produced > 0 && (
                            <div
                              style={{ textAlign: "left", marginTop: "5px" }}
                            >
                              <span style={{ color: "red", fontSize: "13px" }}>
                                Will be reduced by {dailyTracking[0]?.produced} units
                              </span>
                              <br />
                              <span style={{ color: "red", fontSize: "12px", fontWeight: "bold" }}>
                                New quantity: {Math.max(0, (warehouseData?.quantity?.[0] ?? 0) - dailyTracking[0]?.produced)}
                              </span>
                            </div>
                          )}
                        </div>
                      </Col>
                    </Row>
                    
                    {/* Warehouse Quantity Warning */}
                    {(() => {
                      const warning = getWarehouseQuantityWarning();
                      if (warning) {
                        return (
                          <Row className="mt-3">
                            <Col md={12}>
                              <div style={{
                                backgroundColor: warning.type === "error" ? "#f8d7da" : "#fff3cd",
                                border: `1px solid ${warning.type === "error" ? "#f5c6cb" : "#ffeaa7"}`,
                                borderRadius: "6px",
                                padding: "10px",
                                color: warning.type === "error" ? "#721c24" : "#856404"
                              }}>
                                <i className={`ri-${warning.type === "error" ? "error-warning" : "alert"}-line me-2`}></i>
                                {warning.message}
                              </div>
                            </Col>
                          </Row>
                        );
                      }
                      return null;
                    })()}
                  </Container>
                </Col>

                <Col md={6} className="px-2">
                  <Container
                    style={{
                      backgroundColor: "#f0fdf4",
                      padding: "20px",
                      borderRadius: "8px",
                      marginTop: "10px",
                      height: "100%",
                      width: "100%",
                      border: "2px solid #86efac",
                    }}
                  >
                    <h4
                      style={{
                        fontWeight: "600",
                        marginBottom: "20px",
                        fontSize: "18px",
                        color: "#2d3748",
                      }}
                    >
                      To Warehouse
                    </h4>

                    <Row>
                      <Col md={6}>
                        <h5
                          style={{
                            fontWeight: "500",
                            fontSize: "15px",
                            color: "#4a5568",
                            marginBottom: "8px",
                          }}
                        >
                          Warehouse Name
                        </h5>
                        <div style={{ fontSize: "14px" }}>
                          {"WareHouse-Floor2"}
                        </div>
                      </Col>
                    </Row>

                    <Row className="mt-4">
                      <Col md={12}>
                        <div>
                          <h5
                            style={{
                              fontWeight: "500",
                              fontSize: "15px",
                              color: "#4a5568",
                              marginBottom: "8px",
                            }}
                          >
                            Total Quantity in Warehouse
                          </h5>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <p
                              style={{
                                fontSize: "14px",
                                marginBottom: 0,
                                fontWeight: "bold",
                                color: "green",
                              }}
                            >
                              {200 + (warehouseChanges.toWarehouseChange || 0)}
                            </p>
                            {dailyTracking[0]?.produced > 0 && (
                              <FaArrowUp color="green" />
                            )}
                          </div>
                          {dailyTracking[0]?.produced > 0 && (
                            <div
                              style={{ textAlign: "left", marginTop: "5px" }}
                            >
                              <span
                                style={{ color: "green", fontSize: "13px" }}
                              >
                                Increased by {dailyTracking[0]?.produced} units
                              </span>
                            </div>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </Container>
                </Col>
              </Row>
            </Container>
          </form>
        </ModalBody>
        <ModalFooter>
          {/* Update Button */}
          <Button
            color="primary"
            onClick={() => setUpdateConfirmationModal(true)} // Changed to open confirmation modal
            disabled={
              isUpdating ||
              !dailyTracking[0]?.produced ||
              !dailyTracking[0]?.date
            }
          >
            {isUpdating ? "Updating..." : "Update"}
          </Button>
        </ModalFooter>
      </Modal>

      {/*// Add this modal to the existing modal section in the return statement*/}

      <Modal
        isOpen={completeConfirmationModal}
        toggle={() => setCompleteConfirmationModal(false)}
      >
        <ModalHeader toggle={() => setCompleteConfirmationModal(false)}>
          Confirm Completion
        </ModalHeader>
        <ModalBody>
          Are you sure you want to mark this allocation as completed? This
          action cannot be undone.
        </ModalBody>
        <ModalFooter>
          <Button
            color="success"
            onClick={handleCompleteAllocation}
            disabled={completingAllocation}
          >
            {completingAllocation ? "Completing..." : "Complete"}
          </Button>
          <Button
            color="secondary"
            onClick={() => setCompleteConfirmationModal(false)}
            disabled={completingAllocation}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Update the completion confirmation modal */}
      <Modal
        isOpen={completeProcess}
        toggle={() => setCompleteProcess(false)}
        key={`complete-process-modal-${selectedSection?.allocationId}-${selectedSection?.data[0]?.trackingId}`}
      >
        <ModalHeader toggle={() => setCompleteProcess(false)}>
          Confirm Process Completion
        </ModalHeader>
        <ModalBody>
          {selectedSection && (
            <>
              <p>Are you sure you want to mark this process as completed?</p>
              <div className="process-details">
                <p>
                  <strong>Process:</strong> {selectedSection.title}
                </p>
                <p>
                  <strong>Machine ID:</strong>{" "}
                  {selectedSection.data[0]?.machineId}
                </p>
                <p>
                  <strong>Start Date:</strong>{" "}
                  {moment(selectedSection.data[0]?.startDate).format(
                    "DD MMM YYYY"
                  )}
                </p>
                <p>
                  <strong>End Date:</strong>{" "}
                  {moment(selectedSection.data[0]?.endDate).format(
                    "DD MMM YYYY"
                  )}
                </p>
                {selectedSection.data[0]?.SpecialDayTotalMinutes && (
                  <p>
                    <strong>Special Day Duration:</strong>{" "}
                    {selectedSection.data[0].SpecialDayTotalMinutes} minutes
                  </p>
                )}
                {selectedSection.data[0]?.plannedQty && (
                  <p>
                    <strong>Planned Quantity:</strong>{" "}
                    {selectedSection.data[0].plannedQty}
                  </p>
                )}
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color="success"
            onClick={handleCompleteProcess}
            disabled={completingprocess}
          >
            {completingprocess ? "Completing..." : "Complete"}
          </Button>
          <Button
            color="secondary"
            onClick={() => setCompleteProcess(false)}
            disabled={completingprocess}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Update Confirmation Modal */}
      <Modal
        isOpen={updateConfirmationModal}
        toggle={() => setUpdateConfirmationModal(false)}
        size="lg"
      >
        <ModalHeader toggle={() => setUpdateConfirmationModal(false)}>
          Confirm Daily Input Update
        </ModalHeader>
        <ModalBody>
          <div style={{ marginBottom: "20px" }}>
            <h5
              style={{
                fontWeight: "600",
                marginBottom: "15px",
                color: "#2d3748",
              }}
            >
              Please confirm the following details before updating:
            </h5>

            <div className="confirmation-details">
              <Row className="mb-2">
                <Col md={3}>
                  <strong>Date:</strong>
                </Col>
                <Col md={9}>
                  {dailyTracking[0]?.date
                    ? moment(dailyTracking[0].date).format("DD MMM YYYY")
                    : "N/A"}
                </Col>
              </Row>

              <Row className="mb-2">
                <Col md={3}>
                  <strong>Produced:</strong>
                </Col>
                <Col md={9}>{dailyTracking[0]?.produced || "0"}</Col>
              </Row>

              <Row className="mb-2">
                <Col md={3}>
                  <strong>Status:</strong>
                </Col>
                <Col md={9}>
                  {(() => {
                    const produced = Number(dailyTracking[0]?.produced) || 0;
                    const planned = Number(dailyTracking[0]?.planned) || 0;

                    if (produced === 0) return "Not Started";
                    if (produced === planned) return "On Track";
                    if (produced > planned) return "Ahead";
                    if (produced < planned) return "Delayed";
                    return "N/A";
                  })()}
                </Col>
              </Row>

              <Row className="mb-2">
                <Col md={3}>
                  <strong>Operator:</strong>
                </Col>
                <Col md={9}>
                  {dailyTracking[0]?.operator ||
                    selectedSection?.data[0]?.operator ||
                    "N/A"}
                </Col>
              </Row>

              <Row className="mb-2">
                <Col md={3}>
                  <strong>From Warehouse:</strong>
                </Col>
                <Col md={9}>
                  {`${selectedSection?.data[0]?.wareHouse || "N/A"} - ${
                    selectedSection?.data[0]?.warehouseId || "N/A"
                  }`}{" "}
                  (Quantity:{" "}
                  {(() => {
                    const partsCodeId = selectedSection?.data?.[0]?.partsCodeId;
                    const warehouseId = selectedSection?.data?.[0]?.warehouseId;

                    if (!partsCodeId || !warehouseId) {
                      return "N/A";
                    }

                    const matchingQuantity = getMatchingWarehouseQuantity(
                      partsCodeId,
                      warehouseId
                    );
                    const baseQuantity =
                      matchingQuantity !== null ? matchingQuantity : 0;
                    const adjustedQuantity =
                      baseQuantity +
                      (warehouseChanges.fromWarehouseChange || 0);

                    return adjustedQuantity > 0 ? adjustedQuantity : "N/A";
                  })()}
                  )
                </Col>
              </Row>

              <Row className="mb-2">
                <Col md={3}>
                  <strong>To Warehouse:</strong>
                </Col>
                <Col md={9}>
                  {"WareHouse-Floor2"} (Quantity:{" "}
                  {200 + (warehouseChanges.toWarehouseChange || 0)})
                </Col>
              </Row>

              {/* Add warehouse quantity change summary */}
              {dailyTracking[0]?.produced > 0 && (
                <Row className="mb-2">
                  <Col md={12}>
                    <div style={{
                      backgroundColor: "#f8f9fa",
                      padding: "15px",
                      borderRadius: "8px",
                      border: "1px solid #dee2e6"
                    }}>
                      <h6 style={{ color: "#495057", marginBottom: "10px" }}>
                        <i className="ri-information-line me-2"></i>
                        Warehouse Quantity Changes
                      </h6>
                      <Row>
                        <Col md={6}>
                          <strong style={{ color: "#dc3545" }}>From Warehouse:</strong>
                          <br />
                          <span style={{ color: "#dc3545" }}>
                            {warehouseData?.quantity?.[0] ?? "N/A"} → {Math.max(0, (warehouseData?.quantity?.[0] ?? 0) - dailyTracking[0]?.produced)}
                          </span>
                          <br />
                          <small style={{ color: "#6c757d" }}>
                            (-{dailyTracking[0]?.produced} units)
                          </small>
                        </Col>
                        <Col md={6}>
                          <strong style={{ color: "#198754" }}>To Warehouse:</strong>
                          <br />
                          <span style={{ color: "#198754" }}>
                            200 → {200 + dailyTracking[0]?.produced}
                          </span>
                          <br />
                          <small style={{ color: "#6c757d" }}>
                            (+{dailyTracking[0]?.produced} units)
                          </small>
                        </Col>
                      </Row>
                    </div>
                  </Col>
                </Row>
              )}
            </div>
          </div>

          <Alert color="warning" style={{ marginTop: "20px" }}>
            <strong>Note:</strong> This action will update the production
            records and cannot be undone.
          </Alert>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={() => {
              setUpdateConfirmationModal(false);
              submitDailyTracking();
            }}
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Confirm Update"}
          </Button>
          <Button
            color="secondary"
            onClick={() => setUpdateConfirmationModal(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};
