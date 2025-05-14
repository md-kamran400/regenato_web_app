import React, { useState, useEffect } from "react";
import Calendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import adaptivePlugin from "@fullcalendar/adaptive";
import "./OperatorTime.css";
import { Loader } from "lucide-react";
 
const operatorColors = {
  O1: { bg: "#3B82F6", border: "#2563EB" },
  O2: { bg: "#10B981", border: "#059669" },
  O3: { bg: "#F59E0B", border: "#D97706" },
  O4: { bg: "#EF4444", border: "#DC2626" },
  O5: { bg: "#8B5CF6", border: "#7C3AED" },
  O6: { bg: "#EC4899", border: "#DB2777" },
  O7: { bg: "#06B6D4", border: "#0891B2" },
  O8: { bg: "#F97316", border: "#EA580C" },
  O9: { bg: "#2563EB", border: "#1D4ED8" },
  O10: { bg: "#DC2626", border: "#B91C1C" },
  O11: { bg: "#059669", border: "#047857" },
  O12: { bg: "#7C3AED", border: "#6D28D9" },
  O13: { bg: "#DB2777", border: "#BE185D" },
  O14: { bg: "#9333EA", border: "#7E22CE" },
  O15: { bg: "#4F46E5", border: "#4338CA" },
};
 
const fetchOperatorsData = async () => {
  const response = await fetch(
    `${process.env.REACT_APP_BASE_URL}/api/userVariable`
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
 
const fetchManufacturingData = async () => {
  const response = await fetch(
    `${process.env.REACT_APP_BASE_URL}/api/manufacturing`
  );
  const data = await response.json();
  return data;
};
 
const transformManufacturingData = (manufacturingData) => {
  const processes = {};
  manufacturingData.forEach((process) => {
    processes[process.categoryId] = {
      id: process.categoryId,
      name: process.name,
    };
  });
  return processes;
};
 
const transformOperatorsData = (operatorsData) => {
  const operators = {};
  operatorsData.forEach((operator) => {
    operators[operator.categoryId] = {
      id: operator.categoryId,
      title: operator.name,
      status: operator.status,
      processes: operator.processName,
    };
  });
  return operators;
};
 
const transformAllocationsData = (allocationsData, operatorsMap) => {
  const events = [];
 
  allocationsData.forEach((project) => {
    project.allocations?.forEach((allocation) => {
      allocation.allocations?.forEach((alloc) => {
        if (!alloc.operator) return;
 
        const operatorRaw = alloc.operator.trim();
        let operatorId = operatorRaw;
 
        // Try to extract ID from "O3 - Abdul"
        if (operatorRaw.includes(" - ")) {
          operatorId = operatorRaw.split(" - ")[0];
        } else {
          // Otherwise, try to find matching operator name from operators list
          const match = Object.values(operatorsMap).find(
            (op) => op.title === operatorRaw
          );
          if (match) {
            operatorId = match.id;
          } else {
            // Fallback: use operatorRaw as ID
            operatorId = operatorRaw.replace(/\s+/g, "_"); // e.g. "Ajay Singh" => "Ajay_Singh"
          }
        }
 
        const startDate = new Date(alloc.startDate);
        const endDate = new Date(alloc.endDate);
 
        events.push({
          id: `${operatorId}-${allocation.processId}-${alloc.machineId}-${alloc.startDate}`,
          resourceId: operatorId,
          start: startDate,
          end: endDate,
          title: `${alloc.machineId} | ${allocation.partName} | ${project.projectName}`,
          backgroundColor: operatorColors[operatorId]?.bg || "#000000",
          borderColor: operatorColors[operatorId]?.border || "#000000",
          textColor: "#ffffff",
          extendedProps: {
            projectName: project.projectName,
            part: allocation.partName,
            machine: alloc.machineId,
            process: allocation.processName,
            processId: allocation.processId,
            operator: alloc.operator,
            quantity: alloc.plannedQuantity,
            shift: alloc.shift,
            plannedTime: alloc.plannedTime,
          },
        });
      });
    });
  });
 
  return events;
};
 
 
 
 
const OperatorTime = () => {
  const [operators, setOperators] = useState({});
  const [processes, setProcesses] = useState({});
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [operatorsData, allocationsData, manufacturingData] =
          await Promise.all([
            fetchOperatorsData(),
            fetchAllocationsData(),
            fetchManufacturingData(),
          ]);
 
        const operatorsTransformed = transformOperatorsData(operatorsData);
        const processesTransformed =
          transformManufacturingData(manufacturingData);
          const eventsTransformed = transformAllocationsData(allocationsData, operatorsTransformed);
 
 
        setOperators(operatorsTransformed);
        setProcesses(processesTransformed);
        setAllEvents(eventsTransformed);
 
        // Set default selected process to "All" initially
        setSelectedProcess("all");
 
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          "Failed to fetch data. Please check your connection and try again."
        );
        setLoading(false);
      }
    };
 
    fetchData();
  }, []);
 
  useEffect(() => {
    if (selectedProcess === "all") {
      // Show all events when "All" is selected
      setFilteredEvents(allEvents);
    } else if (selectedProcess) {
      // Filter events for the selected process
      const eventsForProcess = allEvents.filter(
        (event) => event.extendedProps.processId === selectedProcess
      );
      setFilteredEvents(eventsForProcess);
    }
  }, [selectedProcess, allEvents]);
 
  const handleProcessChange = (processId) => {
    setSelectedProcess(processId);
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
 
  if (
    Object.keys(operators).length === 0 ||
    Object.keys(processes).length === 0
  ) {
    return (
      <div className="timeline-container">
        <div className="error-container">No data available to display</div>
      </div>
    );
  }
 
  // Create resources for all operators
  const resources = Object.values(operators).map((operator) => ({
    id: operator.id,
    title: `${operator.title} (${operator.id})`,
  }));
 
 
  return (
    <div className="timeline-container">
      <div className="process-header">
        <h1 className="process-title">Operator Timeline</h1>
        <div className="select-container">
          <select
            className="process-select"
            value={selectedProcess || ""}
            onChange={(e) => handleProcessChange(e.target.value)}
          >
            <option value="all">All Processes</option>
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
          buttonText={{
            prev: "<",
            next: ">",
            today: "Today",
          }}
          headerToolbar={{
            left: "prev today next",
            center: "title",
            right:
              "resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth,resourceTimelineYear",
          }}
          resources={resources}
          events={filteredEvents}
          resourceAreaWidth="200px"
          height="auto"
          contentHeight="auto"
          aspectRatio={2.5}
          slotMinWidth={100}
          resourceAreaHeaderContent="Operator"
          initialDate={new Date().toISOString().split("T")[0]}
          resourceLabelDidMount={(arg) => {
            // Highlight operators who have allocations for the selected process
            if (selectedProcess !== "all") {
              const hasAllocation = filteredEvents.some(
                (event) => event.resourceId === arg.resource.id
              );
              arg.el.style.opacity = hasAllocation ? "1" : "0.5";
              arg.el.style.fontWeight = hasAllocation ? "bold" : "normal";
            } else {
              arg.el.style.opacity = "1";
              arg.el.style.fontWeight = "normal";
            }
          }}
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
              eventDataTransform: function (eventData) {
                if (eventData.displayStart && eventData.displayEnd) {
                  return {
                    ...eventData,
                    start: eventData.displayStart,
                    end: eventData.displayEnd,
                  };
                }
                return eventData;
              },
            },
          }}
          eventContent={(arg) => {
            const props = arg.event.extendedProps;
            const divElement = document.createElement("div");
            divElement.className = "timeline-event";
            divElement.style.height = "24px";
            divElement.innerText = `${props.machine} | ${props.part} | ${props.projectName}`;
 
            return { domNodes: [divElement] };
          }}
          eventDidMount={(info) => {
            const event = info.event;
            const props = event.extendedProps;
 
            info.el.style.height = "24px";
 
            const tooltipContent = `
              Project: ${props.projectName || "N/A"}
              Operator: ${props.operator || "N/A"}
              Machine: ${props.machine || "N/A"}
              Process: ${props.process || "N/A"}
              Part: ${props.part || "N/A"}
              Quantity: ${props.quantity || "N/A"}
              Shift: ${props.shift || "N/A"}
              Planned Time: ${
                props.plannedTime ? `${props.plannedTime} minutes` : "N/A"
              }
              Start: ${event.start ? event.start.toLocaleDateString() : "N/A"}
              End: ${event.end ? event.end.toLocaleDateString() : "N/A"}
            `;
 
            info.el.setAttribute("title", tooltipContent);
          }}
        />
      </div>
    </div>
  );
};
 
export default OperatorTime;