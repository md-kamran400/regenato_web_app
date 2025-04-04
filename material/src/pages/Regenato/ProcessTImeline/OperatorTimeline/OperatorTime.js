import React, { useState, useEffect } from "react";
import Calendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import adaptivePlugin from "@fullcalendar/adaptive";
import "./OperatorTime.css";
import { FaAngleRight } from "react-icons/fa6";
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

const fetchManufacturingData = async () => {
  const response = await fetch(
    `${process.env.REACT_APP_BASE_URL}/api/manufacturing`
  );
  const data = await response.json();
  return data;
};

const fetchAllocationsData = async () => {
  const response = await fetch(
    `${process.env.REACT_APP_BASE_URL}/api/defpartproject/all-allocations`
  );
  const data = await response.json();
  return data.data;
};

const fetchOperatorsData = async () => {
  const response = await fetch(
    `${process.env.REACT_APP_BASE_URL}/api/userVariable`
  );
  const data = await response.json();
  return data;
};

const transformManufacturingData = (manufacturingData) => {
  const processes = {};
  manufacturingData.forEach((process) => {
    processes[process.categoryId] = {
      name: process.name,
      machines: process.subCategories.map((machine) => ({
        id: machine.subcategoryId,
        title: machine.name,
      })),
    };
  });
  return processes;
};

const transformAllocationsDataForOperators = (
  allocationsData,
  selectedProcess,
  operators
) => {
  let operatorEvents = [];

  if (Array.isArray(allocationsData)) {
    allocationsData.forEach((project) => {
      project.allocations.forEach((allocation) => {
        allocation.allocations.forEach((alloc) => {
          if (
            selectedProcess &&
            alloc.machineId.startsWith(`${selectedProcess}-`) &&
            operators.includes(alloc.operator)
          ) {
            operatorEvents.push({
              id: `${alloc.operator}-${alloc.machineId}-${alloc.startDate}`,
              resourceId: alloc.operator,
              start: alloc.startDate,
              end: alloc.endDate,
              title: `${alloc.machineId} | ${allocation.partName} | ${alloc.splitNumber}`,
              backgroundColor: processColors[selectedProcess]?.bg || "#000000",
              borderColor: processColors[selectedProcess]?.border || "#000000",
              textColor: "#ffffff",
              extendedProps: {
                projectName: allocation.partName,
                part: allocation.partName,
                po: alloc.splitNumber,
                machine: alloc.machineId,
                operator: alloc.operator,
                quantity: alloc.plannedQuantity,
                shift: alloc.shift,
                plannedTime: alloc.plannedTime,
              },
            });
          }
        });
      });
    });
  }

  return operatorEvents;
};

const OperatorTime = () => {
  const [selectedProcess, setSelectedProcess] = useState("C1");
  const [processes, setProcesses] = useState({});
  const [resources, setResources] = useState([]);
  const [events, setEvents] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const manufacturingData = await fetchManufacturingData();
        const allocationsData = await fetchAllocationsData();
        const operatorsData = await fetchOperatorsData();

        const processesData = transformManufacturingData(manufacturingData);
        setProcesses(processesData);

        const operatorNames = operatorsData.map((operator) => operator.name);
        setOperators(operatorNames);

        // Set all operators as resources
        const allResources = operatorNames.map((operator) => ({
          id: operator,
          title: operator,
        }));
        setResources(allResources);

        // Filter events based on the selected process
        const filteredEvents = transformAllocationsDataForOperators(
          allocationsData,
          selectedProcess,
          operatorNames
        );
        setEvents(filteredEvents);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedProcess]);

  const handleSelectProcess = async (processCode) => {
    setSelectedProcess(processCode);
    setLoading(true);

    try {
      const allocationsData = await fetchAllocationsData();
      const filteredEvents = transformAllocationsDataForOperators(
        allocationsData,
        processCode,
        operators
      );
      setEvents(filteredEvents);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch allocation data.");
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="timeline-container">
        <div className="loader-overlay">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="timeline-container">
        <div className="error-container">{error}</div>
      </div>
    );
  }

  return (
    <div className="timeline-container">
      <div className="process-header">
        <h1 className="process-title">Operator Timeline</h1>
        <div className="select-container">
          <select
            className="process-select"
            value={selectedProcess}
            onChange={(e) => handleSelectProcess(e.target.value)}
          >
            {Object.entries(processes).map(([code, process]) => (
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
          initialView="resourceTimelineMonth"
          schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
          themeSystem="standard" // Ensure standard theme for correct icon rendering
          buttonText={{
            prev: "<", // Single left arrow
            next: ">", // Single right arrow
            today: "Today",
          }}
          headerToolbar={{
            left: "prev today next",
            center: "title",
            right:
              "resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth,resourceTimelineYear",
          }}
          
          resources={resources}
          events={events}
          resourceAreaWidth="150px"
          height="auto"
          contentHeight="auto"
          aspectRatio={2.5}
          slotMinWidth={100}
          resourceAreaHeaderContent="Operator"
          initialDate={new Date().toISOString().split("T")[0]}
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
            divElement.innerText = `${props.machine} | ${props.part} | ${props.po}`;

            return { domNodes: [divElement] };
          }}
          eventDidMount={(info) => {
            const event = info.event;
            const props = event.extendedProps;

            // Set the element height
            info.el.style.height = "24px";

            // Create tooltip content
            const tooltipContent = `
              Project: ${props.projectName || "N/A"}
              Machine: ${props.machine || "N/A"}
              Part: ${props.part || "N/A"}
              PO: ${props.po || "N/A"}
              Operator: ${props.operator || "N/A"}
              Quantity: ${props.quantity || "N/A"}
              Shift: ${props.shift || "N/A"}
              Planned Time: ${
                props.plannedTime ? `${props.plannedTime} minutes` : "N/A"
              }
              Start: ${event.start ? event.start.toLocaleDateString() : "N/A"}
              End: ${event.end ? event.end.toLocaleDateString() : "N/A"}
            `;

            // Set the title attribute for the tooltip
            info.el.setAttribute("title", tooltipContent);
          }}
        />
      </div>
    </div>
  );
};

export default OperatorTime;
