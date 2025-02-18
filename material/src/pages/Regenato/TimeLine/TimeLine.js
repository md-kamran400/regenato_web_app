import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Nav,
  NavItem,
  NavLink,
  Table,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import {
  TextField,
  Autocomplete,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

const TimeLine = () => {
  const [modal, setModal] = useState(false);
  const [modalData, setModalData] = useState({});
  const [selectedFilterType, setSelectedFilterType] = useState("part"); // "part" or "project"
  const [selectedValue, setSelectedValue] = useState(null);
  const [calendarView, setCalendarView] = useState("dayGridMonth");
  const [data, setData] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [dailyPlan, setDailyPlan] = useState([]);
  const calendarRef = useRef(null);

  // Fetch data from API in real time
  useEffect(() => {
    fetch("http://localhost:4040/api/defpartproject/allocations")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // Handle dropdown selection change
  const handleFilterTypeChange = (event) => {
    setSelectedFilterType(event.target.value);
    setSelectedValue(null);
    setFilteredEvents([]);
    setDailyPlan([]);
  };

  // Handle part/project selection
  const handleSelection = (event, value) => {
    setSelectedValue(value);
    if (!value) {
      setFilteredEvents([]);
      setDailyPlan([]);
      return;
    }

    const selectedKey =
      selectedFilterType === "part" ? "partName" : "projectName";
    const selectedEvents = data
      .filter((item) => item[selectedKey] === value[selectedKey])
      .map((item) => ({
        id: item._id,
        title: item.processName,
        start: new Date(item.startDate).toISOString().split("T")[0],
        end: new Date(item.endDate).toISOString().split("T")[0],
        extendedProps: {
          processName: item.processName,
          partName: item.partName,
          projectName: item.projectName,
          operator: item.operator,
          plannedQuantity: item.plannedQuantity,
        },
      }));

    setFilteredEvents(selectedEvents);

    const today = new Date().toISOString().split("T")[0];
    const todayPlan = data.filter(
      (item) =>
        item[selectedKey] === value[selectedKey] &&
        item.startDate.split("T")[0] <= today &&
        item.endDate.split("T")[0] >= today
    );
    setDailyPlan(todayPlan);
  };

  // Handle event click to show modal
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

  return (
    <div style={{ padding: "30px", backgroundColor: "white" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2>Machining Schedule</h2>

        {/* Dropdown to Choose Part or Project */}
        <FormGroup
          style={{ marginBottom: "20px", width: "300px", marginTop: "20px" }}
        >
          {/* <Label for="filterType">Select Filter Type</Label> */}
          <Input
            type="select"
            id="filterType"
            value={selectedFilterType}
            onChange={handleFilterTypeChange}
            style={{ height: "50px" }}
          >
            <option value="part">Part</option>
            <option value="project">Production Order</option>
          </Input>
        </FormGroup>

        {/* Autocomplete for Part/Project Selection */}
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

      {/* Calendar View Navigation */}
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

      {/* Full Calendar */}
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView={calendarView}
        events={filteredEvents}
        eventClick={handleEventClick}
      />

      {/* Modal for Event Details */}
      <Modal isOpen={modal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>Event Details</ModalHeader>
        <ModalBody>
          <p>
            <strong>Part Name:</strong> {modalData.partName}
          </p>
          <p>
            <strong>Process Name:</strong> {modalData.processName}
          </p>
          <p>
            <strong>Production Name:</strong> {modalData.projectName}
          </p>
          <p>
            <strong>Operator:</strong> {modalData.operator}
          </p>
          <p>
            <strong>Planned Quantity:</strong> {modalData.plannedQuantity}
          </p>
          <p>
            <strong>Actual Quantity:</strong> {modalData.actualQuantity}
          </p>
        </ModalBody>
      </Modal>

      {/* Plan Box for Selected Date */}
      {selectedValue && dailyPlan.length > 0 && (
        <div
          style={{
            marginTop: "30px",
            padding: "15px",
            background: "#f8f9fa",
          }}
        >
          <h3>Plan for {new Date().toLocaleDateString()}</h3>
          <Table bordered>
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Part Name</th>
                <th>Process Name</th>
                <th>Planned Quantity</th>
                {/* <th>Actual Quantity</th> */}
                <th>Operator</th>
                <th>Machine ID</th>
                <th>Shift</th>
              </tr>
            </thead>
            <tbody>
              {dailyPlan.map((item) => (
                <tr key={item._id}>
                  <td>{item.projectName}</td>
                  <td>{item.partName}</td>
                  <td>{item.processName}</td>
                  <td>{item.plannedQuantity}</td>
                  {/* <td>{item.actualQuantity}</td> */}
                  <td>{item.operator}</td>
                  <td>{item.machineId}</td>
                  <td>{item.shift}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default TimeLine;
