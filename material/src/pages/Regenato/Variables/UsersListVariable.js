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
  Container,
} from "reactstrap";
import Flatpickr from "react-flatpickr";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import { FaEdit } from "react-icons/fa";
import { MdOutlineDelete } from "react-icons/md";
import LeaveModal from "./LeaveModal";
import { FcLeave, FcViewDetails } from "react-icons/fc";
import { Tooltip } from "bootstrap";
import { FaRegEye } from "react-icons/fa";

const UsersListVariable = () => {
  const userRole = localStorage.getItem("userRole");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [modal_add, setModalList] = useState(false);
  const [modal_edit, setModalEdit] = useState(false);
  const [modal_delete, setModalDelete] = useState(false);
  const [usersData, setUserdata] = useState([]);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processOptions, setProcessOptions] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    processName: [],
  });

  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const tog_add = () => {
    setModalList(!modal_add);
  };

  const tog_delete = () => {
    setModalDelete(!modal_delete);
  };

  const handleProcessClick = (index) => {
    setIsModalOpen(!isModalOpen);
    setExpandedRow(isModalOpen ? null : index);
    setCurrentItem(usersData[index]);
  };

  const tog_edit = (item) => {
    setEditData(item);
    setFormData({
      categoryId: item?.categoryId || "",
      name: item?.name || "",
      processName: item?.processName || [],
    });
    setModalEdit(!modal_edit);
  };

  const handleLeaveRequest = (user) => {
    setSelectedUser(user);
    setLeaveModalOpen(true);
  };

  const fetchusersData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Determine API endpoint based on user role
      const apiUrl = userRole === "admin" 
        ? `${process.env.REACT_APP_BASE_URL}/api/userVariable`
        : `${process.env.REACT_APP_BASE_URL}/api/userVariable/filteruser`;
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setUserdata(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [userRole]); // Add userRole to dependencies

  useEffect(() => {
    fetchusersData();
  }, [fetchusersData]);

  const fetchProcessNames = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/manufacturing`
      );
      if (!response.ok) throw new Error("Failed to fetch process names");
      const data = await response.json();
      setProcessOptions(
        data.map((item) => ({ label: item.name, value: item.name }))
      );
    } catch (error) {
      setError(error.message);
    }
  }, []);

  useEffect(() => {
    fetchProcessNames();
  }, [fetchProcessNames]);

  const handleProcessChange = (selectedOptions) => {
    setFormData({
      ...formData,
      processName: selectedOptions.map((option) => option.value),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError(null);

    const dataToSubmit = {
      ...formData,
      shifts: parseInt(formData.shifts),
    };

    try {
      const method = editData ? "PUT" : "POST";
      const url = editData
        ? `${process.env.REACT_APP_BASE_URL}/api/userVariable/${editData._id}`
        : `${process.env.REACT_APP_BASE_URL}/api/userVariable`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Network error");
      }
      toast.success(
        editData
          ? "Record Updated successfully!"
          : "Records Added successfully!"
      );
      setFormData({ categoryId: "", name: "", processName: [], shifts: 0 });
      editData ? tog_edit() : tog_add();
      await fetchusersData();
    } catch (error) {
      toast.error(error.message || "An error occurred");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (_id) => {
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/userVariable/${_id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      await fetchusersData();
      tog_delete();
    } catch (error) {
      setError(error.message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <React.Fragment>
      <Row>
        <Col lg={12}>
          <Card style={{ marginBottom: "10rem" }}>
            <CardHeader>
              <h4 className="card-title mb-0">Operators</h4>
            </CardHeader>
            <CardBody>
              <div className="listjs-table" id="customerList">
                <Row className="g-4 mb-3">
                  {userRole === "admin" && (
                    <Col className="col-sm-auto">
                      <div>
                        <Button
                          color="success"
                          className="add-btn me-1"
                          onClick={tog_add}
                          id="create-btn"
                        >
                          <i className="ri-add-line align-bottom me-1"></i> Add
                        </Button>
                      </div>
                    </Col>
                  )}
                  <Col className="col-sm">
                    <div className="d-flex justify-content-sm-end">
                      <div className="search-box ms-2">
                        <input
                          type="text"
                          className="form-control search"
                          placeholder="Search..."
                        />
                        <i className="ri-search-line search-icon"></i>
                      </div>
                    </div>
                  </Col>
                </Row>

                <div className="table-responsive table-card mt-3 mb-1">
                  <table
                    className="table align-middle table-nowrap"
                    id="customerTable"
                  >
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Process Name</th>
                        <th>Today Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody className="list form-check-all">
                      {usersData.length > 0 ? (
                        usersData.map((item, index) => (
                          <tr key={item.id}>
                            <td>{item.categoryId}</td>
                            <td>{item.name}</td>

                            <td>
                              <span onClick={() => handleProcessClick(index)}>
                                {item.processName.length > 1 ? (
                                  <span
                                    style={{
                                      color: "#007bff",
                                      textDecoration: "none",
                                    }}
                                  >
                                    {item.processName[0]} ...{""}
                                  </span>
                                ) : (
                                  item.processName.join(", ")
                                )}
                              </span>
                            </td>
                            <td>
                              {(() => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                
                                const isOnLeaveToday = item.leavePeriod?.some(leave => {
                                  const leaveStart = new Date(leave.startDate);
                                  const leaveEnd = new Date(leave.endDate);
                                  leaveStart.setHours(0, 0, 0, 0);
                                  leaveEnd.setHours(0, 0, 0, 0);
                                  
                                  return today >= leaveStart && today <= leaveEnd;
                                });

                                if (isOnLeaveToday) {
                                  return (
                                    <span style={{ fontWeight: "bold", color: "red" }}>
                                      On Leave
                                    </span>
                                  );
                                } else {
                                  return (
                                    <span style={{ fontWeight: "bold", color: "green" }}>
                                      Active
                                    </span>
                                  );
                                }
                              })()}
                            </td>

                            <td>
                              <div className="d-flex gap-2">
                                {userRole === "admin" && (
                                  <button
                                    className="btn btn-sm btn-success edit-item-btn"
                                    data-bs-target="#showModal"
                                    onClick={() => tog_edit(item)}
                                  >
                                    <FaEdit size={15} />
                                  </button>
                                )}
                                {userRole === "admin" && (
                                  <button
                                    className="btn btn-sm btn-danger remove-item-btn"
                                    data-bs-target="#deleteRecordModal"
                                    onClick={() => {
                                      setSelectedId(item._id);
                                      tog_delete();
                                    }}
                                  >
                                    <MdOutlineDelete size={17} />
                                  </button>
                                )}
                                <Button
                                  color="info"
                                  size="sm"
                                  className="me-2"
                                  onClick={() => handleLeaveRequest(item)}
                                >
                                  {item.leavePeriod &&
                                  item.leavePeriod.length > 0 ? (
                                    // <FaRegEye size={20} />
                                    <FcLeave size={20} />
                                  ) : (
                                    <FcLeave size={20} />
                                  )}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <div>
                            <div className="loader-overlay">
                              <div
                                className="spinner-border text-primary"
                                role="status"
                              >
                                <span className="visually-hidden">
                                  Loading...
                                </span>
                              </div>
                            </div>
                          </div>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Add Modal */}
      <Modal isOpen={modal_add} toggle={tog_add} centered>
        <ModalHeader toggle={tog_add}>Add</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Category ID</label>
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
              <label className="form-label">Name</label>
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
              <label className="form-label">Process Name</label>
              <Select
                isMulti
                options={processOptions}
                value={processOptions.filter((option) =>
                  formData.processName.includes(option.value)
                )}
                onChange={handleProcessChange}
                styles={{
                  control: (provided) => ({
                    ...provided,
                    backgroundColor: "white",
                    color: "black",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: "black",
                  }),
                  multiValueLabel: (provided) => ({
                    ...provided,
                    color: "black",
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: "white",
                  }),
                }}
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
      <Modal isOpen={modal_edit} toggle={tog_edit} centered>
        <ModalHeader toggle={tog_edit}>Edit</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Category ID</label>
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
              <label className="form-label">Name</label>
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
              <label className="form-label">Process Name</label>
              <Select
                isMulti
                options={processOptions}
                value={processOptions.filter((option) =>
                  formData.processName?.includes(option.value)
                )}
                onChange={handleProcessChange}
                styles={{
                  control: (provided) => ({
                    ...provided,
                    backgroundColor: "white",
                    color: "black",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: "black",
                  }),
                  multiValueLabel: (provided) => ({
                    ...provided,
                    color: "black",
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: "white",
                  }),
                }}
              />
            </div>

            <ModalFooter>
              <Button color="secondary" onClick={tog_edit} disabled={posting}>
                Cancel
              </Button>
              <Button color="success" type="submit" disabled={posting}>
                {posting ? "Updating..." : "Update Variable"}
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

      {/* Modal for displaying all process names */}
      <Modal
        isOpen={isModalOpen}
        toggle={() => setIsModalOpen(!isModalOpen)}
        centered
      >
        <ModalHeader toggle={() => setIsModalOpen(!isModalOpen)}>
          Process Names
        </ModalHeader>
        <ModalBody>
          <ol>
            {currentItem &&
              currentItem.processName.map((processName, index) => (
                <li key={index}>{processName}</li>
              ))}
          </ol>
        </ModalBody>
        <ModalFooter>
          <Button color="success" onClick={() => setIsModalOpen(!isModalOpen)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {selectedUser && (
        <LeaveModal
          isOpen={leaveModalOpen}
          toggle={() => setLeaveModalOpen(false)}
          userId={selectedUser._id}
          userName={selectedUser.name}
          onLeaveSubmit={() => {
            fetchusersData();
          }}
        />
      )}
    </React.Fragment>
  );
};

export default UsersListVariable;
