import React, { useEffect, useState } from "react";
import axios from "axios";
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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit } from "react-icons/fa";
import { MdOutlineDelete } from "react-icons/md";
const ShiftVariable = () => {
  const [shiftData, setShiftData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  // Update the initial formData state:
  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    StartTime: "",
    EndTime: "",
    LaunchStartTime: "",
    LaunchEndTime: "",
    TotalHours: "",
  });
  const [posting, setPosting] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [modal_delete, setModal_delete] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);

  useEffect(() => {
    fetchShiftData();
  }, []);

  const handleDelete = async (id) => {
    setSelectedId(id);
    setModal_delete(true);
  };

  // Update the handleEdit function to include new fields:
  const handleEdit = (shift) => {
    setSelectedShift(shift);
    setFormData({
      categoryId: shift.categoryId,
      name: shift.name,
      StartTime: shift.StartTime,
      EndTime: shift.EndTime,
      LaunchStartTime: shift.LaunchStartTime,
      LaunchEndTime: shift.LaunchEndTime,
      TotalHours: shift.TotalHours,
    });
    setEditModalOpen(true);
  };

  const fetchShiftData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/shiftVariable`
      );

      // Check if the response data is actually an array
      if (Array.isArray(response.data)) {
        setShiftData(response.data);
        generateNextId(response.data);
      } else {
        console.warn("Response data is not an array:", response.data);
        setShiftData([]);
      }
    } catch (error) {
      console.error("Error fetching shift data:", error);
      toast.error("Failed to fetch shift data.");
    }
  };

  const generateNextId = (data) => {
    if (data.length === 0) {
      setFormData((prev) => ({ ...prev, categoryId: "S1" }));
      return;
    }
    const lastShift = data[data.length - 1];
    const lastId = lastShift.categoryId;
    const match = lastId.match(/S(\d+)/);

    if (match) {
      const nextNumber = parseInt(match[1]) + 1;
      setFormData((prev) => ({ ...prev, categoryId: `S${nextNumber}` }));
    } else {
      setFormData((prev) => ({ ...prev, categoryId: "S1" }));
    }
  };

  // Update the handleChange function to calculate launch times:
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value,
    };

    // Calculate TotalHours if StartTime or EndTime changes
    if (name === "StartTime" || name === "EndTime") {
      newFormData.TotalHours = calculateTotalHours(
        name === "StartTime" ? value : formData.StartTime,
        name === "EndTime" ? value : formData.EndTime
      );

      // Calculate launch times when times change
      if (newFormData.StartTime && newFormData.EndTime) {
        const launchTimes = calculateLaunchTimes(
          newFormData.StartTime,
          newFormData.EndTime
        );
        newFormData.LaunchStartTime = launchTimes.launchStart;
        newFormData.LaunchEndTime = launchTimes.launchEnd;
      }
    }

    setFormData(newFormData);
  };

  // Add this new function to calculate launch times:
  const calculateLaunchTimes = (startTime, endTime) => {
    if (!startTime || !endTime) return { launchStart: "", launchEnd: "" };

    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);

    // If end time is next day (like 02:00), add 24 hours
    if (end <= start) {
      end.setHours(end.getHours() + 24);
    }

    // Calculate midpoint of the shift
    const midpoint = new Date(
      start.getTime() + (end.getTime() - start.getTime()) / 2
    );

    // Set launch break to be 1 hour centered around midpoint (30 min before and after)
    const launchStart = new Date(midpoint.getTime() - 30 * 60000);
    const launchEnd = new Date(midpoint.getTime() + 30 * 60000);

    // Format back to HH:mm
    const formatTime = (date) => {
      const hours = date.getHours().toString().padStart(2, "0");
      const mins = date.getMinutes().toString().padStart(2, "0");
      return `${hours}:${mins}`;
    };

    return {
      launchStart: formatTime(launchStart),
      launchEnd: formatTime(launchEnd),
    };
  };

  const calculateTotalHours = (start, end) => {
    if (!start || !end) return "";
    const startTime =
      parseInt(start.split(":")[0]) + parseInt(start.split(":")[1]) / 60;
    const endTime =
      parseInt(end.split(":")[0]) + parseInt(end.split(":")[1]) / 60;
    let total = endTime - startTime;
    if (total < 0) total += 24;
    return total.toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/shiftVariable`,
        formData
      );
      toast.success("Shift variable added successfully!");
      fetchShiftData();
      setModalOpen(false);
      setFormData({
        categoryId: "",
        name: "",
        StartTime: "",
        EndTime: "",
        TotalHours: "",
      });
    } catch (error) {
      console.error("Error adding shift variable:", error);
      toast.error("Failed to add shift variable.");
    }
    setPosting(false);
  };

  const deleteRecord = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_BASE_URL}/api/shiftVariable/${selectedId}`
      );
      toast.success("Shift variable deleted successfully!");
      fetchShiftData();
      setSelectedId(null);
      setModal_delete(false);
    } catch (error) {
      console.error("Error deleting shift variable:", error);
      toast.error("Failed to delete shift variable.");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/shiftVariable/${selectedShift._id}`,
        formData
      );
      toast.success("Shift variable updated successfully!");
      fetchShiftData();
      setEditModalOpen(false);
    } catch (error) {
      console.error("Error updating shift variable:", error);
      toast.error("Failed to update shift variable.");
    }
    setPosting(false);
  };

  return (
    <React.Fragment>
      <ToastContainer position="top-right" autoClose={3000} />
      <Row>
        <Col lg={12}>
          <Card style={{ marginBottom: "10rem" }}>
            <CardHeader>
              <h4 className="card-title mb-0">Shift Variables</h4>
            </CardHeader>
            <CardBody>
              <Row className="g-4 mb-3">
                <Col className="col-sm-auto">
                  <Button
                    color="success"
                    className="add-btn me-1"
                    onClick={() => {
                      generateNextId(shiftData);
                      setModalOpen(true);
                    }}
                  >
                    <i className="ri-add-line align-bottom me-1"></i> Add
                  </Button>
                </Col>
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
                <table className="table align-middle table-nowrap">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Launch Start</th>
                      <th>Launch End</th>
                      <th>Total Hours</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shiftData.length > 0 ? (
                      shiftData.map((shift) => (
                        <tr key={shift._id}>
                          <td>{shift.categoryId}</td>
                          <td>{shift.name}</td>
                          <td>{shift.StartTime}</td>
                          <td>{shift.EndTime}</td>
                          <td>{shift.LaunchStartTime}</td>
                          <td>{shift.LaunchEndTime}</td>
                          <td>{shift.TotalHours}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                className="btn btn-sm btn-success edit-item-btn"
                                onClick={() => handleEdit(shift)}
                              >
                                <FaEdit size={15} />
                              </Button>
                              <Button
                                className="btn btn-sm btn-danger remove-item-btn"
                                onClick={() => {
                                  handleDelete(shift._id);
                                  setModal_delete(true);
                                }}
                                disabled={posting}
                              >
                                <MdOutlineDelete size={17} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Add Modal */}
      <Modal
        isOpen={modalOpen}
        toggle={() => setModalOpen(!modalOpen)}
        centered
      >
        <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
          Add Shift Variable
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">ID</label>
              <input
                type="text"
                className="form-control"
                name="categoryId"
                value={formData.categoryId}
                readOnly
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

            {/* Shift Times Row */}
            <div className="d-flex gap-3 mb-3">
              <div className="flex-grow-1">
                <label className="form-label">Start Time</label>
                <input
                  type="time"
                  className="form-control"
                  name="StartTime"
                  value={formData.StartTime}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex-grow-1">
                <label className="form-label">End Time</label>
                <input
                  type="time"
                  className="form-control"
                  name="EndTime"
                  value={formData.EndTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Launch Times Row */}
            <div className="d-flex gap-3 mb-3">
              <div className="flex-grow-1">
                <label className="form-label">Launch Start Time</label>
                <input
                  type="time"
                  className="form-control"
                  name="LaunchStartTime"
                  value={formData.LaunchStartTime}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex-grow-1">
                <label className="form-label">Launch End Time</label>
                <input
                  type="time"
                  className="form-control"
                  name="LaunchEndTime"
                  value={formData.LaunchEndTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Total Working Hours</label>
              <input
                type="text"
                className="form-control"
                value={formData.TotalHours}
                readOnly
              />
            </div>
            <ModalFooter>
              <Button
                color="secondary"
                onClick={() => setModalOpen(false)}
                disabled={posting}
              >
                Cancel
              </Button>
              <Button color="success" type="submit" disabled={posting}>
                {posting ? "Adding..." : "Add Variable"}
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>

      {/* edit modal */}
      <Modal
        isOpen={editModalOpen}
        toggle={() => setEditModalOpen(!editModalOpen)}
        centered
      >
        <ModalHeader toggle={() => setEditModalOpen(!editModalOpen)}>
          Edit Shift Variable
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleUpdate}>
            <div className="mb-3">
              <label className="form-label">ID</label>
              <input
                type="text"
                className="form-control"
                name="categoryId"
                value={formData.categoryId}
                readOnly
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
              <label className="form-label">Start Time</label>
              <input
                type="time"
                className="form-control"
                name="StartTime"
                value={formData.StartTime}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">End Time</label>
              <input
                type="time"
                className="form-control"
                name="EndTime"
                value={formData.EndTime}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Launch Start Time</label>
              <input
                type="time"
                className="form-control"
                name="LaunchStartTime"
                value={formData.LaunchStartTime}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Launch End Time</label>
              <input
                type="time"
                className="form-control"
                name="LaunchEndTime"
                value={formData.LaunchEndTime}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Total Hours</label>
              <input
                type="text"
                className="form-control"
                value={formData.TotalHours}
                readOnly
              />
            </div>
            <ModalFooter>
              <Button
                color="secondary"
                onClick={() => setEditModalOpen(false)}
                disabled={posting}
              >
                Cancel
              </Button>
              <Button color="success" type="submit" disabled={posting}>
                {posting ? "Updating..." : "Update"}
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={modal_delete}
        toggle={() => setModal_delete(!modal_delete)}
        centered
      >
        <ModalHeader
          className="bg-light p-3"
          toggle={() => setModal_delete(!modal_delete)}
        >
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
          <Button color="danger" onClick={deleteRecord} disabled={posting}>
            {posting ? "Deleting..." : "Yes! Delete It"}
          </Button>
          <Button
            color="secondary"
            onClick={() => setModal_delete(false)}
            disabled={posting}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default ShiftVariable;
