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
  Row,
  Col,
} from "reactstrap";
import { toast } from "react-toastify";
import axios from "axios";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";

const MachineDowntimeModal = ({
  isOpen,
  toggle,
  machine,
  parentId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    startDate: new Date(),
    startTime: "09:00",
    endDate: new Date(),
    endTime: "17:00",
    shift: "",
    reason: "",
    downtimeType: "operator", // Added downtime type field
  });
  const [shifts, setShifts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingShifts, setLoadingShifts] = useState(true);

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/shiftVariable`
        );
        setShifts(response.data);
        if (response.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            shift: response.data[0]._id,
            startTime: response.data[0].StartTime,
            endTime: response.data[0].EndTime,
          }));
        }
      } catch (error) {
        console.error("Error fetching shifts:", error);
        toast.error("Failed to load shift data");
      } finally {
        setLoadingShifts(false);
      }
    };

    if (isOpen) {
      fetchShifts();
      // Reset form when opening
      const now = new Date();
      setFormData({
        startDate: now,
        startTime: "09:00",
        endDate: now,
        endTime: "17:00",
        shift: "",
        reason: "",
        downtimeType: "operator",
      });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Update times when shift changes
    if (name === "shift") {
      const selectedShift = shifts.find((s) => s._id === value);
      if (selectedShift) {
        setFormData((prev) => ({
          ...prev,
          startTime: selectedShift.StartTime,
          endTime: selectedShift.EndTime,
        }));
      }
    }
  };

  const handleDateChange = (dates, field) => {
    setFormData((prev) => ({ ...prev, [field]: dates[0] }));
  };

  const validateTimeFormat = (time) => {
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate inputs
    const {
      startDate,
      endDate,
      startTime,
      endTime,
      shift,
      reason,
      downtimeType,
    } = formData;

    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      setIsSubmitting(false);
      return;
    }

    if (!validateTimeFormat(startTime) || !validateTimeFormat(endTime)) {
      toast.error("Please enter valid times in HH:MM format");
      setIsSubmitting(false);
      return;
    }

    if (!shift) {
      toast.error("Please select a shift");
      setIsSubmitting(false);
      return;
    }

    if (!reason.trim()) {
      toast.error("Please provide a reason for the downtime");
      setIsSubmitting(false);
      return;
    }

    try {
      // Parse start datetime
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const startDateTime = new Date(startDate);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      // Parse end datetime
      const [endHours, endMinutes] = endTime.split(":").map(Number);
      const endDateTime = new Date(endDate);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      // Validate end datetime is after start datetime
      if (endDateTime <= startDateTime) {
        toast.error("End date/time must be after start date/time");
        setIsSubmitting(false);
        return;
      }

      const selectedShift = shifts.find((s) => s._id === shift);
      const downtimeData = {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        reason: reason,
        shift: selectedShift?._id || shift, // Make sure we're sending the shift ID
        downtimeType: downtimeType,
        status: "downtime",
        isAvailable: false,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/manufacturing/${parentId}/machines/${machine._id}/downtime`,
        downtimeData
      );

      if (response.status === 200 || response.status === 201) {
        toast.success(`Machine downtime scheduled successfully`);
        onSuccess();
        toggle();
      }
    } catch (error) {
      console.error("Error scheduling downtime:", error);
      toast.error(
        error.response?.data?.message || "Failed to schedule downtime"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        Schedule Downtime for {machine?.name || "Machine"}
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label for="startDate">Start Date</Label>
                <Flatpickr
                  id="startDate"
                  className="form-control"
                  value={formData.startDate}
                  onChange={(dates) => handleDateChange(dates, "startDate")}
                  options={{
                    dateFormat: "Y-m-d",
                    minDate: "today",
                  }}
                  required
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="startTime">Start Time (HH:MM)</Label>
                <Input
                  type="text"
                  name="startTime"
                  id="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  placeholder="09:00"
                  pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
                  required
                />
              </FormGroup>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <FormGroup>
                <Label for="endDate">End Date</Label>
                <Flatpickr
                  id="endDate"
                  className="form-control"
                  value={formData.endDate}
                  onChange={(dates) => handleDateChange(dates, "endDate")}
                  options={{
                    dateFormat: "Y-m-d",
                    minDate: formData.startDate || "today",
                  }}
                  required
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="endTime">End Time (HH:MM)</Label>
                <Input
                  type="text"
                  name="endTime"
                  id="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  placeholder="17:00"
                  pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
                  required
                />
              </FormGroup>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <FormGroup>
                <Label for="shift">Shift</Label>
                <Input
                  type="select"
                  name="shift"
                  id="shift"
                  value={formData.shift}
                  onChange={handleChange}
                  disabled={loadingShifts}
                  required
                >
                  {loadingShifts ? (
                    <option>Loading shifts...</option>
                  ) : (
                    shifts.map((shift) => (
                      <option key={shift._id} value={shift._id}>
                        {shift.name} ({shift.StartTime} - {shift.EndTime})
                      </option>
                    ))
                  )}
                </Input>
              </FormGroup>
            </Col>
          </Row>

          <FormGroup>
            <Label for="reason">Reason for Downtime</Label>
            <Input
              type="textarea"
              name="reason"
              id="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Enter reason for machine downtime"
              rows="3"
              required
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Scheduling..." : "Schedule Downtime"}
        </Button>
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default MachineDowntimeModal;
