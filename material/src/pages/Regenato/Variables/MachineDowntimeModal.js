import React, { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input
} from 'reactstrap';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'react-toastify';
import axios from 'axios';

const MachineDowntimeModal = ({ isOpen, toggle, machine, parentId, onSuccess }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set minimum end date to be at least the start date
  const minEndDate = startDate;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    
    if (endDate < startDate) {
      toast.error('End date cannot be before start date');
      return;
    }
    
    if (!reason.trim()) {
      toast.error('Please provide a reason for the downtime');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const downtimeData = {
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        reason: reason,
        isAvailable: false,
        unavailableUntil: endDate.toISOString()
      };
      
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/manufacturing/${parentId}/machines/${machine._id}/downtime`,
        downtimeData
      );
      
      if (response.status === 200 || response.status === 201) {
        toast.success('Machine downtime scheduled successfully');
        onSuccess();
        toggle();
      }
    } catch (error) {
      console.error('Error scheduling downtime:', error);
      toast.error(error.response?.data?.message || 'Failed to schedule downtime');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>
        Schedule Downtime for {machine?.name || 'Machine'}
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="startDate">Start Date</Label>
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              minDate={new Date()}
              dateFormat="dd/MM/yyyy"
              className="form-control"
            />
          </FormGroup>
          <FormGroup>
            <Label for="endDate">End Date</Label>
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={minEndDate}
              dateFormat="dd/MM/yyyy"
              className="form-control"
            />
          </FormGroup>
          <FormGroup>
            <Label for="reason">Reason for Downtime</Label>
            <Input
              type="textarea"
              name="reason"
              id="reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Enter reason for machine downtime"
              rows="3"
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Scheduling...' : 'Schedule Downtime'}
        </Button>
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default MachineDowntimeModal;