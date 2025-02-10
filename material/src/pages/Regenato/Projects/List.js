// react imports
import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";

import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
// import Select from "@mui/material/Select";
// import Checkbox from "@mui/material/Checkbox";
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
  { value: "PO Type 1", label: "PO Type 1" },
  { value: "PO Type 2", label: "PO Type 2" },
];

import { Link } from "react-router-dom";
// import { ToastContainer } from "react-toastify";
import {
  Card,
  CardBody,
  Col,
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
  ListGroup,
  ListGroupItem,
  Dropdown,
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";
import FeatherIcon from "feather-icons-react";
import { ToastContainer, toast } from "react-toastify";
import "./project.css";

import { Puff } from "react-loader-spinner";

// component import
import DeleteModal from "../../../Components/Common/DeleteModal";
import PaginatedList from "../Pagination/PaginatedList";
import { FaSort } from "react-icons/fa";

const List = () => {
  // const [filt, setFilteredData] = useState([]);
  const [sortOrder, setSortOrder] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [modal_list, setModalList] = useState(false);
  const [modal_edit, setModalEdit] = useState(false);
  const [modal_delete, setModalDelete] = useState(false);
  const [modal_category, setModal_category] = useState(false);
  const [projectListsData, setprojectListsData] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true); // State to manage loading state

  // loader
  const [isLoading, setIsLoading] = useState(true);
  const [newprojectName, setNewprojectName] = useState(""); // For storing new part name
  const [editId, setEditId] = useState(null); // ID for the item being edited
  const [costPerUnit, setCostPerUnit] = useState(0);
  const [timePerUnit, setTimePerUnit] = useState(0);
  const [stockPOQty, setStockPOQty] = useState(0);
  const [posting, setPosting] = useState(false);
  const [totalCountCost, setTotalCostCount] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState(null); // State for handling errors
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [projectType, setProjectType] = useState("");
  const [filterType, setFilterType] = useState([]);
  const itemsPerPage = 25;
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
  const [selectedItems, setSelectedItems] = useState([]);
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

  const handleDuplicateProject = async (item) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${item._id}/duplicate`,
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
    }
  };

  //filter
  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
  };

  // const handleFilterChange = (selectedOptions) => {
  //   const selectedValues = selectedOptions
  //     ? selectedOptions.map((opt) => opt.value)
  //     : [];

  //   // Update the filterType state with the selected values
  //   setFilterType(selectedValues);

  //   // Filter the projectListsData based on selected PO types
  //   const filteredProjects = projectListsData.filter(
  //     (item) =>
  //       !selectedValues.length || selectedValues.includes(item.projectType)
  //   );

  //   // Update the projectListsData state with filtered projects
  //   setprojectListsData(filteredProjects);

  //   // Update the UI to reflect the selected options
  //   setProjectType(selectedValues.join(", "));
  // };

  const handleSingleProjectTotalCount = (newTotal) => {
    setTotalCostCount(newTotal);
  };

  const toggleModal = () => {
    setModalList(!modal_list);
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

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects?filterType=${filterType}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      const data = await response.json();
      setprojectListsData(data);
      if (initialLoad) {
        setFilterType(""); // Set filter to empty string on initial load
        setInitialLoad(false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtered and Paginated Data
  // const filteredData = projectListsData.filter((item) =>
  //   item.projectName.toLowerCase().includes(searchTerm.toLowerCase())
  // );
  // Modify the filteredData calculation:
  // const filteredData = projectListsData.filter(
  //   (item) =>
  //     item?.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
  //     (filterType === "" || item.projectType === filterType)
  // );

  // const filteredData = projectListsData.filter(
  //   (item) =>
  //     searchTerm.length === 0 || // If no search term, show all
  //     searchTerm.some((term) =>
  //       item?.projectName?.toLowerCase().includes(term.toLowerCase())
  //     )
  // );
  const filteredData = projectListsData.filter(
    (item) =>
      (searchTerm.length === 0 ||
        searchTerm.some((term) =>
          item.projectName.toLowerCase().includes(term.toLowerCase())
        )) &&
      (filterType === "" || item.projectType === filterType)
    // ((filterType === "" && true) ||
    //   (filterType !== "" && item.projectType === filterType))
  );

  const projectOptions = projectListsData.map((project) => ({
    value: project.projectName,
    label: project.projectName,
  }));

  // const handleSearchChange = (selectedOptions) => {
  //   const selectedValues = selectedOptions
  //     ? selectedOptions.map((opt) => opt.value)
  //     : [];
  //   setSearchTerm(selectedValues); // Now searchTerm is an array
  //   setCurrentPage(1);
  // };
  const handleSearchChange = (selectedOptions) => {
    const selectedValues = selectedOptions
      ? selectedOptions.map((opt) => opt.value)
      : [];
    setSearchTerm(selectedValues);
    setCurrentPage(1);
    setSelectedItems(selectedValues);
  };

  // const calculateTotalSum = () => {
  //   let totalCost = 0;
  //   let totalHours = 0;

  //   selectedItems.forEach((selectedProject) => {
  //     const project = projectListsData.find(
  //       (item) => item.projectName === selectedProject
  //     );
  //     if (project) {
  //       totalCost += project.costPerUnit;
  //       totalHours += project.timePerUnit;
  //     }
  //   });

  //   return { totalCost, totalHours };
  // };

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
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/projects/${editId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      if (response.ok) {
        // Refresh the page after successful POST request
        await fetchData();
      } else {
        // Handle errors here
        throw new Error("Network response was not ok");
      }
      setFormData({
        projectName: "",
        costPerUnit: "",
        timePerUnit: "",
        stockPOQty: "",
      });
      toggleEditModal();
    } catch (error) {
      setError(error.message);
    } finally {
      setPosting(false);
    }
  };

  // handleing the deletion functionlaity
  const handleDelete = async (_id) => {
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${_id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      toast.success("Records Deleted Successfully!");
      await fetchData(); // Refetch the data to update the table
      tog_delete(); // Close the modal
    } catch (error) {
      setError(error.message);
    } finally {
      setPosting(false);
    }
  };

  const activebtn = (ele) => {
    if (ele.closest("button").classList.contains("active")) {
      ele.closest("button").classList.remove("active");
    } else {
      ele.closest("button").classList.add("active");
    }
  };

  const getHoursForPartListItems = (
    column,
    quantity,
    manufacturingVariables
  ) => {
    if (!manufacturingVariables || manufacturingVariables.length === 0) {
      return "-"; // Handle missing data gracefully
    }
    const target = manufacturingVariables.find(
      (a) => a.name.toLowerCase() === column.toLowerCase()
    );
    if (target) {
      return quantity * target.hours;
    } else {
      return "-";
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

  // In your List component, add this function
  const getMachineHours = (project, machineName) => {
    return project.machineHours && project.machineHours[machineName]
      ? project.machineHours[machineName]
      : 0;
  };

  // const formatTime = (time) => {
  //   if (time === 0) {
  //     return 0;
  //   }

  //   let result = "";

  //   const hours = Math.floor(time);
  //   const minutes = Math.round((time - hours) * 60);

  //   if (hours > 0) {
  //     result += `${hours}h `;
  //   }

  //   if (minutes > 0 || (hours === 0 && minutes !== 0)) {
  //     result += `${minutes}m`;
  //   }

  //   return result.trim();
  // };

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

  return (
    <React.Fragment>
      <ToastContainer closeButton={false} />
      <DeleteModal
        show={deleteModal}
        onDeleteClick={() => handleDeleteProjectList()}
        onCloseClick={() => setDeleteModal(false)}
      />
      <Row className="g-4 mb-3">
        <div className="col-sm-auto">
          <div>
            <Button className="btn btn-success" onClick={toggleModal}>
              <i className="ri-add-line align-bottom me-1"></i> Add New
            </Button>
          </div>
        </div>

        <div className="col-sm-7 ms-auto">
          <div className="d-flex justify-content-sm-end gap-2 align-items-center">
            <div className="search-box ms-2 col-sm-5 d-flex align-items-center">
              <Select
                options={projectOptions}
                isMulti
                isClearable
                placeholder="Search..."
                onChange={handleSearchChange}
                styles={customStyles}
              />
            </div>
            <div className="col-sm-auto">
              <Select
                options={projectTypeOptions}
                isClearable
                placeholder="Select Project Type"
                onChange={(selectedOption) => {
                  if (selectedOption) {
                    setFilterType(selectedOption.value);
                  } else {
                    setFilterType("");
                  }
                }}
                styles={customStyles}
              />
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
        {/* <div className="table-container">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
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
                  <th className="child_parts">Date</th>
                  <th className="child_parts">Production Order-Types</th>
                  <th className="child_parts">Total Cost</th>
                  <th className="child_parts">Total Hour</th>
                  {manufacturingData.map((item) => (
                    <th key={item._id} className="child_parts">
                      {item.name}
                    </th>
                  ))}
                  <th className="sticky-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => (
                  <tr key={index}>
                    <td
                      className="sticky-col"
                      style={{
                        color: "blue",
                        textDecoration: "underline",
                        backgroundColor: "rgb(231, 229, 229)",
                      }}
                    >
                      <Link to={`/projectSection/${item._id}`}>
                        {item.projectName}
                      </Link>
                    </td>
                    <td>
                      {new Date(item.createdAt).toISOString().split("T")[0]}
                    </td>
                    <td>{item.projectType}</td>
                    <td>{Math.ceil(item.costPerUnit)}</td>
                    <td>{formatTime(item.timePerUnit)}</td>
                    {manufacturingData.map((machine) => (
                      <td key={machine._id}>
                        {formatTime(
                          item.machineHours && item.machineHours[machine.name]
                            ? item.machineHours[machine.name]
                            : 0
                        )}
                      </td>
                    ))}
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

                        <DropdownMenu className="dropdown-menu-end">
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
                          <div className="dropdown-divider"></div>
                          <DropdownItem
                            href="#"
                            onClick={() => handleDuplicateProject(item)}
                          >
                            <i className="ri-file-copy-line align-bottom me-2 text-muted"></i>{" "}
                            Duplicate
                          </DropdownItem>
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </td>
                    
                  </tr>
                ))}
                
              </tbody>
            </table>
          </div>
        </div> */}
        <div className="table-container">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
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
                  <th className="child_parts">Total Cost</th>
                  <th className="child_parts">Total Hour</th>
                  {manufacturingData.map((item) => (
                    <th key={item._id} className="child_parts">
                      {item.name}
                    </th>
                  ))}
                  <th className="sticky-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => (
                  <tr key={index}>
                    <td
                      className="sticky-col"
                      style={{
                        color: "blue",
                        textDecoration: "underline",
                        backgroundColor: "rgb(231, 229, 229)",
                      }}
                    >
                      <Link to={`/projectSection/${item._id}`}>
                        {item.projectName}
                      </Link>
                    </td>
                    <td>
                      {new Date(item.createdAt).toISOString().split("T")[0]}
                    </td>
                    <td>{item.projectType}</td>
                    <td>{Math.ceil(item.costPerUnit)}</td>
                    <td>{formatTime(item.timePerUnit)}</td>
                    {manufacturingData.map((machine) => (
                      <td key={machine._id}>
                        {formatTime(
                          item.machineHours && item.machineHours[machine.name]
                            ? item.machineHours[machine.name]
                            : 0
                        )}
                      </td>
                    ))}
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

                        <DropdownMenu className="dropdown-menu-end">
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
                          <div className="dropdown-divider"></div>
                          <DropdownItem
                            href="#"
                            onClick={() => handleDuplicateProject(item)}
                          >
                            <i className="ri-file-copy-line align-bottom me-2 text-muted"></i>{" "}
                            Duplicate
                          </DropdownItem>
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    className="sticky-col"
                    style={{
                      backgroundColor: "rgb(228, 228, 228)",
                      fontWeight: "bold",
                    }}
                  >
                    Total Sum
                  </td>
                  <td>--</td>
                  <td>--</td>
                  <td>{calculateTotalSum().totalCost}</td>
                  <td>{formatTime(calculateTotalSum().totalHours)}</td>
                  {manufacturingData.map((machine) => (
                    <td key={machine._id}>
                      {formatTime(
                        calculateTotalSum().machineHours[machine.name] || 0
                      )}
                    </td>
                  ))}
                  <td className="sticky-col">--</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        {/* <div className="table-responsive">
            <thead>
              <th
                className="sticky-col"
                style={{ backgroundColor: "rgb(228, 228, 228)" }}
              >
                Total Sum
              </th>
              <th className="child_parts">Total Cost</th>
              <th className="child_parts">Total Hours</th>
            </thead>
            <tbody>
              <td></td>
              <td>{calculateTotalSum().totalCost}</td>
              <td>{calculateTotalSum().totalHours}</td>
            </tbody>
          </div> */}
        {/* </div> */}
        <PaginatedList
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </>
      {/* Modal for adding a new item */}
      <Modal isOpen={modal_list} toggle={toggleModal} centered>
        <ModalHeader className="bg-light p-3" toggle={toggleModal}>
          {" "}
          Add Project{" "}
        </ModalHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddPart();
          }}
        >
          <ModalBody>
            <div className="mb-3">
              <label htmlFor="parts-field" className="form-label">
                Project Name
              </label>
              <input
                type="text"
                id="parts-field"
                className="form-control"
                placeholder="Enter Name"
                value={newprojectName}
                onChange={(e) => setNewprojectName(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="project-type" className="form-label">
                Select Type
              </label>
              <Input
                type="select"
                id="project-type"
                className="form-control"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                required
              >
                <option value="">Select a type</option>
                <option value="External PO">External PO</option>
                <option value="Internal PO">Internal PO</option>
                <option value="PO Type 1">PO Type 1</option>
                <option value="PO Type 2">PO Type 2</option>
              </Input>
            </div>
            <Button type="submit" color="primary" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Project"}
            </Button>
          </ModalBody>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={modal_edit} toggle={toggleEditModal}>
        <ModalHeader toggle={toggleEditModal}>Edit Part</ModalHeader>
        <ModalBody>
          <form onSubmit={handleEditSubmit}>
            <div className="mb-3">
              <label htmlFor="projectName" className="form-label">
                Name
              </label>
              <Input
                type="text"
                id="projectName"
                value={formData.projectName}
                onChange={(e) =>
                  setFormData({ ...formData, projectName: e.target.value })
                }
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="costPerUnit" className="form-label">
                Cost Per Unit
              </label>
              <Input
                type="number"
                id="costPerUnit"
                value={formData.costPerUnit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    costPerUnit: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="timePerUnit" className="form-label">
                Total Hours
              </label>
              <Input
                type="number"
                id="timePerUnit"
                value={formData.timePerUnit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    timePerUnit: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="mb-3">
              <label htmlFor="stockPOQty" className="form-label">
                On Hand
              </label>
              <Input
                type="number"
                id="stockPOQty"
                value={formData.stockPOQty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stockPOQty: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <ModalFooter>
              <Button type="submit" color="primary" disabled={posting}>
                Update
              </Button>
              <Button type="button" color="secondary" onClick={toggleEditModal}>
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>

      {/* delete modal */}
      {/* Delete modal */}
      <Modal isOpen={modal_delete} toggle={tog_delete} centered>
        <ModalHeader className="bg-light p-3" toggle={tog_delete}>
          Delete Record
        </ModalHeader>
        <ModalBody>
          <div className="mt-2 text-center">
            <lord-icon
              src="https://cdn.lordicon.com/gsqxdxog.json"
              trigger="loop"
              colors="primary:#f7b84b,secondary:#f06548"
              style={{ width: "100px", height: "100px" }}
            ></lord-icon>
            <div className="mt-4 pt-2 fs-15 mx-4 mx-sm-5">
              <h4>Are you Sure?</h4>
              <p className="text-muted mx-4 mb-0">
                Are you sure you want to remove this record?
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            onClick={() => handleDelete(selectedId)}
            disabled={posting}
          >
            {posting ? "Deleting..." : "Yes! Delete It"}
          </Button>
          <Button color="secondary" onClick={tog_delete} disabled={posting}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default List;
