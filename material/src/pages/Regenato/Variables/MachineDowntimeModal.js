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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const MachineDowntimeModal = ({
  isOpen,
  toggle,
  machine,
  parentId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    startDate: new Date(),
    startHours: "09",
    startMinutes: "00",
    endDate: new Date(),
    endHours: "17",
    endMinutes: "00",
    shift: "",
    reason: "",
    downtimeType: "operator",
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
          const [startHours, startMinutes] =
            response.data[0].StartTime.split(":");
          const [endHours, endMinutes] = response.data[0].EndTime.split(":");

          setFormData((prev) => ({
            ...prev,
            shift: response.data[0]._id,
            startHours,
            startMinutes,
            endHours,
            endMinutes,
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
        startHours: "09",
        startMinutes: "00",
        endDate: now,
        endHours: "17",
        endMinutes: "00",
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
        const [startHours, startMinutes] = selectedShift.StartTime.split(":");
        const [endHours, endMinutes] = selectedShift.EndTime.split(":");

        setFormData((prev) => ({
          ...prev,
          startHours,
          startMinutes,
          endHours,
          endMinutes,
        }));
      }
    }
  };

  const handleDateChange = (date, field) => {
    setFormData((prev) => ({ ...prev, [field]: date }));
  };

  const generateTimeOptions = (type) => {
    const options = [];
    if (type === "hours") {
      for (let i = 0; i < 24; i++) {
        const value = i.toString().padStart(2, "0");
        options.push(
          <option key={`hour-${value}`} value={value}>
            {value}
          </option>
        );
      }
    } else {
      for (let i = 0; i < 60; i += 5) {
        const value = i.toString().padStart(2, "0");
        options.push(
          <option key={`min-${value}`} value={value}>
            {value}
          </option>
        );
      }
    }
    return options;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate inputs
    const {
      startDate,
      endDate,
      startHours,
      startMinutes,
      endHours,
      endMinutes,
      shift,
      reason,
      downtimeType,
    } = formData;

    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
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
      // Create start datetime
      const startDateTime = new Date(startDate);
      startDateTime.setHours(
        parseInt(startHours),
        parseInt(startMinutes),
        0,
        0
      );

      // Create end datetime
      const endDateTime = new Date(endDate);
      endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

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
        shift: selectedShift?._id || shift,
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
                <DatePicker
                  id="startDate"
                  selected={formData.startDate}
                  onChange={(date) => handleDateChange(date, "startDate")}
                  minDate={new Date()}
                  dateFormat="dd/MM/yyyy"
                  className="form-control"
                  required
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>Start Time</Label>
                <div className="d-flex">
                  <Input
                    type="select"
                    name="startHours"
                    value={formData.startHours}
                    onChange={handleChange}
                    className="me-2"
                    required
                  >
                    {generateTimeOptions("hours")}
                  </Input>
                  <span className="align-self-center me-2">:</span>
                  <Input
                    type="select"
                    name="startMinutes"
                    value={formData.startMinutes}
                    onChange={handleChange}
                    required
                  >
                    {generateTimeOptions("minutes")}
                  </Input>
                </div>
              </FormGroup>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <FormGroup>
                <Label for="endDate">End Date</Label>
                <DatePicker
                  id="endDate"
                  selected={formData.endDate}
                  onChange={(date) => handleDateChange(date, "endDate")}
                  minDate={formData.startDate}
                  dateFormat="dd/MM/yyyy"
                  className="form-control"
                  required
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>End Time</Label>
                <div className="d-flex">
                  <Input
                    type="select"
                    name="endHours"
                    value={formData.endHours}
                    onChange={handleChange}
                    className="me-2"
                    required
                  >
                    {generateTimeOptions("hours")}
                  </Input>
                  <span className="align-self-center me-2">:</span>
                  <Input
                    type="select"
                    name="endMinutes"
                    value={formData.endMinutes}
                    onChange={handleChange}
                    required
                  >
                    {generateTimeOptions("minutes")}
                  </Input>
                </div>
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
