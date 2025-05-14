import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Table,
} from "reactstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { FaTrash } from "react-icons/fa";

const LeaveModal = ({ isOpen, toggle, userId, userName, onLeaveSubmit }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveData, setLeaveData] = useState([]);
  const [showAddLeaveModal, setShowAddLeaveModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchLeaveData();
    }
  }, [isOpen, userId]);

  const fetchLeaveData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/userVariable/leave/${userId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch leave data");
      }
      const data = await response.json();
      setLeaveData(data.leavePeriod || []);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!startDate || !endDate || !reason) {
      toast.error("Please fill all fields: Start Date, End Date, Reason");
      return;
    }

    if (endDate < startDate) {
      toast.error("End date must be after start date");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/userVariable/${userId}/leave`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startDate,
            endDate,
            reason,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit leave request");
      }

      toast.success("Leave added successfully");
      setShowAddLeaveModal(false);
      fetchLeaveData();
      if (onLeaveSubmit) onLeaveSubmit();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLeave = async (index) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/userVariable/${userId}/leave/${index}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete leave");
      }

      toast.success("Leave deleted successfully");
      setShowAddLeaveModal(false);
      //   fetchLeaveData();
      if (onLeaveSubmit) onLeaveSubmit();
      fetchLeaveData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setShowDeleteConfirmation(false);
    }
  };

  const confirmDelete = (index) => {
    setLeaveToDelete(index);
    setShowDeleteConfirmation(true);
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>Leave Management - {userName}</ModalHeader>
      <ModalBody>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "20px",
          }}
        >
          <Button color="primary" onClick={() => setShowAddLeaveModal(true)}>
            Add Leave
          </Button>
        </div>
        <Table striped>
          <thead>
            <tr>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Reason</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {leaveData.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  <p
                    style={{
                      fontSize: "15px",
                      fontWeight: "bold",
                      color: "red",
                    }}
                  >
                    No leave records found
                  </p>
                </td>
              </tr>
            ) : (
              leaveData.map((leave, index) => (
                <tr key={index}>
                  <td>
                    {new Date(leave.startDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    {new Date(leave.endDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>

                  <td>{leave.reason}</td>
                  <td>
                    <Button
                      color="danger"
                      size="sm"
                      onClick={() => confirmDelete(index)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>

      <Modal
        isOpen={showAddLeaveModal}
        toggle={() => setShowAddLeaveModal(false)}
      >
        <ModalHeader toggle={() => setShowAddLeaveModal(false)}>
          Add Leave - {userName}
        </ModalHeader>
        <Form onSubmit={handleSubmit}>
          <ModalBody>
            <div className="d-flex justify-content-between">
              <FormGroup className="w-50 me-2">
                <Label>Start Date</Label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  dateFormat="dd/MM/yyyy"
                  minDate={new Date()}
                  className="form-control"
                  placeholderText="Select start date"
                />
              </FormGroup>
              <FormGroup className="w-50">
                <Label>End Date</Label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  dateFormat="dd/MM/yyyy"
                  minDate={startDate || new Date()}
                  className="form-control"
                  placeholderText="Select end date"
                />
              </FormGroup>
            </div>

            <FormGroup>
              <Label>Reason</Label>
              <textarea
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for leave"
                required
                className="form-control"
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              onClick={() => setShowAddLeaveModal(false)}
            >
              Cancel
            </Button>
            <Button color="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Leave"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirmation}
        toggle={() => setShowDeleteConfirmation(false)}
      >
        <ModalHeader toggle={() => setShowDeleteConfirmation(false)}>
          Confirm Delete
        </ModalHeader>
        <ModalBody>
          Are you sure you want to delete this leave record?
        </ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            onClick={() => handleDeleteLeave(leaveToDelete)}
          >
            Delete
          </Button>
          <Button
            color="secondary"
            onClick={() => setShowDeleteConfirmation(false)}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </Modal>
  );
};

export default LeaveModal;
