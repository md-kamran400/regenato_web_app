// react imports
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
} from "react";
const AddProductionOrderWithPart = React.lazy(() =>
  import("./ListReusableModals/AddProductionOrderWithPart")
);
const EditModal = React.lazy(() => import("./ListReusableModals/EditModal"));
const DeleteModal = React.lazy(() =>
  import("./ListReusableModals/DeleteModal")
);
const EditNameModal = React.lazy(() =>
  import("./ListReusableModals/EditNameModal")
);
const DuplicateModal = React.lazy(() =>
  import("./ListReusableModals/DuplicateModal")
);
const AddProductionOrderModal = React.lazy(() =>
  import("./ListReusableModals/AddProductionOrderModal")
);
const CheckModuleModal = React.lazy(() =>
  import("./ListReusableModals/CheckModuleModal")
);
import Select from "react-select";
// third party impprts

// Custom styles
const customStyles = {
  control: (provided) => ({
    ...provided,
    width: "20rem",
    height: "40px",
    overflow: "hidden", // Prevents height increase
  }),
  valueContainer: (provided) => ({
    ...provided,
    overflowX: "auto", // Allow horizontal scrolling
    whiteSpace: "nowrap",
    flexWrap: "nowrap", // Prevents wrapping
  }),
  multiValue: (provided) => ({
    ...provided,
    display: "inline-flex",
    maxWidth: "150px", // Limit the display size
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),
};

const statusFilterOptions = [
  { value: "Delayed", label: "Delayed" },
  { value: "Ahead", label: "Ahead" },
  { value: "On Track", label: "On Track" },
  { value: "Not Allocated", label: "Not Allocated" },
  { value: "Completed", label: "Completed" },
  { value: "Allocated", label: "Allocated" },
];

import { Link } from "react-router-dom";
// import { ToastContainer } from "react-toastify";
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  ModalFooter,
  Row,
  UncontrolledDropdown,
  Modal,
  ModalBody,
  ModalHeader,
  Button,
  Badge,
  Spinner,
} from "reactstrap";
import FeatherIcon from "feather-icons-react";
import { ToastContainer, toast } from "react-toastify";
import debounce from "lodash.debounce";
// import "./project.css";
import "./projectForProjects.css";
import PaginatedList from "../Pagination/PaginatedList";
import { FaEdit, FaSort } from "react-icons/fa";

const List = () => {
  const [sortOrder, setSortOrder] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [modal_list, setModalList] = useState(false);
  const [modal_edit, setModalEdit] = useState(false);
  const [secondModalList, setSeondModalList] = useState(false);
  const [modal_delete, setModalDelete] = useState(false);
  const [modal_category, setModal_category] = useState(false);
  const [modal_NaemEdit, setModal_NaemEdit] = useState(false);
  const [projectListsData, setprojectListsData] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true); // State to manage loading state
  const [isLoading, setIsLoading] = useState(true);
  const [newprojectName, setNewprojectName] = useState(""); // For storing new part name
  const [editId, setEditId] = useState(null); // ID for the item being edited
  const [posting, setPosting] = useState(false);
  const [totalCountCost, setTotalCostCount] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState(null); // State for handling errors
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [projectType, setProjectType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const itemsPerPage = 20;
  const [totalpages, setTotalPages] = useState(20);
  const [formData, setFormData] = useState({
    projectName: "",
    costPerUnit: "",
    timePerUnit: "",
    stockPOQty: "",
  });

  //calulation
  const [machineHoursPerDay, setMachineHoursPerDay] = useState({});
  const [numberOfMachines, setNumberOfMachines] = useState({});
  const [daysToWork, setDaysToWork] = useState({});
  const [manufacturingData, setManufacturingData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItem, setSelectedItems] = useState([]);

  const [modal_duplicate, setModalDuplicate] = useState(false);
  const [itemToDuplicate, setItemToDuplicate] = useState(null);
  const userRole = localStorage.getItem("userRole");
  const [modal_checkModule, setModalCheckModule] = useState(false);

  const [searchOptions, setSearchOptions] = useState([]);
  const [searchPage, setSearchPage] = useState(1);
  const [hasMoreSearch, setHasMoreSearch] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentSearch, setCurrentSearch] = useState("");
  const [searchInputValue, setSearchInputValue] = useState("");

  const [isSearchMode, setIsSearchMode] = useState(false);

  // Replace the existing handleDuplicateProject function with these:
  const handleDuplicateClick = (item) => {
    setItemToDuplicate(item);
    setModalDuplicate(true);
  };

  const fetchManufacturingData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/manufacturing`
      );
      const data = await response.json();
      setManufacturingData(data);
    } catch (error) {
      console.error("Error fetching manufacturing data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchManufacturingData();
  }, [fetchManufacturingData]);

  const handleDuplicateConfirm = useCallback(async () => {
    if (!itemToDuplicate) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projectss/${itemToDuplicate._id}/duplicate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to duplicate project");
      }
      const duplicatedProject = await response.json();
      setprojectListsData((prevData) => [...prevData, duplicatedProject]);
      toast.success("Project duplicated successfully!");
    } catch (error) {
      toast.error(`Error duplicating project: ${error.message}`);
    } finally {
      setModalDuplicate(false);
      setItemToDuplicate(null);
    }
  });
  // const handleFilterChange = (e) => {
  //   setFilterType(e.target.value);
  // };

  const handleSingleProjectTotalCount = (newTotal) => {
    setTotalCostCount(newTotal);
  };

  const toggleModal = () => {
    setModalList(!modal_list);
  };

  const toggleModalPO = () => {
    setSeondModalList(!secondModalList);
  };
  const toggleCheckModule = () => {
    setModalCheckModule(!modal_checkModule);
  };
  // function to toggle edit the modal
  const toggleEditModal = (item = null) => {
    if (item) {
      // Pre-fill the modal with data from the selected item
      setFormData({
        projectName: item.projectName,
        costPerUnit: item.costPerUnit,
        timePerUnit: item.timePerUnit,
        stockPOQty: item.stockPOQty,
      });
      setEditId(item._id); // Save the ID for the PUT request
    } else {
      // Clear form data if no item is selected
      setFormData({
        projectName: "",
        costPerUnit: 0,
        timePerUnit: 0,
        stockPOQty: 0,
      });
      setEditId(null);
    }
    setModalEdit(!modal_edit);
  };

  // Function to toggle 'Delete' modal
  const tog_delete = () => {
    setModalDelete(!modal_delete);
  };

  const toggleModalCategory = () => {
    setModal_category(!modal_category);
  };

  const toggle_editName = (item = null) => {
    if (item) {
      setNewProjectName(item.projectName); // Pre-fill modal with current name
      setEditId(item._id);
    } else {
      setNewProjectName(""); // Reset if no item is selected
      setEditId(null);
    }
    setModal_NaemEdit(!modal_NaemEdit);
  };

  const fetchData = useCallback(
    async (page = 1, pageSize = itemsPerPage, searchQuery = "") => {
      setIsLoading(true);
      setError(null);
      try {
        // Build query parameters
        const params = new URLSearchParams({
          page: page,
          limit: pageSize,
        });

        if (filterStatus) params.append("status", filterStatus);
        if (searchQuery && searchQuery.trim())
          params.append("search", searchQuery.trim());

        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projectss?${params}`
        );

        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch data");
        }

        // Use the data from backend response
        const projects = Array.isArray(data.data) ? data.data : [];
        const pagination = data.pagination || {};

        setprojectListsData(projects);

        // Use server-provided pagination info
        const calculatedTotalPages = pagination.totalPages || 1;
        setTotalPages(calculatedTotalPages);

        if (initialLoad) {
          setFilterStatus("");
          setInitialLoad(false);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
        setprojectListsData([]);
        setTotalPages(1); // Reset to 1 page on error
      } finally {
        setIsLoading(false);
      }
    },
    [filterStatus, initialLoad, itemsPerPage]
  );

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchPage(1);
      fetchSearchOptions(1, value);
    }, 300),
    []
  );

  const fetchSearchOptions = async (pageNumber = 1, search = "") => {
    if (!search || search.length < 1) {
      setSearchOptions([]);
      setHasMoreSearch(false);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(
        `${
          process.env.REACT_APP_BASE_URL
        }/api/defpartproject/projectss?page=${pageNumber}&limit=20&search=${encodeURIComponent(
          search
        )}`
      );
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        const newOptions = [];

        result.data.forEach((project) => {
          //  Add projectName option
          if (project.projectName) {
            newOptions.push({
              value: project.projectName,
              label: `Project: ${project.projectName}`,
              type: "projectName",
            });
          }

          //  Add partsCodeId suggestions from nested arrays
          const addPartCodes = (listArray) => {
            if (Array.isArray(listArray)) {
              listArray.forEach((list) => {
                list.partsListItems?.forEach((item) => {
                  if (item.partsCodeId) {
                    newOptions.push({
                      value: item.partsCodeId,
                      label: `Part Code: ${item.partsCodeId}`,
                      type: "partsCodeId",
                    });
                  }
                });
              });
            }
          };

          addPartCodes(project.partsLists);
          addPartCodes(project.subAssemblyListFirst);
          addPartCodes(project.assemblyList);
        });

        // Remove duplicates
        const uniqueOptions = Array.from(
          new Map(newOptions.map((opt) => [opt.value, opt])).values()
        );

        setSearchOptions((prev) => {
          const combined = [...prev, ...uniqueOptions];
          const uniqueByValue = Array.from(
            new Map(combined.map((opt) => [opt.value, opt])).values()
          );
          return uniqueByValue;
        });

        setHasMoreSearch(uniqueOptions.length > 0);
      }
    } catch (error) {
      console.error("Error fetching search options:", error);
      toast.error("Failed to load search results");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchInputChange = (inputValue) => {
    setSearchInputValue(inputValue);
    setSearchPage(1);
    debouncedSearch(inputValue);
    return inputValue;
  };
  // we can directly use projectListsData as it already contains the filtered results

  const paginatedData = useMemo(() => {
    return projectListsData;
  }, [projectListsData]);

  useEffect(() => {
    //  Prevent reloading when in search mode
    if (isSearchMode) return;

    if (currentSearch && !searchTerm.length) {
      fetchData(currentPage, itemsPerPage, currentSearch);
    } else if (!currentSearch) {
      fetchData(currentPage);
    }
  }, [
    fetchData,
    currentPage,
    currentSearch,
    itemsPerPage,
    searchTerm.length,
    isSearchMode,
  ]);

  const handleSearchChange = async (selectedOptions) => {
    const selectedValues = selectedOptions
      ? selectedOptions.map((opt) => opt.value)
      : [];

    setSearchTerm(selectedValues);
    setCurrentPage(1);
    setSelectedItems(selectedValues);
    setSearchPage(1);
    setHasMoreSearch(true);

    if (selectedValues.length > 0) {
      setIsSearchMode(true);
      setIsLoading(true);

      try {
        const allResults = [];

        //  Fetch projects for every selected search term
        for (const term of selectedValues) {
          const response = await fetch(
            `${
              process.env.REACT_APP_BASE_URL
            }/api/defpartproject/projectss?search=${encodeURIComponent(
              term
            )}&page=1&limit=1000`
          );

          if (response.ok) {
            const data = await response.json();
            if (data.success && Array.isArray(data.data)) {
              allResults.push(...data.data);
            }
          }
        }

        //  Deduplicate projects by _id
        const uniqueResults = [];
        const seenIds = new Set();
        for (const project of allResults) {
          if (!seenIds.has(project._id)) {
            seenIds.add(project._id);
            uniqueResults.push(project);
          }
        }

        //  Sort newest first
        uniqueResults.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        //  Update your main table data
        setprojectListsData(uniqueResults);

        //  Handle case when user searches by partCodeId
        if (uniqueResults.length === 0) {
          toast.info("No projects found for this Part Code ID");
        }

        setTotalPages(1);
        setCurrentSearch(selectedValues.join(", "));
      } catch (error) {
        console.error("Error in multiple project search:", error);
        toast.error("Error searching projects");
      } finally {
        setIsLoading(false);
      }
    } else {
      //  Reset view when search cleared
      setIsSearchMode(false);
      setCurrentSearch("");
      setSearchInputValue("");
      setSearchOptions([]);
      fetchData(1, itemsPerPage);
    }
  };

  // Also update the filter type handler if you have one:
  const handleFilterStatusChange = (selectedOption) => {
    setFilterStatus(selectedOption?.value || "");
    setCurrentPage(1);
    if (currentSearch) {
      fetchData(1, itemsPerPage, currentSearch);
    } else {
      fetchData(1, itemsPerPage);
    }
  };

  const calculateTotalSum = () => {
    const totalCost = paginatedData.reduce(
      (sum, item) => sum + Math.ceil(item.costPerUnit),
      0
    );
    const totalHours = paginatedData.reduce(
      (sum, item) => sum + item.timePerUnit,
      0
    );

    const machineHours = manufacturingData.reduce((acc, machine) => {
      acc[machine.name] = paginatedData.reduce(
        (sum, item) =>
          sum +
          (item.machineHours && item.machineHours[machine.name]
            ? item.machineHours[machine.name]
            : 0),
        0
      );
      return acc;
    }, {});

    return { totalCost, totalHours, machineHours };
  };

  // Total pages is now managed by the backend pagination
  // We use totalpages state which is set from the backend response

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to the first page on search
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle adding a new part
  const handleAddPart = async () => {
    if (newprojectName.trim() !== "" && projectType !== "") {
      const newPart = {
        projectName: newprojectName,
        costPerUnit: 0,
        timePerUnit: 0,
        stockPoQty: 0,
        projectType: projectType,
      };
      setIsSubmitting(true);
      try {
        const response = await fetch(
          // `${process.env.REACT_APP_BASE_URL}/api/projects`,
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projectss`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newPart),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to add the part");
        }

        const addedPart = await response.json();
        setprojectListsData((prevData) => [...prevData, addedPart]);
        toast.success("Records added Successfully!");
      } catch (error) {
        toast.error(`Error: ${error.message}`);
      } finally {
        setIsSubmitting(false);
        setNewprojectName("");
        setProjectType("");
        toggleModal();
      }
    }
  };

  const handleSortByDate = () => {
    let sorted;

    if (sortOrder === "asc") {
      // Sort in descending order
      sorted = [...projectListsData].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setSortOrder("desc");
    } else {
      // Default to ascending order
      sorted = [...projectListsData].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      setSortOrder("asc");
    }

    setprojectListsData(sorted);
  };

  const activebtn = (ele) => {
    if (ele.closest("button").classList.contains("active")) {
      ele.closest("button").classList.remove("active");
    } else {
      ele.closest("button").classList.add("active");
    }
  };

  const calculateTotalHoursForProcess = (processName, item) => {
    const totalHours = item[processName] || 0;
    const quantity = item.quantity || 0;
    return (totalHours * quantity).toFixed(2);
  };

  const calculateMonthsRequired = (processName, item) => {
    const totalHours = calculateTotalHoursForProcess(processName, item);
    const availableMachineHoursPerMonth =
      (machineHoursPerDay[processName] || 0) *
      (numberOfMachines[processName] || 0) *
      (daysToWork[processName] || 0);

    if (availableMachineHoursPerMonth === 0) {
      return "--";
    }

    const monthsRequired = totalHours / availableMachineHoursPerMonth;
    return monthsRequired.toFixed(2);
  };

  const getStatus = useCallback(
    (project) => {
      // First check if project has any parts at all
      const hasPartsItems = project.partsLists?.some(
        (list) => list.partsListItems && list.partsListItems.length > 0
      );
      const hasSubAssemblyItems = project.subAssemblyListFirst?.some(
        (list) => list.partsListItems && list.partsListItems.length > 0
      );
      const hasAssemblyItems = project.assemblyList?.some(
        (list) => list.partsListItems && list.partsListItems.length > 0
      );

      // If no parts exist at all, return Not Allocated
      if (!hasPartsItems && !hasSubAssemblyItems && !hasAssemblyItems) {
        return <Badge color="secondary">Not Allocated</Badge>;
      }

      // Now check if all parts are completed
      const allPartsCompleted = checkAllPartsCompleted(project);
      if (allPartsCompleted) {
        return <Badge color="success">Completed</Badge>;
      }

      // Default state - Not Allocated
      let status = "Not Allocated";
      let statusColor = "secondary";

      // Helper function to check if any allocations exist in a parts list item
      const hasAllocations = (partsListItem) => {
        return (
          partsListItem.allocations &&
          Array.isArray(partsListItem.allocations) &&
          partsListItem.allocations.length > 0
        );
      };

      // Check if any parts have allocations
      const hasAnyAllocations =
        project.partsLists?.some((list) =>
          list.partsListItems?.some(hasAllocations)
        ) ||
        project.subAssemblyListFirst?.some((list) =>
          list.partsListItems?.some(hasAllocations)
        ) ||
        project.assemblyList?.some((list) =>
          list.partsListItems?.some(hasAllocations)
        );

      // If no allocations exist but parts exist, return "Not Allocated"
      if (!hasAnyAllocations) {
        return <Badge color={statusColor}>{status}</Badge>;
      }

      // If we have allocations but no tracking data, return "Allocated"
      status = "Allocated";
      statusColor = "info";

      // Rest of the tracking status logic remains the same...
      // Helper function to check tracking status
      const checkTrackingStatus = (partsListItem) => {
        if (!partsListItem.allocations) return;

        partsListItem.allocations.forEach((allocationGroup) => {
          if (!allocationGroup.allocations) return;

          allocationGroup.allocations.forEach((allocation) => {
            if (allocation.actualEndDate && allocation.endDate) {
              const actualEnd = new Date(allocation.actualEndDate);
              const plannedEnd = new Date(allocation.endDate);

              if (actualEnd > plannedEnd) {
                status = "Delayed";
                statusColor = "danger";
              } else if (actualEnd < plannedEnd && status !== "Delayed") {
                status = "Ahead";
                statusColor = "success";
              } else if (status === "Allocated") {
                status = "On Track";
                statusColor = "primary";
              }
            } else if (
              allocation.dailyTracking &&
              allocation.dailyTracking.length > 0
            ) {
              // If we have tracking but no actualEndDate yet, check daily progress
              const totalProduced = allocation.dailyTracking.reduce(
                (sum, track) => sum + (track.produced || 0),
                0
              );
              const totalPlanned = allocation.dailyTracking.reduce(
                (sum, track) => sum + (track.planned || 0),
                0
              );

              if (totalProduced < totalPlanned) {
                status = "Delayed";
                statusColor = "danger";
              } else if (totalProduced > totalPlanned && status !== "Delayed") {
                status = "Ahead";
                statusColor = "success";
              } else if (status === "Allocated") {
                status = "On Track";
                statusColor = "primary";
              }
            }
          });
        });
      };

      // Check tracking status in all parts lists
      project.partsLists?.forEach((list) => {
        list.partsListItems?.forEach(checkTrackingStatus);
      });

      project.subAssemblyListFirst?.forEach((list) => {
        list.partsListItems?.forEach(checkTrackingStatus);
      });

      project.assemblyList?.forEach((list) => {
        list.partsListItems?.forEach(checkTrackingStatus);
      });

      return <Badge color={statusColor}>{status}</Badge>;
    },
    [manufacturingData]
  );

  // Modified helper function to check if all parts in a project are completed
  const checkAllPartsCompleted = (project) => {
    // If no parts exist at all, return false (we already checked this case earlier)
    const hasParts =
      (project.partsLists && project.partsLists.length > 0) ||
      (project.subAssemblyListFirst &&
        project.subAssemblyListFirst.length > 0) ||
      (project.assemblyList && project.assemblyList.length > 0);

    if (!hasParts) return false;

    // Check partsLists
    const partsListsCompleted =
      project.partsLists?.every((list) =>
        list.partsListItems?.every(
          (item) => item.status === "Completed" || item.isManuallyCompleted
        )
      ) ?? true; // If no partsLists, consider them "completed"

    // Check subAssemblyListFirst
    const subAssembliesCompleted =
      project.subAssemblyListFirst?.every((list) =>
        list.partsListItems?.every(
          (item) => item.status === "Completed" || item.isManuallyCompleted
        )
      ) ?? true;

    // Check assemblyList and their subAssemblies
    const assembliesCompleted =
      project.assemblyList?.every((assembly) => {
        const mainItemsCompleted =
          assembly.partsListItems?.every(
            (item) => item.status === "Completed" || item.isManuallyCompleted
          ) ?? true;

        const subAssembliesCompleted =
          assembly.subAssemblies?.every((sub) =>
            sub.partsListItems?.every(
              (item) => item.status === "Completed" || item.isManuallyCompleted
            )
          ) ?? true;

        return mainItemsCompleted && subAssembliesCompleted;
      }) ?? true;

    return partsListsCompleted && subAssembliesCompleted && assembliesCompleted;
  };

  // Combine search and filter logic locally to ensure correct "No Data Found"

  const filteredPaginatedData = useMemo(() => {
    if (!projectListsData || projectListsData.length === 0) return [];

    let data = projectListsData;

    // Filter by Status
    if (filterStatus && filterStatus.trim() !== "") {
      data = data.filter((item) => {
        const statusElement = getStatus(item);
        const statusText =
          typeof statusElement?.props?.children === "string"
            ? statusElement.props.children
            : "";
        return (
          statusText.toLowerCase().trim() === filterStatus.toLowerCase().trim()
        );
      });
    }

    //  Filter by Search term(s)
    if (searchTerm && searchTerm.length > 0) {
      data = data.filter((item) =>
        searchTerm.some((term) => {
          const termLower = term.toLowerCase();

          const matchesProjectName = item.projectName
            ?.toLowerCase()
            .includes(termLower);

          const matchesPartCode = [
            ...(item.partsLists || []),
            ...(item.subAssemblyListFirst || []),
            ...(item.assemblyList || []),
          ].some((list) =>
            (list.partsListItems || []).some((p) =>
              p.partsCodeId?.toLowerCase().includes(termLower)
            )
          );

          return matchesProjectName || matchesPartCode;
        })
      );
    }

    return data;
  }, [projectListsData, filterStatus, searchTerm, getStatus]);

  const formatTime = (time) => {
    if (time === "-" || isNaN(time)) {
      return "-";
    }

    if (time === 0) {
      return "-";
    }

    const totalMinutes = Math.round(time * 60); // Convert hours to minutes
    return `${totalMinutes} m`;
  };

  // Machine total hr function
  const getMachineHoursCells = useCallback(
    (item) =>
      manufacturingData.map((machine) => {
        const hours =
          item.machineHours && item.machineHours[machine.name]
            ? item.machineHours[machine.name]
            : 0;
        return <td key={machine._id}>{formatTime(hours)}</td>;
      }),
    [manufacturingData, formatTime]
  );

  // In your render function, before the table:
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <Spinner color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">Error loading projects: {error}</div>
    );
  }

  // if (projectListsData.length === 0 && !isLoading) {
  //   return (
  //     <div className="alert alert-info">
  //       No projects found. Create a new project to get started.
  //     </div>
  //   );
  // }

  const addProjectLocally = (newProject) => {
    setprojectListsData((prev) => {
      // 1. Add new project at the beginning
      const updated = [newProject, ...prev];

      // 2. Sort so newest appears first (same as your fetchData sort)
      updated.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return updated;
    });
  };

  return (
    <React.Fragment>
      <ToastContainer closeButton={false} />
      <Suspense fallback={<div>Loading...</div>}>
        <DeleteModal
          show={deleteModal}
          onDeleteClick={() => handleDeleteProjectList()}
          onCloseClick={() => setDeleteModal(false)}
        />
      </Suspense>
      <Row className="g-2 mb-3 align-items-center">
        {/* For small screens (<= 768px) - Stacked vertically */}
        <div className="col-12 d-md-none">
          <div className="d-flex flex-column gap-2">
            <div className="d-flex flex-wrap gap-2">
              {userRole === "admin" && (
                <>
                  <Button
                    className="btn btn-success flex-fill"
                    onClick={toggleModal}
                    style={{ minWidth: "120px" }}
                  >
                    <i className="ri-add-line align-bottom me-1"></i> Add New
                  </Button>
                  <Button
                    className="btn btn-primary flex-fill"
                    onClick={toggleModalPO}
                    style={{ minWidth: "120px" }}
                  >
                    <i className="ri-add-line align-bottom me-1"></i> Add PO
                  </Button>
                  <Button
                    className="btn btn-warning flex-fill"
                    onClick={toggleCheckModule}
                    style={{ minWidth: "120px" }}
                  >
                    <i className="ri-add-line align-bottom me-1"></i> Sync Po
                  </Button>
                </>
              )}
            </div>

            <div className="d-flex flex-column gap-2">
              <Select
                isMulti
                isClearable
                placeholder="Search..."
                options={searchOptions}
                value={
                  searchTerm.length > 0
                    ? searchTerm.map((term) => ({ value: term, label: term }))
                    : []
                }
                onChange={handleSearchChange}
                onInputChange={handleSearchInputChange}
                onMenuScrollToBottom={() => {
                  if (hasMoreSearch && !searchLoading) {
                    const nextPage = searchPage + 1;
                    setSearchPage(nextPage);
                    fetchSearchOptions(nextPage, searchInputValue);
                  }
                }}
                styles={{
                  ...customStyles,
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  control: (provided) => ({
                    ...provided,
                    width: "100%",
                    minWidth: "100%",
                  }),
                }}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                isLoading={searchLoading}
                noOptionsMessage={() => "Type to search projects..."}
                isSearchable={true}
                closeMenuOnSelect={false}
              />
              <Select
                options={statusFilterOptions}
                isClearable
                placeholder="Filter by Status"
                value={
                  statusFilterOptions.find(
                    (opt) => opt.value === filterStatus
                  ) || null
                }
                onChange={handleFilterStatusChange}
                styles={{
                  ...customStyles,
                  control: (provided) => ({
                    ...provided,
                    width: "100%",
                    minWidth: "100%",
                  }),
                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999, //  make sure dropdown is above
                  }),
                }}
                menuPortalTarget={document.body} //  render dropdown outside scroll clipping
                menuPosition="fixed"
              />
            </div>
          </div>
        </div>

        {/* For medium screens (769px - 992px) - Compact layout */}
        <div className="col-12 d-none d-md-flex d-lg-none">
          <div className="d-flex w-100 align-items-center gap-2">
            {userRole === "admin" && (
              <div className="d-flex gap-2">
                <Button className="btn btn-success" onClick={toggleModal}>
                  <i className="ri-add-line align-bottom me-1"></i> Add New
                </Button>
                <Button className="btn btn-primary" onClick={toggleModalPO}>
                  <i className="ri-add-line align-bottom me-1"></i> Add PO
                </Button>
                <Button className="btn btn-warning" onClick={toggleCheckModule}>
                  <i className="ri-add-line align-bottom me-1"></i> Sync PO
                </Button>
              </div>
            )}

            <div className="d-flex flex-grow-1 justify-content-end gap-2">
              <div style={{ width: "200px" }}>
                <Select
                  isMulti
                  isClearable
                  placeholder="Search..."
                  options={searchOptions}
                  value={
                    searchTerm.length > 0
                      ? searchTerm.map((term) => ({ value: term, label: term }))
                      : []
                  }
                  onChange={handleSearchChange}
                  onInputChange={handleSearchInputChange}
                  onMenuScrollToBottom={() => {
                    if (hasMoreSearch && !searchLoading) {
                      const nextPage = searchPage + 1;
                      setSearchPage(nextPage);
                      fetchSearchOptions(nextPage, searchInputValue);
                    }
                  }}
                  styles={{
                    ...customStyles,
                    control: (provided) => ({
                      ...provided,
                      width: "100%",
                      minWidth: "100%",
                    }),
                  }}
                  isLoading={searchLoading}
                  noOptionsMessage={() => "Type to search projects..."}
                  isSearchable={true}
                  closeMenuOnSelect={false}
                />
              </div>
              <div style={{ width: "180px" }}>
                <Select
                  options={statusFilterOptions}
                  isClearable
                  placeholder="Filter by Status"
                  value={
                    statusFilterOptions.find(
                      (opt) => opt.value === filterStatus
                    ) || null
                  }
                  onChange={handleFilterStatusChange}
                  styles={{
                    ...customStyles,
                    control: (provided) => ({
                      ...provided,
                      width: "100%",
                      minWidth: "100%",
                    }),
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* For large screens (> 992px) - Original layout */}
        {/* For large screens (> 992px) - Original layout */}
        <div className="col-12 d-none d-lg-flex">
          <div className="d-flex w-100 align-items-center">
            <div className="d-flex gap-2">
              {userRole === "admin" && (
                <>
                  <Button className="btn btn-success" onClick={toggleModal}>
                    <i className="ri-add-line align-bottom me-1"></i> Add New
                  </Button>
                  <Button className="btn btn-primary" onClick={toggleModalPO}>
                    <i className="ri-add-line align-bottom me-1"></i> Add
                    Production Order
                  </Button>
                  <Button
                    className="btn btn-warning"
                    onClick={toggleCheckModule}
                  >
                    <i className="ri-add-line align-bottom me-1"></i> Sync Po
                  </Button>
                </>
              )}
            </div>
            <div className="d-flex justify-content-end gap-3 ms-auto">
              <div>
                <Select
                  isMulti
                  isClearable
                  placeholder="Search..."
                  options={searchOptions}
                  value={
                    searchTerm.length > 0
                      ? searchTerm.map((term) => ({ value: term, label: term }))
                      : []
                  }
                  onChange={handleSearchChange}
                  onInputChange={handleSearchInputChange}
                  onMenuScrollToBottom={() => {
                    if (hasMoreSearch && !searchLoading) {
                      const nextPage = searchPage + 1;
                      setSearchPage(nextPage);
                      fetchSearchOptions(nextPage, searchInputValue);
                    }
                  }}
                  styles={customStyles}
                  isLoading={searchLoading}
                  noOptionsMessage={() => "Type to search projects..."}
                  isSearchable={true}
                  closeMenuOnSelect={false}
                />
              </div>
              <div>
                <Select
                  options={statusFilterOptions}
                  isClearable
                  placeholder="Filter by Status"
                  value={
                    statusFilterOptions.find(
                      (opt) => opt.value === filterStatus
                    ) || null
                  }
                  onChange={handleFilterStatusChange}
                  styles={customStyles}
                />
              </div>
            </div>
          </div>
        </div>
      </Row>
      <>
        {isLoading && (
          <div className="loader-overlay">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        <div>
          <div className="table-responsive">
            <table className="table table-striped vertical-lines horizontals-lines">
              <thead style={{ backgroundColor: "#f3f4f6" }}>
                <tr>
                  <th
                    className="sticky-col"
                    style={{
                      backgroundColor: "rgb(228, 228, 228)",
                      width: "250rem",
                    }}
                  >
                    Name
                  </th>
                  <th className="child_parts">Part Name</th>
                  <th className="child_parts">Part Number</th>
                  <th className="child_parts">Quantity</th>

                  {/* <th className="child_parts">Date</th> */}
                  <th className="child_parts" style={{ cursor: "pointer" }}>
                    <span style={{ marginLeft: "5px", marginRight: "10px" }}>
                      Date - Time
                    </span>
                    <FaSort size={15} onClick={handleSortByDate} />
                  </th>
                  <th className="child_parts">Posting Date</th>
                  <th className="child_parts">Production Order-Types</th>
                  {userRole === "admin" && (
                  <th className="child_parts">Total Cost (INR)</th>
                  )}
                  <th className="child_parts">Total Hour</th>
                  <th className="child_parts">Status</th>
                  {manufacturingData?.map((item) => (
                    <th key={item._id} className="child_parts">
                      {item.name}
                    </th>
                  ))}
                  <th className="sticky-col">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredPaginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="100%" className="text-center py-3">
                      No Data Found
                    </td>
                  </tr>
                ) : (
                  filteredPaginatedData.map((item, index) => (
                    <tr key={index}>
                      <td
                        className="sticky-col"
                        style={{
                          color: "blue",
                          backgroundColor: "rgb(255, 255, 255)",
                        }}
                      >
                        <Link to={`/projectSection/${item._id}`}>
                          {typeof item.projectName === "object"
                            ? item.projectName.text
                            : item.projectName}
                        </Link>
                      </td>
                      <td>
                        {item?.partsLists?.[0]?.partsListItems?.[0]?.partName ||
                          "--"}
                      </td>
                      <td>
                        {item?.partsLists?.[0]?.partsListItems?.[0]
                          ?.partsCodeId || "--"}
                      </td>
                        <td>
                        {item?.partsLists?.[0]?.partsListItems?.[0]
                          ?.quantity || "--"}
                      </td>
                      <td>
                        {item.createdAt
                          ? (() => {
                              const date = new Date(item.createdAt);
                              const formattedDate = date.toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              );
                              const formattedTime = date.toLocaleTimeString(
                                "en-GB",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              );
                              return `${formattedDate} - ${formattedTime}`;
                            })()
                          : "--"}
                      </td>

                      <td>{item.postingdate || "--"}</td>
                      <td>{item.projectType}</td>
                       {userRole === "admin" && (
                      <td>{Math.ceil(item.costPerUnit)}</td>

                  )}
                      <td>{formatTime(item.timePerUnit)}</td>
                      <td>{getStatus(item)}</td>
                      {getMachineHoursCells(item)}

                      <td className="sticky-col">
                        <UncontrolledDropdown direction="start">
                          <DropdownToggle
                            tag="button"
                            className="btn btn-link text-muted p-1 mt-n2 py-0 text-decoration-none fs-15 shadow-none"
                          >
                            <FeatherIcon
                              icon="more-horizontal"
                              className="icon-sm"
                            />
                          </DropdownToggle>

                          <DropdownMenu direction="start" container="body">
                            <DropdownItem
                              href="#"
                              onClick={() => {
                                setSelectedId(item._id);
                                tog_delete();
                              }}
                            >
                              <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                              Remove
                            </DropdownItem>
                            <DropdownItem
                              href="#"
                              // onClick={() => handleDuplicateProject(item)}
                              onClick={() => handleDuplicateClick(item)}
                            >
                              <i className="ri-file-copy-line align-bottom me-2 text-muted"></i>{" "}
                              Duplicate
                            </DropdownItem>
                            <DropdownItem
                              href="#"
                              onClick={() => toggle_editName(item)}
                            >
                              <i className="ri-file-edit-line align-bottom me-2 text-muted"></i>
                              Edit
                            </DropdownItem>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              {/* <tfoot>
                <tr>
                  <td
                    className="sticky-col"
                    style={{
                      backgroundColor: "rgb(245, 241, 241)",
                      fontWeight: "bold",
                    }}
                  >
                    Total Sum
                  </td>
                  <td>--</td>
                  <td>--</td>
                  <td>{calculateTotalSum().totalCost}</td>
                  <td>{formatTime(calculateTotalSum().totalHours)}</td>
                  <td>--</td>
                  {manufacturingData.map((machine) => (
                    <td key={machine._id}>
                      {formatTime(
                        calculateTotalSum().machineHours[machine.name] || 0
                      )}
                    </td>
                  ))}
                  <td className="sticky-col">--</td>
                </tr>
              </tfoot> */}
            </table>
          </div>
        </div>

        {/* Only show pagination if we're not in multiple search mode */}
        {searchTerm.length === 0 && (
          <PaginatedList
            totalPages={totalpages}
            currentPage={currentPage}
            onPageChange={(page) => {
              setCurrentPage(page);
              // The fetchData will be triggered by useEffect
            }}
          />
        )}
      </>

      <Suspense fallback={<div>Loading...</div>}>
        <AddProductionOrderModal
          isOpen={modal_list}
          toggle={toggleModal}
          onSuccess={(newProject) => {
            addProjectLocally(newProject); // update table instantly
          }}
          existingProjects={projectListsData}
        />
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <AddProductionOrderWithPart
          isOpen={secondModalList}
          toggle={toggleModalPO}
          onSuccess={(newPo) => {
            addProjectLocally(newPo); // just insert in list
            setSeondModalList(false);
          }}
          existingProjects={projectListsData}
        />
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <EditModal
          isOpen={modal_edit}
          toggle={toggleEditModal}
          editId={selectedItem?._id}
          initialData={selectedItem}
          onSuccess={(updatedProject) => {
            setprojectListsData((prev) =>
              prev.map((proj) =>
                proj._id === updatedProject._id ? updatedProject : proj
              )
            );
          }}
        />
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <DeleteModal
          isOpen={modal_delete}
          toggle={tog_delete}
          projectId={selectedId}
          projectName={
            projectListsData.find((p) => p._id === selectedId)?.projectName
          }
          onSuccess={() => {
            setprojectListsData((prev) =>
              prev.filter((proj) => proj._id !== selectedId)
            );
          }}
        />
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <EditNameModal
          isOpen={modal_NaemEdit}
          toggle={toggle_editName}
          projectId={editId}
          currentName={newProjectName}
          onSuccess={(updatedProject) => {
            setprojectListsData((prev) =>
              prev.map((proj) =>
                proj._id === updatedProject._id ? updatedProject : proj
              )
            );
          }}
        />
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <DuplicateModal
          isOpen={modal_duplicate}
          toggle={() => setModalDuplicate(false)}
          project={itemToDuplicate}
          // onSuccess={(duplicatedProject) => {
          //   setprojectListsData((prev) => [...prev, duplicatedProject]);
          // }}
          onSuccess={(newProject) => {
            addProjectLocally(newProject); // update table instantly
          }}
        />
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <CheckModuleModal
          isOpen={modal_checkModule}
          toggle={toggleCheckModule}
          onSuccess={(newProjects) => {
            setprojectListsData((prev) => {
              const updated = [...newProjects, ...prev];
              updated.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
              );
              return updated;
            });
          }}
          existingProjects={projectListsData}
        />
      </Suspense>
    </React.Fragment>
  );
};

export default List;
