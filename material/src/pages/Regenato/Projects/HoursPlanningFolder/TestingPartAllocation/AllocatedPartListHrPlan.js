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
  // partsCodeId,
  partName,
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
  const [completingAllocation, setCompletingAllocation] = useState(false);
  const [existingDailyTracking, setExistingDailyTracking] = useState([]);
  const [actulEndDateData, setactulEndDateData] = useState([]);
  const [addRowModal, setAddRowModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDateBlocked, setIsDateBlocked] = useState(false);
  const [highlightDates, setHighlightDates] = useState([]);
  const [goodsReceiptData, setGoodsReceiptData] = useState([]);
  const [rejectionWarehouses, setRejectionWarehouses] = useState([]);

  const [disableDates, setDisableDates] = useState([]);
  const [warehouseChanges, setWarehouseChanges] = useState({
    fromWarehouseChange: 0,
    toWarehouseChange: 0,
  });
  const [warehouseData, setWarehouseData] = useState(null);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState(null);
  const [toWarehouseData, setToWarehouseData] = useState(null);
  const [fromWarehouseData, setFromWarehouseData] = useState(null);
  const [toWarehouseId, setToWarehouseId] = useState(null);
  const [fromWarehouseId, setFromWarehouseId] = useState(null);
  const [storeWarehouseData, setStoreWarehouseData] = useState(null);
  const [producedTotalsByTrackingId, setProducedTotalsByTrackingId] = useState(
    {}
  );

  const [jobWorkModal, setJobWorkModal] = useState(false);
  const [goodsIssueData, setGoodsIssueData] = useState([]);
  const [goodsReceiptDataModal, setGoodsReceiptDataModal] = useState([]);
  const [jobWorkLoading, setJobWorkLoading] = useState(false);
  const [projectNameState, setProjectNameState] = useState("");
  const [issueStatus, setIssueStatus] = useState({}); // { [itemcode]: { lastQty, status } }
  const [receiptStatus, setReceiptStatus] = useState({}); // { [itemcode]: { lastQty, status } }
  const jobWorkIntervalRef = React.useRef(null);

  console.log(partName);
  useEffect(() => {
    // fetch project name once
    const fetchProject = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}`
        );
        setProjectNameState(res.data?.projectName || "");
      } catch (e) {
        console.error("Failed to fetch project name", e);
      }
    };
    if (porjectID) fetchProject();
  }, [porjectID]);

  // Fetch rejection warehouses
  const fetchRejectionWarehouses = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/storesVariable`
      );
      // Filter only rejection warehouses (REJ, REJ-H, REJ-N)
      const rejectionStores = response.data.filter(
        (store) =>
          store.categoryId === "REJ" ||
          store.categoryId === "REJ-H" ||
          store.categoryId === "REJ-N"
      );
      setRejectionWarehouses(rejectionStores);
    } catch (error) {
      console.error("Error fetching rejection warehouses:", error);
    }
  };

  // Update rejection warehouse quantity
  const updateRejectionWarehouseQuantity = async (
    warehouseId,
    additionalQuantity
  ) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/storesVariable/${warehouseId}/quantity`,
        { additionalQuantity }
      );
      // Refresh rejection warehouses to show updated quantities
      fetchRejectionWarehouses();
      return response.data;
    } catch (error) {
      console.error("Error updating rejection warehouse quantity:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchRejectionWarehouses();
  }, []);
  useEffect(() => {
    if (selectedSection?.data?.[0]?.wareHouse) {
      // Example: "01 - General Warehouse"
      const wareHouseName = selectedSection.data[0].wareHouse;
      const categoryId = wareHouseName.split(" - ")[0]; // take "01"

      console.log("Fetching warehouse data for categoryId:", categoryId);
      axios
        .get(
          `${process.env.REACT_APP_BASE_URL}/api/storesVariable/category/${categoryId}`
        )
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
            quantity: [0],
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

  // Helper: post a minimal daily tracking entry for Job Work flows
  const postDailyFromJobWork = async ({
    postingdate = "",
    Itemcode = "",
    Descrption = "",
    Quantity = 0,
    WhsCode = "",
    type = "issue", // 'issue' | 'receipt'
  }) => {
    try {
      if (
        !selectedSection?.allocationId ||
        !selectedSection?.data?.[0]?.trackingId
      ) {
        return;
      }

      const allocationId = selectedSection.allocationId;
      const trackingId = selectedSection.data[0].trackingId;

      const isReceipt = String(type).toLowerCase() === "receipt";

      const trackingData = {
        // Core five fields mapped to daily tracking payload
        date: postingdate || "",
        Itemcode: Itemcode || "",
        Descrption: Descrption || "",
        Quantity: Number(Quantity) || 0,
        WhsCode: WhsCode || "",

        // Map to existing UI fields, filling blanks/zeros where unknown
        planned: 0,
        produced: Number(Quantity) || 0,
        dailyStatus: Number(Quantity) > 0 ? "On Track" : "Not Started",
        operator: selectedSection?.data?.[0]?.operator || "",

        fromWarehouse: isReceipt
          ? ""
          : selectedSection?.data?.[0]?.wareHouse || "",
        fromWarehouseId: isReceipt
          ? ""
          : selectedSection?.data?.[0]?.warehouseId || "",
        fromWarehouseQty: isReceipt ? 0 : Number(Quantity) || 0,
        fromWarehouseRemainingQty: "",

        toWarehouse: isReceipt
          ? sections[selectedSectionIndex + 1]?.data?.[0]?.wareHouse ||
            (sections[selectedSectionIndex + 1]
              ? ""
              : fromWarehouseData?.Name?.[0] || "Store")
          : "",
        toWarehouseId: isReceipt
          ? sections[selectedSectionIndex + 1]?.data?.[0]?.warehouseId ||
            (sections[selectedSectionIndex + 1] ? "" : "Store")
          : "",
        toWarehouseQty: isReceipt ? Number(Quantity) || 0 : 0,
        toWarehouseRemainingQty: 0,

        remaining: "",
        machineId: selectedSection?.data?.[0]?.machineId || "",
        shift: selectedSection?.data?.[0]?.shift || "",
        partsCodeId: selectedSection?.data?.[0]?.partsCodeId || "",
      };

      await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/allocations/${allocationId}/allocations/${trackingId}/dailyTracking`,
        trackingData
      );

      // Refresh local tracking cache after successful post (best-effort)
      try {
        const updatedResponse = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/allocations/${allocationId}/allocations/${trackingId}/dailyTracking`
        );
        setExistingDailyTracking(updatedResponse.data.dailyTracking || []);
        setactulEndDateData(updatedResponse.data);
      } catch (_) {}
    } catch (e) {
      console.error("Failed posting Job Work daily tracking", e);
    }
  };

  // Helper: has an equivalent daily tracking entry already been recorded?
  const hasDailyJobWorkEntry = ({ postingdate, Quantity, WhsCode }, type) => {
    const isReceipt = String(type).toLowerCase() === "receipt";
    const targetDate = postingdate
      ? moment(postingdate).startOf("day").valueOf()
      : null;
    return (existingDailyTracking || []).some((t) => {
      const tDate = t?.date ? moment(t.date).startOf("day").valueOf() : null;
      if (targetDate != null && tDate != null && tDate !== targetDate)
        return false;
      const qtyMatch = Number(t?.produced || 0) === Number(Quantity || 0);
      if (!qtyMatch) return false;
      if (isReceipt) {
        return (t?.toWarehouseQty || 0) === (Number(Quantity) || 0);
      }
      return (t?.fromWarehouseQty || 0) === (Number(Quantity) || 0);
    });
  };

  // Sync detected Job Work Issues/Receipts into Daily Tracking automatically
  const syncJobWorkToDailyTracking = async (
    issueList = [],
    receiptList = []
  ) => {
    try {
      if (!jobWorkModal || !selectedSection?.data?.[0]) return;

      const currentItemCode = String(
        selectedSection?.data?.[0]?.partsCodeId || ""
      );
      const currentProduction = (
        projectNameState ||
        sections[0]?.projectName ||
        ""
      )
        .toString()
        .trim()
        .toLowerCase();

      // Filter lists for current project + item
      const filteredIssues = (issueList || []).filter((g) => {
        const matchProd =
          (g.ProductionNo || "").toString().trim().toLowerCase() ===
          currentProduction;
        const matchItem = String(g.Itemcode).trim() === currentItemCode;
        return matchItem && matchProd;
      });
      const filteredReceipts = (receiptList || []).filter((g) => {
        const matchProd =
          (g.ProductionNo || "").toString().trim().toLowerCase() ===
          currentProduction;
        const matchItem = String(g.Itemcode).trim() === currentItemCode;
        return matchItem && matchProd;
      });

      // Post missing Issue entries
      for (const g of filteredIssues) {
        const payload = {
          postingdate: g.postingdate || g.PostingDate || g.DocDate || "",
          Itemcode: g.Itemcode || "",
          Descrption: partName || g.Descrption || g.Description || "",
          Quantity: Number(g.Quantity) || 0,
          WhsCode:
            g.WhsCode ||
            g.Whscode ||
            g.Whs ||
            selectedSection?.data?.[0]?.warehouseId ||
            "",
        };
        if (!hasDailyJobWorkEntry(payload, "issue")) {
          await postDailyFromJobWork({ ...payload, type: "issue" });
        }
      }

      // Post missing Receipt entries
      for (const g of filteredReceipts) {
        const payload = {
          postingdate: g.postingdate || g.PostingDate || g.DocDate || "",
          Itemcode: g.Itemcode || "",
          Descrption: partName || g.Descrption || g.Description || "",
          Quantity: Number(g.Quantity) || 0,
          WhsCode:
            g.WhsCode ||
            g.Whscode ||
            g.Whs ||
            sections[selectedSectionIndex + 1]?.data?.[0]?.warehouseId ||
            (sections[selectedSectionIndex + 1] ? "" : "Store"),
        };
        if (!hasDailyJobWorkEntry(payload, "receipt")) {
          await postDailyFromJobWork({ ...payload, type: "receipt" });
        }
      }
    } catch (e) {
      console.error("Failed syncing Job Work to Daily Tracking", e);
    }
  };

  // Function to refresh warehouse data
  const refreshWarehouseData = async () => {
    try {
      const requests = [];
      // Refresh current (To) warehouse
      if (selectedSection?.data?.[0]?.wareHouse) {
        const currentCategoryId =
          selectedSection.data[0].wareHouse.split(" - ")[0];
        requests.push(
          axios
            .get(
              `${process.env.REACT_APP_BASE_URL}/api/storesVariable/category/${currentCategoryId}`
            )
            .then((res) => setToWarehouseData(res.data))
        );
      }
      // Refresh next (From) warehouse if exists, or Store warehouse for last process
      if (
        selectedSectionIndex !== null &&
        Array.isArray(sections) &&
        sections[selectedSectionIndex + 1]?.data?.[0]?.wareHouse
      ) {
        const nextCategoryId =
          sections[selectedSectionIndex + 1].data[0].wareHouse.split(" - ")[0];
        requests.push(
          axios
            .get(
              `${process.env.REACT_APP_BASE_URL}/api/storesVariable/category/${nextCategoryId}`
            )
            .then((res) => setFromWarehouseData(res.data))
        );
      } else if (
        selectedSectionIndex !== null &&
        !sections[selectedSectionIndex + 1]
      ) {
        // Last process - refresh Store warehouse
        requests.push(
          axios
            .get(
              `${process.env.REACT_APP_BASE_URL}/api/storesVariable/category/Store`
            )
            .then((res) => setFromWarehouseData(res.data))
        );
      }
      if (requests.length) {
        await Promise.all(requests);
        toast.success("Warehouse data refreshed successfully!");
      }
    } catch (error) {
      console.error("Error refreshing warehouse data:", error);
      toast.error("Failed to refresh warehouse data");
    }
  };

  // Function to check if warehouse quantity is sufficient
  const isWarehouseQuantitySufficient = (requiredQuantity) => {
    const availableQuantity = toWarehouseData?.quantity?.[0] || 0;
    return availableQuantity >= requiredQuantity;
  };

  // Function to get warehouse quantity warning
  const getWarehouseQuantityWarning = () => {
    const availableQuantity = toWarehouseData?.quantity?.[0];
    if (availableQuantity == null) return null;
    const producedQuantity = dailyTracking[0]?.produced || 0;

    if (availableQuantity === 0) {
      return { type: "error", message: "Warehouse is empty!" };
    } else if (availableQuantity < producedQuantity) {
      return {
        type: "warning",
        message: `Insufficient warehouse quantity. Available: ${availableQuantity}, Required: ${producedQuantity}`,
      };
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
                  startTime: allocation.startTime || null,
                  endTime: allocation.endTime || null,
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
          // After sections are set, fetch produced totals for each row/tracking
          try {
            const requests = [];
            filteredSections.forEach((sec) => {
              (sec.data || []).forEach((row) => {
                if (row?.trackingId && sec.allocationId) {
                  const url = `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/allocations/${sec.allocationId}/allocations/${row.trackingId}/dailyTracking`;
                  requests.push(
                    axios
                      .get(url)
                      .then((res) => {
                        const daily = res?.data?.dailyTracking || [];
                        const total = daily.reduce(
                          (sum, t) => sum + (Number(t.produced) || 0),
                          0
                        );
                        return { trackingId: row.trackingId, total };
                      })
                      .catch(() => ({ trackingId: row.trackingId, total: 0 }))
                  );
                }
              });
            });
            if (requests.length) {
              const results = await Promise.all(requests);
              const map = {};
              results.forEach(({ trackingId, total }) => {
                map[trackingId] = total;
              });
              setProducedTotalsByTrackingId(map);
            } else {
              setProducedTotalsByTrackingId({});
            }
          } catch (e) {
            setProducedTotalsByTrackingId({});
          }
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

  // Helper: total produced for a section (sum of its rows)
  const getSectionProducedTotal = (section) => {
    if (!section?.data) return 0;
    return section.data.reduce(
      (sum, row) => sum + (producedTotalsByTrackingId[row.trackingId] || 0),
      0
    );
  };

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
    setSelectedSectionIndex(currentIndex);
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
        date: new Date(),
        planned: Number(row.dailyPlannedQty) || 0, // Ensure planned is correctly set
        produced: 0,
        dailyStatus: "On Track",
        operator: row.operator || "",
      },
    ]);

    setDailyTaskModal(true);

    // Reset warehouse change previews when opening a new row
    setWarehouseChanges({ fromWarehouseChange: 0, toWarehouseChange: 0 });

    // Clear previous tracking immediately to avoid temporary UI disable
    setExistingDailyTracking([]);

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

  // Add this useEffect to monitor Job Work receipt quantities
  useEffect(() => {
    if (selectedSection && selectedSectionIndex > 0) {
      const previousSection = sections[selectedSectionIndex - 1];
      if (previousSection?.isSpecialDay) {
        // If previous process is Job Work, we need to refresh receipt data
        const refreshReceiptData = async () => {
          try {
            const receiptRes = await axios.get(
              `${process.env.REACT_APP_BASE_URL}/api/GoodsReceipt/GetGoodsReceipt`
            );
            setGoodsReceiptDataModal(receiptRes.data || []);
            updateReceiptStatuses(receiptRes.data || []);
          } catch (error) {
            console.error("Error refreshing receipt data:", error);
          }
        };

        refreshReceiptData();
      }
    }
  }, [selectedSection, selectedSectionIndex, sections]);

  // Add this function to get quantity received from previous Job Work process
  const getQuantityFromJobWorkReceipt = (currentSectionIndex) => {
    if (currentSectionIndex === 0) return 200; // First process

    const previousSection = sections[currentSectionIndex - 1];

    // Check if previous process was a Job Work (special day)
    if (!previousSection?.isSpecialDay) {
      // If previous process is not Job Work, use normal produced quantity
      const previousTrackingId = previousSection?.data?.[0]?.trackingId;
      return producedTotalsByTrackingId[previousTrackingId] || 0;
    }

    // For Job Work processes, we need to get quantity from Goods Receipt
    const currentItemCode = String(
      sections[currentSectionIndex]?.data?.[0]?.partsCodeId || ""
    );
    const currentProduction = (
      projectNameState ||
      sections[0]?.projectName ||
      ""
    )
      .toString()
      .trim()
      .toLowerCase();

    // Filter receipts for current project + item
    const filteredReceipts = (goodsReceiptDataModal || []).filter((g) => {
      const matchProd =
        (g.ProductionNo || "").toString().trim().toLowerCase() ===
        currentProduction;
      const matchItem = String(g.Itemcode).trim() === currentItemCode;
      return matchItem && matchProd;
    });

    // Sum all receipt quantities
    const totalReceiptQuantity = filteredReceipts.reduce((sum, receipt) => {
      return sum + (Number(receipt.Quantity) || 0);
    }, 0);

    console.log(
      `Job Work Receipt Quantity for ${currentItemCode}:`,
      totalReceiptQuantity
    );
    return totalReceiptQuantity;
  };

  // Add this function to get available quantity from previous process
  // Enhanced function to get available quantity from previous process
  const getAvailableQuantityFromPreviousProcess = (currentSectionIndex) => {
    if (currentSectionIndex === 0) {
      return 200; // Initial quantity for first process
    }

    const previousSection = sections[currentSectionIndex - 1];

    // If previous process is Job Work, use receipt quantity
    if (previousSection?.isSpecialDay) {
      return getQuantityFromJobWorkReceipt(currentSectionIndex);
    }

    // For normal processes, use produced quantity
    const previousTrackingId = previousSection?.data?.[0]?.trackingId;
    return producedTotalsByTrackingId[previousTrackingId] || 0;
  };

  // Add this function to get current process produced quantity
  const getCurrentProcessProducedQuantity = (section) => {
    if (!section?.data?.[0]) return 0;
    const trackingId = section.data[0].trackingId;
    return producedTotalsByTrackingId[trackingId] || 0;
  };

  const handleDailyTrackingChange = (index, field, value) => {
    if (field === "produced") {
      const numericValue = Number(value) || 0;

      // --- Core Variables ---
      const remainingQty = calculateRemainingQuantity();
      const availableWarehouseQty = toWarehouseData?.quantity?.[0];
      const availableFromPrevious =
        getAvailableQuantityFromPreviousProcess(selectedSectionIndex);
      const currentProduced =
        getCurrentProcessProducedQuantity(selectedSection);
      const totalAfterUpdate = currentProduced + numericValue;

      // --- Identify if previous process is Job Work ---
      const previousSection =
        selectedSectionIndex > 0 ? sections[selectedSectionIndex - 1] : null;
      const isPreviousJobWork = previousSection?.isSpecialDay;

      // 🧭 Validation 1: Cannot exceed remaining planned quantity
      if (numericValue > remainingQty) {
        toast.error(
          `Produced quantity cannot exceed remaining quantity (${remainingQty})`
        );
        return;
      }

      // 🧭 Validation 2: Cannot exceed available warehouse quantity
      if (
        availableWarehouseQty != null &&
        numericValue > availableWarehouseQty
      ) {
        toast.error(
          `Produced quantity cannot exceed available warehouse quantity (${availableWarehouseQty})`
        );
        return;
      }

      // 🧭 Validation 3 (NEW): For Job Work, allow only up to total RECEIPT quantity
      if (isPreviousJobWork) {
        const totalReceiptQty =
          getQuantityFromJobWorkReceipt(selectedSectionIndex);
        const previousProduced =
          getCurrentProcessProducedQuantity(selectedSection);

        // remaining receipt-based capacity = total receipts - already produced
        const availableForProduction = totalReceiptQty - previousProduced;

        if (numericValue > availableForProduction) {
          toast.error(
            `You have received only ${totalReceiptQty} units from Job Work. You can produce up to ${availableForProduction} more at this stage.`
          );
          return;
        }

        // Optional stricter rule (as per your note):
        // Only allow exactly equal to receipt quantity (not less)
        if (numericValue < availableForProduction && numericValue !== 0) {
          toast.warning(
            `You can produce exactly ${availableForProduction} units (not less or more) since that’s the Job Work receipt quantity.`
          );
        }
      }

      // --- Warehouse preview update ---
      setWarehouseChanges({
        fromWarehouseChange: -numericValue,
        toWarehouseChange: numericValue,
      });
    }

    // if (field === "rejectedWarehouseQuantity") {
    //   const rejectionQty = Number(value) || 0;
    //   const producedQty = Number(dailyTracking[index]?.produced) || 0;
    //   const totalQty = selectedSection?.data?.[0]?.plannedQty || 0;

    //   if (producedQty + rejectionQty > totalQty) {
    //     toast.error(
    //       `Invalid: Produced (${producedQty}) + Rejection (${rejectionQty}) exceeds total (${totalQty}).`
    //     );
    //     return; // Prevent invalid input
    //   }
    // }

    // Update state
   if (field === "rejectedWarehouseQuantity") {
  const rejectionQty = Number(value) || 0;
  const producedQty = Number(dailyTracking[index]?.produced) || 0;
  const totalQty = selectedSection?.data?.[0]?.plannedQty || 0;

  // 🧭 Rule 1: Produced + Rejection cannot exceed total planned
  if (producedQty + rejectionQty > totalQty) {
    toast.error(
      `Invalid: Produced (${producedQty}) + Rejection (${rejectionQty}) exceeds total (${totalQty}).`
    );
    return;
  }

  // 🧭 Rule 2: Rejection cannot exceed produced quantity
  if (rejectionQty > producedQty) {
    toast.error(
      `Invalid: Rejection quantity (${rejectionQty}) cannot exceed produced quantity (${producedQty}).`
    );
    return;
  }
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

  // const handleDailyTrackingChange = (index, field, value) => {
  //   if (field === "produced") {
  //     const remainingQty = calculateRemainingQuantity();
  //     const numericValue = Number(value) || 0;
  //     const availableWarehouseQty = toWarehouseData?.quantity?.[0];

  //     if (numericValue > remainingQty) {
  //       toast.error(
  //         `Produced quantity cannot exceed remaining quantity (${remainingQty})`
  //       );
  //       return;
  //     }

  //     // Check if produced quantity exceeds available warehouse quantity (only when known)
  //     if (
  //       availableWarehouseQty != null &&
  //       numericValue > availableWarehouseQty
  //     ) {
  //       toast.error(
  //         `Produced quantity cannot exceed available warehouse quantity (${availableWarehouseQty})`
  //       );
  //       return;
  //     }

  //     // Calculate warehouse changes
  //     // decrement current (To), increment next (From)
  //     setWarehouseChanges({
  //       fromWarehouseChange: -numericValue,
  //       toWarehouseChange: numericValue,
  //     });
  //   }

  //   setDailyTracking((prev) => {
  //     const updated = [...prev];

  //     if (!updated[index]) {
  //       console.warn(`Index ${index} is undefined`);
  //       return prev;
  //     }

  //     updated[index][field] = value;

  //     if (field === "produced") {
  //       const produced = Number(value) || 0;
  //       const planned =
  //         Number(updated[index].planned) ||
  //         Number(selectedSection?.data[0]?.dailyPlannedQty) ||
  //         0;

  //       if (produced === planned) {
  //         updated[index].dailyStatus = "On Track";
  //       } else if (produced > planned) {
  //         updated[index].dailyStatus = "Ahead";
  //       } else {
  //         updated[index].dailyStatus = "Delayed";
  //       }
  //     }

  //     return updated;
  //   });
  // };

  const calculateRemainingQuantity = () => {
    if (!selectedSection || !selectedSection.data[0]) return 0;

    const totalQuantity = selectedSection.data[0].plannedQty;
    const totalProduced = existingDailyTracking.reduce(
      (sum, task) => sum + task.produced,
      0
    );

    return totalQuantity - totalProduced;
  };

  // const submitDailyTracking = async () => {
  //   setIsUpdating(true);
  //   try {
  //     //  Validation: Produced + Rejection cannot exceed total planned quantity
  //     const totalQty = selectedSection?.data?.[0]?.plannedQty || 0;
  //     const producedQty = Number(dailyTracking[0]?.produced) || 0;
  //     const rejectionQty =
  //       Number(dailyTracking[0]?.rejectedWarehouseQuantity) || 0;

  //     if (producedQty + rejectionQty > totalQty) {
  //       toast.error(
  //         `Invalid entry: Produced (${producedQty}) + Rejection (${rejectionQty}) exceeds total quantity (${totalQty}).`
  //       );
  //       setIsUpdating(false);
  //       return;
  //     }

  //     // NEW VALIDATION: Final check before submission
  //     const availableFromPrevious =
  //       getAvailableQuantityFromPreviousProcess(selectedSectionIndex);
  //     const currentProduced =
  //       getCurrentProcessProducedQuantity(selectedSection);
  //     const newProduced = Number(dailyTracking[0]?.produced) || 0;
  //     const totalAfterUpdate = currentProduced + newProduced;

  //     if (totalAfterUpdate > availableFromPrevious) {
  //       toast.error(
  //         `Cannot produce more than quantity received from previous process (${availableFromPrevious}). Current: ${currentProduced}, New: ${newProduced}`
  //       );
  //       return;
  //     }

  //     if (!selectedSection || !selectedSection.data.length) {
  //       toast.error("No allocation selected.");
  //       return;
  //     }

  //     const allocationId = selectedSection.allocationId;
  //     const trackingId = selectedSection.data[0]?.trackingId;

  //     if (!allocationId || !trackingId) {
  //       toast.error("Allocation or Tracking ID is missing.");
  //       return;
  //     }

  //     // ✅ Capture submission time (HH:mm)
  //     const actualEndTime = moment().format("HH:mm");

  //     // ✅ Dynamically fetch selected rejection warehouse categoryId
  //     let rejectedWarehouseCategoryId = "";
  //     if (dailyTracking[0]?.rejectedWarehouse) {
  //       try {
  //         // Example: if rejectedWarehouse = "REJECTED" → fetch category data for that warehouse
  //         const selectedWarehouseName =
  //           dailyTracking[0]?.rejectedWarehouse.trim();

  //         const rejWarehouseRes = await axios.get(
  //           `${process.env.REACT_APP_BASE_URL}/api/storesVariable/category/${selectedWarehouseName}`
  //         );

  //         // ✅ Get categoryId dynamically (e.g., "REJ", "SCR", etc.)
  //         rejectedWarehouseCategoryId =
  //           rejWarehouseRes?.data?.categoryId || selectedWarehouseName;
  //       } catch (error) {
  //         console.error("Error fetching rejection warehouse category:", error);
  //         rejectedWarehouseCategoryId =
  //           dailyTracking[0]?.rejectedWarehouse || "";
  //       }
  //     }

  //     // ✅ Prepare tracking data to send to backend
  //     const trackingData = {
  //       ...dailyTracking[0],
  //       wareHouseTotalQty: warehouseQuantities.total,
  //       wareHouseremainingQty: warehouseQuantities.remaining,

  //       // === Additional tracking context ===
  //       projectName: sections[0]?.projectName || "N/A",
  //       partName: partName || "N/A",
  //       processName: selectedSection?.title || "N/A",
  //       fromWarehouse: selectedSection?.data[0]?.Name || "N/A",
  //       fromWarehouseId: selectedSection?.data[0]?.categoryId || null,
  //       fromWarehouseQty: toWarehouseData?.quantity?.[0] || 0,
  //       fromWarehouseRemainingQty: Math.max(
  //         0,
  //         (toWarehouseData?.quantity?.[0] || 0) -
  //           (dailyTracking[0]?.produced || 0)
  //       ),
  //       toWarehouse:
  //         sections[selectedSectionIndex + 1]?.data?.[0]?.wareHouse ||
  //         (sections[selectedSectionIndex + 1]
  //           ? "N/A"
  //           : fromWarehouseData?.Name?.[0] || "Store"),
  //       toWarehouseId:
  //         sections[selectedSectionIndex + 1]?.data?.[0]?.warehouseId ||
  //         (sections[selectedSectionIndex + 1] ? null : "Store"),
  //       toWarehouseQty: fromWarehouseData?.quantity?.[0] || 0,
  //       toWarehouseRemainingQty: Math.max(
  //         0,
  //         (fromWarehouseData?.quantity?.[0] || 0) +
  //           (dailyTracking[0]?.produced || 0)
  //       ),
  //       remaining: calculateRemainingQuantity(),
  //       machineId: selectedSection?.data[0]?.machineId || "N/A",
  //       shift: selectedSection?.data[0]?.shift || "N/A",
  //       partsCodeId: selectedSection?.data[0]?.partsCodeId || "N/A",

  //       // ✅ Actual end time (submission time)
  //       actualEndTime,

  //       // ✅ Dynamic Rejection Fields
  //       rejectedWarehouse: dailyTracking[0]?.rejectedWarehouse || "",
  //       rejectedWarehouseId:
  //         rejectedWarehouseCategoryId ||
  //         dailyTracking[0]?.rejectedWarehouseId ||
  //         "",
  //       rejectedWarehouseQuantity:
  //         Number(dailyTracking[0]?.rejectedWarehouseQuantity) || 0,
  //       remarks: dailyTracking[0]?.remarks || "",
  //     };

  //     // === POST Daily Tracking ===
  //     const response = await axios.post(
  //       `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/allocations/${allocationId}/allocations/${trackingId}/dailyTracking`,
  //       trackingData
  //     );

  //     // ✅ Update rejected warehouse quantity (if rejection exists)
  //     if (
  //       dailyTracking[0]?.rejectedWarehouseId &&
  //       dailyTracking[0]?.rejectedWarehouseQuantity > 0
  //     ) {
  //       try {
  //         await updateRejectionWarehouseQuantity(
  //           rejectedWarehouseCategoryId,
  //           Number(dailyTracking[0].rejectedWarehouseQuantity)
  //         );

  //         toast.success(
  //           `Rejection quantity ${dailyTracking[0].rejectedWarehouseQuantity} added to ${dailyTracking[0].rejectedWarehouse}`
  //         );
  //       } catch (error) {
  //         console.error(
  //           "Failed to update rejection warehouse quantity:",
  //           error
  //         );
  //         // toast.warning(
  //         //   "Daily tracking saved but warehouse quantity update failed."
  //         // );
  //       }
  //     }

  //     // === Post to Inventory ===
  //     if (dailyTracking[0]?.produced > 0) {
  //       try {
  //         const inventoryData = {
  //           DocDate: dailyTracking[0].date,
  //           ItemCode: selectedSection.data[0]?.partsCodeId || "",
  //           Dscription: partName || "",
  //           Quantity: Number(dailyTracking[0].produced) || 0,
  //           WhsCode:
  //             sections[selectedSectionIndex + 1]?.data?.[0]?.warehouseId ||
  //             (sections[selectedSectionIndex + 1] ? "" : "Store"),
  //           FromWhsCod: selectedSection.data[0]?.warehouseId || "",
  //         };

  //         const invPostRes = await axios.post(
  //           `${process.env.REACT_APP_BASE_URL}/api/Inventory/PostInventory`,
  //           inventoryData
  //         );

  //         toast.success(
  //           `Inventory PostInventory response: ${
  //             invPostRes?.data?.message ||
  //             invPostRes?.data?.Message ||
  //             invPostRes?.data?.status ||
  //             "Inventory posted successfully"
  //           }`
  //         );

  //         const invVarPostRes = await axios.post(
  //           `${process.env.REACT_APP_BASE_URL}/api/InventoryVaraible/PostInventoryVaraibleVaraible`,
  //           inventoryData
  //         );

  //         toast.info(
  //           `InventoryVaraible response: ${
  //             invVarPostRes?.data?.message ||
  //             invVarPostRes?.data?.Message ||
  //             invVarPostRes?.data?.status ||
  //             "Inventory variable posted successfully"
  //           }`
  //         );
  //       } catch (inventoryError) {
  //         console.error("Error posting to inventory:", inventoryError);
  //         toast.warning("Daily tracking updated but inventory update failed.");
  //       }
  //     }

  //     // === Update Warehouse Quantities ===
  //     if (
  //       dailyTracking[0]?.produced > 0 &&
  //       selectedSection?.data[0]?.warehouseId
  //     ) {
  //       const producedQty = Number(dailyTracking[0].produced) || 0;
  //       const currentWarehouseId = selectedSection.data[0].warehouseId;
  //       const nextWarehouseId =
  //         sections[selectedSectionIndex + 1]?.data?.[0]?.warehouseId ||
  //         (sections[selectedSectionIndex + 1] ? null : "Store");

  //       try {
  //         const nextIsSpecialDay =
  //           sections[selectedSectionIndex + 1]?.isSpecialDay === true;

  //         if (nextWarehouseId && !nextIsSpecialDay) {
  //           // === Transfer to next warehouse ===
  //           const transferRes = await axios.put(
  //             `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/transfer-warehouse-quantity`,
  //             {
  //               toWarehouseId: currentWarehouseId,
  //               fromWarehouseId: nextWarehouseId,
  //               quantity: producedQty,
  //             }
  //           );

  //           if (transferRes.data?.success) {
  //             setToWarehouseData((prev) => ({
  //               ...(prev || {}),
  //               quantity: [
  //                 Math.max(0, (prev?.quantity?.[0] ?? 0) - producedQty),
  //               ],
  //             }));
  //             setFromWarehouseData((prev) => ({
  //               ...(prev || {}),
  //               quantity: [(prev?.quantity?.[0] ?? 0) + producedQty],
  //             }));
  //             toast.success("Warehouse quantities transferred successfully");
  //           }
  //         } else {
  //           // === Update Store or special-day warehouse ===
  //           const decRes = await axios.put(
  //             `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/update-warehouse-quantity`,
  //             {
  //               warehouseId: currentWarehouseId,
  //               quantityToReduce: producedQty,
  //             }
  //           );

  //           if (decRes.data?.success) {
  //             setToWarehouseData((prev) => ({
  //               ...(prev || {}),
  //               quantity: [
  //                 Math.max(0, (prev?.quantity?.[0] ?? 0) - producedQty),
  //               ],
  //             }));

  //             if (!nextWarehouseId) {
  //               await axios.put(
  //                 `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/increment-warehouse-quantity`,
  //                 {
  //                   warehouseId: "STORE",
  //                   quantityToAdd: producedQty,
  //                 }
  //               );

  //               setFromWarehouseData((prev) => ({
  //                 ...(prev || {}),
  //                 quantity: [(prev?.quantity?.[0] ?? 0) + producedQty],
  //               }));
  //               toast.success("Store warehouse updated with produced quantity");
  //             } else if (nextIsSpecialDay) {
  //               await axios.put(
  //                 `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/increment-warehouse-quantity`,
  //                 {
  //                   warehouseId: nextWarehouseId,
  //                   quantityToAdd: producedQty,
  //                 }
  //               );

  //               setFromWarehouseData((prev) => ({
  //                 ...(prev || {}),
  //                 quantity: [(prev?.quantity?.[0] ?? 0) + producedQty],
  //               }));
  //               toast.success("Next process warehouse updated (special day)");
  //             }
  //           }
  //         }
  //       } catch (warehouseError) {
  //         console.error("Error updating warehouse quantities:", warehouseError);
  //         toast.warning(
  //           "Daily tracking updated but warehouse quantity update failed."
  //         );
  //       }
  //     }

  //     // === Callback for parent ===
  //     if (onUpdateAllocaitonStatus) {
  //       onUpdateAllocaitonStatus(response.data);
  //     }

  //     toast.success("Daily Tracking Updated Successfully!");

  //     // === Fetch latest daily tracking after save ===
  //     const updatedResponse = await axios.get(
  //       `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/allocations/${allocationId}/allocations/${trackingId}/dailyTracking`
  //     );

  //     setExistingDailyTracking(updatedResponse.data.dailyTracking || []);
  //     setactulEndDateData(updatedResponse.data);

  //     // === Reset form ===
  //     setDailyTracking([
  //       {
  //         date: "",
  //         planned: selectedSection.data[0].dailyPlannedQty || 0,
  //         produced: 0,
  //         dailyStatus: "On Track",
  //         operator: selectedSection.data[0].operator || "",
  //       },
  //     ]);

  //     closeAddRowModal();
  //   } catch (error) {
  //     toast.error("Failed to update daily tracking.");
  //     console.error("Error updating daily tracking:", error);
  //   } finally {
  //     setIsUpdating(false);
  //   }
  // };

    const submitDailyTracking = async () => {
    setIsUpdating(true);
    try {
      //  Validation: Produced + Rejection cannot exceed total planned quantity
      const totalQty = selectedSection?.data?.[0]?.plannedQty || 0;
      const producedQty = Number(dailyTracking[0]?.produced) || 0;
      const rejectionQty =
        Number(dailyTracking[0]?.rejectedWarehouseQuantity) || 0;
 
      if (producedQty + rejectionQty > totalQty) {
        toast.error(
          `Invalid entry: Produced (${producedQty}) + Rejection (${rejectionQty}) exceeds total quantity (${totalQty}).`
        );
        setIsUpdating(false);
        return;
      }
 
      // NEW VALIDATION: Final check before submission
      const availableFromPrevious =
        getAvailableQuantityFromPreviousProcess(selectedSectionIndex);
      const currentProduced =
        getCurrentProcessProducedQuantity(selectedSection);
      const newProduced = Number(dailyTracking[0]?.produced) || 0;
      const totalAfterUpdate = currentProduced + newProduced;
 
      if (totalAfterUpdate > availableFromPrevious) {
        toast.error(
          `Cannot produce more than quantity received from previous process (${availableFromPrevious}). Current: ${currentProduced}, New: ${newProduced}`
        );
        return;
      }
 
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
 
      // ✅ Capture submission time (HH:mm)
      const actualEndTime = moment().format("HH:mm");
 
      // ✅ Dynamically fetch selected rejection warehouse categoryId
      let rejectedWarehouseCategoryId = "";
      if (dailyTracking[0]?.rejectedWarehouse) {
        try {
          // Example: if rejectedWarehouse = "REJECTED" → fetch category data for that warehouse
          const selectedWarehouseName =
            dailyTracking[0]?.rejectedWarehouse.trim();
 
          const rejWarehouseRes = await axios.get(
            `${process.env.REACT_APP_BASE_URL}/api/storesVariable/category/${selectedWarehouseName}`
          );
 
          // ✅ Get categoryId dynamically (e.g., "REJ", "SCR", etc.)
          rejectedWarehouseCategoryId =
            rejWarehouseRes?.data?.categoryId || selectedWarehouseName;
        } catch (error) {
          console.error("Error fetching rejection warehouse category:", error);
          rejectedWarehouseCategoryId =
            dailyTracking[0]?.rejectedWarehouse || "";
        }
      }
 
      // ✅ Prepare tracking data to send to backend
      const trackingData = {
        ...dailyTracking[0],
        wareHouseTotalQty: warehouseQuantities.total,
        wareHouseremainingQty: warehouseQuantities.remaining,
 
        // === Additional tracking context ===
        projectName: sections[0]?.projectName || "N/A",
        partName: partName || "N/A",
        processName: selectedSection?.title || "N/A",
        fromWarehouse: selectedSection?.data[0]?.wareHouse || "N/A",
        fromWarehouseId: selectedSection?.data[0]?.warehouseId || null,
        fromWarehouseQty: toWarehouseData?.quantity?.[0] || 0,
        fromWarehouseRemainingQty: Math.max(
          0,
          (toWarehouseData?.quantity?.[0] || 0) -
            (dailyTracking[0]?.produced || 0)
        ),
        toWarehouse:
          sections[selectedSectionIndex + 1]?.data?.[0]?.wareHouse ||
          (sections[selectedSectionIndex + 1]
            ? "N/A"
            : fromWarehouseData?.Name?.[0] || "Store"),
        toWarehouseId:
          sections[selectedSectionIndex + 1]?.data?.[0]?.warehouseId ||
          (sections[selectedSectionIndex + 1] ? null : "Store"),
        toWarehouseQty: fromWarehouseData?.quantity?.[0] || 0,
        toWarehouseRemainingQty: Math.max(
          0,
          (fromWarehouseData?.quantity?.[0] || 0) +
            (dailyTracking[0]?.produced || 0)
        ),
        remaining: calculateRemainingQuantity(),
        machineId: selectedSection?.data[0]?.machineId || "N/A",
        shift: selectedSection?.data[0]?.shift || "N/A",
        partsCodeId: selectedSection?.data[0]?.partsCodeId || "N/A",
 
        // ✅ Actual end time (submission time)
        actualEndTime,
 
        // ✅ Dynamic Rejection Fields
        rejectedWarehouse: dailyTracking[0]?.rejectedWarehouse || "",
        rejectedWarehouseId:
          rejectedWarehouseCategoryId ||
          dailyTracking[0]?.rejectedWarehouseId ||
          "",
        rejectedWarehouseQuantity:
          Number(dailyTracking[0]?.rejectedWarehouseQuantity) || 0,
        remarks: dailyTracking[0]?.remarks || "",
      };
 
      // === POST Daily Tracking ===
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/allocations/${allocationId}/allocations/${trackingId}/dailyTracking`,
        trackingData
      );
 
      // ✅ Update rejected warehouse quantity (if rejection exists)
      if (
        dailyTracking[0]?.rejectedWarehouseId &&
        dailyTracking[0]?.rejectedWarehouseQuantity > 0
      ) {
        try {
          await updateRejectionWarehouseQuantity(
            rejectedWarehouseCategoryId,
            Number(dailyTracking[0].rejectedWarehouseQuantity)
          );
 
          toast.success(
            `Rejection quantity ${dailyTracking[0].rejectedWarehouseQuantity} added to ${dailyTracking[0].rejectedWarehouse}`
          );
        } catch (error) {
          console.error(
            "Failed to update rejection warehouse quantity:",
            error
          );
          // toast.warning(
          //   "Daily tracking saved but warehouse quantity update failed."
          // );
        }
      }
 
      // === Post to Inventory ===
      if (dailyTracking[0]?.produced > 0) {
        try {
          const inventoryData = {
            DocDate: dailyTracking[0].date,
            ItemCode: selectedSection.data[0]?.partsCodeId || "",
            Dscription: partName || "",
            Quantity: Number(dailyTracking[0].produced) || 0,
            WhsCode:
              sections[selectedSectionIndex + 1]?.data?.[0]?.warehouseId ||
              (sections[selectedSectionIndex + 1] ? "" : "Store"),
            FromWhsCod: selectedSection.data[0]?.warehouseId || "",
          };
 
          const invPostRes = await axios.post(
            `${process.env.REACT_APP_BASE_URL}/api/Inventory/PostInventory`,
            inventoryData
          );
 
          toast.success(
            `Inventory PostInventory response: ${
              invPostRes?.data?.message ||
              invPostRes?.data?.Message ||
              invPostRes?.data?.status ||
              "Inventory posted successfully"
            }`
          );
 
          const invVarPostRes = await axios.post(
            `${process.env.REACT_APP_BASE_URL}/api/InventoryVaraible/PostInventoryVaraibleVaraible`,
            inventoryData
          );
 
          toast.info(
            `InventoryVaraible response: ${
              invVarPostRes?.data?.message ||
              invVarPostRes?.data?.Message ||
              invVarPostRes?.data?.status ||
              "Inventory variable posted successfully"
            }`
          );
        } catch (inventoryError) {
          console.error("Error posting to inventory:", inventoryError);
          toast.warning("Daily tracking updated but inventory update failed.");
        }
      }
 
      // === Post Rejection to Inventory ===
      if (
        dailyTracking[0]?.rejectedWarehouseQuantity > 0 &&
        dailyTracking[0]?.rejectedWarehouseId
      ) {
        try {
          const rejectionInventoryData = {
            DocDate: dailyTracking[0].date,
            ItemCode: selectedSection.data[0]?.partsCodeId || "",
            Dscription: partName || "",
            Quantity: Number(dailyTracking[0].rejectedWarehouseQuantity) || 0,
            WhsCode: dailyTracking[0].rejectedWarehouseId,
            FromWhsCod: selectedSection.data[0]?.warehouseId || "",
          };
 
          const rejectionInvPostRes = await axios.post(
            `${process.env.REACT_APP_BASE_URL}/api/Inventory/PostInventory`,
            rejectionInventoryData
          );
 
          toast.success(
            `Rejection Inventory PostInventory response: ${
              rejectionInvPostRes?.data?.message ||
              rejectionInvPostRes?.data?.Message ||
              rejectionInvPostRes?.data?.status ||
              "Rejection inventory posted successfully"
            }`
          );
 
          const rejectionInvVarPostRes = await axios.post(
            `${process.env.REACT_APP_BASE_URL}/api/InventoryVaraible/PostInventoryVaraibleVaraible`,
            rejectionInventoryData
          );
 
          toast.info(
            `Rejection InventoryVaraible response: ${
              rejectionInvVarPostRes?.data?.message ||
              rejectionInvVarPostRes?.data?.Message ||
              rejectionInvVarPostRes?.data?.status ||
              "Rejection inventory variable posted successfully"
            }`
          );
        } catch (rejectionInventoryError) {
          console.error("Error posting rejection to inventory:", rejectionInventoryError);
          toast.warning("Daily tracking updated but rejection inventory update failed.");
        }
      }
 
      // === Update Warehouse Quantities ===
      if (
        dailyTracking[0]?.produced > 0 &&
        selectedSection?.data[0]?.warehouseId
      ) {
        const producedQty = Number(dailyTracking[0].produced) || 0;
        const currentWarehouseId = selectedSection.data[0].warehouseId;
        const nextWarehouseId =
          sections[selectedSectionIndex + 1]?.data?.[0]?.warehouseId ||
          (sections[selectedSectionIndex + 1] ? null : "Store");
 
        try {
          const nextIsSpecialDay =
            sections[selectedSectionIndex + 1]?.isSpecialDay === true;
 
          if (nextWarehouseId && !nextIsSpecialDay) {
            // === Transfer to next warehouse ===
            const transferRes = await axios.put(
              `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/transfer-warehouse-quantity`,
              {
                toWarehouseId: currentWarehouseId,
                fromWarehouseId: nextWarehouseId,
                quantity: producedQty,
              }
            );
 
            if (transferRes.data?.success) {
              setToWarehouseData((prev) => ({
                ...(prev || {}),
                quantity: [
                  Math.max(0, (prev?.quantity?.[0] ?? 0) - producedQty),
                ],
              }));
              setFromWarehouseData((prev) => ({
                ...(prev || {}),
                quantity: [(prev?.quantity?.[0] ?? 0) + producedQty],
              }));
              toast.success("Warehouse quantities transferred successfully");
            }
          } else {
            // === Update Store or special-day warehouse ===
            const decRes = await axios.put(
              `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/update-warehouse-quantity`,
              {
                warehouseId: currentWarehouseId,
                quantityToReduce: producedQty,
              }
            );
 
            if (decRes.data?.success) {
              setToWarehouseData((prev) => ({
                ...(prev || {}),
                quantity: [
                  Math.max(0, (prev?.quantity?.[0] ?? 0) - producedQty),
                ],
              }));
 
              if (!nextWarehouseId) {
                await axios.put(
                  `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/increment-warehouse-quantity`,
                  {
                    warehouseId: "STORE",
                    quantityToAdd: producedQty,
                  }
                );
 
                setFromWarehouseData((prev) => ({
                  ...(prev || {}),
                  quantity: [(prev?.quantity?.[0] ?? 0) + producedQty],
                }));
                toast.success("Store warehouse updated with produced quantity");
              } else if (nextIsSpecialDay) {
                await axios.put(
                  `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/increment-warehouse-quantity`,
                  {
                    warehouseId: nextWarehouseId,
                    quantityToAdd: producedQty,
                  }
                );
 
                setFromWarehouseData((prev) => ({
                  ...(prev || {}),
                  quantity: [(prev?.quantity?.[0] ?? 0) + producedQty],
                }));
                toast.success("Next process warehouse updated (special day)");
              }
            }
          }
        } catch (warehouseError) {
          console.error("Error updating warehouse quantities:", warehouseError);
          toast.warning(
            "Daily tracking updated but warehouse quantity update failed."
          );
        }
      }
 
      // === Callback for parent ===
      if (onUpdateAllocaitonStatus) {
        onUpdateAllocaitonStatus(response.data);
      }
 
      toast.success("Daily Tracking Updated Successfully!");
 
      // === Fetch latest daily tracking after save ===
      const updatedResponse = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/allocations/${allocationId}/allocations/${trackingId}/dailyTracking`
      );
 
      setExistingDailyTracking(updatedResponse.data.dailyTracking || []);
      setactulEndDateData(updatedResponse.data);
 
      // === Reset form ===
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

  // Helper to get the part code (Itemcode) for the selected part
  const getSelectedPartCode = () => {
    // Try to get from selectedSection, fallback to partManufacturingVariables
    return (
      selectedSection?.data?.[0]?.machineId ||
      selectedSection?.data?.[0]?.partCode ||
      null
    );
  };

  // Helper to fetch store by category id
  const fetchStoreByCategoryId = async (categoryId) => {
    const res = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/api/storesVariable/category/${categoryId}`
    );
    return res.data;
  };

  // Helper to fetch Store warehouse data (for last process)
  const fetchStoreWarehouseData = async () => {
    try {
      // Fetch all warehouses and find the Store warehouse
      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/storesVariable`
      );
      const storeWarehouse = res.data.find((wh) => wh.categoryId === "STORE");

      if (storeWarehouse) {
        setStoreWarehouseData(storeWarehouse);
        return storeWarehouse;
      } else {
        // Fallback if Store warehouse not found
        const defaultStoreData = {
          categoryId: "STORE",
          Name: ["STORE"],
          location: ["Store Location"],
          quantity: [0],
        };
        setStoreWarehouseData(defaultStoreData);
        return defaultStoreData;
      }
    } catch (error) {
      console.error("Error fetching Store warehouse data:", error);
      // Set default Store warehouse data if fetch fails
      const defaultStoreData = {
        categoryId: "STORE",
        Name: ["STORE"],
        location: ["Store Location"],
        quantity: [0],
      };
      setStoreWarehouseData(defaultStoreData);
      return defaultStoreData;
    }
  };

  // Helpers to update Yes/No status for Goods Issue and Goods Receipt
  const updateIssueStatuses = (dataArray) => {
    setIssueStatus((prev) => {
      const next = { ...prev };
      (dataArray || []).forEach((entry) => {
        const key = String(entry.Itemcode).trim();
        const qty = Number(entry.Quantity) || 0;
        // Mark status as Yes whenever we have a matching issue entry
        next[key] = { lastQty: qty, status: "Yes" };
      });
      return next;
    });
  };

  const updateReceiptStatuses = (dataArray) => {
    setReceiptStatus((prev) => {
      const next = { ...prev };
      (dataArray || []).forEach((entry) => {
        const key = String(entry.Itemcode).trim();
        const qty = Number(entry.Quantity) || 0;
        // Mark status as Yes whenever we have a matching receipt entry
        next[key] = { lastQty: qty, status: "Yes" };
      });
      return next;
    });
  };

  // Auto-refresh Goods Issue/Receipt every 10 minutes while Job Work modal is open
  useEffect(() => {
    const fetchGoodsMovement = async () => {
      try {
        const [issueRes, receiptRes] = await Promise.all([
          axios.get(
            `${process.env.REACT_APP_BASE_URL}/api/GoodsIssue/GetGoodsIssue`
          ),
          axios.get(
            `${process.env.REACT_APP_BASE_URL}/api/GoodsReceipt/GetGoodsReceipt`
          ),
        ]);
        const issueList = issueRes.data || [];
        const receiptList = receiptRes.data || [];
        setGoodsIssueData(issueList);
        setGoodsReceiptDataModal(receiptList);
        updateIssueStatuses(issueList);
        updateReceiptStatuses(receiptList);
        // Attempt auto-posting to daily tracking for Job Work
        await syncJobWorkToDailyTracking(issueList, receiptList);
      } catch (e) {
        console.error("Auto-refresh goods movement failed", e);
      }
    };

    if (jobWorkModal) {
      // immediate fetch on open
      fetchGoodsMovement();
      // start interval
      if (!jobWorkIntervalRef.current) {
        jobWorkIntervalRef.current = setInterval(
          fetchGoodsMovement,
          1 * 60 * 1000
        );
      }
    } else {
      if (jobWorkIntervalRef.current) {
        clearInterval(jobWorkIntervalRef.current);
        jobWorkIntervalRef.current = null;
      }
    }

    return () => {
      if (jobWorkIntervalRef.current) {
        clearInterval(jobWorkIntervalRef.current);
        jobWorkIntervalRef.current = null;
      }
    };
  }, [jobWorkModal]);

  // When opening Job Work modal, ensure existing daily tracking is loaded for deduplication
  useEffect(() => {
    const loadExistingDailyForJobWork = async () => {
      try {
        if (
          !jobWorkModal ||
          !selectedSection?.allocationId ||
          !selectedSection?.data?.[0]?.trackingId
        )
          return;
        const allocationId = selectedSection.allocationId;
        const trackingId = selectedSection.data[0].trackingId;
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/allocations/${allocationId}/allocations/${trackingId}/dailyTracking`
        );
        setExistingDailyTracking(res.data.dailyTracking || []);
        setactulEndDateData(res.data);
      } catch (e) {
        console.error("Failed to load existing daily tracking for Job Work", e);
      }
    };
    loadExistingDailyForJobWork();
  }, [jobWorkModal, selectedSection]);

  // Determine current (To) and next (From) warehouses when selection changes
  useEffect(() => {
    const loadWarehouses = async () => {
      try {
        if (!selectedSection?.data?.[0]) return;

        // Current selection (To warehouse)
        const currentWareHouseStr = selectedSection.data[0].wareHouse; // e.g., "01 - General Warehouse"
        const currentWarehouseId = selectedSection.data[0].warehouseId; // category id string for API
        setToWarehouseId(currentWarehouseId || null);

        if (currentWareHouseStr) {
          const currentCategoryId = currentWareHouseStr.split(" - ")[0];
          try {
            const toData = await fetchStoreByCategoryId(currentCategoryId);
            setToWarehouseData(toData);
          } catch (e) {
            setToWarehouseData({
              categoryId: currentCategoryId,
              quantity: [0],
            });
          }
        } else {
          setToWarehouseData(null);
        }

        // Next process (From warehouse)
        if (
          selectedSectionIndex !== null &&
          Array.isArray(sections) &&
          sections[selectedSectionIndex + 1]?.data?.[0]
        ) {
          const nextRow = sections[selectedSectionIndex + 1].data[0];
          const nextWareHouseStr = nextRow.wareHouse;
          const nextWarehouseId = nextRow.warehouseId;
          setFromWarehouseId(nextWarehouseId || null);

          if (nextWareHouseStr) {
            const nextCategoryId = nextWareHouseStr.split(" - ")[0];
            try {
              const fromData = await fetchStoreByCategoryId(nextCategoryId);
              setFromWarehouseData(fromData);
            } catch (e) {
              setFromWarehouseData({
                categoryId: nextCategoryId,
                quantity: [0],
              });
            }
          } else {
            setFromWarehouseData(null);
          }
        } else {
          // No next process (last process) - use Store warehouse
          setFromWarehouseId("STORE");
          try {
            const storeData = await fetchStoreWarehouseData();
            setFromWarehouseData(storeData);
          } catch (e) {
            setFromWarehouseData({
              categoryId: "STORE",
              Name: ["STORE"],
              location: ["Store Location"],
              quantity: [0],
            });
          }
        }
      } catch (err) {
        console.error("Error loading warehouses:", err);
      }
    };
    loadWarehouses();
  }, [selectedSection, selectedSectionIndex, sections]);

  const getProcessSpecialDayInfo = (processName, categoryId) => {
    const processInfo = partManufacturingVariables?.find(
      (mv) => mv.name === processName && mv.categoryId === categoryId
    );
    return processInfo || null;
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
                                {section.title} -
                                {section.isSpecialDay && (
                                  <span
                                    style={{
                                      color: "#dc2626",
                                      fontWeight: "700",
                                      fontSize: "0.8rem",
                                      marginLeft: "4px",
                                    }}
                                  >
                                    (Job Work)
                                  </span>
                                )}
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
                                  {(() => {
                                    const produced =
                                      getSectionProducedTotal(section);
                                    const plannedQty =
                                      section.data[0]?.plannedQty || 0;
                                    return `${produced}/${plannedQty}`;
                                  })()}
                                </span>
                                <span style={{ color: "#64748b" }}>
                                  produced/planned
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
                            // border:"2",
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
                                      Production Quantity Progress
                                    </label>
                                    <div
                                      style={{
                                        fontSize: "0.875rem",
                                        padding: "0.5rem",
                                        backgroundColor: "#f8fafc",
                                        borderRadius: "6px",
                                      }}
                                    >
                                      {(() => {
                                        const produced =
                                          producedTotalsByTrackingId[
                                            row.trackingId
                                          ] || 0;
                                        const plannedQty = row.plannedQty || 0;
                                        return `${produced}/${plannedQty}`;
                                      })()}
                                    </div>
                                  </div>

                                  {/* Dates */}
                                  <div
                                    style={{
                                      backgroundColor: "#FAFFFF",
                                      borderRadius: "8px",
                                      padding: ".5rem",
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
                                          Start Date & Time :
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
                                          {row.startTime || row.endTime ? (
                                            <span
                                              style={{
                                                color: "#64748b",
                                                marginLeft: "6px",
                                              }}
                                            >
                                              {row.startTime || "--:--"}
                                              {/* {row.endTime || "--:--"} */}
                                            </span>
                                          ) : null}
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
                                          End Date & Time :
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
                                          {row.startTime || row.endTime ? (
                                            <span
                                              style={{
                                                color: "#64748b",
                                                marginLeft: "6px",
                                              }}
                                            >
                                              {row.endTime || "--:--"}
                                            </span>
                                          ) : null}
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
                                      {row.shift}{" "}
                                      {/* {row.startTime || row.endTime ? (
                                        <span
                                          style={{
                                            color: "#64748b",
                                            marginLeft: "6px",
                                          }}
                                        >
                                          ({row.startTime || "--:--"} -{" "}
                                          {row.endTime || "--:--"})
                                        </span>
                                      ) : null} */}
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
                                        wordBreak: "break-word",
                                        // maxWidth: "8ch",
                                        whiteSpace: "normal",
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
                                    color="primary"
                                    onClick={() => {
                                      setSelectedSection({
                                        ...section,
                                        data: [row],
                                      });
                                      setSelectedSectionIndex(index);
                                      setJobWorkModal(true);
                                    }}
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
                                    Update Job Work
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
                      textDecoration: "none",
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
                      {toWarehouseData?.quantity?.[0] ?? "N/A"}
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
                    <div style={{ fontSize: "14px" }}>
                      {sections[selectedSectionIndex + 1]?.data?.[0]
                        ?.wareHouse ||
                        (sections[selectedSectionIndex + 1]
                          ? "N/A"
                          : storeWarehouseData?.Name?.[0] || "STORE")}
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
                      {sections[selectedSectionIndex + 1]?.data?.[0]
                        ?.warehouseId
                        ? fromWarehouseData?.quantity?.[0] ?? "N/A"
                        : storeWarehouseData?.quantity?.[0] ?? 0}
                    </p>
                  </Col>
                </Row>
              </Container>
            </Col>
          </Row>
        </Container>
        <ModalBody className="mt-3 p-1">
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 style={{ margin: 0 }}>Production Tracking Summary</h5>
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

            {/* Production Summary Card */}
            <div
              className="card mb-3"
              style={{
                backgroundColor: "#f8f9fa",
                border: "1px solid #dee2e6",
              }}
            >
              <div className="card-body">
                <h6 className="card-title mb-3">Production Overview</h6>
                <div className="row">
                  <div className="col-md-3">
                    <strong>Project:</strong>{" "}
                    {sections[0]?.projectName || "N/A"}
                  </div>
                  <div className="col-md-3">
                    <strong>Part Name:</strong> {partName || "N/A"}
                  </div>
                  <div className="col-md-3">
                    <strong>Process:</strong> {selectedSection?.title || "N/A"}
                  </div>
                  <div className="col-md-3">
                    <strong>Machine:</strong>{" "}
                    {selectedSection?.data[0]?.machineId || "N/A"}
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-md-3">
                    <strong>Operator:</strong>{" "}
                    {selectedSection?.data[0]?.operator || "N/A"}
                  </div>
                  <div className="col-md-3">
                    <strong>Shift:</strong>{" "}
                    {selectedSection?.data[0]?.shift || "N/A"}
                  </div>
                  <div className="col-md-3">
                    <strong>From WH:</strong>{" "}
                    {selectedSection?.data[0]?.wareHouse || "N/A"}
                  </div>
                  <div className="col-md-3">
                    <strong>To WH:</strong>{" "}
                    {sections[selectedSectionIndex + 1]?.data?.[0]?.wareHouse ||
                      (sections[selectedSectionIndex + 1]
                        ? "N/A"
                        : fromWarehouseData?.Name?.[0] || "Store")}
                  </div>
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-striped vertical-lines horizontals-lines">
                <thead style={{ backgroundColor: "#f3f4f6" }}>
                  {/* Date, Plan, Produced, Rejection, Status, Remaining, Machine, Shift, Operator. */}
                  <tr>
                    <th>Date</th>
                    <th>Planned</th>
                    <th>Produced</th>
                    {/* <th>From WH</th> */}
                    {/* <th>From WH Qty</th> */}
                    {/* <th>From WH Remaining</th> */}
                    {/* <th>To WH</th> */}
                    {/* <th>To WH Qty</th> */}
                    {/* <th>To WH Remaining</th> */}
                    <th>Rejection</th>
                    <th>Status</th>
                    <th>Remaining</th>
                    <th>Machine</th>
                    <th>Shift</th>
                    <th>Operator</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {!existingDailyTracking.length ? (
                    <tr>
                      <td colSpan="14" className="text-center">
                        No daily tracking data available
                      </td>
                    </tr>
                  ) : (
                    existingDailyTracking.map((task, index) => (
                      <tr key={index}>
                        <td>{moment(task.date).format("DD MMM YYYY")}</td>
                        <td>{task.planned || 0}</td>
                        <td>{task.produced || 0}</td>
                        {/* <td>{task.fromWarehouse || "N/A"}</td> */}
                        {/* <td>{task.fromWarehouseQty || 0}</td> */}
                        {/* <td>{task.fromWarehouseRemainingQty || 0}</td> */}
                        {/* <td>{task.toWarehouse || "N/A"}</td> */}
                        {/* <td>{task.toWarehouseQty || 0}</td> */}
                        {/* <td>{task.toWarehouseRemainingQty || 0}</td> */}
                        <td>{task.rejectedWarehouseQuantity || 0}</td>
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
                        <td>{task.planned - task.produced}</td>
                        <td>{task.machineId || "N/A"}</td>
                        <td>{task.shift || "N/A"}</td>
                        <td>{task.operator || "N/A"}</td>
                        <td
                          className="remarks-cell"
                          title={task.remarks || "No remarks"}
                        >
                          {task.remarks || "-"}
                        </td>
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

            {/* Status and Operator Row */}
            <Row className="mb-3">
              <Col md={6}>
                <div className="form-group">
                  <label>Status</label>
                  {dailyTracking.length > 0 &&
                    dailyTracking[0].produced !== undefined &&
                    dailyTracking[0].planned !== undefined && (
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
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
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

                          if (produced === planned) {
                            return (
                              <span className="text-primary">On Track</span>
                            );
                          } else if (produced > planned) {
                            return <span className="text-success">Ahead</span>;
                          } else {
                            return <span className="text-danger">Delayed</span>;
                          }
                        })()}
                      </div>
                    )}
                </div>
              </Col>
              <Col md={6}>
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
              </Col>
            </Row>

            {/* Produced and Rejection Row */}
            <Row className="mb-3">
              <Col md={6}>
                <div
                  style={{
                    border: "2px solid #e2e8f0",
                    backgroundColor: "#eff6ff",
                    padding: "16px",
                    borderRadius: "5px",
                    height: "160px", // Fixed height for consistency
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
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
                        fontWeight: "900",
                        fontSize: "16px",
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
                    max={(() => {
                      const availableFromPrevious =
                        getAvailableQuantityFromPreviousProcess(
                          selectedSectionIndex
                        );
                      const currentProduced =
                        getCurrentProcessProducedQuantity(selectedSection);
                      const availableFromPrev =
                        availableFromPrevious - currentProduced;

                      const warehouseLimit =
                        toWarehouseData?.quantity?.[0] != null
                          ? Math.min(
                              calculateRemainingQuantity(),
                              toWarehouseData.quantity[0]
                            )
                          : calculateRemainingQuantity();

                      return Math.min(
                        availableFromPrev,
                        warehouseLimit,
                        calculateRemainingQuantity()
                      );
                    })()}
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
                  {/* <p
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
                    Max allowed:{" "}
                    {toWarehouseData?.quantity?.[0] != null
                      ? Math.min(
                          calculateRemainingQuantity(),
                          toWarehouseData.quantity[0]
                        )
                      : calculateRemainingQuantity()}{" "}
                    units
                  </p> */}
                  {/* // In the produced quantity input section, update the max
                  attribute and info text: */}
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
                    Max allowed:{" "}
                    {(() => {
                      const availableFromPrevious =
                        getAvailableQuantityFromPreviousProcess(
                          selectedSectionIndex
                        );
                      const currentProduced =
                        getCurrentProcessProducedQuantity(selectedSection);
                      const availableFromPrev =
                        availableFromPrevious - currentProduced;

                      const warehouseLimit =
                        toWarehouseData?.quantity?.[0] != null
                          ? Math.min(
                              calculateRemainingQuantity(),
                              toWarehouseData.quantity[0]
                            )
                          : calculateRemainingQuantity();

                      // The actual limit is the minimum of all constraints
                      const actualMax = Math.min(
                        availableFromPrev,
                        warehouseLimit,
                        calculateRemainingQuantity()
                      );

                      const previousSection =
                        selectedSectionIndex > 0
                          ? sections[selectedSectionIndex - 1]
                          : null;
                      const isPreviousJobWork = previousSection?.isSpecialDay;

                      if (isPreviousJobWork) {
                        return `${actualMax} units (Job Work receipt: ${availableFromPrevious})`;
                      } else {
                        return `${actualMax} units (Previous process: ${availableFromPrevious})`;
                      }
                    })()}
                  </p>
                </div>
              </Col>

              {/* Rejection Section - Combined Warehouse and Quantity */}
              <Col md={6}>
                <div
                  style={{
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#fff0eb",
                    padding: "16px",
                    borderRadius: "5px",
                    height: "160px", // Fixed height to match produced quantity
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
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
                    <CiCircleInfo size={20} color="#e53e3e" />
                    <span
                      style={{
                        fontWeight: "900",
                        fontSize: "16px",
                        color: "#e53e3e",
                      }}
                    >
                      Rejection
                    </span>
                  </p>

                  {/* Rejection Warehouse Dropdown */}
                  <div className="form-group" style={{ marginBottom: "8px" }}>
                    <select
                      className="form-control"
                      value={dailyTracking[0]?.rejectedWarehouseId || ""}
                      onChange={(e) => {
                        const selectedWarehouse = rejectionWarehouses.find(
                          (w) => w._id === e.target.value
                        );
                        handleDailyTrackingChange(
                          0,
                          "rejectedWarehouseId",
                          e.target.value
                        );
                        handleDailyTrackingChange(
                          0,
                          "rejectedWarehouse",
                          selectedWarehouse ? selectedWarehouse.Name[0] : ""
                        );
                      }}
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "2px solid #e2e8f0",
                        borderRadius: "4px",
                        boxSizing: "border-box",
                        fontWeight: "semibold",
                        fontSize: "15px",
                        color: "#e53e3eb",
                      }}
                    >
                      {rejectionWarehouses.map((warehouse) => (
                        <option
                          key={warehouse._id}
                          value={`${warehouse.categoryId}-${warehouse._id}`}
                        >
                          {warehouse.categoryId} - {warehouse.Name[0]} - Current
                          Qty: {warehouse.quantity[0]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rejection Quantity Input */}
                  <div className="form-group">
                    <input
                      type="number"
                      className="form-control"
                      value={dailyTracking[0]?.rejectedWarehouseQuantity || ""}
                      placeholder="Enter Rejection Quantity"
                      onChange={(e) =>
                        handleDailyTrackingChange(
                          0,
                          "rejectedWarehouseQuantity",
                          e.target.value
                        )
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
                        border: "2px solid #e2e8f0",
                        borderRadius: "4px",
                        boxSizing: "border-box",
                        fontWeight: "semibold",
                        fontSize: "15px",
                        color: "#e53e3eb",
                        marginTop: ".50rem",
                      }}
                    />
                  </div>

                  <p
                    style={{
                      margin: "4px 0 0 0",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "#e53e3e",
                      fontSize: "12px",
                    }}
                  >
                    {/* <CiCircleInfo size={16} color="#e53e3e" />
                    Track rejected items separately */}
                  </p>
                </div>
              </Col>
            </Row>

            {/* Separate Remarks Section */}
            <Container
              style={{
                // backgroundColor: "#e8f5e8",
                padding: "20px",
                borderRadius: "8px",
                marginTop: "15px",
                border: "2px solid #e2e8f0",
              }}
            >
              <h4
                style={{
                  fontWeight: "600",
                  marginBottom: "20px",
                  fontSize: "18px",
                  // color: "#22543d",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <CiCircleInfo size={20} />
                Remarks
              </h4>

              <Row className="mb-3">
                <Col md={12}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <textarea
                      className="form-control"
                      value={dailyTracking[0]?.remarks || ""}
                      placeholder="Enter general remarks or notes about production"
                      onChange={(e) =>
                        handleDailyTrackingChange(0, "remarks", e.target.value)
                      }
                      rows="3"
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "2px solid #e2e8f0",
                        borderRadius: "4px",
                        // backgroundColor: "#f0fff4",
                        fontSize: "14px",
                        // color: "#22543d",
                        resize: "vertical",
                      }}
                    />
                  </div>
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
                          textDecoration: "none",
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
                              {toWarehouseData?.quantity?.[0] ?? "N/A"}
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
                                Will be reduced by {dailyTracking[0]?.produced}{" "}
                                units
                              </span>
                              <br />
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
                              <div
                                style={{
                                  backgroundColor:
                                    warning.type === "error"
                                      ? "#f8d7da"
                                      : "#fff3cd",
                                  border: `1px solid ${
                                    warning.type === "error"
                                      ? "#f5c6cb"
                                      : "#ffeaa7"
                                  }`,
                                  borderRadius: "6px",
                                  padding: "10px",
                                  color:
                                    warning.type === "error"
                                      ? "#721c24"
                                      : "#856404",
                                }}
                              >
                                <i
                                  className={`ri-${
                                    warning.type === "error"
                                      ? "error-warning"
                                      : "alert"
                                  }-line me-2`}
                                ></i>
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
                          {sections[selectedSectionIndex + 1]?.data?.[0]
                            ?.wareHouse ||
                            (sections[selectedSectionIndex + 1]
                              ? "N/A"
                              : storeWarehouseData?.Name?.[0] || "STORE")}
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
                              {sections[selectedSectionIndex + 1]?.data?.[0]
                                ?.warehouseId
                                ? fromWarehouseData?.quantity?.[0] ?? "N/A"
                                : storeWarehouseData?.quantity?.[0] ?? 0}
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
                  {`${
                    sections[selectedSectionIndex + 1]?.data?.[0]?.wareHouse ||
                    (sections[selectedSectionIndex + 1]
                      ? "N/A"
                      : storeWarehouseData?.Name?.[0] || "STORE")
                  }`}{" "}
                  (Quantity:{" "}
                  {sections[selectedSectionIndex + 1]?.data?.[0]?.warehouseId
                    ? (fromWarehouseData?.quantity?.[0] ?? 0) +
                      (warehouseChanges.toWarehouseChange || 0)
                    : (storeWarehouseData?.quantity?.[0] ?? 0) +
                      (warehouseChanges.toWarehouseChange || 0)}
                  )
                </Col>
              </Row>

              {/* Add warehouse quantity change summary */}
              {dailyTracking[0]?.produced > 0 && (
                <Row className="mb-2">
                  <Col md={12}>
                    <div
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "15px",
                        borderRadius: "8px",
                        border: "1px solid #dee2e6",
                      }}
                    >
                      <h6 style={{ color: "#495057", marginBottom: "10px" }}>
                        <i className="ri-information-line me-2"></i>
                        Warehouse Quantity Changes
                      </h6>
                      <Row>
                        <Col md={6}>
                          <strong style={{ color: "#dc3545" }}>
                            From Warehouse:
                          </strong>
                          <br />
                          <span style={{ color: "#dc3545" }}>
                            {toWarehouseData?.quantity?.[0] ?? 0} →{" "}
                            {Math.max(
                              0,
                              (toWarehouseData?.quantity?.[0] ?? 0) +
                                (warehouseChanges.fromWarehouseChange || 0)
                            )}
                          </span>
                          <br />
                          <small style={{ color: "#6c757d" }}>
                            ({warehouseChanges.fromWarehouseChange || 0} units)
                          </small>
                        </Col>
                        <Col md={6}>
                          <strong style={{ color: "#198754" }}>
                            To Warehouse:
                          </strong>
                          <br />
                          <span style={{ color: "#198754" }}>
                            {sections[selectedSectionIndex + 1]?.data?.[0]
                              ?.warehouseId
                              ? fromWarehouseData?.quantity?.[0] ?? "N/A"
                              : storeWarehouseData?.quantity?.[0] ?? 0}{" "}
                            →{" "}
                            {sections[selectedSectionIndex + 1]?.data?.[0]
                              ?.warehouseId
                              ? (fromWarehouseData?.quantity?.[0] ?? 0) +
                                (warehouseChanges.toWarehouseChange || 0)
                              : (storeWarehouseData?.quantity?.[0] ?? 0) +
                                (warehouseChanges.toWarehouseChange || 0)}
                          </span>
                          <br />
                          <small style={{ color: "#6c757d" }}>
                            (+{warehouseChanges.toWarehouseChange || 0} units)
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

      {/* Job Work Modal for Special Day processes */}
      <Modal
        isOpen={jobWorkModal}
        toggle={() => setJobWorkModal(false)}
        style={{
          maxWidth: "80vw",
          width: "100%",
          margin: "auto",
        }}
      >
        <ModalHeader toggle={() => setJobWorkModal(false)}>
          Update Job Work
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="m-0">Goods Movement Overview</h6>
              <Button
                color="link"
                onClick={async () => {
                  try {
                    setJobWorkLoading(true);
                    const [issueRes, receiptRes] = await Promise.all([
                      axios.get(
                        `${process.env.REACT_APP_BASE_URL}/api/GoodsIssue/GetGoodsIssue`
                      ),
                      axios.get(
                        `${process.env.REACT_APP_BASE_URL}/api/GoodsReceipt/GetGoodsReceipt`
                      ),
                    ]);
                    const issueList = issueRes.data || [];
                    const receiptList = receiptRes.data || [];
                    setGoodsIssueData(issueList);
                    setGoodsReceiptDataModal(receiptList);
                    updateIssueStatuses(issueList);
                    updateReceiptStatuses(receiptList);
                    toast.success("Fetched latest Goods Issue/Receipt");
                  } catch (e) {
                    console.error(e);
                    toast.error("Failed to fetch Goods Issue/Receipt");
                  } finally {
                    setJobWorkLoading(false);
                  }
                }}
                disabled={jobWorkLoading}
              >
                {jobWorkLoading ? "Loading..." : "Refresh"}
              </Button>
            </div>
            {/* Split Project and Item details into two columns */}
            <div className="row mt-2">
              <div className="col-md-6">
                <div
                  style={{
                    backgroundColor: "#fefce8",
                    padding: "15px",
                    borderRadius: "8px",
                    border: "2px solid #facc15",
                    height: "100%",
                  }}
                >
                  <h6
                    style={{
                      fontWeight: "600",
                      marginBottom: "10px",
                      fontSize: "14px",
                      color: "#2d3748",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <FaWarehouse size={16} color="#f59e0b" />
                    From Warehouse
                  </h6>
                  <div className="mb-2">
                    <strong>Project:</strong>
                    <br />
                    {projectNameState || sections[0]?.projectName || "N/A"}
                  </div>
                  <div className="mb-2">
                    <strong>Warehouse Name:</strong>
                    <br />
                    {selectedSection?.data?.[0]?.wareHouse || "N/A"}
                  </div>
                  <div>
                    <strong>Warehouse ID:</strong>
                    <br />
                    {selectedSection?.data?.[0]?.warehouseId || "N/A"}
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div
                  style={{
                    backgroundColor: "#f0fdf4",
                    padding: "15px",
                    borderRadius: "8px",
                    border: "2px solid #86efac",
                    height: "100%",
                  }}
                >
                  <h6
                    style={{
                      fontWeight: "600",
                      marginBottom: "10px",
                      fontSize: "14px",
                      color: "#2d3748",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <FaWarehouse size={16} color="#10b981" />
                    To Warehouse
                  </h6>
                  <div className="mb-2">
                    <strong>Item Code:</strong>
                    <br />
                    {selectedSection?.data?.[0]?.partsCodeId ||
                      sections[selectedSectionIndex]?.data?.[0]?.partsCodeId ||
                      "N/A"}
                  </div>
                  <div className="mb-2">
                    <strong>Warehouse Name:</strong>
                    <br />
                    {sections[selectedSectionIndex + 1]?.data?.[0]?.wareHouse ||
                      (sections[selectedSectionIndex + 1]
                        ? "N/A"
                        : storeWarehouseData?.Name?.[0] || "STORE")}
                  </div>
                  <div>
                    <strong>Warehouse ID:</strong>
                    <br />
                    {sections[selectedSectionIndex + 1]?.data?.[0]
                      ?.warehouseId ||
                      (sections[selectedSectionIndex + 1] ? "N/A" : "STORE")}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <Alert color="info">
                For Job Work processes, quantities are deducted from current
                warehouse when issued. They are automatically forwarded to the
                next process warehouse after receipt is detected (checked about
                every ~1 minute). You can also trigger sync now.
              </Alert>
            </div>
            <div className="mt-2 d-flex gap-2">
              <Button
                color="primary"
                onClick={async () => {
                  try {
                    const body = {
                      partsCodeId:
                        selectedSection?.data?.[0]?.partsCodeId || null,
                      currentWarehouseId:
                        selectedSection?.data?.[0]?.warehouseId || null,
                      nextWarehouseId:
                        sections[selectedSectionIndex + 1]?.data?.[0]
                          ?.warehouseId || null,
                      productionNo:
                        projectNameState || sections[0]?.projectName || null,
                    };
                    if (
                      !body.partsCodeId ||
                      !body.currentWarehouseId ||
                      !body.nextWarehouseId
                    ) {
                      toast.error("Missing warehouses or part code");
                      return;
                    }
                    await axios.post(
                      `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/special-day-sync`,
                      body
                    );
                    toast.success("Sync triggered successfully");
                    await refreshWarehouseData();
                  } catch (e) {
                    console.error(e);
                    toast.error("Failed to trigger sync");
                  }
                }}
              >
                Sync Now
              </Button>
              <Button color="secondary" onClick={() => setJobWorkModal(false)}>
                Close
              </Button>
            </div>
          </div>
          {/* Simple preview of matched Issue/Receipt for this part */}
          {/* Split Goods Movement Data into two columns */}
          <div className="row">
            {/* From Warehouse - Goods Issue Data */}
            <div className="col-md-6">
              <div
                style={{
                  backgroundColor: "#fefce8",
                  padding: "20px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                  border: "2px solid #facc15",
                  height: "100%",
                }}
              >
                <h6
                  style={{
                    fontWeight: "600",
                    marginBottom: "15px",
                    fontSize: "16px",
                    color: "#2d3748",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FaWarehouse size={18} color="#f59e0b" />
                  From Warehouse - Goods Issue
                </h6>

                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead style={{ backgroundColor: "#fef3c7" }}>
                      <tr>
                        <th>Itemcode</th>
                        <th>WhsCode</th>
                        <th>Quantity</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {goodsIssueData
                        .filter((g) => {
                          const matchProd =
                            (g.ProductionNo || "")
                              .toString()
                              .trim()
                              .toLowerCase() ===
                            (projectNameState || sections[0]?.projectName || "")
                              .toString()
                              .trim()
                              .toLowerCase();
                          const matchItem =
                            String(g.Itemcode).trim() ===
                            String(
                              selectedSection?.data?.[0]?.partsCodeId || ""
                            );
                          return matchProd && matchItem;
                        })
                        .slice(0, 5)
                        .map((g, i) => (
                          <tr key={`gi-${i}`}>
                            <td>
                              <strong>{g.Itemcode}</strong>
                            </td>
                            <td>{g.WhsCode}</td>
                            <td>
                              <span
                                style={{ color: "#dc3545", fontWeight: "bold" }}
                              >
                                {g.Quantity}
                              </span>
                            </td>
                            <td>
                              <span
                                className="badge"
                                style={{
                                  backgroundColor:
                                    issueStatus[String(g.Itemcode)?.trim()]
                                      ?.status === "Yes"
                                      ? "#198754"
                                      : "#6c757d",
                                  color: "white",
                                }}
                              >
                                {issueStatus[String(g.Itemcode)?.trim()]
                                  ?.status || "Yes"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      {goodsIssueData.filter((g) => {
                        const matchProd =
                          (g.ProductionNo || "")
                            .toString()
                            .trim()
                            .toLowerCase() ===
                          (projectNameState || sections[0]?.projectName || "")
                            .toString()
                            .trim()
                            .toLowerCase();
                        const matchItem =
                          String(g.Itemcode).trim() ===
                          String(selectedSection?.data?.[0]?.partsCodeId || "");
                        return matchProd && matchItem;
                      }).length === 0 && (
                        <tr>
                          <td
                            colSpan="4"
                            className="text-center text-muted py-3"
                          >
                            <i>No goods issue data found</i>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* To Warehouse - Goods Receipt Data */}
            <div className="col-md-6">
              <div
                style={{
                  backgroundColor: "#f0fdf4",
                  padding: "20px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                  border: "2px solid #86efac",
                  height: "100%",
                }}
              >
                <h6
                  style={{
                    fontWeight: "600",
                    marginBottom: "15px",
                    fontSize: "16px",
                    color: "#2d3748",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FaWarehouse size={18} color="#10b981" />
                  To Warehouse - Goods Receipt
                </h6>

                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead style={{ backgroundColor: "#dcfce7" }}>
                      <tr>
                        <th>Itemcode</th>
                        <th>WhsCode</th>
                        <th>Quantity</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {goodsReceiptDataModal
                        .filter((g) => {
                          const matchProd =
                            (g.ProductionNo || "")
                              .toString()
                              .trim()
                              .toLowerCase() ===
                            (projectNameState || sections[0]?.projectName || "")
                              .toString()
                              .trim()
                              .toLowerCase();
                          const matchItem =
                            String(g.Itemcode).trim() ===
                            String(
                              selectedSection?.data?.[0]?.partsCodeId || ""
                            );
                          return matchProd && matchItem;
                        })
                        .slice(0, 5)
                        .map((g, i) => (
                          <tr key={`gr-${i}`}>
                            <td>
                              <strong>{g.Itemcode}</strong>
                            </td>
                            <td>{g.WhsCode}</td>
                            <td>
                              <span
                                style={{ color: "#198754", fontWeight: "bold" }}
                              >
                                {Number(g.Quantity)}
                              </span>
                            </td>
                            <td>
                              <span
                                className="badge"
                                style={{
                                  backgroundColor:
                                    receiptStatus[String(g.Itemcode)?.trim()]
                                      ?.status === "Yes"
                                      ? "#198754"
                                      : "#6c757d",
                                  color: "white",
                                }}
                              >
                                {receiptStatus[String(g.Itemcode)?.trim()]
                                  ?.status || "Yes"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      {goodsReceiptDataModal.filter((g) => {
                        const matchProd =
                          (g.ProductionNo || "")
                            .toString()
                            .trim()
                            .toLowerCase() ===
                          (projectNameState || sections[0]?.projectName || "")
                            .toString()
                            .trim()
                            .toLowerCase();
                        const matchItem =
                          String(g.Itemcode).trim() ===
                          String(selectedSection?.data?.[0]?.partsCodeId || "");
                        return matchProd && matchItem;
                      }).length === 0 && (
                        <tr>
                          <td
                            colSpan="4"
                            className="text-center text-muted py-3"
                          >
                            <i>No goods receipt data found</i>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};
