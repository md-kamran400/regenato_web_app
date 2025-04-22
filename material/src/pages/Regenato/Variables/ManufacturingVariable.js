import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import Flatpickr from "react-flatpickr";
import { toast } from "react-toastify";
import { FaEdit } from "react-icons/fa";
import { RxCountdownTimer } from "react-icons/rx";
import { MdOutlineDelete } from "react-icons/md";
import { Bold } from "feather-icons-react/build/IconComponents";
import MachineDowntimeModal from "./MachineDowntimeModal";
import MachineDowntimeHistory from "./MachineDowntimeHistory";

const ManufacturingVariable = () => {
  const [modal_add, setModalList] = useState(false);
  const [modal_edit, setModalEdit] = useState(false);
  const [modal_delete, setModalDelete] = useState(false);
  const [Sub_modal_delete, setSub_ModalDelete] = useState(false);

  const [subDeleteModalOpen, setSubDeleteModalOpen] = useState(false);
  const [subToDelete, setSubToDelete] = useState(null); // Tracks the subcategory being deleted

  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const [shipmentvars, setshipmentvars] = useState([]);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedShipment, setselectedShipment] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [manufacturingData, setManufacturingData] = useState([]);

  // Machine downtime state
  const [downtimeModalOpen, setDowntimeModalOpen] = useState(false);
  const [downtimeHistoryModalOpen, setDowntimeHistoryModalOpen] =
    useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [selectedParentId, setSelectedParentId] = useState(null);

  const [selectedMachineDetails, setSelectedMachineDetails] = useState(null);
  const [machineDetailsModalOpen, setMachineDetailsModalOpen] = useState(false);

  //sub categroy
  const [modal_add_sub, setModalAddSub] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSubId, setEditingSubId] = useState(null);
  const [selectedManufacturingId, setSelectedManufacturingId] = useState(null);
  const [subFormData, setSubFormData] = useState({
    subcategoryId: "",
    name: "",
    hourlyRate: "",
  });
  const [lastUsedId, setLastUsedId] = useState("");

  // Toggles for modals
  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    hourlyrate: "",
  });

  // Toggles for modals
  const tog_add = () => {
    setModalList(!modal_add); // Open the modal
  };

  const Sub_tog_edit = (item = null) => {
    if (item) {
      setSubFormData({
        subcategoryId: item.subcategoryId,
        name: item.name,
        hourlyRate: item.hourlyRate,
      });
      setEditingSubId(item._id); // Set the ID of the item being edited
    } else {
      setSubFormData({
        subcategoryId: "",
        name: "",
        hourlyRate: "",
      });
      setEditingSubId(null); // Reset the ID if no item is selected
    }
    setIsEditModalOpen(!isEditModalOpen); // Correct toggle state for edit modal
  };

  // Function to toggle 'Delete' modal
  const tog_delete = () => {
    setModalDelete(!modal_delete);
  };

  const handleDeleteSub = (subCategoryId, parentId) => {
    openSubDeleteModal({ _id: subCategoryId, parentId });
  };
  const openSubDeleteModal = (subCategory) => {
    setSubToDelete(subCategory);
    setSubDeleteModalOpen(true);
  };

  const closeSubDeleteModal = () => {
    setSubToDelete(null);
    setSubDeleteModalOpen(false);
  };

  // Function to toggle 'Edit' modal
  const tog_edit = (item = null) => {
    if (item) {
      setFormData({
        categoryId: item.categoryId,
        name: item.name,
        hourlyrate: item.hourlyrate,
      });
      setEditId(item._id); // Set the ID of the item being edited
    } else {
      setFormData({
        categoryId: "",
        name: "",
        hourlyrate: "",
      });
      setEditId(null); // Reset the ID if no item is selected
    }
    setModalEdit(!modal_edit);
  };

  // Machine downtime handlers
  const openDowntimeModal = (machine, parentId) => {
    setSelectedMachine(machine);
    setSelectedParentId(parentId);
    setDowntimeModalOpen(true);
  };

  const closeDowntimeModal = () => {
    setDowntimeModalOpen(false);
    setSelectedMachine(null);
  };

  const openDowntimeHistoryModal = (machine, parentId) => {
    setSelectedMachine(machine);
    setSelectedParentId(parentId);
    setDowntimeHistoryModalOpen(true);
  };

  const closeDowntimeHistoryModal = () => {
    setDowntimeHistoryModalOpen(false);
    setSelectedMachine(null);
  };

  const fetchAllAllocations = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/all-allocations`
      );
      if (!response.ok) throw new Error("Failed to fetch allocations");
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching allocations:", error);
      return [];
    }
  };

  const fetchManufacturing = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch manufacturing data for each category
      const manufacturingResponse = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/manufacturing`
      );
      if (!manufacturingResponse.ok) {
        throw new Error("Failed to fetch manufacturing data");
      }

      const manufacturingData = await manufacturingResponse.json();

      // For each manufacturing entry, fetch the latest status
      const updatedData = await Promise.all(
        manufacturingData.map(async (item) => {
          const statusResponse = await fetch(
            `${process.env.REACT_APP_BASE_URL}/api/manufacturing/category/${item.categoryId}`
          );
          if (!statusResponse.ok) {
            return item; // Return original if status check fails
          }
          const statusData = await statusResponse.json();
          return {
            ...item,
            subCategories: statusData.subCategories || item.subCategories,
          };
        })
      );

      setManufacturingData(updatedData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchManufacturing();
  }, [fetchManufacturing]);

  const handleMachineRowClick = (machine) => {
    if (machine.status === "occupied") {
      setSelectedMachineDetails(machine);
      setMachineDetailsModalOpen(true);
    }
  };

  useEffect(() => {
    const checkAvailability = () => {
      setManufacturingData((prevData) => {
        return prevData.map((process) => {
          const updatedSubCategories = process.subCategories.map((machine) => {
            const now = new Date();
            const isDowntime =
              machine.unavailableUntil &&
              new Date(machine.unavailableUntil) > now;

            // If downtime has expired but status hasn't updated
            if (
              machine.unavailableUntil &&
              new Date(machine.unavailableUntil) <= now
            ) {
              return {
                ...machine,
                isAvailable: true,
                status: "available",
                unavailableUntil: null,
              };
            }
            // Ensure status matches downtime state
            else if (isDowntime && machine.status !== "downtime") {
              return {
                ...machine,
                status: "downtime",
              };
            }
            return machine;
          });
          return {
            ...process,
            subCategories: updatedSubCategories,
          };
        });
      });
    };

    // Check every minute (or more frequently if needed)
    const interval = setInterval(checkAvailability, 60000);

    // Initial check
    checkAvailability();

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      setManufacturingData((prevData) =>
        prevData.map((process) => ({
          ...process,
          subCategories: process.subCategories.map((machine) => {
            // Check if machine should still be in downtime
            if (
              machine.status === "downtime" &&
              machine.downtimeHistory?.length > 0
            ) {
              const latestDowntime =
                machine.downtimeHistory[machine.downtimeHistory.length - 1];
              if (new Date(latestDowntime.endTime) <= now) {
                return {
                  ...machine,
                  status: "available",
                  isAvailable: true,
                };
              }
            }
            return machine;
          }),
        }))
      );
    };

    // Check every minute
    const interval = setInterval(checkStatus, 60000);

    // Initial check
    checkStatus();

    return () => clearInterval(interval);
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubChange = (e) => {
    const { name, value } = e.target;
    setSubFormData({ ...subFormData, [name]: value });
  };

  const handleAddSub = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/manufacturing/${selectedManufacturingId}/subcategories`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subFormData),
        }
      );
      if (!response.ok) throw new Error("Failed to add machine");

      await fetchManufacturing(); // Update the UI
      toast.success("Machine Added Successfully!"); // Show success toast
      setModalAddSub(false);
      setSubFormData({ subcategoryId: "", name: "", hourlyRate: "" });
    } catch (error) {
      toast.error(error.message || "Failed to add machine");
    } finally {
      setPosting(false);
    }
  };

  const handleSubEditSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/manufacturing/${selectedManufacturingId}/subcategories/${editingSubId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subFormData),
        }
      );

      if (!response.ok) throw new Error("Failed to update machine");

      await fetchManufacturing(); // Update the table instantly
      toast.success("Machine updated successfully!"); // Success message

      setIsEditModalOpen(false); // Close the edit modal

      // Reset form
      setSubFormData({ subcategoryId: "", name: "", hourlyRate: "" });
    } catch (error) {
      toast.error(error.message || "Failed to update machine"); // Error message
    } finally {
      setPosting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/manufacturing`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Network response was not ok");
      }

      // Display success toast
      toast.success("Records Added successfully!");

      // Close the modal
      tog_add();

      // Fetch the updated data
      await fetchManufacturing();

      // Reset form data
      setFormData({
        categoryId: "",
        name: "",
        hourlyrate: "",
      });
    } catch (error) {
      setError(
        error.message ||
          error.response?.data?.message ||
          "An unknown error occurred"
      );

      // Display error toast
      toast.error(
        error.message ||
          error.response?.data?.message ||
          "An unknown error occurred"
      );
    } finally {
      setPosting(false);
    }
  };

  // Handle form submission for editing a variable (PUT request)

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/manufacturing/${editId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        // Display success toast
        toast.success("Record updated successfully!");

        // Close the modal
        tog_edit();

        // Fetch the updated data
        await fetchManufacturing();

        // Reset form data
        setFormData({
          categoryId: "",
          name: "",
          hourlyrate: "",
        });
      } else {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      setError(error.message);
      toast.error(error.message || "Failed to update record");
    } finally {
      setPosting(false);
    }
  };

  // Handle delete action

  const handleDelete = async (_id) => {
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/manufacturing/${_id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // Display success toast
      toast.success("Manufacturing Deleted Successfully");

      // Close the modal
      tog_delete();

      // Fetch the updated data
      await fetchManufacturing();
    } catch (error) {
      setError(error.message);
      toast.error(error.message || "Failed to delete record");
    } finally {
      setPosting(false);
    }
  };

  const confirmDeleteSub = async () => {
    try {
      const { _id, parentId } = subToDelete;

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/manufacturing/${parentId}/subcategories/${_id}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to delete machine");

      await fetchManufacturing(); // Refresh the table
      toast.success("Machine deleted successfully!"); // Show success message

      closeSubDeleteModal(); // Close the delete modal
    } catch (error) {
      toast.error(error.message || "Failed to delete machine"); // Show error message
    }
  };

  const handleRowClick = (rowId) => {
    setExpandedRowId(expandedRowId === rowId ? null : rowId);
  };

  // Function to get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "available":
        return { color: "green", text: "Available" };
      case "occupied":
        return { color: "orange", text: "Occupied" };
      case "downtime":
        return { color: "red", text: "Downtime" };
      default:
        return { color: "gray", text: "Unknown" };
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <React.Fragment>
      {/* Manufacturing Table */}
      <Row>
        <Col lg={12}>
          <Card style={{ marginBottom: "10rem" }}>
            <CardHeader>
              <h4 className="card-title mb-0">Manufacturing Variable</h4>
            </CardHeader>
            <CardBody>
              <Row className="g-4 mb-3">
                <Col className="col-sm-auto">
                  <div>
                    <Button
                      color="success"
                      className="add-btn me-1"
                      onClick={tog_add}
                    >
                      <i className="ri-add-line align-bottom me-1"></i> Add
                    </Button>
                  </div>
                </Col>
                <Col className="col-sm">
                  <div className="d-flex justify-content-sm-end">
                    <div className="search-box ms-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search..."
                      />
                      <i className="ri-search-line search-icon"></i>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Table */}
              <div className="table-responsive table-card mt-3 mb-1">
                {loading ? (
                  <div>
                    <div className="loader-overlay">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <table className="table align-middle table-nowrap">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Hourly Rate (INR)</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {manufacturingData.map((item) => (
                        <React.Fragment key={item._id}>
                          <tr>
                            <td>{item.categoryId}</td>
                            <td>
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleRowClick(item._id);
                                }}
                                style={{
                                  color: "#007bff",
                                  textDecoration: "none",
                                }}
                              >
                                {item.name}
                              </a>
                            </td>
                            <td>{item.hourlyrate}</td>
                            <td>
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-success edit-item-btn"
                                  onClick={() => tog_edit(item)}
                                >
                                  <FaEdit size={15} />
                                </button>
                                <button
                                  className="btn btn-sm btn-danger remove-item-btn"
                                  onClick={() => {
                                    setSelectedId(item._id);
                                    tog_delete();
                                  }}
                                >
                                  <MdOutlineDelete size={17} />
                                </button>
                                <button
                                  className="btn btn-sm btn-primary add-sub-btn"
                                  onClick={() => {
                                    setSelectedManufacturingId(item._id);
                                    setModalAddSub(true);
                                  }}
                                >
                                  Add Machine
                                </button>
                              </div>
                            </td>
                          </tr>
                          {expandedRowId === item._id && (
                            <tr>
                              <td colSpan={4}>
                                <div className="details-box">
                                  <h5 className="mb-3 d-flex align-items-center">
                                    Machines
                                  </h5>
                                  <Col className="col-sm-auto"></Col>

                                  <table className="table align-middle table-nowrap">
                                    <thead className="table-light">
                                      <tr>
                                        <th>Machine ID</th>
                                        <th>Machine Name</th>
                                        <th>Hourly Rate (INR)</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {item.subCategories.map((subCategory) => {
                                        const status =
                                          subCategory.status ||
                                          (subCategory.isAvailable
                                            ? "available"
                                            : "occupied");
                                        const statusBadge =
                                          getStatusBadge(status);

                                        return (
                                          <tr
                                            key={subCategory.subcategoryId}
                                            style={{
                                              backgroundColor:
                                                subCategory.status ===
                                                "occupied"
                                                  ? "#fff3cd"
                                                  : "transparent",
                                              cursor:
                                                subCategory.status ===
                                                "occupied"
                                                  ? "pointer"
                                                  : "default",
                                            }}
                                          >
                                            <td>{subCategory.subcategoryId}</td>
                                            <td>{subCategory.name} </td>
                                            <td>{subCategory.hourlyRate}</td>

                                            <td
                                              onClick={() =>
                                                handleMachineRowClick(
                                                  subCategory
                                                )
                                              }
                                            >
                                              {subCategory.status ===
                                              "occupied" ? (
                                                <span
                                                  style={{
                                                    color: "red",
                                                    fontWeight: "bold",
                                                  }}
                                                >
                                                  Occupied
                                                  {subCategory.allocations
                                                    ?.length > 0 && (
                                                    <small
                                                      style={{
                                                        display: "block",
                                                        fontWeight: "normal",
                                                      }}
                                                    >
                                                      Until:{" "}
                                                      {formatDate(
                                                        subCategory
                                                          .allocations[0]
                                                          .endDate
                                                      )}
                                                    </small>
                                                  )}
                                                </span>
                                              ) : subCategory.status ===
                                                "downtime" ? (
                                                <span
                                                  style={{
                                                    color: "orange",
                                                    fontWeight: "bold",
                                                  }}
                                                >
                                                  Downtime
                                                  {subCategory.downtimeHistory
                                                    ?.length > 0 && (
                                                    <>
                                                      <small
                                                        style={{
                                                          display: "block",
                                                          fontWeight: "normal",
                                                        }}
                                                      >
                                                        Reason:{" "}
                                                        {
                                                          subCategory
                                                            .downtimeHistory[
                                                            subCategory
                                                              .downtimeHistory
                                                              .length - 1
                                                          ].reason
                                                        }
                                                      </small>
                                                      <small
                                                        style={{
                                                          display: "block",
                                                          fontWeight: "normal",
                                                        }}
                                                      >
                                                        Until:{" "}
                                                        {formatDate(
                                                          subCategory
                                                            .downtimeHistory[
                                                            subCategory
                                                              .downtimeHistory
                                                              .length - 1
                                                          ].endTime
                                                        )}
                                                      </small>
                                                    </>
                                                  )}
                                                </span>
                                              ) : (
                                                <span
                                                  style={{ color: "green" }}
                                                >
                                                  Available
                                                </span>
                                              )}
                                            </td>
                                            <td className="d-flex gap-2">
                                              <button
                                                className="btn btn-sm btn-success"
                                                onClick={() => {
                                                  Sub_tog_edit(subCategory);
                                                  setSelectedManufacturingId(
                                                    item._id
                                                  );
                                                }}
                                              >
                                                <FaEdit size={15} />
                                              </button>

                                              <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() =>
                                                  handleDeleteSub(
                                                    subCategory._id,
                                                    item._id
                                                  )
                                                }
                                              >
                                                <MdOutlineDelete size={17} />
                                              </button>
                                              <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() =>
                                                  openDowntimeModal(
                                                    subCategory,
                                                    item._id
                                                  )
                                                }
                                              >
                                                <RxCountdownTimer
                                                  size={15}
                                                  style={{ fontWeight: "bold" }}
                                                />
                                              </button>
                                              <button
                                                className="btn btn-sm btn-info"
                                                onClick={() =>
                                                  openDowntimeHistoryModal(
                                                    subCategory,
                                                    item._id
                                                  )
                                                }
                                              >
                                                History
                                              </button>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                )}
                <div className="noresult" style={{ display: "none" }}>
                  <div className="text-center">
                    <lord-icon
                      src="https://cdn.lordicon.com/msoeawqm.json"
                      trigger="loop"
                      style={{ width: "75px", height: "75px" }}
                    ></lord-icon>
                    <h5 className="mt-2">Sorry! No Result Found</h5>
                    <p className="text-muted mb-0">
                      We couldn't find any results for your search.
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Add Modal */}
      <Modal isOpen={modal_add} toggle={tog_add} centered>
        <ModalHeader className="bg-light p-3" toggle={tog_add}>
          Add Manufacturing Variable
        </ModalHeader>
        <ModalBody>
          <form className="tablelist-form" onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="id-field" className="form-label">
                ID
              </label>
              <input
                type="text"
                id="categoryId-field"
                className="form-control"
                name="categoryId"
                placeholder="Enter Category ID"
                value={formData.categoryId}
                onChange={handleChange}
                require
              />
            </div>

            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <input
                type="text"
                id="name-field"
                className="form-control"
                name="name"
                placeholder="Enter Name"
                value={formData.name}
                onChange={handleChange}
                require
              />
            </div>

            <div className="mb-3">
              <label htmlFor="hourlyrate-field" className="form-label">
                Hourly Rate (INR)
              </label>
              <input
                type="number"
                id="hourlyrate-field"
                className="form-control"
                name="hourlyrate"
                placeholder="Enter Hourly Rate"
                value={formData.hourlyrate}
                onChange={handleChange}
                // require
              />
            </div>

            <ModalFooter>
              <Button color="secondary" onClick={tog_add} disabled={posting}>
                Cancel
              </Button>
              <Button color="success" type="submit" disabled={posting}>
                {posting ? "Adding..." : "Add Variable"}
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={modal_edit} toggle={tog_edit}>
        <ModalHeader toggle={tog_edit}>Edit Manufacturing Variable</ModalHeader>
        <ModalBody>
          <form onSubmit={handleEditSubmit}>
            <div className="mb-3">
              <label htmlFor="id" className="form-label">
                Category ID
              </label>
              <input
                type="text"
                className="form-control"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="hourlyrate" className="form-label">
                Hourly Rate
              </label>
              <input
                type="number"
                className="form-control"
                name="hourlyrate"
                value={formData.hourlyrate}
                onChange={handleChange}
                required
              />
            </div>
            <ModalFooter>
              <Button color="success" type="submit" disabled={posting}>
                {posting ? "Saving..." : "Save"}
              </Button>
              <Button color="secondary" onClick={tog_edit} disabled={posting}>
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>

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

      {/* Add Sub Modal */}
      <Modal isOpen={modal_add_sub} toggle={() => setModalAddSub(false)}>
        <ModalHeader toggle={() => setModalAddSub(false)}>
          Add Machine
        </ModalHeader>
        <ModalBody>
          <form className="tablelist-form" onSubmit={handleAddSub}>
            <div className="mb-3">
              <label
                for="subcategoryId"
                htmlFor="id-field"
                className="form-label"
              >
                {" "}
                Machine ID
              </label>
              <input
                type="text"
                id="subcategoryId"
                className="form-control"
                name="subcategoryId"
                value={subFormData.subcategoryId}
                onChange={handleSubChange}
                placeholder="Enter Machines ID"
                required
              />
            </div>

            {/* </FormGroup> */}
            <div className="mb-3">
              <label for="name" htmlFor="id-field" className="form-label">
                Machine Name
              </label>
              <input
                type="text"
                id="name"
                className="form-control"
                name="name"
                value={subFormData.name}
                placeholder="Enter Machines Name"
                onChange={handleSubChange}
                required
              />
            </div>

            <div className="mb-3">
              <label for="hourlyRate" htmlFor="id-field" className="form-label">
                Machine Hourly Rate
              </label>
              <input
                type="number"
                id="hourlyRate"
                name="hourlyRate"
                className="form-control"
                value={subFormData.hourlyRate}
                placeholder="Enter Machines Hourly Rate"
                onChange={handleSubChange}
                required
              />
            </div>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setModalAddSub(false)}>
            Cancel
          </Button>
          <Button color="primary" type="submit" onClick={handleAddSub}>
            Add Machine
          </Button>
        </ModalFooter>
      </Modal>

      {/* sub edit modal */}
      <Modal isOpen={isEditModalOpen} toggle={Sub_tog_edit}>
        <ModalHeader toggle={Sub_tog_edit}>Edit Machine</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubEditSubmit}>
            <div className="mb-3">
              <label htmlFor="id" className="form-label">
                Machine ID
              </label>
              <input
                type="text"
                className="form-control"
                name="subcategoryId"
                value={subFormData.subcategoryId}
                onChange={handleSubChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Machine Name
              </label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={subFormData.name}
                onChange={handleSubChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="hourlyrate" className="form-label">
                Machine Hourly Rate
              </label>
              <input
                type="number"
                className="form-control"
                name="hourlyRate"
                value={subFormData.hourlyRate}
                onChange={handleSubChange}
                required
              />
            </div>
            <ModalFooter>
              <Button color="success" type="submit" disabled={posting}>
                {posting ? "Saving..." : "Save "}
              </Button>
              <Button
                color="secondary"
                onClick={() => Sub_tog_edit(null)}
                disabled={posting}
              >
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>

      <Modal isOpen={subDeleteModalOpen} toggle={closeSubDeleteModal} centered>
        <ModalHeader toggle={closeSubDeleteModal}>Delete Machine</ModalHeader>
        <ModalBody>
          <div className="mt-2 text-center">
            <lord-icon
              src="https://cdn.lordicon.com/gsqxdxog.json"
              trigger="loop"
              colors="primary:#f7b84b,secondary:#f06548"
              style={{ width: "100px", height: "100px" }}
            ></lord-icon>
            <div className="mt-4 pt-2 fs-15 mx-4 mx-sm-5">
              <h4>Are you sure?</h4>
              <p className="text-muted mx-4 mb-0">
                Are you sure you want to delete the Machine
                <strong>{subToDelete?.name}</strong>?
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={confirmDeleteSub}>
            Yes, Delete It!
          </Button>
          <Button color="secondary" onClick={closeSubDeleteModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/*  */}

      {/* Machine Downtime Modal */}
      {selectedMachine && (
        <MachineDowntimeModal
          isOpen={downtimeModalOpen}
          toggle={closeDowntimeModal}
          machine={selectedMachine}
          parentId={selectedParentId}
          onSuccess={fetchManufacturing}
        />
      )}

      <Modal
        isOpen={machineDetailsModalOpen}
        toggle={() => setMachineDetailsModalOpen(false)}
      >
        <ModalHeader toggle={() => setMachineDetailsModalOpen(false)}>
          Machine Occupation Details
        </ModalHeader>
        <ModalBody>
          {selectedMachineDetails ? (
            <>
              <p>
                <strong>Machine ID:</strong>{" "}
                {selectedMachineDetails.subcategoryId}
              </p>
              <p>
                <strong>Machine Name:</strong> {selectedMachineDetails.name}
              </p>
              {selectedMachineDetails.allocations &&
              selectedMachineDetails.allocations.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Start Date</th>
                      <th>End Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedMachineDetails.allocations.map((alloc, index) => (
                      <tr key={index}>
                        <td>{new Date(alloc.startDate).toLocaleString()}</td>
                        <td>{new Date(alloc.endDate).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No allocation data available.</p>
              )}
            </>
          ) : (
            <p>No machine selected.</p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            onClick={() => setMachineDetailsModalOpen(false)}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Machine Downtime History Modal */}
      {selectedMachine && (
        <MachineDowntimeHistory
          isOpen={downtimeHistoryModalOpen}
          toggle={closeDowntimeHistoryModal}
          machine={selectedMachine}
          parentId={selectedParentId}
        />
      )}
    </React.Fragment>
  );
};

export default ManufacturingVariable;
