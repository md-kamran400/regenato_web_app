// import React, { useState, useEffect } from "react";
// import Calendar from "@fullcalendar/react";
// import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
// import adaptivePlugin from "@fullcalendar/adaptive";
// import "./PageTime.css";
// import { Loader } from "lucide-react";

// const processColors = {
//   C1: { bg: "#3B82F6", border: "#2563EB" },
//   C2: { bg: "#10B981", border: "#059669" },
//   C3: { bg: "#F59E0B", border: "#D97706" },
//   C4: { bg: "#EF4444", border: "#DC2626" },
//   C5: { bg: "#8B5CF6", border: "#7C3AED" },
//   C6: { bg: "#EC4899", border: "#DB2777" },
//   C7: { bg: "#06B6D4", border: "#0891B2" },
//   C8: { bg: "#F97316", border: "#EA580C" },
//   C9: { bg: "#2563EB", border: "#1D4ED8" },
//   C11: { bg: "#DC2626", border: "#B91C1C" },
//   C12: { bg: "#059669", border: "#047857" },
//   C13: { bg: "#7C3AED", border: "#6D28D9" },
//   C14: { bg: "#DB2777", border: "#BE185D" },
//   C15: { bg: "#9333EA", border: "#7E22CE" },
//   C17: { bg: "#4F46E5", border: "#4338CA" },
//   C18: { bg: "#0EA5E9", border: "#0284C7" },
//   C19: { bg: "#0D9488", border: "#0F766E" },
// };

// const fetchManufacturingData = async () => {
//   const response = await fetch(
//     `${process.env.REACT_APP_BASE_URL}/api/manufacturing`
//   );
//   const data = await response.json();
//   return data;
// };

// const fetchAllocationsData = async () => {
//   const response = await fetch(
//     `${process.env.REACT_APP_BASE_URL}/api/defpartproject/all-allocations`
//   );
//   const data = await response.json();
//   return data.data;
// };

// const transformManufacturingData = (manufacturingData) => {
//   const processes = {};
//   manufacturingData.forEach((process) => {
//     processes[process.categoryId] = {
//       name: process.name,
//       machines: process.subCategories.map((machine) => ({
//         id: machine.subcategoryId,
//         title: machine.name,
//       })),
//     };
//   });
//   return processes;
// };

// const transformAllocationsData = (allocationsData, processes) => {
//   const events = {};

//   allocationsData.forEach((project) => {
//     project.allocations.forEach((allocation) => {
//       const processCode = allocation.processId;

//       if (!processes[processCode]) {
//         console.warn(`Process ${processCode} not found in manufacturing data`);
//         return;
//       }

//       allocation.allocations.forEach((alloc) => {
//         let machineId = alloc.machineId;
//         let resourceId = machineId; // Default to original machineId

//         // Special handling for VMC machines
//         if (processCode === "C1" && machineId.startsWith("VMCI")) {
//           // VMC Imported - keep original ID (VMCI001)
//           resourceId = machineId;
//         } else if (processCode === "C2" && machineId.startsWith("VMCL")) {
//           // VMC Local - keep original ID (VMCL001)
//           resourceId = machineId;
//         } else if (!machineId.includes("-")) {
//           // For other non-standard formats, convert to standard format
//           const machineNumber = machineId.replace(/\D/g, "").padStart(2, "0");
//           resourceId = `${processCode}-${machineNumber}`;
//         }

//         // Verify machine exists in process
//         const machineExists = processes[processCode].machines.some(
//           (m) => m.id === resourceId
//         );

//         if (!machineExists) {
//           console.warn(
//             `Machine ${resourceId} not found in process ${processCode}`
//           );
//           return;
//         }

//         if (!events[processCode]) {
//           events[processCode] = [];
//         }

//         const startDate = new Date(alloc.startDate);
//         const endDate = new Date(alloc.endDate);

//         events[processCode].push({
//           id: `${processCode}-${resourceId}-${alloc.startDate}`,
//           resourceId: resourceId,
//           start: startDate,
//           end: endDate,
//           title: `${resourceId} | ${allocation.partName} | ${alloc.orderNumber} | ${alloc.operator}`,
//           backgroundColor: processColors[processCode]?.bg || "#000000",
//           borderColor: processColors[processCode]?.border || "#000000",
//           textColor: "#ffffff",
//           extendedProps: {
//             projectName: project.projectName,
//             part: allocation.partName,
//             po: alloc.orderNumber,
//             machine: resourceId,
//             operator: alloc.operator,
//             quantity: alloc.plannedQuantity,
//             shift: alloc.shift,
//             plannedTime: alloc.plannedTime,
//           },
//         });
//       });
//     });
//   });

//   return events;
// };

// const TimePage = () => {
//   const [selectedProcess, setSelectedProcess] = useState(null);
//   const [processes, setProcesses] = useState({});
//   const [machines, setMachines] = useState({});
//   const [events, setEvents] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const [manufacturingData, allocationsData] = await Promise.all([
//           fetchManufacturingData(),
//           fetchAllocationsData(),
//         ]);

//         const processesData = transformManufacturingData(manufacturingData);
//         const eventsData = transformAllocationsData(
//           allocationsData,
//           processesData
//         );

//         console.log("Processes data:", processesData);
//         console.log("Events data:", eventsData);

//         setProcesses(processesData);
//         setMachines(
//           Object.keys(processesData).reduce((acc, processCode) => {
//             acc[processCode] = processesData[processCode].machines;
//             return acc;
//           }, {})
//         );
//         setEvents(eventsData);

//         // Set default selected process to one with allocations
//         if (Object.keys(processesData).length > 0) {
//           // Find processes with actual allocations
//           const processesWithAllocations = Object.keys(processesData).filter(
//             (code) => eventsData[code] && eventsData[code].length > 0
//           );

//           // Prefer C2 (VMC Local) if available, otherwise first process with allocations
//           const defaultProcess = processesWithAllocations.includes("C2")
//             ? "C2"
//             : processesWithAllocations[0] || Object.keys(processesData)[0];

//           setSelectedProcess(defaultProcess);
//         }

//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching data:", err);
//         setError(
//           "Failed to fetch data. Please check your connection and try again."
//         );
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const handleSelectProcess = (processCode) => {
//     setSelectedProcess(processCode);
//   };

//   if (loading) {
//     return (
//       <div className="timeline-container">
//         <div className="loader-overlay">
//           <div className="spinner-border text-primary" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="timeline-container">
//         <div className="error-container">{error}</div>
//       </div>
//     );
//   }

//   if (!selectedProcess) {
//     return (
//       <div className="timeline-container">
//         <div className="error-container">No processes available to display</div>
//       </div>
//     );
//   }

//   const resources = machines[selectedProcess] || [];
//   const validEvents = (events[selectedProcess] || []).filter((event) =>
//     resources.some((res) => res.id === event.resourceId)
//   );

//   if (resources.length === 0) {
//     console.warn(`No machines found for process ${selectedProcess}`);
//   }
//   if (validEvents.length === 0) {
//     console.warn(`No valid events found for process ${selectedProcess}`);
//   }

//   return (
//     <div className="timeline-container">
//       <div className="process-header">
//         <h1 className="process-title">Process Timeline</h1>
//         <div className="select-container">
//           <select
//             className="process-select"
//             value={selectedProcess}
//             onChange={(e) => handleSelectProcess(e.target.value)}
//           >
//             {Object.entries(processes).map(([code, process]) => (
//               <option key={code} value={code}>
//                 {`${process.name} (${code})`}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>
//       <div className="calendar-container">
//         <Calendar
//           plugins={[resourceTimelinePlugin, adaptivePlugin]}
//           initialView="resourceTimelineMonth"
//           schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
//           buttonText={{
//             prev: "<",
//             next: ">",
//             today: "Today",
//           }}
//           headerToolbar={{
//             left: "prev today next",
//             center: "title",
//             right:
//               "resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth,resourceTimelineYear",
//           }}
//           resources={resources}
//           events={validEvents}
//           resourceAreaWidth="150px"
//           height="auto"
//           contentHeight="auto"
//           aspectRatio={2.5}
//           slotMinWidth={100}
//           resourceAreaHeaderContent="Machine"
//           initialDate={new Date().toISOString().split("T")[0]}
//           views={{
//             resourceTimelineDay: {
//               duration: { days: 1 },
//               buttonText: "1D",
//               slotDuration: "02:00:00",
//               slotLabelFormat: {
//                 hour: "2-digit",
//                 minute: "2-digit",
//                 hour12: false,
//               },
//             },
//             resourceTimelineWeek: {
//               duration: { weeks: 1 },
//               buttonText: "1W",
//               slotDuration: { days: 1 },
//               slotLabelFormat: [{ weekday: "short", day: "numeric" }],
//             },
//             resourceTimelineMonth: {
//               duration: { months: 1 },
//               buttonText: "1M",
//               slotDuration: { days: 1 },
//               slotLabelFormat: [{ day: "numeric" }],
//             },
//             resourceTimelineYear: {
//               duration: { years: 1 },
//               buttonText: "1Y",
//               slotDuration: { months: 1 },
//               slotLabelFormat: [{ month: "short" }],
//               eventDataTransform: function (eventData) {
//                 if (eventData.displayStart && eventData.displayEnd) {
//                   return {
//                     ...eventData,
//                     start: eventData.displayStart,
//                     end: eventData.displayEnd,
//                   };
//                 }
//                 return eventData;
//               },
//             },
//           }}
//           eventContent={(arg) => {
//             const props = arg.event.extendedProps;
//             const divElement = document.createElement("div");
//             divElement.className = "timeline-event";
//             divElement.style.height = "24px";
//             divElement.innerText = `${props.machine} | ${props.part} | ${props.projectName} | ${props.operator}`;

//             return { domNodes: [divElement] };
//           }}
//           eventDidMount={(info) => {
//             const event = info.event;
//             const props = event.extendedProps;

//             info.el.style.height = "24px";

//             const tooltipContent = `
//               Project: ${props.projectName || "N/A"}
//               Machine: ${props.machine || "N/A"}
//               Part: ${props.part || "N/A"}
//               Operator: ${props.operator || "N/A"}
//               Quantity: ${props.quantity || "N/A"}
//               Shift: ${props.shift || "N/A"}
//               Planned Time: ${
//                 props.plannedTime ? `${props.plannedTime} minutes` : "N/A"
//               }
//               Start: ${event.start ? event.start.toLocaleDateString() : "N/A"}
//               End: ${event.end ? event.end.toLocaleDateString() : "N/A"}
//             `;

//             info.el.setAttribute("title", tooltipContent);
//           }}
//         />
//       </div>
//     </div>
//   );
// };

// export default TimePage;


import React, { useState, useEffect } from "react";
import Calendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import adaptivePlugin from "@fullcalendar/adaptive";
import "./PageTime.css";

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

// Fallback colors for processes not in the predefined list
const getProcessColor = (processId) => {
  if (processColors[processId]) {
    return processColors[processId];
  }
  
  const colors = [
    { bg: "#3B82F6", border: "#2563EB" },
    { bg: "#10B981", border: "#059669" },
    { bg: "#F59E0B", border: "#D97706" },
    { bg: "#EF4444", border: "#DC2626" },
    { bg: "#8B5CF6", border: "#7C3AED" },
  ];
  
  const hash = processId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
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

const transformAllocationsData = (allocationsData, processes) => {
  const events = [];
  
  console.log("Processing machine allocations data:", allocationsData);

  allocationsData.forEach((project) => {
    console.log("Processing project:", project.projectName);
    
    project.allocations?.forEach((allocation) => {
      console.log("Processing allocation:", allocation.partName);
      
      allocation.allocations?.forEach((processAlloc) => {
        const processCode = processAlloc.processId;
        console.log("Processing process:", processCode, processAlloc.processName);

        if (!processes[processCode]) {
          console.warn(`Process ${processCode} not found in manufacturing data`);
          return;
        }

        processAlloc.allocations?.forEach((alloc) => {
          console.log("Processing machine allocation:", alloc);
          
          if (!alloc.machineId) {
            console.log("No machine ID found, skipping");
            return;
          }

          const machineId = alloc.machineId;
          console.log("Machine ID:", machineId);

          // Verify machine exists in process
          const machineExists = processes[processCode].machines.some(
            (m) => m.id === machineId
          );

          if (!machineExists) {
            console.warn(`Machine ${machineId} not found in process ${processCode}. Available machines:`, 
              processes[processCode].machines.map(m => m.id));
            return;
          }

          const startDate = new Date(alloc.startDate);
          const endDate = new Date(alloc.endDate);

          // Validate dates
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.warn("Invalid dates for allocation:", alloc);
            return;
          }

          const colors = getProcessColor(processCode);

          events.push({
            id: `${processCode}-${machineId}-${alloc.startDate}`,
            resourceId: machineId,
            start: startDate,
            end: endDate,
            title: `${machineId} | ${allocation.partName} | ${project.projectName}`,
            backgroundColor: colors.bg,
            borderColor: colors.border,
            textColor: "#ffffff",
            extendedProps: {
              projectName: project.projectName,
              part: allocation.partName,
              machine: machineId,
              process: processAlloc.processName,
              processId: processCode,
              operator: alloc.operator,
              quantity: alloc.plannedQuantity,
              shift: alloc.shift,
              plannedTime: alloc.plannedTime,
            },
          });
        });
      });
    });
  });

  console.log("Transformed machine events:", events);
  return events;
};

const TimePage = () => {
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [processes, setProcesses] = useState({});
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Starting machine data fetch...");
        
        const [manufacturingData, allocationsData] = await Promise.all([
          fetchManufacturingData(),
          fetchAllocationsData(),
        ]);

        console.log("Raw manufacturing data:", manufacturingData);
        console.log("Raw allocations data:", allocationsData);

        const processesData = transformManufacturingData(manufacturingData);
        const eventsData = transformAllocationsData(allocationsData, processesData);

        console.log("Transformed processes:", processesData);
        console.log("Transformed events:", eventsData);

        setProcesses(processesData);
        setAllEvents(eventsData);

        // Set default selected process to one with events
        if (Object.keys(processesData).length > 0) {
          const processesWithEvents = Object.keys(processesData).filter(
            (code) => eventsData.some(event => event.extendedProps.processId === code)
          );

          const defaultProcess = processesWithEvents.includes("C2")
            ? "C2"
            : processesWithEvents[0] || Object.keys(processesData)[0];

          console.log("Setting default process to:", defaultProcess);
          setSelectedProcess(defaultProcess);
        }

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
    if (selectedProcess) {
      const eventsForProcess = allEvents.filter(
        (event) => event.extendedProps.processId === selectedProcess
      );
      console.log(`Filtered events for ${selectedProcess}:`, eventsForProcess);
      setFilteredEvents(eventsForProcess);
    }
  }, [selectedProcess, allEvents]);

  const handleSelectProcess = (processCode) => {
    setSelectedProcess(processCode);
  };

  // Get resources (machines) for the selected process
  const getResources = () => {
    if (!selectedProcess || !processes[selectedProcess]) {
      return [];
    }
    
    const machines = processes[selectedProcess].machines || [];
    console.log(`Machines for process ${selectedProcess}:`, machines);
    return machines;
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

  if (!selectedProcess) {
    return (
      <div className="timeline-container">
        <div className="error-container">No processes available to display</div>
      </div>
    );
  }

  const resources = getResources();
  const hasEvents = filteredEvents.length > 0;

  return (
    <div className="timeline-container">
      <div className="process-header">
        <h1 className="process-title">Machine Timeline</h1>
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

      {!hasEvents && (
        <div className="alert alert-info mb-3">
          No allocations found for process {selectedProcess}. 
          {allEvents.length === 0 ? " There are no allocations in the system." : " Try selecting a different process."}
        </div>
      )}

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
          resourceAreaWidth="150px"
          height="auto"
          contentHeight="auto"
          aspectRatio={2.5}
          slotMinWidth={100}
          resourceAreaHeaderContent="Machine"
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
            divElement.innerText = `${props.machine} | ${props.part} | ${props.projectName}`;

            return { domNodes: [divElement] };
          }}
          eventDidMount={(info) => {
            const event = info.event;
            const props = event.extendedProps;

            info.el.style.height = "24px";

            const tooltipContent = `
Project: ${props.projectName || "N/A"}
Machine: ${props.machine || "N/A"}
Part: ${props.part || "N/A"}
Operator: ${props.operator || "N/A"}
Quantity: ${props.quantity || "N/A"}
Shift: ${props.shift || "N/A"}
Planned Time: ${props.plannedTime ? `${props.plannedTime} minutes` : "N/A"}
Start: ${event.start ? event.start.toLocaleDateString() : "N/A"}
End: ${event.end ? event.end.toLocaleDateString() : "N/A"}
            `.trim();

            info.el.setAttribute("title", tooltipContent);
          }}
        />
      </div>
    </div>
  );
};

export default TimePage;