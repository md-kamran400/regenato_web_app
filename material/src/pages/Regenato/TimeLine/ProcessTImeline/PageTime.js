import React, { useState, useEffect } from "react";
import Calendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import adaptivePlugin from "@fullcalendar/adaptive";
import ReactDOM from "react-dom";

const processColors = {
  C1: { bg: "#3B82F6", border: "#2563EB" },
  C2: { bg: "#10B981", border: "#059669" },
  C3: { bg: "#F59E0B", border: "#D97706" },
  C4: { bg: "#EF4444", border: "#DC2626" },
  C5: { bg: "#8B5CF6", border: "#7C3AED" },
  C6: { bg: "#EC4899", border: "#DB2777" },
  C7: { bg: "#06B6D4", border: "#0891B2" },
  C8: { bg: "#F97316", border: "#EA580C" },
  C9: { bg: "#2563EB", border: "#1D4ED8" },
  C11: { bg: "#DC2626", border: "#B91C1C" },
  C12: { bg: "#059669", border: "#047857" },
  C13: { bg: "#7C3AED", border: "#6D28D9" },
  C14: { bg: "#DB2777", border: "#BE185D" },
  C15: { bg: "#9333EA", border: "#7E22CE" },
  C17: { bg: "#4F46E5", border: "#4338CA" },
  C18: { bg: "#0EA5E9", border: "#0284C7" },
  C19: { bg: "#0D9488", border: "#0F766E" },
};

const machiningProcesses = {
  C1: { name: "VMC" },
  C2: { name: "VMC Local" },
  C3: { name: "Manual Milling" },
  C4: { name: "Grinding Floor" },
  C5: { name: "CNC" },
  C6: { name: "Turning" },
  C7: { name: "CNC Turning" },
  C8: { name: "Manual Turning" },
  C9: { name: "Surface Grinding" },
  C11: { name: "Cylindrical Grinding" },
  C12: { name: "Tool Room" },
  C13: { name: "Assembly" },
  C14: { name: "Quality" },
  C15: { name: "Maintenance" },
  C17: { name: "Planning" },
  C18: { name: "Stores" },
  C19: { name: "Dispatch" },
};

const operators = [
  "Rajesh Kumar",
  "Amit Patel",
  "Suresh Singh",
  "Priya Sharma",
  "Deepak Verma",
  "Ankit Gupta",
  "Neha Reddy",
  "Vikram Malhotra",
  "Sanjay Mehta",
  "Pooja Patel",
  "Rahul Sharma",
  "Kavita Singh",
];

const parts = [
  "COVER PLATE EM- SF NEW",
  "STOPPER HOLDER EM- SF NEW",
  "Square Pin (RSSF-MECH)",
  "Pusher Holder (EM-SF-Spiral)",
  "Spiral Insulation Dial (LW-EF-Spiral)",
  "Wire Guide (RSSF-PM-SB)",
];

function generateTimelineData() {
  const data = {
    machines: {},
    events: {},
  };

  Object.keys(machiningProcesses).forEach((processCode) => {
    const machinePrefix =
      processCode === "C1"
        ? "VMC"
        : processCode === "C2"
        ? "VMCL"
        : processCode === "C3"
        ? "MM"
        : processCode === "C4"
        ? "GF"
        : processCode === "C5"
        ? "CNC"
        : "M";

    data.machines[processCode] = Array.from({ length: 8 }, (_, i) => ({
      id: `${machinePrefix}${String(i + 1).padStart(3, "0")}`,
      title: `${machinePrefix}${String(i + 1).padStart(3, "0")}`,
    }));

    data.events[processCode] = [];
    let poCounter = 1;

    data.machines[processCode].forEach((machine) => {
      let currentDate = new Date("2024-01-01");
      const endOfYear = new Date("2024-12-31");

      while (currentDate < endOfYear) {
        if (Math.random() < 0.5) {
          const duration = Math.floor(Math.random() * 7) + 3;
          const endDate = new Date(currentDate);
          endDate.setDate(endDate.getDate() + duration);

          const part = parts[Math.floor(Math.random() * parts.length)];
          const operator =
            operators[Math.floor(Math.random() * operators.length)];
          const po = `PO${String(poCounter++).padStart(3, "0")}`;

          data.events[processCode].push({
            id: `${processCode}-${machine.id}-${currentDate.getTime()}`,
            resourceId: machine.id,
            start: currentDate.toISOString().split("T")[0],
            end: endDate.toISOString().split("T")[0],
            title: `${machine.id} | ${part} | ${po} | ${operator}`,
            backgroundColor: processColors[processCode].bg,
            borderColor: processColors[processCode].border,
            textColor: "#ffffff",
            extendedProps: {
              part,
              po,
              machine: machine.id,
              operator,
            },
          });

          currentDate = new Date(endDate);
          currentDate.setDate(
            currentDate.getDate() + Math.floor(Math.random() * 5) + 3
          );
        } else {
          currentDate.setDate(
            currentDate.getDate() + Math.floor(Math.random() * 7) + 1
          );
        }
      }
    });
  });

  return data;
}

const timelineData = generateTimelineData();

const TimePage = () => {
  const [selectedProcess, setSelectedProcess] = useState("C1");
  const [machines, setMachines] = useState({});
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const timelineData = generateTimelineData();
    console.log("Generated timeline data:", timelineData);
    setMachines(timelineData.machines);
    setEvents(timelineData.events);
  }, []);

  const fetchData = async () => {
    // Implement your actual data fetching logic here
    // Return the timeline data
    return {
      machines: {
        C1: Array.from({ length: 8 }, (_, i) => ({
          id: `VMC${String(i + 1).padStart(3, "0")}`,
          title: `VMC${String(i + 1).padStart(3, "0")}`,
        })),
        C2: Array.from({ length: 8 }, (_, i) => ({
          id: `VMCL${String(i + 1).padStart(3, "0")}`,
          title: `VMCL${String(i + 1).padStart(3, "0")}`,
        })),
        C3: Array.from({ length: 8 }, (_, i) => ({
          id: `MM${String(i + 1).padStart(3, "0")}`,
          title: `MM${String(i + 1).padStart(3, "0")}`,
        })),
        C4: Array.from({ length: 8 }, (_, i) => ({
          id: `GF${String(i + 1).padStart(3, "0")}`,
          title: `GF${String(i + 1).padStart(3, "0")}`,
        })),
        C5: Array.from({ length: 8 }, (_, i) => ({
          id: `CNC${String(i + 1).padStart(3, "0")}`,
          title: `CNC${String(i + 1).padStart(3, "0")}`,
        })),
        C6: Array.from({ length: 8 }, (_, i) => ({
          id: `M${String(i + 1).padStart(3, "0")}`,
          title: `M${String(i + 1).padStart(3, "0")}`,
        })),
      },
      events: {},
    };
  };

  const handleSelectProcess = (processCode) => {
    setSelectedProcess(processCode);
  };

  return (
    <div className="timeline-container">
      <div className="process-header">
        <h1 className="process-title">Process Timeline</h1>
        <div className="select-container">
          <select
            className="process-select"
            onChange={(e) => handleSelectProcess(e.target.value)}
          >
            {Object.entries(machiningProcesses).map(([code, process]) => (
              <option key={code} value={code}>
                {`${process.name} (${code})`}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="calendar-container">
        <Calendar
          plugins={[resourceTimelinePlugin, adaptivePlugin]}
          initialView="resourceTimelineWeek"
          schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right:
              "resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth,resourceTimelineYear",
          }}
          resources={machines[selectedProcess] || []}
          events={events[selectedProcess] || []}
          resourceAreaWidth="120px"
          height="auto"
          contentHeight="auto"
          aspectRatio={2.5}
          slotMinWidth={100}
          resourceAreaHeaderContent="Machine"
          initialDate="2024-01-01"
          views={{
            resourceTimelineDay: {
              duration: { days: 1 },
              buttonText: "1D",
              slotDuration: "02:00:00",
              slotLabelFormat: {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              },
            },
            resourceTimelineWeek: {
              duration: { weeks: 1 },
              buttonText: "1W",
              slotDuration: { days: 1 },
              slotLabelFormat: [{ weekday: "short", day: "numeric" }],
            },
            resourceTimelineMonth: {
              duration: { months: 1 },
              buttonText: "1M",
              slotDuration: { days: 1 },
              slotLabelFormat: [{ day: "numeric" }],
            },
            resourceTimelineYear: {
              duration: { years: 1 },
              buttonText: "1Y",
              slotDuration: { months: 1 },
              slotLabelFormat: [{ month: "short" }],
            },
          }}
          eventContent={(arg) => {
            const props = arg.event.extendedProps;
            const divElement = document.createElement("div");
            divElement.className = "timeline-event";
            divElement.style.height = "24px";
            divElement.innerText = `${props.machine} | ${props.part} | ${props.po} | ${props.operator}`;

            return { domNodes: [divElement] };
          }}
          eventDidMount={(info) => {
            const event = info.event;
            const props = event.extendedProps;
            info.el.style.height = "24px";
            info.el.title = `
                Machine: ${props.machine}
                Part: ${props.part}
                PO: ${props.po}
                Operator: ${props.operator}
                Start: ${event.start.toLocaleDateString()}
                End: ${event.end.toLocaleDateString()}
              `;
          }}
        />
      </div>
    </div>
  );
};

export default TimePage;
