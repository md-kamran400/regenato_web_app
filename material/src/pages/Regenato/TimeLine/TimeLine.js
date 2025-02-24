import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Nav,
  NavItem,
  NavLink,
  Table,
} from "reactstrap";
import { TextField, Autocomplete } from "@mui/material";
import "./timeLine.css";
import PlanPage from "./PlanPage/PlanPage";

const TimeLine = () => {
  const [modal, setModal] = useState(false);
  const [data, setData] = useState([]);
  const [events, setEvents] = useState([]);
  const [modalData, setModalData] = useState({});
  const [selectedFilterType, setSelectedFilterType] = useState("part");
  const [selectedValue, setSelectedValue] = useState(null);
  const [calendarView, setCalendarView] = useState("dayGridMonth");
  const [currentDateEvents, setCurrentDateEvents] = useState([]);
  const calendarRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:4040/api/defpartproject/all-allocations")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        console.log(data)
        formatEvents(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const formatEvents = (projects) => {
    const formattedEvents = [];

    projects.forEach((project) => {
      project.allocations.forEach((part) => {
        part.allocations.forEach((allocation) => {
          formattedEvents.push({
            title: `${part.partName} - ${allocation.operator} (${part.processName})`,
            start: new Date(allocation.startDate),
            end: new Date(allocation.endDate),
            extendedProps: {
              ...allocation,
              processName: part.processName,
              partName: part.partName,
            },
            className: allocation.cssClass || "",
          });
        });
      });
    });

    setEvents(formattedEvents);
  };

  const getCurrentDateEvents = (events) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events.filter((event) => {
      const start = new Date(event.start);
      const end = new Date(event.end);

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      return start <= today && today <= end;
    });
  };

  useEffect(() => {
    setCurrentDateEvents(getCurrentDateEvents(events));
  }, [events]);

  const handleEventClick = (info) => {
    setModalData(info.event.extendedProps);
    setModal(true);
  };

  const toggleModal = () => {
    setModal(!modal);
  };

  const changeView = (view) => {
    setCalendarView(view);
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(view);
    }
  };

  const handleSelection = (event, value) => {
    setSelectedValue(value);
  };

  return (
    <div style={{ padding: "30px", backgroundColor: "white" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ fontWeight: "bold" }}>Timeline</h2>

        <Autocomplete
          options={data}
          getOptionLabel={(option) =>
            option[selectedFilterType === "part" ? "partName" : "projectName"]
          }
          onChange={handleSelection}
          renderInput={(params) => (
            <TextField
              {...params}
              label={`Search ${selectedFilterType}`}
              variant="outlined"
            />
          )}
          style={{ width: "300px" }}
        />
      </div>

      <Nav pills style={{ marginBottom: "20px", marginTop: "20px" }}>
        <NavItem>
          <NavLink
            href="#"
            active={calendarView === "dayGridDay"}
            onClick={() => changeView("dayGridDay")}
          >
            Day
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            href="#"
            active={calendarView === "timeGridWeek"}
            onClick={() => changeView("timeGridWeek")}
          >
            Week
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            href="#"
            active={calendarView === "dayGridMonth"}
            onClick={() => changeView("dayGridMonth")}
          >
            Month
          </NavLink>
        </NavItem>
      </Nav>
      {/* <div style={{width: "80%", height: "50%", margin: "auto"}}> */}
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={calendarView}
        events={events}
        eventClick={handleEventClick}
      />
      {/* </div> */}

      <Modal isOpen={modal} toggle={toggleModal} size="lg">
        <ModalHeader toggle={toggleModal}>Event Details</ModalHeader>
        <ModalBody>
          <p>
            <strong>Machine ID:</strong> {modalData.machineId}
          </p>
          <p>
            <strong>Operator:</strong> {modalData.operator}
          </p>
          <p>
            <strong>Shift:</strong> {modalData.shift}
          </p>
          <p>
            <strong>Planned Quantity:</strong> {modalData.plannedQty}
          </p>
          <p>
            <strong>Planned Time:</strong> {modalData.plannedTime}
          </p>
        </ModalBody>
      </Modal>

      {currentDateEvents.length > 0 ? (
        <div>
          <h3 style={{ marginTop: "30px", fontWeight: "bold" }}>
            Processes Running Today
          </h3>
          <Table bordered>
            <thead>
              <tr>
                <th>Production Order</th>
                <th>Process Name</th>
                <th>Machine</th>
                <th>Operator</th>
                <th>Planned Quantity</th>
                <th>Planned Time</th>
              </tr>
            </thead>
            <tbody>
              {currentDateEvents.map((event, index) => (
                <tr key={index}>
                  <td>Demo Pro 1</td>
                  <td>{event.title.split(" - ")[1]}</td>
                  <td>{event.extendedProps.machineId}</td>
                  <td>{event.extendedProps.operator}</td>
                  <td>{event.extendedProps.plannedQty}</td>
                  <td>{event.extendedProps.plannedTime}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ) : (
        <p style={{ marginTop: "20px", fontWeight: "bold", color: "red" }}>
          No processes running today.
        </p>
      )}

      {/* <PlanPage/> */}
    </div>
  );
};

export default TimeLine;
