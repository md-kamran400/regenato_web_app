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

const projectTypeOptions = [
  { value: "External PO", label: "External PO" },
  { value: "Internal PO", label: "Internal PO" },
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
  const [filterType, setFilterType] = useState([]);
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
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${itemToDuplicate._id}/duplicate`,
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
  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
  };

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

  // const fetchData = useCallback(
  //   async (page = 1, pageSize = itemsPerPage) => {
  //     setIsLoading(true);
  //     setError(null);
  //     try {
  //       const response = await fetch(
  //         `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects?filterType=${filterType}&page=${page}&limit=${pageSize}`
  //       );

  //       if (!response.ok) throw new Error("Failed to fetch data");

  //       const data = await response.json();

  //       // Handle different response structures
  //       const projects = Array.isArray(data)
  //         ? data
  //         : Array.isArray(data.projects)
  //         ? data.projects
  //         : Array.isArray(data.data)
  //         ? data.data
  //         : [];

  //       setprojectListsData(projects);

  //       // Handle pagination metadata
  //       const totalItems = data.total || data.totalCount || projects.length;
  //       const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);
  //       setTotalPages(calculatedTotalPages);

  //       if (initialLoad) {
  //         setFilterType("");
  //         setInitialLoad(false);
  //       }
  //     } catch (err) {
  //       console.error("Fetch error:", err);
  //       setError(err.message);
  //       setprojectListsData([]);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   },
  //   [filterType, initialLoad, itemsPerPage]
  // );

  const fetchData = useCallback(
    async (page = 1, pageSize = itemsPerPage) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects?filterType=${filterType}&page=${page}&limit=${pageSize}`
        );

        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();

        const projects = Array.isArray(data)
          ? data
          : Array.isArray(data.projects)
          ? data.projects
          : Array.isArray(data.data)
          ? data.data
          : [];

        // ✅ sort newest first
        projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setprojectListsData(projects);

        const totalItems = data.total || data.totalCount || projects.length;
        const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);
        setTotalPages(calculatedTotalPages);

        if (initialLoad) {
          setFilterType("");
          setInitialLoad(false);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
        setprojectListsData([]);
      } finally {
        setIsLoading(false);
      }
    },
    [filterType, initialLoad, itemsPerPage]
  );

  const filteredData = useMemo(() => {
    // If searchTerm is empty and no filterType, return all projects directly
    if (searchTerm.length === 0 && filterType === "") {
      return projectListsData;
    }

    return projectListsData.filter((item) => {
      if (!item) return false;

      // Handle search term filtering
      const matchesSearch =
        searchTerm.length === 0 ||
        (item.projectName &&
          searchTerm.some((term) =>
            item.projectName.toLowerCase().includes(term.toLowerCase())
          ));

      // Handle project type filtering
      const matchesType = filterType === "" || item.projectType === filterType;

      return matchesSearch && matchesType;
    });
  }, [projectListsData, searchTerm, filterType]);

  // Update paginatedData calculation
  // Update paginatedData calculation
  const paginatedData = useMemo(() => {
    // If no filtering is applied, use direct pagination on projectListsData
    if (searchTerm.length === 0 && filterType === "") {
      return projectListsData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      );
    }

    // Otherwise use filteredData
    return filteredData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [
    filteredData,
    projectListsData,
    currentPage,
    itemsPerPage,
    searchTerm,
    filterType,
  ]);

  useEffect(() => {
    fetchData(currentPage); // Pass currentPage to fetch the correct page
  }, [fetchData, currentPage]); // Add currentPage to dependencies

  const projectOptions = projectListsData.map((project) => ({
    value: project.projectName,
    label: project.projectName,
  }));

  const handleSearchChange = (selectedOptions) => {
    const selectedValues = selectedOptions
      ? selectedOptions.map((opt) => opt.value)
      : [];
    setSearchTerm(selectedValues);
    setCurrentPage(1);
    setSelectedItems(selectedValues);
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

  // has context menu
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

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
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects`,
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

  if (projectListsData.length === 0 && !isLoading) {
    return (
      <div className="alert alert-info">
        No projects found. Create a new project to get started.
      </div>
    );
  }

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
                options={projectOptions}
                isMulti
                isClearable
                placeholder="Search..."
                onChange={handleSearchChange}
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
              />
              <Select
                options={projectTypeOptions}
                isClearable
                placeholder="Filter by Type"
                value={
                  projectTypeOptions.find((opt) => opt.value === filterType) ||
                  null
                } // ✅ Show selected value
                onChange={(selectedOption) => {
                  setFilterType(selectedOption?.value || "");
                }}
                styles={{
                  ...customStyles,
                  control: (provided) => ({
                    ...provided,
                    width: "100%",
                    minWidth: "100%",
                  }),
                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999, // ✅ make sure dropdown is above
                  }),
                }}
                menuPortalTarget={document.body} // ✅ render dropdown outside scroll clipping
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
                  options={projectOptions}
                  isMulti
                  isClearable
                  placeholder="Search..."
                  onChange={handleSearchChange}
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
              <div style={{ width: "180px" }}>
                <Select
                  options={projectTypeOptions}
                  isClearable
                  placeholder="Filter by Type"
                  value={
                    projectTypeOptions.find(
                      (opt) => opt.value === filterType
                    ) || null
                  } // ✅ Show selected value
                  onChange={(selectedOption) => {
                    setFilterType(selectedOption?.value || "");
                  }}
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
                  options={projectOptions}
                  isMulti
                  isClearable
                  placeholder="Search..."
                  onChange={handleSearchChange}
                  styles={customStyles}
                />
              </div>
              <div>
                <Select
                  options={projectTypeOptions}
                  isClearable
                  placeholder="Filter by Type"
                  value={
                    projectTypeOptions.find(
                      (opt) => opt.value === filterType
                    ) || null
                  } // ✅ Show selected value
                  onChange={(selectedOption) => {
                    setFilterType(selectedOption?.value || "");
                  }}
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
                  {/* <th className="child_parts">Date</th> */}
                  <th className="child_parts" style={{ cursor: "pointer" }}>
                    <span style={{ marginLeft: "5px", marginRight: "10px" }}>
                      Date
                    </span>
                    <FaSort size={15} onClick={handleSortByDate} />
                  </th>
                  <th className="child_parts">Production Order-Types</th>
                  <th className="child_parts">Total Cost (INR)</th>
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
                {paginatedData?.map((item, index) => (
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
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "--"}
                    </td>
                    <td>{item.projectType}</td>
                    <td>{Math.ceil(item.costPerUnit)}</td>
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
                ))}
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

        <PaginatedList
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
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
