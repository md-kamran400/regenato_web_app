import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import adaptivePlugin from "@fullcalendar/adaptive";
import dayGridPlugin from "@fullcalendar/daygrid";
import { FaRegCalendarAlt } from "react-icons/fa";
import { Calendar, Clock } from "lucide-react";
import { Card, CardBody, Badge, Row, Col, Table, CardTitle } from "reactstrap";
import "./PlanPage.css";

const generateRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const processColors = {};

const getProcessColor = (processName) => {
  if (!processColors[processName]) {
    processColors[processName] = generateRandomColor();
  }
  return processColors[processName];
};

export function PlanPageNav() {
  const { allocationId } = useParams();
  const [allocationData, setAllocationData] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedPart, setSelectedPart] = useState(null);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [resources, setResources] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailyTrackingEvents, setDailyTrackingEvents] = useState([]);
  const [selectedSplit, setSelectedSplit] = useState(null);

  useEffect(() => {
    fetchAllocationData();
  }, [allocationId]);

  const fetchAllocationData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/all-allocations`
      );
      const data = await response.json();
      setAllocationData(data.data);

      if (allocationId) {
        // Find the allocation by ID
        let foundAllocation = null;
        let foundProject = null;
        let foundPart = null;
        let foundProcess = null;

        // Search through all projects and their allocations
        for (const project of data.data) {
          for (const partProcess of project.allocations) {
            for (const allocation of partProcess.allocations) {
              if (allocation._id === allocationId) {
                foundAllocation = allocation;
                foundProject = project.projectName;
                foundPart = partProcess.partName;
                foundProcess = partProcess.processName;
                break;
              }
            }
            if (foundAllocation) break;
          }
          if (foundAllocation) break;
        }

        if (foundAllocation && foundProject) {
          setSelectedProject(foundProject);
          setSelectedPart(foundPart);
          setSelectedProcess(foundProcess);
          transformData(foundProject, foundPart, data.data);
        } else {
          // If allocation not found, set default project and part
          if (data.data.length > 0 && data.data[0].allocations.length > 0) {
            setSelectedProject(data.data[0].projectName);
            setSelectedPart(data.data[0].allocations[0].partName);
            transformData(
              data.data[0].projectName,
              data.data[0].allocations[0].partName,
              data.data
            );
          }
        }
      } else {
        // No allocation ID provided, set default project and part
        if (data.data.length > 0 && data.data[0].allocations.length > 0) {
          setSelectedProject(data.data[0].projectName);
          setSelectedPart(data.data[0].allocations[0].partName);
          transformData(
            data.data[0].projectName,
            data.data[0].allocations[0].partName,
            data.data
          );
        }
      }

      setLoading(false);
    } catch (err) {
      setError("Failed to fetch allocation data");
      setLoading(false);
    }
  };

  const transformData = (projectName, partName, data) => {
    // Find the selected project
    const selectedProjectData = data.find(
      (project) => project.projectName === projectName
    );

    if (!selectedProjectData) return;

    // Create resources (parts)
    const resourcesList = [{ id: partName, title: `Part ${partName}` }];
    setResources(resourcesList);

    // Create events
    const eventsList = [];
    selectedProjectData.allocations
      .filter((alloc) => alloc.partName === partName)
      .forEach((alloc) => {
        alloc.allocations.forEach((a) => {
          const machineCode = a.machineId.split("-")[0];
          const colors = getProcessColor(alloc.processName);

          // Calculate the status based on actual end date and daily tracking
          let statusColor = "#B0BEC5"; // Default Grey
          if (a.actualEndDate) {
            const actualEndDate = new Date(a.actualEndDate);
            const plannedEndDate = new Date(a.endDate);

            if (actualEndDate < plannedEndDate) {
              statusColor = "#10B981"; // Green (Ahead)
            } else if (actualEndDate > plannedEndDate) {
              statusColor = "#EF4444"; // Red (Delayed)
            } else {
              statusColor = "#3B82F6"; // Blue (On Track)
            }
          }

          eventsList.push({
            id: a._id,
            resourceId: partName,
            start: a.startDate,
            end: a.actualEndDate || a.endDate,
            title: `${alloc.processName} - ${a.machineId}`,
            backgroundColor: statusColor,
            borderColor: statusColor,
            extendedProps: {
              processName: alloc.processName,
              machineId: a.machineId,
              operator: a.operator,
              plannedQuantity: a.plannedQuantity,
              shift: a.shift,
              splitNumber: a.splitNumber || a.orderNumber,
              AllocationPartType: a.AllocationPartType,
              dailyTracking: a.dailyTracking,
            },
          });
        });
      });
    setEvents(eventsList);
  };

  const transformDailyTrackingData = (dailyTracking, processName) => {
    return dailyTracking.map((tracking) => ({
      id: tracking._id,
      title: `${processName} - ${tracking.dailyStatus}`,
      start: tracking.date,
      allDay: true,
      backgroundColor: "#3B82F6", // You can customize the color
      borderColor: "#2563EB", // You can customize the color
      extendedProps: {
        planned: tracking.planned,
        produced: tracking.produced,
        operator: tracking.operator,
        status: tracking.dailyStatus,
      },
    }));
  };

  const handleProcessClick = (processAllocation) => {
    setSelectedProcess(processAllocation.processName);
    setSelectedSplit({
      processName: processAllocation.processName,
      allocations: processAllocation.allocations, // Pass all splits
    });
  };

  const handleProjectChange = (e) => {
    const newProject = e.target.value;
    setSelectedProject(newProject);
    setSelectedPart(null);
    setSelectedProcess(null);

    // Reset resources and events
    setResources([]);
    setEvents([]);
  };

  const handlePartChange = (e) => {
    const newPart = e.target.value;
    setSelectedPart(newPart);
    setSelectedProcess(null);
    transformData(selectedProject, newPart, allocationData);
  };

  const handleEventClick = (info) => {
    const { splitNumber, processName } = info.event.extendedProps;
    setSelectedPart(splitNumber);
    setSelectedProcess(processName);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysBetweenDates = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  // Get unique projects for the dropdown
  const uniqueProjects = [
    ...new Set(allocationData.map((project) => project.projectName)),
  ];

  // Get parts for the selected project
  const selectedProjectData = allocationData.find(
    (project) => project.projectName === selectedProject
  );

  // Get filtered allocations for the selected project and part
  const filteredAllocations = selectedProjectData
    ? selectedProjectData.allocations.filter(
        (alloc) => alloc.partName === selectedPart
      )
    : [];

  // Extract unique part names from all projects
  const uniqueParts = new Set();
  allocationData.forEach((project) => {
    project.allocations.forEach((part) => {
      uniqueParts.add(part.partName);
    });
  });

  // Convert Set to an Array
  const uniquePartList = [...uniqueParts];

  const getStatusColor = (status) => {
    if (status === "On Track") return "#3B82F6"; // Green
    if (status === "Ahead") return "#10B981"; // Blue
    if (status === "Delayed") return "#EF4444"; // Red
    return "#666"; // Default Grey
  };

  const generateCalendarEvents = (processAllocation) => {
    return processAllocation.allocations.map((allocation) => {
      const statusColor = getStatusColor(
        allocation.actualEndDate
          ? new Date(allocation.actualEndDate) > new Date(allocation.endDate)
            ? "Delayed" // Red
            : new Date(allocation.actualEndDate) < new Date(allocation.endDate)
            ? "Ahead" // Green
            : "On Track" // Blue
          : "On Track" // Default to Blue if no actualEndDate
      );

      return {
        id: allocation._id,
        title: `${processAllocation.processName} - ${allocation.splitNumber}`,
        start: allocation.startDate,
        end: allocation.actualEndDate || allocation.endDate,
        allDay: true,
        backgroundColor: statusColor,
        borderColor: statusColor,
        extendedProps: {
          processName: processAllocation.processName,
          splitNumber: allocation.splitNumber,
          operator: allocation.operator,
          plannedQuantity: allocation.plannedQuantity,
          startDate: allocation.startDate,
          endDate: allocation.endDate,
          actualEndDate: allocation.actualEndDate,
        },
      };
    });
  };

  return (
    <div className="p-4">
      <div className="process-header">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Production Planning</h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Select Project Dropdown */}
          <select
            value={selectedProject}
            onChange={handleProjectChange}
            className="process-select"
          >
            <option value="" disabled>
              Select Project
            </option>
            {uniqueProjects.map((project) => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>

          {/* Select Part Dropdown */}
          <select
            value={selectedPart}
            onChange={handlePartChange}
            className="process-select"
            disabled={!selectedProject}
          >
            <option value="" disabled>
              Select Part
            </option>
            {uniquePartList.map((part) => (
              <option key={part} value={part}>
                {part}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* FullCalendar with Year View */}
      <FullCalendar
        plugins={[resourceTimelinePlugin, adaptivePlugin]}
        initialView="resourceTimelineMonth"
        schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right:
            "resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth,resourceTimelineYear",
        }}
        resources={resources}
        events={events.map((event) => ({
          ...event,
          backgroundColor: getProcessColor(event.extendedProps.processName),
          borderColor: getProcessColor(event.extendedProps.processName),
        }))}
        resourceAreaWidth="200px"
        height="auto"
        slotMinWidth={100}
        resourceAreaHeaderContent="Order Number"
        eventClick={handleEventClick}
        initialDate={new Date()}
        views={{
          resourceTimelineYear: {
            type: "resourceTimeline",
            duration: { years: 1 }, // Set the duration to 1 year
            slotDuration: { months: 1 }, // Display slots as months
            slotLabelFormat: { month: "long" }, // Show full month names (e.g., "January")
            slotWidth: 100, // Adjust the width of each month slot
          },
        }}
        eventContent={(arg) => {
          const processColor = getProcessColor(
            arg.event.extendedProps.processName
          );
          return (
            <div
              className="p-1 text-sm text-white"
              style={{ backgroundColor: processColor }}
            >
              <div className="font-medium">
                {arg.event.extendedProps.processName} -{" "}
                {arg.event.extendedProps.machineId} -{" "}
                {arg.event.extendedProps.operator}
              </div>
            </div>
          );
        }}
        eventDidMount={(info) => {
          const event = info.event;
          const props = event.extendedProps;
          const processColor = getProcessColor(props.processName);

          const tooltipContent = `
      Process: ${props.processName}
      Machine: ${props.machineId}
      Operator: ${props.operator}
      Quantity: ${props.plannedQuantity}
      Shift: ${props.shift}
      Start: ${event.start?.toLocaleDateString()}
      End: ${event.end?.toLocaleDateString()}
    `;
          info.el.setAttribute("title", tooltipContent);
          info.el.style.backgroundColor = processColor;
          info.el.style.borderColor = processColor;
        }}
      />

      {/* Bottom Panels */}
      <div
        className="panels-container"
        style={{
          marginTop: "40px",
          width: "100%",
          display: "flex",
          gap: "10px",
        }}
      >
        {/* Orders Panel */}
        <div className="orders-panel">
          {selectedPart && filteredAllocations.length > 0 && (
            <Card key={selectedPart} className="order-card">
              <CardBody>
                <Row>
                  <Col>
                    <div className="order-header">
                      <h5 className="order-title">{selectedPart}</h5>
                      <Badge className="order-badge">
                        {filteredAllocations[0]?.allocations[0]
                          ?.AllocationPartType || "N/A"}
                      </Badge>
                    </div>
                    <div className="order-info">
                      <div>
                        <span>Start Date:</span>
                        <strong>
                          {formatDate(
                            filteredAllocations.reduce(
                              (min, alloc) =>
                                new Date(
                                  alloc.allocations.reduce((a, b) =>
                                    new Date(a.startDate) <
                                    new Date(b.startDate)
                                      ? a
                                      : b
                                  ).startDate
                                ) < new Date(min)
                                  ? alloc.allocations[0].startDate
                                  : min,
                              filteredAllocations[0].allocations[0].startDate
                            )
                          )}
                        </strong>
                      </div>
                      <div>
                        <span>End Date:</span>
                        <strong>
                          {formatDate(
                            filteredAllocations.reduce(
                              (max, alloc) =>
                                new Date(
                                  alloc.allocations.reduce((a, b) =>
                                    new Date(a.endDate) > new Date(b.endDate)
                                      ? a
                                      : b
                                  ).endDate
                                ) > new Date(max)
                                  ? alloc.allocations[0].endDate
                                  : max,
                              filteredAllocations[0].allocations[0].endDate
                            )
                          )}
                        </strong>
                      </div>
                      <div>
                        <span>Total Duration:</span>
                        <strong>
                          {getDaysBetweenDates(
                            filteredAllocations.reduce(
                              (min, alloc) =>
                                new Date(
                                  alloc.allocations.reduce((a, b) =>
                                    new Date(a.startDate) <
                                    new Date(b.startDate)
                                      ? a
                                      : b
                                  ).startDate
                                ) < new Date(min)
                                  ? alloc.allocations[0].startDate
                                  : min,
                              filteredAllocations[0].allocations[0].startDate
                            ),
                            filteredAllocations.reduce(
                              (max, alloc) =>
                                new Date(
                                  alloc.allocations.reduce((a, b) =>
                                    new Date(a.endDate) > new Date(b.endDate)
                                      ? a
                                      : b
                                  ).endDate
                                ) > new Date(max)
                                  ? alloc.allocations[0].endDate
                                  : max,
                              filteredAllocations[0].allocations[0].endDate
                            )
                          )}{" "}
                          days
                        </strong>
                      </div>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Processes Panel */}
        <div className="processes-panel">
          <div className="panel-header">
            <h2 className="panel-title">Processes</h2>
            {selectedPart && (
              <div className="panel-subtitle">Part: {selectedPart}</div>
            )}
          </div>

          <div className="panel-content scrollable-panel">
            {selectedPart &&
              filteredAllocations.map((processAllocation) => {
                const isSelected =
                  processAllocation.processName === selectedProcess;

                return (
                  <Card
                    key={processAllocation._id}
                    className={`process-card ${isSelected ? "selected" : ""}`}
                    onClick={() => handleProcessClick(processAllocation)} // Pass the entire process
                  >
                    <CardBody>
                      <h5 className="process-title">
                        {processAllocation.processName}
                      </h5>
                      {processAllocation.allocations.map((allocation) => (
                        <div
                          key={allocation._id}
                          className="split-box"
                          style={{
                            // borderLeft: `4px solid ${colors.border}`,
                            // backgroundColor: `${colors.bg}15`,
                            cursor: "pointer",
                          }}
                        >
                          <div className="split-header">
                            <span className="split-machine">
                              Machine ID: {allocation.machineId}
                            </span>
                            <span className="split-operator">
                              Operator: {allocation.operator}
                            </span>
                          </div>
                          <div className="split-details">
                            <div className="details-process">
                              <div className="detail-item">
                                <span className="detail-value">
                                  <FaRegCalendarAlt className="calendar-icon" />
                                  {formatDate(allocation.startDate)}
                                </span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-value">
                                  {formatDate(allocation.endDate)}
                                </span>
                              </div>
                            </div>
                            <div className="detail-item">
                              {/* <span className="detail-label">Planned Qty:</span> */}
                              <span className="detail-value">
                                {allocation.plannedQuantity}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardBody>
                  </Card>
                );
              })}
          </div>
        </div>

        {/* Process Details Panel */}
        <div className="panel details-panel">
          <div className="panel-header">
            <h2 className="panel-title">Process Details</h2>
            {selectedSplit && (
              <div className="panel-subtitle">{selectedSplit.processName}</div>
            )}
          </div>

          <div className="panel-content">
            {selectedSplit ? (
              <>
                {/* Process Details Table */}
                <Card className="details-card">
                  <CardBody>
                    <CardTitle tag="h4" className="details-subtitle">
                      Process Details
                    </CardTitle>
                    <div className="table-responsive">
                      <Table bordered striped hover className="details-table">
                        <thead>
                          <tr>
                            <th>Split Number</th>
                            <th>Operator</th>
                            <th>Planned Quantity</th>
                            <th>Start Date</th>
                            <th>Planned End Date</th>
                            <th>Actual End Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedSplit.allocations?.map((allocation) => (
                            <tr key={allocation._id}>
                              <td>{allocation.splitNumber}</td>
                              <td>{allocation.operator}</td>
                              <td>{allocation.plannedQuantity} units</td>
                              <td>{formatDate(allocation.startDate)}</td>
                              <td>{formatDate(allocation.endDate)}</td>
                              <td>{formatDate(allocation.actualEndDate)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </CardBody>
                </Card>

                {/* Small Calendar for Process Timeline */}
                <div className="small-calendar">
                  <FullCalendar
                    plugins={[dayGridPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                      left: "prev,next today",
                      center: "title",
                      right: "dayGridDay,dayGridWeek,dayGridMonth",
                    }}
                    events={selectedSplit.allocations?.map((allocation) => {
                      const plannedEndDate = new Date(allocation.endDate);
                      const actualEndDate = new Date(
                        allocation.actualEndDate || allocation.endDate
                      );

                      let statusColor;
                      if (
                        actualEndDate.getTime() === plannedEndDate.getTime()
                      ) {
                        statusColor = "#3B82F6"; // Blue (On Track)
                      } else if (actualEndDate < plannedEndDate) {
                        statusColor = "#10B981"; // Green (Ahead)
                      } else {
                        statusColor = "#EF4444"; // Red (Delayed)
                      }

                      return {
                        id: allocation._id,
                        title: `${selectedSplit.processName} - ${allocation.machineId} - ${allocation.operator}`,
                        start: allocation.startDate,
                        end: allocation.actualEndDate || allocation.endDate,
                        allDay: true,
                        backgroundColor: statusColor,
                        borderColor: statusColor,
                        extendedProps: {
                          processName: selectedSplit.processName,
                          splitNumber: allocation.splitNumber,
                          operator: allocation.operator,
                          plannedQuantity: allocation.plannedQuantity,
                          startDate: allocation.startDate,
                          endDate: allocation.endDate,
                          actualEndDate: allocation.actualEndDate,
                          dailyTracking: allocation.dailyTracking || [],
                        },
                      };
                    })}
                    eventContent={(arg) => (
                      <div className="p-1 text-sm text-white">
                        <div className="font-medium">{arg.event.title}</div>
                      </div>
                    )}
                    eventDidMount={(info) => {
                      const event = info.event;
                      const props = event.extendedProps;

                      let tooltipContent = `
        Process: ${props.processName}
        Machine: ${props.machineId}
        Operator: ${props.operator}
        Planned Quantity: ${props.plannedQuantity}
        Start: ${event.start?.toLocaleDateString()}
        End: ${event.end?.toLocaleDateString()}
      `;

                      // Add daily tracking details if available
                      if (props.dailyTracking.length > 0) {
                        tooltipContent += "\nDaily Tracking:\n";
                        props.dailyTracking.forEach((tracking) => {
                          tooltipContent += `- ${new Date(
                            tracking.date
                          ).toLocaleDateString()}: 
            Planned: ${tracking.planned}, 
            Produced: ${tracking.produced}, 
            Status: ${tracking.dailyStatus}\n`;
                        });
                      }

                      // Set tooltip on hover
                      info.el.setAttribute("title", tooltipContent);
                    }}
                  />
                </div>

                {/* Daily Tracking Table */}
                <div className="daily-tracking-table">
                  <h4 className="daily-tracking-title">Daily Tracking</h4>
                  <table className="tracking-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Planned</th>
                        <th>Produced</th>
                        <th>Operator</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSplit.allocations?.map((allocation) =>
                        allocation.dailyTracking?.map((tracking) => (
                          <tr key={tracking._id}>
                            <td>{formatDate(tracking.date)}</td>
                            <td>{tracking.planned}</td>
                            <td>{tracking.produced}</td>
                            <td>{tracking.operator}</td>
                            <td
                              style={{
                                fontWeight: "bold",
                                color: getStatusColor(tracking.dailyStatus),
                              }}
                            >
                              {tracking.dailyStatus}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="no-data-message">
                Click on a process to view details.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
