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

const TimeLine = () => {
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [modal, setModal] = useState(false);
  const [allocationData, setAllocationData] = useState([]);
  const [events, setEvents] = useState([]);
  const [modalData, setModalData] = useState({});
  const [selectedFilterType, setSelectedFilterType] = useState("part");
  const [selectedValue, setSelectedValue] = useState(null);
  const [calendarView, setCalendarView] = useState("dayGridMonth");
  const [currentDateEvents, setCurrentDateEvents] = useState([]);
  const calendarRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

   
    const fetchAllocationData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/all-allocations`
        );
        const data = await response.json();

        if (data.data) {
          let allocationEvents = [];
          let sundayEvents = new Set(); // Use a set to avoid duplicate Sundays

          data.data.forEach((project) => {
            project.allocations.forEach((part) => {
              part.allocations.forEach((allocation) => {
                const startDate = new Date(allocation.startDate);
                const endDate = new Date(allocation.endDate);

                // Create allocation event
                allocationEvents.push({
                  title: `${part.partName} - ${allocation.operator} (${part.processName})`,
                  start: startDate,
                  end: endDate,
                  extendedProps: {
                    ...allocation,
                    processName: part.processName,
                    partName: part.partName,
                  },
                  className: allocation.cssClass || "",
                });

                // Add Sundays in between as red-colored events
                let tempDate = new Date(startDate);
                while (tempDate <= endDate) {
                  if (tempDate.getDay() === 0) {
                    let sundayKey = tempDate.toISOString().split("T")[0]; // Unique key for each Sunday
                    if (!sundayEvents.has(sundayKey)) {
                      sundayEvents.add(sundayKey);
                      allocationEvents.push({
                        // title: "Sunday",
                        start: new Date(tempDate),
                        end: new Date(tempDate),
                        allDay: true,
                        className: "sunday-event",
                        display: "background", // Ensures Sunday event is above allocation
                      });
                    }
                  }
                  tempDate.setDate(tempDate.getDate() + 1);
                }
              });
            });
          });

          setEvents(allocationEvents); // Avoid merging with previous events to prevent duplication
        }
      } catch (error) {
        console.error("Error fetching allocation data:", error);
      }
    };
    const fetchHolidayData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/holidays`
        );
        const data = await response.json();

        if (isMounted && Array.isArray(data)) {
          const holidayEvents = data.map((holiday) => ({
            title: holiday.name,
            start: holiday.date,
            end: holiday.date,
            allDay: true,
            className: "holiday-event",
            // display: "background",
            // fontWeight:'bold'
          }));

          setEvents((prevEvents) => [...prevEvents, ...holidayEvents]);
        }
      } catch (error) {
        console.error("Error fetching holiday events:", error);
      }
    };

    fetchAllocationData();
    fetchHolidayData();

    return () => {
      isMounted = false;
    };
  }, []);


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
    <div
      style={{
        padding: "30px",
        backgroundColor: "white",
        border: "1px solid red",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ fontWeight: "bold" }}>Timeline</h2>

        <Autocomplete
          options={filteredOptions}
          getOptionLabel={(option) =>
            selectedFilterType === "part" ? option.partName : option.projectName
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

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={calendarView}
        events={events} // ✅ Merged data from both APIs
        selectable={true}
        editable={true}
        eventClick={handleEventClick}
        // height={'90vh'}
        width="80%"
      />

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
    </div>
  );
};

export default TimeLine;
