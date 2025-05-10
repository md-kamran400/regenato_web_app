import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import axios from "axios";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Card,
  CardHeader,
  Col,
  Row,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const localizer = momentLocalizer(moment);

export const EventScheduler = () => {
  const [events, setEvents] = useState([]);
  const [modal, setModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [eventName, setEventName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [eventToDelete, setEventToDelete] = useState(null);



  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}/api/eventScheduler/events`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          const formattedEvents = response.data.map((event) => ({
            title: event.eventName,
            start: moment.utc(event.startDate).local().toDate(),
            end: moment.utc(event.endDate).local().toDate(),
            id: event._id,
          }));
          setEvents(formattedEvents);
        } else {
          console.error('Expected an array but received:', typeof response.data);
          toast.error("Invalid response format");
        }
      })
      .catch((err) => {
        toast.error("Failed to fetch events");
        console.log(err);
      });
  }, []);

  const handleSelectSlot = ({ start, end }) => {
    setSelectedSlot({ start, end });

    // Fetch all events from the API
    axios
      .get(`${process.env.REACT_APP_BASE_URL}/api/eventScheduler/events`)
      .then((response) => {
        const formattedEvents = response.data.map((event) => ({
          title: event.eventName,
          start: moment.utc(event.startDate).local().toDate(),
          end: moment.utc(event.endDate).local().toDate(),
          id: event._id,
        }));
        setEvents(formattedEvents);
        setModal(true);
      })
      .catch((err) => {
        toast.error("Failed to fetch events");
        console.log(err);
      });

    // Adjust start time by 1 minute
    const adjustedStart = new Date(start);
    adjustedStart.setMinutes(adjustedStart.getMinutes() + 5);

    // Set both start and end dates to the same day
    const sameDayEnd = new Date(adjustedStart);
    sameDayEnd.setHours(23, 59, 59);

    setStartDate(moment(adjustedStart).format("YYYY-MM-DDTHH:mm"));
    setEndDate(moment(sameDayEnd).format("YYYY-MM-DDTHH:mm"));

    // Set modal open state
    setModal(true);
  };
 
  const handleCreateEvent = () => {
    if (eventName && startDate && endDate) {
      // Convert the selected dates to UTC without changing the actual date
      const startDateUTC = moment(startDate)
        .utc()
        .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
      const endDateUTC = moment(endDate)
        .utc()
        .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

      const newEvent = {
        eventName,
        startDate: startDateUTC,
        endDate: endDateUTC,
      };

      axios
        .post(
          `${process.env.REACT_APP_BASE_URL}/api/eventScheduler/events`,
          newEvent
        )
        .then((response) => {
          setEvents([
            ...events,
            {
              title: response.data.eventName,
              start: moment.utc(response.data.startDate).local().toDate(),
              end: moment.utc(response.data.endDate).local().toDate(),
              id: response.data._id,
            },
          ]);
          setModal(false);
          setEventName("");
          setStartDate("");
          setEndDate("");
          toast.success("Event created successfully!");
        })
        .catch((err) => {
          toast.error("Failed to create event");
          console.log(err);
        });
    } else {
      toast.error("Please fill all fields");
    }
  };
  const handleSelectEvent = (event) => {
    setEventToDelete(event);
    setDeleteModal(true);
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      axios
        .delete(
          `${process.env.REACT_APP_BASE_URL}/api/eventScheduler/events/${eventToDelete.id}`
        )
        .then(() => {
          setEvents(events.filter((e) => e.id !== eventToDelete.id));
          setDeleteModal(false);
          toast.success("Event deleted successfully!");
        })
        .catch((err) => {
          toast.error("Failed to delete event");
          console.log(err);
        });
    }
  };

  return (
    <React.Fragment>
      <Row>
        <Col lg={12}>
          <Card style={{marginBottom:'10rem'}}>
            <CardHeader>
              <h4 className="card-title">Event Scheduler</h4>
            </CardHeader>
            <div style={{ height: "500px", marginTop: "10px", padding: "5px" }}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Modal isOpen={modal} toggle={() => setModal(!modal)}>
        <ModalHeader toggle={() => setModal(false)}>Add Event</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="eventName">Event Name</Label>
              <Input
                type="text"
                id="eventName"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Enter event name"
                required
              />
            </FormGroup>
            <FormGroup>
              <Label for="startDate">Start Date</Label>
              <Input
                type="datetime-local"
                id="startDate"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setEndDate(e.target.value);
                }}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label for="endDate">End Date</Label>
              <Input
                type="datetime-local"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleCreateEvent}>
            Save
          </Button>
          <Button color="secondary" onClick={() => setModal(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={deleteModal} toggle={() => setDeleteModal(!deleteModal)}>
        <ModalHeader toggle={() => setDeleteModal(false)}>
          Delete Event
        </ModalHeader>
        <ModalBody>
          Are you sure you want to delete the event "{eventToDelete?.title}"?
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={confirmDelete}>
            Delete
          </Button>
          <Button color="secondary" onClick={() => setDeleteModal(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};
