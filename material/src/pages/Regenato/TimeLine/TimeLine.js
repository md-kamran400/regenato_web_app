// import React, { useState, useEffect, useRef } from "react";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import timeGridPlugin from "@fullcalendar/timegrid";
// import interactionPlugin from "@fullcalendar/interaction";
// import {
//   Modal,
//   ModalHeader,
//   ModalBody,
//   Nav,
//   NavItem,
//   NavLink,
//   Table,
//   FormGroup,
//   Label,
//   Input,
// } from "reactstrap";
// import {
//   TextField,
//   Autocomplete,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
// } from "@mui/material";

// const TimeLine = () => {
//   const [modal, setModal] = useState(false);
//   const [modalData, setModalData] = useState({});
// const [selectedFilterType, setSelectedFilterType] = useState("part"); // "part" or "project"
// const [selectedValue, setSelectedValue] = useState(null);
// const [calendarView, setCalendarView] = useState("dayGridMonth");
//   const [data, setData] = useState([]);
//   const [filteredEvents, setFilteredEvents] = useState([]);
//   const [dailyPlan, setDailyPlan] = useState([]);
//   const calendarRef = useRef(null);

//   // Fetch data from API in real time
//   useEffect(() => {
//     fetch("http://localhost:4040/api/defpartproject/allocations")
//       .then((res) => res.json())
//       .then((data) => {
//         setData(data);
//       })
//       .catch((error) => console.error("Error fetching data:", error));
//   }, []);

//   // Handle dropdown selection change
//   const handleFilterTypeChange = (event) => {
//     setSelectedFilterType(event.target.value);
//     setSelectedValue(null);
//     setFilteredEvents([]);
//     setDailyPlan([]);
//   };

//   // Handle part/project selection
// const handleSelection = (event, value) => {
//   setSelectedValue(value);
//   if (!value) {
//     setFilteredEvents([]);
//     setDailyPlan([]);
//     return;
//   }

//   const selectedKey =
//     selectedFilterType === "part" ? "partName" : "projectName";
//   const selectedEvents = data
//     .filter((item) => item[selectedKey] === value[selectedKey])
//     .map((item) => ({
//       id: item._id,
//       title: item.processName,
//       start: new Date(item.startDate).toISOString().split("T")[0],
//       end: new Date(item.endDate).toISOString().split("T")[0],
//       extendedProps: {
//         processName: item.processName,
//         partName: item.partName,
//         projectName: item.projectName,
//         operator: item.operator,
//         plannedQuantity: item.plannedQuantity,
//       },
//     }));

//   setFilteredEvents(selectedEvents);

//   const today = new Date().toISOString().split("T")[0];
//   const todayPlan = data.filter(
//     (item) =>
//       item[selectedKey] === value[selectedKey] &&
//       item.startDate.split("T")[0] <= today &&
//       item.endDate.split("T")[0] >= today
//   );
//   setDailyPlan(todayPlan);
// };

//   // Handle event click to show modal
//   const handleEventClick = (info) => {
//     setModalData(info.event.extendedProps);
//     setModal(true);
//   };

//   const toggleModal = () => {
//     setModal(!modal);
//   };

//   const changeView = (view) => {
//     setCalendarView(view);
//     if (calendarRef.current) {
//       calendarRef.current.getApi().changeView(view);
//     }
//   };

//   const upcomingPlan = [
//     {
//       process: "Grinding Final",
//       machine: "C4",
//       operator: "Kamran",
//       machineId: "GG01",
//       shift: "Shift A",
//     },
//     {
//       process: "CNC Lathe",
//       machine: "C5",
//       operator: "Kamran",
//       machineId: "CN01",
//       shift: "Shift B",
//     },
//     {
//       process: "Drill/Tap",
//       machine: "C6",
//       operator: "Abdul",
//       machineId: "DR001",
//       shift: "Shift A",
//     },
//     {
//       process: "Grinding Blank Rough",
//       machine: "C14",
//       operator: "suraj",
//       machineId: "GBR001",
//       shift: "Shift B",
//     },
//   ];

//   return (
//     <div style={{ padding: "30px", backgroundColor: "white" }}>
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//         }}
//       >
//         <h2 style={{ fontWeight: "bold" }}>Machining Schedule</h2>

//         {/* Dropdown to Choose Part or Project */}
//         <FormGroup
//           style={{ marginBottom: "20px", width: "300px", marginTop: "20px" }}
//         >
//           {/* <Label for="filterType">Select Filter Type</Label> */}
//           <Input
//             type="select"
//             id="filterType"
//             value={selectedFilterType}
//             onChange={handleFilterTypeChange}
//             style={{ height: "50px" }}
//           >
//             <option value="part">Part</option>
//             <option value="project">Production Order</option>
//           </Input>
//         </FormGroup>

//         {/* Autocomplete for Part/Project Selection */}
// <Autocomplete
//   options={data}
//   getOptionLabel={(option) =>
//     option[selectedFilterType === "part" ? "partName" : "projectName"]
//   }
//   onChange={handleSelection}
//   renderInput={(params) => (
//     <TextField
//       {...params}
//       label={`Search ${selectedFilterType}`}
//       variant="outlined"
//     />
//   )}
//   style={{ width: "300px" }}
// />
//       </div>

//       {/* Calendar View Navigation */}
//       <Nav pills style={{ marginBottom: "20px", marginTop: "20px" }}>
//         <NavItem>
//           <NavLink
//             href="#"
//             active={calendarView === "dayGridDay"}
//             onClick={() => changeView("dayGridDay")}
//           >
//             Day
//           </NavLink>
//         </NavItem>
//         <NavItem>
//           <NavLink
//             href="#"
//             active={calendarView === "timeGridWeek"}
//             onClick={() => changeView("timeGridWeek")}
//           >
//             Week
//           </NavLink>
//         </NavItem>
//         <NavItem>
//           <NavLink
//             href="#"
//             active={calendarView === "dayGridMonth"}
//             onClick={() => changeView("dayGridMonth")}
//           >
//             Month
//           </NavLink>
//         </NavItem>
//       </Nav>

//       {/* Full Calendar */}
//       <FullCalendar
//         ref={calendarRef}
//         plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//         initialView={calendarView}
//         events={filteredEvents}
//         eventClick={handleEventClick}
//       />

//       {/* Modal for Event Details */}
//       <Modal isOpen={modal} toggle={toggleModal}>
//         <ModalHeader toggle={toggleModal}>Event Details</ModalHeader>
//         <ModalBody>
//           <p>
//             <strong>Part Name:</strong> {modalData.partName}
//           </p>
//           <p>
//             <strong>Process Name:</strong> {modalData.processName}
//           </p>
//           <p>
//             <strong>Production Name:</strong> {modalData.projectName}
//           </p>
//           <p>
//             <strong>Operator:</strong> {modalData.operator}
//           </p>
//           <p>
//             <strong>Planned Quantity:</strong> {modalData.plannedQuantity}
//           </p>
//           <p>
//             <strong>Actual Quantity:</strong> {modalData.actualQuantity}
//           </p>
//         </ModalBody>
//       </Modal>

//       {/* Plan Box for Selected Date */}
//       {selectedValue && dailyPlan.length > 0 && (
//         <div
//           style={{
//             marginTop: "30px",
//             padding: "15px",
//             background: "#f8f9fa",
//           }}
//         >
//           <h3 style={{ fontWeight: "bold" }}>
//             Plan for {new Date().toLocaleDateString()}
//           </h3>
//           <Table bordered>
//             <thead>
//               <tr>
//                 <th>Production Order Name</th>
//                 <th>Part Name</th>
//                 <th>Process Name</th>
//                 <th>Planned Quantity</th>
//                 {/* <th>Actual Quantity</th> */}
//                 <th>Operator</th>
//                 <th>Machine ID</th>
//                 <th>Shift</th>
//               </tr>
//             </thead>
//             <tbody>
//               {dailyPlan.map((item) => (
//                 <tr key={item._id}>
//                   <td>{item.projectName}</td>
//                   <td>{item.partName}</td>
//                   <td>{item.processName}</td>
//                   <td>{item.plannedQuantity}</td>
//                   {/* <td>{item.actualQuantity}</td> */}
//                   <td>{item.operator}</td>
//                   <td>{item.machineId}</td>
//                   <td>{item.shift}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </Table>

//           <h3 style={{ marginTop: "30px", fontWeight: "bold" }}>
//             Upcoming Plan for Tomorrow
//           </h3>
//           <Table bordered>
//             <thead>
//               <tr>
//                 <th>Production Order Name</th>
//                 <th>Part Name</th>
//                 <th>Process Name</th>
//                 {/* <th>Machine ID</th> */}
//                 <th>Planned Quantity</th>
//                 <th>Operator</th>
//                 <th>Machine ID</th>
//                 <th>Shift</th>
//               </tr>
//             </thead>
//             <tbody>
//               {upcomingPlan.map((item, index) => (
//                 <tr key={index}>
//                   <td>Demo Pro 2</td>
//                   <td>Feed Finger Guide Plate(RSSF-MECH)</td>
//                   <td>{item.process}</td>
//                   {/* <td>{item.machine}</td> */}
//                   <td>200</td>
//                   <td>{item.operator}</td>
//                   <td>{item.machineId}</td>
//                   <td>{item.shift}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </Table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TimeLine;

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
import {
  TextField,
  Autocomplete,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import "./timeLine.css";

const sections = [
  {
    title: "C1 - VMC Imported",
    data: [
      {
        plannedQty: 200,
        startDate: "2025-02-19",
        endDate: "2025-02-21",
        delayedDate: "2025-02-22", // New delayed date
        machineId: "C1-01 - VMC 1",
        shift: "Shift A",
        plannedTime: "1000 m",
        operator: "Michael Brown",
      },
    ],
  },
  {
    title: "C2 - VMC Local",
    data: [
      {
        plannedQty: 150,
        startDate: "2025-02-22", // Fixed the format
        endDate: "2025-03-07",
        machineId: "01-A - tesing 87",
        shift: "Shift A",
        plannedTime: "6500 m",
        operator: "Michael Brown",
      },
    ],
  },
  {
    title: "C4 - Grinding Final",
    data: [
      {
        plannedQty: 100,
        startDate: "2025-03-08",
        endDate: "2025-03-13",
        machineId: "G001 - TETT",
        shift: "Shift A",
        plannedTime: "2501 m",
        operator: "Michael Brown",
      },
    ],
  },
  {
    title: "C6 - Drill/Tap",
    data: [
      {
        plannedQty: 250,
        startDate: "2025-03-14",
        endDate: "2025-03-15",
        machineId: "D01 - test/Tap",
        shift: "Shift A",
        plannedTime: "500 m",
        operator: "Kamraan",
      },
    ],
  },
];

const TimeLine = () => {
  const [modal, setModal] = useState(false);
  const [modalData, setModalData] = useState({});
  const [selectedFilterType, setSelectedFilterType] = useState("part"); // "part" or "project"
  const [selectedValue, setSelectedValue] = useState(null);
  const [calendarView, setCalendarView] = useState("dayGridMonth");
  const [currentDateEvents, setCurrentDateEvents] = useState([]);
  const calendarRef = useRef(null);
  const [data, setData] = useState([]);

  const events = sections.flatMap((section) =>
    section.data.flatMap((item) => {
      let eventArray = [];

      // If delayedDate exists, add it first
      if (item.delayedDate) {
        eventArray.push({
          title: `${section.title} - ${item.operator} (Delayed)`,
          start: new Date(item.delayedDate),
          end: new Date(item.delayedDate),
          extendedProps: { ...item, isDelayed: true }, // Add flag for sorting
          className: "delayed-event",
        });
      }

      // Normal event
      eventArray.push({
        title: `${section.title} - ${item.operator}`,
        start: new Date(item.startDate),
        end: new Date(item.endDate),
        extendedProps: { ...item, isDelayed: false },
        className: item.cssClass || "",
      });

      return eventArray;
    })
  );

  // Sort events so delayed ones appear first
  const sortedEvents = events.sort((a, b) => {
    if (a.start.getTime() === b.start.getTime()) {
      return b.extendedProps.isDelayed - a.extendedProps.isDelayed;
    }
    return a.start - b.start;
  });

  const getCurrentDateEvents = (events) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    const filteredEvents = events.filter((event) => {
      const start = new Date(event.start);
      const end = new Date(event.end);

      start.setHours(0, 0, 0, 0); // Normalize start
      end.setHours(23, 59, 59, 999); // Normalize end to include the whole day

      return start <= today && today <= end;
    });

    console.log("Today's Events:", filteredEvents);
    return filteredEvents;
  };

  useEffect(() => {
    setCurrentDateEvents(getCurrentDateEvents(events));
  }, [events]);

  const handleEventClick = (info) => {
    setModalData(info.event.extendedProps);
    setModal(true);

    // Check if the clicked event is the delayed one
    if (info.event.extendedProps.machineId === "01-A - tesing 87") {
      info.el.style.backgroundColor = "#ffcccc"; // Temporarily change background color
    }
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
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ fontWeight: "bold" }}>Timeline</h2>
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
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={calendarView}
        events={events}
        eventClick={handleEventClick}
      />

      {/* Modal for Event Details */}
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

      {/* Table for Current Running Processes */}
      {currentDateEvents.length > 0 ? (
        <div>
          <h3 style={{ marginTop: "30px", fontWeight: "bold" }}>
            Processes Running 19/02/2025
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

          <h3 style={{ marginTop: "30px", fontWeight: "bold" }}>
            Plan for 19/02/2025
          </h3>
          <Table bordered>
            <thead>
              <tr>
                <th>Production Order</th>
                <th>Part Name</th>
                <th>Processes</th>
                <th>Date</th>
                <th>Planned</th>
                <th>Produced</th>
                <th>Input Buy</th>
              </tr>
            </thead>
            <tbody>
              {currentDateEvents.map((event, index) => (
                <tr key={index}>
                  <td>Demo Pro 1</td>
                  <td>SF Body</td>

                  <td>C1 - VMC IMPORTED</td>
                  <td>Wed Feb 19 2025</td>
                  <td>50</td>
                  <td>50</td>
                  <td>Michael Brown</td>
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
